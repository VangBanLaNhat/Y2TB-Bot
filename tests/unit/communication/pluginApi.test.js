const pluginApi = require('../../../src/core/communication/pluginApi.js');

describe('pluginApi', () => {
    let mockApi;
    let mockE2eeClient;
    let mockLog;

    beforeEach(() => {
        mockApi = {
            sendMessage: jest.fn().mockImplementation((msg, tid, cb) => cb && cb(null, { messageID: 'mid.123' })),
            setMessageReaction: jest.fn().mockImplementation((reaction, mid, cb) => cb && cb(null, { success: true })),
            unsendMessage: jest.fn().mockImplementation((mid, cb) => cb && cb(null, { success: true }))
        };

        mockE2eeClient = {
            sendMessage: jest.fn().mockResolvedValue({ messageId: 'e2ee-mid.456' })
        };

        mockLog = {
            warn: jest.fn(),
            log: jest.fn()
        };
    });

    test('should route sendMessage to E2EE client when thread is E2EE', async () => {
        const event = { threadID: '1234567890@msgr', messageID: 'msg.1' };
        const wrappedApi = pluginApi.createEventApi(mockApi, event, mockE2eeClient, mockLog);

        await new Promise((resolve) => {
            wrappedApi.sendMessage("Hello", event.threadID, resolve);
        });

        expect(mockE2eeClient.sendMessage).toHaveBeenCalledWith({
            threadId: '1234567890@msgr',
            text: "Hello"
        });
        expect(mockApi.sendMessage).not.toHaveBeenCalled();
    });

    test('should fallback to normal api when e2eeClient is not present', async () => {
        const event = { threadID: '1234567890', messageID: 'msg.1' };
        const wrappedApi = pluginApi.createEventApi(mockApi, event, null, mockLog);

        await new Promise((resolve) => {
            wrappedApi.sendMessage("Hello", event.threadID, resolve);
        });

        expect(mockApi.sendMessage).toHaveBeenCalledWith("Hello", event.threadID, expect.any(Function), undefined);
        expect(mockE2eeClient.sendMessage).not.toHaveBeenCalled();
    });

    test('should drop setMessageReaction safely in E2EE mode without crashing', async () => {
        const event = { threadID: '1234567890@msgr', messageID: 'msg.1' };
        const wrappedApi = pluginApi.createEventApi(mockApi, event, mockE2eeClient, mockLog);

        let errResult = null;
        await new Promise((resolve) => {
            wrappedApi.setMessageReaction('👍', 'msg.1', (err) => {
                errResult = err;
                resolve();
            });
        });

        expect(mockLog.warn).toHaveBeenCalledWith("E2EE", "setMessageReaction is unsupported in E2EE mode. Failing gracefully.");
        expect(errResult).toBeInstanceOf(Error);
        expect(mockApi.setMessageReaction).not.toHaveBeenCalled();
    });

    test('should drop unsendMessage safely in E2EE mode without crashing', async () => {
        const event = { threadID: '1234567890@msgr', messageID: 'msg.1' };
        const wrappedApi = pluginApi.createEventApi(mockApi, event, mockE2eeClient, mockLog);

        let errResult = null;
        await new Promise((resolve) => {
            wrappedApi.unsendMessage('msg.1', (err) => {
                errResult = err;
                resolve();
            });
        });

        expect(mockLog.warn).toHaveBeenCalledWith("E2EE", "unsendMessage is unsupported in E2EE mode. Failing gracefully.");
        expect(errResult).toBeInstanceOf(Error);
        expect(mockApi.unsendMessage).not.toHaveBeenCalled();
    });
});
