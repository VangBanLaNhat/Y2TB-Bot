const fs = require('fs');
const path = require("path");
const cmd = require('child_process');
const stripBom = require("strip-bom");
const log = require(path.join(__dirname, "..", "util", "log.js"));
const scanDir = require(path.join(__dirname, "..", "util", "scanDir.js"));

function loadPlugin(){
    
    !global.plugins.main ? global.plugins.main = {}:"";
    !global.plugins.main.command ? global.plugins.main.command = {}:"";
    var list = scanDir(".js", path.join(__dirname, "..", "..", "plugins", "Main"));
    var listFile = [];
    for(var i=0; i<list.length; i++){
        var check = path.join(__dirname, "..", "..", "plugins", "Main", list[i]);
        if (!fs.lstatSync(check).isDirectory()) {
            listFile.push(list[i]);
        }
    }
    var check = false;
    for(var i=0; i<listFile.length; i++){
        try{
            var pluginInfo = require(path.join(__dirname, "..", "..", "plugins", "Main", listFile[i])).init();
            var t = installmd(listFile[i], pluginInfo);
            if(t != undefined){
                check = true;
            }
        }
        catch(err){
            log.err("Plugins(main)", err);
        }
    }
    for(var i=0; i<listFile.length; i++){
        try{
            var pluginInfo = require(path.join(__dirname, "..", "..", "plugins", "Main", listFile[i])).init();
            var t = installmd(listFile[i], pluginInfo);
            if(t != undefined){
                check = true;
            }
        }
        catch(err){
            log.err("Plugins(main)", err);
        }
    }
    
    /*if (check == true) {
        log.warn("Plugins(Main)", "Install Node_module for plugins is success. Restarting BotChat to apply module!");
        cmd.execSync(`npm start`,{
                        stdio: "inherit",
                        env: process.env,
                        shell: true
                    })
        process.exit(0);
    }*/
    
    for(var i=0; i<listFile.length; i++){
        try{
            var pluginInfo = require(path.join(__dirname, "..", "..", "plugins", "Main", listFile[i])).init();
            load(listFile[i], pluginInfo);
        }
        catch(err){
            log.err("Plugins(main)", "Can't load \""+listFile[i]+"\" with error: "+err)
        }
    }
}

function load(file, pluginInfo){
    try{
        var funcmain = require(path.join(__dirname, "..", "..", "plugins", "Main", file));
        log.log("Plugins(main)", "Loaded plugin: "+pluginInfo.pluginName)
        for(var i in pluginInfo.commandList){
            !global.plugins.main.command[i] ? global.plugins.main.command[i] = {}:"";
            !global.plugins.main.command[i].help ? global.plugins.main.command[i].namePlugin = pluginInfo.pluginName:"";
            !global.plugins.main.command[i].help ? global.plugins.main.command[i].help = pluginInfo.commandList[i].help:"";
            !global.plugins.main.command[i].tag ? global.plugins.main.command[i].tag = pluginInfo.commandList[i].tag:"";
            !global.plugins.main.command[i].main ? global.plugins.main.command[i].main = path.join(__dirname, "..", "..", "plugins", "Main", file):"";
            !global.plugins.main.command[i].mainFunc ? global.plugins.main.command[i].mainFunc = pluginInfo.commandList[i].mainFunc:"";
            if(typeof pluginInfo.langMap == "object"){
                if(!fs.existsSync(path.join(__dirname, "..", "..", "lang", `${pluginInfo.pluginName}.json`))){
                    fs.writeFileSync(path.join(__dirname, "..", "..", "lang", `${pluginInfo.pluginName}.json`), JSON.stringify(pluginInfo.langMap, null, 4), {mode: 0o666});
                }
            }
            if(typeof pluginInfo.chathook == "string"){
                !global.chathook[pluginInfo.pluginName] ? global.chathook[pluginInfo.pluginName] = {
                    main: path.join(__dirname, "..", "..", "plugins", "Main", file),
                    func: pluginInfo.chathook
                }:"";
            }
        }
    }
    catch(err){
        log.err("Plugins(main)", "Can't load \""+file+"\" with error: "+err)
    }
}

function installmd(file, pluginInfo){
    if(typeof pluginInfo.nodeDepends == "object"){
        for (var i in pluginInfo.nodeDepends){
            if (!fs.existsSync(path.join(__dirname, "..", "..", "node_modules", i, "package.json"))) {
                
                log.warn("Plugins(main)", "Installing Node_module \""+i+"\" for plugin \""+pluginInfo.pluginName+"\":\n");
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
                return true;
            }
        }
    }
}

module.exports = loadPlugin;