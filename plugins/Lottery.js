function init(){
    return{
        "pluginName": "Lottery",
        "pluginMain": "Lottery.js",
        "commandList": {
			"buyLottery": {
                "help": {
                    "vi_VN": "[Số tờ], [Mã số (gồm 6 chữ số)]",
                    "en_US": "[Number of sheets], [Code (6 digits)]"
                },
                "tag": {
                    "vi_VN": "",
                    "en_US": ""
                },
                "mainFunc": "buyLottery",
                "example": {
                    "vi_VN": "buyLottery 1 123456",
                    "en_US": "buyLottery 1 123456"
                }
            }
        },
        "nodeDepends": {
            "random": ""
            
        },
        "langMap":{
            "buyFalse":{
                "desc": "Lỗi mã vé không đúng định dạng",
                "vi_VN": "Vui lòng nhập mã vé có 6 chữ số!",
                "en_US": "Please enter the 6-digit ticket code!",
                "args": {}
            }
        },
        "loginFunc": "getNumber",
        "author": "HerokeyVN",
        "version": "0.0.1"
    }
}

var config = {
    timeDialHour: 17,
    timeDialMinute: 0
}

function getNumber() {
    let random = require("random");

    !global.data.lottery ? global.data.lottery = {}:"";
    !global.data.lotteryCF ? global.data.lotteryCF = config:"";
    let cf = global.data.lotteryCF;
    let timeDial = new Date();
    timeDial.setHours(cf.timeDialHour);
    timeDial.setMinutes(cf.timeDialMinute);
    if(new Date().getTime() <= timeDial){
        setTimeout(()=>{
            randomDial();
            setInterval(()=>{
                randomDial();
            }, 24*60*60*1000);
        }, timeDial.getTime() - new Date().getTime());
    }else{
        if(new Date(global.data.lottery.dial[9]).getDate() != new Date().getDate() || new Date(global.data.lottery.dial[9]).getMonth() != new Date().getMonth() || new Date(global.data.lottery.dial[9]).getFullYear() != new Date().getFullYear()) randomDial();
        timeDial.setDate((new Date().getDate())+1);
        setTimeout(()=>{
            randomDial();
            setInterval(()=>{
                randomDial();
            }, 24*60*60*1000);
        }, timeDial.getTime() - new Date().getTime());
    }
}

function randomDial() {
    global.data.lottery.dial = [
        random.int(100000, 999999),
        random.int(10000, 99999),
        random.int(10000, 99999),
        [random.int(10000, 99999), random.int(10000, 99999)],
        [random.int(10000, 99999), random.int(10000, 99999), random.int(10000, 99999), random.int(10000, 99999), random.int(10000, 99999), random.int(10000, 99999), random.int(10000, 99999)],
        random.int(1000, 9999),
        [random.int(1000, 9999), random.int(1000, 9999), random.int(1000, 9999)],
        random.int(100, 999),
        random.int(10, 99),
        new Date()
    ]
}

async function buyLottery(data, api){
    !global.data.lottery.user ? global.data.lottery.user = {}:"";

    let random = require("random");

    let args = data.args;
    let count, code;
    if(args.length == 1){
        count = 1;
        code = random.int(100000, 999999);
    }else if(args.length == 2){
        count = !Number(args[1]) ? 1:Number(args[1]);
        code = random.int(100000, 999999);
    }else{
        count = !Number(args[1]) ? 1:Number(args[1]);
        code = !Number(args[2]) ? random.int(100000, 999999):Number(args[2]);
        if(code<100000 && code>999999)
            return api.sendMessage(global.lang["Lottery"].buyFalse[global.config.bot_info.lang][0], data.threadID, data.messageID);
    }
    

}

module.exports = {
    main,
    init,
    getNumber
}