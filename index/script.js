document.getElementById('content').style.display= 'none';
document.getElementById('header').style.display= 'none';
document.getElementById('footer').style.display= 'none';
setTimeout(function(){
    document.getElementById('onload').style.display= 'none';
    document.getElementById('content').style.position= 'relative';
    document.getElementById('content').style.display= 'block';
    document.getElementById('header').style.display= 'flex';
    document.getElementById('footer').style.display= 'flex';
}, 0*1000*1)
//tab
const gnr = document.querySelector('header #gnr')
document.getElementById('gnr').style.background= '#29282d';
document.getElementById('gnr').style.color= 'cyan';
document.getElementById('avcct').style.display= 'none';
document.getElementById('gnrct').style.display= 'block';
document.getElementById('tmnct').style.display= 'none';

const header_config = JSON.parse(document.getElementById('config_header').innerHTML);
for(let i of header_config){
    let temp = document.getElementById(i.id);
    temp.onclick = (m)=>{
        document.getElementById(i.id).style.background= '#29282d';
        document.getElementById(i.id).style.color= 'cyan';
        document.getElementById(i.tab).style.display= 'block';
        if(i.footer) document.getElementById('footer').style.display= 'flex'
        else document.getElementById('footer').style.display= 'none'
        for(let j of header_config){
            if(i.tab == j.tab) continue;
            document.getElementById(j.id).style.background= 'none';
            document.getElementById(j.id).style.color= '#fff';
            document.getElementById(j.tab).style.display= 'none';
        }
    }
}

//show/hide password
const show = document.querySelector('#showpass')
document.getElementById('hidepass').style.display="none";
document.getElementById('hidepassa').style.display="none";
show.onclick = function () {
    document.getElementById('fbpass').type="text"
    document.getElementById('hidepass').style.display= "flex";
    document.getElementById('showpass').style.display="none";
    document.getElementById('showpassa').style.display="none";
    document.getElementById('hidepassa').style.display="flex";
}
var hide = document.querySelector('#hidepass')
hide.onclick = function () {
    document.getElementById('fbpass').type="password"
    document.getElementById('hidepass').style.display= "none";
    document.getElementById('showpass').style.display="flex";
    document.getElementById('showpassa').style.display="flex";
    document.getElementById('hidepassa').style.display="none";
}
//checkbox
var checkboxd = document.querySelector('#cb1')
checkboxd.onclick = function () {
    if(document.getElementsByName('cb')[0].checked == false){
        document.getElementsByName('cb')[0].checked = true
    }
    else{
        document.getElementsByName('cb')[0].checked = false
    }
}

var checkboxd = document.querySelector('#cb2')
checkboxd.onclick = function () {
    if(document.getElementsByName('cb')[1].checked == false){
        document.getElementsByName('cb')[1].checked = true
    }
    else{
        document.getElementsByName('cb')[1].checked = false
    }
}

var checkboxd = document.querySelector('#cb3')
checkboxd.onclick = function () {
    if(document.getElementsByName('cb')[2].checked == false){
        document.getElementsByName('cb')[2].checked = true
    }
    else{
        document.getElementsByName('cb')[2].checked = false
    }
}

var checkboxd = document.querySelector('#cb4')
checkboxd.onclick = function () {
    if(document.getElementsByName('cb')[3].checked == false){
        document.getElementsByName('cb')[3].checked = true
    }
    else{
        document.getElementsByName('cb')[3].checked = false
    }
}

//FBstate Button

var fbsbtn = document.querySelector(".addfbs");


var fbsPath = document.querySelector(".fbs-path");

var fs = require("fs");

if(fs.existsSync(require("path").join(__dirname, "..", "udata", "fbstate.json"))){
    fbsPath.innerHTML = "FBstate.json is exists!"
}

fbsbtn.addEventListener("change", (event) => {
    const { files } = event.target;
    var ctf = fs.readFileSync(files[0].path, {encoding: "utf8"});
    fs.writeFileSync(path.join(__dirname, "..", "udata", "fbstate.json"), ctf, {mode: 0o666});
    fbsPath.innerHTML = files[0].path;
})

//Plugins Store Button
var ipc = require("electron").ipcRenderer;

var plstbtn = document.querySelector(".btn-plst");

plstbtn.onclick = function (){
    ipc.send("openPluginsStore");
}