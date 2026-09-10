const ticketService = require('../services/ticketService');

/**
 * @desc    Create a new support ticket
 * @route   POST /api/tickets
 * @access  Private (Customer or Agent)
 */
const createTicket = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;
    const ticket = await ticketService.createTicket({
      customerId: req.user._id,
      title,
      description,
      category,
      priority
    });

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tickets (Customer sees own; Agent sees all)
 * @route   GET /api/tickets
 * @access  Private
 */
const getTickets = async (req, res, next) => {
  try {
    const tickets = await ticketService.getTickets({
      user: req.user,
      query: req.query
    });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single ticket by ID
 * @route   GET /api/tickets/:id
 * @access  Private
 */
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await ticketService.getTicketById({
      ticketId: req.params.id,
      user: req.user
    });

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update ticket status, priority, or category
 * @route   PATCH /api/tickets/:id
 * @access  Private (Agent only)
 */
const updateTicket = async (req, res, next) => {
  try {
    const updatedTicket = await ticketService.updateTicket({
      ticketId: req.params.id,
      user: req.user,
      updates: req.body
    });

    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      data: updatedTicket
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign ticket to an agent or take ownership
 * @route   PATCH /api/tickets/:id/assign
 * @access  Private (Agent only)
 */
const assignTicket = async (req, res, next) => {
  try {
    const { agentId } = req.body;
    const assignedTicket = await ticketService.assignTicket({
      ticketId: req.params.id,
      user: req.user,
      agentId
    });

    res.status(200).json({
      success: true,
      message: 'Ticket assigned successfully',
      data: assignedTicket
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  assignTicket
};
