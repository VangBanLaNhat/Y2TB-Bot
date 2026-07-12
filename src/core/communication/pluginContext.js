const { createEventApi, isE2EEThread } = require("./pluginApi.js");

function createPluginContext({ api, event, e2eeClient, log }) {
    const pluginApi = createEventApi(api, event, e2eeClient, log);
    const threadID = event ? event.threadID : undefined;
    const messageID = event ? event.messageID : undefined;
    const isE2EE = !!(e2eeClient && threadID && isE2EEThread(threadID));

    const ctx = {
        send: (msg, callback) => {
            return pluginApi.sendMessage(msg, threadID, callback);
        },
        reply: (msg, callback) => {
            return pluginApi.sendMessage(msg, threadID, callback, messageID);
        },
        react: (emoji, callback) => {
            return pluginApi.setMessageReaction(emoji, messageID, callback, true);
        },
        unsend: (msgID, callback) => {
            const finalMsgID = msgID || messageID;
            return pluginApi.unsendMessage(finalMsgID, callback);
        },
        isE2EE,
        threadID,
        senderID: event ? event.senderID : undefined,
        messageID,
        body: event ? event.body : undefined,
        attachments: event ? event.attachments : undefined,
        mentions: event ? event.mentions : undefined,
        rawEvent: event
    };

    return ctx;
}

module.exports = {
    createPluginContext
};
