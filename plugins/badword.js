function init(){
    return{
        "pluginName": "Hy_Badword",
        "pluginMain": "badword.js",
        "commandList": {
			"!!on": {
                "help": {
                    "vi_VN": "",
                    "en_US": ""
                },
                "tag": {
                    "vi_VN": "Bật chế độ kiểm tra từ xấu ở nhóm",
                    "en_US": "Turn on the badword checker in the group"
                },
                "mainFunc": "badwordon"
            },
            "!!off": {
                "help": {
                    "vi_VN": "",
                    "en_US": ""
                },
                "tag": {
                    "vi_VN": "Tắt chế độ kiểm tra từ xấu ở nhóm",
                    "en_US": "Turn off the badword checker in the group"
                },
                "mainFunc": "badwordoff"
            },
            "!!reset": {
                "help": {
                    "vi_VN": "",
                    "en_US": ""
                },
                "tag": {
                    "vi_VN": "Đặt lại số lần cảnh báo của nhóm",
                    "en_US": "Badword alarms reset in the group"
                },
                "mainFunc": "badwordreset"
            },
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
            "noPermission":{
                "desc": "Không phải là quản trị viên của nhóm",
                "vi_VN": "Bạn không phải là quản trị viên của nhóm nên không thể dùng lệnh này!",
                "en_US": "You're not the admins of this group so you can't use this conmmand!",
                "args": {}
            },
            "badwordOn":{
                "desc": "Bật chế độ kiểm tra từ xấu ở nhóm",
                "vi_VN": "Đã bật kiểm tra từ xấu cho nhóm! Khi có thành viên nói từ xấu đã cài đặt trước, bot sẽ cảnh báo.\n\nGõ badword để biết thêm thông tin!",
                "en_US": "Enabled badword checking for this group! When a member says a pre-set bad word, the bot will warn.\n\nType badword for more info!",
                "args": {}
            },
            "badwordOff":{
                "desc": "Tắt chế độ kiểm tra từ xấu ở nhóm",
                "vi_VN": "Đã tắt kiểm tra từ xấu cho nhóm!\n\nGõ badword để biết thêm thông tin!",
                "en_US": "Disable badword checking for this group!\n\nType badword for more info!",
                "args": {}
            },
            "noPermission":{
                "desc": "Không phải là quản trị viên của nhóm",
                "vi_VN": "Bạn không phải là quản trị viên của nhóm nên không thể dùng lệnh này!",
                "en_US": "You're not the admins of this group so you can't use this conmmand!",
                "args": {}
            },
            "noBadword":{
                "desc": "Không có từ cấm",
                "vi_VN": "Từ cấm: không có.\n\nGõ badword để biết thêm thông tin!",
                "en_US": "Badwords: none.\n\nType badword for more info!",
                "args": {}
            },
            "banned":{
                "desc": "Cấm 1 hoặc nhiều từ cấm",
                "vi_VN": "Đã cấm từ {0}.\n\nGõ badword để biết thêm thông tin!",
                "en_US": "Banned the word {0}.\n\nType badword for more info!",
                "args": {
                    "{0}": {
                        "vi_VN": "Từ cấm",
                        "en_US": "Badword"
                    }
                }
            },
            "unbanned":{
                "desc": "Bỏ cấm 1 hoặc nhiều từ cấm",
                "vi_VN": "Đã bỏ cấm từ {0}.\n\nGõ badword để biết thêm thông tin!",
                "en_US": "Unbanned the word {0}.\n\nType badword for more info!",
                "args": {
                    "{0}": {
                        "vi_VN": "Từ cấm",
                        "en_US": "Badword"
                    }
                }
            },
            "badwordReset":{
                "desc": "Đặt lại số lần cảnh báo của nhóm",
                "vi_VN": "Đã đặt lại số lần cảnh báo của nhóm.\n\nGõ badword để biết thêm thông tin!",
                "en_US": "Badword alarms reset.\n\nType badword for more info!",
                "args": {}
            },
            "badwordList":{
                "desc": "Liệt kê từ cấm",
                "vi_VN": "Số từ cấm: {0}\r\nTừ cấm: {1}\n\nGõ badword để biết thêm thông tin!",
                "en_US": "Number of badwords: {0}\r\nBadwords: {1}\n\nType badword for more info!",
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
            "badwordAlert":{
                "desc": "Cảnh báo từ cấm",
                "vi_VN": "CẢNH BÁO TỪ CẤM!!\nBạn đã nói từ cấm lần thứ {0}\nTừ cấm: {1}\nTrong câu: {2}\n\nGõ badword để biết thêm thông tin!",
                "en_US": "BADWORD ALERT!!\nYou said the badword {0} time(s)\nBadword: {1}\nSentense: {2}\n\nType badword for more info!",
                "args": {
                    "{0}": {
                        "vi_VN": "Số lần nói từ cấm",
                        "en_US": "Number of times saying badwords"
                    },
                    "{1}": {
                        "vi_VN": "Từ cấm",
                        "en_US": "Badword"
                    },
                    "{2}": {
                        "vi_VN": "Câu có từ cấm",
                        "en_US": "sentense include the badword"
                    }
                }
            }
		},
        "obb": "Hy_Badword",
        "chathook": "chathook",
        "author": "HyTommy",
        "version": "0.0.1"
    }
}
var badwordoff = async function(data, api){
    !global.data.badword ? global.data.badword = {
        "active": []
    } : "";
    try {
        var threadInfo = await api.getThreadInfo(data.threadID);
        var adminIDs = threadInfo.adminIDs.map(x => x.id.toString());
    }
    catch(err){
        api.sendMessage(global.lang["Hy_Badword"].getThreadInfoError[global.config.bot_info.lang].replace("{0}", err), data.threadID);
        return
    }
    if(adminIDs.indexOf(data.senderID) == -1){
        api.sendMessage(global.lang["Hy_Badword"].noPermission[global.config.bot_info.lang], data.threadID);
        return
    }
    global.data.badword.active.indexOf(data.threadID) != -1 ? global.data.badword.active.splice(global.data.badword.active.indexOf(data.threadID), 1) : "";
    api.sendMessage(global.lang["Hy_Badword"].badwordOff[global.config.bot_info.lang], data.threadID, data.messageID);
}
var badwordreset = async function(data, api){
    !global.data.badword ? global.data.badword = {
        "active": []
    } : "";
    try {
        var threadInfo = await api.getThreadInfo(data.threadID);
        var adminIDs = threadInfo.adminIDs.map(x => x.id.toString());
    }
    catch(err){
        api.sendMessage(global.lang["Hy_Badword"].getThreadInfoError[global.config.bot_info.lang].replace("{0}", err), data.threadID);
        return
    }
    if(adminIDs.indexOf(data.senderID) == -1){
        api.sendMessage(global.lang["Hy_Badword"].noPermission[global.config.bot_info.lang], data.threadID);
        return
    }
    
    if(global.data.badword[data.threadID] != undefined) global.data.badword[data.threadID].time != undefined ? delete global.data.badword[data.threadID].time : "";
    !global.data.badword[data.threadID].time ? global.data.badword[data.threadID].time = {} : "";
    api.sendMessage(global.lang["Hy_Badword"].badwordReset[global.config.bot_info.lang], data.threadID, data.messageID);
}
var badwordon = async function(data, api){
    !global.data.badword ? global.data.badword = {
        "active": []
    } : "";
    try {
        var threadInfo = await api.getThreadInfo(data.threadID);
        var adminIDs = threadInfo.adminIDs.map(x => x.id.toString());
    }
    catch(err){
        api.sendMessage(global.lang["Hy_Badword"].getThreadInfoError[global.config.bot_info.lang].replace("{0}", err), data.threadID);
        return
    }
    if(adminIDs.indexOf(data.senderID) == -1){
        api.sendMessage(global.lang["Hy_Badword"].noPermission[global.config.bot_info.lang], data.threadID);
        return
    }
    global.data.badword.active.indexOf(data.threadID) == -1 ? global.data.badword.active.push(data.threadID) : "";
    api.sendMessage(global.lang["Hy_Badword"].badwordOn[global.config.bot_info.lang], data.threadID, data.messageID);
}
var badword = async function (data, api){
    !global.data.badword ? global.data.badword = {
        "active": []
    } : "";
    try {
        var threadInfo = await api.getThreadInfo(data.threadID);
        var adminIDs = threadInfo.adminIDs.map(x => x.id.toString());
    }
    catch(err){
        api.sendMessage(global.lang["Hy_Badword"].getThreadInfoError[global.config.bot_info.lang].replace("{0}", err), data.threadID);
        return
    }
    !global.data.badword[data.threadID] ? global.data.badword[data.threadID] = {
        badword: [],
        time: {}
    } : "";
    if(adminIDs.indexOf(data.senderID) != -1){
        if(data.args.length == 1){
            switch(global.data.badword[data.threadID].badword.length){
                case 0:
                    api.sendMessage(global.lang["Hy_Badword"].noBadword[global.config.bot_info.lang], data.threadID, data.messageID);
                    break
                default:
                    api.sendMessage(global.lang["Hy_Badword"].badwordList[global.config.bot_info.lang].replace("{0}", global.data.badword[data.threadID].badword.length).replace("{1}", `'${global.data.badword[data.threadID].badword.join("', '")}'`), data.threadID, data.messageID);
                    break
            }
            return
        }
        if(data.args.length >= 2){
            if(global.data.badword[data.threadID].badword.indexOf(data.body.toLowerCase()) == -1){
                global.data.badword[data.threadID].badword.push(data.body.toLowerCase());
                api.sendMessage(global.lang["Hy_Badword"].banned[global.config.bot_info.lang].replace("{0}", `'${data.body.toLowerCase()}'`), data.threadID, data.messageID);
                global.data.badword.active.indexOf(data.threadID) == -1 ? global.data.badword.active.push(data.threadID) : "";
            }
            else {
                global.data.badword[data.threadID].badword.splice(global.data.badword[data.threadID].badword.indexOf(data.body.toLowerCase()), 1);
                api.sendMessage(global.lang["Hy_Badword"].unbanned[global.config.bot_info.lang].replace("{0}", `'${data.body.toLowerCase()}'`), data.threadID, data.messageID);
                global.data.badword.active.indexOf(data.threadID) != -1 ? (global.data.badword[data.threadID].badword.length == 0 ? global.data.badword.active.splice(global.data.badword.active.indexOf(data.threadID), 1) : "") : "";
            }
            return
        }
    }
    else {

    }
}

var chathook = async function (data, api){
    !global.data.badword ? global.data.badword = {
        "active": []
    } : "";
    if(data.body != undefined && data.body != ""){
        if(global.data.badword.active.indexOf(data.threadID) == -1) return
        if(global.data.badword[data.threadID] == undefined) return
        if(global.data.badword[data.threadID].badword.length == 0) return
        if(data.senderID == api.getCurrentUserID()) return
        if(data.body.indexOf(`${global.config.facebook.prefix}!!`) == 0) return
        var badword = [];
        global.data.badword[data.threadID].badword.forEach(x => {
            var text = data.body;
            if(text.toLowerCase().indexOf(x) != -1){
                badword.push(x);
            }
        });
        if(badword.length == 0) return
        !global.data.badword[data.threadID].time[data.senderID] ? global.data.badword[data.threadID].time[data.senderID] = 1 : global.data.badword[data.threadID].time[data.senderID]++;
        api.sendMessage(global.lang["Hy_Badword"].badwordAlert[global.config.bot_info.lang].replace("{0}", global.data.badword[data.threadID].time[data.senderID]).replace("{1}", `'${badword.join("', '")}'`).replace("{2}", `'${data.body}'`), data.threadID, data.messageID);
    }
}

module.exports = {
    badwordon,
    badwordoff,
    badwordreset,
	badword,
    chathook,
    init
}