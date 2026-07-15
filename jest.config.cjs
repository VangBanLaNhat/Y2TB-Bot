module.exports = {
testEnvironment: "node",
testMatch: ["<rootDir>/tests/**/*.test.js"],
clearMocks: true,
restoreMocks: true,
resetMocks: false,
collectCoverageFrom: [
"src/**/*.js",
"!src/main.js",
"!src/index.js",
"!**/node_modules/**"
],
coverageDirectory: "coverage"
};
