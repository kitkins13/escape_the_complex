/* Escape the Complex — Browser Game Engine
   Works with index.html, style.css, and rooms_complete.json
   Gameplay logic, items and dialogue, utility functions
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

// ~~~~~~~~~~~~~~~
// IN-GAME MINIMAP
// ~~~~~~~~~~~~~~~

// new map layout allowing for larger rooms
const mapLayout = {
  "white room":        { x: 1, y: 5, w: 1, h: 1 },
  "glass corridor":    { x: 1, y: 4, w: 1, h: 1 },
  "fossil exhibit":    { x: 2, y: 5, w: 1, h: 1 },
  "gift shop":         { x: 3, y: 5, w: 1, h: 1 },
  "secret room":       { x: 2, y: 6, w: 1, h: 1 },

  // red corridor spans 2 tiles vertically
  "red corridor":      { x: 2, y: 3, w: 1, h: 2 },

  "cleaners store":   { x: 3, y: 4, w: 1, h: 1 },
  "hidden store":      { x: 4, y: 4, w: 1, h: 1 },

  "art gallery":       { x: 2, y: 2, w: 1, h: 1 },
  "workshop":          { x: 1, y: 2, w: 1, h: 1 },
  "yard":              { x: 0, y: 2, w: 1, h: 1 },

  // blue corridor spans 2 tiles vertically
  "blue corridor":     { x: 3, y: 1, w: 1, h: 2 },

  "bathroom":          { x: 3, y: 3, w: 1, h: 1 },

  // observatory spans 2 tiles horizontally
  "observatory":       { x: 2, y: 0, w: 2, h: 1 },

  "cafe":              { x: 4, y: 1, w: 1, h: 1 },
  "garden":            { x: 4, y: 2, w: 1, h: 1 },

  "secret lab":        { x: 2, y: 1, w: 1, h: 1 }
};

let visitedRooms = new Set(["white room"]);
let discoveredRooms = new Set();


// map rendering

function getCellsFor(room) {
  let cells = [];
  for (let dx = 0; dx < room.w; dx++) {
    for (let dy = 0; dy < room.h; dy++) {
       cells.push(`${room.x + dx},${room.y + dy}`);
    }
  }
  return cells;
}

let occupied = new Set();

for (const [id, room] of Object.entries(mapLayout)) {
  const cells = getCellsFor(room);

  for (const cell of cells) {
    if (occupied.has(cell)) {
      console.warn(`⚠️ Overlap detected at ${cell} for ${id}`);
    }
    occupied.add(cell);
  }
}

const cellToRoom = {};

for (const [roomKey, room] of Object.entries(mapLayout)) {
  const cells = getCellsFor(room);
  for (const cell of cells) {
    cellToRoom[cell] = roomKey;
  }
}


// map object for engine.js
function renderMap() {
  const grid = document.getElementById("mapGrid");
  grid.innerHTML = "";

  for (let y = 0; y <= 6; y++) {
    for (let x = 0; x <= 6; x++) {
      const cell = document.createElement("div");
      cell.classList.add("map-cell");

      const roomKey = cellToRoom[`${x},${y}`];
      
      // empty or undiscovered room
      if (!roomKey || !discoveredRooms.has(roomKey)) {
        cell.classList.add("empty");
        grid.appendChild(cell);
        continue;
      }
      
      // visible room cell
      
      cell.classList.add("discovered");
      cell.textContent = roomKey;
      
      if (!visitedRooms.has(roomKey)) {
        cell.classList.add("unvisited");
      }

      if (roomKey === currentRoom) {
        cell.classList.add("current");
      }

      grid.appendChild(cell);
      
      if (roomKey) {
        cell.textContent = roomKey;

        // NPC icon logic
        const npcsHere = Object.entries(npcLocations).filter(
        ([npc, room]) => room === roomKey
        ); 

        if (npcsHere.length > 0) {
          const icon = document.createElement("div");
          icon.classList.add("map-icon");

          const npcEmoji = {
            caretaker: "🧹",
            barista: "☕",
            scientist: "🔬",
            puppy: "🐕",
            player: "👤"
          };

          icon.textContent = npcEmoji[npcsHere[0][0]] || "❓";
          cell.appendChild(icon);
        }
      }
    }
  }
}

// handles room aliases for fast travel
function resolveRoomFromText(text) {
  const lower = text.toLowerCase();

  for (const room of Object.values(rooms)) {
    for (const alias of room.aliases) {
      if (lower.includes(alias)) {
        return room.id;
      }
    }
  }

  return null;
}

// fast travel check
function canFastTravelTo(roomId) {
  return discoveredRooms.has(roomId);
}

// allows fast travel between discovered rooms
function movePlayerTo(roomId) {
  currentRoom = roomId;
  visitedRooms.add(roomId);
  discoveredRooms.add(roomId);
  
  // allows puppy to fast travel with player
  if (npcs.puppy.following) {
    puppyFollow(true);
    npcLocations.puppy = currentRoom;
  }
  
  player.location = currentRoom;
  appendMessage(`You make your way back to the ${roomId}.`);
  describeRoom(roomId);
  renderMap();
}

// ~~~~~~~~~~~~~~~~~~~~~~~~
// FLAVOUR TEXT AND SECRETS
// ~~~~~~~~~~~~~~~~~~~~~~~~

// sit command
function handleSit() {
  const loc = player.location;

  if (loc === "white room") {
    if (npcs.puppy.following && !flags.smallKeyholeRevealed) {
      appendMessage("The puppy barks, scrabbling at the crumbling stone leg of the bench. You get up and look where he's trying to dig, and spot a tiny keyhole. A very small key might fit...");
      flags.smallKeyholeRevealed = true;
      autoSave("Digger revealed the small keyhole");
    } else {
      appendMessage("You sit on the bench gingerly. It creaks, but holds up. The old wood is a bit splintery, though. Probably best not to stay sat for too long.");
    }
  } 
  
  else if (loc === "blue corridor") {
    appendMessage("You sit down on one of the cushioned benches. It's nice to take a break after all the exploring you've been doing.");
  } 
  
  else if (loc === "cafe") {
    appendMessage("You pull out one of the chairs and sit for a minute.");
  } 
  
  else if (loc === "garden") {
    if (!inventory.includes("ironKey")){
      appendMessage("You sit down on the wrought iron bench, and immediately regret it as part of the filigree falls off. You quickly stand to check the damage, and realise that what fell wasn't part of the bench, but a rusted iron key.");
      items.ironKey.location = "garden";
    } else {
      appendMessage("The wrought iron bench doesn't look all that comfy, but it's better than the damp grass. Barely.");
    }
  } 
  
  else if (loc === "bathroom") {
    appendMessage("You sit on one of the toilets. Hey, when the lid's down, it's a chair!");
  } 
  
  else {
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
  } 
  
  else if (loc === "cleaners store" || loc === "secret lab") {
    appendMessage("You can't jump here, the ceiling is too low.\n");
  } 
  
  else if (loc === "fossil exhibit" && !player.notes.note1) {
    appendMessage("You spot a note stuck to the triceratops skull. You carefully reach up and take it.");
    player.notes.note1 = true;
    player.notesFound++;
  } 
  
  else if (loc === "garden" && !player.notes.note4) {
    appendMessage("There's a note pinned high up on one of the trees. You stand on an upturned flowerpot to grab it.\n");
    player.notes.note4 = true;
    player.notesFound++;
  } 
  
  else {
    appendMessage("You jump, but nothing unusual happens.\n");
  }
}

// examine command
function handleExamine() {
  const loc = player.location;
  
  if (loc === "white room"){
    if (npcs.puppy.following && !flags.smallKeyholeRevealed) {
      appendMessage("You don't spot anything, but the puppy barks, scrabbling at the crumbling stone leg of the bench. You look very closely at where he's trying to dig, and spot a tiny keyhole. A very small key might fit...");
      flags.smallKeyholeRevealed = true;
      autoSave("Digger revealed the small keyhole");
    } else {
      appendMessage("You can't see anything here, but you have a feeling you're missing something. Maybe someone with better senses could find something.");
    }
  } 
  
  else if (loc === "art gallery") {
    appendMessage("You take a good look at some of the paintings. They're even creepier up close.");
    if (!player.notes.note2) {
      appendMessage("One of the surreal landscapes has a note tucked into the frame. You take it gently, trying to avoid disturbing the artwork.");
      player.notes.note2 = true;
      player.notesFound++;
    }
  } 
  
  else if (loc === "yard") {
    appendMessage("The junk piles seem even more rusty and decrepit the closer you look at them. Who dumped all this mess here, anyway?");
    if (!player.notes.note3) {
      appendMessage("You spot a slightly damp note under a big stone beside one pile. Careful not to nudge the teetering junk, you take the note.");
      player.notes.note3 = true;
      player.notesFound++;
    }
    if (!inventory.includes("toolbox")) {
      appendMessage("There's a heavy-looking, slightly battered toolbox sitting under a couple of planks in one corner. It might be useful, but you'll need something to help you carry it.'");
    }
  } 
  
  else if (loc === "garden") {
    if (!inventory.includes("ironKey")) {
      appendMessage("You take your time examining things around the garden. When you get to the old wrought iron bench, you notice something a little off about the filigree workings. There's a rusted key wedged in between a couple of the iron whirls... maybe it fits somewhere important? You gently wiggle it out of the bench and pocket it.");
      inventory.push("ironKey");
    } else {
      appendMessage("You wander around the garden trying to see what plants you can identify. Nothing is recognisable, but the flowers are pretty.");
    }
  } 
  
  else if (loc === "observatory") {
    if (!flags.placedLever && !inventory.includes("lever")) {
      appendMessage("You go and take a better look at those mechanisms. Most seem to operate the big telescope, but one isn't connected to anything you can see. It's missing its lever... maybe the caretaker knows something about it?");
    } else if (!flags.placedLever) {
      appendMessage("You go and take a better look at those mechanisms. Most seem to operate the big telescope, but one isn't connected to anything you can see. It's missing its lever... maybe the one the caretaker gave you would fit?");
    } else if (!flags.discoveredLab) {
      appendMessage("You take another good look at those mechanisms. The one you replaced the lever for looks a little different to the rest. Maybe you should give that one a pull and see what happens.");
    } else {
      appendMessage("The mechanisms are rather interesting, even if you're not quite sure what they all do. You try and resist the urge to play with them.");
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
  
  else if (loc === "cleaners store") {
    appendMessage("You take a closer look at those shelves, intrigued by the scattered, flaky rust. You can just make out a thin crack in the wall behind them, and a rusted up keyhole mostly hidden by the edge of one shelf.");
  } 
  
  else if (loc === "secret lab") {
    appendMessage("There's a lot of scientific equipment here, both familiar and unfamiliar. Beakers of strange fluids are lined up along one side of the bench. Some are emitting steam, despite being nowhere near a heat source. Probably best to leave them alone.");
  } 
  
  else if (loc === "gift shop") {
    appendMessage("You take a closer look at the items on the dusty shelves. Most are uninteresting, the usual kitschy knick-knacks, but a snowglobe and a dog toy catch your eye.");
  } 
  
  else if (loc === "hidden store") {
    appendMessage("You take a better look at the boxes stacked on the towering shelves. Most are plain and boring, but a faint glimmer of metal catches your eye. There's a tiny key tucked between two of the boxes.");
  } 
  
  else if (loc === "red corridor") {
    appendMessage("Looking too closely at this garish shade of red is making your eyes hurt. There's nothing of interest here, other than the two doors to the east and north.");
  } 
  
  else if (loc === "glass corridor") {
    appendMessage("The light is dazzling as it streams through the glass walls, but when you get used to the glare, you spot a sign on the wall. It reads: 'Sitting on your fellow visitors is not permitted.'");
  }
  
  else {
    appendMessage("There's nothing interesting enough to examine here.");
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
    return;
  }

  else if (loc === "yard") {
    appendMessage("You prod at the heaps of junk. Something dislodges, causing a small collapse. You jump back but get a cut on your arm.");
    player.isInjured = true;
  }

  else if (loc === "gift shop") {
    appendMessage("You poke at the little trinkets on the shelves. A couple of them fall off and roll around the floor.");
  }

  else if (loc === "fossil exhibit") {
    appendMessage("You poke some of the fossil displays. It's great fun, until the jawbone falls off a Dromiceiomimus skeleton. You wedge it back in place and stop touching the exhibits.");
  }

  else if (loc === "workshop") {
    if (!player.notes.note5){
      appendMessage("You poke the things on the workbench. One of the half-built whatnots slides across, revealing a scrap of paper underneath it. You take the note.");
      player.notes.note5 = true;
      player.notesFound++;
    } else {
      appendMessage("You poke the things on the workbench again. One of them whirrs for a moment, then stops. Nothing else happens.");
    }
  }
  
  else if (loc === "garden") {
    if (!inventory.includes("ironKey")) {
      appendMessage("You poke at several things around the garden. When you get to the wrought iron bench, part of it clinks to the ground after a firm prod. When you pick it up, you realise it isn't part of the bench, but a rusted up iron key.");
      inventory.push("ironKey");
    } else {
      appendMessage("You poke and prod at things around the garden. Not much happens, aside from a couple of wilting leaves falling off the bushes.");
    }
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

// lets player use the telescope in the observatory
function useTelescope(){
  if (player.location === "observatory"){
    const skyThings = [
      "Arcturus.",
      "the Orion Nebula.",
      "Jupiter.",
      "Rigel.",
      "the Moon.",
      "Venus.",
      "the Pleiades.",
      "the Crab Nebula.",
      "the ISS passing overhead.",
      "a... um... was that a flying saucer?",
    ];
    const skyThing = skyThings[Math.floor(Math.random() * skyThings.length)];
    appendMessage(`You gaze through the big telescope, and after a few minutes you tentatively identify ${skyThing}`);
  } else {
    appendMessage("There's no telescope here.");
  }
}

// mirror interactions in the bathroom
function mirrorInteractions(input) {
  if (input.includes("admire") || input.includes("check")) {
    appendMessage("You spend a few minutes admiring yourself in the mirror. Looking good!");
  } else if (input.includes("faces") || input.includes("tongue") || input.includes("funny")) {
    appendMessage("You spend a few minutes pulling faces in the mirror. It's fun!");
  } else {
    appendMessage("You look in the mirror for a moment. It's you!");
  }
}

// lets the player use the bathroom
function pee() {
  const location = player.location;

  if (location === "bathroom") {
    appendMessage("You go into one of the cubicles and relieve yourself.\n");
  } else {
    appendMessage("Probably shouldn't do that here.\n");
  }
}

// always wash your hands after using the bathroom!
function washHands() {
  const location = player.location;
  
  if (location === "bathroom") {
    appendMessage("You wash your hands in one of the sinks lining the wall.\n");
  } else if (location === "cafe") {
    appendMessage("You go behind the counter and wash your hands in the small sink there.\n");
  } else {
    appendMessage("There's nowhere to do that here.\n");
  }
}

// show notes function
function showNotes() {
  const found = Object.keys(player.notes).filter(n => player.notes[n]);
  if (found.length === 0) {
    appendMessage("You haven't discovered any notes yet.");
    return;
  }

  print("📒 Notes Found:");
  found.forEach(n => {
    appendMessage("\n" + notes[n] + "\n");
  });
}

// show basic commands
function showHelp() {
  appendMessage("Basic Commands:\nlook around - reprints the current room description\ngo <direction> - move (north, south, etc.)\njump - jump, you might find a secret\nbag - show inventory\nsearch - search the current room for items\nexamine - examine the current room more closely\npoke - poke things in the current room, use with caution\ntake/drop/use <item> - pick up/drop/use an item\ngive <item> to <npc> - give an item to an NPC\ntalk to <npc> - talk to an NPC\nask <npc> for help - get a hint from an NPC\nbuild <item> - build in the workshop\nwait - pass some time without action\n\n");
}

// array for locked doors - NEEDS FIXING
const unlockables = {
  "garden door": {
    aliases: ["garden door", "glass door", "locked door", "door"],
    rooms: ["cafe", "blue corridor"],
    key: "brassKey",
    success: () => {
      appendMessage("You unlock the garden door. It swings open with a soft creak.");
      flags.gardenOpen = true;
      discoveredRooms.add("garden");
      // update blue corridor and cafe descriptions
      const corridorB = rooms["blue corridor"];
      const cafe = rooms["cafe"];
      
      //corridorB.description.dynamic = "";
      corridorB.description.doorList = "There are doors to the south west, south, south east, north east, and north.";
      //cafe.description.dynamic = "";
      cafe.description.doorList = "The door to the west leads back to the blue corridor. Grimy windows and a glass door line the south wall, leading out to the garden.";
      
    },
    fail: "The garden door is locked."
  },
  "storeroom door": {
    aliases: ["storeroom door", "hidden door", "secret door", "stockroom door", "door"],
    rooms: ["cleaners store"],
    key: "ironKey",
    success: () => {
      appendMessage("You unlock the hidden door behind the shelves. ");
      discoveredRooms.add("hidden store");
      // update cleaners store description
      const storeroom = rooms["cleaners store"];
      
      storeroom.description.doorList = "A door to the west goes back to the red corridor, and the east door opens into the previously hidden storeroom.";
    },
    fail: "The door remains locked."
  }
};

// unlocking doors - NEEDS FIXING
function handleUnlock(cmd) {
  const lower = cmd.toLowerCase();

  // find a door whose aliases appear in the command
  const targetKey = Object.entries(unlockables).find(
    ([_, data]) => data.aliases.some(alias => lower.includes(alias))
  )?.[0];

  if (!targetKey) {
    appendMessage("What are you trying to unlock?");
    return;
  }

  const lock = unlockables[targetKey];

  // check room context
  if (!lock.rooms.includes(player.location)) {
    appendMessage("You don't see that here.");
    return;
  }

  // check key
  if (!inventory.includes(lock.key)) {
    appendMessage("You don't have the right key.");
    return;
  }

  lock.success();
}

// puppy interactions - play and pet
function playWithPuppy() {
  if (!npcs.puppy.met && inventory.includes("dogToy")) {
    appendMessage("You gently offer the dog toy you picked up. The puppy takes a sniff, and barks happily before licking your hand. Looks like you gained a friend!");
    flags.befriendedPuppy = true;
    npcs.puppy.following = true;
    inventory = inventory.filter(i => i !== "dogToy");
    // update yard description
    const yard = rooms["yard"];
    
    if (inventory.includes("toolbox") || flags.givenToolbox) {
      yard.description.dynamic = "A few planks of wood lean crookedly against the north wall. There's also a half-finished doghouse in one corner, with a small wooden plaque that says 'Digger'. ";
    } else {
      yard.description.dynamic = "A worn toolbox is half hidden under a few planks of wood against the north wall. There's also a half-finished doghouse in one corner, with a small wooden plaque that says 'Digger'. ";
    }
    
    return true;
  }
  
  if (npcs.puppy.following) {
    appendMessage("You take a moment to play with your puppy. He's such a good boy!");
  } else if (player.location === npcs.puppy.location) {
    appendMessage("You play with the puppy for a moment, throwing the toy for him to chase.");
  } else {
    appendMessage("The puppy isn't with you right now.");
  }
}

function petPuppy() {
  if (!npcs.puppy.met && inventory.includes("dogToy")) {
    appendMessage("You gently offer the dog toy you picked up. The puppy takes a sniff, and barks happily before licking your hand. Looks like you gained a friend!");
    flags.befriendedPuppy = true;
    npcs.puppy.following = true;
    inventory = inventory.filter(i => i !== "dogToy");
    // update yard description
    const yard = rooms["yard"];
    
    if (inventory.includes("toolbox") || flags.givenToolbox) {
      yard.description.dynamic = "A few planks of wood lean crookedly against the north wall. There's also a half-finished doghouse in one corner, with a small wooden plaque that says 'Digger'. ";
    } else {
      yard.description.dynamic = "A worn toolbox is half hidden under a few planks of wood against the north wall. There's also a half-finished doghouse in one corner, with a small wooden plaque that says 'Digger'. ";
    }
    
    return true;
  }
  
  if (npcs.puppy.following) {
    appendMessage("You pause and give your puppy a good scratch behind the ears. Who's a good boy? You are!");
  } else if (player.location === npcs.puppy.location) {
    appendMessage("You give the puppy a pat on the head, earning yourself a happy bark and wagging tail.");
  } else {
    appendMessage("The puppy isn't here right now.");
  }
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~
// NPC OBJECTS & TALK SYSTEM
// ~~~~~~~~~~~~~~~~~~~~~~~~~

// NPC objects
const npcs = {
  caretaker: {
    name: "caretaker",
    aliases: ["caretaker", "janitor", "cleaner", "custodian"],
    location: "blue corridor",
    met: false,
    playerThanked: false,
    shelfCommentSaid: false,
    gardenCommentSaid: false,
    labCommentSaid: false,
    preferredExit: "glass",
    target: null,
    exitRoute: [],
    routeIndex: 0
  },
  barista: {
    name: "barista",
    aliases: ["barista", "cafe lady", "server", "waitress"],
    location: "cafe",
    met: false,
    waitingForOrder: false,
    birdhouseCommentSaid: false,
    gardenCommentSaid: false,
    happyToServe: false,
  },
  scientist: {
    name: "scientist",
    aliases: ["scientist", "researcher", "doctor", "professor"],
    location: "fossil exhibit",
    met: false,
    shelfCommentSaid: false,
    labCommentSaid: false,
    preferredExit: "teleport",
    target: null,
    exitRoute: [],
    routeIndex: 0
  },
  puppy: {
    name: "puppy",
    aliases: ["puppy", "dog", "little dog", "digger"],
    location: "yard",
    met: false,
    following: false,
  },
  customer: {
    name: "customer",
    aliases : ["customer", "cafe customer", "cafe patron", "stranger"],
  },
  visitor: {
    name: "visitor",
    aliases : ["visitor", "exhibit visitor", "museum visitor", "newcomer"],
  }
};

// defines NPC locations for minimap
const npcLocations = {
  caretaker: "blue corridor", // update after unlocking glass exit and informing npc
  barista: "cafe",
  scientist: "fossil exhibit", // update after activating teleporter and informing npc
  puppy: "yard", // update dynamically when puppy follows player
};

// handles NPC aliases
function resolveNpcFromText(text) {
  const lower = text.toLowerCase();

  for (const [npcId, npc] of Object.entries(npcs)) {
    for (const alias of npc.aliases) {
      if (lower.includes(alias)) {
        return npcId;
      }
    }
  }

  return null;
}

// caretaker general talk function
function handleCaretakerTalk() {
  if (player.location !== "blue corridor") {
    appendMessage("The caretaker isn't here. Try the blue corridor.");
    return;
  }

  // First meeting
  if (!npcs.caretaker.met) {
    dialogue.caretaker.firstMeet.forEach(line => appendMessage(line));
    npcs.caretaker.met = true;
    // update blue corridor description
    const corridorB = rooms["blue corridor"];
    
    corridorB.description.dynamic = "The caretaker is tending to the plants, and they smile at you as you enter the room. ";
    
    return;
  }

  // Check priority conditions
  const match = dialogue.caretaker.conditions.find(c => c.check());
  if (match) {
    appendMessage(match.text);
    if (match.onSay()) match.onSay(); // prevent repeating conditional dialogue
    return;
  }

  // Generic fallback
  const random = Math.floor(Math.random() * dialogue.caretaker.generic.length);
  appendMessage(dialogue.caretaker.generic[random]);
}

// scientist general talk function
function handleScientistTalk() {
  if (player.location !== "fossil exhibit") {
    appendMessage("The scientist isn't here. Try the fossil exhibit.");
    return;
  }

  // First meeting
  if (!npcs.scientist.met) {
    dialogue.scientist.firstMeet.forEach(line => appendMessage(line));
    npcs.scientist.met = true;
    // update fossil exhibit description
    const fossilExhibit = rooms["fossil exhibit"];
    
    fossilExhibit.description.dynamic = "The scientist is still in his corner, muttering to himself quietly as he pores over papers and books. He glances up and nods as you enter the room before returning to his studies. ";
    
    return;
  }

  // Check priority conditions
  const match = dialogue.scientist.conditions.find(c => c.check());
  if (match) {
    appendMessage(match.text);
    if (match.onSay()) match.onSay(); // prevent repeating conditional dialogue
    return;
  }

  // Generic fallback
  const random = Math.floor(Math.random() * dialogue.scientist.generic.length);
  appendMessage(dialogue.scientist.generic[random]);
}

// barista general talk function
function handleBaristaTalk() {
  if (player.location !== "cafe") {
    appendMessage("The barista isn't here. Try the cafe.");
    return;
  }

  // First meeting
  if (!npcs.barista.met) {
    dialogue.barista.firstMeet.forEach(line => appendMessage(line));
    npcs.barista.met = true;
    // update cafe description
    const cafe = rooms["cafe"];
    
    cafe.description.dynamic = "The barista is cleaning some of the equipment behind the counter. She looks over as you enter and smiles, ready to chat or make you a drink. ";
    
    return;
  }

  // Check priority conditions
  const match = dialogue.barista.conditions.find(c => c.check());
  if (match) {
    appendMessage(match.text);
    if (match.onSay()) match.onSay(); // prevent repeating conditional dialogue
    return;
  }

  // Generic fallback
  const random = Math.floor(Math.random() * dialogue.barista.generic.length);
  appendMessage(dialogue.barista.generic[random]);
}

// cafe customer talk function
function handleCustomerTalk() {
  if (!flags.customersPresent && player.location !== "cafe") {
    appendMessage("The place is deserted. If you could find a door to the outside world, somebody might be able to visit.");
    return;
  }
  
  if (player.location !== "cafe") {
    appendMessage("You don't see any customers here. Maybe someone's in the cafe.");
    return;
  }
  
  if (!flags.customersPresent) {
    appendMessage("Although you'd expect a cafe like this to have customers, there's nobody here but you and the barista.");
    return;
  }
  
  // random dialogue line
  const random = Math.floor(Math.random() * dialogue.customer.generic.length);
  appendMessage(dialogue.customer.generic[random]);
}

// visitor talk function
function handleVisitorTalk() {
  if (!flags.visitorsAllowed) {
    appendMessage("The place is deserted. If you could find a door to the outside world, somebody might be able to visit.");
    return;
  }
  
  if (player.location === "art gallery" || player.location === "fossil exhibit" || player.location === "observatory") {
    const random = Math.floor(Math.random() * dialogue.visitor.generic.length);
    appendMessage(dialogue.visitor.generic[random]);
  } else {
    appendMessage("Although you unlocked the doors and people can enter, there are no visitors in this room right now. Try looking in the main exhibits to see if anyone's around.");
  }
}

// caretaker hint function
function caretakerHints() {
  if (player.location !== "blue corridor") {
    appendMessage("The caretaker isn't here. Try the blue corridor.");
    return;
  }
  
  // First meeting
  if (!npcs.caretaker.met) {
    dialogue.caretaker.firstMeet.forEach(line => appendMessage(line));
    npcs.caretaker.met = true;
    // update blue corridor description
    
    const corridorB = rooms["blue corridor"];
    
    corridorB.description.dynamic = "The caretaker is tending to the plants as you enter. They greet you with a smile and nod before returning to their work. ";
    
    return;
  }
  
  // Check priority conditions
  const match = dialogue.caretaker.hints.find(c => c.check());
  if (match) {
    appendMessage(match.text);
    return;
  }
  
  // default when no hint available
  appendMessage("The caretaker says: 'I'm sorry, there's not much I can help you with right now. See if there's anything you can do with what you've already got, I might be able to advise you better later.'");
}

// scientist hint function
function scientistHints() {
  if (player.location !== "fossil exhibit") {
    appendMessage("The scientist isn't here. Try the fossil exhibit.");
    return;
  }
  
  // First meeting
  if (!npcs.scientist.met) {
    dialogue.scientist.firstMeet.forEach(line => appendMessage(line));
    npcs.scientist.met = true;
    // update fossil exhibit description
    const fossilExhibit = rooms["fossil exhibit"];
    
    fossilExhibit.description.dynamic = "The scientist is still in his corner, muttering to himself quietly as he pores over papers and books. He glances up and nods as you enter the room before returning to his studies. ";
  }
  
  // Check priority conditions
  const match = dialogue.scientist.hints.find(c => c.check());
  if (match) {
    appendMessage(match.text);
    return;
  }
  
  // default when no hint available
  appendMessage("The scientist says: 'I can't help you with much for now, I'm afraid. Come back when you've explored the place a little more, and let me know what you've found. I might be able to give you some pointers then.'");
}

// barista hint function
function baristaHints() {
  if (player.location !== "cafe") {
    appendMessage("The barista isn't here. Try the cafe.");
    return;
  }
  
  // First meeting
  if (!npcs.barista.met) {
    dialogue.barista.firstMeet.forEach(line => appendMessage(line));
    npcs.barista.met = true;
    // update cafe description
    const cafe = rooms["cafe"];
    
    cafe.description.dynamic = "The barista is keeping herself busy rearranging the mugs on the counter as you enter. She looks over as the door opens, and smiles brightly. ";
  }
  
  // Check priority conditions
  const match = dialogue.barista.hints.find(c => c.check());
  if (match) {
    appendMessage(match.text);
    return;
  }
  
  // default when no hint available
  appendMessage("The barista says: 'I don't know how much help I can give you just now, lovie. Come back later, I might know a little more about what's giving you grief then. Or you could ask the old caretaker, just outside in the corridor. He's been here a long time and knows the place better than me.'");
}

// npc talk system
function talkTo(npcName) {
  const npc = npcs[npcName];

  if (npcName === "caretaker") {
    handleCaretakerTalk();
    return;
  }

  if (npcName === "barista") {
    handleBaristaTalk();
    return;
  }

  if (npcName === "scientist") {
    handleScientistTalk();
    return;
  }
  
  if (npcName === "customer") {
    handleCustomerTalk();
    return;
  }
  
  if (npcName === "visitor") {
    handleVisitorTalk();
    return;
  }
  
  if (npcName === "puppy") {
	
		npcs.puppy.met = true;
	
    if (flags.befriendedPuppy) {
      appendMessage("The puppy jumps up and licks your hand. 'Woof woof!'");
    } else {
      appendMessage("The puppy seems a little uncertain of you. Maybe if you had a toy he'd be more interested?");
    }
    
    return;
  }
  
}

// npc hint system
function getHint(npcName) {
  const npc = npcs[npcName];

  if (npcName === "caretaker") {
    caretakerHints();
  }

  if (npcName === "barista") {
    baristaHints();
  }

  if (npcName === "scientist") {
    scientistHints();
  }
}

// puppy follows player
function puppyFollow() {
  const follow = npcs.puppy.following;
  
  if (follow) {
    npcs.puppy.location = player.location;
    appendMessage("🐾 The puppy trots after you, proudly carrying his new toy in his mouth.");
    npcLocations.puppy = currentRoom;
    renderMap();
  }
}

// order drinks & food in the cafe
function handleBaristaOrder(item) {
  const order = item.toLowerCase();
  
  if (!order || order === "nothing" || order === "no thanks") {
    appendMessage("The barista says: 'Changed your mind, lovie? I'll be here if you decide you want anything.'");
    npcs.barista.waitingForOrder = false;
    return;
  }

  if (order.includes("coffee")) {
    appendMessage("The barista says: 'One coffee, got it. Just a moment...' She turns to the machine behind her, and prepares you a steaming cup of coffee. 'On the house, lovie. Enjoy!");
    inventory.push("coffee");
    npcs.barista.waitingForOrder = false;
  } else if (order.includes("tea")) {
    appendMessage("The barista says: 'One tea, got it. Just a moment...' She turns to the machine behind her, and prepares you a steaming cup of tea. 'On the house, lovie. Enjoy!'");
    inventory.push("tea");
    npcs.barista.waitingForOrder = false;
  } else if (order.includes("juice")) {
    appendMessage("The barista says: 'One juice, got it. Just a moment...' She goes over to the fridge behind her, and pours you a glass of chilled juice. 'On the house, lovie. Enjoy!'");
    inventory.push("juice");
    npcs.barista.waitingForOrder = false;
  } else if (order.includes("soda")) {
    appendMessage("The barista says: 'One soda, got it. Just a moment...' She goes over to the fridge behind her, and pours you a glass of chilled soda. 'On the house, lovie. Enjoy!'");
    inventory.push("soda");
    npcs.barista.waitingForOrder = false;
  } else if (order.includes("water")) {
    appendMessage("The barista says: 'Simple tastes, lovie? I don't blame you. A nice glass of fresh water is just what you need sometimes.' She pours you a tall glass of clear, cool water. 'Here you go. Enjoy!'");
    inventory.push("water");
    npcs.barista.waitingForOrder = false;
  } else if (order.includes("cake")) {
    appendMessage("The barista says: 'Coming right up.' She disappears through a small door behind the counter, and returns with a delicious slice of cake. 'Here you go, lovie. On the house. Enjoy!'");
    inventory.push("cake");
    npcs.barista.waitingForOrder = false;
  } else {
	  appendMessage("The barista says: 'Oh, I'm sorry lovie, I don't have any of that. Talk to me again if you want a drink or a bit of cake.'");
    npcs.barista.waitingForOrder = false;
  }
}

// npc dialogue tables
const dialogue = {
  caretaker: {
    firstMeet: [
      "You approach the sweeping person cautiously. They smile and nod, immediately setting you at ease. The person says: 'Hello there! It's been a while since anyone visited. I'm the caretaker around here, so if you run into any problems, come and ask me. I can usually figure out something helpful.'"
    ],
    conditions: [
      {
        // puppy name reveal
        check: () => npcs.puppy.following && !flags.learnedPuppyName,
        text: "The caretaker says: 'I see you met Digger! He's a good dog, and great at digging up secrets.'",
        onSay: () => {
          flags.learnedPuppyName = true;
        }
      },
      {
        // injury hint
        check: () => player.isInjured,
        text: "The caretaker says: 'Ow, that cut looks nasty. Been poking about in the yard? There's a first aid kit in the cafe you could use. Pretty basic, but it'll get the job done.' They point to the north east door."
      },
			{
        // toolbox hint
        check: () => !flags.givenToolbox,
        text: "The caretaker says: 'Say, if you find my toolbox anywhere around here, would you mind bringing it to me? I think I left it in the yard somewhere on the west side of the complex. You'll need something to carry it in, it's a pretty heavy old thing. A handcart would do the trick.'"
      },
      {
        // toolbox ask
        check: () => flags.carryingToolbox,
        text: "The caretaker says: 'Oh, you found my old toolbox. I wondered where I left that. If you're done with it, would you mind giving it back? I could do with getting some maintenance done around here.'"
      },
      {
        // thank player for returning toolbox
        check: () => flags.givenToolbox && !npcs.caretaker.playerThanked,
        text: "The caretaker says: 'Thanks again for finding my toolbox. I got that sink fixed in the bathroom, if you need to wash your hands for any reason.'",
        onSay: () => {
          npcs.caretaker.playerThanked = true;
        }
      },
      {
        // hidden stores comment
        check: () => flags.shelvesMoved && !npcs.caretaker.shelfCommentSaid,
        text: "The caretaker says: 'You managed to move that heavy shelving unit in my cupboard? Well done! Did you manage to get the old door open? Could be all sorts of interesting things in there.'",
        onSay: () => {
          npcs.caretaker.shelfCommentSaid = true;
        }
      },
      {
        // garden comment
        check: () => flags.gardenOpen && !npcs.caretaker.gardenCommentSaid,
        text: "The caretaker says: 'You managed to get that old garden unlocked, then? It was beautiful, once. A bit overgrown now, but nothing I can't fix with time, now the door's open.'",
        onSay: () => {
          npcs.caretaker.gardenCommentSaid = true;
        }
      },
      {
        // secret lab comment
        check: () => flags.discoveredLab && !npcs.caretaker.labCommentSaid,
        text: "The caretaker says: 'Ah, you've uncovered one of this place's secrets! Good work, friend. Keep at it, you'll find your way out of here in no time.'",
        onSay: () => {
          npcs.caretaker.labCommentSaid = true;
        }
      },
    ],
    hints: [
      {
        check: () => !flags.givenToolbox,
        text: "The caretaker says: 'You know, I had a spare lever for the observatory mechanisms in my toolbox. If you can bring it to me, I can give you the lever. I'm pretty sure I left my toolbox in the yard, to the west of the art gallery. You'll need something to help you carry it, it's a heavy old thing.'",
      },
      {
        check: () => inventory.includes("lever") && (!flags.leverPlaced || !flags.discoveredLab),
        text: "The caretaker says: 'The scientist was saying the other day that he couldn't get into his lab anymore. Maybe that's what the old lever I gave you opens? Give it a pull and see what happens.'",
      },
      {
        check: () => flags.gardenOpen && !inventory.includes("ironKey"),
        text: "The caretaker says: 'I see the garden door's unlocked again. Good to see it, that was a lovely old place to sit and collect your thoughts. If you're feeling stuck, I'd go and have a good look around there and see if it knocks something loose for you.'",
      },
      {
        check: () => !flags.shelvesMoved && inventory.includes("ironKey"),
        text: "The caretaker says: 'I could swear there used to be an extra storage room at the back of my cleaning cupboard, just off the red corridor. It's like an extra set of shelves appeared one day and blocked it off. If only I had the strength to drag them out of the way...'",
      },
      {
        check: () => !flags.smallKeyholeRevealed && npcs.puppy.following && inventory.includes("smallKey"),
        text: "The caretaker says: 'You found a tiny key labelled 'exit'? Hmm. Sounds promising, but there's no keyhole in the white room that I've ever found. Did you try examining everything closely? Your eyes are probably better than mine. Or maybe Digger there could detect something we're all missing.'",
      },
      {
        check: () => !flags.smallKeyholeRevealed && !npcs.puppy.following && inventory.includes("smallKey"),
        text: "The caretaker says: 'You found a tiny key labelled 'exit'? Hmm. Sounds promising, but there's no keyhole in the white room that I've ever found. Digger, the puppy who lives out in the yard, might be able to find something we can't. Give him a toy and he'll be happy to follow you anywhere.'",
      },
      {
        check: () => flags.carryingBookshelf,
        text: "The caretaker says: 'That's a sturdy bookshelf you have there. You know, the scientist has books scattered all over the floor in the fossil exhibit. Maybe he'd appreciate somewhere to keep them.'"
      },
      {
        check: () => flags.carryingBirdhouse,
        text: "The caretaker says: 'Well, that's a very nice birdhouse. Simple, yet effective. There's a garden just through the south east door here, if you can get the door unlocked. There must be some birds out there who would enjoy your work.'"
      },
      {
        check: () => flags.carryingToolbox,
        text: "The caretaker says: 'You found my toolbox! I've been missing that for a while, and between you and me, I'm getting a little behind on the maintenance work. Would you mind handing it over? I'm sure I can find something useful for you in exchange.'"
      }
    ],
    generic: [
      "The caretaker says: 'Hello again. How are you doing?'",
      "The caretaker says: 'The barista was talking about making a birdhouse for the garden. I think there was a design sketch for something like that over in the workshop, if you wanted to help out.'",
      "The caretaker says: 'I've heard there's a beautiful glass corridor somewhere in this building, but I've never been able to find it. If you stumble across it, would you let me know? It's probably in dire need of a clean by now.'",
      "The caretaker says: 'You know, there are a few loose notes floating around the place. Maybe if you look closely at things, or look high up, you could find some.'",
      "The caretaker says: 'Have you been to the observatory yet? It's just north of here. Fascinating room, even if the equipment's a little old.'",
			"The caretaker says: 'The scientist has been complaining about having nowhere to keep all his books lately. He just leaves them scattered all over the floor in the fossil exhibit. A bookshelf might help him keep them tidier.'"
    ]
  },
  scientist: {
    firstMeet: [
      "You approach the man on the floor, and he looks up from his books, slightly startled by your sudden appearance. The man says: 'Ah, a new face! Pleasure to meet you. They just call me the scientist, I've been here long enough I don't remember my real name anymore.'"
    ],
    conditions: [
      {
        // snowglobe trade hint
        check: () => inventory.includes("snowglobe"),
        text: "The scientist says: 'Say, if you come across a snowglobe anywhere around here, would you bring it to me? I don't have a lot, but I'm sure I could find something useful to give you for one.'"
      },
      {
        // reaction to secret room
        check: () => flags.bookshelfPlaced && !npcs.scientist.shelfCommentSaid,
        text: "The scientist says: 'Well I never! A secret room just off this exhibit, and none of us knew. I wonder how putting that shelf down triggered the door opening?'",
        onSay: () => {
          npcs.scientist.shelfCommentSaid = true;
        }
      },
      {
        // secret lab reaction
        check: () => flags.discoveredLab && !npcs.scientist.labCommentSaid,
        text: "The scientist says: 'Oh, you managed to get my lab open? Good work! I thought that was sealed up forever.'",
        onSay: () => {
          npcs.scientist.labCommentSaid = true;
        }
      },
    ],
    hints: [
      {
        check: () => !flags.givenSnowglobe,
        text: "The scientist says: 'I've found a few strange things in my time here. Most of them I've found a use for, but I can't figure out this little crystal for the life of me. Tell you what - I'll trade you for a snowglobe. I always liked those things, and maybe you can figure out what the crystal does.'",
      },
      {
        check: () => flags.observatoryVisited && (!flags.leverPlaced || !flags.discoveredLab),
        text: "The scientist says: 'You've visited the observatory, you say? It's a wonderful old room, isn't it? I used to be able to access my lab through there, but the door sealed itself a while back and I couldn't get it open again. Maybe there's something you could do with those mechanisms along the walls? I'd really appreciate being able to get back to my research in there.'",
      },
      {
        check: () => !flags.shelvesMoved && inventory.includes("ironKey"),
        text: "The scientist says: 'I heard the caretaker complaining about losing half their storage space a while back. Something about a heavy shelf in the way? You look strong enough to move them, if you feel like helping out. The cupboard's just off the red corridor.'",
      },
      {
        check: () => !flags.smallKeyholeRevealed && npcs.puppy.following && inventory.includes("smallKey"),
        text: "The scientist says: 'There's a key for the exit after all? Let me take a look... It says white room here, but there's no keyhole in the white room that I've ever found. Maybe your furry friend there could sniff something out.'",
      },
      {
        check: () => !flags.smallKeyholeRevealed && !npcs.puppy.following && inventory.includes("smallKey"),
        text: "The scientist says: 'There's a key for the exit after all? Let me take a look... It says white room here, but there's no keyhole in the white room that I've ever found. Maybe that puppy that lives in the yard could sniff something out. He'd probably follow you back here if you give him a dog toy, there should be one in the gift shop.'",
      },
      {
        check: () => flags.carryingBookshelf,
        text: "The scientist says: 'That is a fine-looking bookshelf you have there. If you don't have any other plans for it, would you mind leaving it here for me? I could do with getting some of these books off the floor.'"
      },
      {
        check: () => flags.carryingBirdhouse,
        text: "The scientist says: 'Is that a birdhouse? There's a certain rustic charm to it, I suppose. I heard the barista talking about some birds nesting in the garden outside the cafe, maybe they'd appreciate your creation there.'"
      },
      {
        check: () => flags.carryingToolbox,
        text: "The scientist says: 'You found the caretaker's toolbox, I see. They'll be pleased, if you give it back to them. Check the blue corridor, just east of the art gallery. They're usually around there somewhere.'"
      }
    ],
    generic: [
      "The scientist says: 'Hello again. How are you doing?'",
      "The scientist says: 'These fossils are quite fascinating, don't you think? I could study them forever.'",
      "The scientist says: 'I gave up looking for a way out some time ago. Being here is far more peaceful than my old life. You keep at it, though! I'm sure you'll find one eventually.'",
      "The scientist says: 'Have you found the observatory yet? I used to spend a fair amount of time in there, watching the skies.'",
			"The scientist says: 'Oh, where did I leave that book? It's a wonder I can ever find any of them in this chaos. If only I had a shelf to organise them on properly...'"
    ]
  },
  barista: {
    firstMeet: [
      "You smile at the barista, glad to see a friendly face in this odd place. She smiles back and says: 'Hello, lovie! You're the first customer I've had in ages! I barely even see the caretaker or the scientist these days. You let me know if I can get you anything to eat or drink, or if you just want a litle chitchat.'"
    ],
    conditions: [
      {
        // birdhouse placement hint
        check: () => inventory.includes("birdhouse") && flags.gardenOpen,
        text: "The barista says: 'Oh, that's a lovely little birdhouse you've got there. Did you build that yourself? I'm sure the birds out in the garden would love it, if you want to leave it out there for them. They might even give you a little present in return.'"
      },
      {
        // reaction to birdhouse
        check: () => flags.birdhousePlaced && !npcs.barista.birdhouseCommentSaid,
        text: "The barista says: 'That looks just right out there, lovie. Thank you for helping out... oh, I see the birds thanked you too! That's an odd little thing, isn't it? I wonder where it belongs?'",
        onSay: () => {
          npcs.barista.birdhouseCommentSaid = true;
        }
      },
      {
        // garden unlocked reaction
        check: () => flags.gardenOpen && !npcs.barista.gardenCommentSaid,
        text: "The barista says: 'Oh, thank you for unlocking the garden, lovie. I'm not sure how that managed to close itself up, but it's nice to be able to spend time out there again.'",
        onSay: () => {
          npcs.barista.gardenCommentSaid = true;
        }
      },
      {
        // customer arrival reaction
        check: () => flags.customersPresent,
        text: "The barista says: 'It's so nice to see this place busy again. Thank you for getting that old door open, lovie.'",
        onSay: () => {
          npcs.barista.happyToServe = true;
        }
      }
    ],
    hints: [
      {
        check: () => flags.gardenOpen && !inventory.includes("ironKey"),
        text: "The barista says: 'Feeling a bit stuck, lovie? I know what that's like. Sometimes I find having a sit down in the garden helps me think better. Why don't you pop on out there and relax for a moment on that old bench? I promise it's comfier than it looks!'",
      },
      {
        check: () => !flags.shelvesMoved && inventory.includes("ironKey"),
        text: "The barista says: 'The last time the caretaker was in here, lovie, they were talking about some big heavy shelf that cut off their back storage room. Now, I'm not entirely sure what they meant, but maybe you could figure it out? The cleaning cupboard is just off the red corridor, if you fancy taking a look at what's going on in there.'",
      },
      {
        check: () => !flags.smallKeyholeRevealed && npcs.puppy.following && inventory.includes("smallKey"),
        text: "The barista says: 'A tiny key labelled 'exit'? Oh, that's such a dear little thing, it almost looks like it would fit a dollhouse. I'm not sure where it might go, I've never come across a keyhole that small. Maybe your puppy there might be able to sniff out the keyhole, if you can't quite spot it? Pop over to the white room and have a real close look at things.'",
      },
      {
        check: () => !flags.smallKeyholeRevealed && !npcs.puppy.following && inventory.includes("smallKey"),
        text: "The barista says: 'A tiny key labelled 'exit'? Oh, that's such a dear little thing, it almost looks like it would fit a dollhouse. I'm not sure where it might go, I've never come across a keyhole that small. I'm not sure how you'd go about finding it... the puppy from the old yard might be able to sniff out the keyhole, if you can't quite spot it? Give the little guy a dog toy, he'll follow a friend anywhere.'",
      },
      {
        check: () => flags.carryingBookshelf,
        text: "The barista says: 'Oh, that's a nice bookshelf, lovie. You're quite the handy one, aren't you? You know, the scientist has been piling books on the floor in the fossil exhibit for ages. I'm sure he'd appreciate somewhere to keep them tidy.'"
      },
      {
        check: () => flags.carryingBirdhouse,
        text: "The barista says: 'What a lovely little birdhouse! Did you make that? Well done, lovie. I'm sure the birds out in the garden would appreciate that, if you wanted to leave it out there for them.'"
      },
      {
        check: () => flags.carryingToolbox,
        text: "The barista says: 'That looks like the caretaker's toolbox. They'll be most pleased to get that back, lovie. Pop back out to the blue corridor and give it to them, I imagine they'll find something useful to give you in return.'"
      }
    ],
    generic: [
      "The barista says: 'Hello again lovie!'",
      "The barista says: 'You know, a nice bunch of flowers would look pretty on the counter here. Maybe I'll pop out in the garden and see what's growing.'",
      "The barista says: 'Have you found anything interesting while you've been wandering about here? There's all sorts of secrets hidden if you look close enough. Mind what you touch, though, you wouldn't want to damage yourself lovie!'",
      "The barista says: 'When I was your age, I used to love jumping about. I'd find all kinds of interesting things hidden up high.'"
    ]
  },
  customer: {
    generic: [
      "The cafe customer says: 'Hello there.'",
      "The cafe customer says: 'Nice place, isn't it?'",
      "The cafe customer says: 'I wonder when this place opened?'",
      "The cafe customer says: 'Hello.'",
      "The cafe customer says: 'This is an odd sort of museum, don't you think?'",
      "The cafe customer says: 'Hm?'",
      "The cafe customer says: 'Sorry, can't talk, I'm busy.'",
      "The cafe customer says: 'The cakes here are great!'",
      "The cafe customer says: 'The barista is very friendly, but I haven't seen any other staff around here, have you?'",
      "The cafe customer says: 'I'm glad this place is open again. It was such a shame when they closed it down.'"
    ]
  },
  visitor: {
    generic: [
      "The visitor says: 'Hello.'",
      "The visitor says: 'Hello there.'",
      "The visitor says: 'These exhibits are quite odd, aren't they?'",
      "The visitor says: 'How long has this place been here?'",
      "The visitor says: 'There's a local rumour that this place is really an alien spaceship. I never believed that, though.'",
      "The visitor says: 'The telescope in the observatory looks really old. I wonder how long ago it was installed?'",
      "The visitor says: 'Do you know who painted all those pictures in the gallery? I can't find any artist names anywhere.'",
      "The visitor says: 'Poking the fossils is fun! Have you tried it?'",
      "The visitor says: 'This place wasn't in any of the tourism brochures...'",
      "The visitor says: 'Has anyone ever seen a curator around here? Anybody who might be in charge of the place?'",
      "The visitor says: 'It's good to see this old place reopened. I hope it doesn't disappear on us again.'"
    ]
  }
};

// NPC exit reaction dialogue

// caretaker
const caretakerExitReactions = {
  glass: [
    "The caretaker’s eyes light up. They say: 'You found an exit? You're sure? A door in the glass corridor... I'd heard about that corridor, but I never could find it. You say it was behind a secret door in the white room? Well, the surprises never end around here, do they? I'll finish up here and make my way out soon, then. Thank you, friend.'"
  ],
  teleporter: [
    "The caretaker snorts softly. They say: 'You repaired a teleporter? My goodness, that sounds like hard work. I wonder if that's how we all ended up here, somehow pulled in by the broken system? Well, if you're sure it's properly fixed, I suppose it will do. I don't really trust any of that high-tech stuff, though. A regular old door would make me more comfortable, if you find one.'"
  ],
  both: [
    "The caretaker nearly drops their broom. They say: 'Two exits? TWO? Well, look at you, overachieving. Good work, friend, very good work. There's a door through the glass corridor, and a teleporter system that you fixed? No offence to your repair skills, but I'll take that boring old door, I think. All that techy stuff never quite sat right with me.'"
  ]
};

// scientist
const scientistExitReactions = {
  glass: [
    "The scientist nods politely. He says: 'An exit through a glass corridor, you say? I'm sure that's very nice, but I found bits of an old instruction booklet for a teleportation system somewhere here. I wouldn't mind seeing that, if you find anything like it.'"
  ],
  teleporter: [
    "The scientist’s eyes go wide. He says: 'You found a teleportation system, and managed to repair it? Well done, indeed! Just off this room, you say? I'll certainly take a look at that before you leave, then. I simply can't pass up the chance to study something like that!'"
  ],
  both: [
    "The scientist's full attention turns to you for the first time. He says: 'Did I hear that right? You found not one, but two ways out of here? I'm very glad you ended up here, then. The caretaker and I must have spent years searching and found nothing. Have you let them know about that glass corridor? They'd be pleased to know they can simply walk out of here. I think I'll take a closer look at that teleportation system.'"
  ]
};

// barista
const baristaExitReactions = {
  glass: [
    "The barista smiles warmly. She says: 'You found an exit, lovie? Good for you! It sounds like a pretty corridor, too. I'm happy sticking around here, but the caretaker might like to know, if you haven't already told them.'"
  ],
  teleporter: [
    "The barista smiles and nods. She says: 'A teleporter, lovie? That's certainly a turn-up for the books. I'm glad you've found yourself a way out, but I'm quite happy to stay here. It sounds like something the scientist might be interested in, though.'"
  ],
  both: [
    "The barista looks surprised. She says: 'Two ways out? All the time those other two spent looking, and they couldn't find one! Well done, lovie. A fancy teleporter for the scientist to study, and a nice normal door for the caretaker. Seems like you've managed to wrap everything up nicely! You go on ahead though, I'm quite happy here. Maybe now there's a way in and out of this place, you could come back and visit some time?'"
  ]
};

// exit reaction helper
function getExitStatus() {
  return {
    glass: flags.exitUnlocked,
    teleporter: flags.teleporterReady,
    both: flags.exitUnlocked && flags.teleporterReady
  };
}

// manages NPCs exit reactions
function tellNpcAboutExit(npcName) {
  const exits = getExitStatus();
  const npc = npcName;

  if (!exits.glass && !exits.teleporter) {
    appendMessage("You don’t actually know of a way out yet.");
    return;
  }

  let reactions;
  let exitPreference;

  switch (npcName) {
    case "caretaker":
      reactions = caretakerExitReactions;
      exitPreference = "glass";
      break;
    case "scientist":
      reactions = scientistExitReactions;
      exitPreference = "teleport";
      break;
    case "barista":
      reactions = baristaExitReactions;
      exitPreference = "none";
      break;
    default:
      return;
  }

  // preference order differs per NPC
  if (exits.both && reactions.both) {
    appendMessage(reactions.both[0]);
    return;
  }
  
  if (exits.teleporter && reactions.teleporter && (exitPreference === "teleport" || !flags.exitUnlocked)) {
    appendMessage(reactions.teleporter[0]);
    return;
  } // figure out how to make this condition work: (exitPreference === "teleport" || !flags.exitUnlocked)

  if (exits.glass && reactions.glass && (exitPreference === "glass" || !flags.teleporterReady)) {
    appendMessage(reactions.glass[0]);
    return;
  } // also this (exitPreference === "glass" || !flags.teleporterReady)

  appendMessage("They listen, but don’t seem to have much to say about it.");
}

// post exit-unlocking actions
// moves customers to the cafe once exit is unlocked
function spawnCafeCustomers() {
  flags.customersPresent = true;
  
  if (player.location === "cafe"){
    appendMessage("You hear footsteps outside in the blue corridor. As you turn towards the sound, the door gently swings open, revealing a couple of curious strangers. They must have wandered in through the glass corridor exit you unlocked.");
    appendMessage("The barista smiles at the newcomers, happy to have customers after so long tending an empty cafe.");
  }

  // update cafe description
  const cafe = rooms["cafe"];
  
  cafe.description.dynamic = "The cafe is much livelier with a few customers sitting at the tables. The barista seems happier, and you can hear some faint, pleasant yet unidentifiable music coming from a hidden speaker. Far from the abandoned and empty place you first entered, this is somewhere you could happily spend an hour relaxing. ";
}

// adds visitors in art gallery, fossil exhibit and observatory after exit is unlocked
function spawnVisitors() {
  flags.visitorsAllowed = true;
  
  if (player.location === "art gallery" || player.location === "fossil exhibit" || player.location === "observatory" || player.location === "gift shop") {
    appendMessage("You hear some echoing footsteps in the room, and turn to see a few new people wandering in. They must have come in through the glass corridor exit you unlocked.");
  }

  // update fossil exhibit, art gallery, gift shop and observatory dynamic descriptions
  const fossilExhibit = rooms["fossil exhibit"];
  const artGallery = rooms["art gallery"];
  const observatory = rooms["observatory"];
  const giftShop = rooms["gift shop"];
  
  if (!flags.bookshelfPlaced) {
    fossilExhibit.description.dynamic = "People are clustered around the larger, more impressive fossils. A few are reading the signs scattered around, and others are simply wandering between the displays. The scientist looks slightly annoyed as he tries to keep his books from being kicked. Maybe he'd appreciate a bookshelf to keep them safe... ";
  } else {
    fossilExhibit.description.dynamic = "People are clustered around the larger, more impressive fossils. A few are reading the signs scattered around, and others are simply wandering between the displays. The scientist seems harried, but is managing to keep his little corner clear. You're glad you made him that bookshelf before these visitors arrived. ";
  }
  
  artGallery.description.dynamic = "With the arrival of new visitors, this gallery seems less unnerving. Even the portraits seem happier. The gentle lighting and soft murmur of people have turned this into a relaxing place to spend time. ";
  
  observatory.description.dynamic = "A handful of visitors now occupy the observatory. The telescopes squeak, their moving parts protesting the use after however long they remained stationary. ";
  
  giftShop.description.dynamic = "The once dusty and forgotten gift shop seems cleaner now. A couple of visitors wander between the shelves, looking at the trinkets and souvenirs. The automated check out has powered up, the screen showing a cheerful 'WELCOME!' to potential customers. ";
}

/* NPCs start to move towards their preferred exits - NOT FINISHED YET!

const exitRoutes = {
  scientistToTeleporter: [
    "fossil exhibit",
    "secret room"
  ],

  caretakerToDoor: [
    "blue corridor",
    "art gallery",
    "red corridor",
    "fossil exhibit",
    "white room",
    "glass corridor"
  ]
};

*/

