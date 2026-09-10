const messageService = require('../services/messageService');

/**
 * @desc    Get all messages for a ticket
 * @route   GET /api/tickets/:id/messages
 * @access  Private
 */
const getTicketMessages = async (req, res, next) => {
  try {
    const messages = await messageService.getTicketMessages({
      ticketId: req.params.id,
      user: req.user
    });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a reply message to a ticket
 * @route   POST /api/tickets/:id/messages
 * @access  Private
 */
const createTicketMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const newMessage = await messageService.createTicketMessage({
      ticketId: req.params.id,
      user: req.user,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Message added successfully',
      data: newMessage
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTicketMessages,
  createTicketMessage
};
