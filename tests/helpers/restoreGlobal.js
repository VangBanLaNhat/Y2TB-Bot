let snapshot = {};

function saveGlobal() {
    snapshot = { ...global };
}

function restoreGlobal() {
    // Delete keys that were added after saveGlobal
    for (const key of Object.keys(global)) {
        if (!(key in snapshot)) {
            delete global[key];
        }
    }
    // Restore keys to their values at the time of saveGlobal
    for (const key of Object.keys(snapshot)) {
        global[key] = snapshot[key];
    }
}

module.exports = { saveGlobal, restoreGlobal };
