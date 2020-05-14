const express = require("express");
const getUserByEmail = require("./helpers")
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
//const cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
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
}

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))
app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {};

app.get("/", (req, res) => {
  if (req.session.user_id){
    res.redirect('/urls');
  }else {
    res.redirect('/login');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});
// Route of database
app.get("/urls", (req, res) => {
  if (req.session.user_id){
    let user_id = req.session.user_id;
    let templateVars = { user: users[user_id], urls: filter( urlDatabase, user_id)};
    res.render("urls_index", templateVars);
  } else {
    res.status(403).send('You are not logged in');
  }
  
});
// Route of adding a URL
app.get("/urls/new", (req, res) => {
  if (isUser(req.session.user_id)){
    let templateVars = { user: users[req.session.user_id]};
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
  
});
// Route of each short URL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { user: users[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  res.render("urls_show", templateVars);
});
// Add a new URL
app.post("/urls/new", (req, res) => {
  let newShort = generateRandomString();
  urlDatabase[newShort] = {longURL: req.body.longURL, user_id: req.session.user_id};

  res.redirect('/urls');
  //res.redirect(`/urls/${newShort}`);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  
  res.redirect("http://" + longURL);
});
// Deleting a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].user_id){
    delete urlDatabase[req.params.shortURL];     
  }
  res.redirect('/urls');
});

app.post("/u/:shortURL/edit", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].user_id){
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  } 
  res.redirect('/urls');
});
app.post("/login", (req, res) => {
  
  if (isEmail(req.body.email)){
    if (isPassword(req.body.email, req.body.password)) {
      req.session.user_id = getUserByEmail(req.body.email, users).id;
      res.redirect('/urls');
    } else {
      res.status(403).send('Invalid password');
    }
  } else{
    res.status(403).send('Invalid email');
  }
  
  
});
app.get("/login", (req, res) => {
  let templateVars = { user: users[req.session.user_id]};
  res.render("urls_login", templateVars);
});
app.post("/logout", (req, res) => {  
  //res.clearCookie('user_id');
  req.session = null
  res.redirect('/');
});

// Register end points

app.get("/register", (req, res) => {
  let templateVars = { user: users[req.session.user_id]};
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {  
  if (req.body.email && req.body.password){
    if (isEmail(req.body.email)){
      res.status(400).send("This email address has been used");
    }else {
      let id = generateRandomString();
      let password = req.body.password;      
      let hashedPassword = bcrypt.hashSync(password, 10);
      users[id] = {id: id, email: req.body.email, password: hashedPassword};
    
      req.session.user_id = id;
      res.redirect('/urls');
    }    
  } else {
    res.status(400).send("Empty email or password");
   
  }
  
});

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
// Check if user exists in the database
function isUser(id){
  if(users[id]){
    return true;
  }
  return false;
}

// Check if email exists in the database
function isEmail(email){
  for (let user in users){
    if (users[user].email === email){
      return true;
    }
  }
  return false;
}
// Check if the email and password match
function isPassword(email, password){
  for (let user in users){
    if (users[user].email === email && bcrypt.compareSync(password, users[user].password)){
      return true;
    }
  }
  return false;
}
// Find the id of a corresponding email
// function findId(email){
//   for (let user in users){
//     if (users[user].email === email){
//       return user;
//     }
//   }
// }


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

