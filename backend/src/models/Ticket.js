const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Ticket must belong to a customer']
    },
    title: {
      type: String,
      required: [true, 'Please provide a ticket title'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide a ticket description'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters']
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: {
        values: ['Technical Issue', 'Billing', 'Account', 'General', 'Other'],
        message: '{VALUE} is not a valid category'
      }
    },
    priority: {
      type: String,
      required: [true, 'Please specify priority'],
      enum: {
        values: ['LOW', 'MEDIUM', 'HIGH'],
        message: '{VALUE} is not a valid priority'
      },
      default: 'MEDIUM'
    },
    status: {
      type: String,
      required: [true, 'Please specify status'],
      enum: {
        values: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
        message: '{VALUE} is not a valid status'
      },
      default: 'OPEN'
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes for query performance
TicketSchema.index({ customer: 1 });
TicketSchema.index({ status: 1 });
TicketSchema.index({ priority: 1 });
TicketSchema.index({ category: 1 });
TicketSchema.index({ assignedAgent: 1 });
TicketSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Ticket', TicketSchema);
