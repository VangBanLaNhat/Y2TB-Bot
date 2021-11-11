async function night(data, api) {
    function send(msg){
        try{
            api.sendMessage("(Werewolf)"+msg , data.threadID);
        } catch {
            console.log("Werewolf", err, msg);
        }
    }
    var dt = global.data.werewolf[data.threadID];
    if (dt.started.day == 1) {
        send("Đêm đầu tiên...(Những người chơi có chức vụ vui lòng chờ đến lượt gọi tên của mình.\n Chú ý: Các bạn hãy chắc chắn Bot có thể gửi tin nhắn Inbox cho mình.");
    } else {
        send(`Đêm thứ ${dt.started.day}...(Những người chơi có chức vụ vui lòng chờ đến lượt gọi tên của mình).\n Chú ý: Các bạn hãy chắc chắn Bot có thể gửi tin nhắn Inbox cho mình.`)
    }
    for (var pos of JSON.parse(dt.started.role).night) {
        try{
            await require(`./position/${pos}.js`)(data, api);
        } catch (e){
            console.error("Werewolf-position", e);
        };
    }
    var list = "";
    if (dt.started.data.guard) if(dt.started.data.guard.guard){
        if (dt.started.deathtoday[dt.started.data.guard.guard]) delete dt.started.deathtoday[dt.started.data.guard.guard];
        delete dt.started.data.guard.guard
    }
    if (Object.keys(dt.started.deathtoday).length != 0){
        for (var id in dt.started.deathtoday) {
            dt.started.death[id] = dt.started.life[id];
            dt.started.death[id].reason = dt.started.deathtoday[id];
            delete dt.started.life[id];
            list += `-${dt.player[id]}\n`
        }
        send(`Trời đã sáng! Đêm qua có ${Object.keys(dt.started.deathtoday).length} người chết, đó là:\n`+list);
    } else send("Trời đã sáng! Đêm qua không có ai chết!");
    dt.started.deathtoday = {}
}

module.exports = night;