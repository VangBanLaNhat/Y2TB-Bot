function random(min, max){
    return Math.floor(Math.random() * max) + min;
}

function checkwin(data){
    var dt = global.data.werewolf[data.threadID];
    var cww = 0;
    var cvl = 0;
    for (var id in dt.started.life) {
        if(dt.started.life[id].faction == "werewolf") cww += 1
        else if(dt.started.life[id].faction == "village") cvl += 1;
    }
    if(cww == cvl) dt.started.wwwin = true
    else if(cww == 0) dt.started.vlwin = true;
}

async function main(data, api, role) {
    function send(msg){
        api.sendMessage("(Werewolf)"+msg , data.threadID);
    }
    var dt = global.data.werewolf[data.threadID];
    
    dt.started = {
        day: 0,
        vlwin: false,
        wwwin: false,
        ntrwin: false,
        vote: {
            vote:{},
            voting: [],
            beingvote: [],
            sendnoti: false
        },
        death: {},
        deathtoday: {},
        life: {},
        data: {}
    };
    dt.started.role = JSON.stringify(role[Object.keys(dt.player).length]);
    console.log("role", role[Object.keys(dt.player).length])
    dt.started.cache = role[Object.keys(dt.player).length];
    await require("./randomRole.js")(data, api, role);
    var s = 15;
    send(`Bắt đầu trò chơi! Vui lòng kiểm tra Inbox với Bot để xem vai trò của mình. Các bạn có ${s} giây để xem vai trò!\nMẹo: bạn có thể dùng "${global.config.facebook.prefix}ww myrole" để xem lại vai trò của mình.`);
    dt.started.cache = {}
    for(var rl of JSON.parse(dt.started.role).role){
        console.log("testrl",rl);
        !dt.started.cache[rl]?dt.started.cache[rl] = 1 : dt.started.cache[rl] += 1;
    }
    console.log("cache", dt.started.cache)
    for (var id in dt.started.life) {
        require("./sendRole.js")(data, api, id);
    }
    var list = "";
    for(var rl in dt.started.cache){
        list += `- Nhân vật: ${rl}. Số lượng: ${dt.started.cache[rl]}\n`
    }
    await new Promise(x => setTimeout(x, 1000));
    send("Danh sách nhân vật:\n"+ list);
    await new Promise(x => setTimeout(x, s*1000));
    dt.started.day += 1;
    var day = require("./day.js");
    var night = require("./night.js");
    while(!dt.started.vlwin && !dt.started.wwwin && !dt.started.ntrwin){
        checkwin(data);
        if(!dt.started.vlwin && !dt.started.wwwin && !dt.started.ntrwin){
            await day(data, api);
        }
        checkwin(data);
        if(!dt.started.vlwin && !dt.started.wwwin && !dt.started.ntrwin){
            await night(data, api);
        }
        dt.started.day += 1;
    }
    if(dt.started.vlwin) send("Trò chơi kết thúc! Phe dân làng thắng!")
    else if(dt.started.wwwin) send("Trò chơi kết thúc! Phe sói thắng")
    else if(dt.started.ntrwin) send("Trò chơi kết thúc! Phe trung lập thắng")
    var list="";
    var nb = 0;
    for(var id in dt.started.life){
        nb += 1;
        list += `${nb}. Người chơi: ${dt.player[id]}(Còn sống)\n   Vai trò: ${dt.started.life[id].role}\n`
    }
    for(var id in dt.started.death){
        nb += 1;
        list += `${nb}. Người chơi: ${dt.player[id]}(Đã chết)\n   Vai trò: ${dt.started.death[id].role}\n`
    }
    send("Danh sách vai trò:\n"+list)
    delete dt;
}

module.exports = main;