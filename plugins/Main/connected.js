function init(){
    return{
        "pluginName": "Connected",
        "pluginMain": "connected.js",
        "commandList": {},
        "langMap":{
            "connect":{
                "desc": "Connected",
                "vi_VN": " Xin chào tôi là {0} - ChatBot Messager. Tôi là 1 sản phẩm của VBLN.\n-Dùng \"{1}help [trang số]\" để xem toàn bộ chức năng",
                "en_US": "Hi my name is {0} - ChatBot Messager.  I am a product of VBLN.\n-Use \"{1}help [page number]\" to see all functions",
                "args": {
                    "{0}":{
                        "vi_VN": "Tên Bot",
                        "en_US": "Bot name"
                    },
                    "{1}":{
                        "vi_VN": "Prefix",
                        "en_US": "Prefix"
                    }
                }
            }
        },
        "chathook": "connect", 
        "author": "HerokeyVN",
        "version": "0.0.1"
    }
}

function connect(data, api){
    if (data.type == "event") {
        if (data.logMessageData.addedParticipants != undefined) {
            var botname = global.config.bot_info.botname;
            var prefix = global.config.facebook.prefix;
            var lang = global.lang.Connected.connect[global.config.bot_info.lang].replace("{0}", botname).replace("{1}", prefix);
            api.sendMessage(lang , data.threadID);
        }
    }
}

module.exports = {
    connect,
    init
}