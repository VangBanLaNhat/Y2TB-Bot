const electron = require('electron');
const ipc = electron.ipcMain;
const url = require('url');
const path = require('path');
const pty = require("node-pty");
const os = require("os");
var fs = require("fs");

var shell = os.platform() === "win32" ? "powershell.exe" : "bash";
;
var dfcf = {
	"bot_info": {
		"botname": "Y2TBbot",
		"lang": "vi_VN"
	},
	"facebook": {
		"FBemail": "",
		"FBpassword": "",
		"prefix": "/",
		"admin": [],
		"autoMarkRead": true,
		"selfListen": false
	}
}

var ccf = {
	"main_bot": {
		"consoleColor": "32",
		//https://upload.wikimedia.org/wikipedia/commons/3/34/ANSI_sample_program_output.png
		"dataSaveTime": "5",
		"toggleLog": true
	},
	"facebook": {
		"logLevel": "error",
		"userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
		"listenEvents": true,
		"updatePresence": false
	}
}

	if (!fs.existsSync('udata')) {
    	fs.mkdirSync('udata')
	}
	if (!fs.existsSync('core')) {
    	fs.mkdirSync('core')
	}
	if (!fs.existsSync(path.join(__dirname,"..", "udata", "config.json"))) {
    	fs.writeFileSync(path.join(__dirname,"..", "udata", "config.json"), JSON.stringify(dfcf, null, 4), {mode: 0o666});
	}
	if (!fs.existsSync(path.join(__dirname,"..", "core", "coreconfig.json"))) {
    	fs.writeFileSync(path.join(__dirname,"..", "core", "coreconfig.json"), JSON.stringify(ccf, null, 4), {mode: 0o666});
	}


const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;



function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 650,
    resizable: false,
    maximizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
  const mM = Menu.buildFromTemplate(mMn);
	Menu.setApplicationMenu(mM);

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  //terminal

var ptyPr = pty.spawn(shell, [], {
	name: "xterm-color",                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
	cols: 80,
  rows: 30,
	cwd: process.env.HOME,
	env: process.env
})

ptyPr.on("data", function(data){
	mainWindow.webContents.send("terminal.incData", data)
})

ipc.on("terminal.toterm", (event, data)=>{
	try{
		ptyPr.write(data);
	} catch(e){
		console.log(e);
	}
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
ipcMain.on('gnrcf', function(e, dfcf){
	fs.writeFileSync(path.join(__dirname,"..", "udata", "config.json"), JSON.stringify(dfcf, null, 4), {mode: 0o666});
})

ipcMain.on('avccf', function(e, ccf){
	fs.writeFileSync(path.join(__dirname,"..", "core", "coreconfig.json"), JSON.stringify(ccf, null, 4), {mode: 0o666});
})

//menu template

const mMn = []
