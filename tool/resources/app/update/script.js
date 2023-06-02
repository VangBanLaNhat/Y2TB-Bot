var ipc = require("electron").ipcRenderer;
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const AdmZip = require("adm-zip");
const { pipeline } = require('stream');

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
		"udata",
		"tool"
	]
}

let infoUpdate = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "..", "..", "data", "update.json")));
document.getElementById("cvs").innerHTML += infoUpdate.current;
document.getElementById("lvs").innerHTML += infoUpdate.latest;



// let lastt, curr;

// ipc.on("update.send", (event, data)=>{
// 	lastt = data.latest;
// 	curr = data.current;
// 	document.getElementById("cvs").innerHTML += curr;
// 	document.getElementById("lvs").innerHTML += lastt;
// })

//require(path.join(__dirname, "..", "..", "core", "util", "dlUpdate.js"))();

//let lk = "VangBanLaNhat/Y2TB-Bot"
// git('github:'+lk, 'temp', function (err) {
// 	console.log(err ? 'Error' : 'Success');
// 	if(err) return ipc.send("update.close");//console.log(err);
// 	let dir = path.join(__dirname, "..", "..", "..", "..");
// 	let listF = fs.readdirSync(dir);
// 	let ct=[];
// 	for(let i of save.file){
// 		if(fs.existsSync(path.join(dir, i))){
// 			ct.push({
// 				content: fs.readFileSync(path.join(dir, i)),
// 				path: i
// 			})
// 		}

// 	}
// 	for(let f of listF){
// 		if(fs.lstatSync(path.join(dir, f)).isFile()){
//             fs.unlinkSync(path.join(dir, f));
//         } else if(save.folder.indexOf(f) == -1){
//         	removeDir(path.join(dir, f));
//         }
// 	}
// 	let listFUD = fs.readdirSync(path.join(__dirname, "..", "..", "temp"));
// 	for(let f of listFUD){
// 		console.log(f)
// 		fse.moveSync(path.join(__dirname, "..", "..", "temp", f), path.join(dir, f), { overwrite: true });
// 	}
// 	for(let i of ct){
// 		let fd = i.path.split("/");
// 		fd.length = fd.length-1;
// 		fd = fd.join("/");
// 		console.log(ensureExists(path.join(dir ,fd)))
// 		if(fs.existsSync(path.join(dir, i.path))){
// 			fs.writeFileSync(path.join(dir, i.path), i.content);
// 		}
// 	}
// 	removeDir(path.join(dir, "node_modules"));

// 	ipc.send("update.close");
// })
document.getElementsByClassName("done")[0].style.display = "none";
document.getElementById("process").innerHTML = "Downloading Update...";

ipc.send("downloadUpdate");

ipc.on("downloadUpdate", async (e, a) => {
	if (a.err) {
		document.getElementById("process").innerHTML = "Error has arisen during the download process! Please try again later";
		console.error(a.err);
		setTimeout(() => ipc.send("update.close"), 5000);
	}
	else document.getElementById("process").innerHTML = "Complete download update!"

	let pathFile = path.join(__dirname, "..", "..", "..", "..", "update");

	try {
		await extractZip(path.join(pathFile, "update.zip"), pathFile);
		fs.unlinkSync(path.join(pathFile, "update.zip"));
		document.getElementById("process").innerHTML = "Extraction completed!"
	} catch (error) {
		fs.unlinkSync(path.join(pathFile, "update.zip"));
		console.error("Update", error);
		setTimeout(() => ipc.send("update.close"), 5000);
	}

	document.getElementById("process").innerHTML = "Starting update..."
	let minus = ["tool", "plugins"];

	let listFile = fs.readdirSync(path.join(pathFile, "Y2TB-Bot-master"));

	for (let i of listFile)
		if (minus.indexOf(i) == -1) {
			if (!fs.lstatSync(path.join(pathFile, "Y2TB-Bot-master", i)).isFile()) copyFolder(path.join(pathFile, "Y2TB-Bot-master", i), path.join(pathFile, "..", i));
			else fs.renameSync(path.join(pathFile, "Y2TB-Bot-master", i), path.join(pathFile, "..", i));
		}
	
	copyFolder(path.join(pathFile, "Y2TB-Bot-master", "tool", "resources"), path.join(pathFile, "..", "tool", "resources"));
	document.getElementById("process").innerHTML = "Update completed! Start update node_module...";
	setTimeout(() => ipc.send("update.close"), 2000);
})

function extractZip(filePath, destinationPath) {
	return new Promise((resolve, reject) => {
		const zip = new AdmZip(filePath);
		zip.extractAllToAsync(destinationPath, true, (error) => {
			if (error) {
				console.error('Error extracting zip file:', error);
				reject(error);
				process.exit(504);
			} else {
				resolve();
			}
		});
	});
}

function copyFolder(sourcePath, destinationPath) {
	try {
		ensureExists(destinationPath);

		const files = fs.readdirSync(sourcePath);

		files.forEach((file) => {
			const sourceFile = path.join(sourcePath, file);
			const destinationFile = path.join(destinationPath, file);

			if (fs.lstatSync(sourceFile).isFile()) {
				fs.copyFileSync(sourceFile, destinationFile);
			} else {
				copyFolder(sourceFile, destinationFile);
			}
		});

	} catch (error) {
		console.error("Update", 'Error copying folder: ' + error);
	}
}

function deleteFolderRecursive(folderPath) {
	if (fs.existsSync(folderPath)) {
		fs.readdirSync(folderPath).forEach((file) => {
			const curPath = folderPath + '/' + file;

			if (fs.lstatSync(curPath).isDirectory()) {
				deleteFolderRecursive(curPath);
			} else {
				fs.unlinkSync(curPath);
			}
		});

		fs.rmdirSync(folderPath);
	} else {
		console.log('Folder does not exist.');
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