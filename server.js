const { chromium } = require('playwright');
const express = require('express');
const app = express();
app.use(express.json({ limit: '10mb' }));

// This secret must match OPHELIA_PRO_SECRET in your Cloudflare Worker
const SECRET = process.env.OPHELIA_PRO_SECRET || "ophelia_pro_8829_x2_secure_v1";

app.post('/call', async (req, res) => {
  if (req.headers['x-ophelia-secret'] !== SECRET) {
    console.error('Unauthorized access attempt');
    return res.status(401).send('Unauthorized');
  }
  
  const { method, params } = req.body;
  console.log(`Executing MCP method: ${method}`);

  let browser;
  try {
    browser = await chromium.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const context = await browser.newContext({ 
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    let result;
    if (method === 'browser.navigate') {
      await page.goto(params.url, { waitUntil: 'networkidle', timeout: 30000 });
      result = { ok: true };
    } 
    else if (method === 'browser.click') {
      if (params.x && params.y) {
        await page.mouse.click(params.x, params.y);
      } else {
        await page.click(params.selector, { timeout: 10000 });
      }
      result = { ok: true };
    }
    else if (method === 'browser.type') {
      await page.fill(params.selector, params.text, { timeout: 10000 });
      result = { ok: true };
    }
    else if (method === 'browser.hover') {
      await page.hover(params.selector, { timeout: 10000 });
      result = { ok: true };
    }
    else if (method === 'browser.screenshot') {
      const buffer = await page.screenshot({ type: 'jpeg', quality: 70 });
      result = { screenshot: buffer.toString('base64') };
    } 
    else if (method === 'browser.evaluate') {
      const evalResult = await page.evaluate(params.script);
      result = { result: evalResult };
    }
    else {
      throw new Error(`Unknown method: ${method}`);
    }
    
    await browser.close();
    res.json(result);
  } catch (e) {
    console.error(`MCP Error (${method}):`, e.message);
    if (browser) await browser.close();
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Ophelia MCP Server running on port ${PORT}`));
