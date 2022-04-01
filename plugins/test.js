function init(){
    }
    return{
        "pluginName": "test",
        "pluginMain": "test.js",
        "commandList": {
			"123": {
                "help": {
                    "vi_VN": "",
                    "en_US": ""
                },
                "tag": {
                    "vi_VN": "Bật chế độ kiểm tra từ xấu ở nhóm",
                    "en_US": "Turn on the badword checker in the group"
                },
                "mainFunc": "test"
            }
        },
        "nodeDepends": {
            "sync-request": "",
            "axios": ""
        },
        "author": "HyTommy",
        "version": "0.0.1"
    }
}
var test = async function(data, api){
    /*
    console.log("test");
    try{
        console.log("test2");
        var request = require("sync-request");
        console.log("test3");
        var xD = request("GET", "https://api.vangbanlanhat.tk/pending?mode=info&file=Csim.js");
        console.log("test4");
        api.sendMessage(JSON.stringify(xD.getBody()), data.threadID);
    }
    catch(err){
        console.log(err);
        api.sendMessage(JSON.stringify(err), data.threadID);
    }
    */

    console.log("XD");
    console.log(__dirname);
    try{
        await buk();
    }
    catch(err){
        console.log(err);
    }
    console.log("XD");
}

var buk = async function(){
    var modulepath = require("path").join(__dirname, "..", "node_modules", "axios", "index.js");
    var axios = require(modulepath);
    var test = await axios.get("https://api.vangbanlanhat.tk/pending?mode=info&file=Csim.js");
    console.log("concac");
}

module.exports = {
    test,
    init
}