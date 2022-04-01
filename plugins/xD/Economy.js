function init(){
    !global.data.economyConfig ? global.data.economyConfig = {}:"";
    !global.data.economy ? global.data.economy = {}:"";
    return{
        "pluginName": "Economy",
        "pluginMain": "Economy.js",
        "commandList": {
            "work": {
                "help": {
                    "vi_VN": "",
                    "en_US": ""
                },
                "tag": {
                    "vi_VN": "",
                    "en_US": ""
                },
                "mainFunc": "work"
            }
        },
        "nodeDepends":{
            "random": ""
        },
        "langMap":{
            "plswait":{
                "desc": "lang khi người dùng dùng lệnh quá nhanh",
                "vi_VN": "Vui lòng dùng lệnh này sau {0} giây!",
                "en_US": "Please use this command after {0} seconds!",
                "args": {
                    "{0}": {
                        "vi_VN": "Giây",
                        "en_US": "Seconds"
                    }
                }
            },
		},
        "author": "HerokeyVN",
        "version": "0.0.1"
    }
}

var config = {
    work: {
        min: 100,
        max: 200,
        countdown: 10
    }
}

function work(data, api) {
    !global.data.economyConfig.work ? global.data.economyConfig.work = config.work:"";
    var random = require("random");
    var cf = global.data.economyConfig.work
    !global.data.economy[data.senderID] ? global.data.economy[data.senderID] = {
        coin: 0
    }:"";
    !global.data.economy[data.senderID].work ? global.data.economy[data.senderID].work = {
        countdown: 0
    }:"";
    var time = new Date().getTime();
    if((time - global.data.economy[data.senderID].work.countdown)/1000 < cf.countdown){
        api.sendMessage(global.lang["Economy"].plswait[global.config.bot_info.lang].replace("{0}", cf.countdown-Math.trunc((time - global.data.economy[data.senderID].work.countdown)/1000)), data.threadID);
        return;
    }
    global.data.economy[data.senderID].work.countdown = time;
}

module.exports={
    init,
    work
}