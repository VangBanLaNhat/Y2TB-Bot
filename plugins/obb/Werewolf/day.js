async function day (data, api){
    function send(msg){
        try{
            api.sendMessage("(Werewolf)"+msg , data.threadID);
        } catch {
            console.log("Werewolf", err, msg);
        }
    }
    var dt = global.data.werewolf[data.threadID];
    var time;
    if (dt.started.day == 1){
		time = 1;
		send(`Ngày đầu tiên! Các bạn hãy giới thiệu bản thân mình (Các bạn có ${time} phút).\nChú ý: Không nên để lộ vai trò!`)
    }
    else{
        time = 2;
		send(`Ngày thứ ${dt.started.day}! Các bạn hãy thảo luận và tìm ra (những) con sói đang ẩn thân (Các bạn có ${time} phút).\nChú ý: Không nên để lộ vai trò!`)
    }

    await new Promise(x => setTimeout(x, time*60*1000));
    var list = "";
    for (var id in dt.started.life) {
            dt.started.life[id].vote = true;
            dt.started.vote.voting.push(id);
            list += `-ID: ${dt.started.vote.voting.indexOf(id)}~${dt.player[id]}\n`
        }
    if (dt.started.day != 1){
        time = 1
        send(`Đã hết thời gian thảo luận! Bắt đầu Vote! (Các bạn có ${time} phút để Vote)\n-Các bạn hãy dùng lệnh "${global.config.facebook.prefix}ww vote <ID>" để Vote.`);
        await new Promise(x => setTimeout(x, 500));
        send("Danh sách ID:\n"+list);
        await new Promise(x => setTimeout(x, time*60*1000));
        for (var id in dt.started.life) {
            dt.started.life[id].vote = false;
            dt.started.vote.voting = []
        }
        if (Object.keys(dt.started.vote.vote).length != 0){
            var max = Object.keys(dt.started.vote.vote)[0];
            var sumvote = 0;
            var h = false;
            for (var id in dt.started.vote.vote) {
                if(dt.started.vote.vote[max] < dt.started.vote.vote[id]) max=id;
                sumvote += dt.started.vote.vote[id]
            }
            for (var id in dt.started.vote.vote) {
                if(dt.started.vote.vote[max] == dt.started.vote.vote[id] && max != id) h = true
            }
            if (sumvote < Object.keys(dt.started.vote.vote).length- sumvote) h = true
            if (h) send(`Đã hết thời gian Vote! Hôm nay không có ai bị treo cổ (Hòa)`)
            else {
                dt.started.death[max] = dt.started.life[max]
                dt.started.death[max].reason = "village"
                delete dt.started.life[max]
                send(`Đã hết thời gian Vote! Hôm nay ${dt.player[max]} bị treo cổ với ${dt.started.vote.vote[max]} phiếu bầu.`)
                dt.started.vote.vote = {};
            }
        }else send(`Đã hết thời gian Vote! Hôm nay không có ai bị treo cổ.`);
    }
    dt.started.vote.vote = {};
    await new Promise(x => setTimeout(x, 1000));
}

module.exports = day;