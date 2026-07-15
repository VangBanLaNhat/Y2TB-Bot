const { getUserInfo, getThreadInfo } = require("../../../src/core/services/infoService");
const { saveGlobal, restoreGlobal } = require("../../helpers/restoreGlobal");

describe("infoService", () => {
	beforeEach(() => {
		saveGlobal();
		global.userInfo = {};
		global.threadInfo = {};
	});

	afterEach(() => {
		restoreGlobal();
	});

	describe("getUserInfo", () => {
		it("returns user info from cache when available", async () => {
			global.userInfo["123"] = { name: "Cached User" };
			const result = await getUserInfo("123", null, {});
			expect(result).toEqual({ name: "Cached User" });
		});

		it("calls fake API when user info is missing from cache", async () => {
			const api = {
				getUserInfo: jest.fn().mockResolvedValue({ "123": { name: "Fetched User" } })
			};
			const event = { senderID: "456", isGroup: true }; // different sender or not group
			
			const result = await getUserInfo("123", api, event);
			expect(api.getUserInfo).toHaveBeenCalledWith("123");
			expect(result.name).toBe("Fetched User");
			expect(global.userInfo["123"].name).toBe("Fetched User");
		});

		it("stores fetched user info in cache if the current behavior does that", async () => {
			const api = {
				getUserInfo: jest.fn().mockResolvedValue({ "123": { name: "Fetched User" } })
			};
			const event = { senderID: "456", isGroup: true };
			
			await getUserInfo("123", api, event);
			expect(global.userInfo["123"].name).toBe("Fetched User");
			expect(global.userInfo["123"].timestamp).toBeDefined();
		});

		it("returns a safe fallback or rejects/handles error consistently when fake API fails", async () => {
			const api = {
				getUserInfo: jest.fn().mockRejectedValue(new Error("API Error"))
			};
			const event = { senderID: "456", isGroup: true };
			
			await expect(getUserInfo("123", api, event)).rejects.toThrow("API Error");
		});

		it("does not crash when input is missing or partial, if the current behavior supports that", async () => {
			const api = {
				getUserInfo: jest.fn().mockResolvedValue({ "undefined": { name: "Undefined User" } })
			};
			const event = {}; // Missing senderID and isGroup
			const result = await getUserInfo(undefined, api, event);
			expect(result.name).toBe("Undefined User");
		});
		
		it("fetches thread info if uid == event.senderID and isGroup is true", async () => {
			const api = {
				getThreadInfo: jest.fn().mockResolvedValue({
					threadID: "thread1",
					adminIDs: [],
					userInfo: [{ id: "123", name: "Thread User" }]
				})
			};
			const event = { senderID: "123", isGroup: true, threadID: "thread1" };
			const result = await getUserInfo("123", api, event);
			expect(api.getThreadInfo).toHaveBeenCalledWith("thread1");
			expect(result.name).toBe("Thread User");
			expect(global.userInfo["123"].name).toBe("Thread User");
			expect(global.threadInfo["thread1"]).toBeDefined();
		});
	});

	describe("getThreadInfo", () => {
		it("returns thread info from cache when available", async () => {
			global.threadInfo["thread1"] = { name: "Cached Thread" };
			const result = await getThreadInfo("thread1", null);
			expect(result).toEqual({ name: "Cached Thread" });
		});

		it("calls fake API when thread info is missing from cache", async () => {
			const api = {
				getThreadInfo: jest.fn().mockResolvedValue({
					threadID: "thread1",
					adminIDs: [{ id: "admin1" }],
					userInfo: [{ id: "user1", name: "User 1" }]
				})
			};
			const result = await getThreadInfo("thread1", api);
			expect(api.getThreadInfo).toHaveBeenCalledWith("thread1");
			expect(result.threadID).toBe("thread1");
			expect(result.adminIDs).toEqual(["admin1"]);
		});

		it("stores fetched thread info in cache if the current behavior does that", async () => {
			const api = {
				getThreadInfo: jest.fn().mockResolvedValue({
					threadID: "thread1",
					adminIDs: [],
					userInfo: [{ id: "user1", name: "User 1" }]
				})
			};
			await getThreadInfo("thread1", api);
			expect(global.threadInfo["thread1"]).toBeDefined();
			expect(global.userInfo["user1"]).toBeDefined();
		});

		it("handles fake API failure consistently", async () => {
			const api = {
				getThreadInfo: jest.fn().mockRejectedValue(new Error("API Error"))
			};
			await expect(getThreadInfo("thread1", api)).rejects.toThrow("API Error");
		});
		
		it("does not crash when input is missing or partial, if the current behavior supports that", async () => {
			const api = {
				getThreadInfo: jest.fn().mockResolvedValue({
					threadID: "undefined",
					adminIDs: [],
					userInfo: []
				})
			};
			const result = await getThreadInfo(undefined, api);
			expect(result.threadID).toBe("undefined");
		});
	});
});
