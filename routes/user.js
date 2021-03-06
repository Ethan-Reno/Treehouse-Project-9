'use strict';

const express = require('express');
const { asyncHandler } = require('../middleware/async-handler');
const { authenticateUser } = require('../middleware/auth-user');
const { User } = require('../models');


// Construct a router instance.
const router = express.Router();

// Route that returns a list of users.
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
  // This instructs Express to route GET requests to the path "/api/users" first to our custom middleware function and then to the inline router handler function.
  const user = req.currentUser;
  // Can use the currentUser property with confidence because our inline route handler function will never be called if the request doesn't successfully authenticate.

  res.status(200).json({
    name: user.name,
    username: user.username
  });
}));

// Route that creates a new user.
router.post('/users', asyncHandler(async (req, res) => {
  try {
    await User.create(req.body);
    res.redirect(201, '/') //two arguments: status code and redirect route
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      throw error;
    }
  }
}));

module.exports = router;