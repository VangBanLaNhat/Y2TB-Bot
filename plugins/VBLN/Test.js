function init(){
    return{
        "pluginName": "TestBot",
        "pluginMain": "Test.js",
        "commandList": {
            "test": {
                "help": {
                    "vi_VN": "",
                    "en_US": ""
                },
                "tag": {
                    "vi_VN": "Ping Pong",
                    "en_US": "Ping Pong"
                },
                "mainFunc": "test"
            }
        },
        "nodeDepends":{},
        "author": "HerokeyVN",
        "version": "0.0.1"
    }
}

function test(data, api){
    api.sendMessage("Args: ["+data.args+"]" , data.threadID, data.messageID);
    api.sendMessage("Body: "+data.body , data.threadID, data.messageID);
}

module.exports = {
    test,
    init
};