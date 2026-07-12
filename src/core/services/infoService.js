const path = require("path");

function normalizeAdminIDs(adminIDs) {
	if (!Array.isArray(adminIDs)) return [];
	return adminIDs
		.map((item) => (item && typeof item === "object") ? item.id : item)
		.filter(Boolean)
		.map((id) => String(id));
}

async function getUserInfo(uid, api, event, callback) {
	if (global.userInfo[uid]) {
		if (callback) return callback(undefined, global.userInfo[uid]);
		return global.userInfo[uid];
	}
	if (uid != event.senderID || !event.isGroup) {
		try {
			var UI = (await api.getUserInfo(uid))[uid];
		} catch (e) {
			if (callback) return callback(e);
			throw new Error(e);
		}
		global.userInfo[uid] = Object.assign({}, UI);
		let time = new Date();
		global.userInfo[uid].timestamp = time.getTime();
	} else {
		try {
			var threadInfo = await api.getThreadInfo(event.threadID);
		} catch (e) {
			if (callback) return callback(e);
			throw new Error(e);
		}
		for (let user of threadInfo.userInfo) {
			global.userInfo[user.id] = user;
			let time = new Date();
			global.userInfo[user.id].timestamp = time.getTime();
		}
		threadInfo.adminIDs = normalizeAdminIDs(threadInfo.adminIDs);
		global.threadInfo[threadInfo.threadID] = threadInfo;
		delete global.threadInfo[threadInfo.threadID].userInfo;
	}
	if (callback) return callback(undefined, global.userInfo[uid]);
	return global.userInfo[uid];
}

async function getThreadInfo(tid, api, callback) {
	if (!global.threadInfo[tid]) {
		try {
			var threadInfo = await api.getThreadInfo(tid);
		} catch (e) {
			if (callback) return callback(e);
			throw new Error(e);
		}
		for (let user of threadInfo.userInfo) {
			global.userInfo[user.id] = user;
			let time = new Date();
			global.userInfo[user.id].timestamp = time.getTime();
		}
		threadInfo.adminIDs = normalizeAdminIDs(threadInfo.adminIDs);
		global.threadInfo[threadInfo.threadID] = threadInfo;
		delete global.threadInfo[threadInfo.threadID].userInfo;
	}
	if (callback) return callback(undefined, global.threadInfo[tid]);
	return global.threadInfo[tid];
}

module.exports = {
	getUserInfo,
	getThreadInfo
};
