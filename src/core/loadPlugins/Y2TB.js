const axios = require('axios');
const AdmZip = require("adm-zip");
const fs = require('fs');
const path = require("path");
const cmd = require('child_process');
const vm = require("vm");
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({});
const log = require(path.join(__dirname, "..", "util", "log.js"));
const scanDir = require(path.join(__dirname, "..", "util", "scanDir.js"));
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const ROOT = path.join(__dirname, "..", "..", "..");
const dirPlugins = path.join(ROOT, "plugins");

!global.temp ? global.temp = {} : "";
!global.temp.loadPlugin ? global.temp.loadPlugin = {} : "";

const FILE_KEY_RE = /^[A-Za-z0-9._-]+\.js$/;

function safeGetPluginInfo(code, fileName) {
	try {
		const sandbox = {
			module: { exports: {} },
			exports: {},
			require: (mod) => {
				const allow = ["path", "fs", "os", "util"];
				if (allow.includes(mod)) return require(mod);
				return {};
			},
			console,
			process,
			Buffer,
			setTimeout,
			setInterval,
			clearTimeout,
			clearInterval,
			__dirname: dirPlugins,
			global: {
				coreconfig: { main_bot: {} },
				config: { economyConfig: {}, xpc: {}, weather: {}, arrowchat: {} },
				data: {},
				temp: {}
			}
		};
		sandbox.config = sandbox.global.config;
		sandbox.data = sandbox.global.data;
		sandbox.temp = sandbox.global.temp;
		sandbox.global = sandbox;
		vm.runInNewContext(`${code}\n;module.exports;`, sandbox, { filename: fileName || "plugin.js" });
		const exported = sandbox.module.exports || sandbox.exports;
		if (exported && typeof exported.init === "function") return exported.init();
	} catch (e) {
		log.warn("Plugins(Y2TB)", `safe init failed for ${fileName}: ${e.message || e}`);
	}
	return null;
}

function collectMissingDeps(entries) {
	const needs = new Set();
	for (const entry of entries) {
		const info = entry.previewInfo;
		if (!info || typeof info.nodeDepends !== "object") continue;
		for (const dep in info.nodeDepends) {
			const depPath = path.join(ROOT, "node_modules", dep, "package.json");
			if (fs.existsSync(depPath)) continue;
			const ver = info.nodeDepends[dep];
			needs.add(ver && ver !== "" ? `${dep}@${ver}` : dep);
		}
	}
	return Array.from(needs);
}

function npmBatchInstall(pkgs) {
	if (!pkgs || !pkgs.length) return;
	const env = Object.assign({}, process.env, {
		npm_config_yes: "true",
		npm_config_audit: "false",
		npm_config_fund: "false",
		npm_config_legacy_peer_deps: "true"
	});
	const cmdline = `npm install --no-save --no-package-lock --legacy-peer-deps ${pkgs.join(" ")}`;
	log.warn("Plugins(Y2TB)", `Batch installing: ${pkgs.join(", ")}`);
	try {
		cmd.execSync(cmdline, { stdio: "inherit", env, shell: true });
		return;
	} catch (e) {
		log.warn("Plugins(Y2TB)", `Batch install error, retrying per-package with --force: ${e.message || e}`);
		for (const pkg of pkgs) {
			try {
				cmd.execSync(`npm install --no-save --no-package-lock --legacy-peer-deps --force ${pkg}`, { stdio: "inherit", env, shell: true });
			} catch (er) {
				log.warn("Plugins(Y2TB)", `Install failed for ${pkg}: ${er.message || er}`);
			}
		}
	}
}

