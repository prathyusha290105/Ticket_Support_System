const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

/**
 * Generate signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
};

/**
 * Register a new user
 */
const registerUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const error = new Error('An account with this email already exists.');
    error.statusCode = 400;
    throw error;
  }

  // Enforce customer role by default unless explicitly allowed
  const assignedRole = role === 'AGENT' ? 'AGENT' : 'CUSTOMER';

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: assignedRole
  });

  const token = generateToken(user._id);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    },
    token
  };
};

/**
 * Authenticate existing user
 */
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    },
    token
  };
};

module.exports = {
  generateToken,
  registerUser,
  loginUser
};
