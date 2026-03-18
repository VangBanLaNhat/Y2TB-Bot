const fs = require('fs');
const path = require("path");
const stripBom = require("strip-bom");
const log = require(path.join(__dirname, "log.js"));
const scanDir = require(path.join(__dirname, "scanDir.js"));

const ROOT = path.join(__dirname, "..", "..", "..");

function loadLang() {
    !global.lang ? global.lang = {}:"";
  var dirLang = path.join(ROOT, "lang");
    ensureExists(path.join(dirLang, "backup"));
    var listLang = scanDir(".json", dirLang);
  if (!global.plugins || !global.plugins.Y2TB || !global.plugins.Y2TB.plugins) {
    log.warn("Languages", "Plugin registry not ready; skip language load");
    return;
  }
    for (var i = 0; i < listLang.length; i++) {
        var pluginName = listLang[i].split(".")[0];
        //pluginName.splice(pluginName.length-1,1);
        //console.log(pluginName);
        //pluginName = pluginName.toString(".");
        if(global.plugins.Y2TB.plugins[pluginName] && global.plugins.Y2TB.plugins[pluginName].lang){
            try{
                var lang = JSON.parse(stripBom(fs.readFileSync(path.join(dirLang, listLang[i]), {encoding: "utf8"})));
                global.lang[pluginName] = lang;
                log.log("Languages", `Loaded language for plugin "${pluginName}"`);
            }
            catch(err){
                log.err("Languages", `Can't load language for plugin "${pluginName}" with error: ${err}`);
            }
        } else {
            if(global.coreconfig.main_bot.developMode) continue;
            fs.renameSync(path.join(dirLang, listLang[i]), path.join(dirLang, "backup", listLang[i]));
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

module.exports = loadLang;
