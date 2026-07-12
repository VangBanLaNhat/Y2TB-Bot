function isSafeDependencySpec(spec) {
	if (typeof spec !== "string") return false;
	const trimmed = spec.trim();
	if (trimmed === "" || trimmed !== spec) return false;
	
	if (spec.startsWith("-")) return false;

	const shellMetacharacters = /[;&|><`$(){}\[\]\n\r]/;
	if (shellMetacharacters.test(spec)) return false;

	const normalNpmRegex = /^(@[a-zA-Z0-9-._~]+\/)?[a-zA-Z0-9-._~]+(@[a-zA-Z0-9-._~^><= *+:/]+)?$/;
	if (!normalNpmRegex.test(spec)) return false;

	return true;
}

module.exports = {
	isSafeDependencySpec
};
