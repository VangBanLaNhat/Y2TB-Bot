const path = require("path");
var log = require(path.join(__dirname, "..", "util", "log.js"));

async function mess (event, api){
    var sim = require(path.join(__dirname, "mainPlugin", "csim.js"));
    
    !global.data.testmode ? global.data.testmode = {} : "";
    !global.data.testmode[event.threadID] ? global.data.testmode[event.threadID] = false : "";
    
    if (global.data.testmode[event.threadID]){
	    if(event.body === `${global.config.facebook.prefix}stop`) {
	        api.sendMessage("Goodbye…", event.threadID);
	        global.data.testmode[event.threadID] = false
		}
		else{
		    sim(event, api).then(function(rt){
		        log.log("Plugin", rt);
		    });
		    
	        //api.sendMessage("TEST BOT: " + event.body, event.threadID);
		}
    }
    else{
        if(event.body === `${global.config.facebook.prefix}start`) {
	        api.sendMessage("Started listen...", event.threadID);
	        global.data.testmode[event.threadID] = true
		}
    }
	log.log("Message", `[${event.senderID} to ${event.threadID}] ${event.body}`);
}

async function listen(err, event, api){
    if(err) return log.err(err);
			api.markAsRead(event.threadID, (err) => {
				if(err) log.err(err);
			});
			
			switch(event.type) {
				case "message":
				    mess(event, api);
					break;
				case "event":
					log.log(event);
					break;
			}
}

module.exports = listen;