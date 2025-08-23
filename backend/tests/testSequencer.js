// tests/testSequencer.js
const Sequencer = require("@jest/test-sequencer").default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    // Define the order of test execution
    const testOrder = [
      "utils.test.js", // Unit tests first
      "auth.test.js", // Authentication tests
      "parcel.test.js", // Parcel API tests
      "integration.test.js", // Integration tests last
    ];

    return tests.sort((testA, testB) => {
      const orderA = this.getTestOrder(testA.path, testOrder);
      const orderB = this.getTestOrder(testB.path, testOrder);

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      // If same order, sort alphabetically
      return testA.path < testB.path ? -1 : 1;
    });
  }

  getTestOrder(testPath, testOrder) {
    for (let i = 0; i < testOrder.length; i++) {
      if (testPath.includes(testOrder[i])) {
        return i;
      }
    }
    return testOrder.length; // Unknown tests go last
  }
}

module.exports = CustomSequencer;
