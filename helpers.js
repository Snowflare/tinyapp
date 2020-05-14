const getUserByEmail = function(email, database) {
  // lookup magic...
  for (let user in database){
    if (database[user].email === email){
      return database[user];
    }
  }
};

module.exports = getUserByEmail;