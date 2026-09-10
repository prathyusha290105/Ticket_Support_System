const mongoose = require('mongoose');
const TicketMessage = require('../models/TicketMessage');
const Ticket = require('../models/Ticket');

/**
 * Retrieve message history for a ticket
 */
const getTicketMessages = async ({ ticketId, user }) => {
  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    const error = new Error('Invalid ticket ID format.');
    error.statusCode = 400;
    throw error;
  }

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    const error = new Error('Ticket not found.');
    error.statusCode = 404;
    throw error;
  }

  // Enforce customer access authorization
  if (user.role === 'CUSTOMER' && ticket.customer.toString() !== user._id.toString()) {
    const error = new Error('Access denied. You can only view messages for your own tickets.');
    error.statusCode = 403;
    throw error;
  }

  const messages = await TicketMessage.find({ ticket: ticketId })
    .sort({ createdAt: 1 })
    .populate('sender', 'name email role');

  return messages;
};

/**
 * Add a reply message to a ticket
 */
const createTicketMessage = async ({ ticketId, user, message }) => {
  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    const error = new Error('Invalid ticket ID format.');
    error.statusCode = 400;
    throw error;
  }

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    const error = new Error('Ticket not found.');
    error.statusCode = 404;
    throw error;
  }

  // Authorization check
  if (user.role === 'CUSTOMER' && ticket.customer.toString() !== user._id.toString()) {
    const error = new Error('Access denied. You can only reply to your own tickets.');
    error.statusCode = 403;
    throw error;
  }

  // Cannot reply to CLOSED ticket unless customer/agent reopens
  if (ticket.status === 'CLOSED') {
    const error = new Error('Cannot add messages to a closed ticket. Please open a new ticket or contact support.');
    error.statusCode = 400;
    throw error;
  }

  const newMessage = await TicketMessage.create({
    ticket: ticketId,
    sender: user._id,
    message: message.trim()
  });

  // If customer replies to a resolved ticket, we can set it back to IN_PROGRESS
  if (user.role === 'CUSTOMER' && ticket.status === 'RESOLVED') {
    ticket.status = 'IN_PROGRESS';
    await ticket.save();
  }

  return await TicketMessage.findById(newMessage._id)
    .populate('sender', 'name email role');
};

module.exports = {
  getTicketMessages,
  createTicketMessage
};
