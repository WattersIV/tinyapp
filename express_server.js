const express = require("express");
const app = express();
const PORT = 8080; // default port 8080 
const bodyParser = require("body-parser"); 
const cookieParser = require('cookie-parser');
app.set("view engine", "ejs");
app.use(cookieParser());
//------------------- Database and Functions ---------
const generateRandomString = () => {
  let result           = '';
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( var i = 0; i <= 5; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}; 

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

//-----------URL Post/Get -----------------

app.use(bodyParser.urlencoded({extended: true})); //transforms body data from buffer to a string
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(); 
  urlDatabase[shortURL] = req.body.longURL; //adds key value pair to the object
  res.redirect(`/urls/${shortURL}`);
}); 

app.get("/register", (req,res) => {
  const templateVars = {urls: urlDatabase,
                        user: users[req.cookies["user_id"]]};
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {urls: urlDatabase,
                        user: users[req.cookies["user_id"]]};
  res.render("login", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});  
app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase,
                        user: users[req.cookies["user_id"]]}; 
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {     // gen a new short url
  const templateVars = {urls: urlDatabase,
                        user: users[req.cookies["user_id"]]}; 
  templateVars.user ? res.render("urls_new", templateVars) : res.redirect("/login")
});

app.get("/urls/:shortURL", (req, res) => {    //find longurl with short
  const templateVars = { shortURL: req.params.shortURL, 
                        longURL: urlDatabase[req.params.shortURL], 
                        username: req.cookies["user_id"] }; 
    console.log(templateVars);
    res.render("urls_show", templateVars);
  }); 
  
  app.get("/u/:shortURL", (req, res) => {    // redirects client to longURL
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  });  

  //----------------- URL Delete and Update------ 
  app.post("/urls/:shortURL/delete", (req, res) => {
    delete urlDatabase[req.params.shortURL]; 
    res.redirect("/urls") 
  });
  
  app.post("/urls/:shortURL/update", (req, res) => {
    console.log(req.body, 'This is re.body')  
    urlDatabase[req.params.shortURL] = req.body.newURL; 
    res.redirect("/urls");    
  }); 
  
  app.post("/register", (req, res) => {
    if (req.body.email === '' || req.body.password === '') {
      res.status(400).send('Email and password required');
    } 
    for (const user in users) { 
      if(users[user].email === req.body.email) {
        res.status(400).send('That email is already in use'); 
      } 
    } 
    const ID = generateRandomString(); 
    users[ID] = {id: ID, 
                email: req.body.email, 
                password: req.body.password}  
  res.cookie('user_id', ID);
  res.redirect("/urls");
  });
  
  app.post("/login", (req, res) => {
    if (req.body.email === "" || req.body.password === "") {
      res.status(400).send("Email and password required");
    } 
    for (const user in users) {
      if(users[user].email === req.body.email) { 
        if (users[user].password === req.body.password) {
          res.cookie("user_id", users[user].id); 
          return res.redirect("/urls");
        }  
      }    
    } 
    res.status(403).send("Invalid email/password")
  });
  
  app.post("/logout", (req, res) => {
    res.clearCookie('user_id'); 
    res.redirect('/urls');
})
  // --------------Misc----------------------
  app.get("/", (req, res) => {
    res.send("Hello!");
  }); 
  app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  }); 
  
  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });