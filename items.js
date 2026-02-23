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
        const store = rooms["cleaners' store"];
        store.exits["east"] = "hidden store";
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
      } else if (player.location === "secret room" && flags.batteryPlaced) {
        appendMessage("As you place the gem into its setting, you hear a soft electronic hum. The floor glows with an intricate pattern, and a synthetic voice says: 'Teleportation circuits activated. Please press the central crystal to continue.'");
        flags.teleGemPlaced = true;
        flags.teleporterReady = true;
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
      } else if (player.location === "secret room" && flags.teleGemPlaced) {
      appendMessage("You look around the room and find a slot near the base of the central pedestal. As you connect the object, the floor lights up with a soft glow, and a synthetic voice says: 'Power source connected. Please press the central crystal to continue.'");
        flags.batteryPlaced = true;
        flags.teleporterReady = true;
        return;
      } else {
        appendMessage("You can't use that here.");
      }
    }
  }
};
