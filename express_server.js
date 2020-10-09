const express = require("express");
const app = express();
const PORT = 8080; 
const bodyParser = require("body-parser"); 
const bcrypt = require("bcrypt"); 
const cookieSession = require("cookie-session")
const methodOverride = require("method-override") 
const { v4: uuidv4 } = require('uuid');
const { getMyUrls, getUserWithEmail, getUser, generateRandomString, cookieIsUser, getDate, isUniqueVisit } = require("./helpers");

app.set("view engine", "ejs");
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: true})); //transforms body data from buffer to a string
app.use(cookieSession({
  name: "session",
  keys: ["topsecret", "tiptopsecret"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
//------------------- Database and Functions ---------
const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "billywatters1@gmail.com", 
    password: "Hello", 
    UUID: 22
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk", 
    UUID: 12
  }
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID", visits: 0, uniqueVisits: 0,
  visitsTimes: [], visitors: []},
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID", visits: 0, uniqueVisits: 0,
  visitsTimes: [], visitors: []}
}; 

//--------------- Page Roots -----------------

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});  

app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  } 
});

app.get("/urls", (req, res) => {
  if (cookieIsUser(req.session.user_id, users)) {
    const myUrls = getMyUrls(req.session.user_id, urlDatabase);
    const templateVars = {urls: myUrls,
                          user: getUser(req.session.user_id, users)};  
    res.render("urls_index", templateVars);
  } else { 
    res.redirect("/login");
  }
});

app.get("/register", (req,res) => {
  if (cookieIsUser(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    const user = null;
    templateVars = { user };
    res.render("register", templateVars); 
  }
});


app.get("/login", (req, res) => {
  if (cookieIsUser(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    const templateVars = {urls: urlDatabase,
                          user: getUser(req.session.user_id, users)};
    res.render("login", templateVars);
  }
});



//---------------------- Page Posts -------------------

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(); 
  urlDatabase[shortURL] = {longURL: req.body.longURL, 
                          userID: req.session.user_id, 
                          visits: 0, 
                          uniqueVisits: 0, 
                          visitsTimes: [],
                          visitors: [], 
                          created: getDate()};
    res.redirect(`/urls/${shortURL}`);
  }); 

app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('Email and password required');
  } 
  if (getUserWithEmail(req.body.email, users)) {
    res.status(400).send('That email is already in use'); 
  }  
  const password = req.body.password;   
  const hashedPassword = bcrypt.hashSync(password, 10);
  const ID = generateRandomString(); 
  req.session.user_id = ID;  
  users[ID] = {id: ID, 
              email: req.body.email, 
              password: hashedPassword, 
              UUID: uuidv4()};  
res.redirect("/urls");
}); 

app.post("/login", (req, res) => {
  if (!getUserWithEmail(req.body.email, users)) {
    res.redirect("/register"); 
  } 
  if (req.body.email.length === 0 || req.body.password.length === 0){
    return res.status(403).send("Email or Password is empty");
  } 
  for (const user in users) {
    if(users[user].email === req.body.email) {  
      if (bcrypt.compareSync(req.body.password, getUserWithEmail(req.body.email, users).password)) { 
        req.session.user_id = users[user].id; 
        return res.redirect("/urls");
      }
    }    
  } 
  res.status(403).send("Invalid email/password");
});

app.post("/logout", (req, res) => {
  req.session.user_id = null; 
  res.redirect('/urls');
});

//---------------------- Page Subdirectory -------------------

app.get("/urls/new", (req, res) => {     // gen a new short url
  const templateVars = {urls: urlDatabase,
  user: getUser(req.session.user_id, users)}; 
  templateVars.user ? res.render("urls_new", templateVars) : res.redirect("/login")
});

app.get("/urls/:shortURL", (req, res) => {    //find longurl with short
  if (cookieIsUser(req.session.user_id, users) || [req.session.user_id].id !== [req.params.shortURL].userID) {
    const templateVars = { shortURL: req.params.shortURL, 
                        longURL: urlDatabase[req.params.shortURL].longURL, 
                        user: getUser(req.session.user_id, users)};  
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  } 
}); 

app.get("/u/:shortURL", (req, res) => {    // redirects client to longURL
  const longURL = urlDatabase[req.params.shortURL].longURL; 
  urlDatabase[req.params.shortURL].visits = ((urlDatabase[req.params.shortURL].visits)  + 1); 
  
  if (isUniqueVisit(users[req.session.user_id].UUID, users, urlDatabase, req.params.shortURL)) {
    urlDatabase[req.params.shortURL].uniqueVisits = (urlDatabase[req.params.shortURL].uniqueVisits + 1); 
    urlDatabase[req.params.shortURL].visitors.push((users[req.session.user_id].UUID));
  } 
  console.log(urlDatabase);
  urlDatabase[req.params.shortURL].visitsTimes.push(getDate()); 
  res.redirect(longURL);
});  

//----------------- Update and Delete ------------------ 

app.delete("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL]; 
    res.redirect("/urls"); 
  } else {
    res.redirect("/login");
  }
});

app.put("/urls/:shortURL/update", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) { 
    urlDatabase[req.params.shortURL].longURL = req.body.longURL; 
    console.log(urlDatabase[req.params.shortURL])
    res.redirect(`/urls/${req.params.shortURL}`); 
  } else {
    res.redirect("/login");
  }    
}); 


// -------------------Misc----------------------

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
}); 

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});