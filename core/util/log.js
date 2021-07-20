var lx = require("luxon");
var readline = require("readline");

/*!global.logLast ? global.logLast = {
  year: 2021,
  month: 1,
  days: 1,
  loadTimes: 0
} : "";*/
function log(...msg){
    if(msg.length > 1){
		if(msg[0] == ""){
			classs = "Manager";
		}
		else {
			classs = msg[0];
		}
	}
	else {
		classs = "Manager";
	}
    classs= "["+classs+"]";
    msg[0]="";
    var dt = lx.DateTime.now().setZone("Asia/Ho_Chi_Minh");
    try{
		var cl = `\x1b[${global.avcconfig.consoleColor}m`;
    }
    catch(err){
        var cl = "\x1b[32m"
    }//Color is Green
    var clcs = "\x1b[36m"; //Color is Cyan
    var x = [`${cl}[${dt.day}.${dt.month}T${dt.hour}.${dt.minute}.${dt.second}Z]`];
	for(i=1;i<msg.length;i++){
		console.log.apply(console, x.concat([clcs]).concat([classs]).concat([cl]).concat(msg[i]).concat([cl]));
	}
}

function err(...msg){
	if(msg.length > 1){
		if(msg[0] == ""){
			classs = "Manager";
		}
		else {
			classs = msg[0];
		}
	}
	else {
		classs = "Manager";
	}
    classs= "["+classs+"]";
    msg[0]="";
    var dt = lx.DateTime.now().setZone("Asia/Ho_Chi_Minh");
    //readline.cursorTo(process.stdout, 0);
    try{
		var cl = `\x1b[${global.avcconfig.consoleColor}m`;
    }
    catch(err){
        var cl = "\x1b[32m"
    } //Color is Green
    var clcs = "\x1b[36m"; //Color is Cyan
    var clerr = "\x1b[31m" //Color is Red
    var clwa = "\x1b[33m"; //Color is Yellow
    var x = [`${cl}[${dt.day}.${dt.month}T${dt.hour}.${dt.minute}.${dt.second}Z]`];
	for(i=1;i<msg.length;i++){
		console.log.apply(console, x.concat([clcs]).concat([classs]).concat([clerr]).concat(["[ERR!]"]).concat([clwa]).concat(msg[i]).concat([cl]));
	}
}

function warn(...msg){
    var classs = msg[0];
    if (classs=='') classs="Manager";
    classs= "["+classs+"]";
    msg[0]="";
    var dt = lx.DateTime.now().setZone("Asia/Ho_Chi_Minh");
    //readline.cursorTo(process.stdout, 0);
    try{
    var cl = `\x1b[${global.avcconfig.consoleColor}m`;
    }
    catch(err){
        var cl = "\x1b[32m"
    } //Color is Green
    var clcs = "\x1b[36m"; //Color is Cyan
    var clwarn = "\x1b[33m" //Color is Red
    var clwa = "\x1b[37m"; //Color is Yellow
    var x = [`${cl}[${dt.day}.${dt.month}T${dt.hour}.${dt.minute}.${dt.second}Z]`];
	for(i=1;i<msg.length;i++){
		console.log.apply(console, x.concat([clcs]).concat([classs]).concat([clwarn]).concat(["[WARN!]"]).concat([clwa]).concat(msg));
	}
}
   
function blank(){
	console.log("\r");
}

module.exports = {
    log,
    err,
	warn,
	blank
}