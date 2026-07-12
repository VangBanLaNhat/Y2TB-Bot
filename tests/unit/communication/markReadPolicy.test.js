const { shouldMarkAsRead } = require("../../../src/core/communication/markReadPolicy");

describe("shouldMarkAsRead", () => {
	it("false config does not mark read", () => {
		const config = { facebook: { autoMarkRead: false } };
		const event = { type: "message", threadID: "123" };
		expect(shouldMarkAsRead(config, event)).toBe(false);
	});

	it("true config and normal event marks read", () => {
		const config = { facebook: { autoMarkRead: true } };
		const event = { type: "message", threadID: "123" };
		expect(shouldMarkAsRead(config, event)).toBe(true);
	});

	it("e2ee_message does not mark read", () => {
		const config = { facebook: { autoMarkRead: true } };
		const event = { type: "e2ee_message", threadID: "123" };
		expect(shouldMarkAsRead(config, event)).toBe(false);
	});

	it("missing threadID does not mark read", () => {
		const config = { facebook: { autoMarkRead: true } };
		const event = { type: "message" }; // no threadID
		expect(shouldMarkAsRead(config, event)).toBe(false);
	});

	it("missing config does not crash", () => {
		const event = { type: "message", threadID: "123" };
		expect(shouldMarkAsRead(undefined, event)).toBe(false);
		expect(shouldMarkAsRead({}, event)).toBe(false);
	});
});
