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

// ~~~~~~~~~~~~~~~~~~~~~~~~
// FLAVOUR TEXT AND SECRETS
// ~~~~~~~~~~~~~~~~~~~~~~~~

// sit command
function handleSit() {
  const loc = player.location;

  if (loc === "white room") {
    appendMessage("You sit on the bench gingerly. It creaks, but holds up. The old wood is a bit splintery, though. Probably best not to stay sat for too long.");
    if (puppy.following) {
      appendMessage("The puppy barks, scrabbling at the crumbling stone leg of the bench. You get up and look where he's trying to dig, and spot a tiny keyhole.");
      flags.smallKeyholeRevealed = true;
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

// jump command
function handleJump() {
  const loc = player.location;

  if (loc === "white room") {
    if (!flags.wrExitOpen) {
      appendMessage("You jump as high as you can, and spot a button near the ceiling. You press it quickly, and a hidden door opens in the east wall.\n");
      const wr = rooms["white room"];
      wr.exits["east"] = "fossil exhibit";
      flags.wrExitOpen = true;
    } else {
      appendMessage("You jump again, but nothing else happens.\n");
    }
  } else if (loc === "hidden store") {
    appendMessage("As you jump, you spot a tiny key on one of the high shelves. You jump up again and grab it.\nThere's a scratched up tag attached to it with the words 'white room - exit' written on.\n");
    player.hasSmallKey = true;
  } else if (loc === "cleaners' store" || loc === "secret lab") {
    appendMessage("You can't jump here, the ceiling is too low.\n");
  } else if (loc === "fossil exhibit" && !flags.note1Found) {
    appendMessage("You spot a note stuck to the triceratops skull. You carefully reach up and take it.");
    flags.note1Found = true;
  } else if (loc === "garden" && !flags.note4Found) {
    appendMessage("There's a note pinned high up on one of the trees. You stand on an upturned flowerpot to grab it.\n");
    flags.note4Found = true;
  } else {
    appendMessage("You jump, but nothing unusual happens.\n");
  }
}

// examine command
function handleExamine() {
  const loc = player.location;

  if (loc === "art gallery") {
    appendMessage("You take a good look at some of the paintings. They're even creepier up close.");
    if (!flags.note2Found) {
      appendMessage("One of the surreal landscapes has a note tucked into the frame. You take it gently, trying to avoid disturbing the artwork.");
      flags.note2Found = true;
    }
  }

  else if (loc === "yard") {
    appendMessage("The junk piles seem even more rusty and decrepit the closer you look at them. Who dumped all this mess here, anyway?");
    if (!flags.note3Found) {
      appendMessage("You spot a slightly damp note under a big stone beside one pile. Careful not to nudge the teetering junk, you take the note.");
      flags.note3Found = true;
    }
  }

  else if (loc === "observatory") {
    if (!flags.discoveredLab) {
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
    appendMessage("On closer inspection, the pedestals have fine wires inlaid down their length, joining with a circuit-like pattern embedded in the floor.");
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

// poke command
function handlePoke() {
  const loc = player.location;

  if (loc === "secret lab") {
    appendMessage("You poke some of the equipment on the bench, wondering what it does. Something starts reacting violently...");
    appendMessage("The lab explodes in a chain reaction, and you perish in the destruction.");
    player.isDead = true;
    flags.gameLose = true;
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
    appendMessage("You poke some of the fossil displays. It's great fun, until the jawbone falls off a Dromiceiomimus skeleton. You wedge it back in place and stop touching the exhibits.\n");
  }

  else if (loc === "workshop") {
    appendMessage("You poke the things on the workbench. One of the half-built whatnots slides across, revealing a scrap of paper underneath it. You take the note.\n");
    flags.note5Found = true;
  }

  else {
    appendMessage("You walk around the room poking things. Nothing interesting happens.");
  }
}

// pick flowers for the barista
function pickFlowers() {
  const loc = player.location;
  
  if (loc === "garden") {
    appendMessage("You pick some of the prettier flowers you can see. Maybe the barista would appreciate them.");
    inventory.push("flowers");
  } else {
    appendMessage("There are no flowers here. Try the garden.");
  }
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~
// NPC OBJECTS & TALK SYSTEM
// ~~~~~~~~~~~~~~~~~~~~~~~~~

// NPC objects
const npcs = {
  caretaker: {
    name: "caretaker",
    location: "blue corridor",
    met: false,
  },
  barista: {
    name: "barista",
    location: "cafe",
    met: false,
  },
  scientist: {
    name: "scientist",
    location: "fossil exhibit",
    met: false,
  },
  puppy: {
    name: "puppy",
    location: "yard",
    met: false,
    following: false,
  }
};

// simple talk system - may expand later
function talkTo(npcName) {
  const npc = npcs[npcName];
  if (!npc || npc.location !== player.location) {
    appendMessage(`The ${npcName} isn't here.`);
    return;
  }

  npc.met = true;

  if (npcName === "caretaker") {
    if (flags.givenToolbox) {
      appendMessage("The caretaker says: 'Thanks again for returning my toolbox!'");
    } else {
      appendMessage("The caretaker says: 'If you find my old toolbox anywhere, bring it to me!'");
    }
    return;
  }

  if (npcName === "barista") {
    if (flags.givenFlowers){
      appendMessage("The barista says: 'Thank you again for the flowers, lovie. They're beautiful!'");
    } else {
      appendMessage("The barista says: 'Hi lovie! Always happy to help!'");
    }
    return;
  }

  if (npcName === "scientist") {
    if (flags.givenSnowglobe){
      appendMessage("The scientist says: 'Hello again. Did you find a use for that gem at all?'");
    } else {
      appendMessage("The scientist says: 'Fascinating place, isn't it? So many mysteries.'");
    }
    return;
  }
  
  if (npcName === "puppy") {
    if (flags.befriendedPuppy) {
      appendMessage("The puppy jumps up and licks your hand. 'Woof woof!'");
    } else {
      appendMessage("The puppy seems a little uncertain of you. Maybe if you had a toy he'd be more interested?");
    }
  }
}

// puppy follows player
function puppyFollow() {
  const friend = flags.befriendedPuppy;
  
  if (friend) {
    puppy.location = player.location;
  }
}

// ~~~~~~~~~~~~~~~~~~~~
// PUZZLE RELATED LOGIC
// ~~~~~~~~~~~~~~~~~~~~

// build items in the workshop
function build(item) {
  if (player.location !== "workshop") {
    appendMessage("You can’t build anything here.");
    return;
  }

  if (!item) {
    appendMessage("What do you want to build?");
    return;
  }

  const thing = item.toLowerCase();

  switch (thing) {
    case "cart":
    case "handcart":
      if (!player.builtCart) {
        appendMessage("You build a simple, yet sturdy cart.");
        player.builtCart = true;
      } else {
        appendMessage("You already built a cart.");
      }
      break;

    case "birdhouse":
      if (!player.builtBirdhouse) {
        appendMessage("You build a small, standing birdhouse. It might look pretty in a garden.");
        player.builtBirdhouse = true;
      } else {
        appendMessage("You already built a birdhouse.");
      }
      break;

    case "shelf":
    case "bookshelf":
      if (!player.builtShelf) {
        appendMessage("You build a tall shelving unit. It would be good for books, or someone could make a display on it.");
        player.builtShelf = true;
      } else {
        appendMessage("You already built a shelf.");
      }
      break;

    default:
      appendMessage("You don’t see the right equipment to make that.");
  }
}

// use the lever in the observatory
function useLever() {
  if (player.location !== "observatory") {
    appendMessage("There’s nowhere to use a lever here.");
    return;
  }

  if (inventory.includes("lever") && !flags.leverPlaced) {
    appendMessage("You put the lever back in the mechanism, hearing a satisfying click as it finds its place.");
    inventory = inventory.filter(i => i !== "lever");
    flags.leverPlaced = true;
  } else if (flags.leverPlaced && !flags.discoveredLab) {
    appendMessage("You pull the newly placed lever. Clicking and grinding noises travel through the walls — a hidden panel swings open in the southwest corner.");
    flags.discoveredLab = true;
    // unlocks the secret lab exit
    const obs = rooms["observatory"];
    obs.exits["south west"] = "secret lab";
  } else if (flags.discoveredLab) {
    appendMessage("The lever’s already done its job.");
  } else {
    appendMessage("You don’t have a lever to use.");
  }
}

// player moves the shelves in the cleaners' store
function moveShelf() {
  if (player.location !== "cleaners' store") {
    appendMessage("There are no shelves here to move.\n");
    return;
  }

  if (flags.shelvesMoved) {
    appendMessage("You already moved the shelves.\n");
    return;
  }

  if (player.isInjured) {
    appendMessage("You try to push the shelves aside, but your injured arm lets you down. Maybe there’s a first aid kit around somewhere?\n");
    return;
  }

  if (!inventory.includes("ironKey")) {
    appendMessage("There's no reason to move those.\n");
    return;
  }

  appendMessage("You push the shelf aside, revealing a hidden door with an iron keyhole. The key fits perfectly, and you unlock the door.\n");
  flags.shelvesMoved = true;

  // reveals the hidden store exit
  const store = rooms["cleaners' store"];
  store.exits["east"] = "hidden store";
}

// ~~~~~~~~~~~~~~~~~~~~~~~
// INVENTORY + ITEM SYSTEM
// ~~~~~~~~~~~~~~~~~~~~~~~

// obtainable items (TEMP - will put in a json file eventually)
const items = {
  lever: {
    id: "lever",
    name: "metal lever",
    description: "A sturdy lever that probably belongs to some machinery.",
    location: "null",
    pickupable: true,
    usable: true,
  },
  keyring: {
    id: "keyring",
    name: "keyring",
    description: "A plain leather keyring.",
    location: "gift shop",
    pickupable: true,
    usable: false,
  },
  dogToy: {
    id: "dogToy",
    name: "dog toy",
    description: "A brightly coloured squeaky dog toy.",
    location: "gift shop",
    pickupable: true,
    usable: false,
    giveableTo: "puppy",
    onGive: () => {
      appendMessage("The puppy barks excitedly and chews on the toy for a moment. Looks like you gained a new friend!");
      flags.befriendedPuppy = true;
      puppy.following = true;
    }
  },
  snowglobe: {
    id: "snowglobe",
    name: "snowglobe",
    description: "A small and intricate snowglobe. The cottage inside reminds you of home, somehow.",
    location: "gift shop",
    pickupable: true,
    usable: false,
    giveableTo: "scientist",
    onGive: () => {
      appendMessage("The scientist says: 'Thank you, I was looking for one of these. Here, I've been trying to work out where this goes, but you might have better luck.'\n");
      inventory.push("teleGem");
      appendMessage("The scientist hands you a strange green gem. It seems to be glowing.\n");
      flags.givenSnowglobe = true;
    }
  },
  toolbox: {
    id: "toolbox",
    name: "toolbox",
    description: "A heavy metal toolbox filled with tools. It looks like it belongs to the caretaker.",
    location: "yard",
    pickupable: true,
    usable: false,
    giveableTo: "caretaker",
    onGive: () => {
      appendMessage("The caretaker beams. 'Oh, you found my old toolbox! Thank you!'");
      flags.givenToolbox = true;
      inventory.push("lever");
      appendMessage("The caretaker hands you a metal lever. 'You'll probably need this sooner or later.'");
    }
  },
  flowers: {
    id: "flowers",
    name: "flowers",
    description: "A bunch of colourful flowers you picked from the garden.",
    location: "garden",
    pickupable: true,
    usable: false,
    giveableTo: "barista",
    onGive: () => {
      appendMessage("The barista blushes. 'Oh, these are beautiful! Here, have some cake on the house, lovie!'");
      flags.givenFlowers = true;
      inventory.push("cake");
    }
  },
  cake: {
    id: "cake",
    name: "cake",
    description: "A tasty looking slice of cake, neatly wrapped in a to-go box.",
    location: "null",
    pickupable: true,
    usable: false,
  },
  smallKey: {
    id: "smallKey",
    name: "small key",
    description: "A tiny tarnished key. There's a faded, dusty label: 'White Room - Exit'.",
    location: "hidden store",
    pickupable: true,
    usable: true,
    onUse: () => {
      appendMessage("You carefully fit the small key into the tiny keyhole and turn it. A part of the north wall slides open, revealing an almost blinding light.");
      flags.exitUnlocked = true;
      // opens the glass corridor exit
      const whrm = rooms["white room"];
      whrm.exits["north"] = "glass corridor";
    }
  },
  brassKey: {
    id: "brassKey",
    name: "brass key",
    description: "A heavy brass key. There's a tag on it that reads: 'Garden'.",
    location: "secret lab",
    pickupable: true,
    usable: true,
    onUse: () => {
      // opens the garden doors
      appendMessage("You unlock the door and push it open with a slight creak. Looks like there's a garden through there.");
      const gard1 = rooms["blue corridor"];
      gard1.exits["south east"] = "garden";
      const gard2 = rooms["cafe"];
      gard2.exits["south"] = "garden";
    }
  },
  ironKey: {
    id: "ironKey",
    name: "iron key",
    description: "A plain iron key. A label attached says: 'Stockroom'.",
    location: "garden",
    pickupable: true,
    usable: true,
    onUse: () => {
      // opens the hidden store exit
      const store = rooms["cleaners' store"];
      store.exits["east"] = "hidden store";
    }
  },
  firstAidKit: {
    id: "firstAidKit",
    name: "first aid kit",
    description: "A basic first aid box, handy for dealing with minor injuries.",
    location: "cafe",
    pickupable: true,
    usable: true,
    onUse: () => {
      if (!player.isInjured) {
        appendMessage("Best not to waste the supplies.");
      } else {
        appendMessage("You wash and bandage your arm.");
        player.isInjured = false;
      }
    }
  },
  teleGem: {
    id: "teleGem",
    name: "green gem",
    description: "It glows faintly with a mysterious energy. Might fit somewhere important.",
    location: "null",
    pickupable: true,
    usable: true,
    onUse: () => {
      appendMessage("As you place the gem into its setting, you hear a soft electronic hum. The floor glows with an intricate pattern, and a synthetic voice says: 'Teleportation circuits activated. Press the central crystal to continue.'");
      // activates teleport and secret ending
      flags.teleportEnabled = true;
      const tele = rooms["secret room"];
      store.exits["teleport"] = "exit";
    }
  }
};

// check items in current room 
function lookForItem() {
  const foundItems = Object.values(items).filter(i => i.location === player.location);

  if (foundItems.length === 0) {
    appendMessage("You don’t see anything useful here.");
  } else {
    appendMessage("You notice:");
    foundItems.forEach(i => print(` - ${i.name}: ${i.description}`));
  }
}

// show player inventory
function showInventory() {
  if (inventory.length === 0) {
    appendMessage("You're not carrying anything.");
  } else {
    appendMessage("You're carrying:");
    inventory.forEach(id => {
      const it = items[id];
      if (it) {
        print(` - ${it.name}`);
      } else {
        print(` - ${id}`);
      }
    });
  }
}

// player takes item
function takeItem(name) {
  const found = Object.values(items).find(
    i => i.location === player.location && i.name.toLowerCase() === name.toLowerCase()
  );

  if (!found) {
    appendMessage("You don’t see that here.");
    return;
  }

  if (!found.pickupable) {
    appendMessage("You can’t take that.");
    return;
  }

  inventory.push(found.id);
  found.location = "inventory";
  appendMessage(`You take the ${found.name}.`);
}

// player drops item
function dropItem(name) {
  const index = inventory.findIndex(
    id => items[id].name.toLowerCase() === name.toLowerCase()
  );

  if (index === -1) {
    appendMessage("You don’t have that.");
    return;
  }

  const item = items[inventory[index]];
  item.location = player.location;
  inventory.splice(index, 1);
  appendMessage(`You leave the ${item.name} behind.`);
}

// give items to NPCs
function giveItem(itemName, npcName) {
  const item = Object.values(items).find(
    i => i.name.toLowerCase() === itemName.toLowerCase()
  );

  const npc = npcs[npcName];

  if (!item) {
    appendMessage(`You don't seem to have a ${itemName}.`);
    return;
  }
  if (!inventory.includes(item.id)) {
    appendMessage(`You're not carrying the ${item.name}.`);
    return;
  }
  if (!npc) {
    appendMessage(`The ${npcName} isn't here.`);
    return;
  }
  if (npc.location !== player.location) {
    appendMessage(`${npc.name} isn't here right now.`);
    return;
  }
  if (item.giveableTo !== npcName) {
    appendMessage(`${npc.name} doesn't seem interested in that.`);
    return;
  }

  // give success
  appendMessage(`You give the ${item.name} to ${npc.name}.`);
  inventory = inventory.filter(i => i !== item.id);
  if (item.onGive) item.onGive(); // run custom event logic
}

// use items
function useItem(itemName) {
  const item = Object.values(items).find(
    i => i.name.toLowerCase() === itemName.toLowerCase()
  );
  
  if (!item) {
    appendMessage(`You don't seem to have a ${itemName}.`);
    return;
  }
  
  if (!inventory.includes(item.id)) {
    appendMessage(`You're not carrying a ${item.name}.`);
    return;
  }
  
  if (!item.usable) {
    appendMessage("You can't use that.");
    return;
  }
  
  appendMessage(`You use the ${item.name}.`);
  if (item.onUse) item.onUse(); // run custom event logic
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// GAME STATE & UTILITY FUNCTIONS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// game state
let rooms = {};
let currentRoom = null;
let inventory = [];

// game flags
const flags = {
  cartBuilt: false,
  usingCart: false,
  carryingToolbox: false,
  carryingBookshelf: false,
  carryingBirdhouse: false,
  givenToolbox: false,
  givenFlowers: false,
  givenSnowglobe : false,
  befriendedPuppy: false,
  leverPlaced: false,
  shelvesMoved: false,
  wrExitOpen: false,
  smallKeyholeRevealed: false,
  note1Found: false,
  note2Found: false,
  note3Found: false,
  note4Found: false,
  note5Found: false,
  discoveredLab: false,
  teleportEnabled: false,
  exitUnlocked: false,
  gameLose: false,
  gameWin: false,
};

// player object
const player = {
  location: "white room",
  builtCart: false,
  builtShelf: false,
  builtBirdhouse: false,
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

// load rooms JSON
async function loadRooms() {
  try {
    const res = await fetch("./rooms_complete.json");
    const data = await res.json();
    data.forEach(room => {
      rooms[room.id] = room;
    });
    return true;
  } catch (err) {
    appendMessage("⚠️ Could not load rooms_complete.json");
    console.error(err);
    return false;
  }
}

// show current room
function describeRoom(showIntro = true) {
  const room = rooms[currentRoom];
  if (!room) {
    appendMessage("You're lost in the void. (Room not found!)\n");
    return;
  }

  br();
  if (showIntro && room.intro) appendMessage(room.intro);
  if (room.description) appendMessage(room.description);

  const exits = Object.keys(room.exits || {});
  if (exits.length > 0) {
    appendMessage("Exits: " + exits.join(", "));
  } else {
    appendMessage("There are no visible exits.\n");
  }
  br();
}

// move between rooms
function goDirection(dir) {
  const room = rooms[currentRoom];
  if (!room) {
    appendMessage("Error: currentRoom not found!\n");
    return;
  }

  if (!room.exits || !room.exits[dir]) {
    appendMessage(`You can't go ${dir} from here.\n`);
    return;
  }

  // get next room name string
  const nextRoomId = room.exits[dir];
  const nextRoom = rooms[nextRoomId];

  if (!nextRoom) {
    appendMessage("That direction doesn't seem to go anywhere.\n");
    return;
  }

  // update both trackers
  currentRoom = nextRoomId;
  player.location = nextRoomId.toLowerCase();

  // print the new room description
  appendMessage(`You move ${dir} into the ${nextRoom.id}.\n`);
  describeRoom(false);
  
/* incomplete functions - ready to add win/lose logic
  if (flags.gameWin) { //add win condition logic here
    
  }
  
  if (flags.gameLose) { //add lose condition logic here
    
  }*/
}


// command handler
function handleCommand(cmdInput) {
  const cmd = cmdInput.trim().toLowerCase();

  if (cmd.startsWith("go ")) {
    const dir = cmd.substring(3).trim();
    if (dir) {
      goDirection(dir);
    } else {
      appendMessage("Go where?");
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
  } else if (cmd.startsWith("build ")) {
    const target = cmd.substring(6).trim();
    if (target) {
      build(target);
    } else {
      appendMessage("Build what?");
    }
  } else if (cmd === "use lever") {
    useLever();
  } else if (cmd === "move shelf" || cmd === "move shelves") {
    moveShelf();
  } else if (cmd === "search") {
    lookForItem();
  } else if (cmd.startsWith("take ")) {
    const item = cmd.substring(5).trim();
    if (item) {
      takeItem(item);
    } else {
      appendMessage("Take what?");
    }
  } else if (cmd.startsWith("drop ")) {
    const item = cmd.substring(5).trim();
    if (item) {
      dropItem(item);
    } else {
      appendMessage("Drop what?");
    }
  } else if (cmd.startsWith("use ")) {
    const item = cmd.substring(4).trim();
    if (item) {
      useItem(item);
    } else {
      appendMessage("Use what?");
    }
  } else if (cmd.startsWith("give ")){
    const parts = cmd.slice(5).split(" to ");
    if (parts.length === 2) {
      giveItem(parts[0].trim(), parts[1].trim());
      return true;
    }
    appendMessage("Give what to whom?");
    return true;
  } else if (cmd.startsWith("talk to ")) {
    talkTo(cmd.slice(8).trim());
    return true;
  } else if (cmd === "inventory" || cmd === "check bag") {
    showInventory();
  } else {
    appendMessage("You can't do that.");
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

// Initialize the game
async function startGame() {
  appendMessage("Loading Escape the Complex...");
  const ok = await loadRooms();
  if (!ok) return;
  currentRoom = Object.keys(rooms)[0];
  appendMessage("Welcome to Escape the Complex!");
  describeRoom(true);
  appendMessage("Type a command or use the compass to move.");
  br();
  cmdInput.focus();
}

// Start when ready
window.addEventListener("DOMContentLoaded", startGame);
