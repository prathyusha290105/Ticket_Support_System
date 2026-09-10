// Basic validation helpers for request payloads

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters long.');
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !email.trim()) {
    errors.push('Email is required.');
  }

  if (!password) {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateCreateTicket = (req, res, next) => {
  const { title, description, category, priority } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long.');
  }

  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long.');
  }

  const validCategories = ['Technical Issue', 'Billing', 'Account', 'General', 'Other'];
  if (!category || !validCategories.includes(category)) {
    errors.push(`Category must be one of: ${validCategories.join(', ')}.`);
  }

  if (priority) {
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
    if (!validPriorities.includes(priority)) {
      errors.push(`Priority must be one of: ${validPriorities.join(', ')}.`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateCreateMessage = (req, res, next) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Message text cannot be empty.'
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateTicket,
  validateCreateMessage
};
