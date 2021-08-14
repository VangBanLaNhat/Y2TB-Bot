const fs = require('fs');
const StreamZip = require('node-stream-zip');
const wait = require('wait-for-stuff');
var childProcess = require("child_process");
const log = require("./log.js");
const path = require("path");
var dirPlugin = path.join(__dirname, "..", "..", "plugins");

function scanDir(){
    //readDir
    var dirfile = fs.readdirSync(dirPlugin);
    !global.listZip ? global.listZip = {}: "";
    for (var i=0; i<dirfile.length; i++ ){
        var c = fs.existsSync(path.join(__dirname, "..", "..", "plugins", dirfile[i]));
        if(c){
            if(dirfile[i].lastIndexOf(".zip") == dirfile[i].length-4){
                !global.listZip[dirfile[i]] ? global.listZip[dirfile[i]] = {}:"";
            }
        }
    }
}
async function loadPlugin(){
    scanDir();
    let startLoading = Date.now();
    var error = [];
    global.plugins = {}; //Plugin Scope
    var pltemp1 = {}; //Plugin Info
    var pltemp2 = {}; //Plugin Executable
    global.fileMap = {};
    global.privateFileMap = {};
    global.loadedPlugins = {};
    global.chatHook = [];
    !global.commandMapping ? global.commandMapping = {} : "";
    log.log("Plugin", "Searching for plugins..."); 
    for (var n in global.listZip){
        let zip = null
        try{
            zip = new StreamZip({
                file: n,
                storeEntries: true
            });
            wait.for.event(zip, "ready");
            try {
                var plinfo = JSON.parse(zip.entryDataSync('plugins.json').toString('utf8'));
            }
            catch (ex) {
                throw "Invalid plugins.json file (Broken JSON)!";
            }
            if (!plinfo["plugin_name"] || !plinfo["plugin_scope"] || !plinfo["plugin_exec"]) {
                throw "Invalid plugins.json file (Not enough data)!";
            }
            if (!plinfo["complied_for"]) {
                throw "Plugin doesn't have complied_for (Complied for <=0.2.8?).";
            }
            else {
                if (!checkPluginCompatibly(plinfo["complied_for"])) {
                    throw "Plugin is complied for version {0}, but this version doesn't compatible with it.".replace("{0}", plinfo["complied_for"]);
                }
            }
            try {
                var plexec = zip.entryDataSync(plinfo["plugin_exec"]).toString('utf8');
                
            }
            catch (ex) {
                throw "Executable file " + plinfo["plugin_exec"] + " not found.";
            }
            if (global.getType(plinfo["file_map"]) == "Object") {
                for (let fd in plinfo["file_map"]) {
                    try {
                        global.fileMap[plinfo["file_map"][fd]] = zip.entryDataSync(fd);
                    }
                    catch (ex) {
                        throw "File " + fd + " not found.";
                    }
                }
            }
            if (global.getType(plinfo["private_file_map"]) == "Object") {
                global.privateFileMap[plinfo["plugin_scope"]] = {};
                for (let fd in plinfo["private_file_map"]) {
                    try {
                        global.privateFileMap[plinfo["plugin_scope"]][plinfo["private_file_map"][fd]] = zip.entryDataSync(fd);
                    }
                    catch (ex) {
                        throw "File " + fd + " not found.";
                    }
                }
            }
            if (typeof plinfo["node_depends"] == "object") {
                for (var nid in plinfo["node_depends"]) {
                    var defaultmodule = require("module").builtinModules;
                    var moduledir = path.join(__dirname, "plugins", "nodemodules", "node_modules", nid);
                    try {
                        if (defaultmodule.indexOf(nid) != -1 || (["jimp", "wait-for-stuff", "deasync", "discord.js", "fca-unofficial", "ffmpeg-static"]).indexOf(nid) !== -1) {
                            global.nodemodule[nid] = require(nid);
                        }
                        else {
                            global.nodemodule[nid] = require(moduledir);
                        }
                    }
                    catch (ex) {
                        log.log("Plugin", n+"is requiring node modules named"+nid+"but it isn't installed. Attempting to install it through npm package manager...");
                        childProcess.execSync("npm --loglevel error --package-lock false --save false -- install " + nid +(plinfo["node_depends"][nid] == "*" ||plinfo["node_depends"][nid] == "" ? "" : ("@" + plinfo["node_depends"][nid])),{
                            stdio: "inherit",
                            cwd: path.join(__dirname, "plugins", "nodemodules"),
                            env: process.env,
                            shell: true
                        });
            //Loading 3 more times before drop that plugins
                        var moduleLoadTime = 0;
                        var exception = "";
                        var success = false;
                        for (moduleLoadTime = 1; moduleLoadTime <= 3; moduleLoadTime++) {
                            require.cache = {};
                            try {
                                if (defaultmodule.indexOf(nid) != -1 || nid == "jimp") {
                                    global.nodemodule[nid] = require(nid);
                                }
                                else {
                                    global.nodemodule[nid] = require(moduledir);
                                }
                                success = true;
                                break;
                        }
                            catch (ex) {
                            exception = ex;
                        }
                            if (success) {
                            break;
                        }
                        }
                        if (!success) {
                            throw "Cannot load node module: " + nid + ". Additional info: " + exception;
                        }
                    }
                }
            }
            pltemp1[plinfo["plugin_name"]] = plinfo;
            pltemp1[plinfo["plugin_name"]].filename = n;
            pltemp2[plinfo["plugin_name"]] = plexec;
            zip.close();
        }
        catch (ex) {
            log.log("Plugin", "Error while loading plugin at \"" + n + "\": "+ex);
            error.push(n);
            delete pltemp1[plinfo["plugin_name"]];
            delete pltemp2[plinfo["plugin_name"]];
            if (zip) {
                zip.close();
            }
        }
        for (var plname in pltemp1){
            if (pltemp1[plname]["dependents"]) {
                for (var no in pltemp1[plname]["dependents"]) {
                    if (typeof pltemp1[pltemp1[plname]["dependents"][no]] != "object") {
                        passed = false;
                        log.log("Plugin", plname+" depend on plugin named "+pltemp1[plname][
                        "dependents"][no] + ", but that plugin is not installed/loaded.");
                    }
                }
            }
            
        }
    }
}

module.exports = {
    loadPlugin
}