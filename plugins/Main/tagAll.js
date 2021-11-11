function init(){
    return{
        "pluginName": "TagAll",
        "pluginMain": "tagAll.js",
        "commandList": {},
        "chathook": "all",
        "author": "HerokeyVN",
        "version": "0.0.1"
    }
}

function all(data, api){
    if(data.type=="message" && (data.body.indexOf("@everyone")!= -1 || data.body.indexOf("@all")!= -1)){
        api.getThreadInfo(data.threadID, (err, info) => {
        if (err) return api.sendMessage(('error'), data.threadID, data.messageID);
        var ids = info.participantIDs;
        ids.splice(ids.indexOf(api.getCurrentUserID()), 1);
        var body = '', mentions = [];
        for (let i = 0; i < ids.length; i++) {
            if (i == body.length) body += '@';
            mentions.push({
                tag: body[i],
                id: ids[i],
                fromIndex: i
            });
        }
        api.sendMessage({ body, mentions }, data.threadID, data.messageID);
        });
    }
}
module.exports = {
    all,
    init
};