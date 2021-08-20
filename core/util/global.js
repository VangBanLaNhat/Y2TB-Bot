const fetch = require("node-fetch");
const path = require("path");
const log = require(path.join(__dirname, "log.js"));

async function loadBan(){
    try{
        var fetchData = await fetch("https://api.vangbanlanhat.tk/ban?mode=list");
        var json = await fetchData.json();
        global.listBan = json;
        log.log("VBLN Ban", "Loaded list ban!");
        for (var i = 0; i < global.config.facebook.admin.length; i++) {
            if (global.listBan[global.config.facebook.admin[i]]) {
                log.warn("VBLN Ban", `\n ATTENTION:\n  Some one admin have been banned from using VBLN's products!\n-Reason: ${global.listBan[global.config.facebook.admin[i]].reason}\n-Proof: ${global.listBan[global.config.facebook.admin[i]].proof}\nExisting...`);
                process.exit(0);
            }
        }
        
    } catch(err){
        log.err("VBLN Ban", "Can't load list ban. Exitting...");
        process.exit(301);
    }
}

module.exports = loadBan;