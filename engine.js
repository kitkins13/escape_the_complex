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
    if (!player.wrExitOpen) {
      appendMessage("You jump as high as you can, and spot a button near the ceiling. You press it quickly, and a hidden door opens in the east wall.\n");
      const wr = rooms["white room"];
      wr.exits["east"] = "fossil exhibit";
      player.wrExitOpen = true;
    } else {
      appendMessage("You jump again, but nothing else happens.\n")
    }
  } else if (loc === "hidden store") {
    appendMessage("As you jump, you spot a tiny key on one of the high shelves. You jump up again and grab it.\nThere's a scratched up tag attached to it with the words 'white room - exit' written on.\n");
    player.hasSmallKey = true;
  } else if (loc === "cleaners' store" || loc === "secret lab") {
    appendMessage("You can't jump here, the ceiling is too low.\n");
  } else if (loc === "fossil exhibit" && !player.note1Found) {
    appendMessage("You spot a note stuck to the triceratops skull. You carefully reach up and take it.");
    player.note1Found = true;
  } else if (loc === "garden" && !player.note4Found) {
    appendMessage("There's a note pinned high up on one of the trees. You stand on an upturned flowerpot to grab it.\n");
    player.note4Found = true;
  } else {
    appendMessage("You jump, but nothing unusual happens.\n");
  }
}

// Examine command
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
  
  else if (loc === "cleaners' store") {
    appendMessage("You take a closer look at those shelves, intrigued by the scattered, flaky rust. You can just make out a thin crack in the wall behind them, and a rusted up keyhole mostly hidden by the edge of one shelf.");
  }
  
  else if (loc === "secret lab") {
    appendMessage("There's a lot of scientific equipment here, both familiar and unfamiliar. Beakers of strange fluids are lined up along one side of the bench. Some are emitting steam, despite being nowhere near a heat source. Probably best to leave them alone.");
  }

  else {
    appendMessage("There's nothing interesting enough to examine here.\n");
  }
}

// Poke command
function handlePoke() {
  const loc = player.location;

  if (loc === "secret lab") {
    appendMessage("You poke some of the equipment on the bench, wondering what it does. Something starts reacting violently...");
    appendMessage("The lab explodes in a chain reaction, and you perish in the destruction.");
    player.isDead = true;
    appendMessage("*** GAME OVER ***");
  }

  else if (loc === "yard") {
    appendMessage("You prod at the heaps of junk. Something dislodges, causing a small collapse. You jump back but get a cut on your arm.\n");
    player.isInjured = true;
  }

  else if (loc === "gift shop") {
    appendMessage("You poke at the little trinkets on the shelves. A couple of them fall off and roll around the floor.\n");
  }

  else if (loc === "fossil exhibit") {
    appendMessage("You poke some of the fossil displays. It's great fun, until the jawbone falls off a skeleton. You wedge it back in place and stop touching the exhibits.\n");
  }

  else if (loc === "workshop") {
    appendMessage("You poke the things on the workbench. One of the half-built whatnots slides across, revealing a scrap of paper underneath it. You take the note.\n");
    player.note5Found = true;
  }

  else {
    appendMessage("You walk around the room poking things. Nothing interesting happens.");
  }
}

// obtainable items (TEMP - will put in a json file eventually)
const items = {
  lever: {
    id: "lever",
    name: "Metal Lever",
    description: "A sturdy lever that probably belongs to some machinery.",
    location: "workshop",
    pickupable: true,
    usable: true,
  },
  dogToy: {
    id: "dogToy",
    name: "Dog Toy",
    description: "A brightly coloured squeaky dog toy. If there's a dog around here, this might come in handy.",
    location: "gift shop",
    pickupable: true,
    usable: true,
  },
  snowglobe: {
    id: "snowglobe",
    name: "Snowglobe",
    description: "A small and intricate snowglobe. The cottage inside reminds you of home, somehow.",
    location: "gift shop",
    pickupable: true,
    usable: false,
  },
  smallKey: {
    id: "smallKey",
    name: "Small Key",
    description: "A tiny tarnished key. There's a faded, dusty label: 'White Room - Exit'.",
    location: "hidden store",
    pickupable: true,
    usable: true,
  },
  brassKey: {
    id: "brassKey",
    name: "Brass Key",
    description: "A heavy brass key. There's a tag on it that reads: 'Garden'.",
    location: "secret lab",
    pickupable: true,
    usable: true,
  },
  ironKey: {
    id: "ironKey",
    name: "Iron Key",
    description: "A plain iron key. A label attached says: 'Stockroom'.",
    location: "garden",
    pickupable: true,
    usable: true,
  },
  firstAidKit: {
    id: "firstAidKit",
    name: "First Aid Kit",
    description: "A basic first aid box, handy for dealing with minor injuries.",
    location: "cafe",
    pickupable: true,
    usable: true,
  },
  teleGem: {
    id: "teleGem",
    name: "Green Gem",
    description: "It glows faintly with a mysterious energy. Might fit somewhere important.",
    location: "bathroom",
    pickupable: true,
    usable: true,
  }
};

