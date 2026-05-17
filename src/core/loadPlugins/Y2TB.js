const fs = require('fs');
const path = require("path");
const stripBom = require("strip-bom");
const cmd = require('child_process');
const log = require(path.join(__dirname, "..", "util", "log.js"));

const ROOT = path.join(__dirname, "..", "..", "..");
const dirPlugins = path.join(ROOT, "plugins");

!global.temp ? global.temp = {} : "";
!global.temp.loadPlugin ? global.temp.loadPlugin = {} : "";

function collectPluginDeps(entries) {
	const all = new Set();
	const missing = new Set();

	for (const entry of entries) {
		const info = entry.previewInfo;
		if (!info || typeof info.nodeDepends !== "object") continue;

		for (const dep in info.nodeDepends) {
			const ver = info.nodeDepends[dep];
			const spec = ver && ver !== "" ? `${dep}@${ver}` : dep;
			all.add(spec);

			const depPath = path.join(ROOT, "node_modules", dep, "package.json");
			if (!fs.existsSync(depPath)) {
				missing.add(spec);
			}
		}
	}

	return {
		all: Array.from(all),
		missing: Array.from(missing)
	};
}

function dedupeSpecs(pkgs) {
	const byName = {};
	for (const spec of (pkgs || [])) {
		if (!spec) continue;
		const at = spec.lastIndexOf("@");
		const name = at > 0 ? spec.slice(0, at) : spec;
		const current = byName[name];
		if (!current || spec.includes("@")) byName[name] = spec;
	}
	return Object.values(byName);
}

function yarnBatchInstall(missingPkgs, allPkgs) {
	if (!missingPkgs || !missingPkgs.length) return;

	const uniqueMissingPkgs = dedupeSpecs(missingPkgs);
	const uniqueAllPkgs = dedupeSpecs(allPkgs && allPkgs.length ? allPkgs : missingPkgs);

	let hasYarn = false;
	try {
		cmd.execSync("yarn -v", { stdio: "ignore", env: process.env, shell: true });
		hasYarn = true;
	} catch (e) {
		hasYarn = false;
	}

	if (!hasYarn) {
		log.warn("Plugins(Y2TB)", "Yarn not found. Skip runtime dependency install.");
		return;
	}

	const packageJsonPath = path.join(ROOT, "package.json");
	const yarnLockPath = path.join(ROOT, "yarn.lock");
	const packageJsonBefore = fs.existsSync(packageJsonPath) ? fs.readFileSync(packageJsonPath, "utf8") : null;
	const yarnLockBefore = fs.existsSync(yarnLockPath) ? fs.readFileSync(yarnLockPath, "utf8") : null;

	function restoreManifests() {
		try {
			if (packageJsonBefore !== null) fs.writeFileSync(packageJsonPath, packageJsonBefore, { mode: 0o666 });
		} catch (restoreErr) {
			log.warn("Plugins(Y2TB)", `Failed to restore package.json after yarn add: ${restoreErr.message || restoreErr}`);
		}
		try {
			if (yarnLockBefore !== null) fs.writeFileSync(yarnLockPath, yarnLockBefore, { mode: 0o666 });
		} catch (restoreErr) {
			log.warn("Plugins(Y2TB)", `Failed to restore yarn.lock after yarn add: ${restoreErr.message || restoreErr}`);
		}
	}

	const batchCmd = `yarn add ${uniqueAllPkgs.join(" ")} --non-interactive`;
	log.warn("Plugins(Y2TB)", `Installing dependencies via yarn (full plugin set to avoid prune): ${uniqueAllPkgs.join(", ")}`);
	try {
		cmd.execSync(batchCmd, {
			stdio: "inherit",
			env: process.env,
			shell: true
		});
		return;
	} catch (e) {
		log.warn("Plugins(Y2TB)", `yarn batch install failed, fallback one-by-one: ${e.message || e}`);
	} finally {
		restoreManifests();
	}

	for (const pkg of uniqueMissingPkgs) {
		try {
			cmd.execSync(`yarn add ${pkg} --non-interactive`, {
				stdio: "inherit",
				env: process.env,
				shell: true
			});
		} catch (er) {
			log.warn("Plugins(Y2TB)", `Install failed for ${pkg}: ${er.message || er}`);
		} finally {
			restoreManifests();
		}
	}
}