async function loadPlugins() {
	!global.plugins ? global.plugins = {} : "";
	!global.plugins.Y2TB ? global.plugins.Y2TB = {} : "";
	!global.plugins.Y2TB.command ? global.plugins.Y2TB.command = {} : "";
	!global.plugins.Y2TB.plugins ? global.plugins.Y2TB.plugins = {} : "";
	!global.data ? global.data = {} : "";
	!global.data.pluginTemp ? global.data.pluginTemp = {
		"Eval.js": "0.0.0",
		"Help.js": "0.0.0",
		"pluginsStore.js": "0.0.0"
	} : "";

	global.data.pluginTemp = normalizePluginTemp(global.data.pluginTemp);

	ensureExists(path.join(dirPlugins, "obb"));

	let list = [];
	let useDevMode = global.coreconfig.main_bot.developMode;
	const defaults = Object.keys(global.data.pluginTemp);

	const localList = scanDir(".js", dirPlugins);
	if (useDevMode) log.log("Plugins(Y2TB)", "Developer mode: only load defaults + local plugins (no remote list)");

	ensureExists(dirPlugins);
	const listPath = path.join(dirPlugins, "pluginList.json");
	if (!fs.existsSync(listPath)) {
		fs.writeFileSync(listPath, "{}", { mode: 0o666 });
	}
	let listFromFile = [];
	if (!useDevMode) {
		let raw = "{}";
		try {
			raw = fs.readFileSync(listPath, "utf8") || "{}";
		} catch (e) {
			log.warn("Plugins(Y2TB)", `pluginList.json unreadable, using empty list: ${e}`);
		}
		let jsonList = {};
		try {
			jsonList = JSON.parse(raw);
		} catch (e) {
			log.warn("Plugins(Y2TB)", `pluginList.json invalid JSON, using empty list: ${e}`);
			jsonList = {};
		}
		listFromFile = Object.keys(jsonList);
	}

	list = Array.from(new Set(useDevMode
		? [...defaults, ...localList]
		: [...defaults, ...localList, ...listFromFile, "pluginsStore.js"]
	)).map(n => n.endsWith('.js') ? n : `${n}.js`);
	list = Array.from(new Set(list));

	if (!list.length) {
		log.warn("Plugins(Y2TB)", "No plugins found (local/core/pluginList all empty)");
	}

	const pluginEntries = [];
	for (let name of list) {
		try {
			const candidates = [name.endsWith('.js') ? name : `${name}.js`];
			let func = null;
			let fileUsed = null;
			let loadedFromRemote = false;
			let lastFetchError = null;

			for (const fileName of candidates) {
				const localPath = path.join(dirPlugins, fileName);
				if (useDevMode) {
					if (fs.existsSync(localPath) && fs.lstatSync(localPath).isFile()) {
						func = fs.readFileSync(localPath).toString();
						fileUsed = fileName;
						break;
					}
					continue;
				}

				for (let attempt = 1; attempt <= 3; attempt++) {
					try {
						func = await getFileContent(fileName);
					} catch (e) {
						lastFetchError = e;
						log.warn("Plugins(Y2TB)", `Fetch failed ${fileName} (attempt ${attempt}/3): ${e.message || e}`);
					}
					if (func) {
						fileUsed = fileName;
						loadedFromRemote = true;
						break;
					}
					if (attempt < 3) await delay(500);
				}
				if (func) break;
				if (fs.existsSync(localPath) && fs.lstatSync(localPath).isFile()) {
					func = fs.readFileSync(localPath).toString();
					fileUsed = fileName;
					break;
				}
			}
			if (!func || !fileUsed) {
				const detail = lastFetchError ? ` (last error: ${lastFetchError.message || lastFetchError})` : "";
				throw new Error(`Cannot fetch plugin ${name}${detail}`);
			}
			const previewInfo = safeGetPluginInfo(func, fileUsed);
			pluginEntries.push({ name, func, fileUsed, loadedFromRemote, previewInfo });
		} catch (err) {
			log.err("Plugins(Y2TB)", `Can't load "${name}" with error: ${err}`);
			!global.temp.loadPlugin.stderr ? global.temp.loadPlugin.stderr = [] : "";
			global.temp.loadPlugin.stderr.push({ plugin: name, error: err });
		}
	}

	// Batch install missing dependencies discovered from init metadata
	try {
		const deps = collectMissingDeps(pluginEntries);
		npmBatchInstall(deps);
	} catch (e) {
		log.warn("Plugins(Y2TB)", `Batch install failed: ${e.message || e}`);
	}

	// Now load plugins for real
	for (const entry of pluginEntries) {
		try {
			const moduleFuncs = evelStringSync(entry.func, entry.fileUsed, entry.loadedFromRemote ? false : useDevMode);
			let pluginInfo = moduleFuncs.init();
			// Fallback to preview info if init throws
			if (!pluginInfo && entry.previewInfo) pluginInfo = entry.previewInfo;
			installmd(entry.fileUsed, pluginInfo, { skipNodeDepends: true });
			await load(entry.fileUsed, pluginInfo, entry.func, entry.loadedFromRemote ? false : useDevMode, moduleFuncs);
			log.log("Plugins(Y2TB)", `Loaded ${entry.fileUsed} (${entry.loadedFromRemote ? "remote" : "local"}) v${pluginInfo.version}`);
		} catch (err) {
			log.err("Plugins(Y2TB)", `Can't load "${entry.name}" with error: ${err}`);
			!global.temp.loadPlugin.stderr ? global.temp.loadPlugin.stderr = [] : "";
			global.temp.loadPlugin.stderr.push({ plugin: entry.name, error: err });
		}
	}

	if (global.temp.loadPlugin && Array.isArray(global.temp.loadPlugin.stderr) && global.temp.loadPlugin.stderr.length) {
		log.warn("Plugins(Y2TB)", `Failed plugins: ${global.temp.loadPlugin.stderr.map(e => e.plugin).join(", ")}`);
	}
}

