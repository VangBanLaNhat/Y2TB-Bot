const { isCoreAutoUpdateEnabled } = require("../../../src/core/util/coreUpdatePolicy");

describe("isCoreAutoUpdateEnabled", () => {
	it("missing config => false", () => {
		expect(isCoreAutoUpdateEnabled(undefined)).toBe(false);
		expect(isCoreAutoUpdateEnabled({})).toBe(false);
		expect(isCoreAutoUpdateEnabled({ update: {} })).toBe(false);
	});

	it("update.auto=false => false", () => {
		expect(isCoreAutoUpdateEnabled({ update: { auto: false } })).toBe(false);
	});

	it("update.auto=true => true", () => {
		expect(isCoreAutoUpdateEnabled({ update: { auto: true } })).toBe(true);
	});

	it("string 'false' => false", () => {
		expect(isCoreAutoUpdateEnabled({ update: { auto: "false" } })).toBe(false);
	});
});
