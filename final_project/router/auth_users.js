const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username, password) => {
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
      return (user.username === username && user.password === password);
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
      return true;
  } else {
      return false;
  }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
      return res.status(404).json({ message: "Error logging in" });
  }
  // Authenticate user
  if (authenticatedUser(username, password)) {
      // Generate JWT access token
      let accessToken = jwt.sign({
          data: password
      }, 'access', { expiresIn: 60 * 60 * 24 });

      // Store access token and username in session
      req.session.authorization = {
          accessToken, username
      }
      return res.status(200).send("User successfully logged in");
  } else {
      return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  let bookToReview = books[isbn]
  if (bookToReview) {
      let review = req.body.review;
      let reviewer = req.session.authorization['username'];
      if(review) {
          bookToReview['reviews'][reviewer] = review;
          books[isbn] = bookToReview;
      }
      res.send(`The review ${review} was added to the book with ISBN  ${isbn} as seen below\n ${JSON.stringify(bookToReview)} `);
  }
  else{
      res.send("Book Not Found!");
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    let user = req.session.authorization['username'];
    let review = books[isbn]["reviews"];
    if (review[user]){
        delete review[user];
        res.send(`The review by ${user} was deleted from the book with ISBN  ${isbn} as seen below\n ${JSON.stringify(books[isbn])} `);
    }
    else{
        res.send("Can't delete, as this review has been posted by a different user");
    }
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
