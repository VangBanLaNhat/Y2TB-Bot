async function main(data, api) {
    var dt = global.data.werewolf[data.threadID];
    if(dt.started.day != 1){
        for (var id in dt.started.life) {
            if(dt.started.life[id].role != "prophet") dt.started.voting.push(id);
        }
        var list = "";
        for (var i=0; i<dt.started.voting.length; i++){
            var id = dt.started.voting[i];
            list += `-ID: ${i}~${dt.player[id]}\n`;
        }
        var s = 20;
        var prophetid;
        for (var id in dt.started.life) {
            if(dt.started.life[id].role == "prophet"){
                prophetid = id;
                dt.started.life[id].vote = true;
                api.sendMessage(`Bạn là tiên tri! Bạn hãy dùng năng lực của mình để xem vai trò của 1 người bất kì! - Gõ lệnh "${global.config.facebook.prefix}ww vote <ID>" để xem vai trò của người chơi bất kì (bạn có ${s} giây).`, id);
                await new Promise(x => setTimeout(x, 500));
                api.sendMessage("Danh sách ID:\n"+list, id);
            }
        }
        await new Promise(x => setTimeout(x, s*1000));
        if(Object.keys(dt.started.vote).length != 0){
            api.sendMessage(`Người chơi ${dt.player[Object.keys(dt.started.vote)[0]]} có vai trò là `+dt.started.life[Object.keys(dt.started.vote)[0]].role, prophetid);
            dt.started.vote = {}
        } else {
            api.sendMessage(`Đã hết thời gian chờ! Vui lòng chờ đêm sau.`, prophetid);
        }
        dt.started.life[prophetid].vote = false;
        dt.started.voting = [];
    } else {
        for (var id in dt.started.life) {
            if(dt.started.life[id].role == "prophet"){
                prophetid = id;
                api.sendMessage(`Bạn là tiên tri! Bạn chỉ có thể xem vai trò của người khác từ đêm thứ 2 trở đi.`, id);
            }
        }
    }
}

module.exports = main;