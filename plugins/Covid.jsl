function init(){
    return{
        "pluginName": "COVID-19",
        "pluginMain": "Covid.js",
        "commandList": {
            "covid": {
                "help": {
                    "vi_VN": "[Tỉnh thành VN]",
                    "en_US": "[Don't support]"
                },
                "tag": {
                    "vi_VN": "Thông tin COVID-19",
                    "en_US": "COVID-19 Information"
                },
                "mainFunc": "main"
            }
        },
        "nodeDepends":{},
        "author": "HerokeyVN",
        "version": "0.0.1"
    }
}

function main(data, api){
    if(data.body){
        mif(data, api);
    }
    
}

async function mif(data, api){
    var fetch = require("node-fetch");
    try{
        var dt = await fetch("https://data.vietnam.opendevelopmentmekong.net/vi/datastore/dump/b15e8f4b-c905-48fb-973e-d412e2759f55?format=json");
        var json = await dt.json();
        var array = json.records;
        var id;
        for (var i = 0; i < array.length; i++) {
            if(array[i][5].toUpperCase() == data.body.toUpperCase()) id = i;
        }
        if(id != undefined){
            api.sendMessage(`Thông tin về COVID-19 ở tỉnh ${array[id][5]}:\n-Tổng số ca nhiễm: ${array[id][6]}\n-Đang điều trị: ${array[id][7]}\n-Bình phục: ${array[id][8]}\n-Tử vong: ${array[id][9]}`, data.threadID, data.messageID);
        } else api.sendMessage(`Tỉnh "${data.body}" không tồn tại!`, data.threadID, data.messageID);
    } catch (e) {
        api.sendMessage(e, data.threadID, data.messageID);
        console.error("COVID-19", e);
    }
}

module.exports = {
    main,
    init
}