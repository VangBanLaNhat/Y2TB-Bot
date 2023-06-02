var ipc = require("electron").ipcRenderer;
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const AdmZip = require("adm-zip");
const { pipeline } = require('stream');

let infoUpdate = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "..", "..", "data", "update.json")));
document.getElementById("cvs").innerHTML += infoUpdate.current;
document.getElementById("lvs").innerHTML += infoUpdate.latest;

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
	document.getElementById("process").innerHTML = "Update completed!";
	fs.unlinkSync(path.join(__dirname, "..", "..", "..", "..", "data", "update.json"));
	setTimeout(() => ipc.send("update.close", true), 2000);
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