var ipc = require("electron").ipcRenderer;
// const { exec } = require('child_process');
//const isAdmin = require('is-admin');

window.addEventListener('DOMContentLoaded', () => {
  function msg(number, s) {
    number = !number ? 0 : number;
    s = !s ? "Loading..." : s;
    if (number == 2) return document.getElementsByClassName("msg")[0].innerHTML = "<a>" + s + "</a>";
    document.getElementsByClassName("msg-process")[number].innerHTML = s;
  }
  function load(number, s) {
    number = !number ? 0 : number;
    s = !s ? 0 : s;
    if (number == 0)
      switch (s) {
        case 1:
          s = 14;
          break;
        case 2:
          s = 29;
          break;
        case 3:
          s = 43;
          break;
        case 4:
          s = 58;
          break;
        case 5:
          s = 72;
          break;
        case 6:
          s = 87;
          break;
        case 7:
          s = 100;
          break;
        default:
          s = 0;
      }
    document.getElementsByClassName("pg-ct")[number].style.width = s + "%";
  }
  function hidePC() {
    let color = "#29282d";
    document.getElementsByClassName("msg-process")[1].style.color = color;
    document.getElementsByClassName("pgb2")[0].style.background = color;
    document.getElementsByClassName("pgc2")[0].style = "";
    document.getElementsByClassName("pgc2")[0].style.background = color;
  }
  function showPC() {
    document.getElementsByClassName("msg-process")[1].style = "";
    document.getElementsByClassName("pgb2")[0].style = "";
    document.getElementsByClassName("pgc2")[0].style = "";
  }
  hidePC();
  //menu
  const btn_close = document.getElementById("btn-close");
  btn_close.onclick = () => {
    ipc.send("menu", "close");
  }
  const btn_hide = document.getElementById("btn-hide");
  btn_hide.onclick = () => {
    ipc.send("menu", "hide");
  }

  //run
  ipc.send("checkAdmin");

  ipc.on("checkAdmin", (event, e) => {
    if(e) choco();
    else VS2017();
  })

  function choco() {
    msg(0, "Start installing the package installer...");
    ipc.send("pkg.install");
    let i = 0;
    showPC();
    ipc.on("pkg.install.on", ()=>{
      i++;
      let pc = Math.trunc(((i/22)/100)*10000);
      msg(1, "Installing Chocolatey... (" + pc + "%)");
      load(1, pc);
      //console.log(i);
    })
    ipc.on("pkg.install", (event, e)=>{
      msg(0, "Cannot install Chocolatey. Perform manual installation!");
      load(1, 0);
      hidePC();
      console.log(event);
      console.log(e);
      VS2017();
    } )

    ipc.on("pkg.install.done", (event, e)=>{
      msg(0, "Complete the chocolatey installation!");
      hidePC();
      VS2017C()
    })
  }

  // Install packages using Chocolatey

  /* Visual Studio */

  function VS2017C(){
    msg(0, "Installing Visual Studio 2017...");
    ipc.send("VS2017C");
    let i = 0;
    msg(1, "Installing Visual Studio 2017... (0%)");
    showPC();

    ipc.on("VS2017C.on", ()=>{
      i++;
      let pc = Math.trunc(((i/540)/100)*10000);
      msg(1, "Installing Visual Studio 2017... (" + pc + "%)");
      load(1, pc);
      //console.log(i);
    })
    ipc.on("VS2017C.error", (event, e)=>{
      msg(0, "Cannot install Visual Studio 2017! Please try again!");
      load(1, 0);
      hidePC();
      console.log(event);
      console.log(e);
    } )

    ipc.on("VS2017C.done", (event, e)=>{
      msg(0, "Complete the Visual Studio 2017 installation!");
      load(0, 1);
      hidePC();
      
      pythonC();
    })
  }

  /* Python */

  function pythonC(){
    msg(0, "Installing Python...");
    ipc.send("pythonC");
    let i = 0;
    msg(1, "Installing Python... (0%)");
    showPC();

    ipc.on("pythonC.on", ()=>{
      i++;
      let pc = Math.trunc(((i/26)/100)*10000);
      msg(1, "Installing Python... (" + pc + "%)");
      load(1, pc);
      //console.log(i);
    })
    ipc.on("pythonC.error", (event, e)=>{
      msg(0, "Cannot install Python! Please try again!");
      load(1, 0);
      hidePC();
      console.log(event);
      console.log(e);
    } )

    ipc.on("pythonC.done", (event, e)=>{
      msg(0, "Complete the Python installation!");
      load(0, 2);
      hidePC();
      
      gitC();
    })
  }

  /* Git */

  function gitC(){
    msg(0, "Installing Git...");
    ipc.send("gitC");
    let i = 0;
    msg(1, "Installing Git... (0%)");
    showPC();

    ipc.on("gitC.on", ()=>{
      i++;
      let pc = Math.trunc(((i/20)/100)*10000);
      msg(1, "Installing Git... (" + pc + "%)");
      load(1, pc);
      //console.log(i);
    })
    ipc.on("gitC.error", (event, e)=>{
      msg(0, "Cannot install Git! Please try again!");
      load(1, 0);
      hidePC();
      console.log(event);
      console.log(e);
    } )

    ipc.on("gitC.done", (event, e)=>{
      msg(0, "Complete the Git installation!");
      load(0, 3);
      hidePC();
      
      nodejsC();
    })
  }

  /* NodeJS */

  function nodejsC(){
    msg(0, "Installing NodeJS(LTS)...");
    ipc.send("nodejsC");
    let i = 0;
    msg(1, "Installing NodeJS... (0%)");
    showPC();

    ipc.on("nodejsC.on", ()=>{
      i++;
      let pc = Math.trunc(((i/16)/100)*10000);
      msg(1, "Installing NodeJS... (" + pc + "%)");
      load(1, pc);
      //console.log(i);
    })
    ipc.on("nodejsC.error", (event, e)=>{
      msg(0, "Cannot install NodeJS(LTS)! Please try again!");
      load(1, 0);
      hidePC();
      console.log(event);
      console.log(e);
    } )

    ipc.on("nodejsC.done", (event, e)=>{
      msg(0, "Complete the NodeJS(LTS) installation!");
      load(0, 4);
      hidePC();
      
      IMD();
    })
  }

  // Perform manual installation

  function VS2017() {
    msg(0, "Installing Visual Studio 2017...");
    showPC();
    let i = 0;
    let itemp = setInterval(() => {
      if (i == 99) return clearInterval(itemp);
      msg(1, "Downloading VS2017.exe (" + i + "%)");
      load(1, i++);
    }, 100)
    ipc.send("VS2017");
    ipc.on("VS2017", (event, e) => {
      clearInterval(itemp);
      if (e) {
        hidePC();
        console.error(e);
        msg(0, "Pause!");
        return msg(2, "Unable to connect to \"microsoft.com\". Please check your network connection and try again!");
      }
      msg(1, "Downloading VS2017.exe (100%)");
      load(1, 100);
      setTimeout(() => {
        msg(1, "Installing VS 2017...");
        load(1, 0);
      }, 100);
    })
    ipc.on("VS2017.isIT", (event, data) => {
      if (data == 0) return;
      if (data == 100) {
        load(1, 90);
        msg(1, "Installing Visual C++ tools for CMake...(90%)");
        ipc.send("VS2017.checkSDK");
        return;
      }
      load(1, data);
      msg(1, "Installing VS 2017...(" + data + "%)");
    })

    ipc.on("VS2017.checkSDK.done", () => {
      load(1, 100);
      msg(1, "Installing VS 2017...(100%)");
      hidePC();
      load(0, 1);
      python();
    })

    ipc.on("VS2017.done", () => {
      clearInterval(itemp);
      hidePC();
      msg(0, "Installing Python...");
      load(0, 1);
      python();
    })
  }

  //Python

  function python() {
    msg(0, "Installing Python...");
    showPC();
    let i = 0;
    itemp = setInterval(() => {
      if (i == 99) return clearInterval(itemp);
      msg(1, "Downloading Python.exe (" + i + "%)");
      load(1, i++);
    }, 100)
    ipc.send("Python");
  }

  ipc.on("Python", (event, e) => {
    clearInterval(itemp);
    if (e) {
      hidePC();
      console.error(e);
      msg(0, "Pause!");
      return msg(2, "Unable to connect to \"python.org\". Please check your network connection and try again!");
    }
    msg(1, "Downloading Python.exe (100%)");
    load(1, 100);
    setTimeout(() => {
      msg(1, "Installing Python...(0%)");
      load(1, 0);
    }, 100);
  })

  ipc.on("Python.isIT", (event, data) => {
    if (data == 0) return;
    load(1, data);
    msg(1, "Installing Python...(" + data + "%)");
    if (data == 100) PYD();
      // setTimeout(() => {
      //   msg(1, "Copying folder Python...(0%)");
      //   load(1, 0);
      //   CPPT();
      // }, 100);
  })

  // ipc.on("Python.cpDone", () => {
  //   clearInterval(itemp);
  //   msg(1, "Copying folder Python...(100%)");
  //   load(1, 100);
  //   setTimeout(PYD, 1000);
  // })

  // ipc.on("Python.cp", () => {
  //   clearInterval(itemp);
  //   msg(1, "Copying folder Python...(0%)");
  //   load(1, 0);
  //   CPPT();
  // })
  // function CPPT() {
  //   i = 0;
  //   itemp = setInterval(() => {
  //     if (i == 98) {
  //       msg(1, "Copying folder Python...(98%)");
  //       load(1, 98);
  //       //setTimeout(PYD, 1000);
  //       return clearInterval(itemp);
  //     }
  //     msg(1, "Copying folder Python...(" + i + "%)");
  //     load(1, i++);
  //   }, 250);
  // }

  // ipc.on("Python.done", PYD);

  //Git

  function PYD() {
    clearInterval(itemp)
    hidePC();
    msg(0, "Installing Git...");
    load(0, 2);
    i = 0;
    showPC();
    itemp = setInterval(() => {
      if (i == 99) return clearInterval(itemp);
      msg(1, "Downloading Git.exe...(" + i + "%)");
      load(1, i++);
    }, 500)
    ipc.send("Git");
  }

  ipc.on("Git", (event, e) => {
    clearInterval(itemp);
    if (e) {
      console.log(e);
      hidePC();
      msg(0, "Pause!");
      return msg(2, "Unable to connect to \"git-scm.com\". Please check your network connection and try again!");
    }
    msg(1, "Downloading Git.exe (100%)");
    load(1, 100);
    setTimeout(() => {
      msg(1, "Installing Git...(0%)");
      load(1, 0);
    }, 100);
  })

  ipc.on("Git.isIT", (event, data) => {
    if (data == 0) return;
    if (data > 100) {
      load(1, 99);
      return msg(1, "Installing Git...(99%)");
    }
    load(1, data);
    msg(1, "Installing Git...(" + data + "%)");
    if (data == 100) {
      setTimeout(NIT, 100);

    }
  })

  ipc.on("Git.done", NIT);

  //NodeJS

  function NIT() {
    clearInterval(itemp)
    hidePC();
    msg(0, "Installing NodeJS...");
    load(0, 3);
    i = 0;
    showPC();
    itemp = setInterval(() => {
      if (i == 99) return clearInterval(itemp);
      msg(1, "Downloading Nodejs.exe...(" + i + "%)");
      load(1, i++);
    }, 100)
    ipc.send("NodeJS");
  }

  ipc.on("NodeJS", (event, e) => {
    clearInterval(itemp);
    if (e) {
      hidePC();
      msg(0, "Pause!");
      return msg(2, "Unable to connect to \"nodejs.org\". Please check your network connection and try again!");
    }
    msg(1, "Downloading NodeJS.exe (100%)");
    load(1, 100);
    setTimeout(() => {
      msg(1, "Installing NodeJS...(0%)");
      load(1, 0);
    }, 100);
  })

  ipc.on("NodeJS.isIT", (event, data) => {
    if (data == 0) return;
    if (data > 100) {
      load(1, 99);
      return msg(1, "Installing NodeJS...(99%)");
    }
    load(1, data);
    msg(1, "Installing NodeJS...(" + data + "%)");
    if (data == 100) setTimeout(IMD, 100);
  })
  ipc.on("NodeJS.done", IMD);

  //Module

  function IMD() {
    try{
      clearInterval(itemp);
    }catch(e){}
    hidePC();
    msg(0, "Installing Module...");
    load(0, 4);
    showPC();
    msg(1, "Getting started...")
    ipc.send("Module");
  }

  ipc.on("Module", (event, data) => {
    let per = data.per;
    load(1, per);
    msg(1, "Installing Module...(" + per + "%)");
    if (per == 100)
      setTimeout(VSM, 500)
  })

  ipc.on("t", (e, d) => {
    console.log(d.out); console.log(d.err); console.log(d.dir)
  })

  //VSmodule

  function VSM() {
    hidePC();
    load(0, 5);
    msg(0, "Installing Visual Studio Module...");
    showPC();
    msg(1, "Checking...");
    ipc.send("VSM");
  }
  ipc.on("VSM", () => {
    load(1, 100);
    setTimeout(Rebuild, 500);
  })

  //Rebuild

  function Rebuild() {
    hidePC();
    load(0, 6);
    msg(0, "Rebuilding module...");
    showPC();
    i = 0;
    itemp = setInterval(() => {
      if (i == 99) return clearInterval(itemp);
      msg(1, "Rebuilding module...(" + i + "%)");
      load(1, i++);
    }, 100000 / 100);
    ipc.send("Rebuild");
  }

  ipc.on("Rebuild.done", () => {
    clearInterval(itemp);
    load(1, 100);
    msg(1, "Rebuilding module...(100%)");
    setTimeout(DN, 500);
  });

  //done

  function DN() {
    load(0, 7);
    hidePC();
    msg(0, "All installed, congrats :3")
    msg(2, "All done. I will start the program for you, please wait!");
    setTimeout(() => {
      ipc.send("Start");
    }, 4000);
  }
})
//VS, python, Git, NodeJS, module, VSmodule , rebuild,