// wait functions
// player can wait somewhere
function playerWait() {
  const idleMessages = [
    "You take a moment to yourself, doing nothing in particular.",
    "You wait around, staring into space for a moment.",
    "You're not sure what you're waiting for, but you wait anyway.",
    "You space out for a moment.",
  ];
  
  const text = Math.floor(Math.random() * idleMessages.length);
  appendMessage(idleMessages[text]);
}

// tell the puppy to wait somewhere
function puppyWait() {
  if (!npcs.puppy.following) {
    if (npcs.puppy.location === player.location) {
      appendMessage("The puppy is already waiting here, contentedly chewing on the toy you gave him.");
    } else {
      appendMessage("The puppy isn't here right now.");
    }
    return;
  }
  
  appendMessage("You tell the puppy to wait here. He barks, and sits obediently, wagging his tail.");
  npcs.puppy.following = false;
  npcs.puppy.location = player.location;
}

// tell the puppy to follow again
function puppyFollowAgain() {
  if (!flags.befriendedPuppy) {
    appendMessage("The puppy seems a little unsure of you. Try giving him a dog toy to make friends!");
    return;
  }
  
  if (npcs.puppy.location !== player.location) {
    appendMessage("You're not near the puppy right now. Head back to where you left him.");
    return;
  }
  
  if (npcs.puppy.following) {
    appendMessage("The puppy is already by your side.");
    return;
  }

  appendMessage("You tell the puppy to follow you again. He trots over to you, carrying the toy you gave him earlier.");
  npcs.puppy.following = true;
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
        appendMessage("You build a simple, yet sturdy cart. It could carry something heavy or bulky.");
        player.builtCart = true;
        autoSave("Gained the ability to transport large or heavy objects");
        inventory.push("cart");
      } else {
        appendMessage("You already built a cart.");
      }
      break;

    case "birdhouse":
      if (!player.builtBirdhouse) {
        appendMessage("You build a small, standing birdhouse. It might look pretty in a garden.");
        player.builtBirdhouse = true;
        items.birdhouse.location = "workshop";
      } else {
        appendMessage("You already built a birdhouse.");
      }
      break;

    case "shelf":
    case "bookshelf":
      if (!player.builtShelf) {
        appendMessage("You build a tall shelving unit. It would be good for books, or someone could make a display on it.");
        player.builtShelf = true;
        items.bookshelf.location = "workshop";
      } else {
        appendMessage("You already built a bookshelf.");
      }
      break;

    default:
      appendMessage("You don’t see the right equipment to make that.");
  }
}

