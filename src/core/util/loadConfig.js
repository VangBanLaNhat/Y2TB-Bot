const fs = require('fs');
const path = require("path");
const stripBom = require("strip-bom");
const log = require(path.join(__dirname, "log.js"));
const scanDir = require(path.join(__dirname, "scanDir.js"));

const ROOT = path.join(__dirname, "..", "..", "..");

function loadConfig() {
  !global.configPl ? global.configPl = {} : "";
  const dirConfig = path.join(ROOT, "config", "plugins");
  ensureExists(dirConfig);
  ensureExists(path.join(dirConfig, "backup"));
  if (!global.plugins || !global.plugins.Y2TB || !global.plugins.Y2TB.plugins) {
    log.warn("Config", "Plugin registry not ready; skip config load");
    return;
  }

  const configFiles = scanDir(".json", dirConfig);
  const validPlugins = Object.keys(global.plugins.Y2TB.plugins).filter((name) => global.plugins.Y2TB.plugins[name].config);

  for (let i in configFiles) {
    const pluginName = configFiles[i].split(".json")[0];
    const pluginMeta = global.plugins.Y2TB.plugins[pluginName];
    const cfgPath = path.join(dirConfig, configFiles[i]);
    if (!pluginMeta || !pluginMeta.config) {
      if (global.coreconfig.main_bot.developMode) continue;
      fs.renameSync(cfgPath, path.join(dirConfig, "backup", configFiles[i]));
      continue;
    }
    try {
      const raw = stripBom(fs.readFileSync(cfgPath, { encoding: "utf8" }));
      const config = JSON.parse(raw);
      global.configPl[pluginName] = config;
      log.log("Config", `Loaded config for plugin "${pluginName}"`);
    } catch (err) {
      log.err("Config", `Can't load config for plugin "${pluginName}" with error: ${err}`);
      const fallback = pluginMeta.configDefault;
      if (fallback && typeof fallback === "object") {
        try {
          fs.writeFileSync(cfgPath, JSON.stringify(fallback, null, 4), { mode: 0o666 });
          global.configPl[pluginName] = fallback;
          log.warn("Config", `Restored default config for plugin "${pluginName}"`);
        } catch (e) {
          log.err("Config", `Failed to restore default config for plugin "${pluginName}" with error: ${e}`);
        }
      }
    }
  }

  for (const pluginName of validPlugins) {
    if (global.configPl[pluginName]) continue;
    const pluginMeta = global.plugins.Y2TB.plugins[pluginName];
    const cfgPath = path.join(dirConfig, `${pluginName}.json`);
    const fallback = pluginMeta.configDefault;
    if (fallback && typeof fallback === "object") {
      try {
        fs.writeFileSync(cfgPath, JSON.stringify(fallback, null, 4), { mode: 0o666 });
        global.configPl[pluginName] = fallback;
        log.log("Config", `Created default config for plugin "${pluginName}"`);
      } catch (err) {
        log.err("Config", `Can't create default config for plugin "${pluginName}" with error: ${err}`);
      }
    } else {
      global.configPl[pluginName] = {};
    }
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

module.exports = loadConfig;
