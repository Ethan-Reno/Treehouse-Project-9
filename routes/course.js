'use strict';

const express = require('express');
const { asyncHandler } = require('../middleware/async-handler');
const { authenticateUser } = require('../middleware/auth-user');
const { Course } = require('../models');


// Construct a router instance.
const router = express.Router();

// an /api/courses GET route that will return a list of all courses including the User that owns each course and a 200 HTTP status code.
router.get('/courses', asyncHandler(async(req, res) => {
  const courses = await Course.findAll({
    include: [
      {
        model: User,
        attributes: {exclude: ['password']}
      },
    ],
  })
  res.json(courses);
}));

// an /api/courses/:id GET route that will return the corresponding course along with the User that owns that course and a 200 HTTP status code.

// an /api/courses POST route that will create a new course, set the Location header to the URI for the newly created course, and return a 201 HTTP status code and no content.

// an /api/courses/:id PUT route that will update the corresponding course and return a 204 HTTP status code and no content.

// an /api/courses/:id DELETE route that will delete the corresponding course and return a 204 HTTP status code and no content.