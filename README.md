# Dverousity

A dev assistant chatbot for **Roblox Studio (Lua/Luau)** and **JavaScript** development. Clean dark chat interface, runs entirely in the browser with no external APIs or backend required.

## What it does

- Roblox Studio scripting help — RemoteEvents, DataStores, GUIs, TweenService, debugging, etc.
- JavaScript help — async/await, DOM, Node.js, arrays, closures, etc.
- Code block rendering with a copy button
- Chat history saved in localStorage
- Multiple chat sessions with a sidebar
- Typing indicator
- Mobile responsive layout

## How it works

Dverousity uses a **custom built-in AI engine** (`ai-engine.js`) — a pattern-matching and rule-based knowledge system. No Anthropic API, no OpenAI, no external services, no API keys, no credits. It runs 100% in the browser.

The knowledge base covers the most common Roblox and JavaScript topics. You can expand it by editing `ai-engine.js`.

## File structure
dverousity/
├── index.html      # Main HTML structure
├── style.css       # All styles, dark theme, responsive
├── ai-engine.js    # The custom AI knowledge engine
├── app.js          # Chat logic, session management, UI
└── README.md       # This file
## Deploy on Render (Static Site)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) and create a new **Static Site**
3. Connect your GitHub repo
4. Set:
   - **Build Command:** (leave empty)
   - **Publish Directory:** `.` (just a dot — the root folder)
5. Hit Deploy

That's it. No build step, no server, no environment variables needed.

## Expanding the knowledge base

Open `ai-engine.js` and add entries to `robloxKnowledge` or `jsKnowledge`:

```javascript
yourTopic: {
  keywords: ["keyword1", "keyword2", "phrase to match"],
  response: `Your response here with \`\`\`lua\ncode blocks\n\`\`\` supported`
}
Contributing
Open source — fork it, expand the knowledge base, improve the UI, add more topics. PRs welcome.
License
MIT