// place bookshelf in fossil exhibit for secret ending puzzle
function placeBookshelf() {
  if (player.location !== "fossil exhibit") {
    appendMessage("There's nowhere suitable to put the bookshelf here.");
    return;
  }

  if (!inventory.includes("bookshelf")) {
    appendMessage("You don't have a bookshelf to place.");
    return;
  }

  if (flags.bookshelfPlaced) {
    appendMessage("The bookshelf is already in place.");
    return;
  }

  flags.bookshelfPlaced = true;
  flags.carryingBookshelf = false;
  inventory = inventory.filter(i => i !== "bookshelf"); // remove from inventory

  appendMessage("You place the tall bookshelf against the wall next to the scientist. He gives you a grateful nod.");
  appendMessage("As you stand back, you hear a click to the south. Part of the wall slides open, revealing a hidden doorway.");

  // update fossil exhibit description
  const fossilExhibit = rooms["fossil exhibit"];
  
  fossilExhibit.description.dynamic = "The books that were once scattered over the floor in disarray now sit neatly on the shelf you built. From the new door to the south, a faint glow suggests something worth investigating. ";
  fossilExhibit.description.doorList = "The gift shop is to the east. The door to the west leads back to the white room, and the north exit leads to the red corridor.";

  // open the secret exit
  rooms["fossil exhibit"].exits.south = "secret room";
  
  // autosave at this point
  autoSave("Unlocked the secret exhibit");
}

