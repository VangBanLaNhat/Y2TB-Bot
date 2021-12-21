function init(){
    return{
        "pluginName": "Badword",
        "pluginMain": "badword.js",
        "commandList": {
			"!!": {
                "help": {
                    "vi_VN": "[Badword]",
                    "en_US": "[Từ cấm]"
                },
                "tag": {
                    "vi_VN": "Cấm / bỏ cấm từ cấm",
                    "en_US": "Ban / unban badwords"
                },
                "mainFunc": "badword"
            }
        },
        "langMap":{
            "getThreadInfoError":{
                "desc": "Lỗi kiểm tra quyền quản trị viên trong nhóm",
                "vi_VN": "Đã có lỗi trong quá trình kiểm tra quyền quản trị viên trong nhóm: {0}",
                "en_US": "An error occurred while checking for admin rights in the group: {0}",
                "args": {
                    "{0}": {
                        "vi_VN": "Lỗi",
                        "en_US": "Error"
                    }
                }
            },
            "noBadword":{
                "desc": "Không có từ cấm",
                "vi_VN": "Từ cấm: không có.",
                "en_US": "Badwords: none.",
                "args": {}
            },
            "banned":{
                "desc": "Cấm 1 hoặc nhiều từ cấm",
                "vi_VN": "Đã cấm từ {0}.",
                "en_US": "Banned the word {0}.",
                "args": {
                    "{0}": {
                        "vi_VN": "Từ cấm",
                        "en_US": "Badword"
                    }
                }
            },
            "unbanned":{
                "desc": "Bỏ cấm 1 hoặc nhiều từ cấm",
                "vi_VN": "Đã bỏ cấm từ {0}.",
                "en_US": "Unbanned the word {0}.",
                "args": {
                    "{0}": {
                        "vi_VN": "Từ cấm",
                        "en_US": "Badword"
                    }
                }
            },
            "badwordList":{
                "desc": "Liệt kê từ cấm",
                "vi_VN": "Số từ cấm: {0}\r\nTừ cấm: {1}",
                "en_US": "Number of badwords: {0}\r\nBadwords: {1}",
                "args": {
                    "{0}": {
                        "vi_VN": "Số từ cấm",
                        "en_US": "Number of badwords"
                    },
                    "{1}": {
                        "vi_VN": "Từ cấm",
                        "en_US": "Badword"
                    }
                }
            },


            "notEnoughParams":{
                "desc": "lang khi bot nhận lệnh devupload mà không đủ tham số",
                "vi_VN": "Thiếu Tham số! hãy cung cấp đủ tên tài khoản, mật khẩu, tên file plugin theo cú pháp {0}devupload <tên tài khoản> <mật khẩu> <tên file plugin>! Nếu chưa có tài khoản hãy liên lạc với Admin VBLN để mở tài khoản.",
                "en_US": "Not enough params! Please provide your username, password and plugin path according to the syntax {0}devupload <username> <password> <plugin path>. If you don't have an account, please talk to VBLN Admins to register.",
                "args": {
                    "{0}": {
                        "vi_VN": "prefix của bot",
                        "en_US": "Bot prefix"
                    }
                }
            }
		},
        "chathook": "chathook",
        "author": "HyTommy",
        "version": "0.0.1"
    }
}
var badword = async function (data, api){
    !global.data.badword ? global.data.badword = {} : "";
    try {
        var threadInfo = await api.getThreadInfo(data.threadID);
        var adminIDs = threadInfo.adminIDs.map(x => x.id.toString());
    }
    catch(err){
        api.sendMessage(global.lang["Badword"].getThreadInfoError[global.config.bot_info.lang].replace("{0}", err), data.threadID);
        return
    }
    !global.data.badword[data.threadID] ? global.data.badword[data.threadID] = {
        badword: [],
        time: {}
    } : "";
    if(data.args.length == 1){
        switch(global.data.badword[data.threadID].badword.length){
            case 0:
                api.sendMessage(global.lang["Badword"].noBadword[global.config.bot_info.lang], data.threadID, data.messageID);
                break
            default:
                api.sendMessage(global.lang["Badword"].badwordList[global.config.bot_info.lang].replace("{0}", global.data.badword[data.threadID].badword.length).replace("{1}", `'${global.data.badword[data.threadID].badword.join("', '")}'`), data.threadID, data.messageID);
                break
        }
        return
    }
    if(data.args.length >= 2){
        if(global.data.badword[data.threadID].badword.indexOf(data.body.toLowerCase()) == -1){
            global.data.badword[data.threadID].badword.push(data.body.toLowerCase());
            api.sendMessage(global.lang["Badword"].banned[global.config.bot_info.lang].replace("{0}", `'${data.body.toLowerCase()}'`), data.threadID, data.messageID);
        }
        else {
            global.data.badword[data.threadID].badword.splice(global.data.badword[data.threadID].badword.indexOf(data.body.toLowerCase()), 1);
            api.sendMessage(global.lang["Badword"].unbanned[global.config.bot_info.lang].replace("{0}", `'${data.body.toLowerCase()}'`), data.threadID, data.messageID);
        }
        return
    }
}

var chathook = async function (data, api){
    !global.data.badword ? global.data.badword = {} : "";
    if(global.data.badword[data.threadID] == undefined) return
    if(global.data.badword[data.threadID].badword.length == 0) return
    console.log(data.type);
    if(data.type == "message" || data.type == "message_reply"){
        api.sendMessage("XD", data.threadID);
    }
}

module.exports = {
	badword,
    chathook,
    init
}