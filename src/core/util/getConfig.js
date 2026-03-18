var cf = require("./defaultConfig.js");

var dfcf = cf.normal();
var ccf = cf.core();

function parseEnvValue(raw, sample) {
    if (typeof sample === "boolean") {
        if (/^(1|true|yes|on)$/i.test(raw)) return true;
        if (/^(0|false|no|off)$/i.test(raw)) return false;
        return sample;
    }

    if (typeof sample === "number") {
        var n = Number(raw);
        return Number.isNaN(n) ? sample : n;
    }

    if (Array.isArray(sample)) {
        try {
            var parsedArr = JSON.parse(raw);
            if (Array.isArray(parsedArr)) return parsedArr;
        } catch (e) {}
        return raw.split(",").map(function (v) { return v.trim(); }).filter(Boolean);
    }

    if (sample && typeof sample === "object") {
        try {
            var parsedObj = JSON.parse(raw);
            if (parsedObj && typeof parsedObj === "object") return parsedObj;
        } catch (e) {}
        return sample;
    }

    return raw;
}

function applyEnvOverrides(target, prefix) {
    function walk(obj, trail) {
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var value = obj[key];
            var nextTrail = trail.concat(key);

            if (value && typeof value === "object" && !Array.isArray(value)) {
                walk(value, nextTrail);
                continue;
            }

            var envKey = (prefix + nextTrail.join("_")).replace(/[^A-Za-z0-9_]/g, "_").toUpperCase();
            if (process.env[envKey] !== undefined) {
                obj[key] = parseEnvValue(process.env[envKey], value);
            }
        }
    }

    walk(target, []);
    return target;
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function getConfig() {
    var returnConfig = clone(dfcf);
    return applyEnvOverrides(returnConfig, "Y2TB_CFG_");
}

function getCoreConfig() {
    var returnConfig = clone(ccf);
    return applyEnvOverrides(returnConfig, "Y2TB_CORE_");
}

module.exports = {
    getConfig: getConfig,
    getCoreConfig: getCoreConfig
};
