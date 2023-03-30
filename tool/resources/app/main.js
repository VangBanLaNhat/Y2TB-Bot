// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const fs = require("fs");
const path = require('path');
const { exec } = require('child_process');

const axios = require("axios");
const os = require("os");
const mMn = [];
const mn = Menu.buildFromTemplate(mMn);

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 500,
    height: 500,
    title: 'VBLN Install',
    resizable: false,
    maximizable: false,
    minimizable: false,
    frame: false,
    icon: path.join(__dirname, "img", "icon_square.jpg"),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  ipcMain.on("menu", (e, d) => {
    if (d == "close") mainWindow.close()
    else if (d == "hide") mainWindow.minimize();
  })

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
  Menu.setApplicationMenu(mn);

  //Install.

  ipcMain.on("choco", () => {
    
  })

  ipcMain.on("VS2017", () => {
    let dirPF = path.join(process.env.windir, "..", "Program Files (x86)", "Microsoft Visual Studio", "2017", "BuildTools");
    if (os.arch().indexOf("64") == -1) dirPF = path.join(process.env.windir, "..", "Program Files", "Microsoft Visual Studio", "2017", "BuildTools");
    console.log(dirPF)
    if (fs.existsSync(dirPF) && fs.readdirSync(dirPF).length == 7) return mainWindow.webContents.send("VS2017.done");

    //let dl = require("download-file");
    let dir = path.join(__dirname, "temp");
    ensureExists(dir);

    var itemp;

    dl("https://download.visualstudio.microsoft.com/download/pr/36243c1c-f4ee-4caa-9ca4-a43e0f850ff7/64aa175b190cdae0f50e41a36cda60434efdba05da768d57f7dfc1097a0b4c24/vs_BuildTools.exe", {
      directory: dir,
      filename: "VS2017.exe"
    }, (e) => {
      mainWindow.webContents.send("VS2017", e);
      if (e) return;
      exec(`cd "${path.join(__dirname, "temp")}" && start ./VS2017.exe --add Microsoft.VisualStudio.Component.VC.Tools.x86.x64 Microsoft.VisualStudio.Component.VC.CoreBuildTools Microsoft.VisualStudio.Component.VC.Redist.14.Latest Microsoft.VisualStudio.Component.VC.CMake.Project Microsoft.VisualStudio.Component.TestTools.BuildTools`);
      //Microsoft.VisualStudio.Component.Windows10SDK.17763
      itemp = setInterval(() => {
        try {
          let l = fs.readdirSync(dirPF).length;
          mainWindow.webContents.send("VS2017.isIT", Math.trunc((l / 7) * 100));
          if (Math.trunc((l / 7) * 100) == 100) clearInterval(itemp);
        } catch (e) { };
      }, 2000);
    })
  })

  ipcMain.on("VS2017.checkSDK", ()=>{
    var cmakeCheck = setInterval(async () => {
      try{
        var tasklist = await getListTasks();
        var checking = 0;
        for(let i of tasklist)
          if(i.imageName == "setup.exe"){
            console.log(i)
            checking++;
          }
      } catch(e) {console.log(e)};
      
      if(checking < 2){
        clearInterval(cmakeCheck);
        mainWindow.webContents.send("VS2017.checkSDK.done");
      }
    }, 10 * 1000);
  })

  //Python

  ipcMain.on("Python", () => {
    //C:\Users\Administrator\AppData\Local\Programs\Python\Python310
    let type = "Python310";
    let fl = 16;
    if (os.arch().indexOf("64") == -1) {
      type = "Python310-32";
      fl = 15;
    }
    let dirPF = path.join(process.env.appdata, "..", "Local", "Programs", "Python", type);
    let dirCP = path.join(process.env.windir, "..", "Python37");

    if (fs.existsSync(dirPF) && fs.readdirSync(dirPF).length == fl) {
      if (!fs.existsSync(dirCP) || fs.readdirSync(dirCP).length != fl) {
        mainWindow.webContents.send("Python.cp");
        return cp()
      }
      return mainWindow.webContents.send("Python.done");
    }

    //let dl = require("download-file");
    let dir = path.join(__dirname, "temp");
    ensureExists(dir);

    let link = os.arch().indexOf("64") != -1 ? "https://www.python.org/ftp/python/3.10.4/python-3.10.4-amd64.exe" : "https://www.python.org/ftp/python/3.10.4/python-3.10.4.exe";
    dl(link, {
      directory: dir,
      filename: "Python.exe"
    }, (e) => {
      mainWindow.webContents.send("Python", e);
      if (e) return;
      exec("cd \"" + path.join(__dirname, "temp") + "\" && start ./Python.exe");
      itemp = setInterval(() => {
        try {
          let l = fs.readdirSync(dirPF).length;
          mainWindow.webContents.send("Python.isIT", Math.trunc((l / fl) * 100));
          if (Math.trunc((l / fl) * 100) == 100) {
            clearInterval(itemp)
            setTimeout(cp, 100);
          };
        } catch (e) { };
      }, 2000);
    })
    function cp() {
      exec("xcopy \"" + path.join(dirPF, "..") + "\" \"" + path.join(process.env.windir, "..") + "\" /s/h/e/k/f/c && ren " + path.join(process.env.windir, "..", type) + " Python37", (error, stdout, stderr) => {
        //exec("dir", (error, stdout, stderr) => {
        if (error) console.log(error);
        mainWindow.webContents.send("Python.cpDone");
        console.log(stdout);
        console.log(stderr)
      })
    }
  })

  //Git

  ipcMain.on("Git", () => {
    let dirPF = path.join(process.env.windir, "..", "Program Files", "Git");

    if (fs.existsSync(dirPF) && fs.readdirSync(dirPF).length == 14) {
      return mainWindow.webContents.send("Git.done");
    }

    //let dl = require("download-file");
    let dir = path.join(__dirname, "temp");
    ensureExists(dir);
    let link = os.arch().indexOf("64") != -1 ? "https://github.com/git-for-windows/git/releases/download/v2.40.0.windows.1/Git-2.40.0-64-bit.exe" : "https://github.com/git-for-windows/git/releases/download/v2.40.0.windows.1/Git-2.40.0-32-bit.exe";

    dl(link, {
      directory: dir,
      filename: "Git.exe"
    }, (e) => {
      mainWindow.webContents.send("Git", e);
      if (e) return console.log(e);

      exec("cd \"" + path.join(__dirname, "temp") + "\" && start ./Git.exe");
      itemp = setInterval(() => {
        try {
          let l = fs.readdirSync(dirPF).length;
          mainWindow.webContents.send("Git.isIT", Math.trunc((l / 14) * 100));
          if (Math.trunc((l / 14) * 100) == 100) clearInterval(itemp)
        } catch (e) { };
      }, 2000);
    })
  })

  //NodeJS

  ipcMain.on("NodeJS", () => {
    let dirPF = path.join(process.env.windir, "..", "Program Files", "nodejs");

    if (fs.existsSync(dirPF) && fs.readdirSync(dirPF).length == 11) {
      return mainWindow.webContents.send("NodeJS.done");
    }

    //let dl = require("download-file");
    let dir = path.join(__dirname, "temp");
    ensureExists(dir);
    let link = os.arch().indexOf("64") != -1 ? "https://nodejs.org/dist/v16.15.0/node-v16.15.0-x64.msi" : "https://nodejs.org/dist/v16.15.0/node-v16.15.0-x86.msi";

    dl(link, {
      directory: dir,
      filename: "NodeJS.msi"
    }, (e) => {
      mainWindow.webContents.send("NodeJS", e);
      if (e) return console.log(e);

      setTimeout(() => {
        exec("cd \"" + path.join(__dirname, "temp") + "\" && start ./NodeJS.msi");
        itemp = setInterval(() => {
          try {
            let l = fs.readdirSync(dirPF).length;
            mainWindow.webContents.send("NodeJS.isIT", Math.trunc((l / 11) * 100));
            if (Math.trunc((l / 11) * 100) == 100) clearInterval(itemp)
          } catch (e) { };
        }, 2000);
      }, 100)
    })
  })

  //Module

  ipcMain.on("Module", () => {
    let LMD = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "..", "package.json"))).dependencies;
    //console.log(Object.keys(LMD));
    let array = Object.keys(LMD);

    ins(0);
    function ins(i) {
      let inf = array[i];
      let pl = "";

      if (LMD[inf] != "")
        if (LMD[inf].indexOf("https://") == -1) {
          pl += "@" + LMD[inf].split("^")[1];
        }

      exec("cd \"" + path.join(__dirname, "..", "..", "..") + "\" && dir && npm i " + inf + pl, (e, stdout, stder) => {
        console.log(stdout);
        console.log(stder);
        let s = {
          per: Math.trunc(((i + 1) / (array.length)) * 100)
        }
        mainWindow.webContents.send("Module", s);
        mainWindow.webContents.send("t", {
          out: stdout,
          err: stder,
          dir: __dirname
        });
        if (i == array.length - 1) return;
        ins(i + 1);
      })
    }
    /*let inf = array[array.length - 1];
    exec("npm i "+inf+(LMD[inf]==""?"":"@"+LMD[inf]), (e, stdout, stder)=>{
      console.log(stdout);
      console.log(stder);
    })*/
  })

  //VS module

  ipcMain.on("VSM", () => {
    setTimeout(() => {
      mainWindow.webContents.send("VSM");
    }, 2000)
  })

  //Rebuild

  ipcMain.on("Rebuild", () => {
    exec("cd \"" + path.join(__dirname, "..", "..", "..") + "\" && npm run rebuild", (e, o, err) => {
      console.log(e); console.log(o); console.log(err);
      //94513 ~ 100000ms = 1p40s
      mainWindow.webContents.send("Rebuild.done");
    })
  })

  //Done

  ipcMain.on("Start", () => {
    console.log(1);
    exec("echo y|rmdir /s temp", () => {
      exec("cd \"" + path.join(__dirname, "..", "..", "..") + "\" && start VBLN.exe", (e, o, err) => {
        console.log(e); console.log(o); console.log(err);
        mainWindow.close()
      });
    })
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
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
function ensureExists(path, mask) {
  if (typeof mask != 'number') {
    mask = 0o777;
  }
  try {
    fs.mkdirSync(path, {
      mode: mask,
      recursive: true
    });
    return;
  } catch (ex) {
    return {
      err: ex
    };
  }
}

async function dl(url, json, callback) {
  let down;
  try {
    down = await axios({
      method: "get",
      url: url,
      responseType: "stream"
    })
  } catch (e) {
    callback(e);
    return;
  }
  let dir = path.join(json.directory, json.filename);
  down.data.pipe(fs.createWriteStream(dir).on("finish", callback));
}

async function getListTasks(){
  let tasklist = await (import('tasklist'));
  return (await tasklist.tasklist());
}