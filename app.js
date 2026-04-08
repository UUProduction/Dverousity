// ============================================================
// DVEROUSITY — App Logic
// ============================================================

// State
let sessions = {};
let currentSessionId = null;
let isResponding = false;

// DOM refs
const messagesEl = document.getElementById('messages');
const typingEl = document.getElementById('typing-indicator');
const inputEl = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const chatHistoryList = document.getElementById('chat-history-list');
const welcomeScreen = document.getElementById('welcome-screen');

// ---- INIT ----
function init() {
  loadSessionsFromStorage();
  renderHistoryList();

  if (Object.keys(sessions).length === 0) {
    newChat();
  } else {
    const lastId = Object.keys(sessions).sort((a, b) => sessions[b].updatedAt - sessions[a].updatedAt)[0];
    loadSession(lastId);
  }

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 180) + 'px';
  });

  document.getElementById('send-btn').addEventListener('click', sendMessage);
  document.getElementById('new-chat-btn').addEventListener('click', newChat);
  document.getElementById('settings-btn').addEventListener('click', openSettings);
}

// ---- SESSIONS ----
function generateId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

function newChat() {
  const id = generateId();
  sessions[id] = {
    id,
    title: 'New Chat',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  currentSessionId = id;
  saveSessionsToStorage();
  renderHistoryList();
  renderMessages();
  welcomeScreen.style.display = 'flex';
  messagesEl.style.display = 'none';
  closeSidebar();
}

function loadSession(id) {
  if (!sessions[id]) return;
  currentSessionId = id;
  renderMessages();
  renderHistoryList();
  closeSidebar();

  if (sessions[id].messages.length === 0) {
    welcomeScreen.style.display = 'flex';
    messagesEl.style.display = 'none';
  } else {
    welcomeScreen.style.display = 'none';
    messagesEl.style.display = 'flex';
    scrollToBottom();
  }
}

function saveSessionsToStorage() {
  try {
    localStorage.setItem('dverousity_sessions', JSON.stringify(sessions));
  } catch (e) {
    console.warn('Storage save failed:', e);
  }
}

function loadSessionsFromStorage() {
  try {
    const raw = localStorage.getItem('dverousity_sessions');
    if (raw) sessions = JSON.parse(raw);
  } catch (e) {
    sessions = {};
  }
}

// ---- HISTORY LIST ----
function renderHistoryList() {
  chatHistoryList.innerHTML = '';
  const sorted = Object.values(sessions).sort((a, b) => b.updatedAt - a.updatedAt);

  if (sorted.length === 0) {
    chatHistoryList.innerHTML = '<div style="padding: 12px 10px; font-size: 12px; color: var(--text-muted);">No chats yet</div>';
    return;
  }

  sorted.forEach(session => {
    const item = document.createElement('div');
    item.className = 'history-item' + (session.id === currentSessionId ? ' active' : '');
    item.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 2.5C1 1.67 1.67 1 2.5 1h9C12.33 1 13 1.67 13 2.5v7c0 .83-.67 1.5-1.5 1.5H9l-2 2-2-2H2.5C1.67 11 1 10.33 1 9.5v-7z" stroke="currentColor" stroke-width="1.2"/>
      </svg>
      <span class="history-item-text">${escapeHtml(session.title)}</span>
    `;
    item.addEventListener('click', () => loadSession(session.id));
    chatHistoryList.appendChild(item);
  });
}

// ---- MESSAGES ----
function renderMessages() {
  messagesEl.innerHTML = '';
  if (!currentSessionId || !sessions[currentSessionId]) return;
  const msgs = sessions[currentSessionId].messages;
  msgs.forEach(msg => appendMessageToDOM(msg.role, msg.content, false));
}

function appendMessageToDOM(role, content, animate = true) {
  const msg = document.createElement('div');
  msg.className = `message ${role}`;
  if (!animate) msg.style.animation = 'none';

  if (role === 'user') {
    msg.innerHTML = `
      <div class="user-avatar">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="5.5" r="3" stroke="var(--text-muted)" stroke-width="1.5"/>
          <path d="M2 14c0-3.31 2.69-5 6-5s6 1.69 6 5" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="message-content">
        <div class="message-bubble">${escapeHtml(content)}</div>
      </div>
    `;
  } else {
    msg.innerHTML = `
      <div class="ai-avatar">D</div>
      <div class="message-content">
        <div class="message-bubble">${renderMarkdown(content)}</div>
      </div>
    `;
  }

  messagesEl.appendChild(msg);

  // Bind copy buttons
  msg.querySelectorAll('.copy-code-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = decodeURIComponent(btn.dataset.code);
      navigator.clipboard.writeText(code).then(() => {
        btn.classList.add('copied');
        btn.querySelector('.copy-label').textContent = 'Copied!';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.querySelector('.copy-label').textContent = 'Copy';
        }, 2000);
      });
    });
  });
}

async function sendMessage(content) {
  const text = (typeof content === 'string' ? content : inputEl.value).trim();
  if (!text || isResponding) return;

  // Show chat, hide welcome
  welcomeScreen.style.display = 'none';
  messagesEl.style.display = 'flex';

  // Add user message
  addMessageToSession('user', text);
  appendMessageToDOM('user', text);
  scrollToBottom();

  // Clear input
  inputEl.value = '';
  inputEl.style.height = 'auto';

  // Update session title
  if (sessions[currentSessionId].messages.length === 1) {
    sessions[currentSessionId].title = text.slice(0, 40) + (text.length > 40 ? '...' : '');
    renderHistoryList();
  }

  // Show typing
  isResponding = true;
  sendBtn.disabled = true;
  typingEl.classList.remove('hidden');
  scrollToBottom();

  try {
    const response = await DverousityAI.respond(text, sessions[currentSessionId].messages);

    typingEl.classList.add('hidden');
    addMessageToSession('ai', response);
    appendMessageToDOM('ai', response);
    scrollToBottom();
  } catch (err) {
    typingEl.classList.add('hidden');
    const errMsg = "Hit an error on my end. Try again.";
    addMessageToSession('ai', errMsg);
    appendMessageToDOM('ai', errMsg);
  }

  isResponding = false;
  sendBtn.disabled = false;
  inputEl.focus();
}

function addMessageToSession(role, content) {
  if (!sessions[currentSessionId]) return;
  sessions[currentSessionId].messages.push({ role, content });
  sessions[currentSessionId].updatedAt = Date.now();
  saveSessionsToStorage();
}

function sendStarter(btn) {
  sendMessage(btn.textContent);
}

// ---- MARKDOWN RENDERER ----
function renderMarkdown(text) {
  // Code blocks
  text = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const trimmed = code.trim();
    const label = lang || 'code';
    const encoded = encodeURIComponent(trimmed);
    return `<div class="code-block-wrapper">
      <div class="code-block-header">
        <span class="code-lang-label">${escapeHtml(label)}</span>
        <button class="copy-code-btn" data-code="${encoded}">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.2"/>
            <path d="M3 8H2C1.45 8 1 7.55 1 7V2C1 1.45 1.45 1 2 1h5C7.55 1 8 1.45 8 2v1" stroke="currentColor" stroke-width="1.2"/>
          </svg>
          <span class="copy-label">Copy</span>
        </button>
      </div>
      <pre><code>${escapeHtml(trimmed)}</code></pre>
    </div>`;
  });

  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Unordered lists
  text = text.replace(/^- (.+)$/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Numbered lists
  text = text.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Line breaks to paragraphs
  const parts = text.split(/\n\n+/);
  text = parts.map(part => {
    if (part.startsWith('<div class="code') || part.startsWith('<ul>') || part.startsWith('<ol>')) return part;
    return '<p>' + part.replace(/\n/g, '<br>') + '</p>';
  }).join('');

  return text;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function scrollToBottom() {
  const container = document.getElementById('chat-container');
  setTimeout(() => {
    container.scrollTop = container.scrollHeight;
  }, 50);
}

// ---- SIDEBAR ----
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobile-overlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('visible');
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobile-overlay');
  sidebar.classList.remove('open');
  overlay.classList.remove('visible');
}

// ---- SETTINGS ----
function openSettings() {
  document.getElementById('settings-modal').classList.remove('hidden');
}

function closeSettings() {
  document.getElementById('settings-modal').classList.add('hidden');
}

function clearAllHistory() {
  if (confirm('Clear all chat history? This cannot be undone.')) {
    sessions = {};
    localStorage.removeItem('dverousity_sessions');
    closeSettings();
    newChat();
  }
}

// Close modal on backdrop click
document.getElementById('settings-modal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('settings-modal')) closeSettings();
});

// ---- START ----
init();
