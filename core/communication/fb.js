const login = require("fca-unofficial");
const fs = require("fs");
const path = require("path");
var log = require(path.join(__dirname, "..", "util", "log.js"));

let prefix = "/";

module.exports = (appState, loginOptions) => {
    var opts = loginOptions;
    delete opts["userAgent"];
	
    login({ appState }, opts, (err, api) => {
        if (err) {
            fs.unlinkSync(path.join(__dirname, "..", "..", "user_data_and_settings", "fbstate.json"));
            log.err("Login", err);
        }


        log.log("Manager","Login successfuly!");
		var stopListening = api.listenMqtt((err, event) => {
			if(err) return console.error(err);
			api.markAsRead(event.threadID, (err) => {
				if(err) console.error(err);
			});
			switch(event.type) {
				case "message":
					if(event.body === '/stop') {
						api.sendMessage("Goodbye…", event.threadID);
						return stopListening();
					}
					api.sendMessage("TEST BOT: " + event.body, event.threadID);
					break;
				case "event":
					console.log(event);
					break;
			}
		});
    })
}
