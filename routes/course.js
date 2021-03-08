'use strict';

const express = require('express');
const { asyncHandler } = require('../middleware/async-handler');
const { authenticateUser } = require('../middleware/auth-user');
const { Course, User } = require('../models');

// Construct a router instance.
const router = express.Router();

// an /api/courses GET route that will return a list of all courses including the User that owns each course and a 200 HTTP status code.
router.get('/courses', asyncHandler(async(req, res) => {
  const courses = await Course.findAll({
    include: [
      {
        model: User,
        attributes: {exclude: ['password', 'createdAt', 'updatedAt']}
      },
    ],
    attributes: { exclude: ['createdAt', 'updatedAt'] }
  })
  res.status(200).json(courses);
}));

// an /api/courses/:id GET route that will return the corresponding course along with the User that owns that course and a 200 HTTP status code.
router.get('/courses/:id', asyncHandler(async(req, res) => {
  const courses = await Course.findByPk(req.params.id, {
    include: [
      {
        model: User,
        attributes: {exclude: ['password', 'createdAt', 'updatedAt']}
      },
    ],
    attributes: { exclude: ['createdAt', 'updatedAt'] }
  })
  res.status(200).json(courses);
}));

// an /api/courses POST route that will create a new course, set the Location header to the URI for the newly created course, and return a 201 HTTP status code and no content.
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).location(`/courses/${course.id}`).end();

  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      throw error;
    }
  }
}));

// an /api/courses/:id PUT route that will update the corresponding course and return a 204 HTTP status code and no content.
router.put('/courses/:id', authenticateUser, asyncHandler(async(req, res) => {
  try {  
    const course = await Course.findByPk(req.params.id);

    if (course) {
      const currentUserId = req.currentUser.id;
      const courseOwnerId = course.userId;
      // Only allow update if the authorized user is also the course owner (indicated by userId)
      if (currentUserId === courseOwnerId) {
        await course.update(req.body);
        res.status(204).end();
      } else {
        res.status(403).json({ "message": "You must be the course owner to update it" });
      }
    } else {
      res.status(404).json({ "message": "No course found" });
    }
  } catch(error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      throw error;
    }
  }
}));

// an /api/courses/:id DELETE route that will delete the corresponding course and return a 204 HTTP status code and no content.
router.delete('/courses/:id', authenticateUser, asyncHandler(async(req, res) => {
  const course = await Course.findByPk(req.params.id);
  if (course) {
    const currentUserId = req.currentUser.id;
    const courseOwnerId = course.userId;
    // Only allow delete if the authorized user is also the course owner (indicated by userId)
    if (currentUserId === courseOwnerId) {
      await course.destroy();
      res.status(204).end();
    } else {
      res.status(403).json({ "message": "You must be the course owner to delete it" });
    }
  } else {
    res.status(404).json({ "message": "No course found" });
  }
}));

module.exports = router;