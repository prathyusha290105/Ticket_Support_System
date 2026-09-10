const Ticket = require('../models/Ticket');

/**
 * Calculate dynamic ticket statistics from MongoDB
 */
const getDashboardStats = async ({ user }) => {
  const baseFilter = {};

  // If customer, scope to user's tickets
  if (user.role === 'CUSTOMER') {
    baseFilter.customer = user._id;
  }

  const [
    total,
    open,
    inProgress,
    resolved,
    closed,
    highPriority,
    assignedToMe
  ] = await Promise.all([
    Ticket.countDocuments(baseFilter),
    Ticket.countDocuments({ ...baseFilter, status: 'OPEN' }),
    Ticket.countDocuments({ ...baseFilter, status: 'IN_PROGRESS' }),
    Ticket.countDocuments({ ...baseFilter, status: 'RESOLVED' }),
    Ticket.countDocuments({ ...baseFilter, status: 'CLOSED' }),
    Ticket.countDocuments({ ...baseFilter, priority: 'HIGH' }),
    user.role === 'AGENT' ? Ticket.countDocuments({ assignedAgent: user._id }) : 0
  ]);

  // Quick category distribution for dashboard insights
  const categoryStats = await Ticket.aggregate([
    { $match: baseFilter },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  const categories = categoryStats.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  return {
    total,
    open,
    inProgress,
    resolved,
    closed,
    highPriority,
    assignedToMe: user.role === 'AGENT' ? assignedToMe : undefined,
    categories
  };
};

module.exports = {
  getDashboardStats
};
