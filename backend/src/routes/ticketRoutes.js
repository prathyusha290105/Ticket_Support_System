const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const messageRoutes = require('./messageRoutes');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateCreateTicket } = require('../middleware/validateMiddleware');

// Mount message routes as subresource: /api/tickets/:id/messages
router.use('/:id/messages', messageRoutes);

// Protect all ticket routes
router.use(protect);

router
  .route('/')
  .get(ticketController.getTickets)
  .post(validateCreateTicket, ticketController.createTicket);

router
  .route('/:id')
  .get(ticketController.getTicketById)
  .patch(authorize('AGENT'), ticketController.updateTicket);

router
  .route('/:id/assign')
  .patch(authorize('AGENT'), ticketController.assignTicket);

module.exports = router;
