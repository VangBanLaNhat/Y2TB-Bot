function isE2EEThread(threadID) {
    if (!threadID) return false;
    const s = String(threadID);
    return s.includes("@msgr") || s.includes("@g.us") || s.includes(".g.") || /^\d+$/.test(s);
}

function createEventApi(api, event, e2eeClient, log) {
    return new Proxy(api, {
        get: function (target, prop, receiver) {
            if (prop === "sendMessage") {
                return function (msg, threadID, callback, replyMessageID) {
                    if (typeof callback === "string" || typeof callback === "number") {
                        replyMessageID = callback;
                        callback = null;
                    }
                    
                    const isE2EE = e2eeClient && isE2EEThread(threadID);
                    if (isE2EE) {
                        const input = { threadId: String(threadID) };
                        if (typeof msg === "string") {
                            input.text = msg;
                        } else if (msg && typeof msg === "object") {
                            if (msg.body) input.text = msg.body;
                            if (msg.attachment) {
                                if (log && log.warn) log.warn("E2EE", "Attachments are currently unsupported in E2EE mode. Sending text only.");
                                if (!input.text) {
                                    input.text = "[E2EE] This plugin tried to send an attachment, but E2EE attachments are not supported yet.";
                                }
                            }
                        }
                        
                        if (replyMessageID) input.replyToMessageId = String(replyMessageID);

                        if (input.text) {
                            return e2eeClient.sendMessage(input)
                                .then(res => {
                                    if (res && res.messageId && !res.messageID) {
                                        res.messageID = res.messageId;
                                    }
                                    if (callback) callback(null, res);
                                    return res;
                                })
                                .catch(err => {
                                    if (log && log.warn) log.warn("E2EE", `E2EE send failed, falling back to plaintext: ${err.message}`);
                                    return target.sendMessage(msg, threadID, callback, replyMessageID);
                                });
                        }
                    }
                    
                    return target.sendMessage(msg, threadID, callback, replyMessageID);
                };
            }
            if (prop === "setMessageReaction") {
                return function (reaction, messageID, callback, force) {
                    const isE2EE = e2eeClient && event && event.threadID && isE2EEThread(event.threadID);
                    if (isE2EE) {
                        if (log && log.warn) log.warn("E2EE", "setMessageReaction is unsupported in E2EE mode. Failing gracefully.");
                        if (callback) callback(new Error("Unsupported in E2EE"));
                        return Promise.resolve();
                    }
                    return target.setMessageReaction(reaction, messageID, callback, force);
                };
            }
            if (prop === "unsendMessage") {
                return function (messageID, callback) {
                    const isE2EE = e2eeClient && event && event.threadID && isE2EEThread(event.threadID);
                    if (isE2EE) {
                        if (log && log.warn) log.warn("E2EE", "unsendMessage is unsupported in E2EE mode. Failing gracefully.");
                        if (callback) callback(new Error("Unsupported in E2EE"));
                        return Promise.resolve();
                    }
                    return target.unsendMessage(messageID, callback);
                };
            }
            
            return Reflect.get(target, prop, receiver);
        }
    });
}

module.exports = {
    createEventApi,
    isE2EEThread
};
