const fs = require('fs');
const path = require("path");
const cmd = require('child_process');
const stripBom = require("strip-bom");
const log = require(path.join(__dirname, "..", "util", "log.js"));
const scanDir = require(path.join(__dirname, "..", "util", "scanDir.js"));

function loadPlugin(){
    
    !global.plugins.VBLN ? global.plugins.VBLN = {}:"";
    !global.plugins.VBLN.command ? global.plugins.VBLN.command = {}:"";
    var list = scanDir(".js", path.join(__dirname, "..", "..", "plugins"));
    ensureExists(path.join(__dirname, "..", "..", "plugins", "cache"));
    var listFile = [];
    for(var i=0; i<list.length; i++){
        var check = path.join(__dirname, "..", "..", "plugins", list[i]);
        if (!fs.lstatSync(check).isDirectory()) {
            listFile.push(list[i]);
        }
    }
    var check = false;
    for(var i=0; i<listFile.length; i++){
        try{
            var pluginInfo = require(path.join(__dirname, "..", "..", "plugins", listFile[i])).init();
            var t = installmd(listFile[i], pluginInfo);
            if(t != undefined){
                check = true;
            }
        }
        catch(err){
            log.err("Plugins(VBLN)", err);
        }
    }
    
    
    /*if (check == true) {
        log.warn("Plugins(VBLN)", "Install Node_module for plugins is success. Restarting BotChat to apply module!");
        cmd.execSync(`npm start`,{
                        stdio: "inherit",
                        env: process.env,
                        shell: true
                    })
        process.exit(0);
    }*/
    
    for(var i=0; i<listFile.length; i++){
        try{
            var pluginInfo = require(path.join(__dirname, "..", "..", "plugins", listFile[i])).init();
            load(listFile[i], pluginInfo);
        }
        catch(err){
            log.err("Plugins(VBLN)", "Can't load \""+listFile[i]+"\" with error: "+err)
        }
    }
}

function load(file, pluginInfo){
    try{
        var funcmain = require(path.join(__dirname, "..", "..", "plugins", file));
        for(var i in pluginInfo.commandList){
            !global.plugins.VBLN.command[i] ? global.plugins.VBLN.command[i] = {}:"";
            !global.plugins.VBLN.command[i].help ? global.plugins.VBLN.command[i].namePlugin = pluginInfo.pluginName:"";
            !global.plugins.VBLN.command[i].help ? global.plugins.VBLN.command[i].help = pluginInfo.commandList[i].help:"";
            !global.plugins.VBLN.command[i].tag ? global.plugins.VBLN.command[i].tag = pluginInfo.commandList[i].tag:"";
            !global.plugins.VBLN.command[i].main ? global.plugins.VBLN.command[i].main = path.join(__dirname, "..", "..", "plugins", file):"";
            !global.plugins.VBLN.command[i].mainFunc ? global.plugins.VBLN.command[i].mainFunc = pluginInfo.commandList[i].mainFunc:"";
        }
        if(typeof pluginInfo.langMap == "object"){
                if(!fs.existsSync(path.join(__dirname, "..", "..", "lang", `${pluginInfo.pluginName}.json`))){
                    fs.writeFileSync(path.join(__dirname, "..", "..", "lang", `${pluginInfo.pluginName}.json`), JSON.stringify(pluginInfo.langMap, null, 4), {mode: 0o666});
                }
            }
            if(typeof pluginInfo.chathook == "string"){
                !global.chathook[pluginInfo.pluginName] ? global.chathook[pluginInfo.pluginName] = {
                    main: path.join(__dirname, "..", "..", "plugins", file),
                    func: pluginInfo.chathook
                }:"";
            }
        log.log("Plugins(VBLN)", "Loaded plugin: "+pluginInfo.pluginName+" "+pluginInfo.version+" by "+pluginInfo.author)
    }
    catch(err){
        log.err("Plugins(VBLN)", "Can't load \""+file+"\" with error: "+err)
    }
}

function installmd(file, pluginInfo){
    if(typeof pluginInfo.nodeDepends == "object"){
        for (var i in pluginInfo.nodeDepends){
            /*var ch = true;
            try{
                var a = require(i)
            }catch (e){
                console.log(e)
                ch = false
            }*/
            
            //if (!ch) {
            if (!fs.existsSync(path.join(__dirname, "..", "..", "node_modules", i, "package.json"))) {
                
                log.warn("Plugins(VBLN)", "Installing Node_module \""+i+"\" for plugin \""+pluginInfo.pluginName+"\":\n");
                if(pluginInfo.nodeDepends[i] != ""){
                    cmd.execSync(`npm install ${i}@${pluginInfo.nodeDepends[i]}`,{
                        stdio: "inherit",
                        env: process.env,
                        shell: true
                    })
                }
                else{
                    cmd.execSync(`npm install ${i}`,{
                        stdio: "inherit",
                        env: process.env,
                        shell: true
                    })
                }
            }
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

module.exports = loadPlugin;