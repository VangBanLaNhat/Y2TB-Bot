function isE2EEThread(threadID) {
    if (!threadID) return false;
    const s = String(threadID);
    if (s.includes("@msgr") || s.includes("@g.us") || s.includes(".g.")) return true;
    if (/^\d+$/.test(s)) {
        return !!(global.e2eeThreads && global.e2eeThreads.has(s));
    }
    return false;
}

function isEventE2EE(event, threadID, e2eeClient) {
    if (!e2eeClient) return false;
    const tid = threadID || (event ? event.threadID : undefined);
    if (!tid) return false;
    
    if (event && event.type) {
        return event.type.startsWith("e2ee_");
    }
    
    return isE2EEThread(tid);
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
                    
                    const isE2EE = isEventE2EE(event, threadID, e2eeClient);
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
                    const isE2EE = isEventE2EE(event, event && event.threadID, e2eeClient);
                    if (isE2EE) {
                        if (typeof e2eeClient.sendReaction === "function") {
                            const threadId = String(event.threadID);
                            const senderJid = event.senderID ? (event.senderID.indexOf("@") === -1 ? event.senderID + "@msgr" : event.senderID) : undefined;
                            return e2eeClient.sendReaction({
                                threadId,
                                messageId: String(messageID),
                                reaction,
                                senderJid
                            })
                            .then(res => {
                                if (callback) callback(null, res);
                                return res;
                            })
                            .catch(err => {
                                if (log && log.warn) log.warn("E2EE", `E2EE reaction failed, falling back to plaintext: ${err.message}`);
                                return target.setMessageReaction(reaction, messageID, callback, force);
                            });
                        } else {
                            if (log && log.warn) log.warn("E2EE", "setMessageReaction is unsupported in E2EE mode. Failing gracefully.");
                            if (callback) callback(new Error("Unsupported in E2EE"));
                            return Promise.resolve();
                        }
                    }
                    return target.setMessageReaction(reaction, messageID, callback, force);
                };
            }
            if (prop === "unsendMessage") {
                return function (messageID, callback) {
                    const isE2EE = isEventE2EE(event, event && event.threadID, e2eeClient);
                    if (isE2EE) {
                        if (typeof e2eeClient.unsendMessage === "function") {
                            const threadId = String(event.threadID);
                            return e2eeClient.unsendMessage({
                                messageId: String(messageID),
                                threadId
                            })
                            .then(res => {
                                if (callback) callback(null, res);
                                return res;
                            })
                            .catch(err => {
                                if (log && log.warn) log.warn("E2EE", `E2EE unsend failed, falling back to plaintext: ${err.message}`);
                                return target.unsendMessage(messageID, callback);
                            });
                        } else {
                            if (log && log.warn) log.warn("E2EE", "unsendMessage is unsupported in E2EE mode. Failing gracefully.");
                            if (callback) callback(new Error("Unsupported in E2EE"));
                            return Promise.resolve();
                        }
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
    isE2EEThread,
    isEventE2EE
};
