const bcrypt = require('bcrypt');
// Helper functions
//------------------------------------------------/
// Random string generator
function generateRandomString() {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( var i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
const getUserByEmail = function(email, database) {
  // lookup magic...
  for (let user in database){
    if (database[user].email === email){
      return database[user];
    }
  }
  return undefined;
};
// Check if the email and password match
function isPassword(email, password, users){
  for (let user in users){
    if (users[user].email === email && bcrypt.compareSync(password, users[user].password)){
      return true;
    }
  }
  return false;
}
// Return the urls belongs to given id
function filter( dataBase, id) {
  let result = {};

  for (key in dataBase) {
      if (dataBase.hasOwnProperty(key) && dataBase[key].user_id === id) {
          result[key] = dataBase[key];
      }
  }

  return result;
};
// Check if user exists in the database
function isUser(id, users){
  if(users[id]){
    return true;
  }
  return false;
}

// Check if email exists in the database
function isEmail(email, users){
  for (let user in users){
    if (users[user].email === email){
      return true;
    }
  }
  return false;
}
module.exports = {getUserByEmail, isEmail, isUser, isPassword, generateRandomString, filter};