async function main(data, api){
    function send(msg){
        try{
            api.sendMessage("(Werewolf)"+msg , data.threadID);
        } catch {
            console.log("Werewolf", err, msg);
        }
    }
    var dt = global.data.werewolf[data.threadID];
    !dt.started.data.witch ? dt.started.data.witch = {
        tonic: true,
        poison: true
    }:"";
    dt.started.morevote = "";
    for (var id in dt.started.life) {
        dt.started.vote.voting.push(id);
    }
    var list = "";
    for (var i=0; i<dt.started.vote.voting.length; i++){
        var id = dt.started.vote.voting[i];
        list += `-ID: ${i}~${dt.player[id]}\n`;
    }
    var s = 30;
    var gdid;
    for (var id in dt.started.life) {
        if(dt.started.life[id].role == "witch"){
            wid = id;
            dt.started.life[id].vote = true;
            api.sendMessage(`Bạn là phù thủy! Bạn có 1 bình thuốc độc và 1 bình thuốc hồi sinh để cứu người chơi bị giết trong đêm nay, bạn hãy dùng 2 bình thuốc này để cứu hoặc giết 1 người chơi bất kì, hệ thống sẽ cho bạn biết tối nay ai sẽ chết! - Gõ lệnh "${global.config.facebook.prefix}ww vote <ID> <0(Cứu)/1(Giết)>", bạn cũng có thể tự uống thuốc của mình(bạn có ${s} giây).\n-Ví dụ: Bạn muốn cứu người chơi có ID số 1, hãy gõ "${global.config.facebook.prefix}ww vote 1 0"\n-Lưu ý: Mỗi bình chỉ có thể dùng 1 lần duy nhất.`, id);
            await new Promise(x => setTimeout(x, 500));
            api.sendMessage("Danh sách ID:\n"+list, id);
        }
    }
    if (Object.keys(dt.started.deathtoday).length != 0){
        for (var id in dt.started.deathtoday) {
            list += `-${dt.player[id]}\n`
        }
        send(`Đêm nay có ${Object.keys(dt[data.threadID].started.deathtoday).length} người chết, đó là:\n`+list);
    } else send("Đêm nay không có ai chết!");
    await new Promise(x => setTimeout(x, s*1000));
    if(Object.keys(dt.started.vote.vote).length != 0){
        if(dt.started.morevote == "0"){
            var hid = Object.keys(dt.started.vote.vote)[0];
            if(dt.started.deathtoday[hid] != undefined){
                if(dt.started.data.witch.tonic){
                    delete dt.started.deathtoday[hid];
                    dt.started.data.witch.tonic = false
                    api.sendMessage(`Bạn đã cứu ${dt.player[hid]}. Bạn đã hết thuốc hồi sinh`, wid);
                } else api.sendMessage(`Bạn đã hết thuốc hồi sinh!`, wid);
            } else api.sendMessage(`Người chơi ${dt.player[hid]} hôm nay chưa chết!`, wid);
        }else if(dt.started.morevote == "1"){
            if(dt.started.deathtoday[hid] == undefined){
                if(dt.started.data.witch.tonic){
                    dt.started.deathtoday[hid] = "witch";
                    dt.started.data.witch.poison = false
                    api.sendMessage(`Bạn đã giết ${dt.player[hid]}. Bạn đã hết thuốc độc.`, wid);
                } else api.sendMessage(`Bạn đã hết thuốc độc!`, wid);
            } else api.sendMessage(`Người chơi ${dt.player[hid]} hôm nay đã bị người khác giết!`, wid);
        }else{
            api.sendMessage(`Cú pháp không hợp lệ!`, wid);
        }
    } else {
        api.sendMessage(`Đã hết thời gian chờ! Đêm nay bạn không cứu hoặc giết ai.`, wid);
    }
    delete dt.started.morevote;
    dt.started.vote.vote = {}
    dt.started.life[prophetid].vote = false;
    dt.started.vote.voting = []
}

module.exports = main;