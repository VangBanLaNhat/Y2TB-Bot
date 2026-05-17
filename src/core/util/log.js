const lx = require("luxon");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..", "..");

if (!console.Log) console.Log = console.log;

let rewriteActive = false;
let rewriteLength = 0;

function format(Class, args) {
	let label = Class && typeof Class === "string" ? Class : "Manager";
	let messages = args;
	if (args.length > 1) {
		messages = args.slice(1);
		label = args[0] || "Manager";
	}
	return { label, messages };
}

function serializeMessage(message) {
	try {
		if (typeof message === "object") return JSON.stringify(message, null, 4);
		return String(message);
	} catch (_) {
		return String(message);
	}
}

function clearRewriteLine() {
	if (!rewriteActive) return;
	try {
		process.stdout.write("\n");
	} catch (_) {
		console.Log("");
	}
	rewriteActive = false;
	rewriteLength = 0;
}

function stripAnsi(text) {
	return String(text || "").replace(/\x1b\[[0-9;]*m/g, "");
}

function logWriter(level, icon, args) {
	clearRewriteLine();

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
			const serialized = messages.map(serializeMessage).join(" ");
			const line = [prefix, cls, level, serialized].join(" ");
			fs.writeFileSync(path.join(dirLogs, `${global.logStart}.txt`), line + "\n", { mode: 0o666, flag: "a" });
		}
	} catch (err) {
		// swallow logging errors
	}
}

function rewrite(...msg) {
	const { label, messages } = format("Manager", msg);
	const dt = lx.DateTime.now().setZone("Asia/Ho_Chi_Minh");
	const prefix = `[${dt.day}.${dt.month}T${dt.hour}.${dt.minute}.${dt.second}Z]`;
	const cls = `[${label}]`;
	const serialized = messages.map(serializeMessage).join(" ");

	const plainText = `${prefix} [ ⏳ ] ${cls} ${serialized}`;
	const visibleLength = stripAnsi(plainText).length;
	const padLength = Math.max(0, rewriteLength - visibleLength);
	const pad = padLength ? " ".repeat(padLength) : "";

	const consolePrefix = `\x1b[38;5;195m${prefix}`;
	const consoleClass = "\x1b[36m";
	const line = `${consolePrefix} [ ⏳ ] ${consoleClass}${cls} \x1b[38;5;195m${serialized}\x1b[0m`;

	try {
		process.stdout.write(`\r${line}${pad}`);
		rewriteActive = true;
		rewriteLength = visibleLength;
	} catch (_) {
		console.Log(line);
		rewriteActive = false;
		rewriteLength = 0;
	}
}

function rewriteDone(...msg) {
	if (msg.length > 0) rewrite(...msg);
	clearRewriteLine();
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
	console.rewrite = rewrite;
	console.rewriteDone = rewriteDone;
}

module.exports = {
	log,
	err,
	warn,
	rewrite,
	rewriteDone,
	blank,
	sync
}