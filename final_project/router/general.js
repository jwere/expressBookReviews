const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Check if a user with the given username already exists
const doesExist = (username) => {
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
      return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
      return true;
  } else {
      return false;
  }
}

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
      // Check if the user does not already exist
      if (!doesExist(username)) {
          // Add the new user to the users array
          users.push({"username": username, "password": password});
          return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else {
          return res.status(404).json({message: "User already exists!"});
      }
  }
  // Return error if username or password is missing
  return res.status(404).json({message: "Unable to register user."});
});


// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const book = books[req.params.isbn];
  if (book){
    res.send(JSON.stringify(book));
  }else{
    return res.status(203).json({message: "Book with ISBN " + req.params.isbn + "Does Not Exist"});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  
  let booksByAuthor ={};
  Object.entries(books).map((entry) => {
    const key = entry[0];
    const value = entry[1];
    if (value.author === author){
        if (!booksByAuthor[author]){
            booksByAuthor[author] = [];
        }
        booksByAuthor[author].push(value);
    }
  });
  
  if (Object.keys(booksByAuthor).length > 0){
    res.send(booksByAuthor);
  }else{
    res.status(203).json({message: "No Books By Author: " + author});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  
  let booksByTitle = {}
  Object.entries(books).map((entry) => {
    const key = entry[0];
    const value = entry[1];
    if (value && value.title === title){
        if (!booksByTitle[title]){
            booksByTitle[title] = [];
        }
      booksByTitle[title].push(value);
    }
  });
  
  if (Object.keys(booksByTitle).length >0){
    res.send((booksByTitle));
  }else{
    res.status(203).json({message: "No Books With Title: " + title});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book){
    res.send(book['reviews']);
  }else{
    res.status(204).json({message: "No Books With ISBN " + isbn + "Available"});
  }
});

module.exports.general = public_users;
