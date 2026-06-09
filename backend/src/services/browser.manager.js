import { chromium } from 'playwright';
import { randomUUID } from 'crypto';
const VIEWPORT = { width: 1280, height: 720 };
const FRAME_INTERVAL_MS = 500; // Increased from 150 to save huge amounts of CPU
const MAX_TABS = 10;
const NAVIGATE_TIMEOUT = 60000; // Increased from 15000 to prevent timeout on slow servers
const NEW_TAB_HTML = `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        background-color: #0a0a0c;
        color: #71717a;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin: 0;
        user-select: none;
      }
      .logo {
        width: 64px;
        height: 64px;
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        border-radius: 16px;
        margin-bottom: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 32px rgba(59, 130, 246, 0.2);
      }
      .logo svg {
        width: 32px;
        height: 32px;
        color: white;
      }
      h1 {
        color: #f4f4f5;
        font-size: 28px;
        font-weight: 600;
        margin: 0 0 12px 0;
        letter-spacing: -0.5px;
      }
      p {
        font-size: 15px;
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div class="logo">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
    </div>
    <h1>Virtual Browser</h1>
    <p>Type a URL or search query to get started</p>
  </body>
</html>
`;
const BLOCKED_PATTERNS = [
  /^file:\/\//i,
  /^chrome:\/\//i,
  /^chrome-extension:\/\//i,
  /^about:/i,
  /localhost/i,
  /127\.0\.0\.1/,
  /0\.0\.0\.0/,
];
const roomSessions = new Map();
function isBlockedUrl(url) {
  return BLOCKED_PATTERNS.some((re) => re.test(url));
}
function formatUrl(input) {
  const trimmed = (input || '').trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[^\s]+\.[^\s]+$/.test(trimmed)) return `https://${trimmed}`;
  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
}
function serialiseTabs(session) {
  const tabs = [];
  for (const [id, page] of session.tabsMap) {
    tabs.push({
      id,
      url: page.url(),
      title: page.title ? page.title() : '',
    });
  }
  return tabs;
}
async function buildTabsState(session) {
  const tabs = [];
  for (const [id, page] of session.tabsMap) {
    let title = '';
    try { title = await page.title(); } catch {  }
    tabs.push({ id, url: page.url(), title });
  }
  return { tabs, activeTabId: session.activeTabId };
}
function startScreenshotLoop(roomId, session, io) {
  if (session.frameIntervalId) return; 
  session.frameIntervalId = setInterval(async () => {
    try {
      const page = session.tabsMap.get(session.activeTabId);
      if (!page || page.isClosed()) return;
      const buffer = await page.screenshot({ type: 'jpeg', quality: 40 });
      io.of('/browser').to(roomId).emit('browser:frame', {
        buffer,
        tabId: session.activeTabId,
      });
    } catch {
    }
  }, FRAME_INTERVAL_MS);
}
function stopScreenshotLoop(session) {
  if (session.frameIntervalId) {
    clearInterval(session.frameIntervalId);
    session.frameIntervalId = null;
  }
}
export async function getOrCreateSession(roomId, io, startUrl) {
  if (roomSessions.has(roomId)) return roomSessions.get(roomId);
  const browser = await chromium.launch({ 
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-zygote',
      '--single-process'
    ]
  });
  const context = await browser.newContext({ 
    viewport: VIEWPORT,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  await context.addInitScript("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})");
  
  // Create a reusable route interceptor for blocking ads/trackers
  const applyAdBlocker = async (page) => {
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (url.includes('googleads') || url.includes('doubleclick') || url.includes('analytics') || url.includes('tracking')) {
        route.abort();
      } else {
        route.continue();
      }
    });
  };

  const initialPage = await context.newPage();
  await applyAdBlocker(initialPage);

  const tabId = randomUUID();
  if (startUrl) {
    await initialPage.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: NAVIGATE_TIMEOUT }).catch(() => {});
  } else {
    await initialPage.setContent(NEW_TAB_HTML).catch(() => {});
  }
  
  // Add ad-blocker / Tracker blocker for all new pages to speed up loading
  context.on('page', async (page) => {
    await applyAdBlocker(page);
  });

  const session = {
    browser,
    context,
    tabsMap: new Map([[tabId, initialPage]]),
    activeTabId: tabId,
    connectedUsers: new Set(),
    frameIntervalId: null,
  };
  roomSessions.set(roomId, session);
  startScreenshotLoop(roomId, session, io);
  return session;
}
export async function createTab(roomId) {
  const session = roomSessions.get(roomId);
  if (!session) throw new Error('No session for room');
  if (session.tabsMap.size >= MAX_TABS) throw new Error('Maximum tabs reached');
  const page = await session.context.newPage();
  const tabId = randomUUID();
  await page.setContent(NEW_TAB_HTML).catch(() => {});
  session.tabsMap.set(tabId, page);
  session.activeTabId = tabId;
  return { tabId, tabsState: await buildTabsState(session) };
}
export async function closeTab(roomId, tabId) {
  const session = roomSessions.get(roomId);
  if (!session) return null;
  const page = session.tabsMap.get(tabId);
  if (!page) return null;
  try { await page.close(); } catch {  }
  session.tabsMap.delete(tabId);
  if (session.activeTabId === tabId) {
    const keys = [...session.tabsMap.keys()];
    session.activeTabId = keys.length > 0 ? keys[keys.length - 1] : null;
  }
  return await buildTabsState(session);
}
export async function switchTab(roomId, tabId) {
  const session = roomSessions.get(roomId);
  if (!session || !session.tabsMap.has(tabId)) return null;
  session.activeTabId = tabId;
  return await buildTabsState(session);
}
export async function navigateTab(roomId, tabId, rawUrl) {
  const session = roomSessions.get(roomId);
  if (!session) throw new Error('No session for room');
  const page = session.tabsMap.get(tabId);
  if (!page) throw new Error('Tab not found');
  const url = formatUrl(rawUrl);
  if (!url) throw new Error('Empty URL');
  if (isBlockedUrl(url)) throw new Error('URL is blocked for security');
  await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: NAVIGATE_TIMEOUT,
  });
  let title = '';
  try { title = await page.title(); } catch {  }
  return { tabId, url: page.url(), title };
}
export async function goBack(roomId, tabId) {
  const session = roomSessions.get(roomId);
  if (!session) return null;
  const page = session.tabsMap.get(tabId);
  if (!page) return null;
  await page.goBack({ waitUntil: 'domcontentloaded', timeout: NAVIGATE_TIMEOUT }).catch(() => {});
  let title = '';
  try { title = await page.title(); } catch {}
  return { tabId, url: page.url(), title };
}
export async function goForward(roomId, tabId) {
  const session = roomSessions.get(roomId);
  if (!session) return null;
  const page = session.tabsMap.get(tabId);
  if (!page) return null;
  await page.goForward({ waitUntil: 'domcontentloaded', timeout: NAVIGATE_TIMEOUT }).catch(() => {});
  let title = '';
  try { title = await page.title(); } catch {}
  return { tabId, url: page.url(), title };
}
export async function refreshTab(roomId, tabId) {
  const session = roomSessions.get(roomId);
  if (!session) return null;
  const page = session.tabsMap.get(tabId);
  if (!page) return null;
  await page.reload({ waitUntil: 'domcontentloaded', timeout: NAVIGATE_TIMEOUT }).catch(() => {});
  let title = '';
  try { title = await page.title(); } catch {}
  return { tabId, url: page.url(), title };
}
export async function handleInteraction(roomId, tabId, action) {
  const session = roomSessions.get(roomId);
  if (!session) return;
  const page = session.tabsMap.get(tabId);
  if (!page) return;
  try {
    switch (action.type) {
      case 'click':
        await page.mouse.click(action.x, action.y);
        break;
      case 'mousemove':
        await page.mouse.move(action.x, action.y);
        break;
      case 'scroll':
        await page.mouse.move(action.x, action.y);
        await page.mouse.wheel(action.deltaX || 0, action.deltaY || 0);
        break;
      case 'keydown':
        await page.keyboard.down(action.key);
        break;
      case 'keyup':
        await page.keyboard.up(action.key);
        break;
      case 'keypress':
        await page.keyboard.press(action.key);
        break;
      default:
        break;
    }
  } catch {
  }
}
export function addUser(roomId, socketId) {
  const session = roomSessions.get(roomId);
  if (session) session.connectedUsers.add(socketId);
}
export async function removeUser(roomId, socketId) {
  const session = roomSessions.get(roomId);
  if (!session) return;
  session.connectedUsers.delete(socketId);
  if (session.connectedUsers.size === 0) {
    await destroySession(roomId);
  }
}
export async function destroySession(roomId) {
  const session = roomSessions.get(roomId);
  if (!session) return;
  stopScreenshotLoop(session);
  for (const [, page] of session.tabsMap) {
    try { await page.close(); } catch {}
  }
  session.tabsMap.clear();
  try { await session.context.close(); } catch {}
  try { await session.browser.close(); } catch {}
  roomSessions.delete(roomId);
  console.log(`[BrowserManager] Session destroyed for room: ${roomId}`);
}
export async function getTabsState(roomId) {
  const session = roomSessions.get(roomId);
  if (!session) return null;
  return await buildTabsState(session);
}
