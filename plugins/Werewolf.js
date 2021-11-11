function init(){
    !global.data.werewolf ? global.data.werewolf = {} : global.data.werewolf = {}
    return{
        "pluginName": "Werewolf",
        "pluginMain": "Werewolf.js",
        "commandList": {
            "ww": {
                "help": {
                    "vi_VN": "<create>",
                    "en_US": "<create>"
                },
                "tag": {
                    "vi_VN": "Trò chơi ma sói",
                    "en_US": "Werewolf game"
                },
                "mainFunc": "main",
            }
        },
        "author": "HerokeyVN",
        "version": "0.0.1"
    }
}

function main(data, api){
    var check = false;
    for (var thid in global.data.werewolf) {
        if (global.data.werewolf[thid].player[data.senderID] && thid != data.threadID) check = true
    }
    if(data.isGroup){
        if (!check){
            switch (data.args[1]) {
                case 'create':
                    create(data, api);
                    break;
                case 'join':
                    join(data, api);
                    break;
                case 'out':
                    out(data, api);
                    break;
                case 'kick':
                    kick(data, api);
                    break;
                case 'unban':
                    unban(data, api);
                    break;
                case 'start':
                    start(data, api);
                    break;
                case 'myrole':
                    myrole(data, api);
                    break;
                case 'vote':
                    vote(data, api);
                    break;
                default:
                    if (data.type == "message") api.sendMessage(`${global.config.facebook.prefix}ww <create>`, data.threadID, data.messageID);
                    break;
            }
        } else api.sendMessage(`Không thể sử dụng lệnh này! Bạn đã tham gia phòng chơi khác!`, data.threadID, data.messageID);
    } else {
        switch (data.args[1]) {
            case 'vote':
                vote(data, api);
                break;
            default:
                api.sendMessage(`Groups only!`, data.threadID, data.messageID);
                break;
        }
    }
}

async function create(data, api){
    var dt = global.data.werewolf;
    if(!dt[data.threadID]){
        var uinfo = await api.getUserInfo(data.senderID);
        var nameuser = uinfo[data.senderID].name;
        dt[data.threadID] = {
            "admin": data.senderID,
            "player": {},
            "banned":{}
        }
        dt[data.threadID].player[data.senderID] = nameuser
        var min = 10;
        var rt = `Đã tạo phòng chơi ở groups này. Bạn có ID là ${Object.keys(dt[data.threadID].player).indexOf(data.senderID)}. Sau đây là 1 số lệnh trong phòng chơi:\n1. ${global.config.facebook.prefix}ww join (Tham gia phòng chơi này)\n2. ${global.config.facebook.prefix}ww kick <ID>(Kick thành viên)\n3. ${global.config.facebook.prefix}ww unban <ID> (Cho phép thành viên bị kick vào lại phòng)\n4. ${global.config.facebook.prefix}ww out (Thoát phòng chơi)\n5. ${global.config.facebook.prefix}ww start (Bắt đầu trò chơi)\n6. ${global.config.facebook.prefix}ww myrole(Xem lại vai trò của mình)\nSau ${min} phút trò chơi chưa được bắt đầu phòng chơi sẽ bị xóa!`
        api.sendMessage(rt, data.threadID, data.messageID);
        setTimeout(function() {
            var dt = global.data.werewolf;
            if (dt[data.threadID]){
                if(!dt[data.threadID].started){
                    delete dt[data.threadID];
                    api.sendMessage(`Đã xóa phòng chơi!`, data.threadID, data.messageID);
                }
            }
        }, min*60*1000);
    } else {
        api.sendMessage(`Phòng chơi đã được tạo ở group này!`, data.threadID, data.messageID);
    }
}

