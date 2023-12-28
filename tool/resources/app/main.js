// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const fs = require("fs");
const path = require('path');
const { exec, spawn } = require('child_process');
//const package = require('node-sys');

const axios = require("axios");
const os = require("os");
const mMn = [];
const mn = Menu.buildFromTemplate(mMn);

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 500,
    height: 500,
    title: 'Y2TB Install',
    resizable: false,
    maximizable: false,
    minimizable: false,
    frame: false,
    icon: path.join(__dirname, "img", "icon_square.png"),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  //Core Update 
  function startUpdate() {
    const updateWindow = new BrowserWindow({
      width: 400,
      height: 200,
      resizable: false,
      maximizable: false,
      minimizable: false,
      frame: false,
      center: true,
      skipTaskbar: false,
      icon: path.join(__dirname, "img", "icon_square.png"),
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    })

    updateWindow.loadFile(path.join(__dirname, "update", "index.html"));
    //updateWindow.webContents.openDevTools();

    mainWindow.close();

    ipcMain.on("downloadUpdate", async (e, d) => {
      let pathFile = path.join(__dirname, "..", "..", "..", "update");
      console.log(pathFile);
      try {
        await downloadUpdate(pathFile);
        updateWindow.webContents.send("downloadUpdate", {});
      } catch (error) {
        updateWindow.webContents.send("downloadUpdate", { err: error });
      }
    })

    ipcMain.on("update.close", (e, d) => {
      if (d) exec("cd \"" + path.join(__dirname, "..", "..", "..") + "\" && start Y2TB.exe");
      setTimeout(() => updateWindow.close(), 1000);
    })
  }

  async function downloadUpdate(pathFile) {
    let url = 'https://github.com/VangBanLaNhat/Y2TB-Bot/archive/refs/heads/master.zip';

    ensureExists(pathFile);

    try {
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(path.join(pathFile, "update.zip"));

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } catch (error) {
      console.error("Update", 'Error downloading file: ' + error);
      process.exit(504);
    }
  }



  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  if (fs.existsSync(path.join(__dirname, "..", "..", "..", "data", "update.json"))) setTimeout(startUpdate, 700);

  ipcMain.on("menu", (e, d) => {
    if (d == "close") mainWindow.close()
    else if (d == "hide") mainWindow.minimize();
  })

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
  Menu.setApplicationMenu(mn);

  //Check admin

  ipcMain.on("checkAdmin", () => {
    import('is-admin').then(async (isAdmin) => {
      console.log(isAdmin.default.isAdmin);
      if (await isAdmin.default()) mainWindow.webContents.send("checkAdmin", true);
      else mainWindow.webContents.send("checkAdmin", false);
    }).catch((error) => {
      console.error('Error:', error.message);
      //mainWindow.webContents.send("checkAdmin", false);
    });
  })

  //Install.

  ipcMain.on("pkg.install", () => {
    const command = 'Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString(\'https://chocolatey.org/install.ps1\'))';
    // checking chocolatey
    exec(`where choco`, (error, stdout, stderr) => {
      if (error) {
        console.error(`${error.message}`);

        // Install package
        let child = spawn('powershell', ['-Command', command]);

        child.stdout.on('data', (data) => {
          console.log(`stdout: ${data}`);
          mainWindow.webContents.send("pkg.install.on");
        });

        child.stderr.on('data', (data) => {
          console.error(`stderr: ${data}`);
          mainWindow.webContents.send("pkg.install.on");
        });

        child.on('close', (code) => {
          if (code !== 0) {
            console.error(`Error: process exited with code ${code}`);
            mainWindow.webContents.send("pkg.install", { error: `Error: process exited with code ${code}` });
            return;
          }
          mainWindow.webContents.send("pkg.install.done");
          console.log('Chocolatey installed successfully.');
        });
        return;
      }

      if (stdout) {

        mainWindow.webContents.send("pkg.install.done");
      }
    });
  })

  // Install packages using Chocolatey

  /* Visual Studio */

  ipcMain.on("VS2017C", () => {
    let child = spawn("choco", ['install', '-y', 'visualstudio2017-workload-vctools', '--force']);

    child.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      mainWindow.webContents.send("VS2017C.on");
    });

    child.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    child.on('error', (error) => {
      console.error(`Error: ${error.message}`);
      mainWindow.webContents.send("VS2017C.error", { error: error.message });
    });

    child.on('close', (code) => {
      if (code == 0) {
        console.log('Visual Studio Code installed successfully.');
        mainWindow.webContents.send("VS2017C.done");
      } else {
        console.error(`Child process exited with code ${code}`);
        mainWindow.webContents.send("VS2017C.error", { error: `Child process exited with code ${code}` });
      }
    });
  })

  /* Python */

  ipcMain.on("pythonC", () => {
    let child = spawn("choco", ['install', '-y', 'python', '--force']);

    child.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      if (data.indexOf("Progress:") == -1) mainWindow.webContents.send("pythonC.on");
    });

    child.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    child.on('error', (error) => {
      console.error(`Error: ${error.message}`);
      mainWindow.webContents.send("pythonC.error", { error: error.message });
    });

    child.on('close', (code) => {
      if (code == 0) {
        console.log('Python installed successfully.');
        mainWindow.webContents.send("pythonC.done");
      } else {
        console.error(`Child process exited with code ${code}`);
        mainWindow.webContents.send("pythonC.error", { error: `Child process exited with code ${code}` });
      }
    });
  })

  /* Git */

  ipcMain.on("gitC", () => {
    let child = spawn("choco", ['install', '-y', 'git', '--force']);

    child.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      if (data.indexOf("Progress:") == -1) mainWindow.webContents.send("gitC.on");
    });

    child.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    child.on('error', (error) => {
      console.error(`Error: ${error.message}`);
      mainWindow.webContents.send("gitC.error", { error: error.message });
    });

    child.on('close', (code) => {
      if (code == 0) {
        console.log('Git installed successfully.');
        mainWindow.webContents.send("gitC.done");
      } else {
        console.error(`Child process exited with code ${code}`);
        mainWindow.webContents.send("gitC.error", { error: `Child process exited with code ${code}` });
      }
    });
  })

  /* NodeJS */

  ipcMain.on("nodejsC", () => {
    let child = spawn("choco", ['install', '-y', 'nodejs-lts', '--force']);

    child.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      if (data.indexOf("Progress:") == -1) mainWindow.webContents.send("nodejsC.on");
    });

    child.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    child.on('error', (error) => {
      console.error(`Error: ${error.message}`);
      mainWindow.webContents.send("nodejsC.error", { error: error.message });
    });

    child.on('close', (code) => {
      if (code == 0) {
        console.log('NodeJS(LTS) installed successfully.');
        mainWindow.webContents.send("nodejsC.done");
      } else {
        console.error(`Child process exited with code ${code}`);
        mainWindow.webContents.send("nodejsC.error", { error: `Child process exited with code ${code}` });
      }
    });
  })

  // Perform manual installation

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
      exec(`cd "${path.join(__dirname, "temp")}" && start ./VS2017.exe --passive --wait --add Microsoft.VisualStudio.Component.VC.Tools.x86.x64 Microsoft.VisualStudio.Component.VC.CoreBuildTools Microsoft.VisualStudio.Component.VC.Redist.14.Latest Microsoft.VisualStudio.Component.VC.CMake.Project Microsoft.VisualStudio.Component.TestTools.BuildTools`, (e) => {
        if (e) {
          try {
            setTimeout(() => clearInterval(item), 1000);
          } catch (_) { }
          console.error(e);
          return mainWindow.webContents.send("VS2017", e);
        }
      });
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

  ipcMain.on("VS2017.checkSDK", () => {
    var cmakeCheck = setInterval(async () => {
      try {
        var tasklist = await getListTasks();
        var checking = 0;
        for (let i of tasklist)
          if (i.imageName == "setup.exe") {
            console.log(i)
            checking++;
          }
      } catch (e) { console.log(e) };

      if (checking < 2) {
        clearInterval(cmakeCheck);
        mainWindow.webContents.send("VS2017.checkSDK.done");
      }
    }, 10 * 1000);
  })

  //Python

  ipcMain.on("Python", () => {
    //C:\Users\LENOVO\AppData\Local\Programs\Python\Python311
    exec(`where python`, (error, stdout, stderr) => {
      if (!error) return mainWindow.webContents.send("Python.done");
      let type = "Python311";
      let fl = 16;
      if (os.arch().indexOf("64") == -1) {
        type = "Python311-32";
        fl = 15;
      }
      let dirPF = path.join(process.env.appdata, "..", "Local", "Programs", "Python", type);

      //let dl = require("download-file");
      let dir = path.join(__dirname, "temp");
      ensureExists(dir);

      let link = os.arch().indexOf("64") != -1 ? "https://www.python.org/ftp/python/3.11.4/python-3.11.4-amd64.exe" : "https://www.python.org/ftp/python/3.11.4/python-3.11.4.exe";
      dl(link, {
        directory: dir,
        filename: "Python.exe"
      }, (e) => {
        mainWindow.webContents.send("Python", e);
        if (e) return;
        exec("cd \"" + path.join(__dirname, "temp") + "\" && start ./Python.exe", (e) => {
          if (e) {
            try {
              setTimeout(() => clearInterval(item), 1000);
            } catch (_) { }
            console.error(e);
            return mainWindow.webContents.send("Python", e);
          }
        });
        itemp = setInterval(() => {
          try {
            let l = fs.readdirSync(dirPF).length;
            mainWindow.webContents.send("Python.isIT", Math.trunc((l / fl) * 100));
            if (Math.trunc((l / fl) * 100) == 100) {
              clearInterval(itemp)
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

      exec("cd \"" + path.join(__dirname, "temp") + "\" && start ./Git.exe", (e) => {
        if (e) {
          try {
            setTimeout(() => clearInterval(item), 1000);
          } catch (_) { }
          console.error(e);
          return mainWindow.webContents.send("Git", e);
        }
      });
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
    let link = os.arch().indexOf("64") != -1 ? "https://nodejs.org/dist/v18.17.0/node-v18.17.0-x64.msi" : "https://nodejs.org/dist/v16.15.0/node-v18.17.0-x86.msi";

    dl(link, {
      directory: dir,
      filename: "NodeJS.msi"
    }, (e) => {
      mainWindow.webContents.send("NodeJS", e);
      if (e) return console.log(e);

      setTimeout(() => {
        exec("cd \"" + path.join(__dirname, "temp") + "\" && start ./NodeJS.msi", (e) => {
          if (e) {
            try {
              setTimeout(() => clearInterval(item), 1000);
            } catch (_) { }
            console.error(e);
            return mainWindow.webContents.send("NodeJS", e);
          }
        });
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

    // exec("npm -v", (e, stdout, stder) => {
    //   console.log(stdout.split(".")[0]);
    //   if (stdout.split(".")[0] != "8")
    //     exec("npm i -g npm@8", () => { ins(0) });
    //   else ins(0);
    // })
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
      exec("cd \"" + path.join(__dirname, "..", "..", "..") + "\" && start Y2TB.exe", (e, o, err) => {
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

function deleteDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(file => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteDirectoryRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

async function getListTasks() {
  let tasklist = await (import('tasklist'));
  return (await tasklist.tasklist());
}