async function loadPlugins() {
	!global.plugins ? global.plugins = {} : "";
	!global.plugins.Y2TB ? global.plugins.Y2TB = {} : "";
	!global.plugins.Y2TB.command ? global.plugins.Y2TB.command = {} : "";
	!global.plugins.Y2TB.plugins ? global.plugins.Y2TB.plugins = {} : "";
	!global.data ? global.data = {} : "";

	ensureExists(dirPlugins);

	const pluginEntries = [];
	const children = fs.readdirSync(dirPlugins);
	for (const child of children) {
		const pluginDir = path.join(dirPlugins, child);
		if (!fs.existsSync(pluginDir) || !fs.lstatSync(pluginDir).isDirectory()) continue;

		const manifestPath = path.join(pluginDir, "plugin.json");
		if (!fs.existsSync(manifestPath) || !fs.lstatSync(manifestPath).isFile()) continue;

		try {
			const rawManifest = stripBom(fs.readFileSync(manifestPath, { encoding: "utf8" }));
			const pluginInfo = JSON.parse(rawManifest);
			if (!pluginInfo || typeof pluginInfo !== "object") throw new Error("Invalid plugin.json");

			if (!pluginInfo.pluginMain || typeof pluginInfo.pluginMain !== "string") {
				pluginInfo.pluginMain = `${child}.js`;
			}
			if (!pluginInfo.pluginName || typeof pluginInfo.pluginName !== "string") {
				pluginInfo.pluginName = child;
			}

			const pluginMainPath = path.join(pluginDir, pluginInfo.pluginMain);
			if (!fs.existsSync(pluginMainPath) || !fs.lstatSync(pluginMainPath).isFile()) {
				throw new Error(`Missing plugin main file: ${pluginInfo.pluginMain}`);
			}

			let configDefault = null;
			const pluginConfigPath = path.join(pluginDir, "config.json");
			if (fs.existsSync(pluginConfigPath) && fs.lstatSync(pluginConfigPath).isFile()) {
				try {
					const rawConfig = stripBom(fs.readFileSync(pluginConfigPath, { encoding: "utf8" }));
					const parsedConfig = JSON.parse(rawConfig);
					if (parsedConfig && typeof parsedConfig === "object" && !Array.isArray(parsedConfig)) {
						configDefault = parsedConfig;
					} else {
						log.warn("Plugins(Y2TB)", `${pluginInfo.pluginName} config.json is not an object. Ignored.`);
					}
				} catch (e) {
					log.warn("Plugins(Y2TB)", `${pluginInfo.pluginName} invalid config.json: ${e.message || e}`);
				}
			}

			const func = fs.readFileSync(pluginMainPath, { encoding: "utf8" });

			pluginEntries.push({
				name: pluginInfo.pluginName,
				fileUsed: pluginInfo.pluginMain,
				pluginMainPath,
				func,
				previewInfo: pluginInfo,
				pluginInfo,
				configDefault
			});
		} catch (err) {
			log.err("Plugins(Y2TB)", `Can't prepare plugin folder "${child}" with error: ${err}`);
			!global.temp.loadPlugin.stderr ? global.temp.loadPlugin.stderr = [] : "";
			global.temp.loadPlugin.stderr.push({ plugin: child, error: err });
		}
	}

	if (!pluginEntries.length) {
		log.warn("Plugins(Y2TB)", "No plugin folders with plugin.json were found");
	}

	// Batch install missing dependencies discovered from init metadata
	try {
		const deps = collectPluginDeps(pluginEntries);
		yarnBatchInstall(deps.missing, deps.all);
	} catch (e) {
		log.warn("Plugins(Y2TB)", `Batch install failed: ${e.message || e}`);
	}

	// Now load plugins for real
	for (const entry of pluginEntries) {
		try {
			const pluginInfo = entry.pluginInfo || entry.previewInfo;
			installmd(entry.fileUsed, pluginInfo, { skipNodeDepends: true });

			// Require plugin module only after dependency installation.
			if (require.cache[require.resolve(entry.pluginMainPath)]) {
				delete require.cache[require.resolve(entry.pluginMainPath)];
			}
			const moduleFuncs = require(entry.pluginMainPath);
			moduleFuncs.dirFile = entry.pluginMainPath;

			await load(entry.fileUsed, pluginInfo, entry.func, moduleFuncs, entry.configDefault);
			log.log("Plugins(Y2TB)", `Loaded plugin ${entry.fileUsed} v${pluginInfo.version}`);
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

async function load(file, pluginInfo, func, fullFuncModule, configDefault) {
	const dirConfig = path.join(ROOT, "config", "plugins");
	const dirLang = path.join(ROOT, "lang");
	ensureExists(dirConfig);

	// Evaluate plugin source (use provided module if available to avoid re-eval)
	const fullFunc = fullFuncModule || evelStringSync(func, file);

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
			"config": false,
			"configDefault": (configDefault && typeof configDefault === "object") ? configDefault : null
		};
	} else {
		global.plugins.Y2TB.plugins[pluginInfo.pluginName].configDefault = (configDefault && typeof configDefault === "object") ? configDefault : null;
	}
	!global.plugins.Y2TB.plugins.listen ? global.plugins.Y2TB.plugins.listen = { "lang": true } : "";

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

	// Sync plugin language source to bot language folder: lang/<pluginName>/<locale>.json
	if (Array.isArray(pluginInfo.lang) && pluginInfo.lang.length) {
		const pluginDir = path.dirname(fullFunc.dirFile || "");
		const pluginLangDir = path.join(pluginDir, "lang");
		const botPluginLangDir = path.join(dirLang, pluginInfo.pluginName);
		ensureExists(botPluginLangDir);

		let hasLang = false;
		for (const locale of pluginInfo.lang) {
			if (typeof locale !== "string" || locale.trim() === "") continue;
			const sourcePath = path.join(pluginLangDir, `${locale}.json`);
			const targetPath = path.join(botPluginLangDir, `${locale}.json`);
			if (!fs.existsSync(sourcePath) || !fs.lstatSync(sourcePath).isFile()) {
				log.warn("Plugins(Y2TB)", `${pluginInfo.pluginName} missing source language file: ${sourcePath}`);
				continue;
			}

			let sourceLang = {};
			try {
				sourceLang = JSON.parse(stripBom(fs.readFileSync(sourcePath, { encoding: "utf8" })));
			} catch (e) {
				log.warn("Plugins(Y2TB)", `${pluginInfo.pluginName} source language invalid (${locale}): ${e.message || e}`);
				continue;
			}

			if (!fs.existsSync(targetPath)) {
				fs.writeFileSync(targetPath, JSON.stringify(sourceLang, null, 4), { mode: 0o666 });
				hasLang = true;
				continue;
			}

			let botLang = {};
			try {
				botLang = JSON.parse(stripBom(fs.readFileSync(targetPath, { encoding: "utf8" })));
			} catch (e) {
				log.warn("Plugins(Y2TB)", `${pluginInfo.pluginName} bot language invalid (${locale}), rewriting from plugin source`);
				botLang = {};
			}

			const merged = mergeMissingFields(botLang, sourceLang);
			fs.writeFileSync(targetPath, JSON.stringify(merged, null, 4), { mode: 0o666 });
			hasLang = true;
		}

		global.plugins.Y2TB.plugins[pluginInfo.pluginName].lang = hasLang;
	}

	// Load plugin config (runtime file in config/plugins, defaults from plugin folder config.json)
	if (configDefault && typeof configDefault === "object") {
		const cfgPath = path.join(dirConfig, `${pluginInfo.pluginName}.json`);
		if (!fs.existsSync(cfgPath)) {
			const backupCfg = path.join(dirConfig, "backup", `${pluginInfo.pluginName}.json`);
			if (!fs.existsSync(backupCfg)) {
				fs.writeFileSync(cfgPath, JSON.stringify(configDefault, null, 4), { mode: 0o666 });
			} else {
				fs.renameSync(backupCfg, cfgPath);
				let configjs = {};
				try {
					configjs = JSON.parse(fs.readFileSync(cfgPath));
				} catch (e) {
					log.warn("Plugins(Y2TB)", `${pluginInfo.pluginName} config backup corrupted, rewriting defaults: ${e.message || e}`);
					configjs = {};
				}
				for (let l in configjs) if (configDefault[l] === undefined) delete configjs[l];
				for (let l in configDefault) if (configjs[l] === undefined) configjs[l] = configDefault[l];
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
			for (let l in configjs) if (configDefault[l] === undefined) delete configjs[l];
			for (let l in configDefault) if (configjs[l] === undefined) configjs[l] = configDefault[l];
			fs.writeFileSync(cfgPath, JSON.stringify(configjs, null, 4), { mode: 0o666 });
		}
		global.plugins.Y2TB.plugins[pluginInfo.pluginName].config = true;
	} else {
		global.plugins.Y2TB.plugins[pluginInfo.pluginName].config = false;
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
				const packageJsonPath = path.join(ROOT, "package.json");
				const yarnLockPath = path.join(ROOT, "yarn.lock");
				const packageJsonBefore = fs.existsSync(packageJsonPath) ? fs.readFileSync(packageJsonPath, "utf8") : null;
				const yarnLockBefore = fs.existsSync(yarnLockPath) ? fs.readFileSync(yarnLockPath, "utf8") : null;
				try {
					cmd.execSync(`yarn add ${pkg} --non-interactive`, { stdio: "inherit", env: process.env, shell: true });
				} finally {
					try {
						if (packageJsonBefore !== null) fs.writeFileSync(packageJsonPath, packageJsonBefore, { mode: 0o666 });
					} catch (restoreErr) {
						log.warn("Plugins(Y2TB)", `Failed to restore package.json after yarn add: ${restoreErr.message || restoreErr}`);
					}
					try {
						if (yarnLockBefore !== null) fs.writeFileSync(yarnLockPath, yarnLockBefore, { mode: 0o666 });
					} catch (restoreErr) {
						log.warn("Plugins(Y2TB)", `Failed to restore yarn.lock after yarn add: ${restoreErr.message || restoreErr}`);
					}
				}
			}
		}
	}
}

function evelStringSync(str, fileName) {
	fileName = fileName ? fileName : (new Date()).getTime() + "";
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

function isObject(value) {
	return value && typeof value === "object" && !Array.isArray(value);
}

function mergeMissingFields(target, source) {
	if (!isObject(target)) target = {};
	if (!isObject(source)) return target;

	for (const key of Object.keys(source)) {
		if (target[key] === undefined) {
			target[key] = source[key];
			continue;
		}
		if (isObject(target[key]) && isObject(source[key])) {
			target[key] = mergeMissingFields(target[key], source[key]);
		}
	}
	return target;
}

module.exports = {
	loadPlugins,
	unloadPlugins
}