async function unloadPlugins() {
	if (!global.plugins || !global.plugins.Y2TB || !global.plugins.Y2TB.plugins) return;
	let plugins = global.plugins.Y2TB.plugins;
	let namePlugins = Object.keys(plugins);
	for (let namePlugin of namePlugins) {
		let dirFile = plugins[namePlugin].dirFile;
		if (require.cache[dirFile]) delete require.cache[dirFile];
		console.log("Plugins(Y2TB)", "Unloaded plugin:", namePlugin);
	}
	delete global.plugins.Y2TB;
	console.log("Plugins(Y2TB)", "Unloaded main plugins Y2TB!");
}

async function load(file, pluginInfo, func, devmode, fullFuncModule) {
	const fileKey = file.endsWith('.js') ? file : `${file}.js`;
	const dirConfig = path.join(ROOT, "config", "plugins");
	const dirLang = path.join(ROOT, "lang");
	ensureExists(dirConfig);

	//Load obb if needed
	if (pluginInfo.obb && (!fs.existsSync(path.join(dirPlugins, "obb", pluginInfo.obb)) || pluginInfo.version != global.data.pluginTemp[fileKey])) {
		let dirObb = path.join(dirPlugins, "obb");
		console.warn(pluginInfo.pluginName, "Updating obb: " + pluginInfo.obb);
		try {
			const obbPath = path.join(dirObb, pluginInfo.obb);
			if (fs.existsSync(obbPath)) {
				const stat = fs.lstatSync(obbPath);
				if (stat.isDirectory()) fs.rmSync(obbPath, { recursive: true, force: true });
				else fs.unlinkSync(obbPath);
			}
			await downloadfile(pluginInfo.obb + ".zip");
			let zip = new AdmZip(path.join(dirObb, pluginInfo.obb + ".zip"));
			zip.extractAllTo(path.join(dirObb, pluginInfo.obb), true);
			fs.unlinkSync(path.join(dirObb, pluginInfo.obb + ".zip"));
			console.warn(pluginInfo.pluginName, "Successfully installed obb " + pluginInfo.obb);
		} catch (e) {
			console.error(pluginInfo.pluginName, "Can't install obb " + pluginInfo.obb + ": Does not exist in the database or has been corrupted!", e);
			!global.temp.loadPlugin.stderr ? global.temp.loadPlugin.stderr = [] : "";
			const id = pluginInfo.pluginMain || file;
			global.temp.loadPlugin.stderr.push({ plugin: id, error: e });
		}
	}

	// Evaluate plugin source (use provided module if available to avoid re-eval)
	const fullFunc = fullFuncModule || evelStringSync(func, file, devmode);

	// Normalize plugin identity to file name if missing
	if (!pluginInfo.pluginMain) pluginInfo.pluginMain = file;
	if (!pluginInfo.pluginName) pluginInfo.pluginName = pluginInfo.pluginMain.replace(/\.js$/i, "");

	// Run onload if provided
	if (pluginInfo.onload && typeof fullFunc[pluginInfo.onload] === "function") {
		try {
			await fullFunc[pluginInfo.onload](pluginInfo);
			log.log("Plugins(Y2TB)", `${pluginInfo.pluginName} onload executed`);
		} catch (e) {
			log.err("Plugins(Y2TB)", `${pluginInfo.pluginName} onload error: ${e}`);
		}
	}

	//Push plugin info to global
	!global.plugins.Y2TB.plugins ? global.plugins.Y2TB.plugins = {} : "";
	if (!global.plugins.Y2TB.plugins[pluginInfo.pluginName]) {
		global.plugins.Y2TB.plugins[pluginInfo.pluginName] = {
			"author": pluginInfo.author,
			"version": pluginInfo.version,
			"loginFunc": fullFunc[pluginInfo.loginFunc],
			"fullFunc": fullFunc,
			"dirFile": fullFunc.dirFile,
			"lang": false,
			"configDefault": pluginInfo.config || null
		};
	} else {
		global.plugins.Y2TB.plugins[pluginInfo.pluginName].configDefault = pluginInfo.config || null;
	}
	global.data.pluginTemp[fileKey] = pluginInfo.version;
	!global.plugins.Y2TB.plugins.listen ? global.plugins.Y2TB.plugins.listen = { "lang": true } : "";
	!global.plugins.Y2TB.obb ? global.plugins.Y2TB.obb = {} : "";
	if (pluginInfo.obb) global.plugins.Y2TB.obb[pluginInfo.obb] = pluginInfo.pluginName;

	for (let cmdName in pluginInfo.commandList) {
		!global.plugins.Y2TB.command[cmdName] ? global.plugins.Y2TB.command[cmdName] = {} : "";
		let entry = global.plugins.Y2TB.command[cmdName];
		if (!entry.namePlugin) entry.namePlugin = pluginInfo.pluginName;
		if (!entry.help) entry.help = pluginInfo.commandList[cmdName].help;
		if (!entry.tag) entry.tag = pluginInfo.commandList[cmdName].tag;
		if (!entry.mainFunc) entry.mainFunc = pluginInfo.commandList[cmdName].mainFunc;
	}

	// Register chathook handler if provided by the plugin
	if (pluginInfo.chathook) {
		!global.chathook ? global.chathook = {} : "";
		global.chathook[pluginInfo.pluginName] = {
			main: pluginInfo.pluginName,
			func: pluginInfo.chathook
		};
	}

	//Load language
	if (typeof pluginInfo.langMap === "object") {
		if (global.coreconfig.main_bot.developMode) {
			fs.writeFileSync(path.join(dirLang, `${pluginInfo.pluginName}.json`), JSON.stringify(pluginInfo.langMap, null, 4), { mode: 0o666 });
			global.plugins.Y2TB.plugins[pluginInfo.pluginName].lang = true;
		} else {
			const langPath = path.join(dirLang, `${pluginInfo.pluginName}.json`);
			if (!fs.existsSync(langPath)) {
				const backupPath = path.join(dirLang, "backup", `${pluginInfo.pluginName}.json`);
				if (!fs.existsSync(backupPath)) {
					fs.writeFileSync(langPath, JSON.stringify(pluginInfo.langMap, null, 4), { mode: 0o666 });
				} else {
					fs.renameSync(backupPath, langPath);
					let langjs = {};
					try {
						langjs = JSON.parse(fs.readFileSync(langPath));
					} catch (e) {
						log.warn("Plugins(Y2TB)", `${pluginInfo.pluginName} lang backup corrupted, rewriting defaults: ${e.message || e}`);
						langjs = {};
					}
					for (let l in langjs) if (pluginInfo.langMap[l] === undefined) delete langjs[l];
					for (let l in pluginInfo.langMap) if (langjs[l] === undefined) langjs[l] = pluginInfo.langMap[l];
					fs.writeFileSync(langPath, JSON.stringify(langjs, null, 4), { mode: 0o666 });
				}
			} else {
				let langjs = {};
				try {
					langjs = JSON.parse(fs.readFileSync(langPath));
				} catch (e) {
					log.warn("Plugins(Y2TB)", `${pluginInfo.pluginName} lang file corrupted, rewriting defaults: ${e.message || e}`);
					langjs = {};
				}
				for (let l in langjs) if (pluginInfo.langMap[l] === undefined) delete langjs[l];
				for (let l in pluginInfo.langMap) if (langjs[l] === undefined) langjs[l] = pluginInfo.langMap[l];
				fs.writeFileSync(langPath, JSON.stringify(langjs, null, 4), { mode: 0o666 });
			}
			global.plugins.Y2TB.plugins[pluginInfo.pluginName].lang = true;
		}
	}

	//Load plugin config
	if (typeof pluginInfo.config === "object") {
		const cfgPath = path.join(dirConfig, `${pluginInfo.pluginName}.json`);
		if (global.coreconfig.main_bot.developMode) {
			fs.writeFileSync(cfgPath, JSON.stringify(pluginInfo.config, null, 4), { mode: 0o666 });
			global.plugins.Y2TB.plugins[pluginInfo.pluginName].config = true;
		} else {
			if (!fs.existsSync(cfgPath)) {
				const backupCfg = path.join(dirConfig, "backup", `${pluginInfo.pluginName}.json`);
				if (!fs.existsSync(backupCfg)) {
					fs.writeFileSync(cfgPath, JSON.stringify(pluginInfo.config, null, 4), { mode: 0o666 });
				} else {
					fs.renameSync(backupCfg, cfgPath);
					let configjs = {};
					try {
						configjs = JSON.parse(fs.readFileSync(cfgPath));
					} catch (e) {
						log.warn("Plugins(Y2TB)", `${pluginInfo.pluginName} config backup corrupted, rewriting defaults: ${e.message || e}`);
						configjs = {};
					}
					for (let l in configjs) if (pluginInfo.config[l] === undefined) delete configjs[l];
					for (let l in pluginInfo.config) if (configjs[l] === undefined) configjs[l] = pluginInfo.config[l];
					fs.writeFileSync(cfgPath, JSON.stringify(configjs, null, 4), { mode: 0o666 });
				}
			} else {
				let configjs = {};
				try {
					configjs = JSON.parse(fs.readFileSync(cfgPath));
				} catch (e) {
					log.warn("Plugins(Y2TB)", `${pluginInfo.pluginName} config file corrupted, rewriting defaults: ${e.message || e}`);
					configjs = {};
				}
				for (let l in configjs) if (pluginInfo.config[l] === undefined) delete configjs[l];
				for (let l in pluginInfo.config) if (configjs[l] === undefined) configjs[l] = pluginInfo.config[l];
				fs.writeFileSync(cfgPath, JSON.stringify(configjs, null, 4), { mode: 0o666 });
			}
			global.plugins.Y2TB.plugins[pluginInfo.pluginName].config = true;
		}
	}
}

