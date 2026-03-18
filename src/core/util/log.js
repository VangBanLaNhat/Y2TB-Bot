const lx = require("luxon");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..", "..");

if (!console.Log) console.Log = console.log;

function format(Class, args) {
	let label = Class && typeof Class === "string" ? Class : "Manager";
	let messages = args;
	if (args.length > 1) {
		messages = args.slice(1);
		label = args[0] || "Manager";
	}
	return { label, messages };
}

function logWriter(level, icon, args) {
	const { label, messages } = format("Manager", args);
	const dt = lx.DateTime.now().setZone("Asia/Ho_Chi_Minh");
	const prefix = `[${dt.day}.${dt.month}T${dt.hour}.${dt.minute}.${dt.second}Z]`;
	const cls = `[${label}]`;
	const consolePrefix = `\x1b[38;5;195m${prefix}`;
	const consoleClass = "\x1b[36m";
	console.Log(consolePrefix, icon, consoleClass, cls, "\x1b[38;5;195m", ...messages, "\x1b[0m");

	try {
		if (global.coreconfig.main_bot.toggleLog) {
			const dirLogs = path.join(ROOT, "logs");
			fs.mkdirSync(dirLogs, { recursive: true });
			const serialized = messages.map(m => typeof m === "object" ? JSON.stringify(m, null, 4) : String(m)).join(" ");
			const line = [prefix, cls, level, serialized].join(" ");
			fs.writeFileSync(path.join(dirLogs, `${global.logStart}.txt`), line + "\n", { mode: 0o666, flag: "a" });
		}
	} catch (err) {
		// swallow logging errors
	}
}

function log(...msg) {
	logWriter("[INFO]", "[ 🔔 ]", msg);
}

function err(...msg) {
	logWriter("[ERR!]", "[ ❌ ]", msg);
}

function warn(...msg) {
	logWriter("[WARN]", "[ ❕ ]", msg);
}

function blank() {
	console.Log("\r");
}

function sync() {
	console.Log = console.log;
	console.log = log;
	console.error = err;
	console.warn = warn;
	console.blank = blank;
}

module.exports = {
	log,
	err,
	warn,
	blank,
	sync
}