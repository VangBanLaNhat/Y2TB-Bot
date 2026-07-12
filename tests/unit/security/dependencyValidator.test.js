const { isSafeDependencySpec } = require("../../../src/core/util/dependencyValidator");

describe("isSafeDependencySpec", () => {
	it("accepts valid examples", () => {
		expect(isSafeDependencySpec("axios")).toBe(true);
		expect(isSafeDependencySpec("@scope/pkg")).toBe(true);
		expect(isSafeDependencySpec("axios@^1.7.2")).toBe(true);
		expect(isSafeDependencySpec("@scope/pkg@~1.2.3")).toBe(true);
	});

	it("rejects invalid examples", () => {
		expect(isSafeDependencySpec("")).toBe(false);
		expect(isSafeDependencySpec(" axios")).toBe(false);
		expect(isSafeDependencySpec("axios ")).toBe(false);
		expect(isSafeDependencySpec("axios; rm -rf /")).toBe(false);
		expect(isSafeDependencySpec("axios && curl bad")).toBe(false);
		expect(isSafeDependencySpec("pkg\nbad")).toBe(false);
		expect(isSafeDependencySpec("$(whoami)")).toBe(false);
		expect(isSafeDependencySpec("`whoami`")).toBe(false);
	});
});