async function getFileContent(linkDir) {
	try {
		const response = await octokit.repos.getContent({
			owner: "VangBanLaNhat",
			repo: "Y2TB-data",
			path: "PluginStorage/" + linkDir,
			ref: "main"
		});
		const content = Buffer.from(response.data.content, 'base64').toString();
		return content;
	} catch (error) {
		try {
			let cnt = (await axios.get('https://raw.githubusercontent.com/VangBanLaNhat/Y2TB-data/main/PluginStorage/' + linkDir)).data;
			return cnt;
		} catch (e) {
			return false;
		}
	}
}

async function downloadfile(linkDir) {
	const name = path.join(dirPlugins, "obb", linkDir);
	let url = null;
	try {
		const response = await octokit.repos.getContent({
			owner: "VangBanLaNhat",
			repo: "Y2TB-data",
			path: "PluginStorage/obb/" + linkDir,
			ref: "main"
		});
		url = response.data.download_url;
	} catch (err) {
		// Fall back to raw URL if rate limited or API fails
		url = `https://raw.githubusercontent.com/VangBanLaNhat/Y2TB-data/main/PluginStorage/obb/${linkDir}`;
	}

	try {
		const response = await axios({
			method: 'get',
			url,
			responseType: 'stream'
		});
		const writer = fs.createWriteStream(name);
		response.data.pipe(writer);
		await new Promise((resolve, reject) => {
			writer.on('finish', resolve);
			writer.on('error', reject);
		});
	} catch (error) {
		console.error("Plugins(Y2TB)", `Failed to download ${linkDir} from ${url}:`, error.message || error);
	}
}


