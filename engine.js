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

// Append message function
function appendMessage(text) {
  const log = document.getElementById("output");
  if (!log) {
    console.warn("Game log element not found!");
    return;
  }

  const p = document.createElement("p");
  p.textContent = text;
  log.appendChild(p);
  log.scrollTop = log.scrollHeight; // auto-scroll
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

function handleExamine() {
  const loc = player.location;

  if (loc === "gift shop") {
    appendMessage("You look at the things on the shelves.");
    if (!player.hasKeyring) appendMessage("A plain leather keyring catches your eye.");
    if (!player.hasDogToy) appendMessage("There's a squeaky dog toy sitting alone in a battered box.");
    if (!player.hasSnowglobe) appendMessage("A small snowglobe sparkles away on a corner shelf. The little cottage inside reminds you of home, somehow.");
  }

  else if (loc === "art gallery") {
    appendMessage("You take a good look at some of the paintings. They're even creepier up close.");
    if (!player.note2Found) {
      appendMessage("One of the surreal landscapes has a note tucked into the frame. You take it gently, trying to avoid disturbing the artwork.");
      player.note2Found = true;
    }
  }

  else if (loc === "yard") {
    appendMessage("The junk piles seem even more rusty and decrepit the closer you look at them. Who dumped all this mess here, anyway?");
    if (!player.note3Found) {
      appendMessage("You spot a slightly damp note under a big stone beside one pile. Careful not to nudge the teetering junk, you take the note.");
      player.note3Found = true;
    }
  }

  else if (loc === "observatory") {
    if (!player.discoveredLab) {
      appendMessage("You go and take a better look at those mechanisms. Most seem to operate the big telescope, but one isn't connected to anything you can see. It's missing its lever... maybe the caretaker knows something about it?");
    }
  }

  else if (loc === "fossil exhibit") {
    const fossilFacts = [
      "The word 'fossil' comes from the Latin 'fossilis', meaning 'dug up.'",
      "Most fossils form in sedimentary rock, created by layers of sediment compressing over time.",
      "Fossilization can take thousands to millions of years.",
      "Paleontologists use brushes and chisels to carefully excavate fossils.",
      "The first dinosaur fossil was discovered in 1824 by English geologist William Buckland.",
      "The 'Bone Wars' was a rivalry between paleontologists Marsh and Cope in the late 1800s.",
      "Not all organisms fossilize — soft-bodied ones rarely do.",
      "Transitional fossils show intermediate stages between species, like Tiktaalik.",
    ];
    const fact = fossilFacts[Math.floor(Math.random() * fossilFacts.length)];
    appendMessage(`A nearby sign reads: ${fact}`);
  }

  else if (loc === "secret room") {
    appendMessage("On closer inspection, the pedestals each have small gems set into the top. Red, blue, yellow, purple, orange and white. One is empty, with a divot where a gem might be placed.");
    if (player.hasTeleGem) appendMessage("The green gem you picked up might fit there.");
  }

  else if (loc === "workshop") {
    appendMessage("Several design sketches are strewn across the workbench. Most are beyond you, but a few look interesting: a simple birdhouse, a tall bookshelf, and a handcart. You could probably make those, looking at the careful detail put into the drawings.");
  }

  else {
    appendMessage("There's nothing interesting enough to examine here.");
  }
}

function handlePoke() {
  const loc = player.location;

  if (loc === "secret lab") {
    appendMessage("You poke some of the equipment on the bench, wondering what it does. Something starts reacting violently...");
    appendMessage("The lab explodes in a chain reaction, and you perish in the destruction.");
    player.isDead = true;
    appendMessage("*** GAME OVER ***");
  }

  else if (loc === "yard") {
    appendMessage("You prod at the heaps of junk. Something dislodges, causing a small collapse. You jump back but get a cut on your arm.");
    player.isInjured = true;
  }

  else if (loc === "gift shop") {
    appendMessage("You poke at the little trinkets on the shelves. A couple of them fall off and roll around the floor.");
  }

  else if (loc === "fossil exhibit") {
    appendMessage("You poke some of the fossil displays. It's great fun, until the jawbone falls off a skeleton. You wedge it back in place and stop touching the exhibits.");
  }

  else if (loc === "workshop") {
    appendMessage("You poke the things on the workbench. One of the half-built whatnots slides across, revealing a scrap of paper underneath it. You take the note.");
    player.note5Found = true;
  }

  else {
    appendMessage("You walk around the room poking things. Nothing interesting happens.");
  }
}

// Command handler map
const commands = {
  sit: () => handleSit(),
  jump: () => handleJump(),
  examine: () => handleExamine(),
  poke: () => handlePoke(),
};

// Main command processor - do I need this? there's a command switch further down... not sure which is working
function processCommand(input) {
  const cmd = input.trim().toLowerCase();
  if (commands[cmd]) {
    commands[cmd]();
  } else {
    appendMessage("You can't do that right now.");
  }
  appendMessage(`[Debug] You are currently in: ${player.location}`);
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
  note2Found: false,
  note3Found: false,
  note4Found: false,
  note5Found: false,
  hasKeyring: false,
  hasDogToy: false,
  hasSnowglobe: false,
  hasTeleGem: false,
  discoveredLab: false,
  isInjured: false,
  isDead: false,

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
  const currentRoom = rooms.find(r => r.name === player.location);
  if (!currentRoom.exits || !currentRoom.exits[dir]) {
    appendMessage("You can't go that way.");
    return;
  }

  const nextRoomName = currentRoom.exits[dir];
  const nextRoom = rooms.find(r => r.name === nextRoomName);

  if (nextRoom) {
    player.location = nextRoom.name; // ✅ This is the key fix
    appendMessage(`You move ${dir} into the ${nextRoom.name}.`);
    appendMessage(nextRoom.description);
  } else {
    appendMessage("That direction doesn't seem to go anywhere.");
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
      describeRoom(false);
      break;
    
    case "examine":
      handleExamine();
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
     
    case "jump":
      handleJump();
      break;

    case "sit":
      handleSit();
      break;

    case "poke":
      handlePoke();
      break;

    default:
      print("Sorry, that doesn't work :( You can see the list of valid commands by entering 'help'.");
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
