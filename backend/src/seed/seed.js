const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const TicketMessage = require('../models/TicketMessage');

const seedData = async () => {
  try {
    console.log(`[Seed] Connecting to MongoDB at ${env.MONGODB_URI}...`);
    await mongoose.connect(env.MONGODB_URI);

    console.log('[Seed] Clearing existing data in collections...');
    await User.deleteMany({});
    await Ticket.deleteMany({});
    await TicketMessage.deleteMany({});

    console.log('[Seed] Creating demo users...');
    // Create Demo Customer
    const demoCustomer = await User.create({
      name: 'Sarah Jenkins',
      email: 'customer@supportdesk.com',
      password: 'password123',
      role: 'CUSTOMER'
    });

    // Create a second customer to test cross-customer data isolation
    const secondCustomer = await User.create({
      name: 'Alex Rivera',
      email: 'alex@example.com',
      password: 'password123',
      role: 'CUSTOMER'
    });

    // Create Demo Support Agent
    const demoAgent = await User.create({
      name: 'David Miller',
      email: 'agent@supportdesk.com',
      password: 'password123',
      role: 'AGENT'
    });

    console.log('[Seed] Demo users created:');
    console.log(`  Customer: ${demoCustomer.email} (password: password123)`);
    console.log(`  Customer 2: ${secondCustomer.email} (password: password123)`);
    console.log(`  Agent:    ${demoAgent.email} (password: password123)`);

    console.log('[Seed] Creating sample tickets...');
    const ticket1 = await Ticket.create({
      customer: demoCustomer._id,
      title: 'Unable to process payment for Pro Subscription',
      description: 'Whenever I submit my credit card details for renewing the annual Pro plan, I receive an error stating "Gateway timeout (ERR_504)". The charge was deducted from my bank but the subscription remains inactive.',
      category: 'Billing',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignedAgent: demoAgent._id
    });

    const ticket2 = await Ticket.create({
      customer: demoCustomer._id,
      title: 'Single Sign-On (SSO) login redirect loop',
      description: 'After enabling Google Workspace SSO, team members attempting to login via company domain are redirected back to the login screen with code "AUTH_STATE_MISMATCH".',
      category: 'Technical Issue',
      priority: 'HIGH',
      status: 'OPEN',
      assignedAgent: null
    });

    const ticket3 = await Ticket.create({
      customer: demoCustomer._id,
      title: 'Request to update billing contact email and tax ID',
      description: 'Our accounting department needs our company VAT / GST registration number added to past invoices and all future billing notifications forwarded to finance@acmecorp.com.',
      category: 'Account',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      assignedAgent: demoAgent._id
    });

    const ticket4 = await Ticket.create({
      customer: demoCustomer._id,
      title: 'Feature inquiry regarding webhook event notifications',
      description: 'Does the current API support real-time webhook callbacks for ticket status changes? If so, where can I find the endpoint documentation and webhook signature validation specs?',
      category: 'General',
      priority: 'LOW',
      status: 'CLOSED',
      assignedAgent: demoAgent._id
    });

    // Sample ticket for the second customer to test isolation
    const ticket5 = await Ticket.create({
      customer: secondCustomer._id,
      title: 'Dark mode toggle is not persisting after page refresh',
      description: 'Whenever I refresh the page or open a new browser tab, the application reverts to light theme despite having Dark Mode enabled in account preferences.',
      category: 'Other',
      priority: 'LOW',
      status: 'OPEN',
      assignedAgent: null
    });

    console.log('[Seed] Creating sample ticket conversation messages...');
    // Conversation for Ticket 1
    await TicketMessage.create([
      {
        ticket: ticket1._id,
        sender: demoCustomer._id,
        message: 'Hello Support, I tried updating my billing details twice today and both attempts charged my card but the dashboard says my subscription is expired. Please help urgently!',
        createdAt: new Date(Date.now() - 3600000 * 4)
      },
      {
        ticket: ticket1._id,
        sender: demoAgent._id,
        message: 'Hi Sarah, thank you for reaching out. I have taken ownership of your ticket and investigated the transaction logs. I can see the pending authorization holds from our payment processor. I am verifying with our finance gateway right now.',
        createdAt: new Date(Date.now() - 3600000 * 3)
      },
      {
        ticket: ticket1._id,
        sender: demoCustomer._id,
        message: 'Thanks David! I appreciate the quick turnaround. Let me know if you need any transaction reference numbers from my bank receipt.',
        createdAt: new Date(Date.now() - 3600000 * 2)
      },
      {
        ticket: ticket1._id,
        sender: demoAgent._id,
        message: 'Your Pro plan subscription has now been manually activated and backdated to ensure zero downtime. The duplicate pending hold has also been reversed and will reflect in your account within 24-48 hours.',
        createdAt: new Date(Date.now() - 3600000 * 1)
      }
    ]);

    // Conversation for Ticket 3 (Resolved)
    await TicketMessage.create([
      {
        ticket: ticket3._id,
        sender: demoCustomer._id,
        message: 'Please update our VAT ID to GB987654321 and send invoices to finance@acmecorp.com.',
        createdAt: new Date(Date.now() - 86400000 * 2)
      },
      {
        ticket: ticket3._id,
        sender: demoAgent._id,
        message: 'Hello Sarah, your tax registration number and secondary billing notification email have been successfully updated in our records. All regenerated invoices have been forwarded to your finance team.',
        createdAt: new Date(Date.now() - 86400000 * 1)
      }
    ]);

    console.log('[Seed] Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error]: ${error.message}`);
    process.exit(1);
  }
};

seedData();