async function join(data, api){
    var dt = global.data.werewolf;
    if(dt[data.threadID]){
        if(!dt[data.threadID].started){
            if (!dt[data.threadID].player[data.senderID]) {
                if (!dt[data.threadID].banned[data.senderID]){
                    var uinfo = await api.getUserInfo(data.senderID);
                    var nameuser = uinfo[data.senderID].name;
                    dt[data.threadID].player[data.senderID] = nameuser;
                    
                    var rt = `Đã tham gia phòng chơi của ${dt[data.threadID].player[dt[data.threadID].admin]}. Bạn có ID là ${Object.keys(dt[data.threadID].player).indexOf(data.senderID)}. Hiện phòng chơi này có ${Object.keys(dt[data.threadID].player).length} người chơi.`
                    api.sendMessage(rt, data.threadID, data.messageID);
                } else api.sendMessage(`Bạn đã bị kick khỏi phòng chơi này! Vui lòng chờ lần chơi tiếp theo hoặc chủ phòng cho phép bạn quay lại.`, data.threadID, data.messageID);
            } else api.sendMessage(`Bạn đã tham gia phòng chơi này!`, data.threadID, data.messageID);
        } else api.sendMessage(`Trò chơi đang diễn ra!`, data.threadID, data.messageID);
    } else api.sendMessage(`Phòng chơi chưa được tạo ở group này! Vui lòng gõ "${global.config.facebook.prefix}ww create" để tạo phòng chơi ở group này.`, data.threadID, data.messageID);
}

function out(data, api){
    var dt = global.data.werewolf;
    if(dt[data.threadID]){
        if(!dt[data.threadID].started){
            if (dt[data.threadID].player[data.senderID]) {
                if(dt[data.threadID].admin == data.senderID){
                    if(Object.keys(dt[data.threadID].player).length>1){
                        delete dt[data.threadID].player[data.senderID];
                        var newadmin = Object.keys(dt[data.threadID].player)[0]
                        dt[data.threadID].admin = newadmin;
                        var rt = `Chủ phòng thoát phòng chơi nên đã chuyển quyền chủ phòng cho ${dt[data.threadID].player[newadmin]}. Hiện phòng chơi này còn ${Object.keys(dt[data.threadID].player).length} người chơi.`
                        api.sendMessage(rt, data.threadID, data.messageID);
                    } else {
                        delete dt[data.threadID]
                        api.sendMessage("Vì chủ phòng đã thoát nên hệ thống đã xóa phòng chơi", data.threadID, data.messageID);
                    }
                    
                } else {
                    delete dt[data.threadID].player[data.senderID];
                    var rt = `Đã thoát phòng chơi. Hiện phòng chơi này còn ${Object.keys(dt[data.threadID].player).length} người chơi.`
                    api.sendMessage(rt, data.threadID, data.messageID);
                }
            } else api.sendMessage(`Bạn chưa tham gia phòng chơi này! Vui lòng gõ "${global.config.facebook.prefix}ww join" để tham gia!`, data.threadID, data.messageID);
        } else api.sendMessage(`Trò chơi đang diễn ra!`, data.threadID, data.messageID);
    } else api.sendMessage(`Phòng chơi chưa được tạo ở group này! Vui lòng gõ "${global.config.facebook.prefix}ww create" để tạo phòng chơi ở group này.`, data.threadID, data.messageID);
}

function kick(data, api){
    var dt = global.data.werewolf;
    if(dt[data.threadID]){
        if(!dt[data.threadID].started){
            if (dt[data.threadID].player[data.senderID]) {
                if(dt[data.threadID].admin == data.senderID){
                    var kickid = Object.keys(dt[data.threadID].player)[data.args[2]];
                    if(data.senderID == kickid){
                        api.sendMessage("Bạn không thể kick chính mình", data.threadID, data.messageID);
                    } else if (!dt[data.threadID].player[kickid]){
                        var rt = "ID không tồn tại! Danh sách ID:\n"
                        var id = 0;
                        for (var i in dt[data.threadID].player) {
                            rt += `ID: ${id} - ${dt[data.threadID].player[i]}`
                            if (id==0) rt+= "(Chủ phòng)\n"
                            else rt += "\n"
                            id += 1;
                        }
                        api.sendMessage(rt, data.threadID, data.messageID);
                    } else {
                        dt[data.threadID].banned[kickid] = dt[data.threadID].player[kickid];
                        delete dt[data.threadID].player[kickid];
                    var rt = `Đã xóa người chơi có ID ${data.args[2]}. Hiện phòng chơi này còn ${Object.keys(dt[data.threadID].player).length} người chơi. Để người chơi này có thể tham gia trở lại, vui lòng dùng lệnh "${global.config.facebook.prefix}ww unban ${Object.keys(dt[data.threadID].banned).length-1}"`
                    api.sendMessage(rt, data.threadID, data.messageID);
                    }
                } else {
                    api.sendMessage("Chỉ chủ phòng mới có quyền sử dụng lệnh này!", data.threadID, data.messageID);
                }
            } else api.sendMessage(`Bạn chưa tham gia phòng chơi này! Vui lòng gõ "${global.config.facebook.prefix}ww join" để tham gia!`, data.threadID, data.messageID);
        } else api.sendMessage(`Trò chơi đang diễn ra!`, data.threadID, data.messageID);
    } else api.sendMessage(`Phòng chơi chưa được tạo ở group này! Vui lòng gõ "${global.config.facebook.prefix}ww create" để tạo phòng chơi ở group này.`, data.threadID, data.messageID);
}

