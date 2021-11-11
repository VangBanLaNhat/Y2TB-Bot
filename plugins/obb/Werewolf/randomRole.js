function random(min, max){
    return Math.floor(Math.random() * max) + min;
}

function rdrl(data, api, role) {
    var dt = global.data.werewolf[data.threadID];
    var lrule = dt.started.cache;
    for (var id in dt.player) {
        var i = random(0, lrule.role.length-1)
        dt.started.life[id] = {
            vote: false
        }
        dt.started.life[id].role = lrule.role[i]
        dt.started.life[id].faction = lrule.faction[i]
        lrule.role.splice(i, 1); 
        lrule.faction.splice(i, 1); 
    }
}

module.exports = rdrl;