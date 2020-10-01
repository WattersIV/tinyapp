const generateRandomString = () => {
  let result           = '';
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( var i = 0; i <= 5; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
} 

// Gets all of the users information with the users ID if they exist in the DB
const getUser = (user_id, database) => {
  for (let user in database) {  
    if(user_id === database[user].id) {
      return database[user];
    }
  } 
  return false;
}

//Gets all of the users information using their email if they exist in the DB
const getEmail = (email, database) => {
  for (const user in database) { 
    if(email === database[user].email) {
      return database[user];
    }
  } 
  return false;
} 

//Obtains all of the urls made my the current user
const getMyUrls = (user_id, database) => {
  let myUrls = {};
  for (const url in database) {
    if ( user_id === database[url].userID) {
      myUrls[url] = database[url];
    }
  } 
  return myUrls; 
} 

//Checks if the current cookie is a valid user
const cookieIsUser = (cookie, database) => {
  for (const user in database) {
    if (cookie === user) {
      return true;
    }
  } 
  return false;
}

const getDate = () => {
  const today = new Date();
  const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime = date+' '+time; 
  return dateTime
}

module.exports = {
  getMyUrls, 
  getEmail, 
  getUser,  
  generateRandomString, 
  cookieIsUser, 
  getDate
}