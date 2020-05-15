const bcrypt = require('bcrypt');
// Helper functions
//------------------------------------------------/
// Random string generator
const generateRandomString = function() {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
// Return user object by email
const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};
// Check if the email and password match
const isPassword = function(email, password, users) {
  for (let user in users) {
    if (users[user].email === email && bcrypt.compareSync(password, users[user].password)) {
      return true;
    }
  }
  return false;
};
// Return the urls belongs to given id
const filter = function(dataBase, id) {
  let result = {};

  for (let key in dataBase) {
    if (dataBase[key] && dataBase[key].user_id === id) {
      result[key] = dataBase[key];
    }
  }

  return result;
};
// Check if user exists in the database
const isUser = function(id, users) {
  if (users[id]) {
    return true;
  }
  return false;
};

// Check if email exists in the database
const isEmail = function(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};

module.exports = {getUserByEmail, isEmail, isUser, isPassword, generateRandomString, filter};