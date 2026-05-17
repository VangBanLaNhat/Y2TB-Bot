# Y2TB-Bot

A lightweight Facebook Messenger bot built with Node.js. It supports core updates, a plugin system, and plugin auto update.

## Requirements
- Node.js 22+
- yarn
- A Facebook account or a pre-exported `fbstate.json`

## Quick Start
```bash
git clone https://github.com/VangBanLaNhat/Y2TB-Bot.git
cd Y2TB-Bot
yarn install

# Config
# 1) Copy config/config.env.example -> config/config.env
# 2) Edit values in config/config.env

yarn start
```

### Login Notes
- Prefer using `config/fbstate.json` (appstate) so you can log in without a password.
- If no appstate is available, set `Y2TB_CFG_FACEBOOK_FBEMAIL` and `Y2TB_CFG_FACEBOOK_FBPASSWORD` in `config/config.env`.

## Project Layout
```
.
├─ src/
│  ├─ main.js            # Supervisor/restart for src/index.js
│  ├─ index.js           # Main flow: update, load config/data/plugins, login
│  ├─ core/              # communication/, loadPlugins/, util/
├─ plugins/              # User plugins (each has plugin.json)
├─ config/               # Env config, fbstate/fbsstate, plugins/ and plugins-lock.json
├─ data/                 # data.json, user.json (runtime only)
├─ lang/                 # Language packs
├─ logs/                 # Rotating logs
├─ err.js                # Error helper (optional)
├─ package.json          # Yarn scripts and dependencies
└─ README.md
```

## Configuration
- Copy `config/config.env.example` to `config/config.env` and edit it.
- Environment prefixes:
  - Normal config: `Y2TB_CFG_<SECTION>_<KEY>`
  - Core config: `Y2TB_CORE_<SECTION>_<KEY>`

## Plugins
- Place plugins in `plugins/<pluginName>/` with a `plugin.json` file.
- Core loader lives in `src/core/loadPlugins/`.
- Per-plugin config is stored in `config/plugins/` and languages in `lang/<pluginName>/`.
- Plugin auto update uses `updateUrl` in `plugin.json`.

### Plugin Auto Update + Lock File
- If a plugin has `updateUrl`, the loader writes it to `config/plugins-lock.json`.
- On next start, if a plugin folder is missing, it will be restored from the zip at `updateUrl`.
- The restore folder name is derived from the zip file name (example: `Baucua.zip` -> `plugins/Baucua`).

## Data and Logs
- Runtime data: `data/data.json`, `data/user.json` (auto-saved; do not edit while running).
- Logs: `logs/` (rotated daily).

## Update Flow
- `src/index.js` checks the GitHub version, downloads to `update/`, and restarts with exit code `7378278`.
- Do not manually edit `update/`.

## Notes
- Do not commit runtime files: `data/`, `logs/`, `update/`, `config/config.env`, `config/fbstate.json`, `config/fbsstate.json`.
- If you move the project, update the `ROOT` constant in code.

## Useful Commands
- `yarn start` / `yarn test`: run the bot
- Stop: `Ctrl + C`

## License
ISC
