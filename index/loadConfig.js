var fs = require("fs");
const path = require('path');
const fetch = require("node-fetch");

const NOTIFICATION_TITLE = 'Title'
const NOTIFICATION_BODY = 'Notification from the Renderer process. Click to log to console.'
const CLICK_MESSAGE = 'Notification clicked!'

var a;

try{
    fetch('https://raw.githubusercontent.com/VangBanLaNhat/VBLNBot/main/package.json')
    .then(res => res.text())
    .then(json => {
        a = json;
        while(a.indexOf("\\n\\r") != -1){
            a.replace("\\n\\r", "\n")
        }
        json = JSON.parse(a)
        if(json.version != "1.0.1") ipc.send("update", {
            current: "1.0.0",
            latest: json.version
        });
        console.log(json)
    });
    //var msgl = document.querySelector('#msgl')
    //document.getElementById(`msgl`).style.color = "yellow";
    //loadGNRconfig
    //msgl.innerHTML = "Loading General Config...";
    //var datadf = await fetch('./udata/config.json');
    //var dfcf = await datadf.json();
    var dfcf = JSON.parse(fs.readFileSync(path.join(__dirname,"..", "udata", "config.json")));
    //await new Promise(x => setTimeout(x, 1*1*1000));
    //loadAVCconfig
    //msgl.innerHTML = "Loading Advance Config...";
    //var dataco = await fetch('./core/coreconfig.json');
    //var ccf = await dataco.json();
    var ccf = JSON.parse(fs.readFileSync(path.join(__dirname,"..", "core", "coreconfig.json")));
    //await new Promise(x => setTimeout(x, 1*1*1000));
    //log
    //msgl.innerHTML = "Loading data...";
}
catch (err){
    var msgl = document.querySelector('#msgl')
    document.getElementById(`msgl`).style.color = "red";
    msgl.innerHTML = "Can't load config with err: "+err;
}

//Message
function send(title, msg){
    /*document.getElementById(`message`).style.display = "none";
    var mess = document.querySelector('.message')
    document.getElementById(`message`).style.color = color;
    mess.innerHTML = msg;
    document.getElementById(`message`).style.display = "flex";
    setTimeout(function(){
        document.getElementById(`message`).style.display = "none";
    }, 3*1000)*/
    new Notification(title, {body: msg});
}
//addAdmin
const addadmin = document.querySelector('.addadmin')
var htmladmin;
var lengthAdmin = -1;
addadmin.onclick = function (){
    if (document.getElementById(`adbox`).value != '') {
        lengthAdmin +=1;
        var admin = document.querySelector('.admin')
        var add = `<div class="input"><input class="textbox boxad" id="ad${lengthAdmin}" type="text" value="" disabled><a id="del${lengthAdmin} del" onclick="return deip(${lengthAdmin})">-</a></div>`
        admin.innerHTML += add;
        htmladmin += add;
        document.getElementById(`ad${lengthAdmin}`).style.transform = "translateY(-0.1px)";
        document.getElementById(`ad${lengthAdmin}`).value = document.getElementById(`adbox`).value;
        dfcf.facebook.admin[lengthAdmin] = document.getElementById(`adbox`).value;
        document.getElementById(`adbox`).value = '';
        for (var i=0; i<dfcf.facebook.admin.length; i++){
            if (dfcf.facebook.admin[i] != '' && dfcf.facebook.admin[i] != null) {
                try{
                    document.getElementById(`ad${i}`).value = dfcf.facebook.admin[i];
                }catch(err){}
            }
        }
    }
    else{
        send('Setting', 'Please add value!')
    }
}
//delete admin
function deip(i){
    document.getElementById(`ad${i}`).value = 'del';
    var admin = document.querySelector('.admin')
    var thay = htmladmin.replace(`<div class="input"><input class="textbox boxad" id="ad${i}" type="text" value="" disabled><a id="del${i} del" onclick="return deip(${i})">-</a></div>`, "");
    thay = thay.replace("undefined", "")
    admin.innerHTML = thay;
    htmladmin = thay;
    
    for (var z = i; z < lengthAdmin; z++) {
        var thay = htmladmin.replace(`<div class="input"><input class="textbox boxad" id="ad${z+1}" type="text" value="" disabled><a id="del${z+1} del" onclick="return deip(${z+1})">-</a></div>`, `<div class="input"><input class="textbox boxad" id="ad${z}" type="text" value="" disabled><a id="del${z} del" onclick="return deip(${z})">-</a></div>`);
        admin.innerHTML = thay;
        htmladmin = thay;
    }
    lengthAdmin--
    dfcf.facebook.admin.splice(i, 1)
    for (var i=0; i<dfcf.facebook.admin.length; i++){
        if (dfcf.facebook.admin[i] != null) {
            try{
                document.getElementById(`ad${i}`).value = dfcf.facebook.admin[i];
            }catch(err){}
        }
    }
    return 0;
}

