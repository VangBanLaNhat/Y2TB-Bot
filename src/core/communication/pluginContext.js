const { createEventApi, isE2EEThread, isEventE2EE } = require("./pluginApi.js");

const defaultHumanizeConfig = {
    enabled: true,
    typing: true,

    minDelayMs: 450,
    maxDelayMs: 5000,

    baseDelayMs: 350,
    perCharMs: 28,
    perLineMs: 120,

    jitterMinMs: 80,
    jitterMaxMs: 350,

    minGapPerThreadMs: 350,

    skipForAttachments: true,
    skipForReactions: true,
    skipForUnsend: true,

    maxTypingPulseMs: 5000
};

const humanizedQueues = new Map();

function getHumanizeConfig() {
    const config = Object.assign({}, defaultHumanizeConfig);
    if (process.env.NODE_ENV === "test") {
        config.enabled = false;
    }
    if (global.config && global.config.humanizeMessage && typeof global.config.humanizeMessage === "object") {
        const userConfig = global.config.humanizeMessage;
        for (let key in defaultHumanizeConfig) {
            if (userConfig[key] !== undefined) {
                config[key] = userConfig[key];
            }
        }
    }

    if (typeof config.maxDelayMs !== "number" || !isFinite(config.maxDelayMs) || config.maxDelayMs <= 0) {
        config.maxDelayMs = 5000;
    }
    if (typeof config.minDelayMs !== "number" || !isFinite(config.minDelayMs) || config.minDelayMs < 0) {
        config.minDelayMs = 450;
    }
    if (config.maxDelayMs < config.minDelayMs) {
        config.maxDelayMs = config.minDelayMs;
    }
    if (typeof config.maxTypingPulseMs !== "number" || !isFinite(config.maxTypingPulseMs) || config.maxTypingPulseMs <= 0) {
        config.maxTypingPulseMs = 5000;
    }

    return config;
}

function getMessageText(message) {
    if (typeof message === "string") return message;
    if (message && typeof message === "object") {
        if (message.body !== undefined) return String(message.body);
        if (message.text !== undefined) return String(message.text);
    }
    return "";
}

function hasAttachmentOnly(message) {
    if (message && typeof message === "object") {
        if (message.attachment && !message.body && !message.text) {
            return true;
        }
    }
    return false;
}

function calculateHumanDelayMs(message, config) {
    if (hasAttachmentOnly(message) && config.skipForAttachments) {
        return 0;
    }

    const text = getMessageText(message);
    const lineCount = text.split("\n").length;

    let jitter = 0;
    if (config.jitterMaxMs > config.jitterMinMs) {
        jitter = Math.floor(Math.random() * (config.jitterMaxMs - config.jitterMinMs + 1)) + config.jitterMinMs;
    }

    let delay = config.baseDelayMs + (text.length * config.perCharMs) + (lineCount * config.perLineMs) + jitter;
    delay = Math.max(config.minDelayMs, Math.min(config.maxDelayMs, delay));
    return delay;
}

function sendTypingIndicatorSafe(api, e2eeClient, threadID, durationMs) {
    if (!threadID) return null;
    let endTyping = null;

    if (e2eeClient && typeof e2eeClient.sendTyping === "function") {
        try {
            e2eeClient.sendTyping({ threadId: String(threadID), isTyping: true });
            endTyping = () => {
                try {
                    e2eeClient.sendTyping({ threadId: String(threadID), isTyping: false });
                } catch (e) {}
            };
        } catch (err) {}
    }

    if (!endTyping && api && typeof api.sendTypingIndicator === "function") {
        try {
            const res = api.sendTypingIndicator(true, String(threadID));
            if (typeof res === "function") {
                endTyping = res;
            } else {
                endTyping = () => {
                    try {
                        api.sendTypingIndicator(false, String(threadID));
                    } catch (e) {}
                };
            }
        } catch (e) {
            try {
                const res = api.sendTypingIndicator(String(threadID));
                if (typeof res === "function") {
                    endTyping = res;
                }
            } catch (err) {}
        }
    }

    if (endTyping && durationMs > 0) {
        setTimeout(() => {
            try {
                endTyping();
            } catch (e) {}
        }, durationMs);
    }

    return endTyping;
}

