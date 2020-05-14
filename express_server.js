const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
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

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
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
  let templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase };
  res.render("urls_index", templateVars);
});
// Route of adding a URL
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
});
// Route of each short URL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});
// Add a new URL
app.post("/urls", (req, res) => {
  let newShort = generateRandomString();
  urlDatabase[newShort] = req.body.longURL;
  console.log(urlDatabase);  // Log the POST request body to the console
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect(`./urls/${newShort}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
// Deleting a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  console.log(urlDatabase);
  res.redirect('/urls');
});
// Editing a URL
app.post("/u/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect('/urls');
});
app.post("/login", (req, res) => {
  console.log(req.body.email);
  if (isEmail(req.body.email)){
    if (isPassword(req.body.email, req.body.password)) {
      res.cookie('user_id', findId(req.body.email));
      res.redirect('/urls');
    } else {
      res.status(403).send('Invalid password');
    }
  } else{
    res.status(403).send('Invalid email');
  }
  
  
});
app.get("/login", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]]};
  res.render("urls_login", templateVars);
});
app.post("/logout", (req, res) => {  
  res.clearCookie('user_id');
  res.redirect('/urls');
});
app.get("/register", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]]};
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {  
  if (req.body.email && req.body.password){
    if (isEmail(req.body.email)){
      res.status(400).send("This email address has been used");
      //res.redirect('/register');
    }else {
      let id = generateRandomString();
      users[id] = {id: id, email: req.body.email, password: req.body.password};
      console.log(users);
      res.cookie('user_id', id);
      res.redirect('/urls');
    }    
  } else {
    res.status(400).send("Empty email or password");
    //res.redirect('/register');
  }
  
});

function generateRandomString() {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( var i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
function isEmail(email){
  for (let user in users){
    if (users[user].email === email){
      return true;
    }
  }
  return false;
}
function isPassword(email, password){
  for (let user in users){
    if (users[user].email === email && users[user].password === password){
      return true;
    }
  }
  return false;
}
function findId(email){
  for (let user in users){
    if (users[user].email === email){
      return user;
    }
  }
}

