const fs = require('fs');
const path = require('path');

// Allowlist containing files and patterns that are allowed to violate the direct API check.
// Must be kept as small as possible and have documented reasons.
const ALLOWLIST = {
    // Gemini.js uses Google Gemini AI SDK's chatSession.sendMessage() which is NOT the Facebook Messenger api.sendMessage
    'plugins/Gemini/Gemini.js': [
        '.sendMessage('
    ]
};

function getJsFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            // Exclude lib, node_modules and cache folders
            if (file !== 'lib' && file !== 'node_modules' && file !== 'cache') {
                results = results.concat(getJsFiles(fullPath));
            }
        } else if (file.endsWith('.js')) {
            results.push(fullPath);
        }
    });
    return results;
}

describe('noDirectMessengerApi Guard', () => {
    const pluginsDir = path.resolve(__dirname, '../../../plugins');
    const files = getJsFiles(pluginsDir);

    const forbiddenPatterns = [
        { regex: /api\.sendMessage/g, name: 'api.sendMessage' },
        { regex: /api\[['"]sendMessage['"]\]/g, name: 'api["sendMessage"]' },
        { regex: /api\.setMessageReaction/g, name: 'api.setMessageReaction' },
        { regex: /api\.unsendMessage/g, name: 'api.unsendMessage' },
        { regex: /api\.sendTypingIndicator/g, name: 'api.sendTypingIndicator' },
        { regex: /\.sendMessage\(/g, name: '.sendMessage(' }
    ];

    files.forEach((file) => {
        const relativePath = path.relative(path.resolve(__dirname, '../../..'), file);

        test(`should not contain direct Messenger output API calls in ${relativePath}`, () => {
            const content = fs.readFileSync(file, 'utf8');

            forbiddenPatterns.forEach((pattern) => {
                const matches = content.match(pattern.regex);
                if (matches) {
                    // Check if this file and pattern are in the allowlist
                    const allowedPatterns = ALLOWLIST[relativePath] || [];
                    if (allowedPatterns.includes(pattern.name)) {
                        return; // Allowed by allowlist
                    }

                    // Fail the test with detail
                    throw new Error(
                        `Forbidden pattern "${pattern.name}" found in ${relativePath}. ` +
                        `Plugins must use the E2EE-safe context wrapper (adv.ctx.send/reply) instead of direct api calls.`
                    );
                }
            });
        });
    });
});
