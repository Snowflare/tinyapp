const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const morgan = require('morgan');
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
const {getUserByEmail, isEmail, isUser, isPassword, generateRandomString, filter} = require("./helpers")
const users = {};
const urlDatabase = {};
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('combined'))

app.set("view engine", "ejs");



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
  if (isUser(req.session.user_id, users)){
    let user_id = req.session.user_id;
    let templateVars = { user: users[user_id], urls: filter( urlDatabase, user_id)};
    res.render("urls_index", templateVars);
  } else {
    req.session = null;
    res.status(403).send('You are not logged in');
  }
  
});
// Route of adding a URL
app.get("/urls/new", (req, res) => {
  if (isUser(req.session.user_id, users)){
    let templateVars = { user: users[req.session.user_id]};
    res.render("urls_new", templateVars);
  } else {
    req.session = null;
    res.redirect('/login');
  }
  
});
// Route of each short URL
app.get("/urls/:shortURL", (req, res) => {
  if (isUser(req.session.user_id, users)){
    if (urlDatabase[req.params.shortURL]){
      if (urlDatabase[req.params.shortURL].user_id === req.session.user_id){
        let templateVars = { user: users[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
        res.render("urls_show", templateVars);
      } else {
        res.status(403).send('You do not have access to this url');
      }      
    } else {
      res.status(403).send('This url does not exist');
    }    
  } else {
    req.session = null;
    res.status(403).send('You are not logged in');
  }
});
// Add a new URL
app.post("/urls", (req, res) => {
  if (isUser(req.session.user_id, users)){
    let newShort = generateRandomString();
    urlDatabase[newShort] = {longURL: req.body.longURL, user_id: req.session.user_id};
    res.redirect(`/urls/${newShort}`);
  } else {
    req.session = null;
    res.status(403).send('You are not logged in');
  }  
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]){
    let longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect("http://" + longURL);
  } else {
    res.status(403).send('This url does not exist');
  }
  
});
// Deleting a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  if (isUser(req.session.user_id, users)) {
    if (urlDatabase[req.params.shortURL]) {
      if (urlDatabase[req.params.shortURL].user_id === req.session.user_id) {
        delete urlDatabase[req.params.shortURL]; 
        res.redirect('/urls');
      } else {
        res.status(403).send('You do not have access to this url');
      }      
    } else {
      res.status(403).send('This url does not exist');
    }    
  } else {
    req.session = null;
    res.status(403).send('You are not logged in');
  }
});

app.post("/urls/:shortURL", (req, res) => {
  if (isUser(req.session.user_id, users)) {
    if (urlDatabase[req.params.shortURL]) {
      if (urlDatabase[req.params.shortURL].user_id === req.session.user_id) {
        urlDatabase[req.params.shortURL].longURL = req.body.longURL;
        res.redirect('/urls');
      } else {
        res.status(403).send('You do not have access to this url');
      }      
    } else {
      res.status(403).send('This url does not exist');
    }    
  } else {
    req.session = null;
    res.status(403).send('You are not logged in');
  }
});
app.post("/login", (req, res) => {
  
  if (isEmail(req.body.email, users)){
    if (isPassword(req.body.email, req.body.password, users)) {
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
  if (isUser(req.session.user_id, users)) {
    res.redirect('/urls');
  } else {
    let templateVars = { user: users[req.session.user_id]};
    res.render("urls_login", templateVars);
  }
  
});
app.post("/logout", (req, res) => {  
  //res.clearCookie('user_id');
  req.session = null;
  res.redirect('/urls');
});

// Register end points

app.get("/register", (req, res) => {
  if (isUser(req.session.user_id, users)) {
    res.redirect('/urls');
  } else {
    let templateVars = { user: users[req.session.user_id]};
    res.render("urls_register", templateVars);
  }
  
});

app.post("/register", (req, res) => {  
  if (req.body.email && req.body.password){
    if (isEmail(req.body.email, users)){
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





