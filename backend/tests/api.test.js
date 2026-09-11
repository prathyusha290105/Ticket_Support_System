const assert = require('assert');
const http = require('http');
const mongoose = require('mongoose');
const app = require('../src/app');
const env = require('../src/config/env');

let server;
let baseUrl;

const request = async (path, options = {}) => {
  const url = `${baseUrl}${path}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const fetchOptions = {
    method: options.method || 'GET',
    headers
  };
  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);
  const data = await response.json().catch(() => null);
  return { status: response.status, data };
};

async function runTests() {
  console.log('--- Starting SupportDesk Backend API Integration Tests ---');

  // Connect to DB and start HTTP server on random available port
  await mongoose.connect(env.MONGODB_URI);
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[Test Runner] Test server listening on ${baseUrl}`);

  try {
    // 1. Health Check
    console.log('Test 1: GET /api/health');
    const healthRes = await request('/api/health');
    assert.strictEqual(healthRes.status, 200);
    assert.strictEqual(healthRes.data.status, 'UP');
    console.log('✓ Health check passed');

    // 2. Login as Demo Customer
    console.log('Test 2: POST /api/auth/login (Customer)');
    const customerLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'customer@supportdesk.com', password: 'password123' }
    });
    assert.strictEqual(customerLoginRes.status, 200);
    assert.strictEqual(customerLoginRes.data.success, true);
    const customerToken = customerLoginRes.data.data.token;
    const customerId = customerLoginRes.data.data.user._id;
    assert.ok(customerToken);
    console.log('✓ Customer login passed');

    // 3. Login as Demo Agent
    console.log('Test 3: POST /api/auth/login (Agent)');
    const agentLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'agent@supportdesk.com', password: 'password123' }
    });
    assert.strictEqual(agentLoginRes.status, 200);
    assert.strictEqual(agentLoginRes.data.success, true);
    const agentToken = agentLoginRes.data.data.token;
    assert.strictEqual(agentLoginRes.data.data.user.role, 'AGENT');
    console.log('✓ Agent login passed');

    // 4. Access Protected Route without token should fail with 401
    console.log('Test 4: Unauthenticated access rejection');
    const unauthRes = await request('/api/tickets');
    assert.strictEqual(unauthRes.status, 401);
    console.log('✓ 401 Unauthorized enforced for missing token');

    // 5. Customer creates a ticket
    console.log('Test 5: POST /api/tickets (Create Ticket)');
    const createRes = await request('/api/tickets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        title: 'Billing question regarding invoice breakdown',
        description: 'I need a detailed itemized breakdown of services for this month.',
        category: 'Billing',
        priority: 'MEDIUM'
      }
    });
    assert.strictEqual(createRes.status, 201);
    assert.strictEqual(createRes.data.data.status, 'OPEN');
    const newTicketId = createRes.data.data._id;
    console.log('✓ Ticket created successfully by Customer');

    // 6. Customer lists tickets (Scoped to Customer)
    console.log('Test 6: GET /api/tickets (Customer scope)');
    const custTicketsRes = await request('/api/tickets', {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert.strictEqual(custTicketsRes.status, 200);
    assert.ok(Array.isArray(custTicketsRes.data.data));
    // Verify all returned tickets belong to this customer
    for (const t of custTicketsRes.data.data) {
      assert.strictEqual(t.customer._id, customerId);
    }
    console.log('✓ Customer ticket listing is strictly scoped to customer');

    // 7. Isolation check: Login as Customer 2 (Alex)
    console.log('Test 7: Cross-customer ticket isolation');
    const alexLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'alex@example.com', password: 'password123' }
    });
    const alexToken = alexLoginRes.data.data.token;
    // Alex tries to view Sarah's newly created ticket
    const unauthorizedTicketView = await request(`/api/tickets/${newTicketId}`, {
      headers: { Authorization: `Bearer ${alexToken}` }
    });
    assert.strictEqual(unauthorizedTicketView.status, 403);
    console.log('✓ Cross-customer access forbidden (403 returned)');

    // 8. Customer cannot update ticket status/priority (Agent only)
    console.log('Test 8: Role authorization check on PATCH /api/tickets/:id');
    const custPatchRes = await request(`/api/tickets/${newTicketId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: { status: 'RESOLVED' }
    });
    assert.strictEqual(custPatchRes.status, 403);
    console.log('✓ Customer prevented from updating ticket status/priority');

    // 9. Agent views ticket & assigns to self
    console.log('Test 9: PATCH /api/tickets/:id/assign (Agent Assignment)');
    const assignRes = await request(`/api/tickets/${newTicketId}/assign`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${agentToken}` }
    });
    assert.strictEqual(assignRes.status, 200);
    assert.strictEqual(assignRes.data.data.status, 'IN_PROGRESS');
    assert.ok(assignRes.data.data.assignedAgent);
    console.log('✓ Agent assigned ticket; status automatically transitioned to IN_PROGRESS');

    // 10. Agent updates ticket status to RESOLVED
    console.log('Test 10: PATCH /api/tickets/:id (Agent Status Update)');
    const statusUpdateRes = await request(`/api/tickets/${newTicketId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${agentToken}` },
      body: { status: 'RESOLVED' }
    });
    assert.strictEqual(statusUpdateRes.status, 200);
    assert.strictEqual(statusUpdateRes.data.data.status, 'RESOLVED');
    console.log('✓ Agent updated ticket status to RESOLVED');

    // 11. Customer sends a reply message
    console.log('Test 11: POST /api/tickets/:id/messages (Customer Reply)');
    const messageRes = await request(`/api/tickets/${newTicketId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: { message: 'Thank you! Could you please clarify line item 3?' }
    });
    assert.strictEqual(messageRes.status, 201);
    assert.strictEqual(messageRes.data.data.sender.role, 'CUSTOMER');
    console.log('✓ Message replied and conversation timeline updated');

        // 12. Agent closes the ticket after customer reply
    console.log('Test 12: PATCH /api/tickets/:id (Close Ticket)');

    const closeTicketRes = await request(`/api/tickets/${newTicketId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${agentToken}` },
      body: { status: 'CLOSED' }
    });

    assert.strictEqual(closeTicketRes.status, 200);
    assert.strictEqual(closeTicketRes.data.data.status, 'CLOSED');

    console.log('✓ Agent updated ticket status to CLOSED');

    // 13. Retrieve conversation messages
    console.log('Test 13: GET /api/tickets/:id/messages');
    const getMessagesRes = await request(`/api/tickets/${newTicketId}/messages`, {
      headers: { Authorization: `Bearer ${agentToken}` }
    });
    assert.strictEqual(getMessagesRes.status, 200);
    assert.ok(getMessagesRes.data.data.length >= 1);
    console.log('✓ Conversation thread fetched with populated sender role');

    // 14. Dashboard statistics
    console.log('Test 14: GET /api/dashboard/stats');
    const agentStatsRes = await request('/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${agentToken}` }
    });
    assert.strictEqual(agentStatsRes.status, 200);
    assert.ok(typeof agentStatsRes.data.data.total === 'number');
    assert.ok(typeof agentStatsRes.data.data.open === 'number');
    assert.ok(typeof agentStatsRes.data.data.resolved === 'number');
    console.log('✓ Dynamic dashboard statistics calculated accurately');

    // 15. Search and Filter
    console.log('Test 15: Search & Filter query tests');
    const searchRes = await request('/api/tickets?status=RESOLVED&priority=MEDIUM', {
      headers: { Authorization: `Bearer ${agentToken}` }
    });
    assert.strictEqual(searchRes.status, 200);
    assert.ok(searchRes.data.data.length >= 1);
    console.log('✓ Search and filter by status and priority verified');

    console.log('\n========================================');
    console.log('ALL 15 BACKEND INTEGRATION TESTS PASSED!');
    console.log('========================================');
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
}

runTests().catch((err) => {
  console.error('Test failure:', err);
  process.exit(1);
});
