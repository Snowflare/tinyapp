const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.strictEqual(user.email, testUsers[expectedOutput].email);
  });
  it('should return a user with valid id', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.strictEqual(user.id, expectedOutput);
  });
  it('should return a user with valid password', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.strictEqual(user.password, testUsers[expectedOutput].password);
  });
  it('should return the correct user object', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.deepEqual(user, testUsers[expectedOutput])
  });
  it('should return undefined with non-existng user', function() {
    const user = getUserByEmail("user@example.co", testUsers)
    const expectedOutput = undefined;
    // Write your assert statement here
    assert.strictEqual(user, expectedOutput);
  });
});