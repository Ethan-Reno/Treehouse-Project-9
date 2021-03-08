'use strict';
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  class User extends Model {}
  User.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A first name is required'
        },
        notEmpty: {
          msg: 'Please provide a first name'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A last name is required'
        },
        notEmpty: {
          msg: 'Please provide a last name'
        }
      }
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'This email address is already in use'
      },
      validate: {
        notNull: {
          msg: 'An email address is required'
        },
        notEmpty: {
          msg: 'Please provide an email address'
        },
        isEmail: {
          msg: 'Please provide a valid email address'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
          notNull: {
              msg: 'A password is required'
          },
          notEmpty: {
              msg: 'Please provide a password'
          },
          // Require a length between 6 and 20 characters
          len: {
              args: [6, 20],
              msg: 'The password should be between 6 and 20 characters in length'
          }
      }
  }
}, { sequelize });

    User.addHook(
      "beforeCreate",
      user => (user.password = bcrypt.hashSync(user.password, 10))
  );

  User.associate = (models) => {
    User.hasMany(models.Course, {
      foreignKey: 'userId'
    });
  };

  return User;
};