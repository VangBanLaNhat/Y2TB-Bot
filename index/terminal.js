var ipc = require("electron").ipcRenderer;


var term = new Terminal();
term.open(document.getElementById("terminal"));

ipc.send("terminal.toterm", `cd ${require("path").join(__dirname, "..")} \x0D`);
ipc.send("terminal.toterm", `cls \x0D`);
//ipc.send("terminal.toterm", `\n`);
/*term.onData(e => {
	ipc.send("terminal.toterm", e);
})*/



var sendbtn = document.querySelector('.sendcmd');


sendbtn.onclick = function (){
	var sendvl = document.getElementById(`cmd`).value
	if (sendvl && window.botStart){
		ipc.send("terminal.toterm", sendvl+"\x0D");
	}
	document.getElementById(`cmd`).value = "";
}

var logTmn;

ipc.on("terminal.incData", (event, data)=>{
	term.write(data);
	logTmn = data;
	//console.log(data)
})

//system info
//var timeStart = new Date();
var UTJ = {
	d: 0,
	h: 0,
	m: 0,
	s: 0
}

var uptimeF;

var ramht = document.querySelector('#ram');
var cpuht = document.querySelector('#cpu');

var dh = document.querySelector('#day');
var hh = document.querySelector('#hours'); 
var mh = document.querySelector('#mins');
var sh = document.querySelector('#secs');
function getsysinfo() {
	var ram = process.getSystemMemoryInfo();
	var freeram = ram.free/ram.total *100;
	//console.log(freeram)
	var cpu = process.getCPUUsage().percentCPUUsage;
	ramht.innerHTML = (100-freeram.toFixed(2)).toFixed(2);
	cpuht.innerHTML = cpu.toFixed(2);
}

document.getElementById(`stopTmn`).style.display = "none"
document.getElementById("restartTmn").classList.toggle("disbt");
document.getElementById("restartTmn").classList.toggle("restartTmn");

var isStart;

var NBstart = "0";

var countNRt;
var starttmn = document.querySelector('.startTmn');

starttmn.onclick = tmnStart;

//console.log(document.getElementById(`startTmn`).style.display)

var stoptmn = document.querySelector('.stopTmn');
stoptmn.onclick = ()=>{
    document.getElementById("restartTmn").classList.add("disbt");
	document.getElementById("restartTmn").classList.remove("restartTmn");
	tmnStop();
}

var restarttmn = document.getElementById('restartTmn');
restarttmn.onclick = tmnRestart;

function checkTime(d, h, m, s) {
	//s>0
	if(s >= 60){
		s = 0;
		m++;
	};
	if(m >= 60){
		m = 0;
		h++;
	};
	if(h >= 24){
		h = 0;
		d++
	}
	//s<0
	if(s<0){
		s+=60;
		m--;
	};
	if(m<0){
		m+=60;
		h--
	};
	if(h<0){
		h+=24;
		d--;
	};
	if(d<0){
		d=0;
		h=0;
		m=0;
		s=0;
	}
	return{
		d,
		h,
		m,
		s
	}
}

//classList.toggle() 

function tmnStart (){
	//send("yellow", 'Starting Terminal...');
    ipc.send("terminal.toterm", `cls \x0D`);
    ipc.send("terminal.toterm", `echo y|npm start \x0D`);
    document.getElementById("restartTmn").classList.remove("disbt");
	document.getElementById("restartTmn").classList.add("restartTmn");
    window.botStart = true;
    UTJ = {
		d: 0,
		h: 0,
		m: 0,
		s: 0
	}

    countNRt = 0;
    global.gsi = setInterval(function () {
		getsysinfo();
	}, 1000);
	uptimeF = setInterval(()=>{
    	UTJ = checkTime(UTJ.d, UTJ.h, UTJ.m, UTJ.s+1);

		dh.innerHTML = UTJ.d
		hh.innerHTML = UTJ.h
		mh.innerHTML = UTJ.m
		sh.innerHTML = UTJ.s
	},1000)
	isStart = setInterval(function () {
		//setTimeout(function () {
			var t = fs.readFileSync(path.join(__dirname, "..", "data", "isStart.txt"), {encoding: "utf8"});
			if (t == "1") {
				//countNRt = 0;
			//} else if(countNRt <= 2) {
				//countNRt++;
				//console.log(countNRt)
			} else {
				
				//document.getElementById(`startTmn`).style  = "";
    			//document.getElementById(`stopTmn`).style.display = "none";
    			tmnStop();
    			ramht.innerHTML = "0.00";
				cpuht.innerHTML = "0.00";

				UTJ = checkTime(UTJ.d, UTJ.h, UTJ.m, UTJ.s-5);
				dh.innerHTML = UTJ.d
				hh.innerHTML = UTJ.h
				mh.innerHTML = UTJ.m
				sh.innerHTML = UTJ.s
			}
		//}, 2000)
	}, 5000)
	document.getElementById(`stopTmn`).style = "";
	document.getElementById(`startTmn`).style.display = "none"
}

function tmnStop(){
	//send("yellow", 'Stopping Terminal...');
	fs.writeFileSync(path.join(__dirname, "..", "data", "isStart.txt"), "0");
	clearInterval(global.gsi);
	clearInterval(isStart);
	clearInterval(uptimeF);
    ipc.send("terminal.toterm", `\x03`);
    setTimeout(function(){
    	//Terminate batch job (Y/N)?
    	//ipc.send("terminal.toterm", `y\x0D`);
    	//logTmn == "Terminate batch job (Y/N)? "?ipc.send("terminal.toterm", `y\x0D`):"";
    	//ipc.send("terminal.toterm", `cls\x0D`);
    	document.getElementById(`startTmn`).style  = "";
    	document.getElementById(`stopTmn`).style.display = "none";
    	window.botStart = false;
    }, 500);
    clearInterval(global.gsi)
    ramht.innerHTML = "0.00";
	cpuht.innerHTML = "0.00";
}

function tmnRestart(){
	if(document.getElementById("restartTmn").classList.value.indexOf("restartTmn") == -1) return;
	document.getElementById("restartTmn").classList.add("disbt");
	document.getElementById("restartTmn").classList.remove("restartTmn");
	tmnStop();
	document.getElementById("stopTmn").classList.add("disbt");
	document.getElementById("stopTmn").classList.remove("stopTmn");
	document.getElementById("startTmn").classList.add("disbt");
	document.getElementById("startTmn").classList.remove("startTmn");
	setTimeout(()=>{
		tmnStart();
		document.getElementById("stopTmn").classList.remove("disbt");
		document.getElementById("stopTmn").classList.add("stopTmn");
		document.getElementById("startTmn").classList.remove("disbt");
		document.getElementById("startTmn").classList.add("startTmn");
	}, 1000)
}