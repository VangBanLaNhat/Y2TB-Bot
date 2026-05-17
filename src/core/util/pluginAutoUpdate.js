const fs = require("fs");
const path = require("path");
const axios = require("axios");
const AdmZip = require("adm-zip");
const stripBom = require("strip-bom");
const log = require(path.join(__dirname, "log.js"));

const ROOT = path.join(__dirname, "..", "..", "..");
const PLUGINS_DIR = path.join(ROOT, "plugins");
const TEMP_ROOT = path.join(ROOT, "update-plugins");

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

function readPluginManifest(pluginDir) {
  const manifestPath = path.join(pluginDir, "plugin.json");
  if (!fs.existsSync(manifestPath) || !fs.lstatSync(manifestPath).isFile()) return null;
  const raw = stripBom(fs.readFileSync(manifestPath, { encoding: "utf8" }));
  return JSON.parse(raw);
}

async function fetchText(url) {
  const response = await axios.get(url, { responseType: "text", timeout: 20000 });
  return String(response.data || "").trim();
}

async function fetchZipBuffer(url) {
  const response = await axios.get(url, { responseType: "arraybuffer", timeout: 30000 });
  return Buffer.from(response.data);
}

function readZipManifest(zipBuffer) {
  const zip = new AdmZip(zipBuffer);
  const entry = zip.getEntries().find((item) => !item.isDirectory && path.basename(item.entryName) === "plugin.json");
  if (!entry) throw new Error("plugin.json not found in update zip");

  const raw = stripBom(entry.getData().toString("utf8"));
  const manifest = JSON.parse(raw);
  const entryDir = path.dirname(entry.entryName);
  const rootDir = entryDir === "." ? "" : entryDir;

  return { manifest, rootDir };
}

function resolvePluginRoot(tempDir, rootDir) {
  return rootDir ? path.join(tempDir, rootDir) : tempDir;
}

function replacePluginFolder(sourceDir, targetDir) {
  const backupDir = `${targetDir}.bak`;
  if (fs.existsSync(backupDir)) removeDir(backupDir);

  let hasBackup = false;
  if (fs.existsSync(targetDir)) {
    fs.renameSync(targetDir, backupDir);
    hasBackup = true;
  }

  try {
    copyDir(sourceDir, targetDir);
    if (hasBackup) removeDir(backupDir);
  } catch (err) {
    if (fs.existsSync(targetDir)) removeDir(targetDir);
    if (hasBackup && fs.existsSync(backupDir)) {
      fs.renameSync(backupDir, targetDir);
    }
    throw err;
  }
}

async function updatePluginFromZip(pluginName, pluginDir, zipBuffer, rootDir) {
  const tempDir = path.join(TEMP_ROOT, `${pluginName}-${Date.now()}`);
  ensureExists(tempDir);

  const zip = new AdmZip(zipBuffer);
  zip.extractAllTo(tempDir, true);

  const pluginRoot = resolvePluginRoot(tempDir, rootDir);
  const pluginManifest = path.join(pluginRoot, "plugin.json");
  if (!fs.existsSync(pluginManifest)) {
    throw new Error("plugin.json missing after extraction");
  }

  replacePluginFolder(pluginRoot, pluginDir);
  removeDir(tempDir);
}

async function autoUpdatePlugins() {
  if (!fs.existsSync(PLUGINS_DIR)) {
    log.warn("Plugins(Update)", "Plugins folder not found; skip auto update.");
    return;
  }

  if (fs.existsSync(TEMP_ROOT)) removeDir(TEMP_ROOT);
  ensureExists(TEMP_ROOT);

  const pluginDirs = fs.readdirSync(PLUGINS_DIR).filter((name) => {
    const fullPath = path.join(PLUGINS_DIR, name);
    return fs.lstatSync(fullPath).isDirectory();
  });

  if (!pluginDirs.length) {
    log.warn("Plugins(Update)", "No plugin folders found.");
    return;
  }

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const pluginName of pluginDirs) {
    const pluginDir = path.join(PLUGINS_DIR, pluginName);
    let manifest;
    try {
      manifest = readPluginManifest(pluginDir);
    } catch (err) {
      failed++;
      log.warn("Plugins(Update)", `Invalid plugin.json for ${pluginName}: ${err.message || err}`);
      continue;
    }

    if (!manifest || !manifest.updateUrl || typeof manifest.updateUrl !== "string") {
      skipped++;
      continue;
    }

    const updateUrl = manifest.updateUrl.trim();
    if (!updateUrl) {
      skipped++;
      continue;
    }

    const currentVersion = String(manifest.version || "").trim();
    let latestVersion = "";
    let zipBuffer = null;
    let rootDir = "";

    try {
      if (manifest.versionUrl && typeof manifest.versionUrl === "string" && manifest.versionUrl.trim() !== "") {
        latestVersion = await fetchText(manifest.versionUrl.trim());
      } else {
        zipBuffer = await fetchZipBuffer(updateUrl);
        const zipInfo = readZipManifest(zipBuffer);
        latestVersion = String(zipInfo.manifest.version || "").trim();
        rootDir = zipInfo.rootDir;
      }
    } catch (err) {
      failed++;
      log.warn("Plugins(Update)", `Failed to check ${pluginName} version: ${err.message || err}`);
      continue;
    }

    if (!latestVersion || latestVersion === currentVersion) {
      skipped++;
      continue;
    }

    try {
      if (!zipBuffer) {
        zipBuffer = await fetchZipBuffer(updateUrl);
        const zipInfo = readZipManifest(zipBuffer);
        rootDir = zipInfo.rootDir;
      }

      log.log("Plugins(Update)", `Updating ${pluginName} ${currentVersion || "unknown"} -> ${latestVersion}`);
      await updatePluginFromZip(pluginName, pluginDir, zipBuffer, rootDir);
      updated++;
    } catch (err) {
      failed++;
      log.warn("Plugins(Update)", `Failed to update ${pluginName}: ${err.message || err}`);
    }
  }

  try {
    if (fs.existsSync(TEMP_ROOT)) removeDir(TEMP_ROOT);
  } catch (err) {
    log.warn("Plugins(Update)", `Failed to clean temp folder: ${err.message || err}`);
  }

  log.log("Plugins(Update)", `Done. Updated: ${updated}, skipped: ${skipped}, failed: ${failed}`);
}

module.exports = autoUpdatePlugins;
