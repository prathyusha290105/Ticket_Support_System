const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const User = require('../models/User');

/**
 * Create a new ticket (Customer action)
 */
const createTicket = async ({ customerId, title, description, category, priority }) => {
  const ticket = await Ticket.create({
    customer: customerId,
    title: title.trim(),
    description: description.trim(),
    category,
    priority: priority || 'MEDIUM',
    status: 'OPEN'
  });

  return await Ticket.findById(ticket._id)
    .populate('customer', 'name email role')
    .populate('assignedAgent', 'name email role');
};

/**
 * Get tickets list with search, filter, and role-based scoping
 */
const getTickets = async ({ user, query = {} }) => {
  const filter = {};

  // Role scoping: Customers ONLY see their own tickets
  if (user.role === 'CUSTOMER') {
    filter.customer = user._id;
  }

  // Filter by Status
  if (query.status && ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(query.status.toUpperCase())) {
    filter.status = query.status.toUpperCase();
  }

  // Filter by Priority
  if (query.priority && ['LOW', 'MEDIUM', 'HIGH'].includes(query.priority.toUpperCase())) {
    filter.priority = query.priority.toUpperCase();
  }

  // Filter by Category
  if (query.category) {
    filter.category = query.category;
  }

  // Filter by Assigned Agent (e.g. "me" or specific agent ID)
  if (query.assignedAgent) {
    if (query.assignedAgent === 'me') {
      filter.assignedAgent = user._id;
    } else if (query.assignedAgent === 'unassigned') {
      filter.assignedAgent = null;
    } else if (mongoose.Types.ObjectId.isValid(query.assignedAgent)) {
      filter.assignedAgent = query.assignedAgent;
    }
  }

  // Search by Ticket ID or Title
  if (query.search && query.search.trim()) {
    const searchTerm = query.search.trim();
    if (mongoose.Types.ObjectId.isValid(searchTerm)) {
      filter._id = searchTerm;
    } else {
      filter.title = { $regex: searchTerm, $options: 'i' };
    }
  }

  const tickets = await Ticket.find(filter)
    .sort({ createdAt: -1 })
    .populate('customer', 'name email role')
    .populate('assignedAgent', 'name email role');

  return tickets;
};

/**
 * Get single ticket by ID with ownership/access check
 */
const getTicketById = async ({ ticketId, user }) => {
  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    const error = new Error('Invalid ticket ID format.');
    error.statusCode = 400;
    throw error;
  }

  const ticket = await Ticket.findById(ticketId)
    .populate('customer', 'name email role')
    .populate('assignedAgent', 'name email role');

  if (!ticket) {
    const error = new Error('Ticket not found.');
    error.statusCode = 404;
    throw error;
  }

  // Authorization check: customer cannot view other customers' tickets
  if (user.role === 'CUSTOMER' && ticket.customer._id.toString() !== user._id.toString()) {
    const error = new Error('Access denied. You can only view your own tickets.');
    error.statusCode = 403;
    throw error;
  }

  return ticket;
};

/**
 * Update ticket details (Agent action: status, priority, category)
 */
const updateTicket = async ({ ticketId, user, updates }) => {
  const ticket = await getTicketById({ ticketId, user });

  // Only AGENTS can update ticket metadata like status, priority, category
  if (user.role !== 'AGENT') {
    const error = new Error('Access denied. Only support agents can update ticket status or priority.');
    error.statusCode = 403;
    throw error;
  }

  const allowedUpdates = ['status', 'priority', 'category'];
  const updateData = {};

  if (updates.status) {
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(updates.status)) {
      const error = new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }
    updateData.status = updates.status;
  }

  if (updates.priority) {
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
    if (!validPriorities.includes(updates.priority)) {
      const error = new Error(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }
    updateData.priority = updates.priority;
  }

  if (updates.category) {
    const validCategories = ['Technical Issue', 'Billing', 'Account', 'General', 'Other'];
    if (!validCategories.includes(updates.category)) {
      const error = new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }
    updateData.category = updates.category;
  }

  const updatedTicket = await Ticket.findByIdAndUpdate(
    ticketId,
    { $set: updateData },
    { new: true, runValidators: true }
  )
    .populate('customer', 'name email role')
    .populate('assignedAgent', 'name email role');

  return updatedTicket;
};

/**
 * Assign ticket to an agent (or take ownership)
 */
const assignTicket = async ({ ticketId, user, agentId }) => {
  const ticket = await getTicketById({ ticketId, user });

  if (user.role !== 'AGENT') {
    const error = new Error('Access denied. Only support agents can assign tickets.');
    error.statusCode = 403;
    throw error;
  }

  // If no agentId provided, default to current agent taking ownership
  const targetAgentId = agentId || user._id;

  if (!mongoose.Types.ObjectId.isValid(targetAgentId)) {
    const error = new Error('Invalid agent ID format.');
    error.statusCode = 400;
    throw error;
  }

  const agent = await User.findById(targetAgentId);
  if (!agent || agent.role !== 'AGENT') {
    const error = new Error('Target user is not a valid support agent.');
    error.statusCode = 400;
    throw error;
  }

  ticket.assignedAgent = agent._id;
  // If the ticket was OPEN, transition to IN_PROGRESS upon assignment
  if (ticket.status === 'OPEN') {
    ticket.status = 'IN_PROGRESS';
  }

  await ticket.save();

  return await Ticket.findById(ticket._id)
    .populate('customer', 'name email role')
    .populate('assignedAgent', 'name email role');
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  assignTicket
};
