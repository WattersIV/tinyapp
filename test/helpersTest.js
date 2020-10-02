const { assert } = require('chai');

const { getUserWithEmail } = require('../helpers.js');

const users = {
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

describe('getUserWithEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserWithEmail("user@example.com", users)
    const expectedOutput = "userRandomID";
    assert(expectedOutput, user)
  });
  it('should return false without a valid email', function() {
    const user = getUserWithEmail("Notsavedemail@abc.ca", users)
    const expectedOutput = undefined;
    assert(false === user)
  });
});