function unban(data, api){
    var dt = global.data.werewolf;
    if(dt[data.threadID]){
        if (dt[data.threadID].player[data.senderID]){
            if(dt[data.threadID].admin == data.senderID){
                var unid = Object.keys(dt[data.threadID].banned)[data.args[2]];
                    if (!dt[data.threadID].banned[unid]){
                        var rt = "ID này không tồn tại trong danh sách ban! Danh sách ban ID:\n"
                        var id = 0;
                        for (var i in dt[data.threadID].banned) {
                            rt += `ID: ${id} - ${dt[data.threadID].banned[i]}\n`
                        }
                        api.sendMessage(rt, data.threadID, data.messageID);
                    } else {
                        delete dt[data.threadID].banned[unid];
                    var rt = `Đã Unban người chơi có ID ${data.args[2]}.`
                    api.sendMessage(rt, data.threadID, data.messageID);
                    }
            } else {
                api.sendMessage("Chỉ chủ phòng mới có quyền sử dụng lệnh này!", data.threadID, data.messageID);
            }
        } else api.sendMessage(`Bạn chưa tham gia phòng chơi này! Vui lòng gõ "${global.config.facebook.prefix}ww join" để tham gia.`, data.threadID, data.messageID);
    } else api.sendMessage(`Phòng chơi chưa được tạo ở group này! Vui lòng gõ "${global.config.facebook.prefix}ww create" để tạo phòng chơi ở group này.`, data.threadID, data.messageID);
}

async function start(data, api){
    var fs = require("fs");
    var path = require("path");
    var dt = global.data.werewolf;
    if(dt[data.threadID]){
        if(!dt[data.threadID].started){
            if(data.senderID == dt[data.threadID].admin){
                var role = JSON.parse(fs.readFileSync(path.join(__dirname, "obb", "Werewolf", "role.json"), {encoding: "utf8"}));
                var min = Object.keys(role)[0];
                var max = Object.keys(role)[Object.keys(role).length-1];
                var lu = Object.keys(dt[data.threadID].player).length;
                if (min > lu) api.sendMessage(`Không thể bắt đầu. Cần thêm ${min-lu} người chơi!`, data.threadID, data.messageID)
                else if (lu > max) api.sendMessage(`Không thể bắt đầu. Cần bớt ${lu - max} người chơi!`, data.threadID, data.messageID)
                else {
                    require("./obb/Werewolf/started.js")(data, api, role);
                }
            } else api.sendMessage(`Chỉ chủ phòng mới dùng được lệnh này!`, data.threadID, data.messageID);
        } else api.sendMessage(`Trò chơi hiện đã bắt đầu!`, data.threadID, data.messageID);
    } else api.sendMessage(`Phòng chơi chưa được tạo ở group này! Vui lòng gõ "${global.config.facebook.prefix}ww create" để tạo phòng chơi ở group này.`, data.threadID, data.messageID);
}

function myrole(data, api){
    var dt = global.data.werewolf;
    if(dt[data.threadID]){
        if(dt[data.threadID].started){
            if(dt[data.threadID].started.life[data.senderID] || dt[data.threadID].started.death[data.senderID]){
                api.sendMessage("Đã gửi role của bạn, vui lòng check Inbox với Bot để xem role!", data.threadID);
                require("./obb/Werewolf/sendRole.js")(data, api, data.senderID);
            } else api.sendMessage("Bạn không có trong phòng chơi này!", data.threadID);
        } else api.sendMessage("Trò chơi chưa được bắt đầu!", data.threadID);
    } else api.sendMessage(`Phòng chơi chưa được tạo ở group này! Vui lòng gõ "${global.config.facebook.prefix}ww create" để tạo phòng chơi ở group này.`, data.threadID, data.messageID);
}