//loadConfig
function lcf() {
//General Config
    document.getElementById('botname').value = dfcf.bot_info.botname
    document.getElementById('fbemail').value= dfcf.facebook.FBemail
    document.getElementById('fbpass').value= dfcf.facebook.FBpassword
    document.getElementById('lang').value= dfcf.bot_info.lang
    document.getElementById('prefix').value= dfcf.facebook.prefix
    var admin = document.querySelector('.admin')
    admin.innerHTML = "";
    for (var i=0; i<dfcf.facebook.admin.length; i++){
        if (dfcf.facebook.admin[i] != '' && dfcf.facebook.admin[i] != null){
            lengthAdmin +=1;
            var add = `<div class="input"><input class="textbox boxad" id="ad${i}" type="text" value="" disabled><a id="del${i} del" onclick="return deip(${i})">-</a></div>`
            admin.innerHTML += add;
            htmladmin += add     
            document.getElementById(`ad${i}`).style.transform = "translateY(-0.1px)"
        }
    }
    for (var i=0; i<dfcf.facebook.admin.length; i++){
        if (dfcf.facebook.admin[i] != '' && dfcf.facebook.admin[i] != null) {
            try{
                document.getElementById(`ad${i}`).value = dfcf.facebook.admin[i];
            }catch(err){}
        }
    }
    
    document.getElementsByName('cb')[0].checked= dfcf.facebook.autoMarkRead
    document.getElementsByName('cb')[1].checked= dfcf.facebook.selfListen
    document.getElementById('uidMode').value= dfcf.facebook.UIDmode
    //Advance Config
    document.getElementById('cslcl').value= ccf.main_bot.consoleColor
    document.getElementById('dst').value= ccf.main_bot.dataSaveTime
    document.getElementsByName('cb')[2].checked= ccf.main_bot.toggleLog
    document.getElementsByName('cb')[3].checked= ccf.main_bot.toggleDebug
    document.getElementsByName('cb')[4].checked= ccf.main_bot.developMode
    document.getElementById('loglv').value= ccf.facebook.logLevel
    document.getElementById('userag').value= ccf.facebook.userAgent
    document.getElementsByName('cb')[5].checked= ccf.facebook.listenEvents
    document.getElementsByName('cb')[6].checked= ccf.facebook.updatePresence
}
lcf()
//Save Config
const savebutton = document.querySelector('#save')
savebutton.onclick = function (){
    send("Setting", "Saving...")
    dfcf.bot_info.botname = document.getElementById('botname').value
    dfcf.bot_info.lang = document.getElementById('lang').value
    dfcf.facebook.FBemail = document.getElementById('fbemail').value
    dfcf.facebook.FBpassword = document.getElementById('fbpass').value
    dfcf.facebook.prefix = document.getElementById('prefix').value
    var z = 0;
    for (var i=0; i<dfcf.facebook.admin.length; i++){
        if (dfcf.facebook.admin[i] == null) {
            dfcf.facebook.admin.splice(i, 1);
        }
    }
    console.log(dfcf.facebook.admin);
    console.log(lengthAdmin)
    dfcf.facebook.autoMarkRead = document.getElementsByName('cb')[0].checked
    dfcf.facebook.selfListen = document.getElementsByName('cb')[1].checked
    dfcf.facebook.UIDmode = document.getElementById('uidMode').value
    
    try{
        dfcf.facebook[document.getElementById('uidMode').value].length = 0;
        for(var i in document.getElementsByClassName("listuidmode")[0].children){
            dfcf.facebook[document.getElementById('uidMode').value].push(document.getElementsByClassName("listuidmode")[0].children[i].children[0].value)
        }
    } catch(e){console.log(e)};
    //Advance Config
    ccf.main_bot.consoleColor = document.getElementById('cslcl').value
    ccf.main_bot.dataSaveTime = document.getElementById('dst').value
    ccf.main_bot.toggleLog = document.getElementsByName('cb')[2].checked
    ccf.main_bot.toggleDebug = document.getElementsByName('cb')[3].checked
    ccf.main_bot.developMode = document.getElementsByName('cb')[4].checked
    ccf.facebook.logLevel = document.getElementById('loglv').value
    ccf.facebook.userAgent = document.getElementById('userag').value
    ccf.facebook.listenEvents = document.getElementsByName('cb')[5].checked
    ccf.facebook.updatePresence = document.getElementsByName('cb')[6].checked
    try{
        //window.ipcRenderer.send('gnrcf', dfcf);
        //window.ipcRenderer.send('avccf', ccf);
        //console.log(window.ipcRenderer);
        fs.writeFileSync(path.join(__dirname,"..", "udata", "config.json"), JSON.stringify(dfcf, null, 4), {mode: 0o666});
        fs.writeFileSync(path.join(__dirname,"..", "core", "coreconfig.json"), JSON.stringify(ccf, null, 4), {mode: 0o666});
        send("Setting", "Save sussed!")
    }
    catch(err){
        send("Error", err)
    }
}
//Start Bot
const startbutton = document.querySelector('#start');
startbutton.onclick = function (){
    ipc.send("confirm", {
        type: "setDefaultConfig",
        msg: "Are you sure you want to return the settings to default?"
    });
    
}

