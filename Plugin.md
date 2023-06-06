# Creating a New Plugin for Y2TB bot

This document will guide you through the process of creating a new plugin for Y2TB. Plugins allow you to extend the functionality of the program by adding custom commands and features. You will be following the structure and conventions used in the sample plugin provided.

## Plugin Structure

A plugin in Y2TB bot consists of a JavaScript file that exports a set of functions and configuration options. The structure of a plugin is as follows:

```javascript
function init() {
	return {
		"pluginName": "Name of the plugin",
		"pluginMain": "Name of the plugin file",
		"desc": {
			"vi_VN": "Briefly describe the plugin's function in Vietnamese",
			"en_US": "Briefly describe the plugin's function in English"
		},
		"commandList": {
			"Command 1": {
				"help": {
					"vi_VN": "How to use command 1 in Vietnamese",
					"en_US": "How to use command 1 in English"
				},
				"tag": {
					"vi_VN": "Command description in Vietnamese",
					"en_US": "Command description in English"
				},
				"mainFunc": "cmd1", //function name of command 1
				"example": {
					"vi_VN": "Vietnamese example",
					"en_US": "English example"
				}
			},
			"Command 2": {
				"help": {
					"vi_VN": "How to use command 2 in Vietnamese",
					"en_US": "How to use command 2 in English"
				},
				"tag": {
					"vi_VN": "Command description in Vietnamese",
					"en_US": "Command description in English"
				},
				"mainFunc": "cmd2", //function name of command 2
				"example": {
					"vi_VN": "Vietnamese example",
					"en_US": "English example"
				}
			},
		},
		"nodeDepends": {
			//List of required node_modules of the plugin
			"node_module1": "1.1.1",
			"node_module2": "1.1.1"
		},
		"langMap":{
            "translation code 1":{
                "desc": "Describe the function of translation",
                "vi_VN": "Translation in Vietnamese {0}",
                "en_US": "Translation in English {0}",
                "args": {
                	"{0}":{
                		"vi_VN": "Describe the function of the variable in Vietnamese",
                		"en_US": "Describe the function of the variable in English"
                	}
                }
            },
            "translation code 2":{
                "desc": "Describe the function of translation",
                "vi_VN": "Translation in Vietnamese {1}",
                "en_US": "Translation in English {1}",
                "args": {
                	"{1}":{
                		"vi_VN": "Describe the function of the variable in Vietnamese",
                		"en_US": "Describe the function of the variable in English"
                	}
                }
            }
        },
		"config": {
		    "config 1": "value 1",
		    "config 2": "value 2"
		},
		"chathook": "np", //function will always be called when receiving message even without prefix
		"onload": "onload", //function will be run during plugin load
		"loginFunc": "login", //Function will be called on successful Facebook login
		"author": "Creator's name",
		"version": "Plugin version"
	}
}

function cmd1(data, api, adv) {
	//the data variable will contain the message data
  
	//api variable will contain bot control functions
  
	const {pluginName, lang, rlang, iso639, config, replaceMap} = adv
	//The variable pluginName will contain the plugin Name
  
	//The variable lang will contain the lang map declared in the plugins init functions
  
    /*
    *rlang is a function that will return the corresponding translation when passed the translation code.
    */
	//For example: 
    let langTemp = rlang("translation code 1")
    //Now the langTemp variable will store the value "Translation in English {0}"
  
	//The iso639 variable will save the language code in iso639 format. Example: en_US
  
	//The config variable will store the plugin's settings as declared in the init functions
  
	/*
    *replaceMap is a function that will automatically replace values based on a json object entered by the user
    */
	//For example:
	let map = {
		"{0}": "botchat",
		"{1}": "Y2TB"
	}
	let str = "I'm a {0} named {1}"
    let res = replaceMap(str, map)
	//Now the res variable will store the value "I'm a botchat named Y2TB"
}
function cmd2(data, api, adv){
	//code
}
function chathook(data, api, adv){
	//code
}
function onload(info){
	//The variable info will store all the data returned from the init . function
}
function login(api, adv){
	//code
}

module.exports = {
	cmd1,
	cmd2,
	chathook,
	onload,
	login,
	init
};
```
## Plugin Functions
- init(): The initialization function that sets up the plugin and returns an object containing plugin metadata, command definitions, language translations, etc. This function is called when the plugin is loaded.

- cmd1(data, api, adv): Implementation of Command 1. This function is executed when Command 1 is triggered by a user.

- cmd2(data, api, adv): Implementation of Command 2. This function is executed when Command 2 is triggered by a user.

- chathook(data, api, adv): Function that is always called when a message is received, even without a prefix. Useful for implementing chat-related features or message handling logic.

- onload(info): Function that is executed during plugin load. It receives an info object containing data returned from the init() function. You can use this function to perform additional setup tasks or configurations.

- login(api, adv): Function that is called upon successful Facebook login. Use this function to handle any actions or logic specific to the login process.

## Plugin Configuration
- pluginName: The name of the plugin.

- pluginMain: The name of the plugin file.

- desc: An object containing brief descriptions of the plugin's function in different languages.

- commandList: An object containing the definitions of each command supported by the plugin. Each command has properties like help, tag, mainFunc, example, etc.

- nodeDepends: An object listing the required node_modules for the plugin.

- langMap: An object containing language translations for various parts of the plugin. Each translation has a unique translation code and can include language-specific descriptions and arguments.

- config: An object containing configuration options specific to the plugin.

- chathook: The name of the function that will be called when receiving a message, even without a prefix.

- onload: The name of the function that will be run during plugin load.

- loginFunc: The name of the function that will be called on successful Facebook login.

- author: The name of the plugin's creator.

- version: The version of the plugin.

## Customizing the Plugin
To create your own plugin, you can follow these steps:

1. Create a new JavaScript file with a descriptive name for your plugin.

2. Copy the structure of the sample plugin provided and customize it to fit your needs.

3. Implement the plugin functions (init, cmd1, cmd2, chathook, onload, login) based on the desired functionality of your plugin.

4. Customize the plugin configuration options (pluginName, desc, commandList, etc.) according to your plugin's requirements.

5. Add any additional functions or logic specific to your plugin's functionality.

6. Test your plugin by loading it into Y2TB bot.

7. Document any additional usage instructions or features specific to your plugin.

8. Share your plugin with others and encourage them to create their own plugins based on the provided template.
