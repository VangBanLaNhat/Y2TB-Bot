function random(min, max){
    return Math.floor(Math.random() * max) + min;
}

async function main(data, api) {
    var dt = global.data.werewolf[data.threadID];
    dt.started.vote.sendnoti = false;
    dt.started.vote.vote = {};
    dt.started.vote.voting = [];
    dt.started.vote.beingvote = [];
    var wwlife = 0;
    dt.started.vote.sendnoti = true;
    for (var id in dt.started.life) {
        if(dt.started.life[id].role == "werewolf"){
            wwlife += 1;
            dt.started.vote.beingvote.push(id);
        }else if(dt.started.life[id].faction != "werewolf") dt.started.vote.voting.push(id);
    }
    console.log("ww", dt.started.life, dt.started.vote.voting, dt.started.vote.beingvote);
    
    var list = "";
    for (var i=0; i<dt.started.vote.voting.length; i++){
        var id = dt.started.vote.voting[i];
        list += `-ID: ${i}~${dt.player[id]}\n`;
    }
    for (var id in dt.started.life) {
        if(dt.started.life[id].role == "werewolf"){
            dt.started.life[id].vote = true;
            api.sendMessage(`Các bạn là là Sói. Các bạn hãy thảo luận với nhau (có thể Inbox riêng với nhau để thảo luận hoặc tạo 1 nhóm tạm thời để thảo luận) và chọn ra người sẽ chết đêm nay (gõ lệnh "${global.config.facebook.prefix}ww vote <ID> để chọn người bạn muốn ăn thịt")-Các bạn có ${wwlife*20} giây để bầu chọn!\n-Chú ý: Nếu lượt vote bằng nhau, hệ thống sẽ tự động random để tìm ra người phải chết!`, id);
            await new Promise(x => setTimeout(x, 500));
            api.sendMessage("Danh sách ID:\n"+list, id);
        }
    }
    await new Promise(x => setTimeout(x, wwlife*20*1000));
    
    if(Object.keys(dt.started.vote.vote).length != 0){
        var max = Object.keys(dt.started.vote.vote)[0];
        var equal = [];
        for (var id in dt.started.vote.vote) {
            if(dt.started.vote.vote[max] < dt.started.vote.vote[id]) max=id;
        }
        equal.push(max)
        for (var id in dt.started.vote.vote) {
            if(dt.started.vote.vote[max] == dt.started.vote.vote[id] && max != id) equal.push(id);
        }
        var did;
        if(equal.length == 1){
            dt.started.deathtoday[equal[0]] = "werewolf";
            did = equal[0];
        }
        else {
            var rd = random(0, equal.length-1);
            dt.started.deathtoday[equal[rd]] = "werewolf";
            did = equal[rd];
        }
        for (var id of dt.started.vote.beingvote) {
            dt.started.life[id].vote = false;
            api.sendMessage("(Werewolf)"+`Hôm nay các bạn đã ăn thịt ${dt.player[did]}`, id);
        }
    } else {
        for (var id of dt.started.vote.beingvote) {
            dt.started.life[id].vote = false;
            api.sendMessage("(Werewolf)"+"Hôm nay các bạn ăn chay nên không giết ai hết!", id);
        }
    }
    dt.started.vote.sendnoti = false;
    dt.started.vote.vote = {};
    dt.started.vote.voting = [];
    dt.started.vote.beingvote = [];
    await new Promise(x => setTimeout(x, 1000));
}

module.exports = main;