// place birdhouse in garden to get gem for secret ending puzzle
function placeBirdhouse() {
  if (player.location !== "garden") {
    appendMessage("There's nowhere suitable to put the birdhouse here.");
    return;
  }

  if (!inventory.includes("birdhouse")) {
    appendMessage("You don't have a birdhouse to place.");
    return;
  }

  if (flags.birdhousePlaced) {
    appendMessage("The birdhouse is already in place.");
    return;
  }

  flags.birdhousePlaced = true;
  flags.carryingBirdhouse = false;
  inventory = inventory.filter(i => i !== "birdhouse"); // remove from inventory

  appendMessage("You place the birdhouse in a nice corner of the garden. It seems like it belongs there.");
  appendMessage("A bird lands on the perch almost immediately, dropping a small, shiny black metal object. You pick it up, thinking anything could be useful here.");

  // update garden description
  const garden = rooms["garden"];
  
  garden.description.dynamic = "The birdhouse you built looks rather pretty now it's in place. A small bird is perched on the roof, preening its feathers. ";

  // add battery to inventory
  inventory.push("battery");
  
  // autosave at this point
  autoSave("Earned the gratitude of local birds");
}

function dig() {
  if (player.location === "garden" && npcs.puppy.following && !inventory.includes("ironKey")) {
    appendMessage("You tell your loyal companion to dig in the spot he seems interested in. He digs a hole, and comes to you with a sturdy iron key. You take the key and give him a pat on the head.");
    inventory.push("ironKey");
  } else if (player.location === "garden" && !npcs.puppy.following) {
    appendMessage("You can't dig by yourself. You need some kind of digging expert to help you.");
  } else if (player.location === "white room" && npcs.puppy.following && !flags.smallKeyholeRevealed) {
    appendMessage("You tell your furry friend to dig, thinking he might be able to reveal a secret hidden under or behind something. He barks and scrabbles at a stone leg of that old bench, dislodging a few chips of the worn stone. You take a close look, and spot a tiny keyhole that almost looks like one of the pockmarks in the rock. A tiny key might fit...");
    flags.smallKeyholeRevealed = true;
    autoSave("Digger revealed the small keyhole");
  } else {
    appendMessage("There's nothing to dig up here.");
  }
}

