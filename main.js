/*
* Function created by C3C BotChat
* https://github.com/c3cbot/legacy-c3cbot
*/


var log = require("./core/util/log.js");

console.logg = console.log;
console.log = log.log;
console.error = log.err;
console.warn = log.warn;
console.blank = log.blank;

(async () => {
  var childProcess = require("child_process");
  var fs = require("fs");
  var path = require("path");

  fs.writeFileSync(path.join(__dirname, "data", "isStart.txt"), "1");

  var semver = require("semver");
  var nodeVersion = semver.parse(process.version);
  if (nodeVersion.major < 12 || (nodeVersion.major == 12 && nodeVersion.minor < 9)) {
    console.error("MAIN", "ERROR: Node.JS 12+ (>=12.9) required in this version!");
    console.error("MAIN", "Node.JS version running this bot:", process.version);
    process.exit(1);
  }

  function spawn(cmd, arg) {
    return new Promise(resolve => {
      var npmProcess = childProcess.spawn(cmd, arg, {
        shell: true,
        stdio: "pipe",
        cwd: __dirname
      });
      npmProcess.on("close", function (code) {
        resolve(code);
      });
    });
  }

  async function loader(first) {
    if (!first) {
      console.log();
      console.log("MAIN",`7378278(RESTART) error code found. Restarting...`);
    }
    child = childProcess.spawn("node", ["--trace-warnings", "index.js"], {
      cwd: __dirname,
      maxBuffer: 16384 * 1024,
      stdio: 'inherit',
      shell: true
    });
    child.on("close", async (code) => {
      //UNIX, why? (limited to 8-bit)
      //Original code: 7378278
      if (code % 256 == 102) {
        await loader(false);
        return;
      }

      console.log();
      console.log("MAIN", `Function Index throw ${code} (not 7378278(RESTART)). Shutting down...`);
      fs.writeFileSync(path.join(__dirname, "data", "isStart.txt"), "0");
      process.exit();
    });
    child.on("error", function (err) {
      console.log();
      console.log("MAIN","Error:"+err);
    });
  }
  await loader(true);
})();