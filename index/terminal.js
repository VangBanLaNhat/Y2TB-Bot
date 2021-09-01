const ipc = require("electron").ipcRenderer;

var term = new Terminal();
term.open(document.getElementById("terminal"));

ipc.send("terminal.toterm", `cd ${__dirname+"\\.."} \x0D`);
ipc.send("terminal.toterm", `cls \x0D`);
//ipc.send("terminal.toterm", `\n`);
term.onData(e => {
	ipc.send("terminal.toterm", e);
})

ipc.on("terminal.incData", (event, data)=>{
	term.write(data);
})

//system info
var ramht = document.querySelector('#ram');
var cpuht = document.querySelector('#cpu');
function getsysinfo() {
	var ram = process.getSystemMemoryInfo();
	var freeram = ram.free/ram.total *100;
	//console.log(freeram)
	var cpu = process.getCPUUsage().percentCPUUsage;
	ramht.innerHTML = 100-freeram.toFixed(2);
	cpuht.innerHTML = cpu.toFixed(2);
}

document.getElementById(`stopTmn`).style.display = "none"

var starttmn = document.querySelector('.startTmn');
starttmn.onclick = function (){
	send("yellow", 'Starting Terminal...');
    ipc.send("terminal.toterm", `cls \x0D`);
    ipc.send("terminal.toterm", `npm start \x0D`);
    global.gsi = setInterval(function () {
		getsysinfo();
	}, 500);
	document.getElementById(`stopTmn`).style = "";
	document.getElementById(`startTmn`).style.display = "none"
}

console.log(document.getElementById(`startTmn`).style.display)

var stoptmn = document.querySelector('.stopTmn');
stoptmn.onclick = function (){
	send("yellow", 'Stopping Terminal...');
    ipc.send("terminal.toterm", `\x03`);
    setTimeout(function(){
    	ipc.send("terminal.toterm", `\x03`);
    	document.getElementById(`startTmn`).style  = "";
    	document.getElementById(`stopTmn`).style.display = "none"
    }, 100);
    clearInterval(global.gsi)
    ramht.innerHTML = "0.00";
	cpuht.innerHTML = "0.00";
}