// use the lever in the observatory - superseded by general useItem function
function pullLever() {
  if (player.location !== "observatory") {
    appendMessage("There’s no lever here.");
    return;
  } else if (inventory.includes("lever") && !flags.leverPlaced) {
    appendMessage("You need to put the lever in the mechanism first.");
  } else if (flags.leverPlaced && !flags.discoveredLab) {
    appendMessage("You pull the newly placed lever. Clicking and grinding noises travel through the walls, and a hidden panel swings open in the south west corner.");
    flags.discoveredLab = true;
    autoSave("Unlocked the secret lab");

    // update observatory description
    const observatory = rooms["observatory"];
    
    observatory.description.dynamic = "The mechanisms along the west wall are a little less dusty now, and the lever you placed shines like new. You wonder if the caretaker has been in and cleaned the place up a little. ";
    observatory.description.doorList = "A door to the south east leads back to the blue corridor, and the now open door to the south west leads to the hidden lab.";
    
    // unlocks the secret lab exit
    const obs = rooms["observatory"];
    obs.exits["south west"] = "secret lab";
    
    // adds the lab to the minimap
    discoveredRooms.add("secret lab");
    appendMessage("A hidden section of the map reveals itself.");
  } else if (flags.discoveredLab) {
    appendMessage("The lever’s already done its job.");
  } else {
    appendMessage("You don’t have a lever to use.");
  }
}

// player moves the shelves in the cleaners store
function moveShelf() {
  if (player.location !== "cleaners store") {
    appendMessage("There are no shelves here to move.");
    return;
  }

  if (flags.shelvesMoved) {
    appendMessage("You already moved the shelves.");
    return;
  }

  if (player.isInjured) {
    appendMessage("You try to push the shelves aside, but your injured arm lets you down. Maybe there’s a first aid kit around somewhere?");
    return;
  }

  if (!inventory.includes("ironKey")) {
    appendMessage("There's no need to move those yet.");
    return;
  }

  appendMessage("You push the shelf aside, revealing a hidden door with a rusty iron keyhole. The key you found in the garden looks like it fits.");
  flags.shelvesMoved = true;
  // update cleaners store description
  const storeroom = rooms["cleaners store"];
  
  storeroom.description.dynamic = "The shelves that once sat along the east wall now stick out at an angle, making the small room awkward to move around in. The door behind them is much more obvious now. You wonder how long it was hidden back there before you thought to move the shelves. ";
  storeroom.description.doorList = "A door to the west leads back to the red corridor, and the locked door to the east is waiting for a key.";

}

// secret teleport ending
function teleportEnding() {
  if (player.location !== "secret room") {
    appendMessage("There’s nothing like that to press here.");
    return;
  }

  if (!flags.teleGemPlaced || !flags.batteryPlaced) {
    appendMessage("You press against the crystal, but nothing happens. It seems the system isn’t fully powered yet.");
    return;
  }

  appendMessage("You place your hand on the glowing crystal and press gently. The circuits beneath your feet grow warmer, and the crystals flash with bright pulses of strange light.");

  appendMessage("When the light fades, you find yourself outside in the fresh air. You made it out! Now you just need to figure out where you are, and how to get home... that shouldn't be too hard though... right?");
  
  appendMessage("~~~ 🏆 YOU WIN! 🏆 ~~~");

  flags.gameWin = true;
}

// ~~~~~~~~~~~~~~~~~~~~~~~
// INVENTORY + ITEM SYSTEM
// ~~~~~~~~~~~~~~~~~~~~~~~

// obtainable items
const items = {
  lever: {
    id: "lever",
    name: "lever",
    aliases: ["lever", "metal lever"],
    description: "A sturdy lever that probably belongs to some machinery.",
    location: "null",
    pickupable: true,
    droppable: false,
    usable: true,
    onUse: () => { // use lever logic
      if (player.location !== "observatory") {
        appendMessage("There’s nowhere to use a lever here.");
        return;
      }

      if (inventory.includes("lever") && !flags.leverPlaced) {
        appendMessage("You put the lever back in the mechanism, hearing a satisfying click as it finds its place.");
        inventory = inventory.filter(i => i !== "lever");
        flags.leverPlaced = true;
        // update observatory description
        const obs = rooms["observatory"];
        
        obs.description.dynamic = "On the west wall among the other old mechanisms, the lever you placed shines in the light from above, waiting to be pulled. ";
      } else if (flags.leverPlaced && !flags.discoveredLab) {
        appendMessage("You already put the lever where it belongs, time to pull it and see what happens.");
      } else {
        appendMessage("You don’t have a lever to use.");
      }
    }
  },
  keyring: {
    id: "keyring",
    name: "keyring",
    aliases: ["keyring", "keychain"],
    description: "A plain leather keyring.",
    location: "gift shop",
    pickupable: true,
    droppable: true,
    usable: false,
  },
  dogToy: {
    id: "dogToy",
    name: "dog toy",
    aliases: ["dog toy", "squeaky dog toy", "chew toy"],
    description: "A brightly coloured squeaky dog toy.",
    location: "gift shop",
    pickupable: true,
    droppable: false,
    usable: false,
    giveableTo: "puppy",
    onGive: () => {
      appendMessage("The puppy barks excitedly and chews on the toy for a moment. Looks like you gained a new friend!");
      flags.befriendedPuppy = true;
      npcs.puppy.following = true;
    }
  },
  snowglobe: {
    id: "snowglobe",
    name: "snowglobe",
    aliases: ["snowglobe", "snow globe", "snowstorm", "snowdome", "snow dome"],
    description: "A small and intricate snowglobe. The cottage inside reminds you of home, somehow.",
    location: "gift shop",
    pickupable: true,
    droppable: true,
    usable: false,
    giveableTo: "scientist",
    onGive: () => {
      appendMessage("The scientist says: 'Thank you, I was looking for one of these. Here, I've been trying to work out where this goes, but you might have better luck.'");
      inventory.push("teleGem");
      appendMessage("The scientist hands you a strange green gem. It seems to be glowing.");
      flags.givenSnowglobe = true;
    }
  },
  toolbox: {
    id: "toolbox",
    name: "toolbox",
    aliases: ["toolbox", "tool box", "box of tools", "tools", "tool chest", "heavy toolbox"],
    description: "A heavy metal toolbox filled with tools. It looks like it belongs to the caretaker.",
    location: "yard",
    pickupable: true,
    droppable: true,
    usable: false,
    giveableTo: "caretaker",
    onGive: () => {
      appendMessage("The caretaker beams. 'Oh, you found my old toolbox! Thank you!'");
      flags.givenToolbox = true;
      flags.carryingToolbox = false;
      inventory.push("lever");
      appendMessage("The caretaker hands you a metal lever. 'You'll probably need this sooner or later.'");
    }
  },
  cart: {
    id: "cart",
    name: "cart",
    aliases: ["cart", "handcart", "trolley", "wagon", "barrow", "wheelbarrow", "truck"],
    description: "A sturdy wooden cart, suitable for transporting heavy items.",
    pickupable: true,
    droppable: false
  },
  bookshelf: {
    id: "bookshelf",
    name: "bookshelf",
    aliases: ["bookshelf", "bookcase", "shelf", "book shelf", "book case", "shelves"],
    description: "A tall shelving unit, suitable for keeping books off the floor.",
    location: "null",
    pickupable: true,
    droppable: true
  },
  birdhouse: {
    id: "birdhouse",
    name: "birdhouse",
    aliases: ["birdhouse", "bird house", "nest box", "perch"],
    description: "A simple freestanding wooden birdhouse, it might look nice in a garden.",
    location: "null",
    pickupable: true,
    droppable: true
  },
  flowers: {
    id: "flowers",
    name: "flowers",
    aliases: ["flowers", "bouquet", "bunch of flowers"],
    description: "A bunch of colourful flowers you picked from the garden.",
    location: "null",
    pickupable: true,
    droppable: true,
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
    aliases: ["cake", "cupcake", "muffin", "sweet treat", "sticky bun"],
    description: "A tasty looking slice of cake, neatly wrapped in a to-go box.",
    location: "null",
    pickupable: false,
    droppable: false,
    usable: false,
    consumable: true,
    onConsume: () => {
      appendMessage("You tuck into the slice of cake. It's as delicious as it looks, and somehow the barista guessed your favourite flavour!");
      inventory = inventory.filter(i => i !== "cake");
    }
  },
  coffee: {
    id: "coffee",
    name: "coffee",
    aliases: ["coffee", "cup of coffee", "espresso"],
    description: "A steaming hot cup of coffee, skillfully prepared by the barista.",
    location: "null",
    pickupable: false,
    droppable: false,
    usable: false,
    consumable: true,
    onConsume: () => {
      appendMessage("You drink the coffee, enjoying the robust flavour and energising caffeine.");
      inventory = inventory.filter(i => i !== "coffee");
    }
  },
  tea: {
    id: "tea",
    name: "tea",
    aliases: ["tea", "cup of tea", "cuppa"],
    description: "A hot and fragrant cup of tea, skillfully prepared by the barista.",
    location: "null",
    pickupable: false,
    droppable: false,
    usable: false,
    consumable: true,
    onConsume: () => {
      appendMessage("You drink the tea, savouring the soothing scent.");
      inventory = inventory.filter(i => i !== "tea");
    }
  },
  juice: {
    id: "juice",
    name: "juice",
    aliases: ["juice", "fruit juice"],
    description: "A fresh glass of chilled juice.",
    location: "null",
    pickupable: false,
    droppable: false,
    usable: false,
    consumable: true,
    onConsume: () => {
      appendMessage("You drink the juice, relishing the citrusy zing on your tongue.");
      inventory = inventory.filter(i => i !== "juice");
    }
  },
  soda: {
    id: "soda",
    name: "soda",
    aliases: ["soda", "fizzy", "pop"],
    description: "A fizzing glass of soda.",
    location: "null",
    pickupable: false,
    droppable: false,
    usable: false,
    consumable: true,
    onConsume: () => {
      appendMessage("You drink the soda, smiling as the bubbles tickle your nose.");
      inventory = inventory.filter(i => i !== "soda");
    }
  },
  water: {
    id: "water",
    name: "water",
    aliases: ["water", "aqua"],
    description: "A cool glass of fresh water.",
    location: "null",
    pickupable: false,
    droppable: false,
    usable: false,
    consumable: true,
    onConsume: () => {
      appendMessage("You drink the water, enjoying the clean and refreshing feeling.");
      inventory = inventory.filter(i => i !== "water");
    }
  },
  drink: {
    id: "drink",
    name: "canned drink",
    aliases: ["canned drink", "can of drink", "tinnie", "tinny"],
    description: "A can of... something vaguely drinkable. You don't recognise the brand.",
    location: "cafe",
    pickupable: true,
    droppable: true,
    usable: false,
    consumable: true,
    onConsume: () => {
      appendMessage("You open the can and drink the contents. It doesn't taste like anything, but it quenches some thirst.");
      inventory = inventory.filter(i => i !== "drink");
    }
  },
  snack: {
    id: "snack",
    name: "packaged snack",
    aliases: ["packaged snack", "snack bar", "protein bar", "granola bar"],
    description: "A snack bar in unfamiliar packaging. There are only dashes in place of an expiry date.",
    location: "cafe",
    pickupable: true,
    droppable: true,
    usable: false,
    consumable: true,
    onConsume: () => {
      appendMessage("You unwrap the bar and tuck in. It's dry and tasteless, but gives your stomach something to do.");
      inventory = inventory.filter(i => i !== "snack");
    }
  },
  smallKey: {
    id: "smallKey",
    name: "small key",
    aliases: ["small key", "little key", "tiny key", "exit key", "white room key"],
    description: "A tiny tarnished key. There's a faded, dusty label: 'White Room - Exit'.",
    location: "hidden store",
    pickupable: true,
    droppable: false,
    usable: true,
    onUse: () => {
      appendMessage("You carefully fit the small key into the tiny keyhole and turn it. A part of the north wall slides open, revealing an almost blinding light.");
      flags.exitUnlocked = true;
      // opens the glass corridor exit
      const whrm = rooms["white room"];
      whrm.exits["north"] = "glass corridor";
      // update white room description
      whrm.description.dynamic = "The once blank white walls now sparkle with a variety of colours, reflected through the new door to the north. It has a rather mesmerising effect. ";
      whrm.description.doorList = "The door to the east leads into the fossil exhibit. The north door leads into a corridor with glass walls.";
    }
  },
  brassKey: {
    id: "brassKey",
    name: "brass key",
    aliases: ["brass key", "garden key", "shiny key"],
    description: "A heavy brass key. There's a tag on it that reads: 'Garden'.",
    location: "secret lab",
    pickupable: true,
    droppable: false,
    usable: true,
    onUse: () => {
      // opens the garden doors
      appendMessage("You unlock the door and push it open with a slight creak. Looks like there's a garden through there.");
      const gard1 = rooms["blue corridor"];
      gard1.exits["south east"] = "garden";
      const gard2 = rooms["cafe"];
      gard2.exits["south"] = "garden";
      flags.gardenOpen = true;
      // new blue corridor description
      gard1.description.dynamic = "The caretaker is taking a break, perched on one of the benches to eat a sandwich. They nod in greeting as you enter. ";
      gard1.description.doorList = "There are doors to the south west, south, north east, and north. The south east door is now unlocked, and leads to the garden.";
      // new cafe description
      gard2.description.dynamic = "The windows lining the south wall look a little cleaner already, letting more light into the cafe. Little patches of sunlight dance across the polished tables, and behind the counter the coffee machine shines. ";
      gard2.description.doorList = "The west door leads back to the blue corridor, and the now unlocked south door leads to the garden.";
    }
  },
  ironKey: {
    id: "ironKey",
    name: "iron key",
    aliases: ["iron key", "rusty key", "old key", "stockroom key"],
    description: "A plain iron key. A label attached says: 'Stockroom'.",
    location: "null",
    pickupable: true,
    droppable: false,
    usable: true,
    onUse: () => {
      if (!flags.shelvesMoved) {
        appendMessage("You can't quite get at the keyhole. Try moving those shelves out of the way first.'");
      } else {
        appendMessage("The key turns with a squeak and a clunk, but the secret door opens.");
        // opens the hidden store exit
        const store = rooms["cleaners store"];
        store.exits["east"] = "hidden store";
        // new description
        store.description.dynamic = "The shelves that were once along the east wall now stick out at an angle, making the small room seem even smaller. The once hidden door is now open and accessible. ";
        store.description.doorList = "A door to the west leads back to the red corridor, and the east door leads to an extra storeroom.";
      }
    }
  },
  firstAidKit: {
    id: "firstAidKit",
    name: "first aid kit",
    aliases: ["first aid kit", "first aid box", "bandages", "medical kit", "medical box", "medical supplies"],
    description: "A basic first aid box, handy for dealing with minor injuries.",
    location: "cafe",
    pickupable: true,
    droppable: true,
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
    aliases: ["green gem", "strange gem", "green crystal", "strange crystal", "crystal", "glowing gem", "glowing crystal", "gem"],
    description: "It glows faintly with a mysterious energy. Might fit somewhere important.",
    location: "null",
    pickupable: true,
    droppable: true,
    usable: true,
    onUse: () => {
      if (player.location === "secret room" && !flags.batteryPlaced) {
        appendMessage("As you place the gem into its setting, you hear a soft electronic hum. The floor glows with an intricate pattern, and a synthetic voice says: 'Teleportation circuits complete. Please insert power source to activate teleportation system.'");
        inventory = inventory.filter(i => i !== "teleGem");
        flags.teleGemPlaced = true;
        // update secret room description
        const gemChange = rooms["secret room"];
        gemChange.description.dynamic = "The rainbow of gems is complete, sparkling in the strange light emitting from the glowing circuits. ";
      } else if (player.location === "secret room" && flags.batteryPlaced) {
        appendMessage("As you place the gem into its setting, you hear a soft electronic hum. The floor glows with an intricate pattern, and a synthetic voice says: 'Teleportation circuits activated. Please press the central crystal to continue.'");
        flags.teleGemPlaced = true;
        flags.teleporterReady = true;
        // update secret room description
        const gemChange = rooms["secret room"];
        gemChange.description.dynamic = "Gems of all colours glitter atop their pedestals, and the power pack you found nestles in place beneath the central one. The entire room glows softly with an unearthly light, awaiting your input. ";
        return;
      } else {
        appendMessage("You can't use that here.");
      }
    }
  },
  battery: {
    id: "battery",
    name: "battery",
    aliases: ["battery", "power source", "strange object", "power pack", "battery pack"],
    description: "It's cold and rather light. There seem to be connectors on each end, and a green bar down one side, with a lightning bolt above it. Maybe a power source for something?",
    location: "null",
    pickupable: true,
    droppable: true,
    usable: true,
    onUse: () => {
      if (player.location === "secret room" && !flags.teleGemPlaced) {
        appendMessage("You look around the room and find a slot near the base of the central pedestal. As you connect the object, the crystals light up with a soft glow, and a synthetic voice says: 'Power source connected. Please complete the crystal circuit to activate teleportation system.'");
        inventory = inventory.filter(i => i !== "battery");
        flags.batteryPlaced = true;
        // update secret room description 
        const batteryChange = rooms["secret room"];
        batteryChange.description.dynamic = "The once dull black battery now shines with a faint light, reflecting the glow of the surrounding circuits. ";
        
      } else if (player.location === "secret room" && flags.teleGemPlaced) {
      appendMessage("You look around the room and find a slot near the base of the central pedestal. As you connect the object, the floor lights up with a soft glow, and a synthetic voice says: 'Power source connected. Please press the central crystal to continue.'");
        flags.batteryPlaced = true;
        flags.teleporterReady = true;
        // update secret room description 
        const batteryChange = rooms["secret room"];
        batteryChange.description.dynamic = "Gems of all colours glitter atop their pedestals, and the power pack you found nestles in place beneath the central one. The entire room glows softly with an unearthly light, awaiting your input. ";
        return;
      } else {
        appendMessage("You can't use that here.");
      }
    }
  }
};

