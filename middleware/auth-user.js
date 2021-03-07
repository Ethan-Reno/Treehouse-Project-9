'use strict';
const auth = require('basic-auth');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

// Middleware to authenticate the request using Basic Authentication.
exports.authenticateUser = async (req, res, next) => {
  let message;
  
  // Parse the user's credentials from the Authorization header.
  const credentials = auth(req); //Assuming that the request contains a valid Basic Authentication Authorization header value, the credentials variable will be set to an object containing the user's key and secret (their username and password)
  
  // If the user's credentials are available...
  if (credentials) {
    // Attempt to retrieve the user from the data store by their username (i.e. the user's "key" from the Authorization header).
    const user = await User.findOne({ where: {emailAddress: credentials.name} });

    // If a user was successfully retrieved from the data store...
    if (user) {
      // Use the bcrypt to compare the user's password (from the Authorization header) to the user's password that was retrieved from the data store.
      const authenticated = bcrypt.compareSync(credentials.pass, user.password);
      
      // If the passwords match...
      if (authenticated) {
        // Store the retrieved user object on the request object so any middleware that follows this one will have access to the user's information.
        req.currentUser = user;
    
      } else { // for `if (authenticated)`
        message = `Authentication failure`;
      }
    } else { // for `if (user)`
      message = `User not found`;
    }
  } else { // for `if (credentials)`
    message = 'Auth header not found';
  }

  // If user authentication failed...
  if (message) {
    // Return a response with a 401 Unauthorized HTTP status code.
    console.warn(message);
    res.status(401).json({message: 'Access denied'});
  
  // Or if user authentication succeeded...
  } else {
    // Call the next() method.  
    next();
  }
}