// build items in the workshop
function build(item) {
  if (player.location !== "workshop") {
    print("You can’t build anything here.");
    return;
  }

  if (!item) {
    print("What do you want to build?");
    return;
  }

  const thing = item.toLowerCase();

  switch (thing) {
    case "cart":
    case "handcart":
      if (!player.builtCart) {
        print("You build a simple, yet sturdy cart.");
        player.builtCart = true;
      } else {
        print("You already built a cart.");
      }
      break;

    case "birdhouse":
      if (!player.builtBirdhouse) {
        print("You build a small, standing birdhouse. It might look pretty in a garden.");
        player.builtBirdhouse = true;
      } else {
        print("You already built a birdhouse.");
      }
      break;

    case "shelf":
    case "bookshelf":
      if (!player.builtShelf) {
        print("You build a tall shelving unit. It would be good for books, or someone could make a display on it.");
        player.builtShelf = true;
      } else {
        print("You already built a shelf.");
      }
      break;

    default:
      print("You don’t see the right equipment to make that.");
  }
}

// use the lever in the observatory
function useLever() {
  if (player.location !== "observatory") {
    print("There’s nowhere to use a lever here.");
    return;
  }

  if (inventory.includes("lever") && !player.leverPlaced) {
    print("You put the lever back in the mechanism, hearing a satisfying click as it finds its place.");
    inventory = inventory.filter(i => i !== "lever");
    player.leverPlaced = true;
  } else if (player.leverPlaced && !player.discoveredLab) {
    print("You pull the newly placed lever. Clicking and grinding noises travel through the walls — a hidden panel swings open in the southwest corner.");
    player.discoveredLab = true;
    // unlocks the secret lab exit
    const obs = rooms["observatory"];
    obs.exits["southwest"] = "secret lab";
  } else if (player.discoveredLab) {
    print("The lever’s already done its job.");
  } else {
    print("You don’t have a lever to use.");
  }
}

// player moves the shelves in the cleaners' store
function moveShelf() {
  if (player.location !== "cleaners' store") {
    print("There are no shelves here to move.\n");
    return;
  }

  if (player.shelvesMoved) {
    print("You already moved the shelves.\n");
    return;
  }

  if (player.isInjured) {
    print("You try to push the shelves aside, but your injured arm lets you down. Maybe there’s a first aid kit around somewhere?\n");
    return;
  }

  if (!player.hasIronKey) {
    print("There's no reason to move those.\n");
    return;
  }

  print("You push the shelf aside, revealing a hidden door with an iron keyhole. The key fits perfectly, and you unlock the door.\n");
  player.shelvesMoved = true;

  // opens the hidden store exit
  const store = rooms["cleaners' store"];
  store.exits["east"] = "hidden store";
}

// player inventory functions
// check items in current room 
function lookForItem() {
  const foundItems = Object.values(items).filter(i => i.location === player.location);

  if (foundItems.length === 0) {
    print("You don’t see anything useful here.");
  } else {
    print("You notice:");
    foundItems.forEach(i => print(` - ${i.name}: ${i.description}`));
  }
}

// player takes item
function takeItem(name) {
  const found = Object.values(items).find(
    i => i.location === player.location && i.name.toLowerCase() === name.toLowerCase()
  );

  if (!found) {
    print("You don’t see that here.");
    return;
  }

  if (!found.pickupable) {
    print("You can’t take that.");
    return;
  }

  inventory.push(found.id);
  found.location = "inventory";
  print(`You take the ${found.name}.`);
}

