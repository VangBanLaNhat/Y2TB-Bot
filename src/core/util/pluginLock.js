const fs = require("fs");
const path = require("path");
const axios = require("axios");
const AdmZip = require("adm-zip");
const stripBom = require("strip-bom");
const log = require(path.join(__dirname, "log.js"));

const ROOT = path.join(__dirname, "..", "..", "..");
const dirPlugins = path.join(ROOT, "plugins");
const lockPath = path.join(ROOT, "config", "plugins-lock.json");

function ensureExists(dir, mask) {
  if (typeof mask !== "number") mask = 0o777;
  fs.mkdirSync(dir, { mode: mask, recursive: true });
}

function removeDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath);
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    if (fs.lstatSync(fullPath).isDirectory()) {
      removeDir(fullPath);
    } else {
      fs.unlinkSync(fullPath);
    }
  }
  fs.rmdirSync(dirPath);
}

function loadPluginLock() {
  ensureExists(path.join(ROOT, "config"));
  if (!fs.existsSync(lockPath)) return { plugins: {} };
  try {
    const raw = stripBom(fs.readFileSync(lockPath, { encoding: "utf8" }));
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { plugins: {} };
    return parsed;
  } catch (err) {
    log.warn("Plugins(Y2TB)", `Invalid plugins-lock.json: ${err.message || err}`);
    return { plugins: {} };
  }
}

function savePluginLock(entries) {
  ensureExists(path.join(ROOT, "config"));
  const payload = {
    updatedAt: new Date().toISOString(),
    plugins: entries || {}
  };
  fs.writeFileSync(lockPath, JSON.stringify(payload, null, 2) + "\n", { mode: 0o666 });
}

async function fetchZipBuffer(url) {
  const response = await axios.get(url, { responseType: "arraybuffer", timeout: 30000 });
  return Buffer.from(response.data);
}

function readZipManifest(zipBuffer) {
  const zip = new AdmZip(zipBuffer);
  const entry = zip.getEntries().find((item) => !item.isDirectory && path.basename(item.entryName) === "plugin.json");
  if (!entry) throw new Error("plugin.json not found in zip");

  const raw = stripBom(entry.getData().toString("utf8"));
  const manifest = JSON.parse(raw);
  const entryDir = path.dirname(entry.entryName);
  const rootDir = entryDir === "." ? "" : entryDir;

  return { manifest, rootDir };
}

function copyDir(sourcePath, destinationPath) {
  ensureExists(destinationPath);
  const files = fs.readdirSync(sourcePath);
  for (const file of files) {
    const sourceFile = path.join(sourcePath, file);
    const destinationFile = path.join(destinationPath, file);
    if (fs.lstatSync(sourceFile).isDirectory()) {
      copyDir(sourceFile, destinationFile);
    } else {
      fs.copyFileSync(sourceFile, destinationFile);
    }
  }
}

async function restoreMissingPlugins(lock) {
  if (!lock || !lock.plugins || typeof lock.plugins !== "object") return;
  const names = Object.keys(lock.plugins);
  if (!names.length) return;

  for (const name of names) {
    const entry = lock.plugins[name] || {};
    const updateUrl = typeof entry.updateUrl === "string" ? entry.updateUrl.trim() : "";
    if (!updateUrl) continue;
    const folderName = resolveFolderNameFromUrl(updateUrl, name);

    const pluginDir = path.join(dirPlugins, folderName);
    if (fs.existsSync(pluginDir)) continue;

    log.warn("Plugins(Y2TB)", `Missing plugin "${folderName}", restoring from updateUrl...`);
    const tempDir = path.join(dirPlugins, `.${folderName}.restore-${Date.now()}`);
    try {
      const zipBuffer = await fetchZipBuffer(updateUrl);
      const zipInfo = readZipManifest(zipBuffer);

      ensureExists(tempDir);
      const zip = new AdmZip(zipBuffer);
      zip.extractAllTo(tempDir, true);

      const pluginRoot = zipInfo.rootDir ? path.join(tempDir, zipInfo.rootDir) : tempDir;
      if (!fs.existsSync(path.join(pluginRoot, "plugin.json"))) {
        throw new Error("plugin.json missing after extraction");
      }

      copyDir(pluginRoot, pluginDir);
      removeDir(tempDir);
      log.log("Plugins(Y2TB)", `Restored plugin "${folderName}"`);
    } catch (err) {
      try {
        if (fs.existsSync(tempDir)) removeDir(tempDir);
      } catch (_) {}
      log.warn("Plugins(Y2TB)", `Failed to restore "${folderName}": ${err.message || err}`);
    }
  }
}

function resolveFolderNameFromUrl(updateUrl, fallbackName) {
  let baseName = "";
  try {
    const parsed = new URL(updateUrl);
    baseName = path.basename(parsed.pathname || "");
  } catch (_) {
    baseName = path.basename(String(updateUrl || "").split("?")[0]);
  }
  if (baseName.toLowerCase().endsWith(".zip")) {
    baseName = baseName.slice(0, -4);
  }
  return baseName || fallbackName;
}

module.exports = {
  loadPluginLock,
  savePluginLock,
  restoreMissingPlugins
};
