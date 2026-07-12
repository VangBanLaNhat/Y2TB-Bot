const { parseEnvConfig } = require("../../../src/core/util/getConfig");

describe("envParser", () => {
	it("parses true/false strings to real booleans for core config", () => {
		const env = {
			"Y2TB_CORE_UPDATE_AUTO": "true"
		};
		const defaults = {
			update: { auto: false }
		};

		const result = parseEnvConfig(env, defaults, "Y2TB_CORE_");
		expect(result.update.auto).toBe(true);

		const envFalse = {
			"Y2TB_CORE_UPDATE_AUTO": "false"
		};
		const resultFalse = parseEnvConfig(envFalse, defaults, "Y2TB_CORE_");
		expect(resultFalse.update.auto).toBe(false);
	});

	it("parses true/false strings to real booleans for facebook config", () => {
		const env = {
			"Y2TB_CFG_FACEBOOK_AUTOMARKREAD": "true"
		};
		const defaults = {
			facebook: { autoMarkRead: false }
		};

		const result = parseEnvConfig(env, defaults, "Y2TB_CFG_");
		expect(result.facebook.autoMarkRead).toBe(true);

		const envFalse = {
			"Y2TB_CFG_FACEBOOK_AUTOMARKREAD": "false"
		};
		const resultFalse = parseEnvConfig(envFalse, defaults, "Y2TB_CFG_");
		expect(resultFalse.facebook.autoMarkRead).toBe(false);
	});

	it("falls back to defaults if env value is missing", () => {
		const env = {};
		const defaults = {
			update: { auto: false },
			facebook: { autoMarkRead: true }
		};

		const coreResult = parseEnvConfig(env, defaults, "Y2TB_CORE_");
		expect(coreResult.update.auto).toBe(false);

		const cfgResult = parseEnvConfig(env, defaults, "Y2TB_CFG_");
		expect(cfgResult.facebook.autoMarkRead).toBe(true);
	});

	it("does not treat the string 'false' as truthy", () => {
		const env = {
			"Y2TB_CORE_UPDATE_AUTO": "false"
		};
		const defaults = {
			update: { auto: true }
		};

		const result = parseEnvConfig(env, defaults, "Y2TB_CORE_");
		
		// If 'false' was parsed natively without our logic, it would be truthy.
		// Ensure it is explicitly evaluated to boolean false.
		expect(result.update.auto).not.toBeTruthy();
		expect(result.update.auto).toBe(false);
	});

	it("handles numeric '1' and '0' for booleans", () => {
		const envTrue = { "Y2TB_CORE_UPDATE_AUTO": "1" };
		const envFalse = { "Y2TB_CORE_UPDATE_AUTO": "0" };
		const defaults = { update: { auto: false } };

		expect(parseEnvConfig(envTrue, defaults, "Y2TB_CORE_").update.auto).toBe(true);
		expect(parseEnvConfig(envFalse, defaults, "Y2TB_CORE_").update.auto).toBe(false);
	});

	it("handles 'yes' and 'no' for booleans", () => {
		const envTrue = { "Y2TB_CORE_UPDATE_AUTO": "yes" };
		const envFalse = { "Y2TB_CORE_UPDATE_AUTO": "no" };
		const defaults = { update: { auto: false } };

		expect(parseEnvConfig(envTrue, defaults, "Y2TB_CORE_").update.auto).toBe(true);
		expect(parseEnvConfig(envFalse, defaults, "Y2TB_CORE_").update.auto).toBe(false);
	});
});
