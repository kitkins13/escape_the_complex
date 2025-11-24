const items = {
  lever: {
    id: "lever",
    name: "lever",
    description: "A sturdy lever that probably belongs to some machinery.",
    location: "null",
    pickupable: true,
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
      npcs.puppy.following = true;
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
    usable: false,
    giveableTo: "caretaker",
    onGive: () => {
      appendMessage("The caretaker beams. 'Oh, you found my old toolbox! Thank you!'");
      flags.givenToolbox = true;
      inventory.push("lever");
      appendMessage("The caretaker hands you a metal lever. 'You'll probably need this sooner or later.'");
    }
  },
  cart: {
    id: "cart",
    name: "cart",
    description: "A sturdy wooden cart, suitable for transporting heavy items."
  },
  bookshelf: {
    id: "bookshelf",
    name: "bookshelf",
    description: "A tall shelving unit, suitable for keeping books off the floor.",
    location: "null",
    pickupable: true
  },
  birdhouse: {
    id: "birdhouse",
    name: "birdhouse",
    description: "A simple freestanding wooden birdhouse, it might look nice in a garden.",
    location: "null",
    pickupable: true
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
    pickupable: false,
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
    usable: false,
    consumable: true,
    onConsume: () => {
      appendMessage("You drink the coffee, enjoying the robust flavour and energising caffeine.");
      inventory = inventory.filter(i => i !== "coffee");
    }
  },
  drink: {
    id: "drink",
    name: "canned drink",
    description: "A can of... something vaguely drinkable. You don't recognise the brand.",
    location: "cafe",
    pickupable: true,
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
      if (player.location === "secret room" && flags.hasTeleGem) {
        appendMessage("As you place the gem into its setting, you hear a soft electronic hum. The floor glows with an intricate pattern, and a synthetic voice says: 'Teleportation circuits activated. Press the central crystal to continue.'");
        appendMessage("You do as the voice said, and a bright light envelops you. When the light fades, you find yourself outside, free at last.");
        flags.gameWin = true;
        return;
      }
    }
  }
};
