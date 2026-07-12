function isCoreAutoUpdateEnabled(coreconfig) {
	return coreconfig?.update?.auto === true;
}

module.exports = {
	isCoreAutoUpdateEnabled
};