function installmd(file, pluginInfo, opts = {}) {
	const skipNodeDepends = opts.skipNodeDepends || false;
	if (!skipNodeDepends && typeof pluginInfo.nodeDepends === "object") {
		for (let dep in pluginInfo.nodeDepends) {
			const depPath = path.join(ROOT, "node_modules", dep, "package.json");
			if (!fs.existsSync(depPath)) {
				log.warn("Plugins(Y2TB)", `Installing Node_module "${dep}" for plugin "${pluginInfo.pluginName}":`);
				const ver = pluginInfo.nodeDepends[dep];
				const pkg = ver && ver !== "" ? `${dep}@${ver}` : dep;
				const env = Object.assign({}, process.env, {
					npm_config_yes: "true",
					npm_config_audit: "false",
					npm_config_fund: "false"
				});
				cmd.execSync(`npm install --no-save --no-package-lock ${pkg}`, { stdio: "inherit", env, shell: true });
			}
		}
	}
}

function evelStringSync(str, fileName, dev) {
	fileName = fileName ? fileName : (new Date()).getTime() + "";

	if (dev) return require(path.join(dirPlugins, fileName));
	const nameEncode = Buffer.from(fileName).toString("base64") + ".js";
	ensureExists(dirPlugins);
	const linkDir = path.join(dirPlugins, nameEncode);

	fs.writeFileSync(linkDir, str);
	const res = require(linkDir);
	fs.unlinkSync(linkDir);

	res.dirFile = path.join(dirPlugins, nameEncode);
	return res;
}

function removeDir(path) {
	if (fs.existsSync(path)) {
		const files = fs.readdirSync(path)

		if (files.length > 0) {
			files.forEach(function (filename) {
				if (fs.statSync(path + "/" + filename).isDirectory()) {
					removeDir(path + "/" + filename)
				} else {
					fs.unlinkSync(path + "/" + filename)
				}
			})
			fs.rmdirSync(path)
		} else {
			fs.rmdirSync(path)
		}
	} else {
		console.log("Directory path not found.")
	}
}

function ensureExists(path, mask) {
	if (typeof mask != 'number') {
		mask = 0o777;
	}
	try {
		fs.mkdirSync(path, {
			mode: mask,
			recursive: true
		});
		return;
	} catch (ex) {
		return {
			err: ex
		};
	}
}

function normalizePluginTemp(map) {
	const res = {};
	if (!map || typeof map !== 'object') return res;
	for (const [key, val] of Object.entries(map)) {
		const withExt = /\.js$/i.test(key) ? key : `${key}.js`;
		if (FILE_KEY_RE.test(withExt)) res[withExt] = val;
	}
	return res;
}

module.exports = {
	loadPlugins,
	unloadPlugins
}