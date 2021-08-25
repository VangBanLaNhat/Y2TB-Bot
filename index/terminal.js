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

function getsysinfo() {
	var ramht = document.querySelector('#ram');
	var cpuht = document.querySelector('#cpu');
	var ram = process.getSystemMemoryInfo();
	var freeram = ram.free/ram.total *100;
	//console.log(freeram)
	var cpu = process.getCPUUsage().percentCPUUsage;
	ramht.innerHTML = 100-freeram.toFixed(2);
	cpuht.innerHTML = cpu.toFixed(2);
}

setInterval(function () {
	getsysinfo();
}, 500);

getsysinfo();


startbutton.onclick = function (){
	send("yellow", 'Starting BotChat...')
	tmnTab()
    ipc.send("terminal.toterm", `cls \x0D`);
    ipc.send("terminal.toterm", `npm start \x0D`);
}