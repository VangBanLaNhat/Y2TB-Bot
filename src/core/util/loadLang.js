const fs = require('fs');
const path = require("path");
const stripBom = require("strip-bom");
const log = require(path.join(__dirname, "log.js"));

const ROOT = path.join(__dirname, "..", "..", "..");

function loadLang() {
    !global.lang ? global.lang = {} : "";
    const dirLang = path.join(ROOT, "lang");

  if (!global.plugins || !global.plugins.Y2TB || !global.plugins.Y2TB.plugins) {
    log.warn("Languages", "Plugin registry not ready; skip language load");
    return;
  }

  for (const pluginName of Object.keys(global.plugins.Y2TB.plugins)) {
    const pluginMeta = global.plugins.Y2TB.plugins[pluginName];
    if (!pluginMeta || !pluginMeta.lang) continue;

    const pluginLangDir = path.join(dirLang, pluginName);
    if (!fs.existsSync(pluginLangDir) || !fs.lstatSync(pluginLangDir).isDirectory()) {
      log.warn("Languages", `Language folder not found for plugin "${pluginName}"`);
      continue;
    }

    let localeFiles = [];
    try {
      localeFiles = fs.readdirSync(pluginLangDir)
        .filter((name) => name.endsWith(".json"))
        .sort();
    } catch (err) {
      log.err("Languages", `Can't read language folder for plugin "${pluginName}" with error: ${err}`);
      continue;
    }

    const mergedLang = {};
    for (const fileName of localeFiles) {
      const locale = fileName.replace(/\.json$/i, "");
      const filePath = path.join(pluginLangDir, fileName);
      try {
        const parsed = JSON.parse(stripBom(fs.readFileSync(filePath, { encoding: "utf8" })));
        for (const key of Object.keys(parsed || {})) {
          if (!mergedLang[key]) mergedLang[key] = {};
          const entry = parsed[key];
          if (entry && typeof entry === "object" && !Array.isArray(entry)) {
            if (typeof entry.text === "string") mergedLang[key][locale] = entry.text;
            else if (typeof entry[locale] === "string") mergedLang[key][locale] = entry[locale];
          } else if (typeof entry === "string") {
            mergedLang[key][locale] = entry;
          }
        }
      } catch (err) {
        log.err("Languages", `Can't load language file "${fileName}" for plugin "${pluginName}" with error: ${err}`);
      }
    }

    global.lang[pluginName] = mergedLang;
    log.log("Languages", `Loaded language for plugin "${pluginName}"`);
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

module.exports = loadLang;
