const electron = require('electron');
const ipc = electron.ipcMain;
const { exec } = require('child_process');
const url = require('url');
const path = require('path');
const pty = require("node-pty");
const os = require("os");

var fs = require("fs");

var shell = os.platform() === "win32" ? "powershell.exe" : "bash";
;

let dfcf = require("../core/util/defaultConfig.js").normal()
let ccf = require("../core/util/defaultConfig.js").core()

if (!fs.existsSync('udata')) {
	fs.mkdirSync('udata')
}
if (!fs.existsSync('core')) {
	fs.mkdirSync('core')
}
if (!fs.existsSync(path.join(__dirname, "..", "udata", "config.json"))) {
	fs.writeFileSync(path.join(__dirname, "..", "udata", "config.json"), JSON.stringify(dfcf, null, 4), { mode: 0o666 });
}
if (!fs.existsSync(path.join(__dirname, "..", "core", "coreconfig.json"))) {
	fs.writeFileSync(path.join(__dirname, "..", "core", "coreconfig.json"), JSON.stringify(ccf, null, 4), { mode: 0o666 });
}


const { app, BrowserWindow, Menu, ipcMain, Notification } = electron;
const ipcR = require("electron").ipcRenderer;

const contextMenu = require('electron-context-menu');

contextMenu({
	showSaveImageAs: false,
	showCopyImage: false,
	showInspectElement: true
});

let mainWindow;
let confirmWindow;

app.setAppUserModelId("VBLN");
app.setName("VBLN");
app.setUserTasks([

])
console.log(process.execPath)

function createWindow(a) {
	// Create the browser window.
	//if(a != 1) return;
	mainWindow = new BrowserWindow({
		width: 800,
		height: 710,
		resizable: false,
		maximizable: false,
		icon: path.join(__dirname, "icon", "logo.ico"),
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: true,
			contextIsolation: false
		}
	})


	//new Notification(options).show();

	// and load the index.html of the app.
	mainWindow.loadFile('index.html');

	//Window confirm
	function crCFwindow(data) {
		return new Promise((resolve, reject) => {
			confirmWindow = new BrowserWindow({
				width: 400,
				height: 200,
				title: 'Confirm',
				resizable: false,
				maximizable: false,
				minimizable: false,
				frame: false,
				parent: mainWindow,
				modal: true,
				webPreferences: {
					nodeIntegration: true,
					contextIsolation: false
				}
			});
			confirmWindow.loadFile('confirm.html');
			//confirmWindow.webContents.openDevTools()

			mainWindow.on("close", function () {
				app.quit();
			})
			confirmWindow.on("close", function () {
				confirmWindow = null;
			})
			confirmWindow.once("ready-to-show", function () {
				confirmWindow.show();
			})
			confirmWindow.webContents.on('did-finish-load', () => {
				resolve()
			})
		})
	}

	function startPluginStore() {
		var pluginStore = new BrowserWindow({
			width: 800,
			height: 710,
			minWidth: 800,
			minHeight: 710,
			icon: path.join(__dirname, "icon", "logo.ico"),
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: false
			}
		})
		pluginStore.loadFile("./pluginStore/index.html")



		mainWindow.on("close", function () {
			app.quit();
		})
		pluginStore.on("close", function () {
			pluginStore = null;
		})
		pluginStore.once("ready-to-show", function () {
			pluginStore.show();
		})
	}

	const mM = Menu.buildFromTemplate(mMn);
	Menu.setApplicationMenu(mM);

	// Open the DevTools.
	//mainWindow.webContents.openDevTools()


	//terminal
	try {
		var ptyPr = pty.spawn(shell, [], {
			name: "xterm-color",
			cols: 80,
			rows: 30,
			cwd: process.env.HOME,
			env: process.env
		})

		ptyPr.on("data", function (data) {
			try {
				mainWindow.webContents.send("terminal.incData", data)
			} catch (e) { }
		})
	} catch (e) { };


	ipc.on("terminal.toterm", (event, data) => {
		try {
			ptyPr.write(data);
		} catch (e) {
			console.log(e);
		}
	})
	ipc.on("confirm", (event, data) => {
		var dt = new Date;
		crCFwindow().then(() => {
			confirmWindow.webContents.send("confirm", data);
		})

	})
	ipc.on("confirm.return", (event, data) => {
		mainWindow.webContents.send(data.from, data);
		confirmWindow.close();
		console.log(data);
	})

	//Plugin store
	ipc.on("openPluginsStore", () => {
		startPluginStore();
	})

	var upd;

	function startUpdate() {
		upd = new BrowserWindow({
			width: 400,
			height: 150,
			resizable: false,
			maximizable: false,
			minimizable: false,
			frame: false,
			center: true,
			skipTaskbar: false,
			icon: path.join(__dirname, "icon", "logo.ico"),
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: false
			}
		})
		upd.loadFile("./update/index.html")


		mainWindow.close()
		upd.on("close", function () {
			app.quit();
		})
		upd.on("close", function () {
			//upd = null;
		})
	}

	ipc.on("update", (event, data) => {
		exec("cd \"" + path.join(__dirname, "..") + "\" && start VBLN.exe", (e, o, err) => {
			console.log(e); console.log(o); console.log(err);
			mainWindow.close();
			app.quit();
		});
		//startUpdate();
		// setTimeout(() => {
		// 	upd.webContents.send("update.send", data);
		// }, 1000)
		// console.log(data);
	})

	ipc.on("update.close", (event, data) => {
		upd.close();
	})
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createWindow()

	app.on('activate', function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
	if (process.platform != 'darwin') app.quit()
})

//save config
ipcMain.on('gnrcf', function (e, dfcf) {
	fs.writeFileSync(path.join(__dirname, "..", "udata", "config.json"), JSON.stringify(dfcf, null, 4), { mode: 0o666 });
})

ipcMain.on('avccf', function (e, ccf) {
	fs.writeFileSync(path.join(__dirname, "..", "core", "coreconfig.json"), JSON.stringify(ccf, null, 4), { mode: 0o666 });
})

//menu template

const mMn = []
