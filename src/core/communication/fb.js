const login = require("fca-unofficial")
const fs = require("fs");
const path = require("path");
const listen = require(path.join(__dirname, "listen.js"))
var log = require(path.join(__dirname, "..", "util", "log.js"));

const ROOT = path.join(__dirname, "..", "..", "..");
const DEFAULT_FBSTATE_AUTOSAVE_MINUTES = 30;

function resolveFbStatePath(opts) {
    if (opts && typeof opts.fbStatePath === "string" && opts.fbStatePath.trim() !== "") {
        return opts.fbStatePath;
    }
    return path.join(ROOT, "config", "fbstate.json");
}

function resolveFbStateAutoSaveMinutes(opts) {
    var minutes = Number(opts && opts.fbStateAutoSaveMinutes);
    if (!Number.isFinite(minutes) || minutes <= 0) {
        minutes = DEFAULT_FBSTATE_AUTOSAVE_MINUTES;
    }
    return minutes;
}

function writeFbState(api, fbStatePath) {
    if (!api || typeof api.getAppState !== "function") {
        throw new Error("getAppState is not available on current API instance");
    }

    var appState = api.getAppState();
    if (!Array.isArray(appState) || appState.length === 0) {
        throw new Error("Received empty appState");
    }

    fs.mkdirSync(path.dirname(fbStatePath), { recursive: true });
    fs.writeFileSync(fbStatePath, JSON.stringify(appState, null, "\t"), { mode: 0o666 });
}

function startFbStateAutoSave(api, opts) {
    var fbStatePath = resolveFbStatePath(opts);
    var intervalMinutes = resolveFbStateAutoSaveMinutes(opts);
    var intervalMs = Math.max(1000, Math.floor(intervalMinutes * 60 * 1000));

    if (global.fbStateAutoSaveTimer) {
        clearInterval(global.fbStateAutoSaveTimer);
        global.fbStateAutoSaveTimer = null;
    }

    try {
        writeFbState(api, fbStatePath);
        log.log("Facebook", "Saved fbstate at login: " + fbStatePath);
    } catch (saveErr) {
        log.warn("Facebook", "Initial fbstate save failed: " + (saveErr && saveErr.message ? saveErr.message : saveErr));
    }

    global.fbStateAutoSaveTimer = setInterval(function () {
        try {
            writeFbState(api, fbStatePath);
            log.log("Facebook", "Auto-updated fbstate: " + fbStatePath);
        } catch (saveErr) {
            log.warn("Facebook", "Auto-update fbstate failed: " + (saveErr && saveErr.message ? saveErr.message : saveErr));
        }
    }, intervalMs);

    if (typeof global.fbStateAutoSaveTimer.unref === "function") {
        global.fbStateAutoSaveTimer.unref();
    }

    log.log("Facebook", "Auto-update fbstate every " + intervalMinutes + " minutes.");
}

module.exports = async (appState, loginOptions) => {
    var opts = Object.assign({}, loginOptions || {});
    delete opts["userAgent"];
	
    login({ appState }, opts, async (err, api) => {
        if (err) {
            const fbStatePath = path.join(ROOT, "config", "fbstate.json");
            const fbStateAlt = path.join(ROOT, "config", "fbsstate.json");
            if (fs.existsSync(fbStatePath)) fs.unlinkSync(fbStatePath);
            else if (fs.existsSync(fbStateAlt)) fs.unlinkSync(fbStateAlt);
            log.err("Login", err);
            process.exit(1);
        }
        if(!global.botid){
            global.botid = api.getCurrentUserID()+"";
            //global.fbapi = api;
        }


        log.log("Manager","Login successfuly!");
        startFbStateAutoSave(api, opts);

        if (opts.enableE2EE && opts.e2eeAutoConnect !== false && typeof api.connectE2EE === "function") {
            try {
                await new Promise((resolve, reject) => {
                    api.connectE2EE((connectErr) => {
                        if (connectErr) return reject(connectErr);
                        resolve();
                    });
                });
                log.log("E2EE", `Connected (device: ${opts.e2eeDevicePath || "default"})`);
            } catch (connectErr) {
                log.warn("E2EE", `Connect failed: ${connectErr && connectErr.message ? connectErr.message : connectErr}`);
            }
        }

        for(let i in global.plugins.Y2TB.plugins){
            try{
            	let adv = {
            		pluginName: i,
            		lang: global.lang[i],
            		rlang: (inp)=>{
                    		return global.lang[i][inp][global.config.bot_info.lang];
                    	},
            		iso639: global.config.bot_info.lang,
            		config: global.configPl[i],
            		replaceMap: replaceMap,
            		getUserInfo: api.getUserInfo,
                    getThreadInfo: api.getThreadInfo
            	};
                await global.plugins.Y2TB.plugins[i].loginFunc(api, adv);
                delete global.plugins.Y2TB.plugins[i].loginFunc;
            } catch(e){}
        }
        try{
		  api.listenMqtt((err, event) => {
		  	listen(err, event, api);
		  });
        } catch (e) {/*console.error("ListenMqtt", e)*/};
    })
}

function replaceMap(str, map){
 str = str+"";
	for(let i in map)
		str = str.replaceAll(i, map[i]);
	return str;
}