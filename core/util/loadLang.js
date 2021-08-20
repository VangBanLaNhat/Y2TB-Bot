const fs = require('fs');
const path = require("path");
const stripBom = require("strip-bom");
const log = require(path.join(__dirname, "log.js"));
const scanDir = require(path.join(__dirname, "scanDir.js"));

function loadLang() {
    !global.lang ? global.lang = {}:"";
    var dirLang = path.join(__dirname, "..", "..", "lang");
    var listLang = scanDir(".json", dirLang);
    for (var i = 0; i < listLang.length; i++) {
        var pluginName = listLang[i].split(".");
        pluginName.splice(pluginName.length-1,1);
        pluginName = pluginName.toString(".");
        try{
            var lang = JSON.parse(stripBom(fs.readFileSync(path.join(dirLang, listLang[i]), {encoding: "utf8"})));
            !global.lang[pluginName] ? global.lang[pluginName] = lang:"";
            log.log("Languages", `Loaded language for plugin "${pluginName}"`);
        }
        catch(err){
            log.err("Languages", `Can't load language for plugin "${pluginName}" with error: ${err}`);
        }
    }
}

module.exports = loadLang;