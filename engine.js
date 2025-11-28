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
    } else {
      appendMessage("You sit on the bench gingerly. It creaks, but holds up. The old wood is a bit splintery, though. Probably best not to stay sat for too long.");
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
  } else if (loc === "cleaners' store" || loc === "secret lab") {
    appendMessage("You can't jump here, the ceiling is too low.\n");
  } else if (loc === "fossil exhibit" && !player.notes.note1Found) {
    appendMessage("You spot a note stuck to the triceratops skull. You carefully reach up and take it.");
    player.notes.note1 = true;
  } else if (loc === "garden" && !player.notes.note4Found) {
    appendMessage("There's a note pinned high up on one of the trees. You stand on an upturned flowerpot to grab it.\n");
    player.notes.note4 = true;
  } else {
    appendMessage("You jump, but nothing unusual happens.\n");
  }
}

// examine command
function handleExamine() {
  const loc = player.location;
  
  if (loc === "white room"){
    if (npcs.puppy.following && !flags.smallKeyholeRevealed) {
      appendMessage("The puppy barks, scrabbling at the crumbling stone leg of the bench. You get up and look where he's trying to dig, and spot a tiny keyhole. A very small key might fit...");
      flags.smallKeyholeRevealed = true;
    } else {
      appendMessage("There's not much to examine here.");
    }
  } else if (loc === "art gallery") {
    appendMessage("You take a good look at some of the paintings. They're even creepier up close.");
    if (!player.notes.note2) {
      appendMessage("One of the surreal landscapes has a note tucked into the frame. You take it gently, trying to avoid disturbing the artwork.");
      player.notes.note2 = true;
    }
  } else if (loc === "yard") {
    appendMessage("The junk piles seem even more rusty and decrepit the closer you look at them. Who dumped all this mess here, anyway?");
    if (!player.notes.note3) {
      appendMessage("You spot a slightly damp note under a big stone beside one pile. Careful not to nudge the teetering junk, you take the note.");
      player.notes.note3 = true;
    }
  } else if (loc === "observatory") {
    if (!flags.discoveredLab) {
      appendMessage("You go and take a better look at those mechanisms. Most seem to operate the big telescope, but one isn't connected to anything you can see. It's missing its lever... maybe the caretaker knows something about it?");
    }
  } else if (loc === "fossil exhibit") {
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
  } else if (loc === "secret room") {
    appendMessage("On closer inspection, the pedestals have fine wires inlaid down their length, joining with a circuit-like pattern embedded in the floor.");
  } else if (loc === "workshop") {
    appendMessage("Several design sketches are strewn across the workbench. Most are beyond you, but a few look interesting: a simple birdhouse, a tall bookshelf, and a handcart. You could probably make those, looking at the careful detail put into the drawings.");
  } else if (loc === "cleaners' store") {
    appendMessage("You take a closer look at those shelves, intrigued by the scattered, flaky rust. You can just make out a thin crack in the wall behind them, and a rusted up keyhole mostly hidden by the edge of one shelf.");
  } else if (loc === "secret lab") {
    appendMessage("There's a lot of scientific equipment here, both familiar and unfamiliar. Beakers of strange fluids are lined up along one side of the bench. Some are emitting steam, despite being nowhere near a heat source. Probably best to leave them alone.");
  } else {
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
    } else {
      appendMessage("You poke the things on the workbench again. One of them whirrs for a moment, then stops. Nothing else happens.");
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

// ~~~~~~~~~~~~~~~~~~~~~~~~~
// NPC OBJECTS & TALK SYSTEM
// ~~~~~~~~~~~~~~~~~~~~~~~~~

// NPC objects
const npcs = {
  caretaker: {
    name: "caretaker",
    location: "blue corridor",
    met: false,
    playerThanked: false,
    shelfCommentSaid: false,
    gardenCommentSaid: false,
    labCommentSaid: false,
  },
  barista: {
    name: "barista",
    location: "cafe",
    met: false,
    waitingForOrder: false,
  },
  scientist: {
    name: "scientist",
    location: "fossil exhibit",
    met: false,
    shelfCommentSaid: false,
    labCommentSaid: false,
  },
  puppy: {
    name: "puppy",
    location: "yard",
    met: false,
    following: false,
  }
};

function handleCaretakerTalk() {
  if (player.location !== "blue corridor") {
    appendMessage("The caretaker isn't here.");
    return;
  }

  // First meeting
  if (!npcs.caretaker.met) {
    dialogue.caretaker.firstMeet.forEach(line => appendMessage(line));
    npcs.caretaker.met = true;
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

function handleScientistTalk() {
  if (player.location !== "fossil exhibit") {
    appendMessage("The scientist isn't here.");
    return;
  }

  // First meeting
  if (!npcs.scientist.met) {
    dialogue.scientist.firstMeet.forEach(line => appendMessage(line));
    npcs.scientist.met = true;
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

function handleBaristaTalk() {
  if (player.location !== "cafe") {
    appendMessage("The barista isn't here. Try the cafe.");
    return;
  }

  if (!npcs.barista.met) {
    appendMessage("The barista says: 'Hello, lovie! You're the first customer I've had in ages!'");
    npcs.barista.met = true;
    appendMessage("'Can I get you anything? We have coffee, tea, juice, or soda, and there's some cake in the back.'");
    npcs.barista.waitingForOrder = true;
  } else {
    print("The barista says: 'Back again, lovie? Same choices as before!'");
    npcs.barista.waitingForOrder = true;
  }
}

// simple talk system - expand later
function talkTo(npcName) {
  const npc = npcs[npcName];
  if (!npc || npc.location !== player.location) {
    appendMessage(`The ${npcName} isn't here.`);
    return;
  }

  if (npcName === "caretaker") {
    handleCaretakerTalk();
  }

  if (npcName === "barista") {
    handleBaristaTalk();
  }

  if (npcName === "scientist") {
    handleScientistTalk();
  }
  
  if (npcName === "puppy") {
	
		npcs.puppy.met = true;
	
    if (flags.befriendedPuppy) {
      appendMessage("The puppy jumps up and licks your hand. 'Woof woof!'");
    } else {
      appendMessage("The puppy seems a little uncertain of you. Maybe if you had a toy he'd be more interested?");
    }
  }
}

// puppy follows player
function puppyFollow() {
  const follow = npcs.puppy.following;
  
  if (follow) {
    npcs.puppy.location = player.location;
    appendMessage("🐾 The puppy trots after you, proudly carrying his new toy in his mouth. 🐾");
  }
}

// order drinks & food in the cafe
function handleBaristaOrder(item) {
  const order = item.toLowerCase();
  
  if (!order || order === "nothing" || order === "no thanks") {
    appendMessage("The barista says: 'Changed your mind, lovie? I'll be here if you decide you want anything.'");
    npcs.barista.waitingForOrder = false;
  }

  if (order === "coffee") {
    appendMessage("The barista says: 'One coffee, got it. Just a moment...' She turns to the machine behind her, and hands you a steaming cup of coffee. 'On the house, lovie. Enjoy!");
    inventory.push("coffee");
    npcs.barista.waitingForOrder = false;
  } else if (order === "tea") {
    appendMessage("The barista says: 'One tea, got it. Just a moment...' She turns to the machine behind her, and hands you a steaming cup of tea. 'On the house, lovie. Enjoy!'");
    inventory.push("tea");
    npcs.barista.waitingForOrder = false;
  } else if (order === "juice") {
    appendMessage("The barista says: 'One juice, got it. Just a moment...' She goes over to the fridge behind her, and hands you a glass of chilled juice. 'On the house, lovie. Enjoy!'");
    inventory.push("juice");
    npcs.barista.waitingForOrder = false;
  } else if (order === "soda") {
    appendMessage("The barista says: 'One soda, got it. Just a moment...' She goes over to the fridge behind her, and hands you a glass of chilled soda. 'On the house, lovie. Enjoy!'");
    inventory.push("soda");
    npcs.barista.waitingForOrder = false;
  } else if (order === "cake") {
    appendMessage("The barista says: 'Coming right up.' She disappears through a small door behind the counter, and returns with a delicious slice of cake. 'Here you go, lovie. On the house. Enjoy!'");
    inventory.push("cake");
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
        text: "The caretaker says: 'Say, if you find my toolbox anywhere around here, would you mind bringing it to me? You'll need something to carry it in, it's a pretty heavy old thing. A handcart would do the trick.'"
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
        text: "The caretaker says: 'A hidden door in my cleaning cupboard, you say? Well, I'll be. I never knew that was there. Did you go through it? Could be all sorts of interesting things in there.'",
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
    generic: [
      "The scientist says: 'Hello again. How are you doing?'",
      "The scientist says: 'These fossils are quite fascinating, don't you think? I could study them forever.'",
      "The scientist says: 'I gave up looking for a way out some time ago. Being here is far more peaceful than my old life. You keep at it, though! I'm sure you'll find one eventually.'",
      "The scientist says: 'Have you found the observatory yet? I used to spend a fair amount of time in there, watching the skies.'",
			"The scientist says: 'Oh, where did I leave that book? It's a wonder I can ever find any of them in this chaos. If only I had a shelf to organise them on properly...'"
    ]
  }
};

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

  // Open the secret exit
  rooms["fossil exhibit"].exits.south = "secret room";
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

  // add battery to inventory
  inventory.push("battery");
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
    appendMessage("There's no need to move those yet.\n");
    return;
  }

  appendMessage("You push the shelf aside, revealing a hidden door with a rusty iron keyhole. The key you found in the garden looks like it fits.\n");
  flags.shelvesMoved = true;

}

// ~~~~~~~~~~~~~~~~~~~~~~~
// INVENTORY + ITEM SYSTEM
// ~~~~~~~~~~~~~~~~~~~~~~~

// obtainable items
const items = {
  lever: {
    id: "lever",
    name: "lever",
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
    description: "A plain leather keyring.",
    location: "gift shop",
    pickupable: true,
    droppable: true,
    usable: false,
  },
  dogToy: {
    id: "dogToy",
    name: "dog toy",
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
    description: "A sturdy wooden cart, suitable for transporting heavy items.",
    pickupable: true,
    droppable: false
  },
  bookshelf: {
    id: "bookshelf",
    name: "bookshelf",
    description: "A tall shelving unit, suitable for keeping books off the floor.",
    location: "null",
    pickupable: true,
    droppable: true
  },
  birdhouse: {
    id: "birdhouse",
    name: "birdhouse",
    description: "A simple freestanding wooden birdhouse, it might look nice in a garden.",
    location: "null",
    pickupable: true,
    droppable: true
  },
  flowers: {
    id: "flowers",
    name: "flowers",
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
    description: "A hot cup of tea, skillfully prepared by the barista.",
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
  drink: {
    id: "drink",
    name: "canned drink",
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
    }
  },
  brassKey: {
    id: "brassKey",
    name: "brass key",
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
    }
  },
  ironKey: {
    id: "ironKey",
    name: "iron key",
    description: "A plain iron key. A label attached says: 'Stockroom'.",
    location: "garden",
    pickupable: true,
    droppable: false,
    usable: true,
    onUse: () => {
      appendMessage("The key turns with a squeak and a clunk, but the secret door opens.");
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
    description: "It glows faintly with a mysterious energy. Might fit somewhere important.",
    location: "null",
    pickupable: true,
    droppable: true,
    usable: true,
    onUse: () => {
      if (player.location === "secret room" && !flags.batteryPlaced) {
        appendMessage("As you place the gem into its setting, you hear a soft electronic hum. The floor glows with an intricate pattern, and a synthetic voice says: 'Teleportation circuits complete. Please insert power source and press the central crystal to continue.'");
        inventory = inventory.filter(i => i !== "teleGem");
        flags.teleGemPlaced = true;
      } else if (player.location === "secret room" && flags.batteryPlaced) {
        appendMessage("As you place the gem into its setting, you hear a soft electronic hum. The floor glows with an intricate pattern, and a synthetic voice says: 'Teleportation circuits activated. Please press the central crystal to continue.'");
        appendMessage("You do as the voice said, and a bright light envelops you. When the light fades, you find yourself outside, free at last.");
        flags.gameWin = true;
        return;
      } else {
        appendMessage("You can't use that here.");
      }
    }
  },
  battery: {
    id: "battery",
    name: "battery",
    description: "It's cold and rather light. There seem to be connectors on each end, and a green bar down one side, with a lightning bolt above it. Maybe a power source for something?",
    location: "null",
    pickupable: true,
    droppable: true,
    usable: true,
    onUse: () => {
      if (player.location === "secret room" && !flags.teleGemPlaced) {
        appendMessage("You look around the room and find a slot near the base of the central pedestal. As you connect the object, the floor lights up with a soft glow, and a synthetic voice says: 'Power source connected. Please complete the crystal circuit to activate teleportation system.'");
        inventory = inventory.filter(i => i !== "battery");
        flags.batteryPlaced = true;
      } else if (player.location === "secret room" && flags.teleGemPlaced) {
      appendMessage("You look around the room and find a slot near the base of the central pedestal. As you connect the object, the floor lights up with a soft glow, and a synthetic voice says: 'Power source connected. Please press the central crystal to continue.'");
        appendMessage("You do as the voice said, and a bright light envelops you. When the light fades, you find yourself outside, free at last.");
        flags.gameWin = true;
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

  note2: "Note 2 reads:\nDay ???\nI am unsure how long I have been trapped in this place. I lost count of the days a long time ago, if one can say there are such things as 'days' or 'time' here.\nAll I know is that I must find a way to escape. I cannot remain here for eternity, no matter the seeming endlessness of it and the perpetual youth it has granted me.\nThe lab next to the observatory is full of strange equipment, things I've never seen before. Perhaps I can use it to find a way to escape this strange limbo?\n",

  note3: "Note 3 reads:\nEvery time I try to scale these walls, I reach the top and find myself back at the bottom. What is going on in this place? Why can't any of us leave? Is this a prison? Are we dead, trapped in some endless purgatory?\nI keep finding these small gems, all different colours, that seem to fit in the pedestals in the small chamber off the fossil exhibit.\nI put most of them in place already, there's only one missing. A green one, judging by the colours of the rest. Maybe if I can find that, it will open something up.\nI will get out of here if it's the last thing I ever do.\n",

  note4: "Note 4 reads:\nI think this is the closest to escaping I'll ever get at this point. At least the air is fresh and the flowers are pretty. I still don't know how I got here, but it's a nice enough place to spend my time.\nThe garden keeps me occupied, tending the flowers and watching the birds.\nI wonder if there's any way to get a little birdhouse for them? I'm sure they'd be grateful for somewhere to rest.\n",

  note5: "Note 5 reads:\nGuess I'm the cleaner around here now. Not that the place needs much cleaning doing. Things never seem to get dirty or used up, no idea why.\nThe old guy who used to hang around the blue corridor sweeping just vanished a while back. No idea where he went. You'd think if he found a way out, he would have let the rest of us know.\nIt's pretty lonely with just me and the other two, now. The scientist has been complaining lately about his missing bookshelf, none of us can figure out where the blasted thing went. I'll build him a new one next time I'm in the workshop.\nAt least Digger is happy to keep me company while I sweep the floors. He's still as young and energetic as the day we wound up here.\n"
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

  inventory.push(found.id);
  found.location = "inventory";
  appendMessage(`You take the ${found.name}.`);
}

// player drops item
function dropItem(name) {
  const index = inventory.findIndex(
    id => items[id].name.toLowerCase() === name.toLowerCase()
  );
  
  const item = items[inventory[index]];
  
  if (!item.droppable) {
    appendMessage("That's too useful to leave behind.");
    return;
  }
	
  if (index === -1) {
    appendMessage("You don’t have that.");
    return;
  }
  
  if (item === "birdhouse") {
    appendMessage("The birdhouse might be useful later. You make a note of where you left it, in case you need to come back.");
    carryingBirdhouse = false;
    return;
  }
  
  if (item === "bookshelf") {
    appendMessage("The bookshelf might be useful later. You make a note of where you left it, in case you need to come back.");
    carryingBookshelf = false;
    return;
  }
  
  if (item === "toolbox") {
    appendMessage("The toolbox might be useful later. You make a note of where you left it, in case you need to come back.");
    carryingToolbox = false;
    return;
  }
  
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
    appendMessage(`You're not carrying a ${item.name}.`);
    return;
  }
  if (!npc) {
    appendMessage(`The ${npcName} isn't here.`);
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
function consume(itemName) {
  const item = Object.values(items).find(
    i => i.name.toLowerCase() === itemName.toLowerCase()
  );
  
  if (!inventory.includes(item.id)) {
    appendMessage("You're not carrying that.");
    return;
  }
  
  if (!item.consumable) {
    appendMessage("You can't eat/drink that.");
    return;
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
  leverPlaced: false,
  shelvesMoved: false,
  wrExitOpen: false,
  smallKeyholeRevealed: false,
  discoveredLab: false,
  gardenOpen: false,
  teleGemPlaced: false,
  batteryPlaced: false,
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
  notes: {
    note1: false,
    note2: false,
    note3: false,
    note4: false,
    note5: false
  }
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

/*/ load items JSON
async function loadItems() {
  try {
    const res = await fetch("./items.json");
    const data = await res.json();
    data.forEach(item => {
      items[item.id] = item;
    });
    return true;
  } catch (err) {
    appendMessage("⚠️ Could not load items.json");
    console.error(err);
    return false;
  }
}*/

// show current room
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
    appendMessage("The toolbox is too heavy to carry for long. Try building a cart to help you move it.");
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

  // print the new room description
  appendMessage(`You move ${dir} into the ${nextRoom.id}.`);
  describeRoom(true);
  
  if (npcs.puppy.following && !flags.labExploded && !flags.winGame) {
    puppyFollow(true);
  }

  
  if (player.isInjured) {
    if (!inventory.includes("first aid kit")) {
      appendMessage("You have a minor injury. It might be a good idea to look for a first aid kit.");
    } else {
      appendMessage("You have a minor injury. Maybe you should use the first aid kit you picked up.");
    }
  }

}

// command handler
function handleCommand(cmdInput) {
  const cmd = cmdInput.trim().toLowerCase();

  if (cmd === "restart") {
    location.reload();
    return;
  }
  
  if (flags.gameLose) {
    appendMessage("The lab exploded. You're no longer among the living.\nType RESTART to play again.");
    return;
  }

  if (flags.gameWin) {
    appendMessage("You've already escaped! Refresh the page or type RESTART to play again.");
    return;
  }

  if (npcs.barista.waitingForOrder) {
    handleBaristaOrder(cmd);
    return;
  }

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
  } else if (cmd === "pick flowers") {
    pickFlowers();
  } else if (cmd === "poke" || cmd === "poke stuff") {
    handlePoke();
  } else if (cmd.startsWith("eat ")) {
      const food = cmd.substring(4).trim();
      if (!food) {
        appendMessage("Eat what?");
      } else {
       consume(food); 
      }
  } else if (cmd.startsWith("drink ")) {
    const drink = cmd.substring(6).trim();
      if (!drink) {
        appendMessage("Drink what?");
      } else {
       consume(drink); 
      }
  } else if (cmd.startsWith("build ")) {
    const target = cmd.substring(6).trim();
    if (target) {
      build(target);
    } else {
      appendMessage("Build what?");
    }
  } else if (cmd === "pull lever") {
    pullLever();
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
  } else if (cmd === "place shelf" || cmd === "place bookshelf" || cmd === "use shelf") {
    placeBookshelf();
    return;
  } else if (cmd ==="place birdhouse" || cmd === "use birdhouse") {
    placeBirdhouse();
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
  } else if (cmd === "inventory" || cmd === "check bag" || cmd === "bag") {
    showInventory();
  } else if (cmd === "read note" || cmd === "read notes" || cmd === "notes") {
    showNotes();
  } else {
    appendMessage("You can't do that.");
  }
}

// toggle help panel
function toggleHelp(show) {
  helpPanel.classList.toggle("hidden", !show);
  helpPanel.setAttribute("aria-hidden", !show);
}

// toggle notes panel
document.getElementById("notesButton").onclick = () => {
  document.getElementById("notesPanel").classList.toggle("hidden");
  renderNotesPanel();
};

// populate notes panel
function renderNotesPanel() {
  const panel = document.getElementById("notesPanel");
  panel.innerHTML = "";
  const found = Object.keys(player.notes).filter(n => player.notes[n]);

  found.forEach(n => {
    const block = document.createElement("pre");
    block.textContent = notes[n];
    panel.appendChild(block);
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
    li.textContent = item;
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
  br();
  describeRoom(true);
  appendMessage("Type a command or use the compass to move.");
  br();
  cmdInput.focus();
}

// Start when ready
window.addEventListener("DOMContentLoaded", startGame);
