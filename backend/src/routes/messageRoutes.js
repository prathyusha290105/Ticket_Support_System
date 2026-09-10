const express = require('express');
const router = express.Router({ mergeParams: true });
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const { validateCreateMessage } = require('../middleware/validateMiddleware');

router.use(protect);

router
  .route('/')
  .get(messageController.getTicketMessages)
  .post(validateCreateMessage, messageController.createTicketMessage);

module.exports = router;
