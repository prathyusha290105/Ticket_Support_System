const puppeteer = require('../frontend/node_modules/puppeteer-core');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function capture() {
  console.log('[Screenshots] Launching headless browser...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const screenshotDir = __dirname;

  try {
    // --- PART 1: CUSTOMER FLOW ---
    const customerPage = await browser.newPage();
    await customerPage.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });

    // 1. Login Page
    console.log('[Screenshots] 1. Capturing Login Page...');
    await customerPage.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
    await customerPage.screenshot({ path: path.join(screenshotDir, '01_login_page.png') });

    // 2. Customer Dashboard
    console.log('[Screenshots] 2. Logging in as Demo Customer...');
    const demoCustBtn = await customerPage.waitForSelector('.demo-btn-group button:first-child');
    await demoCustBtn.click();
    await new Promise((r) => setTimeout(r, 300));
    const submitBtn = await customerPage.waitForSelector('button[type="submit"]');
    await submitBtn.click();

    await customerPage.waitForSelector('.stat-card', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 600));
    console.log('[Screenshots] Capturing Customer Dashboard...');
    await customerPage.screenshot({ path: path.join(screenshotDir, '02_customer_dashboard.png') });

    // 3. Create Ticket Page
    console.log('[Screenshots] 3. Capturing Create Ticket Page...');
    await customerPage.goto('http://localhost:3000/tickets/new', { waitUntil: 'networkidle0' });
    await customerPage.waitForSelector('#ticketTitle', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 400));
    await customerPage.screenshot({ path: path.join(screenshotDir, '03_create_ticket.png') });

    // 4. Ticket Details & Conversation
    console.log('[Screenshots] 4. Capturing Ticket Details & Conversation...');
    await customerPage.goto('http://localhost:3000/tickets', { waitUntil: 'networkidle0' });
    await customerPage.waitForSelector('.ticket-table tbody tr a.ticket-title-link', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 400));
    
    // Find the ticket href with active conversation (e.g., Unable to process payment or first ticket)
    const ticketHref = await customerPage.evaluate(() => {
      // Find row with IN_PROGRESS or first row
      const rows = Array.from(document.querySelectorAll('.ticket-table tbody tr'));
      for (const row of rows) {
        if (row.innerText.includes('Unable to process payment') || row.innerText.includes('IN PROGRESS') || row.innerText.includes('RESOLVED')) {
          const a = row.querySelector('a.ticket-title-link');
          if (a) return a.getAttribute('href');
        }
      }
      const firstLink = document.querySelector('.ticket-table tbody tr a.ticket-title-link');
      return firstLink ? firstLink.getAttribute('href') : null;
    });

    if (ticketHref) {
      console.log(`[Screenshots] Navigating to ticket details: ${ticketHref}`);
      await customerPage.goto('http://localhost:3000' + ticketHref, { waitUntil: 'networkidle0' });
      await customerPage.waitForSelector('.message-bubble', { timeout: 10000 });
      await new Promise((r) => setTimeout(r, 800));
      await customerPage.screenshot({ path: path.join(screenshotDir, '04_ticket_conversation.png') });
    }
    await customerPage.close();

    // --- PART 2: AGENT FLOW IN FRESH CONTEXT ---
    console.log('[Screenshots] 5. Launching fresh page for Support Agent...');
    const agentContext = await browser.createBrowserContext();
    const agentPage = await agentContext.newPage();
    await agentPage.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });

    await agentPage.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
    const demoAgentBtn = await agentPage.waitForSelector('.demo-btn-group button:last-child');
    await demoAgentBtn.click();
    await new Promise((r) => setTimeout(r, 300));
    const agentSubmitBtn = await agentPage.waitForSelector('button[type="submit"]');
    await agentSubmitBtn.click();

    await agentPage.waitForSelector('.stat-card', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 800));
    console.log('[Screenshots] Capturing Support Agent Dashboard...');
    await agentPage.screenshot({ path: path.join(screenshotDir, '05_agent_dashboard.png') });

    // 6. Agent Ticket Management Queue
    console.log('[Screenshots] 6. Capturing Agent Ticket Queue...');
    await agentPage.goto('http://localhost:3000/tickets', { waitUntil: 'networkidle0' });
    await agentPage.waitForSelector('.ticket-table', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 600));
    await agentPage.screenshot({ path: path.join(screenshotDir, '06_agent_ticket_queue.png') });

    console.log('\n[Screenshots] >>> ALL 6 APPLICATION SCREENSHOTS SUCCESSFULLY CAPTURED! <<<');
  } catch (err) {
    console.error('[Screenshots Error]:', err.message);
  } finally {
    await browser.close();
  }
}

capture();
