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

startbutton.onclick = function (){
	send("yellow", 'Starting BotChat...')
	tmnTab()
    ipc.send("terminal.toterm", `cls \x0D`);
    ipc.send("terminal.toterm", `npm start \x0D`);
}