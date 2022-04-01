function init(){
    !global.data.uno ? global.data.uno = {
        point: {},
    } : "";
    delete global.data.unoroom;
    global.data.unoroom = {};
    return{
        "pluginName": "Hy_Uno",
        "pluginMain": "uno.js",
        "commandList": {
			"uno": {
                "help": {
                    "vi_VN": "",
                    "en_US": ""
                },
                "tag": {
                    "vi_VN": "Hướng dẫn chơi Uno",
                    "en_US": "How to play Uno"
                },
                "mainFunc": "uno"
            },
            "unocreate": {
                "help": {
                    "vi_VN": "",
                    "en_US": ""
                },
                "tag": {
                    "vi_VN": "Tạo phòng chơi Uno",
                    "en_US": "Create Uno's room"
                },
                "mainFunc": "unocreate"
            },
            "unosolo": {
                "help": {
                    "vi_VN": "",
                    "en_US": ""
                },
                "tag": {
                    "vi_VN": "Chơi Uno solo với bot",
                    "en_US": "Solo Uno with a bot"
                },
                "mainFunc": "unosolo"
            },
            "unoroom": {
                "help": {
                    "vi_VN": "[ start || config ]",
                    "en_US": "[ start || config ]"
                },
                "tag": {
                    "vi_VN": "Hướng dẫn cài đặt phòng chơi Uno",
                    "en_US": "How to config Uno's room"
                },
                "mainFunc": "unoroom"
            }
        },
        "langMap":{
            "unoHelp":{
                "desc": "Hướng dẫn chơi Uno",
                "vi_VN": 'HƯỚNG DẪN CHƠI UNO\n*Tất cả lệnh Uno chỉ hoạt động trong Inbox của bot!*\n\n"{0}uno": Hướng dẫn\n\nTẠO PHÒNG:\n"{0}unocreate": Tạo phòng chơi,\n"{0}unoroom": Cài đặt phòng chơi,\n"{0}unosolo: tạo phòng solo với bot\n\n- Nếu có lỗi hoặc óng góp ý kiến hãy liên hệ "fb .com/HyTommyC3C", cảm ơn ^^',
                "en_US": 'HOW TO PLAY UNO\n*All Uno commands only work in bot Inbox!*\n\n"{0}uno": Guide\n\nCREATE ROOM:\n"{0}unocreate": Create room,\n"{0}unoroom": Room config,\n"{0}unosolo: Solo with bot\n\n- If there are errors or suggestions, please contact "fb .com/HyTommyC3C", thanks ^^',
                "args": {
                    "{0}": {
                        "vi_VN": "Prefix",
                        "en_US": "Prefix"
                    }
                }
            },
            "inboxOnly":{
                "desc": "Chỉ hoạt động trong inbox của bot",
                "vi_VN": "Vui lòng sử dụng lệnh này trong inbox của bot!",
                "en_US": "Please use this command in bot's inbox!",
                "args": {}
            }
		},
        "obb": "Hy_Uno",
        "chathook": "chathook",
        "author": "HyTommy",
        "version": "0.0.1"
    }
}

function uno(data, api) {
    api.sendMessage(global.lang["Hy_Uno"].unoHelp[global.config.bot_info.lang], data.threadID, data.messageID);
}


function unocreate(data, api){
    if(data.isGroup) return api.sendMessage(global.lang["Hy_Uno"].inboxOnly[global.config.bot_info.lang], data.threadID, data.messageID)
    
}
module.exports = {}