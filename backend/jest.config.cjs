// jest.config.js
module.exports = {
  testEnvironment: "node",
  testTimeout: 10000,
  collectCoverageFrom: ["controllers/**/*.js", "middleware/**/*.js", "utils/**/*.js", "!**/node_modules/**"],
  coverageDirectory: "coverage",
  verbose: true,
};
