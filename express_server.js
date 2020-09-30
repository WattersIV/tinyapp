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

//-----------URL Post/Get -----------------

app.use(bodyParser.urlencoded({extended: true})); //transforms body data from buffer to a string
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(); 
  urlDatabase[shortURL] = req.body.longURL; //adds key value pair to the object
  res.redirect(`/urls/${shortURL}`);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});  
app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase,
                      username: req.cookies["username"]}; 
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {     // gen a new short url
  const templateVars = {urls: urlDatabase,
                        username: req.cookies["username"]}; 
res.render("urls_new", templateVars);});

app.get("/urls/:shortURL", (req, res) => {    //find longurl with short
  const templateVars = { shortURL: req.params.shortURL, 
                        longURL: urlDatabase[req.params.shortURL], 
                        username: req.cookies["username"] }; 
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
  
  app.post("/login", (req, res) => {
    console.log(req.body.username);
    res.cookie('username', req.body.username);
    res.redirect('/urls');
  });
  
  app.post("/logout", (req, res) => {
    res.clearCookie('username'); 
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