var ipc = require("electron").ipcRenderer;

ipc.on("setDefaultConfig", (event, data)=>{
    if(data.accept){
        send("Setting", "Reset config sussed!")
        var cf = require(path.join(__dirname,"..", "core", "util", "defaultConfig.js"));
        dfcf = cf.normal();
        ccf = cf.core();
        lcf();
    }
})

optUID(dfcf.facebook.UIDmode);

var lengthUID = 10;

function optUID(value) {
    
    var box = document.querySelector('.listuidmode');
    box.innerHTML = "";
    if(value != "disabled"){
        lengthUID = dfcf.facebook[value].length;
        document.querySelector('#adduidmode').disabled = false;
        var length = dfcf.facebook[value].length;
        console.log(length);
        for(let i in dfcf.facebook[value]){
            box.innerHTML += `<div class="input" id="uid${i}" ><input class="textbox boxUID" type="text" value="${dfcf.facebook[value][i]}" disabled><a id="delUID${i} del" onclick="return deUID(${i})">-</a></div>`
        }
    } else {
        document.querySelector('.listuidmode').innerHTML = "";
        document.querySelector('#adduidmode').disabled = true;
    }
    //document.getElementsByClassName("listuidmode")[0].children[0].children[0].value
}

function deUID(n) {
    document.getElementsByClassName("listuidmode")[0].removeChild(document.getElementById("uid"+n));
}

document.querySelector(".adduidm").onclick = function () {
    if(!document.querySelector("#adduidmode").value) return false;
    lengthUID++;
    var box = document.querySelector('.listuidmode');
    box.innerHTML += `<div class="input" id="uid${lengthUID}" ><input class="textbox boxUID" type="text" value="${document.querySelector("#adduidmode").value}" disabled><a id="delUID${lengthUID} del" onclick="return deUID(${lengthUID})">-</a></div>`;
    document.querySelector("#adduidmode").value = "";
}