const { getConfig, getCoreConfig } = require("../../../src/core/util/getConfig");

describe("config parser", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		jest.resetModules();
		process.env = { ...originalEnv };
	});

	afterAll(() => {
		process.env = originalEnv;
	});

	it("parses Y2TB_CORE_UPDATE_AUTO correctly", () => {
		process.env.Y2TB_CORE_UPDATE_AUTO = "true";
		let coreConfig = getCoreConfig();
		expect(coreConfig.update.auto).toBe(true);

		process.env.Y2TB_CORE_UPDATE_AUTO = "false";
		coreConfig = getCoreConfig();
		expect(coreConfig.update.auto).toBe(false);
	});

	it("parses Y2TB_CFG_FACEBOOK_AUTOMARKREAD correctly", () => {
		process.env.Y2TB_CFG_FACEBOOK_AUTOMARKREAD = "true";
		let config = getConfig();
		expect(config.facebook.autoMarkRead).toBe(true);

		process.env.Y2TB_CFG_FACEBOOK_AUTOMARKREAD = "false";
		config = getConfig();
		expect(config.facebook.autoMarkRead).toBe(false);
	});
});
