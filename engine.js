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

// Command handler map
const commands = {
  sit: () => handleSit(),
  jump: () => handleJump(),
};

// Main command processor
function processCommand(input) {
  const cmd = input.trim().toLowerCase();
  if (commands[cmd]) {
    commands[cmd]();
  } else {
    appendMessage("You can't do that right now.");
  }
}

// Game state
let rooms = {};
let currentRoom = null;
let inventory = [];

// Player object
const player = {
  location: "white room",
  hasPuppy: false,
  wrExitOpen: false,
  smallKeyholeRevealed: false,
  hasSmallKey: false,
  note1Found: false,
  note4Found: false,
};

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

// Sit command
function handleSit() {
  const loc = player.location;

  if (loc === "white room") {
    appendMessage("You sit on the bench gingerly. It creaks, but holds up. The old wood is a bit splintery, though. Probably best not to stay sat for too long.");
    if (player.hasPuppy) {
      appendMessage("Digger barks, scrabbling at the crumbling stone leg of the bench. You get up and look where he's trying to dig, and spot a tiny keyhole.");
      player.smallKeyholeRevealed = true;
    }
  } else if (loc === "blue corridor") {
    appendMessage("You sit down on one of the cushioned benches. It's nice to take a break after all the exploring you've been doing.");
  } else if (loc === "cafe") {
    appendMessage("You pull out one of the chairs and sit for a minute.");
  } else if (loc === "garden") {
    appendMessage("The wrought iron bench doesn't look all that comfy, but it's better than the damp grass. Barely.");
  } else if (loc === "bathroom") {
    appendMessage("You sit on one of the toilets. Hey, when the lid's down, it's a chair!");
  } else {
    appendMessage("There are no seats here, but you're exhausted enough to sit on the floor for a moment.");
  }
}

// Jump command
function handleJump() {
  const loc = player.location;

  if (loc === "white room") {
    appendMessage("You jump as high as you can, and spot a button near the ceiling. You press it quickly, and a hidden door opens in the east wall.");
    player.wrExitOpen = true;
  } else if (loc === "hidden store") {
    appendMessage("As you jump, you spot a tiny key on one of the high shelves. You jump up again and grab it.\nThere's a scratched up tag attached to it with the words 'white room - exit' written on.");
    player.hasSmallKey = true;
  } else if (loc === "cleaners' store" || loc === "secret lab") {
    appendMessage("You can't jump here, the ceiling is too low.");
  } else if (loc === "fossil exhibit" && !player.note1Found) {
    appendMessage("You spot a note stuck to the triceratops skull. You carefully reach up and take it.");
    player.note1Found = true;
  } else if (loc === "garden" && !player.note4Found) {
    appendMessage("There's a note pinned high up on one of the trees. You stand on an upturned flowerpot to grab it.");
    player.note4Found = true;
  } else {
    appendMessage("You jump, but nothing unusual happens.");
  }
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
    case "check bag":
    case "bag":
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

