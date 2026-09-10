const mongoose = require('mongoose');

const TicketMessageSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: [true, 'Message must be associated with a ticket']
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Message must have a sender']
    },
    message: {
      type: String,
      required: [true, 'Message body cannot be empty'],
      trim: true,
      minlength: [1, 'Message cannot be empty']
    }
  },
  {
    timestamps: true
  }
);

TicketMessageSchema.index({ ticket: 1, createdAt: 1 });

module.exports = mongoose.model('TicketMessage', TicketMessageSchema);
