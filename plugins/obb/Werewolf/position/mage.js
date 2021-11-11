async function main (data, api){
    function send(msg){
        try{
            api.sendMessage("(Werewolf)"+msg , data.threadID);
        } catch {
            console.log("Werewolf", err, msg);
        }
    }
    var dt = global.data.werewolf[data.threadID];
    for (var id in dt.started.life) {
        if(dt.started.life[id].faction != "werewolf") dt.started.vote.voting.push(id);
    }
    var list = "";
    for (var i=0; i<dt.started.vote.voting.length; i++){
        var id = dt.started.vote.voting[i];
        list += `-ID: ${i}~${dt.player[id]}\n`;
    }
    var mgid;
    for (var id in dt.started.life) {
        if(dt.started.life[id].role == "mage"){
            mgid = id;
            dt.started.life[id].vote = true;
            api.sendMessage(`Bạn là pháp sư! Bạn hãy dùng năng lực của mình để xem 1 người bất kì có phải là tiên tri không! - Gõ lệnh "${global.config.facebook.prefix}ww vote <ID>" để xem người chơi bất kì (bạn có ${s} giây).`, id);
                await new Promise(x => setTimeout(x, 500));
                api.sendMessage("Danh sách ID:\n"+list, id);
        }
    }
    await new Promise(x => setTimeout(x, s*1000));
    if(Object.keys(dt.started.vote.vote).length != 0){
        if (dt.started.life[Object.keys(dt.started.vote.vote)[0]].role == "prophet"){
            api.sendMessage(`Người chơi ${dt.player[Object.keys(dt.started.vote.vote)[0]]} là tiên tri.`, mgid)
            for(var id in dt.started.life){
                if(dt.started.life[id].faction == "werewolf" && dt.started.life[id].role != "mage") api.sendMessage(`(Werewolf)Pháp sư đã tìm ra người chơi ${dt.player[Object.keys(dt.started.vote.vote)[0]]} là tiên tri.`, id)
            }
        }
        else api.sendMessage(`Người chơi ${dt.player[Object.keys(dt.started.vote.vote)[0]]} không phải là tiên tri.`, mgid);
        dt.started.vote.vote = {}
    } else {
        api.sendMessage(`Đã hết thời gian chờ! Vui lòng chờ đêm sau.`, mgid);
    }
    dt.started.life[mgid].vote = false;
    dt.started.vote.voting = [];
}