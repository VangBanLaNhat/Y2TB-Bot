async function main(data, api){
    var dt = global.data.werewolf[data.threadID];
    !dt.started.data.guard ? dt.started.data.guard = {
        me: true
    }:"";
    for (var id in dt.started.life) {
        if(dt.started.data.guard.me) dt.started.vote.voting.push(id);
        else if(dt.started.life[id].role != "guard") dt.started.vote.voting.push(id);
    }
    var list = "";
    for (var i=0; i<dt.started.vote.voting.length; i++){
        var id = dt.started.vote.voting[i];
        list += `-ID: ${i}~${dt.player[id]}\n`;
    }
    var s = 20;
    var gdid;
    for (var id in dt.started.life) {
        if(dt.started.life[id].role == "prophet"){
            gdid = id;
            dt.started.life[id].vote = true;
            api.sendMessage(`Bạn là bảo vệ! Bạn hãy dùng sức mạnh của mình để bảo vệ 1 người bất kì! - Gõ lệnh "${global.config.facebook.prefix}ww vote <ID>" bảo vệ người chơi bất kì, bạn cũng có thể tự bảo vệ mình 1 lần (bạn có ${s} giây).`, id);
            await new Promise(x => setTimeout(x, 500));
            api.sendMessage("Danh sách ID:\n"+list, id);
        }
    }
    await new Promise(x => setTimeout(x, s*1000));
    if(Object.keys(dt.started.vote.vote).length != 0){
        dt.started.data.guard.guard = Object.keys(dt.started.vote.vote)[0];
        if(Object.keys(dt.started.vote.vote)[0] == gdid) dt.started.data.guard.me = false;
        api.sendMessage(`Đã bảo vệ người chơi ${dt.player[Object.keys(dt.started.vote.vote)[0]]} trong đêm nay!`, gdid);
        dt.started.vote.vote = {}
    } else {
        api.sendMessage(`Đã hết thời gian chờ! Đêm nay bạn không bảo vệ ai.`, gdid);
    }
    dt.started.life[prophetid].vote = false;
    dt.started.vote.voting = []
}