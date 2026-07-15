# How To Create A Plugin (New Structure)

This guide explains the new plugin structure you are using now: metadata is separate, language files are separate, and command logic stays in the main plugin JS file.

## 1. Plugin Folder Structure

Each plugin should look like this:

```text
plugins/<plugin_name>/
  |- <plugin_name>.js
  |- plugin.json
  |- lang/
      |- vi_VN.json
      |- en_US.json
```

Example:

```text
plugins/coinFlip/
  |- coinFlip.js
  |- plugin.json
  |- lang/vi_VN.json
  |- lang/en_US.json
```

## 2. What Each File Does

- `plugin.json`: plugin metadata, command definitions, and optional fields like `nodeDepends`, `config`, `chathook`, `onload`, `loginFunc`.
- `lang/vi_VN.json`, `lang/en_US.json`: language content using `desc`, `text`, and `args`.
- `<plugin_name>.js`: command logic and exported functions (`main`, `chathook`, etc.).

## 3. `plugin.json` Template

```json
{
  "pluginName": "Coin Flip",
  "pluginMain": "coinFlip.js",
  "desc": {
    "vi_VN": "Tung dong xu",
    "en_US": "Toss a coin"
  },
  "commandList": {
    "coinflip": {
      "help": {
        "vi_VN": "< s | n > [Tien cuoc]",
        "en_US": "< t | h > [Bet]"
      },
      "tag": {
        "vi_VN": "Tung dong xu",
        "en_US": "Toss a coin"
      },
      "mainFunc": "main",
      "example": {
        "vi_VN": "coinflip s 500",
        "en_US": "coinflip t 500"
      }
    }
  },
  "nodeDepends": {
    "axios": ""
  },
  "config": {
    "sampleRate": 100
  },
  "chathook": "onChat",
  "onload": "onLoad",
  "loginFunc": "onLogin",
  "updateUrl": "https://example.com/plugins/coinFlip.zip",
  "versionUrl": "https://example.com/plugins/coinFlip.version.txt",
  "author": "YourName",
  "version": "0.0.1"
}
```

Notes:

- If not needed, you can remove `nodeDepends`, `config`, `chathook`, `onload`, `loginFunc`.
- `pluginMain` must match the JS file name.
- For auto update:
  - `updateUrl` must be a direct .zip link containing `plugin.json` at or under the root.
  - If `versionUrl` exists, it should point to a plain text file with only the version string (example: `1.2.3`).
  - If `versionUrl` is missing, the updater reads the version from `plugin.json` inside the zip (downloaded to memory only for the check).

## 4. Language File Format

Each language key should use this format:

```json
{
  "<key>": {
    "desc": "Key description",
    "text": "Display text ... {placeholder}",
    "args": {
      "{placeholder}": "Placeholder description"
    }
  }
}
```

Example `lang/vi_VN.json`:

```json
{
  "wrong": {
    "desc": "Wrong syntax",
    "text": "Sai cu phap! Dung {prefix}help coinflip",
    "args": {
      "{prefix}": "Prefix"
    }
  }
}
```

Example `lang/en_US.json`:

```json
{
  "wrong": {
    "desc": "Wrong syntax",
    "text": "Wrong syntax! Use {prefix}help coinflip",
    "args": {
      "{prefix}": "Prefix"
    }
  }
}
```

Important:

- Keep the same keys in both `vi_VN.json` and `en_US.json`.
- Placeholders in `text` should match keys in `args`.

## 5. `<plugin>.js` Template (Current Style)

```javascript
const pluginInfo = require("./plugin.json");
const viLang = require("./lang/vi_VN.json");
const enLang = require("./lang/en_US.json");

function buildArgs(viArgs = {}, enArgs = {}) {
  const args = {};
  const keys = Array.from(new Set([
    ...Object.keys(viArgs),
    ...Object.keys(enArgs)
  ]));

  for (const key of keys) {
    args[key] = {
      vi_VN: viArgs[key] || "",
      en_US: enArgs[key] || ""
    };
  }

  return args;
}

function buildLangMap() {
  const langMap = {};
  const keys = Array.from(new Set([
    ...Object.keys(viLang),
    ...Object.keys(enLang)
  ]));

  for (const key of keys) {
    const viEntry = viLang[key] || {};
    const enEntry = enLang[key] || {};
    langMap[key] = {
      desc: viEntry.desc || enEntry.desc || "",
      vi_VN: viEntry.text || "",
      en_US: enEntry.text || "",
      args: buildArgs(viEntry.args, enEntry.args)
    };
  }

  return langMap;
}

function init() {
  return {
    ...pluginInfo,
    langMap: buildLangMap()
  };
}

function main(data, api, {rlang, replaceMap}) {
  if (!global.data.economy) {
    return api.sendMessage(
      "The Economy plugin has never been installed.",
      data.threadID,
      data.messageID
    );
  }

  let type = data.args[1];
  let bet = Number(data.args[2]);

  switch (type) {
    case "s":
    case "t":
      type = 0;
      break;
    case "n":
    case "h":
      type = 1;
      break;
    default:
      return api.sendMessage(replaceMap(rlang("wrong"), {
        "{prefix}": global.config.facebook.prefix
      }), data.threadID, data.messageID);
  }

  // command logic...
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  init,
  main
};
```

Notes:

- Based on your updated `plugins/coinFlip/coinFlip.js`, command logic is directly inside this JS file.
- Metadata/language are now separated into `plugin.json` and `lang/*.json`.

## 6. `adv` Object In Command/Chathook

Inside handlers such as `main(data, api, adv)`, you can use:

- `adv.pluginName`: plugin name.
- `adv.lang`: full language map of the plugin.
- `adv.rlang(key)`: get text by current language.
- `adv.iso639`: current language code, for example `vi_VN`.
- `adv.config`: plugin config from `config/plugins/<PluginName>.json`.
- `adv.replaceMap(str, map)`: replace placeholders in a string.

Example:

```javascript
const text = adv.replaceMap(adv.rlang("wrong"), {
  "{prefix}": global.config.facebook.prefix
});
```

## 7. Step-By-Step: Create A New Plugin

1. Create folder `plugins/<plugin_name>/`.
2. Create `plugin.json` with metadata and `commandList`.
3. Create `lang/vi_VN.json` and `lang/en_US.json` using `desc/text/args` format.
4. Create `<plugin_name>.js` and implement command/chathook/login logic as needed.
5. Ensure `module.exports` includes the functions your plugin uses.
6. Ensure each command `mainFunc` in `plugin.json` matches function names in JS.
7. Start the bot and test commands.

## 8. Common Mistakes

- `mainFunc` in `plugin.json` does not match a real function name in JS.
- `pluginMain` does not match the real JS filename.
- Keys mismatch between `vi_VN.json` and `en_US.json`.
- Placeholders in `text` are missing in `args`.
- Forgot to export required functions in `module.exports`.

## 9. Useful Global Variables

- `global.data`: bot data store.
- `global.config`, `global.coreconfig`: bot configuration.
- `global.temp`: temporary runtime data.
- `global.lang`: loaded language maps.
- `global.configPl`: loaded plugin configs.

## 10. Reference

- FCA docs: https://github.com/VangBanLaNhat/fca-unofficial/blob/master/DOCS.md

---

Tip: You can copy `plugins/coinFlip/` as a starter template, then rename files, commands, and language text.