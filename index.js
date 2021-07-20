//require stuffs
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const login = require("fca-unofficial");
const readline = require("readline");
var log = require("./core/util/log.js");


//config loader
log.blank();
log.log("Config", "Loading config...");
try{
	global.config = require("./core/util/getConfig.js").getConfig();
	global.coreconfig = require("./core/util/getConfig.js").getCoreConfig();
	log.log("Config", "Loading config success!");
	log.blank();
}
catch(err){
	console.log(err);
    log.err("Config", "Can't load Config. Existing...");
	log.blank();
    process.exit(101);
}



//credentials loader
let fbCredentials = {
    email: global.config.facebook.FBemail,
    password: global.config.facebook.FBpassword
}
log.log("Manager", "Loading User-credentials...");
//log.log("Manager", `Appstate: ${(fs.existsSync(path.join(__dirname, "user_data_and_settings", "fbstate.json"))) ? "Yes" : "No"}`, `Email: ${(fbCredentials.email == "") ? `""` : fbCredentials.email}`, `Password: ${(fbCredentials.password == "") ? `""` : fbCredentials.password}`);
fs.existsSync(path.join(__dirname, "user_data_and_settings", "fbstate.json")) ? log.log("Manager", `=> login account using Appstate`) : ((fbCredentials.email == "" && fbCredentials.password == "") ? log.err("Manager", "=> No Appstate and FBCredentials blank ", "=> Unable to login!") : log.log("Manager", `=> login account using FBCredentials`))
log.blank();

//login facebook!!!
var loginstate;
(!(fs.existsSync(path.join(__dirname, "user_data_and_settings", "fbstate.json"))) && fbCredentials.email == "" && fbCredentials.password == "") ? loginstate = false : loginstate = true
if(loginstate){
	let loginOptions = {
		"logLevel": global.coreconfig.facebook.logLevel,
		"userAgent": global.coreconfig.facebook.userAgent,
		"selfListen": global.config.facebook.selfListen,
		"listenEvents": global.coreconfig.facebook.listenEvents,
		"updatePresence": global.coreconfig.facebook.updatePresence,
		"autoMarkRead": global.config.facebook.autoMarkRead
	}
	log.log("Manager", "Logging...")
	let appStatePath = path.join(__dirname, "user_data_and_settings", "fbstate.json");
	let appState = {};
	if (fs.existsSync(appStatePath)) {
		//login using appstate
		appState = JSON.parse(fs.readFileSync(appStatePath, "utf-8"));
		require("./core/communication/fb.js")(appState, loginOptions);
	} else {
		//login using credentials then create appstate
		log.log("Manager", "Creating appstate for further login...");
		var rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
		login(fbCredentials, loginOptions, (err, api) => {
			console.log(err);
			if (err) {
				switch (err.error) {
					case 'login-approval':
						log.log("Login","Account detected with 2-step verification (2-FA) enabled\nPlease enter verification code to continue");
						rl.question("Verification code: ", (code) => {
							err.continue(code);
							rl.close();
						});
						break;
					default:
						log.err("login" ,err);
				}
				return;
			}

			appState = api.getAppState();
			require("./core/communication/fb.js")(appState, loginOptions);
			fs.writeFileSync(appStatePath, JSON.stringify(appState, null, "\t"));
		});
	}
}

