
function main(data, api, e2ee, adv){
    if(!Number(data.body) && data.body.length != 0){
        moreInfo(data, api, e2ee, adv);
    }
    else{
        help(data, api, e2ee, adv);
    }
}
function help(data, api, e2ee, adv){
    var cmNumber = 10;
    var msg;
    data.body ? msg = data.body : msg = 1;
    msg = Math.trunc(Number(msg));
    var listCommand = [];
    var listHelp = "";
    for (var x in global.plugins){
        for (var y in global.plugins[x].command){
            var dt = {
                "command": y,
                "help": global.plugins[x].command[y].help
            }
            listCommand.push(dt);
        }
    }
    var from = (msg * cmNumber)-cmNumber;
    var to = msg * cmNumber;
    var lang = global.config.bot_info.lang;
    
    
    for (var i = from; i < to; i++) {
        if(listCommand[i] != undefined){
            if (listCommand[i].help[lang] == undefined) {
                var helpCM = listCommand[i].help["en_US"];
            }else{
                var helpCM = listCommand[i].help[lang];
            }
            var cm = `${i+1}. ${global.config.facebook.prefix}${listCommand[i].command} ${helpCM}\n`
            listHelp += cm;
        }
    }
    if (listCommand.length % cmNumber != 0) {
        var crp = Math.trunc(listCommand.length / cmNumber)+1;
    }
    else{
        var crp = listCommand.length / cmNumber
    }
    
    var p = global.lang.Help.pages[global.config.bot_info.lang].replace("{0}", msg).replace("{1}", crp);
    
    var rt = global.lang.Help.listCommand[global.config.bot_info.lang]+"\n"+listHelp+`"${p}"`+"\n"+global.lang.Help.listCommandEnd[global.config.bot_info.lang].replace("{prefix}", global.config.facebook.prefix)
    
    adv.reply(rt);
}

function moreInfo(data, api, e2ee, adv){
    var rt = global.lang.Help.noCommand[global.config.bot_info.lang].replace("{0}", data.body);
    for (var i in global.plugins){
        if (global.plugins[i].command[data.body] != undefined){
            var use = `${global.config.facebook.prefix}${data.body} ${global.plugins[i].command[data.body].help[global.config.bot_info.lang]}`
            var rt = global.lang.Help.commandInfo[global.config.bot_info.lang].replace("{0}", use).replace("{1}", global.plugins[i].command[data.body].tag[global.config.bot_info.lang])
            break;
        }
    }
    adv.reply(rt);
}

module.exports = {
    main,
}
