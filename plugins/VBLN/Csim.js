async function csim(data, api){
    const fetch = require("node-fetch");
    const path = require("path");
    !global.data.csim?global.data.csim = {}:"";
    !global.data.csim[data.threadID]?global.data.csim[data.threadID] = false:"";
    
    var msg = data.body
    if(msg == "on"){
        global.data.csim[data.threadID] = true;
        api.sendMessage(global.lang.Csim.simOn[global.config.bot_info.lang] , data.threadID, data.messageID);
    }
    else if(msg == "off"){
        global.data.csim[data.threadID] = false;
        api.sendMessage(global.lang.Csim.simOff[global.config.bot_info.lang] , data.threadID, data.messageID);
    }
    else{
        var datajs = await fetch(encodeURI(`https://api.simsimi.net/v1/?text=${msg}&lang=${global.config.bot_info.lang}`));
        var json = await datajs.json();
        var s = json.success;
        var rt = global.lang.Csim.simReturn[global.config.bot_info.lang].replace("{0}", s);
        if (s != undefined) {
            api.sendMessage(rt , data.threadID, data.messageID);
	    }
    }
}

async function chathook(data, api){
    !global.data.csim?global.data.csim = {}:"";
    if(data.type == "message" && global.data.csim[data.threadID]){
        const fetch = require("node-fetch");
    
        var msg = data.body
        var datajs = await fetch(encodeURI(`https://api.simsimi.net/v1/?text=${msg}&lang=${global.config.bot_info.lang}`));
        var json = await datajs.json();
        var s = json.success;
        var rt = global.lang.Csim.simReturn[global.config.bot_info.lang].replace("{0}", s);
        if (s != undefined) {
            api.sendMessage(rt , data.threadID, data.messageID);
	    }
    }
}

function init(){
    return{
        "pluginName": "Csim",
        "pluginMain": "Csim.js",
        "commandList": {
            "csim": {
                "help": {
                    "vi_VN": "<Từ khóa>",
                    "en_US": "<Key word>"
                },
                "tag": {
                    "vi_VN": "Trò chuyện với Csim",
                    "en_US": "Talking with Csim"
                },
                "mainFunc": "csim"
            }
        },
        "chathook": "chathook",
        "nodeDepends":{
            "node-fetch": ""
        },
        "langMap":{
            "simReturn":{
                "desc": "lang khi bot nhận lệnh csim",
                "vi_VN": "Sim muốn nói: {0}",
                "en_US": "Sim said: {0}",
                "args": {
                    "{0}": {
                        "vi_VN": "Lời sim nói",
                        "en_US": "Sim's speech"
                    }
                }
            },
            "simOn":{
                "desc": "lang khi bot nhận lệnh csim",
                "vi_VN": "Đã kích hoạt Csim ở đây!",
                "en_US": "Csim's on!",
                "args": {
                }
            },
            "simOff":{
                "desc": "lang khi bot nhận lệnh csim",
                "vi_VN": "Đã tắt Csim ở đây!",
                "en_US": "Csim's off!",
                "args": {
                }
            }
        },
        "author": "HerokeyVN",
        "version": "0.0.1"
    }
}

module.exports = {
    csim,
    chathook,
    init
};