// notes array
const notes = {
  note1: "Note 1 reads:\nIf you're reading this, then you're stuck here too. There is a way out, or so I've heard, but so far none of us have managed to find it. The caretaker's been here the longest, and even they don't know how to get out.\nOn the bright side, nobody here ever seems to get sick or old, so that's something. Just a heads up, though, you can be injured, so be careful what you poke.\nA couple of hints, things I've found out along the way:\n1- Nobody minds if you take things, as long as you're not selfish about keeping them.\n2- Loyal friends are worth their weight in gold around here. Bring a gift and they'll help you out.\n3- If something seems missing, try to find it. Sometimes replacing what's lost can help you find your way.\nGood luck!\n",

  note2: "Note 2 reads:\nDay ???\nI am unsure how long I have been trapped in this place. I lost count of the days a long time ago, if one can say there are such things as 'days' or 'time' here. All I know is that I must find a way to escape. I cannot remain here for eternity, no matter the seeming endlessness of it and the perpetual youth it has granted me.\nThe lab next to the observatory is full of strange equipment, things I've never seen before. Perhaps I can use it to find a way to escape this strange limbo?\n",

  note3: "Note 3 reads:\nEvery time I try to scale these walls, I reach the top and find myself back at the bottom. What is going on in this place? Why can't any of us leave? Is this a prison? Are we dead, trapped in some endless purgatory?\nI keep finding these small gems, all different colours, that seem to fit in the pedestals in the small chamber off the fossil exhibit. I put most of them in place already, there's only one missing. A green one, judging by the colours of the rest. Maybe if I can find that, it will open something up.\nI will get out of here if it's the last thing I ever do.\n",

  note4: "Note 4 reads:\nI think this is the closest to escaping I'll ever get at this point. At least the air is fresh and the flowers are pretty. I still don't know how I got here, but it's a nice enough place to spend my time. The garden keeps me occupied, tending the flowers and watching the birds.\nI wonder if there's any way to get a little birdhouse for them? I'm sure they'd be grateful for somewhere to rest.\n",

  note5: "Note 5 reads:\nGuess I'm the cleaner around here now. Not that the place needs much cleaning doing. Things never seem to get dirty or used up, no idea why. The old guy who used to hang around the blue corridor sweeping just vanished a while back. No idea where he went. You'd think if he found a way out, he would have let the rest of us know.\nIt's pretty lonely with just me and the other two, now. The scientist has been complaining lately about his missing bookshelf, none of us can figure out where the blasted thing went. I'll build him a new one next time I'm in the workshop.\nAt least Digger is happy to keep me company while I sweep the floors. He's still as young and energetic as the day we wound up here.\n"
};

// check items in current room 
function lookForItem() {
  const foundItems = Object.values(items).filter(i => i.location === player.location);

  if (foundItems.length === 0) {
    if (player.location === "white room" || player.location === "observatory" || player.location === "garden" || player.location === "art gallery" || player.location === "workshop") {
      appendMessage("You don’t see anything you could take with you, but a couple of things might be worth a closer examination.");
    } else if ((player.location === "fossil exhibit" && !player.notes.note1) || (player.location === "garden" && !player.notes.note5)) {
      appendMessage("You spot something stuck high up, but you can't quite tell what it is. Maybe you could jump up and get a better look?'");
    } else {
      appendMessage("You don't see anything here.");
    }  
  } else {
    appendMessage("You notice:");
    foundItems.forEach(i => print(` - ${i.name}: ${i.description}`));
  }
}

