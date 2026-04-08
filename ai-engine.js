// ============================================================
// DVEROUSITY AI ENGINE v1.0
// Custom rule-based AI — no external API required
// Open source — feel free to fork and expand the knowledge base
// ============================================================

const DverousityAI = (() => {

  // ---- KNOWLEDGE BASE ----

  const robloxKnowledge = {
    remoteevents: {
      keywords: ["remoteevent", "remote event", "remoteevents", "remote events", "fireserver", "fireclient", "fireallclients", "onserverevent", "onclientevent"],
      response: `Alright, RemoteEvents. Here's the deal:

**RemoteEvents** are how you communicate between the **Server** and **Client** in Roblox. They live in \`ReplicatedStorage\` so both sides can see them.

\`\`\`lua
-- Setup (put RemoteEvent in ReplicatedStorage first)
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local myEvent = ReplicatedStorage:WaitForChild("MyEvent")
\`\`\`

**Client → Server (LocalScript firing to server):**
\`\`\`lua
-- LocalScript
myEvent:FireServer("hello from client", someData)
\`\`\`

\`\`\`lua
-- Script (Server)
myEvent.OnServerEvent:Connect(function(player, message, data)
    print(player.Name .. " sent: " .. message)
end)
\`\`\`

**Server → Client:**
\`\`\`lua
-- Script (Server)
myEvent:FireClient(player, "hello back")
-- or fire everyone:
myEvent:FireAllClients("broadcast message")
\`\`\`

\`\`\`lua
-- LocalScript (Client)
myEvent.OnClientEvent:Connect(function(message)
    print("Server said: " .. message)
end)
\`\`\`

Key rules: Never trust the client — always validate data on the server. RemoteEvents are fire-and-forget; use **RemoteFunctions** if you need a return value.`
    },
    datastores: {
      keywords: ["datastore", "data store", "datastoreservice", "setasync", "getasync", "updateasync", "save data", "load data", "player data", "saving"],
      response: `DataStores — saving player data that persists between sessions. Here's the solid setup:

\`\`\`lua
local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")

local playerData = DataStoreService:GetDataStore("PlayerData")

local function saveData(player)
    local key = "player_" .. player.UserId
    local data = {
        coins = player.leaderstats.Coins.Value,
        level = player.leaderstats.Level.Value
    }
    local success, err = pcall(function()
        playerData:SetAsync(key, data)
    end)
    if not success then
        warn("Failed to save data for " .. player.Name .. ": " .. err)
    end
end

local function loadData(player)
    local key = "player_" .. player.UserId
    local success, data = pcall(function()
        return playerData:GetAsync(key)
    end)
    if success and data then
        -- apply data to player
        return data
    else
        -- return defaults
        return { coins = 0, level = 1 }
    end
end

Players.PlayerAdded:Connect(loadData)
Players.PlayerRemoving:Connect(saveData)

-- Also save on server close
game:BindToClose(function()
    for _, player in Players:GetPlayers() do
        saveData(player)
    end
end)
\`\`\`

Always wrap DataStore calls in **pcall** — they can fail and you don't want your game crashing because Roblox servers are being sketchy. UpdateAsync is better than SetAsync when you're dealing with concurrent saves.`
    },
    leaderstats: {
      keywords: ["leaderstats", "leaderboard", "stats", "intvalue", "numbervalue"],
      response: `Setting up leaderstats is straightforward. Drop this in a **Script** inside ServerScriptService:

\`\`\`lua
local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(player)
    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player

    local coins = Instance.new("IntValue")
    coins.Name = "Coins"
    coins.Value = 0
    coins.Parent = leaderstats

    local level = Instance.new("IntValue")
    level.Name = "Level"
    level.Value = 1
    level.Parent = leaderstats
end)
\`\`\`

The folder **must** be named "leaderstats" — that's how Roblox knows to show it on the leaderboard. You can use IntValue, NumberValue, or StringValue depending on what you're storing.`
    },
    gui: {
      keywords: ["gui", "screengui", "textlabel", "textbutton", "imagelabel", "frame", "surfacegui", "billboardgui", "ui", "interface", "textbox"],
      response: `For Roblox GUIs, here's what you need to know:

**Types of GUIs:**
- \`ScreenGui\` — 2D UI on the player's screen (inventory, HUD, menus)
- \`SurfaceGui\` — GUI projected onto a 3D surface (signs, screens in-world)
- \`BillboardGui\` — Always faces the camera (health bars above characters)

**Basic ScreenGui setup from a LocalScript:**
\`\`\`lua
local Players = game:GetService("Players")
local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

local screenGui = Instance.new("ScreenGui")
screenGui.Name = "MyGui"
screenGui.ResetOnSpawn = false
screenGui.Parent = playerGui

local frame = Instance.new("Frame")
frame.Size = UDim2.new(0, 200, 0, 100)
frame.Position = UDim2.new(0.5, -100, 0.5, -50)
frame.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
frame.Parent = screenGui

local button = Instance.new("TextButton")
button.Size = UDim2.new(1, 0, 0.5, 0)
button.Text = "Click Me"
button.BackgroundColor3 = Color3.fromRGB(100, 60, 200)
button.Parent = frame

button.MouseButton1Click:Connect(function()
    print("clicked!")
end)
\`\`\`

Use **UDim2** for sizes and positions — it takes (scaleX, offsetX, scaleY, offsetY). Scale is 0-1 relative to parent, offset is pixels.`
    },
    tween: {
      keywords: ["tween", "tweenservice", "animate", "animation", "lerp", "smooth movement", "transition"],
      response: `TweenService is how you animate properties smoothly in Roblox.

\`\`\`lua
local TweenService = game:GetService("TweenService")

local part = workspace.SomePart

-- TweenInfo: time, easing style, easing direction, repeat count, reverse, delay
local tweenInfo = TweenInfo.new(
    0.5,                          -- duration in seconds
    Enum.EasingStyle.Quad,        -- easing style
    Enum.EasingDirection.Out,     -- direction
    0,                            -- repeat count (0 = play once)
    false,                        -- reverse
    0                             -- delay
)

local goal = {
    Position = Vector3.new(0, 10, 0),
    Color = Color3.fromRGB(255, 0, 0)
}

local tween = TweenService:Create(part, tweenInfo, goal)
tween:Play()

-- Optional: do something when it finishes
tween.Completed:Connect(function()
    print("tween done")
end)
\`\`\`

You can tween almost any numeric/color property on instances. Great for UI animations too — size, position, transparency, all of it.`
    },
    touched: {
      keywords: ["touched", ".touched", "ontouched", "touch", "collision", "hit", "part touched"],
      response: `The Touched event fires when a part collides with another part.

\`\`\`lua
local part = workspace.KillBrick

part.Touched:Connect(function(hit)
    -- 'hit' is the part that touched it
    local character = hit.Parent
    local humanoid = character:FindFirstChild("Humanoid")
    
    if humanoid then
        humanoid.Health = 0  -- kill the player
    end
end)
\`\`\`

Heads up — Touched fires A LOT. Use debounce to prevent it from firing 50 times per second:

\`\`\`lua
local debounce = {}

part.Touched:Connect(function(hit)
    local character = hit.Parent
    local player = game.Players:GetPlayerFromCharacter(character)
    
    if player and not debounce[player] then
        debounce[player] = true
        -- do your thing
        print(player.Name .. " touched the part")
        task.wait(1)  -- cooldown
        debounce[player] = nil
    end
end)
\`\`\`
`
    },
    services: {
      keywords: ["getservice", "players service", "runservice", "userinputservice", "httpservice", "marketplaceservice", "replicatedstorage", "serverstorage", "serverscriptservice", "workspace"],
      response: `Common Roblox services and what they do:

\`\`\`lua
-- Getting services
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local HttpService = game:GetService("HttpService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerStorage = game:GetService("ServerStorage")
local TweenService = game:GetService("TweenService")
local DataStoreService = game:GetService("DataStoreService")
local MarketplaceService = game:GetService("MarketplaceService")
local CollectionService = game:GetService("CollectionService")
\`\`\`

**Quick rundown:**
- **Players** — access players, player added/removing events
- **RunService** — Heartbeat, RenderStepped, Stepped (game loops)
- **UserInputService** — keyboard, mouse, touch input
- **HttpService** — make HTTP requests, JSON encode/decode
- **ReplicatedStorage** — shared between server and client
- **ServerStorage** — server-only storage (clients can't see it)
- **DataStoreService** — persistent data storage
- **CollectionService** — tag system for grouping instances`
    },
    loops: {
      keywords: ["loop", "for loop", "while loop", "repeat", "ipairs", "pairs", "task.wait", "wait", "iterate"],
      response: `Loops in Luau — quick breakdown:

\`\`\`lua
-- Numeric for loop
for i = 1, 10 do
    print(i)
end

-- ipairs — for arrays (ordered, stops at nil)
local items = {"sword", "shield", "potion"}
for index, value in ipairs(items) do
    print(index, value)
end

-- pairs — for dictionaries (unordered)
local stats = {health = 100, speed = 16, jump = 50}
for key, value in pairs(stats) do
    print(key, value)
end

-- While loop with task.wait (use this, NOT wait())
local running = true
task.spawn(function()
    while running do
        print("tick")
        task.wait(1)  -- waits 1 second, non-blocking
    end
end)
\`\`\`

Use **task.wait()** instead of **wait()** — it's more reliable and ties into Roblox's task scheduler properly. Same goes for task.spawn, task.delay, task.defer.`
    }
  };

  const jsKnowledge = {
    asyncawait: {
      keywords: ["async", "await", "async/await", "promise", "then", "catch", "asynchronous", "fetch api", ".then("],
      response: `async/await makes asynchronous JS actually readable. Here's the deal:

\`\`\`javascript
// Old way (promise chaining — gets ugly fast)
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));

// async/await — same thing but readable
async function getData() {
    try {
        const response = await fetch('https://api.example.com/data');
        
        if (!response.ok) {
            throw new Error('HTTP error: ' + response.status);
        }
        
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Fetch failed:', error);
    }
}

getData();
\`\`\`

**Key things:**
- \`async\` functions always return a Promise
- \`await\` pauses execution inside the async function until the promise resolves
- Wrap in try/catch to handle errors
- You can \`await\` multiple things in parallel with \`Promise.all\`:

\`\`\`javascript
async function getMultiple() {
    const [users, posts] = await Promise.all([
        fetch('/api/users').then(r => r.json()),
        fetch('/api/posts').then(r => r.json())
    ]);
    console.log(users, posts);
}
\`\`\``
    },
    dom: {
      keywords: ["dom", "document", "queryselector", "getelementbyid", "addeventlistener", "innerhtml", "textcontent", "createelement", "appendchild", "classlist", "style", "html element"],
      response: `DOM manipulation — the fundamentals:

\`\`\`javascript
// Selecting elements
const el = document.getElementById('myId');
const el2 = document.querySelector('.myClass');       // first match
const els = document.querySelectorAll('div.card');    // all matches (NodeList)

// Modifying content
el.textContent = 'Hello';           // plain text (safe)
el.innerHTML = '<strong>Hi</strong>'; // HTML (careful with user input)

// Attributes
el.setAttribute('data-id', '42');
el.getAttribute('data-id');
el.removeAttribute('hidden');

// Classes
el.classList.add('active');
el.classList.remove('hidden');
el.classList.toggle('dark-mode');
el.classList.contains('active');  // returns boolean

// Styles
el.style.color = 'red';
el.style.fontSize = '16px';

// Creating elements
const div = document.createElement('div');
div.className = 'card';
div.textContent = 'New card';
document.body.appendChild(div);
// or insert before another element:
parent.insertBefore(newEl, referenceEl);

// Events
el.addEventListener('click', (event) => {
    console.log('clicked', event.target);
});

// Remove an element
el.remove();
\`\`\``
    },
    closures: {
      keywords: ["closure", "scope", "var", "let", "const", "hoisting", "lexical scope", "function scope"],
      response: `Closures explained without the BS:

A closure is when a function "remembers" variables from its outer scope even after that outer function has returned.

\`\`\`javascript
function makeCounter() {
    let count = 0;  // this variable is "closed over"
    
    return function() {
        count++;
        return count;
    };
}

const counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
// count is preserved between calls
\`\`\`

Practical use — factory functions:
\`\`\`javascript
function multiply(factor) {
    return (number) => number * factor;
}

const double = multiply(2);
const triple = multiply(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15
\`\`\`

Classic closure trap with \`var\` in loops:
\`\`\`javascript
// Bug — all log 5
for (var i = 0; i < 5; i++) {
    setTimeout(() => console.log(i), 100);
}

// Fix — use let (block scoped)
for (let i = 0; i < 5; i++) {
    setTimeout(() => console.log(i), 100);  // logs 0,1,2,3,4
}
\`\`\``
    },
    arrays: {
      keywords: ["array", "map", "filter", "reduce", "foreach", "find", "some", "every", "push", "pop", "splice", "slice", "spread", "destructuring"],
      response: `Array methods you'll actually use every day:

\`\`\`javascript
const nums = [1, 2, 3, 4, 5];

// map — transforms every element, returns new array
const doubled = nums.map(n => n * 2);  // [2,4,6,8,10]

// filter — keeps elements where callback returns true
const evens = nums.filter(n => n % 2 === 0);  // [2,4]

// reduce — collapses array to single value
const sum = nums.reduce((acc, n) => acc + n, 0);  // 15

// find — returns first match (or undefined)
const firstBig = nums.find(n => n > 3);  // 4

// some — true if ANY element passes
const hasOdd = nums.some(n => n % 2 !== 0);  // true

// every — true if ALL elements pass
const allPositive = nums.every(n => n > 0);  // true

// forEach — side effects only, returns nothing
nums.forEach(n => console.log(n));

// Spreading and combining
const more = [...nums, 6, 7, 8];  // [1,2,3,4,5,6,7,8]
const [first, second, ...rest] = nums;  // destructuring

// Removing/inserting
nums.splice(2, 1);        // removes 1 element at index 2
nums.slice(1, 3);         // returns elements 1 to 2 (doesn't mutate)
\`\`\``
    },
    nodejs: {
      keywords: ["node", "node.js", "nodejs", "express", "npm", "require", "module", "fs", "path", "server", "backend", "api route", "middleware"],
      response: `Node.js / Express basics:

\`\`\`javascript
// Install first: npm init -y && npm install express

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());  // parse JSON bodies

// Routes
app.get('/', (req, res) => {
    res.send('Server is running');
});

app.get('/api/users', async (req, res) => {
    try {
        // your data fetching logic here
        const users = [{ id: 1, name: 'Dev' }];
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users', (req, res) => {
    const { name, email } = req.body;
    
    if (!name || !email) {
        return res.status(400).json({ error: 'name and email required' });
    }
    
    // create user logic...
    res.status(201).json({ id: Date.now(), name, email });
});

app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});
\`\`\`

**File system (built-in):**
\`\`\`javascript
const fs = require('fs').promises;

async function readFile() {
    const content = await fs.readFile('./data.txt', 'utf8');
    return content;
}
\`\`\``
    },
    eventloop: {
      keywords: ["event loop", "call stack", "microtask", "macrotask", "settimeout", "setinterval", "queue", "synchronous", "non-blocking"],
      response: `The event loop — how JS actually works:

JS is single-threaded but non-blocking. Here's the execution order:

1. **Synchronous code** runs first (call stack)
2. **Microtasks** run next — Promises (.then, .catch), queueMicrotask
3. **Macrotasks** run last — setTimeout, setInterval, I/O

\`\`\`javascript
console.log('1 - sync');

setTimeout(() => console.log('4 - macrotask'), 0);

Promise.resolve()
  .then(() => console.log('3 - microtask'));

console.log('2 - sync');

// Output order: 1, 2, 3, 4
\`\`\`

Even \`setTimeout(..., 0)\` doesn't run immediately — it goes to the macrotask queue and waits for the call stack AND microtask queue to be empty.

This is why:
\`\`\`javascript
// This works as expected
async function example() {
    console.log('start');
    await someAsyncThing();  // yields here, other stuff can run
    console.log('end');      // resumes after promise resolves
}
\`\`\``
    },
    localstorage: {
      keywords: ["localstorage", "local storage", "sessionstorage", "session storage", "storage", "cookies", "persist", "save browser"],
      response: `Browser storage options:

\`\`\`javascript
// localStorage — persists until manually cleared
localStorage.setItem('username', 'devguy');
const name = localStorage.getItem('username');  // 'devguy'
localStorage.removeItem('username');
localStorage.clear();  // nukes everything

// Storing objects (must JSON stringify/parse)
const user = { id: 1, name: 'dev', theme: 'dark' };
localStorage.setItem('user', JSON.stringify(user));

const storedUser = JSON.parse(localStorage.getItem('user'));
console.log(storedUser.name);  // 'dev'

// sessionStorage — same API, clears when tab closes
sessionStorage.setItem('tempData', 'value');

// Safe getter with fallback
function getStorage(key, fallback = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch {
        return fallback;
    }
}
\`\`\``
    }
  };

  // ---- RESPONSE GENERATION ----

  function matchKnowledge(input) {
    const lower = input.toLowerCase();

    // Check Roblox knowledge
    for (const topic of Object.values(robloxKnowledge)) {
      if (topic.keywords.some(kw => lower.includes(kw))) {
        return topic.response;
      }
    }

    // Check JS knowledge
    for (const topic of Object.values(jsKnowledge)) {
      if (topic.keywords.some(kw => lower.includes(kw))) {
        return topic.response;
      }
    }

    return null;
  }

  function detectLanguage(code) {
    if (!code) return 'lua';
    if (code.includes('function') && (code.includes('local ') || code.includes('game:') || code.includes('workspace') || code.includes('end'))) return 'lua';
    if (code.includes('const ') || code.includes('let ') || code.includes('var ') || code.includes('=>') || code.includes('console.log')) return 'javascript';
    return 'code';
  }

  function debugCode(code) {
    const lang = detectLanguage(code);

    const luaIssues = [];
    const jsIssues = [];

    if (lang === 'lua') {
      if (code.includes('wait(') && !code.includes('task.wait(')) luaIssues.push("You're using `wait()` — switch to `task.wait()`. It's more accurate and the recommended way now.");
      if (code.includes('print(') && code.includes('..') && !code.includes('tostring')) {
        const numConcat = /print\([^)]*\d[^)]*\.\.[^)]*\)/;
        if (numConcat.test(code)) luaIssues.push("Concatenating a number with `..` will throw an error. Wrap numbers in `tostring()` first.");
      }
      if (code.includes('game.Players') && !code.includes('game:GetService("Players")')) luaIssues.push("Use `game:GetService(\"Players\")` instead of `game.Players` — it's safer and won't break if the service isn't initialized yet.");
      if (code.includes('Instance.new') && code.includes('.Parent') === false) luaIssues.push("Looks like you're creating an Instance but not setting its Parent — it won't show up anywhere.");
      if (code.match(/if .+ = .+then/)) luaIssues.push("Found a single `=` in an if condition. In Lua, equality is `==`, not `=`. That's an assignment, not a comparison.");
    }

    if (lang === 'javascript') {
      if (code.includes('var ')) jsIssues.push("You're using `var` — switch to `let` or `const`. `var` has function scope and hoisting behavior that causes bugs.");
      if (code.match(/==[^=]/)) jsIssues.push("Found `==` — use `===` for strict equality in JS. `==` does type coercion and leads to weird bugs.");
      if (code.includes('.then(') && code.includes('async')) jsIssues.push("Mixing `.then()` with async/await — pick one style and stick with it. async/await is cleaner.");
      if (code.includes('document.write(')) jsIssues.push("`document.write()` is ancient and destructive. Use `innerHTML`, `textContent`, or `appendChild()` instead.");
      if (code.includes('for (var')) jsIssues.push("Using `var` in a for loop — classic closure bug waiting to happen. Use `let` instead.");
    }

    const issues = lang === 'lua' ? luaIssues : jsIssues;

    if (issues.length === 0) {
      return `Looked over your ${lang === 'lua' ? 'Lua' : 'JavaScript'} code — didn't catch any obvious issues from a quick scan. If something's still broken, tell me what it's supposed to do and what's actually happening and I'll dig deeper.`;
    }

    let response = `Found ${issues.length} issue${issues.length > 1 ? 's' : ''} in your ${lang === 'lua' ? 'Lua' : 'JavaScript'} code:\n\n`;
    issues.forEach((issue, i) => {
      response += `**${i + 1}.** ${issue}\n\n`;
    });
    response += `Paste the updated code if you want me to check again.`;
    return response;
  }

  function generateContextualResponse(input) {
    const lower = input.toLowerCase();

    // Debug/review request with code
    if ((lower.includes('debug') || lower.includes('fix') || lower.includes('wrong') || lower.includes('broken') || lower.includes('error') || lower.includes("doesn't work") || lower.includes("not working")) && input.includes('```')) {
      const codeMatch = input.match(/```[\w]*\n?([\s\S]*?)```/);
      if (codeMatch) {
        return debugCode(codeMatch[1]);
      }
    }

    // Code review without debug keywords
    if (input.includes('```')) {
      const codeMatch = input.match(/```[\w]*\n?([\s\S]*?)```/);
      if (codeMatch) {
        return debugCode(codeMatch[1]);
      }
    }

    // Greetings
    if (/^(hi|hey|hello|sup|what'?s up|yo|wassup|hiya)[\s!.?]*$/i.test(input.trim())) {
      const greets = [
        "Hey. What are you building?",
        "What's up. Roblox or JS today?",
        "Yo. Drop your code or ask your question.",
        "Hey, what do you need?"
      ];
      return greets[Math.floor(Math.random() * greets.length)];
    }

    // Who are you
    if (lower.includes('who are you') || lower.includes('what are you') || lower.includes('what is dverousity') || lower.includes('tell me about yourself')) {
      return `I'm Dverousity — a dev assistant built specifically for **Roblox Studio** (Lua/Luau) and **JavaScript** development.\n\nI help with scripting, debugging, explaining concepts, and writing code from scratch. Drop your code, describe what you're trying to build, or just ask a question and let's get into it.`;
    }

    // Thanks
    if (/^(thanks|thank you|thx|ty|appreciate it|cheers)[\s!.]*$/i.test(input.trim())) {
      return "Yeah, no problem. Anything else?";
    }

    // What can you do
    if (lower.includes('what can you do') || lower.includes('what do you help with') || lower.includes('help me with')) {
      return `Here's what I do:\n\n**Roblox Studio (Lua/Luau):**\n- Game logic, RemoteEvents, RemoteFunctions\n- DataStores and saving player data\n- GUIs and UI scripting\n- Physics, animations, TweenService\n- Debugging your scripts\n\n**JavaScript:**\n- DOM manipulation\n- Async/await, Promises, fetch\n- Node.js and Express\n- Array methods, closures, scope\n- Debugging and code review\n\nJust describe what you're trying to build or paste your code.`;
    }

    // How to make a game
    if ((lower.includes('make a game') || lower.includes('create a game') || lower.includes('build a game')) && lower.includes('roblox')) {
      return `Starting a Roblox game from scratch — here's the structure that actually works:\n\n**Services you'll use constantly:**\n\`\`\`lua\nlocal Players = game:GetService("Players")\nlocal ReplicatedStorage = game:GetService("ReplicatedStorage")\nlocal ServerScriptService = game:GetService("ServerScriptService")\n\`\`\`\n\n**Script placement:**\n- **ServerScriptService** — server-side Scripts only\n- **StarterPlayerScripts** — LocalScripts that run for each player\n- **StarterGui** — GUI-related LocalScripts\n- **ReplicatedStorage** — shared assets, RemoteEvents, modules\n\n**Start with the basics:**\n1. Set up your map in Workspace\n2. Add leaderstats if you have stats\n3. Create RemoteEvents for client-server communication\n4. Build your core game loop in a server Script\n\nWhat kind of game are you making? I can give you more specific direction.`;
    }

    // Explain a general Lua concept
    if ((lower.includes('what is') || lower.includes('explain') || lower.includes('how does') || lower.includes('how do')) && (lower.includes('lua') || lower.includes('luau') || lower.includes('roblox'))) {
      return `Good question. What specifically do you want explained about Lua/Luau? I can cover:\n\n- **Variables and types** (nil, boolean, number, string, table, function)\n- **Tables** (arrays and dictionaries)\n- **Metatables and OOP**\n- **Coroutines**\n- **Module scripts**\n- **Any specific Roblox API**\n\nJust tell me what you want to understand and I'll break it down.`;
    }

    // JS frameworks
    if (lower.includes('react') || lower.includes('vue') || lower.includes('angular') || lower.includes('svelte') || lower.includes('nextjs') || lower.includes('next.js')) {
      return `Yeah I know frontend frameworks. What do you need?\n\nI can help with:\n- **React** — components, hooks, state, props, useEffect\n- **Vue** — composition API, reactive data, components\n- **Next.js** — pages, API routes, SSR, SSG\n- **Svelte** — reactive declarations, stores, components\n\nWhat are you building or what's breaking?`;
    }

    // Math/general knowledge
    if (lower.includes('what is') && !lower.includes('roblox') && !lower.includes('javascript') && !lower.includes('lua') && !lower.includes('code')) {
      return `That's outside my main lane — I'm built for Roblox Studio and JavaScript dev. I can answer general stuff but I'm not going to be as useful as a search engine for that.\n\nIf you have a coding question though, I'm all yours.`;
    }

    // Frustration responses
    const frustrationWords = ['fuck', 'shit', 'damn', 'ass', 'stupid', 'hate', 'wtf', 'dumb'];
    if (frustrationWords.some(w => lower.includes(w))) {
      const frustrated = [
        "Alright, chill. Tell me what's actually broken and we'll fix it.",
        "Yeah yeah, I hear you. What's the issue?",
        "Okay, what went wrong? Let's actually solve it.",
        "Cool, you're pissed. Now tell me what the code is supposed to do and what it's actually doing."
      ];
      return frustrated[Math.floor(Math.random() * frustrated.length)];
    }

    // Module scripts
    if (lower.includes('module') || lower.includes('modulescript') || lower.includes('require(')) {
      return `ModuleScripts are how you organize shared code in Roblox. Here's the pattern:\n\n\`\`\`lua\n-- ModuleScript (in ReplicatedStorage or ServerScriptService)\nlocal MyModule = {}\n\nfunction MyModule.greet(name)\n    return "Hello, " .. name\nend\n\nfunction MyModule.add(a, b)\n    return a + b\nend\n\nreturn MyModule\n\`\`\`\n\n\`\`\`lua\n-- Using it in a Script or LocalScript\nlocal MyModule = require(ReplicatedStorage:WaitForChild("MyModule"))\n\nprint(MyModule.greet("Dev"))  -- "Hello, Dev"\nprint(MyModule.add(3, 4))     -- 7\n\`\`\`\n\nModuleScripts are cached after the first require — so the same instance is returned every time. Great for shared utility functions, OOP classes, and constants.`;
    }

    // Default fallback
    const fallbacks = [
      `Not quite sure what you're after. Give me more detail — what are you trying to build or what's breaking?`,
      `Can you be more specific? Paste your code or describe exactly what you need and I'll help you out.`,
      `I need a bit more to go on. What's the Roblox or JavaScript problem you're dealing with?`,
      `Tell me more. What's the context — Roblox game, a website, a Node server? What's the actual problem?`
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  // ---- PUBLIC API ----

  async function respond(userMessage, conversationHistory) {
    // Simulate thinking time (makes it feel more natural)
    const thinkTime = 600 + Math.random() * 800;
    await new Promise(resolve => setTimeout(resolve, thinkTime));

    // Try knowledge base first
    const knowledgeResponse = matchKnowledge(userMessage);
    if (knowledgeResponse) {
      return knowledgeResponse;
    }

    // Generate contextual response
    return generateContextualResponse(userMessage);
  }

  return { respond };
})();
