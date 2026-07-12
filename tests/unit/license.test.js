const fs = require("fs");
const path = require("path");

describe("License consistency", () => {
	it("ensures package.json and README.md specify the same license", () => {
		const root = path.join(__dirname, "../..");
		const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
		const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");

		const pkgLicense = pkg.license;
		
		// Find "## License" heading and get the next non-empty line
		const readmeLines = readme.split("\n");
		let licenseHeadingIdx = -1;
		for (let i = 0; i < readmeLines.length; i++) {
			if (readmeLines[i].trim() === "## License") {
				licenseHeadingIdx = i;
				break;
			}
		}

		expect(licenseHeadingIdx).toBeGreaterThan(-1);

		let readmeLicense = "";
		for (let i = licenseHeadingIdx + 1; i < readmeLines.length; i++) {
			const line = readmeLines[i].trim();
			if (line !== "") {
				readmeLicense = line;
				break;
			}
		}

		expect(readmeLicense).toBe(pkgLicense);
	});
});
