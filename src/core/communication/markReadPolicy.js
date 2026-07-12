function shouldMarkAsRead(config, event) {
	return (
		config?.facebook?.autoMarkRead === true &&
		event?.type !== "e2ee_message" &&
		!!event?.threadID
	);
}

module.exports = {
	shouldMarkAsRead
};
