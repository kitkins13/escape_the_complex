/* Escape the Complex — Browser Prototype Engine
   Works with index.html, style.css, and rooms_complete.json
   Basic playable loop with movement, command input, and output logging.
*/

const output = document.getElementById("output");
const cmdInput = document.getElementById("cmd");
const sendBtn = document.getElementById("send");
const compass = document.getElementById("compass");
const helpBtn = document.getElementById("help");
const helpPanel = document.getElementById("helpPanel");
const closeHelp = document.getElementById("closeHelp");

// Game state
let rooms = {};
let currentRoom = null;
let inventory = [];

// Utility: print text to output box
function print(text = "") {
  const div = document.createElement("div");
  div.textContent = text;
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
}

// Utility: line break
function br() {
  const div = document.createElement("div");
  div.innerHTML = "&nbsp;";
  output.appendChild(div);
}

// Load rooms JSON
async function loadRooms() {
  try {
    const res = await fetch("./rooms_complete.json");
    const data = await res.json();
    data.forEach(room => {
      rooms[room.id] = room;
    });
    return true;
  } catch (err) {
    print("⚠️ Could not load rooms_complete.json");
    console.error(err);
    return false;
  }
}

// Show current room
function describeRoom(showIntro = true) {
  const room = rooms[currentRoom];
  if (!room) {
    print("You're lost in the void. (Room not found!)");
    return;
  }

  br();
  if (showIntro && room.intro) print(room.intro);
  if (room.description) print(room.description);

  const exits = Object.keys(room.exits || {});
  if (exits.length > 0) {
    print("Exits: " + exits.join(", "));
  } else {
    print("There are no visible exits.");
  }
  br();
}

// Move between rooms
function goDirection(dir) {
  const room = rooms[currentRoom];
  if (!room.exits || !room.exits[dir]) {
    print(`You can't go ${dir} from here.`);
    return;
  }
  currentRoom = room.exits[dir];
  describeRoom(true);
}

// Parse and execute commands
function executeCommand(input) {
  const raw = input.trim().toLowerCase();
  if (!raw) return;

  print("> " + raw);

  const [cmd, ...args] = raw.split(" ");
  const argStr = args.join(" ");

  switch (cmd) {
    case "look":
    case "examine":
      describeRoom(false);
      break;

    case "go":
      goDirection(argStr);
      break;

    case "north":
    case "south":
    case "east":
    case "west":
    case "northwest":
    case "northeast":
    case "southwest":
    case "southeast":
      goDirection(cmd);
      break;

    case "inventory":
    case "inv":
      if (inventory.length === 0) {
        print("You’re not carrying anything.");
      } else {
        print("You’re carrying: " + inventory.join(", "));
      }
      break;

    case "take":
      if (!argStr) {
        print("Take what?");
      } else {
        inventory.push(argStr);
        print(`You take the ${argStr}.`);
      }
      break;

    case "leave":
    case "drop":
      if (!argStr) {
        print("Leave what?");
      } else {
        const idx = inventory.indexOf(argStr);
        if (idx === -1) {
          print("You don't have that.");
        } else {
          inventory.splice(idx, 1);
          print(`You leave the ${argStr} behind.`);
        }
      }
      break;

    case "help":
      toggleHelp(true);
      break;

    case "clear":
      output.innerHTML = "";
      break;

    default:
      print("You can’t do that right now.");
      break;
  }

  br();
}

// Toggle help panel
function toggleHelp(show) {
  helpPanel.classList.toggle("hidden", !show);
  helpPanel.setAttribute("aria-hidden", !show);
}

// Input handling
sendBtn.addEventListener("click", () => {
  const input = cmdInput.value;
  cmdInput.value = "";
  executeCommand(input);
  cmdInput.focus();
});

cmdInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendBtn.click();
  }
});

// Compass click handling
compass.addEventListener("click", (e) => {
  const btn = e.target.closest(".dir");
  if (!btn) return;
  const cmd = btn.dataset.cmd;
  executeCommand(cmd);
});

helpBtn.addEventListener("click", () => toggleHelp(true));
closeHelp.addEventListener("click", () => toggleHelp(false));

// --- Initialize the game ---
async function startGame() {
  print("Loading Escape the Complex...");
  const ok = await loadRooms();
  if (!ok) return;
  currentRoom = Object.keys(rooms)[0];
  print("Welcome to Escape the Complex!");
  describeRoom(true);
  print("Type a command or use the compass to move.");
  br();
  cmdInput.focus();
}

// Start when ready
window.addEventListener("DOMContentLoaded", startGame);

