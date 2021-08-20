function init(){
    return{
        "pluginName": "Ping",
        "pluginMain": "pong.js",
        "commandList": {
            "ping": {
                "help": {
                    "vi_VN": "",
                    "en_US": ""
                },
                "tag": {
                    "vi_VN": "Ping Pong",
                    "en_US": "Ping Pong"
                },
                "mainFunc": "pong"
            }
        },
        "chathook": "pongch",
        "nodeDepends":{},
        "author": "HerokeyVN",
        "version": "0.0.1"
    }
}

function pong(data, api){
    api.sendMessage("Pong" , data.threadID, data.messageID);
}

function pongch(data, api){
    if(data.body == "ping" || data.body == "Ping"){
        api.sendMessage("Pong" , data.threadID, data.messageID);
    } else if(data.body == "pong" || data.body == "Pong"){
        api.sendMessage("Amen, pong thì để tui nói, nói ping đê" , data.threadID, data.messageID);
    }
}

module.exports = {
    pong,
    pongch,
    init
};