// handles item aliases
function resolveItemFromText(text) {
  const lower = text.toLowerCase();

  for (const item of Object.values(items)) {
    if (!Array.isArray(item.aliases)) continue;

    for (const alias of item.aliases) {
      if (lower.includes(alias)) {
        return item.id;
      }
    }
  }

  return null;
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

// verb groups for natural command phrasing
const verbGroups = {
  take: ["take", "pick up", "grab"],
  drop: ["drop", "leave", "abandon"],
  give: ["give", "hand", "offer"],
  build: ["build", "craft", "make"],
  use: ["use", "place"],
  unlock: ["unlock", "open"],
  search: ["search", "look for"],
  go: ["go", "head"]
};

// verb parsing helper
function startsWithVerb(cmd, verbs) {
  if (typeof cmd !== "string") return false;
  return verbs.some(v => cmd.startsWith(v + " "));
}

// player takes item
function takeItem(nameOrId) {
  // accept either an item id (e.g. "lever") or freeform text (e.g. "take the small key")
  if (!nameOrId) {
    appendMessage("Take what?");
    return;
  }

  let found = null;
  const lower = nameOrId.toLowerCase();

  // 1) if caller passed an exact item id that exists in items, use it
  if (items[nameOrId]) {
    found = items[nameOrId];
    // ensure it's in the current room (unless it's already in inventory)
    if (found.location !== player.location && found.location !== "inventory") {
      appendMessage("There’s no " + found.name + " here.");
      return;
    }
  } else {
    // 2) Try to find an item in the current room that matches the provided text:
    //    match by id, exact name, or any alias
    found = Object.values(items).find(i => {
      if (i.location !== player.location) return false;
      if (i.id && i.id.toLowerCase() === lower) return true;
      if (i.name && i.name.toLowerCase() === lower) return true;
      if (Array.isArray(i.aliases)) {
        return i.aliases.some(a => lower.includes(a));
      }
      return false;
    });

    // 3) If still not found, try the general resolver
    if (!found) {
      const resolvedId = resolveItemFromText(nameOrId);
      if (resolvedId && items[resolvedId] && items[resolvedId].location === player.location) {
        found = items[resolvedId];
      }
    }
  }
  
  // if item not present in the current room
  if (!found) {
    appendMessage("You don’t see that here.");
    return;
  }
  
  // if item cannot be picked up
  if (!found.pickupable) {
    appendMessage("You can’t take that.");
    return;
  }

  // special handling for large/heavy items that use the cart
  if (found.id === "toolbox") {
    if (player.location !== items.toolbox.location) {
      appendMessage("There’s no toolbox here.");
      return;
    }

    if (flags.carryingBookshelf || flags.carryingBirdhouse) {
      appendMessage("The cart is sturdy but small. There's only room for one thing at a time.");
      return;
    }

    if (!inventory.includes("cart")) {
      appendMessage("The toolbox is too heavy to carry by hand. You need something to transport it with.");
      return;
    }

    flags.carryingToolbox = true;
    flags.usingCart = true;
    appendMessage("You load the heavy toolbox onto the cart. You can now move it around easily.");
    // update yard description
    const yard = rooms["yard"];
    if (!npcs.puppy.befriended) {
      yard.description.dynamic = "The planks that once sheltered the toolbox now rest flat on the floor. The puppy in the corner watches you with his head tilted curiously. ";
    } else {
      yard.description.dynamic = "The planks that once sheltered the toolbox now rest flat on the floor. A half-finished doghouse in the corner bears a brass plaque with the name 'Digger'. ";
    }
  }

  if (found.id === "bookshelf") {
    if (!inventory.includes("cart")) {
      appendMessage("You can't drag that around the place by yourself. Maybe if you had a cart you could move it more easily.");
      return;
    }

    if (flags.carryingToolbox || flags.carryingBirdhouse) {
      appendMessage("The cart is sturdy but small. There's only room for one thing at a time.");
      return;
    }
    if (!player.builtShelf) {
      appendMessage("You haven't built a bookshelf yet.");
      return;
    }

    if (player.location !== items.bookshelf.location) {
      appendMessage("The bookshelf isn't here.");
      return;
    }

    flags.carryingBookshelf = true;
    flags.usingCart = true;
    appendMessage("You load the bookshelf onto the cart. Now to find where it belongs.");
  }

  if (found.id === "birdhouse") {
    if (!inventory.includes("cart")) {
      appendMessage("You can't drag that around the place by yourself. Maybe if you had a cart you could move it more easily.");
      return;
    }

    if (flags.carryingToolbox || flags.carryingBookshelf) {
      appendMessage("The cart is sturdy but small. There's only room for one thing at a time.");
      return;
    }
    if (!player.builtBirdhouse) {
      appendMessage("You haven't built a birdhouse yet.");
      return;
    }

    if (player.location !== items.birdhouse.location) {
      appendMessage("The birdhouse isn't here.");
      return;
    }

    flags.carryingBirdhouse = true;
    flags.usingCart = true;
    appendMessage("You load the birdhouse onto the cart. Now to find where it belongs.");
  }

  // add to player inventory and mark as carried
  if (!inventory.includes(found.id)) {
    inventory.push(found.id);
  }
  found.location = "inventory";
  appendMessage(`You take the ${found.name}.`);
}

// player drops item
function dropItem(itemId) {
  if (!inventory.includes(itemId)) {
    appendMessage("You don't have that.");
  }
  
  const item = items[itemId];
  
  // check if the item can be dropped
  if (!item.droppable) {
    appendMessage("That's too useful to leave behind.");
    return;
  }
  
  // special handling for heavy items using the cart
  if (item.id === "birdhouse") {
    appendMessage("The birdhouse might be useful later. You make a note of where you left it, in case you need to come back.");
    carryingBirdhouse = false;
    inventory.splice(index, 1);
    item.location = player.location;
    return;
  }
  
  if (item.id === "bookshelf") {
    appendMessage("The bookshelf might be useful later. You make a note of where you left it, in case you need to come back.");
    carryingBookshelf = false;
    inventory.splice(index, 1);
    item.location = player.location;
    return;
  }
  
  if (item.id === "toolbox") {
    appendMessage("The toolbox might be useful later. You make a note of where you left it, in case you need to come back.");
    carryingToolbox = false;
    inventory.splice(index, 1);
    item.location = player.location;
    return;
  }
  
  item.location = player.location;
  inventory.splice(index, 1);
  appendMessage(`You leave the ${item.name} behind.`);
}

// give items to NPCs
function giveItem(itemId, npcName) {
  const item = items[itemId];

  const npc = npcs[npcName];

  if (!item) {
    appendMessage(`You don't seem to have that.`);
    return;
  }
  if (!inventory.includes(item.id)) {
    appendMessage(`You're not carrying a ${item.name}.`);
    return;
  }
  if (!npc) {
    appendMessage(`The ${npc.name} isn't here.`);
    return;
  }
  if (npc.location !== player.location) {
    appendMessage(`The ${npc.name} isn't here right now.`);
    return;
  }
  if (item.giveableTo !== npcName) {
    appendMessage(`The ${npc.name} doesn't seem interested in that.`);
    return;
  }

  // give success
  appendMessage(`You give the ${item.name} to the ${npc.name}.`);
  inventory = inventory.filter(i => i !== item.id);
  if (item.onGive) item.onGive(); // run custom event logic
}

// use items
function useItem(itemId) {
  const item = items[itemId];
  
  if (!item) {
    appendMessage("What do you want to use?");
    return;
  }
  
  if (!inventory.includes(item.id)) {
    appendMessage("You're not carrying that.");
    return;
  }
  
  if (!item.usable) {
    appendMessage("You can't use that.");
    return;
  }
  
  appendMessage(`You use the ${item.name}.`);
  if (item.onUse) item.onUse(); // run custom event logic
}

// handles eating and drinking items from the cafe
function consume(itemId) {
  const item = items[itemId];
  
  if (!item) {
    appendMessage("What are you trying to consume?");
  }
  
  if (!inventory.includes(item.id)) {
    appendMessage("You're not carrying that.");
    return;
  }
  
  if (!item.consumable) {
    appendMessage("You can't eat or drink that.");
    return;
  }
  
  if ((item === "canned drink" || item === "packaged snack") && player.location === "cafe") {
    appendMessage(`You grab a ${item} from the shelf and open it up. It's bland and tasteless, but perks you up a little.`);
  } else if (item === "water" && (player.location === "cafe" || player.location === "bathroom")) {
    appendMessage("You're thirsty enough to drink straight from the tap. The water's tepid and has a slight metallic tang, but quenches some thirst.");
  }
  
  if (item.onConsume) item.onConsume(); // run custom event logic
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
  usingCart: false,
  carryingToolbox: false,
  carryingBookshelf: false,
  carryingBirdhouse: false,
  bookshelfPlaced: false,
  birdhousePlaced: false,
  givenToolbox: false,
  givenFlowers: false,
  givenSnowglobe : false,
  befriendedPuppy: false,
  learnedPuppyName: false,
  observatoryVisited: false,
  leverPlaced: false,
  discoveredLab: false,
  gardenOpen: false,
  shelvesMoved: false,
  wrExitOpen: false,
  smallKeyholeRevealed: false,
  teleGemPlaced: false,
  batteryPlaced: false,
  teleporterReady: false,
  exitUnlocked: false,
  customerTimer: 0,
  visitorTimer: 0,
  customersPresent: false,
  visitorsAllowed: false,
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
  notesFound: 0,
  notes: {
    note1: false,
    note2: false,
    note3: false,
    note4: false,
    note5: false
  }
};

// allows output to print important player status notices
function playerState() {
  // alerts player of injury
  if (player.isInjured) {
    if (!inventory.includes("first aid kit")) {
      appendMessage("You have a minor injury. It might be a good idea to look for a first aid kit.");
    } else {
      appendMessage("You have a minor injury. Maybe you should use the first aid kit you picked up.");
    }
  }
  
  // hint for revealing small keyhole in white room
  if (player.location === "white room" && inventory.includes("smallKey") && !flags.smallKeyholeRevealed && npcs.puppy.following) {
		appendMessage("You are exhausted after spending so long wandering around this place. That rickety old bench suddenly looks a lot more comfortable. Surely it wouldn't hurt to sit down for a moment?");
	}
	
	// tells the player how many notes they have
	const notesFound = player.notesFound;
	if (player.notesFound > 0) {
	  appendMessage(`You have found ${notesFound} of 5 notes.`);
	}
	
	// add condition for keys found
	if (inventory.includes("brassKey")) {
	  appendMessage("You have found a brass key.");
	} else if (inventory.includes("ironKey")) {
	  appendMessage("You have found a brass key, and an iron key.");
	} else if (inventory.includes("smallKey")) {
	  appendMessage("You have found a brass key, an iron key, and a small key.");
	}
	
	// default location notification
	const location = player.location;
	appendMessage(`You are in the ${location}.`);
	return true;
}

// enables timer for customer & visitor arrivals once glass corridor exit is open
function advanceWorldState() {
  // only start counting once the door is open
  if (!flags.exitUnlocked) return;

  // stop counting once customers have arrived
  if (flags.customersPresent) return;

  flags.customerTimer++;
  flags.visitorTimer++;

  // customers should arrive after 20 turns, changed from 10 as it seemed too quick
  if (flags.customerTimer >= 20) {
    spawnCafeCustomers();
  }
  
  // visitors should start arriving a little before customers, changed from 7 to 15
  if (flags.visitorTimer >= 15) {
    spawnVisitors();
  }
}

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
    const res = await fetch("./dynamic_rooms.json");
    const data = await res.json();
    data.forEach(room => {
      rooms[room.id] = room;
    });
    return true;
  } catch (err) {
    appendMessage("⚠️ Could not load dynamic_rooms.json");
    console.error(err);
    return false;
  }
}

// assemble room descriptions from static/dynamic/doorList
function getRoomDescription(room) {
  let text = room.description.static + "\n\n";
  text += room.description.dynamic;
  text += room.description.doorList;
  return text;
}

/*/ OLD - show current room
function describeRoom(showIntro = true) {
  const room = rooms[currentRoom];
  if (!room) {
    appendMessage("You're lost in the void. (Room not found!)");
    return;
  }

  if (showIntro && room.intro) appendMessage(room.intro);
  if (room.description) appendMessage(room.description);
	
  const exits = Object.keys(room.exits || {});
  if (exits.length > 0) {
    appendMessage("Exits: " + exits.join(", "));
  } else {
    appendMessage("There are no visible exits.");
  }

}*/

// new describeRoom for dynamic room updates
function describeRoom(showIntro = true) {
  const room = rooms[currentRoom];
  if (!room) {
    appendMessage("You're lost in the void. (Room not found!)");
    return;
  }

  if (showIntro && room.intro) {
    appendMessage(room.intro);
  }

  // NEW: dynamic room description
  if (room.description && typeof room.description === "object") {
    appendMessage(getRoomDescription(room));
  }
  // FALLBACK: old rooms
  else if (typeof room.description === "string") {
    appendMessage(room.description);
  }

  const exits = Object.keys(room.exits || {});
  if (exits.length > 0) {
    appendMessage("Exits: " + exits.join(", "));
  } else {
    appendMessage("There are no visible exits.");
  }
}

// move between rooms
function goDirection(dir) {
  const room = rooms[currentRoom];
  if (!room) {
    appendMessage("Error: currentRoom not found!");
    return;
  }

  if (player.location === "glass corridor" && dir === "west") {
    appendMessage("You push open the glass door underneath the EXIT sign and leave the building at last.");
    appendMessage("~~~ 🏆 YOU WIN! 🏆 ~~~");
    flags.gameWin = true;
    return;
  }
	
  if (!room.exits || !room.exits[dir]) {
    appendMessage(`You can't go ${dir} from here.`);
    return;
  }

  // get next room name string
  const nextRoomId = room.exits[dir];
  const nextRoom = rooms[nextRoomId];

  if (!nextRoom) {
    appendMessage("That direction doesn't seem to go anywhere.");
    return;
  }
  
  if (flags.carryingToolbox && !flags.usingCart) {
    appendMessage("The toolbox is too heavy to carry for long. Try building a cart in the workshop to help you move it.");
    return;
  } else if (flags.carryingBookshelf && !flags.usingCart) {
    appendMessage("The bookshelf is too bulky to move by yourself. Try building a cart to help you move it.");
    return;
  } else if (flags.carryingBirdhouse && !flags.usingCart) {
    appendMessage("The birdhouse is too awkward to carry around like this. Try building a cart to help you move it.");
    return;
  }

  // update both trackers
  currentRoom = nextRoomId;
  player.location = nextRoomId.toLowerCase();
  
  // set flags for various rooms visited so NPC hint system provides appropriate hints
  if (currentRoom === "observatory" && !flags.observatoryVisited) {
    flags.observatoryVisited = true;
  }
  
  // print the new room description
  describeRoom(true);
  
  if (npcs.puppy.following && !flags.gameLose && !flags.gameWin) {
    puppyFollow(true);
    
    // updates puppy location on minimap
    npcLocations.puppy = currentRoom;
  }
  
  // print player status notices (injury, notes found, conditional hints)
  playerState();
  
  // update map when moving rooms
  visitedRooms.add(currentRoom);
  discoveredRooms.add(currentRoom);
  renderMap();

}

// helper to check for short words hiding in other words - should prevent parser confusions eg. dig/digger, sit/visitor
function hasWord(cmd, word) {
  return new RegExp(`\\b${word}\\b`).test(cmd);
}

// new command handler & priority groups
// priority order: System, Social, Inventory, World, Flavour

// Social commands - talk, ask, give, etc
const socialCommands = (cmd) => {
  // give items to npcs
  if (startsWithVerb(cmd, verbGroups.give)) {
    const itemId = resolveItemFromText(cmd);
    const npcId = resolveNpcFromText(cmd);

    if (!itemId) {
      appendMessage("Give what?");
      return true;
    }

    if (!npcId) {
      appendMessage("Give it to whom?");
      return true;
    }

    giveItem(itemId, npcId);
    return true;
  } 
  // talk to npcs
  else if (cmd.startsWith("talk ") || cmd.startsWith("chat ")) {
    const cleaned = cmd
      .replace(/^chat\s+/, "")
      .replace(/^talk\s+/, "")
      .replace(/^with\s+/, "")
      .replace(/^to\s+/, "")
      .replace(/^the\s+/, "")
      .replace(/^a\s+/, "")
      .replace(/^an\s+/, "");
    
    const npcId = resolveNpcFromText(cleaned);
    
    if (!npcId) {
      appendMessage("They're not here.");
      return true;
    }
    
    const npc = npcId.split(" ")[0].trim();
    
    if (npc === "barista" || npc === "caretaker" || npc === "scientist" || npc === "puppy" || npc === "customer" || npc === "visitor") {
      talkTo(npc);
      return true;
    }
    
    appendMessage("?");

  } 
  // ask npcs for hints
  else if (cmd.startsWith("ask ")) {
    const cleaned = cmd
      .replace(/^ask\s+/, "")
      .replace(/^the\s+/, "");
      
    const npcId = resolveNpcFromText(cleaned);

    if (!npcId) {
      appendMessage("There's nobody here to help you. Check another room.");
      return true;
    }

    const npc = npcId.split(" ")[0].trim();

    if (npc === "barista" || npc === "caretaker" || npc === "scientist") {
      getHint(npc);
      return true;
    }
    
  } 
  // tell npcs about exits found
  else if ((cmd.includes("tell") || cmd.includes("say")) && (cmd.includes("exit") || cmd.includes("way out") || cmd.includes("door") || cmd.includes("teleporter"))) {
    const npc = resolveNpcFromText(cmd);
    
    if (!npc) {
      appendMessage("There's nobody here to tell about the exit. Check another room.");
      return true;
    }
    
    if (npc) {
      tellNpcAboutExit(npc);
      return true;
    }
  }
  // order items from the cafe
  else if ((hasWord(cmd, "coffee") || hasWord(cmd, "tea") || hasWord(cmd, "cake") || hasWord(cmd, "pastry") || hasWord(cmd, "juice") || hasWord(cmd, "soda") || hasWord(cmd, "water")) && (!cmd.includes("drink ") && !cmd.includes("eat "))) {
    if (player.location === "cafe") {
      handleBaristaOrder(cmd);
      return true;
    } else {
      appendMessage("You can't order anything here. Try the cafe.");
    }
    return true;
  }
  
  return false;
};

// Inventory & Item commands - take, drop, build, etc
const itemCommands = (cmd) => {
  // eat items
  if (cmd.startsWith("eat ")) {
      const food = cmd
      .replace(/^eat\s+/, "")
      .replace(/^the\s+/, "")
      .replace(/^a\s+/, "");
      
      if (!food) {
        appendMessage("Eat what?");
      } else {
       consume(food); 
      }
      return true;
  }
  // drink items
  else if (cmd.startsWith("drink ")) {
      const drink = cmd
      .replace(/^drink\s+/, "")
      .replace(/^the\s+/, "")
      .replace(/^a\s+/, "");
            
      if (!drink) {
        appendMessage("Drink what?");
      } else {
       consume(drink); 
      }
      return true;
  } 
  // build items
  else if (startsWithVerb(cmd, verbGroups.build)) {
    const itemId = resolveItemFromText(cmd);

    if (!itemId) {
      appendMessage("Build what?");
      return true;
    }

    build(itemId);
    return true;
  } 
  // unlock doors
  else if (startsWithVerb(cmd, verbGroups.unlock)) {
    handleUnlock(cmd);
    return true;
  } 
  // take items
  else if (startsWithVerb(cmd, verbGroups.take)) {
    const itemId = resolveItemFromText(cmd);

    if (!itemId) {
      appendMessage("Take what?");
      return true;
    }

    takeItem(itemId);
    return true;
  } 
  // drop items
  else if (startsWithVerb(cmd, verbGroups.drop)) {
    const itemId = resolveItemFromText(cmd);

    if (!itemId) {
      appendMessage("Drop what?");
      return true;
    }

    dropItem(itemId);
    return true;
  } 
  // use items
  else if (startsWithVerb(cmd, verbGroups.use) && !cmd.includes("telescope")) {
    const itemId = resolveItemFromText(cmd);

    if (!itemId) {
      appendMessage("Use what?");
      return true;
    }

    if (itemId === "bookshelf") {
      placeBookshelf();
      return true;
    }

    if (itemId === "birdhouse") {
      placeBirdhouse();
      return true;
    }

    useItem(itemId);
    return true;
  }
  
  return false;
};

