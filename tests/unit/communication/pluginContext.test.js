const { createPluginContext } = require('../../../src/core/communication/pluginContext.js');

describe('pluginContext', () => {
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

    test('normalized fields on normal events', () => {
        const event = {
            threadID: '123456',
            senderID: '789',
            messageID: 'msg.123',
            body: 'Hello world',
            attachments: [{ url: 'http://example.com' }],
            mentions: { '789': 'User' }
        };

        const ctx = createPluginContext({ api: mockApi, event, e2eeClient: null, log: mockLog });

        expect(ctx.threadID).toBe('123456');
        expect(ctx.senderID).toBe('789');
        expect(ctx.messageID).toBe('msg.123');
        expect(ctx.body).toBe('Hello world');
        expect(ctx.attachments).toEqual([{ url: 'http://example.com' }]);
        expect(ctx.mentions).toEqual({ '789': 'User' });
        expect(ctx.isE2EE).toBe(false);
        expect(ctx.rawEvent).toBe(event);
    });

    test('normalized fields on E2EE events', () => {
        const event = {
            threadID: '123456@msgr',
            senderID: '789',
            messageID: 'msg.123',
            body: 'Hello E2EE',
            attachments: [],
            mentions: {}
        };

        const ctx = createPluginContext({ api: mockApi, event, e2eeClient: mockE2eeClient, log: mockLog });

        expect(ctx.threadID).toBe('123456@msgr');
        expect(ctx.senderID).toBe('789');
        expect(ctx.messageID).toBe('msg.123');
        expect(ctx.body).toBe('Hello E2EE');
        expect(ctx.isE2EE).toBe(true);
    });

    test('normal ctx.send', async () => {
        const event = { threadID: '123456', messageID: 'msg.123' };
        const ctx = createPluginContext({ api: mockApi, event, e2eeClient: null, log: mockLog });

        await new Promise((resolve) => {
            ctx.send('Hello Normal', resolve);
        });

        expect(mockApi.sendMessage).toHaveBeenCalledWith('Hello Normal', '123456', expect.any(Function), undefined);
    });

    test('normal ctx.reply', async () => {
        const event = { threadID: '123456', messageID: 'msg.123' };
        const ctx = createPluginContext({ api: mockApi, event, e2eeClient: null, log: mockLog });

        await new Promise((resolve) => {
            ctx.reply('Reply Normal', resolve);
        });

        expect(mockApi.sendMessage).toHaveBeenCalledWith('Reply Normal', '123456', expect.any(Function), 'msg.123');
    });

    test('E2EE ctx.send', async () => {
        const event = { threadID: '123456@msgr', messageID: 'msg.123' };
        const ctx = createPluginContext({ api: mockApi, event, e2eeClient: mockE2eeClient, log: mockLog });

        await new Promise((resolve) => {
            ctx.send('Hello E2EE', resolve);
        });

        expect(mockE2eeClient.sendMessage).toHaveBeenCalledWith({
            threadId: '123456@msgr',
            text: 'Hello E2EE'
        });
    });

    test('E2EE ctx.reply', async () => {
        const event = { threadID: '123456@msgr', messageID: 'msg.123' };
        const ctx = createPluginContext({ api: mockApi, event, e2eeClient: mockE2eeClient, log: mockLog });

        await new Promise((resolve) => {
            ctx.reply('Reply E2EE', resolve);
        });

        expect(mockE2eeClient.sendMessage).toHaveBeenCalledWith({
            threadId: '123456@msgr',
            text: 'Reply E2EE',
            replyToMessageId: 'msg.123'
        });
    });

    test('E2EE attachment fallback with body', async () => {
        const event = { threadID: '123456@msgr', messageID: 'msg.123' };
        const ctx = createPluginContext({ api: mockApi, event, e2eeClient: mockE2eeClient, log: mockLog });

        await new Promise((resolve) => {
            ctx.send({ body: 'Attachment msg', attachment: 'stream' }, resolve);
        });

        expect(mockLog.warn).toHaveBeenCalledWith("E2EE", "Attachments are currently unsupported in E2EE mode. Sending text only.");
        expect(mockE2eeClient.sendMessage).toHaveBeenCalledWith({
            threadId: '123456@msgr',
            text: 'Attachment msg'
        });
    });

    test('E2EE attachment-only fallback', async () => {
        const event = { threadID: '123456@msgr', messageID: 'msg.123' };
        const ctx = createPluginContext({ api: mockApi, event, e2eeClient: mockE2eeClient, log: mockLog });

        await new Promise((resolve) => {
            ctx.send({ attachment: 'stream' }, resolve);
        });

        expect(mockLog.warn).toHaveBeenCalledWith("E2EE", "Attachments are currently unsupported in E2EE mode. Sending text only.");
        expect(mockE2eeClient.sendMessage).toHaveBeenCalledWith({
            threadId: '123456@msgr',
            text: '[E2EE] This plugin tried to send an attachment, but E2EE attachments are not supported yet.'
        });
    });

    test('missing event does not crash', () => {
        const ctx = createPluginContext({ api: mockApi, event: null, e2eeClient: mockE2eeClient, log: mockLog });

        expect(ctx.threadID).toBeUndefined();
        expect(ctx.senderID).toBeUndefined();
        expect(ctx.messageID).toBeUndefined();
        expect(ctx.body).toBeUndefined();
        expect(ctx.isE2EE).toBe(false);

        // Invoking send shouldn't crash, even if it eventually fails or rejects.
        expect(() => ctx.send('test')).not.toThrow();
    });
});