function enqueueHumanizedMessage(threadID, task, config) {
    const key = threadID ? String(threadID) : "global";
    if (!humanizedQueues.has(key)) {
        humanizedQueues.set(key, Promise.resolve());
    }

    const currentPromise = humanizedQueues.get(key);
    const nextPromise = currentPromise
        .then(() => task())
        .then(() => new Promise(resolve => setTimeout(resolve, config.minGapPerThreadMs)))
        .catch(() => {
            return new Promise(resolve => setTimeout(resolve, config.minGapPerThreadMs));
        });

    humanizedQueues.set(key, nextPromise);

    nextPromise.then(() => {
        if (humanizedQueues.get(key) === nextPromise) {
            humanizedQueues.delete(key);
        }
    });
}

function normalizeCallbackAndOptions(optionsOrCallback, maybeCallback) {
    let options = {};
    let callback = null;

    if (typeof optionsOrCallback === "function") {
        callback = optionsOrCallback;
    } else if (optionsOrCallback && typeof optionsOrCallback === "object") {
        options = optionsOrCallback;
        if (typeof maybeCallback === "function") {
            callback = maybeCallback;
        }
    }
    return { options, callback };
}

function createHumanizedMessenger({ api, event, e2eeClient, ctx, log, rawSend, rawReply }) {
    const wrapMethod = (isReply) => {
        return function(msg, optionsOrCallback, maybeCallback) {
            const config = getHumanizeConfig();
            const { options, callback } = normalizeCallbackAndOptions(optionsOrCallback, maybeCallback);

            const skipDelay = !config.enabled ||
                              options.humanize === false ||
                              options.immediate === true ||
                              options.__humanizedApplied === true;

            if (skipDelay) {
                const finalSend = isReply ? rawReply : rawSend;
                return finalSend(msg, callback);
            }

            options.__humanizedApplied = true;

            const threadID = ctx.threadID || (event && event.threadID) || undefined;
            const delay = calculateHumanDelayMs(msg, config);

            if (delay <= 0) {
                const finalSend = isReply ? rawReply : rawSend;
                return finalSend(msg, callback);
            }

            let resolvePromise;
            let rejectPromise;
            const returnedPromise = new Promise((resolve, reject) => {
                resolvePromise = resolve;
                rejectPromise = reject;
            });

            const task = () => {
                return new Promise((resolveTask) => {
                    let endTyping = null;
                    if (config.typing) {
                        const typingDuration = Math.min(config.maxTypingPulseMs, delay);
                        endTyping = sendTypingIndicatorSafe(api, e2eeClient, threadID, typingDuration);
                    }

                    setTimeout(() => {
                        if (endTyping) {
                            try {
                                endTyping();
                            } catch (e) {}
                        }

                        const finalSend = isReply ? rawReply : rawSend;

                        try {
                            const result = finalSend(msg, (err, res) => {
                                if (callback) {
                                    try {
                                        callback(err, res);
                                    } catch (cbErr) {
                                        if (log && typeof log.err === "function") {
                                            log.err("Humanize", `Callback error: ${cbErr.message}`);
                                        }
                                    }
                                }
                                if (err) {
                                    rejectPromise(err);
                                } else {
                                    resolvePromise(res);
                                }
                                resolveTask();
                            });

                            if (result && typeof result.then === "function") {
                                result.then(
                                    (res) => {
                                        resolvePromise(res);
                                        resolveTask();
                                    },
                                    (err) => {
                                        rejectPromise(err);
                                        resolveTask();
                                    }
                                );
                            }
                        } catch (sendErr) {
                            if (callback) {
                                try {
                                    callback(sendErr);
                                } catch (cbErr) {}
                            }
                            rejectPromise(sendErr);
                            resolveTask();
                        }
                    }, delay);
                });
            };

            enqueueHumanizedMessage(threadID, task, config);

            return returnedPromise;
        };
    };

    return {
        send: wrapMethod(false),
        reply: wrapMethod(true)
    };
}

function createPluginContext({ api, event, e2eeClient, log }) {
    const pluginApi = createEventApi(api, event, e2eeClient, log);
    const threadID = event ? event.threadID : undefined;
    const messageID = event ? event.messageID : undefined;
    const isE2EE = isEventE2EE(event, threadID, e2eeClient);

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

    const rawSend = (msg, callback) => {
        return pluginApi.sendMessage(msg, threadID, callback);
    };
    const rawReply = (msg, callback) => {
        return pluginApi.sendMessage(msg, threadID, callback, messageID);
    };

    const humanized = createHumanizedMessenger({
        api,
        event,
        e2eeClient,
        ctx,
        log,
        rawSend,
        rawReply
    });

    ctx.send = humanized.send;
    ctx.reply = humanized.reply;

    return ctx;
}

module.exports = {
    createPluginContext
};