// World interaction commands - pull lever, move shelf, search, etc
const worldCommands = (cmd) => {
  // flag these commands as handled
  let handled = false;
  
  // player moves through the map
  if ((cmd.startsWith("go ") || cmd.startsWith("head")) && !cmd.includes("to")) {
    const dir = cmd
      .replace(/^head\s+/, "")
      .replace(/^go\s+/, "");
    
    if (dir) {
      goDirection(dir);
    } else {
      appendMessage("Go where?");
    }
    handled = true;
  } 
  // press button for teleport ending
  else if (cmd.includes("press") && (cmd.includes("button") || cmd.includes("crystal") || cmd.includes("pedestal"))) {
    teleportEnding();
    handled = true;
  }
  // pull the lever in the observatory
  else if (cmd.includes("lever") && flags.leverPlaced) {
    pullLever();
    handled = true;
  } 
  // move the shelves in the cleaners store
  else if (cmd.includes("move") && (cmd.includes("shelf") || cmd.includes("shelves"))) {
    moveShelf();
    handled = true;
  }
  // player or puppy waits somewhere
  else if (hasWord(cmd, "wait")) {
    if (cmd.includes("puppy") || cmd.includes("digger")) {
      puppyWait();
    } else {
      playerWait();
    }
    handled = true;
  }
  // player status check
  else if (hasWord(cmd, "status") || hasWord(cmd, "health")) {
    playerState();
    handled = true;
  }
  // search the room
  else if (hasWord(cmd, "search")) {
    lookForItem();
    handled = true;
  } 
  // player tells the puppy to dig
  else if (hasWord(cmd, "dig")) {
    dig();
    handled = true;
  } 
  
  return handled;
};

// Flavour interactions - sit, poke, use telescope, etc
const flavourCommands = (cmd) => {
  // flag these commands as handled
  let handled = false;

  // print room description
  if (cmd.includes("look around")) {
    describeRoom(false);
    handled = true;
  }
  // player pees
  else if (hasWord(cmd, "pee") || hasWord(cmd, "toilet") || hasWord(cmd, "cubicle")) {
    pee();
    handled = true;
  } 
  // player washes hands
  else if (cmd.includes("wash") && cmd.includes("hands")) {
    washHands();
    handled = true;
  } 
  // print inventory to output
  else if (cmd.includes("inventory") || cmd.includes("bag")) {
    showInventory();
    handled = true;
  } 
  // print discovered notes to output
  else if (cmd.includes("note")) {
    showNotes();
    handled = true;
  } 
  // player sits somewhere (may reveal secrets)
  else if (hasWord(cmd, "sit")) {
    handleSit();
    handled = true;
  } 
  // player jumps (may reveal secrets)
  else if (hasWord(cmd, "jump") || hasWord(cmd, "leap")) {
    handleJump();
    handled = true;
  } 
  // player examines the room (may reveal secrets)
  else if (hasWord(cmd, "examine")) {
    handleExamine();
    handled = true;
  } 
  // pick some flowers in the garden
  else if (hasWord(cmd, "pick") && cmd.includes("flower")) {
    pickFlowers();
    handled = true;
  } 
  // player pokes things
  else if (hasWord(cmd, "poke") || hasWord(cmd, "prod")) {
    handlePoke();
    handled = true;
  } 
  // player can use the observatory telescope
  else if (cmd.includes("telescope")) {
    useTelescope();
    handled = true;
  } 
  // player can interact with the bathroom mirror
  else if (cmd.includes("mirror")) {
    if (player.location === "bathroom") {
      mirrorInteractions(cmd);
    } else {
      appendMessage("There's no mirror here.");
    }
    handled = true;
  }
  // game says hi
  else if (cmd.startsWith("hello") || cmd.startsWith("hi")) {
    appendMessage("Hello!");
    handled = true;
  }
  // pet the puppy
  else if (cmd.startsWith("pet") && cmd.includes("puppy")) {
    petPuppy();
    handled = true;
  }
  // play with the puppy
  else if (cmd.startsWith("play") && cmd.includes("puppy")) {
    playWithPuppy();
    handled = true;
  }

  return handled;
};

// refactored handleCommand()
function handleCommand(cmdInput) {
  const cmd = cmdInput.toLowerCase().trim();

  // Print user input into the game log
  appendMessage(`> ${cmd}`, "command");
  
  // allows the game to track environment changes
  advanceWorldState();

  // restarts the game after winning/losing, or if players somehow break everything
  if (cmd === "restart") {
    location.reload();
    return;
  }
  
  // lose the game if the lab explodes and player dies :c
  if (flags.gameLose) {
    appendMessage("The lab exploded. You're no longer among the living.\nType RESTART to play again.");
    return;
  }
  
  // win the game by escaping :D
  if (flags.gameWin) {
    appendMessage("You've already escaped! Refresh the page or type RESTART to play again.");
    return;
  }
  
  // allows barista order commands
  if (npcs.barista.waitingForOrder) {
    handleBaristaOrder(cmd);
    return;
  }
  
  // fast travel system
  if (cmd.startsWith("return to ") || cmd.startsWith("travel to ") || cmd.startsWith("go back to ")) {
  const destination = resolveRoomFromText(cmd);

    if (!destination) {
      appendMessage("You're not sure where you're trying to go.");
      return true;
    }

    if (!canFastTravelTo(destination)) {
      appendMessage("You don't know how to get there yet.");
      return true;
    }

    if (destination === currentRoom) {
      appendMessage("You're already there.");
      return true;
    }

    movePlayerTo(destination);
    return true;
  }
  
  // prints a basic command list to the game screen
  if (cmd === "help" || cmd === "commands" || cmd === "command list") {
    showHelp();
    appendMessage("Type a command or use the compass to move.");
    return true;
  }
  
  // calls social commands
  if (socialCommands(cmd)) return true;
  // calls item commands
  if (itemCommands(cmd)) return true;
  // calls world commands
  if (worldCommands(cmd)) return true;
  //calls flavour commands
  if (flavourCommands(cmd)) return true;
  
  // default message
  appendMessage("Sorry, you can't do that :(");

}

// ~~~~~~~~~~~~~~~~~~~~~~~
// UI CONTROLS & FUNCTIONS
// ~~~~~~~~~~~~~~~~~~~~~~~

// mobile menu show/hide
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const closeMobileMenu = document.getElementById("closeMobileMenu");

mobileMenuBtn.addEventListener("click", () => {
  document.getElementById("mobileMenu").classList.toggle("mobile-hidden");
});

closeMobileMenu.addEventListener("click", () => {
  document.getElementById("mobileMenu").classList.toggle("mobile-hidden");
});

// mobile menu button event listeners
const mobileSend = document.getElementById("mobileSend");
const mobileBag = document.getElementById("invBtnMobile");
const mobileNotes = document.getElementById("notesBtnMobile");
const mobileMap = document.getElementById("mapBtnMobile");
const mobileHelp = document.getElementById("helpMobile");
const mobileSetting = document.getElementById("setBtnMobile");
const mobileSave = document.getElementById("saveBtnMobile");
const mobileLoad = document.getElementById("loadBtnMobile");

mobileSend.addEventListener("click", () => {
  const input = cmdInput.value;
  cmdInput.value = "";
  handleCommand(input);
  cmdInput.focus();
});

mobileBag.addEventListener("click", () => {
  updateInventoryUI();
  inventoryPanel.classList.remove("hidden");
});

mobileNotes.addEventListener("click", () => {
  updateJournal();
  notesPanel.classList.remove("hidden");
});

mobileMap.addEventListener("click", () => {
  renderMap();
  mapPanel.classList.remove("hidden");
});

mobileHelp.addEventListener("click", () => {
  toggleHelp(true);
});

mobileSetting.addEventListener("click", () => {
  settingsPanel.classList.remove("hidden");
});

mobileSave.addEventListener("click", saveGame);
mobileLoad.addEventListener("click", loadGame);

// toggle help panel
function toggleHelp(show) {
  helpPanel.classList.toggle("hidden", !show);
  helpPanel.setAttribute("aria-hidden", !show);
}

// show/hide help panel
helpBtn.addEventListener("click", () => toggleHelp(true));
closeHelp.addEventListener("click", () => toggleHelp(false));

// notes panel show/hide
const notesButton = document.getElementById("notesButton");
const notesPanel = document.getElementById("notesPanel");
const closeNotes = document.getElementById("closeNotes");

notesButton.addEventListener("click", () => {
  updateJournal();
  notesPanel.classList.remove("hidden");
});

closeNotes.addEventListener("click", () => {
  notesPanel.classList.add("hidden");
});

// populate notes panel
function updateJournal() {
  const pNotes = document.getElementById("playerNotes");
  pNotes.innerHTML = "";
  const found = Object.keys(player.notes).filter(n => player.notes[n]);
  
  found.forEach(n => {
    const li = document.createElement("li");
    li.textContent = notes[n];
    pNotes.appendChild(li);
  });
}

// inventory panel show/hide
const invButton = document.getElementById("invButton");
const inventoryPanel = document.getElementById("inventoryPanel");
const closeInv = document.getElementById("closeInv");

invButton.addEventListener("click", () => {
  updateInventoryUI();
  inventoryPanel.classList.remove("hidden");
});

closeInv.addEventListener("click", () => {
  inventoryPanel.classList.add("hidden");
});

// populate inventory panel
function updateInventoryUI() {
  const list = document.getElementById("inventoryList");
  list.innerHTML = "";
  inventory.forEach(item => {
    const li = document.createElement("li");
	const it = items[item];
    if (it) {
      li.textContent = it.name;
    } else {
      li.textContent = item;
    }
    list.appendChild(li);
  });
}

// settings panel show/hide
const settingsButton = document.getElementById("settingsButton");
const settingsPanel = document.getElementById("settingsPanel");
const closeSettings = document.getElementById("closeSettings");

settingsButton.addEventListener("click", () => {
  settingsPanel.classList.remove("hidden");
});

closeSettings.addEventListener("click", () => {
  settingsPanel.classList.add("hidden");
});

// theme selector
document.querySelectorAll('input[name="theme"]').forEach(radio => {
  radio.addEventListener("change", e => {
    document.body.className = ""; // clear previous
    if (e.target.value !== "amber") {
      document.body.classList.add("theme-" + e.target.value);
    }
  });
});

// typed input handling
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

// compass click handling
compass.addEventListener("click", (e) => {
  const btn = e.target.closest(".dir");
  if (!btn) return;
  const cmd = btn.dataset.cmd;
  handleCommand(cmd);
});

// map open/close buttons
const mapPanel = document.getElementById("mapPanel");

document.getElementById("mapButton").addEventListener("click", () => {
  renderMap();
  mapPanel.classList.remove("hidden");
});

document.getElementById("closeMap").addEventListener("click", () => {
  mapPanel.classList.add("hidden");
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// GAME START, SAVE & LOAD SYSTEM
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Save/Load system

// function to reopen previously unlocked doors on saving
function revealDoors() {
  if (flags.wrExitOpen) {
    const room = rooms["white room"];
    room.exits["east"] = "fossil exhibit";
  }
  
  // glass corridor unlock
  if (flags.exitUnlocked) {
    const room = rooms["white room"];
    room.exits["north"] = "glass corridor";
  }
  
  // teleport room exit
  if (flags.bookshelfPlaced) {
    const room = rooms["fossil exhibit"];
    room.exits["south"] = "secret room";
  }
  
  // lab door open
  if (flags.discoveredLab) {
    const room = rooms["observatory"];
    room.exits["south west"] = "secret lab";
  }
  
  // garden doors
  if (flags.gardenOpen) {
    const room1 = rooms["cafe"];
    const room2 = rooms["blue corridor"];
    room1.exits["south"] = "garden";
    room2.exits["south east"] = "garden";
  }
  
  // hidden store exit
  if (flags.shelvesMoved) {
    const room = rooms["cleaners store"];
    room.exits["east"] = "hidden store";
  }
}

// save game function
function saveGame() {
  const saveData = {
    currentRoom,
    visitedRooms: Array.from(visitedRooms),
    inventory,
    player,
    flags,
    npcs
  };

  localStorage.setItem("escapeSave", JSON.stringify(saveData));
  print("💾 Game saved!");
}

// autosave at key points
function autoSave(reason = "") {
  const saveData = {
    currentRoom,
    visitedRooms: Array.from(visitedRooms),
    inventory,
    player,
    flags,
    npcs
  };
  
  localStorage.setItem("escapeAutoSave", JSON.stringify(saveData));
  console.log(`🔁 Autosaved (${reason})`);
}

// load autosaves
function loadAutoSave() {
  const saved = localStorage.getItem("escapeAutoSave");
  if (!saved) {
    print("⚠️ No autosave found.");
    return;
  }

  const data = JSON.parse(saved);
  currentRoom = data.currentRoom;
  visitedRooms = new Set(data.visitedRooms);
  inventory = data.inventory;
  Object.assign(player, data.player);
  Object.assign(flags, data.flags);
  Object.assign(npcs, data.npcs);

  print("📂 Autosave loaded!");
  revealDoors();
  describeRoom();
  renderMap();
}

// load game function
function loadGame() {
  const saved = localStorage.getItem("escapeSave");
  const autosave = localStorage.getItem("escapeAutoSave");
  if (!saved) {
    if (autosave) {
      loadAutoSave();
    }
    
    print("⚠️ No saved game found.");
    
    return;
  }

  const data = JSON.parse(saved);
  currentRoom = data.currentRoom;
  visitedRooms = new Set(data.visitedRooms);
  inventory = data.inventory;
  Object.assign(player, data.player);
  Object.assign(flags, data.flags);
  Object.assign(npcs, data.npcs);

  print("📂 Game loaded!");
  revealDoors();
  describeRoom();
  renderMap();
}

// save/load button event listeners
document.getElementById("saveBtn").addEventListener("click", saveGame);
document.getElementById("loadBtn").addEventListener("click", loadGame);

// Initialize the game
async function startGame() {
  appendMessage("Loading Escape the Complex...");
  const ok = await loadRooms();
  if (!ok) return;
  currentRoom = Object.keys(rooms)[0];
  discoveredRooms.add(currentRoom);
  appendMessage("Welcome to Escape the Complex!");
  br();
  describeRoom(true);
  appendMessage("Type a command or use the compass to move.");
  br();
  cmdInput.focus();
}

// Start when ready
window.addEventListener("DOMContentLoaded", startGame);