function vote(data, api){
    var dt = global.data.werewolf;
    if(data.isGroup){
        if(dt[data.threadID]){
            if(dt[data.threadID].started){
                if(dt[data.threadID].started.life[data.senderID] || dt[data.threadID].started.death[data.senderID]){
                    if (dt[data.threadID].started.life[data.senderID] && dt[data.threadID].started.life[data.senderID].vote) {
                        if (dt[data.threadID].started.voting[data.args[2]]) {
                            !dt[data.threadID].started.vote[dt[data.threadID].started.voting[data.args[2]]]?dt[data.threadID].started.vote[dt[data.threadID].started.voting[data.args[2]]] = 1 : dt[data.threadID].started.vote[dt[data.threadID].started.voting[data.args[2]]] += 1;
                            dt[data.threadID].started.life[data.senderID].vote = false;
                            if(dt[data.threadID].started.morevote) dt[data.threadID].started.morevote = data.args[3];
                            api.sendMessage(`Đã Vote cho ${dt[data.threadID].player[dt[data.threadID].started.voting[data.args[2]]]}. Hiện người chơi này có ${dt[data.threadID].started.vote[dt[data.threadID].started.voting[data.args[2]]]} phiếu bầu.`, data.threadID, data.messageID);
                        } else {
                            var list = "";
                            for (var i = 0; i < dt[data.threadID].started.voting.length; i++) {
                                list += `-ID: ${i}~${dt[data.threadID].player[dt[data.threadID].started.voting[i]]}\n`
                            }
                            api.sendMessage(`ID không tồn tại! Danh sách ID người chơi bạn có thể Vote:\n`+list, data.threadID,  data.messageID);
                        }
                    } else api.sendMessage("Chưa đến lượt Vote của bạn!", data.threadID, data.messageID);
                } else api.sendMessage("Bạn không có trong phòng chơi này!", data.threadID, data.messageID);
            } else api.sendMessage("Trò chơi chưa được bắt đầu!", data.threadID, data.messageID);
        } else api.sendMessage(`Phòng chơi chưa được tạo ở group này! Vui lòng gõ "${global.config.facebook.prefix}ww create" để tạo phòng chơi ở group này.`, data.threadID, data.messageID);
    }
    else{
        var threadID;
        for (var thid in dt) {
            if(dt[thid].player[data.senderID]) threadID = thid;
        }
        if(threadID){
            if (dt[threadID].started) {
                if (dt[threadID].started.life[data.senderID].vote && dt[threadID].started.life[data.senderID].vote) {
                    if (dt[threadID].started.voting[data.args[2]]){
                        !dt[threadID].started.vote[dt[threadID].started.voting[data.args[2]]]?dt[threadID].started.vote[dt[threadID].started.voting[data.args[2]]] = 1 : dt[threadID].started.vote[dt[threadID].started.voting[data.args[2]]] += 1;
                        dt[threadID].started.life[data.senderID].vote = false;
                        if(dt[threadID].started.morevote) dt[threadID].started.morevote = data.args[3];
                        api.sendMessage(`Đã Vote cho ${dt[threadID].player[dt[threadID].started.voting[data.args[2]]]}. Hiện người chơi này có ${dt[threadID].started.vote[dt[threadID].started.voting[data.args[2]]]} phiếu bầu.`, data.threadID, data.messageID);
                        if(dt[threadID].started.sendnoti){
                            for(var id of dt[threadID].started.beingvote) {
                                if(id != data.senderID) api.sendMessage(`(Werewolf) ${dt[threadID].player[data.senderID]} đã Vote cho ${dt[threadID].player[dt[threadID].started.voting[data.args[2]]]}. Hiện người chơi này có ${dt[threadID].started.vote[dt[threadID].started.voting[data.args[2]]]} phiếu bầu.`, data.threadID, data.messageID);
                            }
                        }
                    } else {
                        var list = "";
                        for (var i = 0; i < dt[threadID].started.voting.length; i++) {
                            list += `-ID: ${i}~${dt[threadID].player[dt[threadID].started.voting[i]]}\n`
                        }
                        api.sendMessage(`ID không tồn tại! Danh sách ID người chơi bạn có thể Vote:\n`+list, data.threadID,  data.messageID);
                    }
                } else api.sendMessage("Chưa đến lượt Vote của bạn!", data.threadID, data.messageID);
            } else api.sendMessage("Trò chơi chưa được bắt đầu ở phòng chơi!", data.threadID, data.messageID);
        } else api.sendMessage("Bạn chưa tham gia phòng chơi nào!", data.threadID, data.messageID);
    }
}
module.exports = {
    main,
    init
};