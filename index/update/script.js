var ipc = require("electron").ipcRenderer;
const path = require("path");
const git = require("download-git-repo");
const fs = require("fs");
const fse = require("fs-extra");

const save = {
	file: ["core/coreconfig.json"],
	folder: [
		".git",
		"data",
		"lang",
		"logs",
		"node_modules",
		"plugins",
		"temp",
		"udata"
	]
}


let lastt, curr;

ipc.on("update.send", (event, data)=>{
	lastt = data.latest;
	curr = data.current;
	document.getElementById("cvs").innerHTML += curr;
	document.getElementById("lvs").innerHTML += lastt;
})

//require(path.join(__dirname, "..", "..", "core", "util", "dlUpdate.js"))();

let lk = "VangBanLaNhat/VangBanLaNhat-Bot"
git('github:'+lk, 'temp', function (err) {
	console.log(err ? 'Error' : 'Success');
	if(err) return ipc.send("update.close");//console.log(err);
	let dir = path.join(__dirname, "..", "..");
	let listF = fs.readdirSync(dir);
	let ct=[];
	for(let i of save.file){
		if(fs.existsSync(path.join(dir, i))){
			ct.push({
				content: fs.readFileSync(path.join(dir, i)),
				path: i
			})
		}
		
	}
	for(let f of listF){
		if(fs.lstatSync(path.join(dir, f)).isFile()){
            fs.unlinkSync(path.join(dir, f));
        } else if(save.folder.indexOf(f) == -1){
        	removeDir(path.join(dir, f));
        }
	}
	let listFUD = fs.readdirSync(path.join(__dirname, "..", "..", "temp"));
	for(let f of listFUD){
		console.log(f)
		fse.moveSync(path.join(__dirname, "..", "..", "temp", f), path.join(dir, f), { overwrite: true });
	}
	for(let i of ct){
		let fd = i.path.split("/");
		fd.length = fd.length-1;
		fd = fd.join("/");
		console.log(ensureExists(path.join(dir ,fd)))
		if(fs.existsSync(path.join(dir, i.path))){
			fs.writeFileSync(path.join(dir, i.path), i.content);
		}
	}

	ipc.send("update.close");
})

function removeDir(path) {
  if (fs.existsSync(path)) {
    const files = fs.readdirSync(path)

    if (files.length > 0) {
      files.forEach(function(filename) {
        if (fs.statSync(path + "/" + filename).isDirectory()) {
         	removeDir(path + "/" + filename)
        } else {
        	try{
				fs.unlinkSync(path + "/" + filename);
				console.log(path + "/" + filename);
			}catch(e){}
        }
      })
      fs.rmdirSync(path)
    } else {
      fs.rmdirSync(path)
    }
  } else {
    console.log("Directory path not found.")
  }
}

function ensureExists(path, func, mask) {
  if (typeof mask != 'number') {
    mask = 0o777;
  }
  try {
    fs.mkdirSync(path, {
      mode: mask,
      recursive: true
    });
    //func();
    return;
  } catch (ex) {
    return {
      err: ex
    };
  }
}