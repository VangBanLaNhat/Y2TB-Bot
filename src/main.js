/*
* Function created by C3C BotChat
* https://github.com/c3cbot/legacy-c3cbot
*/

const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");
const semver = require("semver");
const log = require("./core/util/log.js"); log.sync();

const ROOT = path.join(__dirname, "..");

(async () => {
  ensureExists(path.join(ROOT, "data"));
  // fs.writeFileSync(path.join(__dirname, "data", "isStart.txt"), "1");

  var nodeVersion = semver.parse(process.version);
  if (nodeVersion.major < 16) {
    console.error("MAIN", "ERROR: Node.JS 16+ required in this version!");
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
      console.log("MAIN", `7378278(RESTART) error code found. Restarting...`);
    }
    child = childProcess.spawn("node", ["--trace-warnings", path.join(__dirname, "index.js")], {
      cwd: ROOT,
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

      // fs.writeFileSync(path.join(__dirname, "data", "isStart.txt"), "0");
      process.exit();
    });
    child.on("error", function (err) {
      console.log();
      console.log("MAIN", "Error:" + err);
    });
  }
  await loader(true);
})();

function ensureExists(path, func, mask) {
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