// player drops item
function dropItem(name) {
  const index = inventory.findIndex(
    id => items[id].name.toLowerCase() === name.toLowerCase()
  );

  if (index === -1) {
    print("You don’t have that.");
    return;
  }

  const item = items[inventory[index]];
  item.location = player.location;
  inventory.splice(index, 1);
  print(`You leave the ${item.name} behind.`);
}

// show player inventory
function showInventory() {
  if (inventory.length === 0) {
        print("You’re not carrying anything.");
      } else {
        print("You’re carrying: " + inventory.forEach(i => print(` - ${i.name}`));
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
    print("You're lost in the void. (Room not found!)\n");
    return;
  }

  br();
  if (showIntro && room.intro) print(room.intro);
  if (room.description) print(room.description);

  const exits = Object.keys(room.exits || {});
  if (exits.length > 0) {
    print("Exits: " + exits.join(", "));
  } else {
    print("There are no visible exits.\n");
  }
  br();
}

// Move between rooms
function goDirection(dir) {
  const room = rooms[currentRoom];
  if (!room) {
    print("Error: currentRoom not found!\n");
    return;
  }

  if (!room.exits || !room.exits[dir]) {
    print(`You can't go ${dir} from here.\n`);
    return;
  }

  // get next room name string
  const nextRoomId = room.exits[dir];
  const nextRoom = rooms[nextRoomId];

  if (!nextRoom) {
    print("That direction doesn't seem to go anywhere.\n");
    return;
  }

  // Update both trackers
  currentRoom = nextRoomId;
  player.location = nextRoomId.toLowerCase();

  // Print the new room description
  print(`You move ${dir} into the ${nextRoom.id}.\n`);
  describeRoom(false);
  print("\n");
}

/*/ old command switch - may return to this one if new handler won't play nice
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
    case "poke things":
    case "poke stuff":
      handlePoke();
      break;
    
    case "build":
    case "build cart":
    case "build handcart":
    case "build shelf":
    case "build bookshelf":
    case "build birdhouse":
      build();
      break;

    case "use lever":
    case "place lever":
    case "pull lever":
      useLever();
      break;
    
    case "move shelves":
      moveShelf();

    default:
      print("Sorry, that doesn't work :( You can see the list of valid commands by entering 'help'.");
      break;
  }
  
  br();
}*/

//new command handler
function handleCommand(cmdInput) {
  const cmd = cmdInput.trim().toLowerCase(); // Normalize input: remove whitespace and lowercase

  if (cmd.startsWith("go ")) {
    const dir = cmd.substring(3).trim(); // Extract direction, removing "go " prefix and any extra whitespace
    if (dir) { // Check if a direction was actually provided
      goDirection(dir);
    } else {
      print("Go where?"); // Provide feedback if no direction is given
    }
  } else if (cmd === "look around") {
    describeRoom(false);
  } else if (cmd === "sit") {
    handleSit();
  } else if (cmd === "jump") {
    handleJump();
  } else if (cmd === "examine") {
    handleExamine();
  } else if (cmd === "poke" || cmd === "poke stuff") {
    handlePoke();
  } else if (cmd.startsWith("build ")) { // Added space to ensure a build target exists
    const target = cmd.substring(6).trim(); // Extract build target, removing "build " prefix and extra whitespace
    if (target) { // Check if a build target was actually provided
      build(target);
    } else {
      print("Build what?"); // Provide feedback if no target is given
    }
  } else if (cmd === "use lever") {
    useLever();
  } else if (cmd === "move shelf" || cmd === "move shelves") {
    moveShelf();
  } else if (cmd === "search") {
    lookForItem();
  } else if (cmd.startsWith("take ")) {
    const item = cmd.substring(5).trim(); // Extract item, removing "take " prefix and extra whitespace
    if (item) { // Check if an item was actually provided
      takeItem(item);
    } else {
      print("Take what?"); // Provide feedback if no item is given
    }
  } else if (cmd.startsWith("drop ")) {
    const item = cmd.substring(5).trim(); // Extract item, removing "drop " prefix and extra whitespace
    if (item) { // Check if an item was actually provided
      dropItem(item);
    } else {
      print("Drop what?"); // Provide feedback if no item is given
    }
  } else if (cmd === "inventory" || cmd === "check bag") {
    showInventory();
  } else {
    print("You can't do that.");
  }
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
  handleCommand(input);
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
  handleCommand(cmd);
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
