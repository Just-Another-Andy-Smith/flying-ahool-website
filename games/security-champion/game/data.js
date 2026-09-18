"use strict"

const metamenuAchievementStorageKey = "QJS-Meta:" + settings.title + ":metamenuAchievements"
const legacyMetamenuAchievementStorageKey = "QJS:" + settings.title + ":metamenuAchievements"

function loadMetamenuAchievementsFromStorage() {
  try {
    let raw = localStorage.getItem(metamenuAchievementStorageKey)
    if (!raw) {
      raw = localStorage.getItem(legacyMetamenuAchievementStorageKey)
      if (raw) {
        localStorage.setItem(metamenuAchievementStorageKey, raw)
        localStorage.removeItem(legacyMetamenuAchievementStorageKey)
      }
    }
    return raw ? JSON.parse(raw) : {}
  }
  catch (err) {
    return {}
  }
}

function saveMetamenuAchievementsToStorage(achievements) {
  try {
    localStorage.setItem(metamenuAchievementStorageKey, JSON.stringify(achievements))
  }
  catch (err) {
    // LocalStorage may be disabled in private browsing or strict browser contexts.
  }
}

if (typeof metamenu === "undefined") {
  globalThis.metamenu = {
    achievements: loadMetamenuAchievementsFromStorage(),
    addAchievement(id, title, desc) {
      this.achievements[id] = { id, title, desc, unlocked: !!this.achievements[id]?.unlocked }
      saveMetamenuAchievementsToStorage(this.achievements)
    },
    awardAchievement(id) {
      const item = this.achievements[id]
      if (!item || item.unlocked) return

      item.unlocked = true
      saveMetamenuAchievementsToStorage(this.achievements)

      if (typeof msg === "function") {
        msg(`<br><div style="border: 2px solid #28a745; background-color: #e8f8ec; color: #155724; padding: 10px; border-radius: 5px; font-weight: bold;">
          🏆 ACHIEVEMENT UNLOCKED: ${item.title}
          <br><small style="font-weight: normal; color: #1e7e34;">${item.desc}</small>
        </div><br>`)
      }
    },
  }
}

function renderActBanner(actTitle, subtitle, detailsHtml) {
  if (typeof msg !== "function") return

  msg(`<br><div style="border: 2px solid #007bff; background-color: #f0f7ff; color: #004085; padding: 14px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
    <div style="font-size: 0.85em; text-transform: uppercase; letter-spacing: 1px; color: #0056b3; font-weight: bold;">🎯 CHAPTER MILESTONE</div>
    <div style="font-size: 1.25em; font-weight: bold; margin-top: 2px;">${actTitle}</div>
    <div style="font-style: italic; color: #17a2b8; font-weight: 500; margin-bottom: 8px;">${subtitle}</div>
    <hr style="border: 0; border-top: 1px solid #b8daff; margin: 8px 0 10px 0;">
    <div style="color: #1b1e21; font-size: 0.95em; line-height: 1.4;">${detailsHtml}</div>
  </div><br>`)
}

function renderAchievementPaneHTML() {
  const list = Object.values(globalThis.metamenu?.achievements ?? {})
    .filter(ach => ach.unlocked)

  if (!list.length) {
    return `<div class="item-nothing">No achievements unlocked yet.</div>`
  }

  const html = list.map(ach => {
    const safeTitle = String(ach.title ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    const safeDesc = String(ach.desc ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    return `<div class="pane-achievement-item" title="${safeDesc}"><span class="achievement-status">✅</span> <b class="achievement-title" title="${safeDesc}">${safeTitle}</b></div>`
  }).join("")

  return `<div class="item-list">${html}</div>`
}

settings.customUI = function() {
  if (typeof createAdditionalPane !== "function") return
  if (!document.querySelector('#achievement-list-pane-outer')) {
    createAdditionalPane(4, 'Achievements', 'achievement-list-pane', renderAchievementPaneHTML)
  }
}

function showMap() {
  if (typeof map !== 'undefined' && typeof map.update === 'function') {
    map.update()
  }
  const mapEl = document.querySelector('#quest-map')
  if (mapEl) mapEl.style.display = 'block'
}

io.getIcon = function(item) {
  if (!item) return ''

  const names = [item.name, item.alias, ...(item.synonyms || [])]
    .filter(Boolean)
    .map(s => String(s).toLowerCase())

  let iconClass = 'icon-item'

  // Legacy PNG icon values are ignored here. They are converted to the emoji CSS classes defined in the CSS.
  if (item.furniture || names.some(s => s.includes('chair') || s.includes('armchair') || s.includes('seat'))) {
    iconClass = 'icon-chair'
  } else if (names.some(s => s.includes('bug') || s.includes('bugs') || s.includes('swarm') || s.includes('pests'))) {
    iconClass = 'icon-bug'
  } else if (item.npc) {
    if (names.some(s => s.includes('peggy') || s.includes('victoria') || s.includes('morgan') ||
      s.includes('skylar') || s.includes('qa') || s.includes('lead dev') || s.includes('woman'))) {
      iconClass = 'icon-npc-f'
    } else if (names.some(s => s.includes('manager') || s.includes('chad') || s.includes('brewster') ||
      s.includes('joe') || s.includes('dave') || s.includes('gus') ||
      s.includes('neighbor') || s.includes('guard') || s.includes('man') || s.includes('analyst') || s.includes('contractor'))) {
      iconClass = 'icon-npc-m'
    } else {
      iconClass = 'icon-npc'
    }
  } else if (names.some(s => s.includes('cd') || s.includes('disc') || s.includes('cd-rom'))) {
    iconClass = 'icon-cd'
  } else if (names.some(s => s.includes('floppy') || s.includes('disk'))) {
    iconClass = 'icon-floppy'
  } else if (names.some(s => s.includes('computer') || s.includes('workstation') || s.includes('pc'))) {
    iconClass = 'icon-computer'
  } else if (names.some(s => s.includes('monitor') || s.includes('screen') || s.includes('display'))) {
    iconClass = 'icon-monitor'
  } else if (names.some(s => s.includes('terminal') || s.includes('rack') || s.includes('console') || s.includes('modem'))) {
    iconClass = 'icon-terminal'
  } else if (names.some(s => s.includes('coffee') || s.includes('mug') || s.includes('espresso'))) {
    iconClass = 'icon-coffee'
  } else if (names.some(s => s.includes('sandwich') || s.includes('soda') || s.includes('food'))) {
    iconClass = 'icon-food'
  } else if (names.some(s => s.includes('badge') || s.includes('keycard') || s.includes('card'))) {
    iconClass = 'icon-keycard'
  } else if (names.some(s => s.includes('paper') || s.includes('note') || s.includes('ticket') || s.includes('printout') || s.includes('packet') || s.includes('checklist') || s.includes('log'))) {
    iconClass = 'icon-document'
  } else if (names.some(s => s.includes('tool') || s.includes('spray') || s.includes('stapler') || s.includes('token') || s.includes('ball') || s.includes('marker'))) {
    iconClass = 'icon-tool'
  } else if (names.some(s => s.includes('umbrella'))) {
    iconClass = 'icon-umbrella'
  }

  return `<span class="item-icon ${iconClass}"></span>`
}

settings.getIcon = io.getIcon
settings.beforeEnter = function(room) {
  // Guard clause: Return true if room isn't resolved yet during game init
  if (!room) return true

  // If player isn't holding or wearing the badge
  if (!w.security_badge.isHeld() && w.security_badge.loc !== "me") {
    
    // Exception: Allow entry to entrance/reception areas and starting office without badge check
    const unbadgedAllowedRooms = ["floor1_entrance", "floor1_reception", "floor1_lobby", "office_4"]

    if (!unbadgedAllowedRooms.includes(room.name)) {
      msg("<br><b style='color:red;'>SECURITY VIOLATION:</b> You try to step into the area, but without your security badge visibly displayed, an automated door reader chimes loudly: <i>'INVALID ACCESS — DISPLAY VISIBLE TEMPEST BADGE.'</i>")
      
      if (w.security_guard.loc === player.loc) {
        msg("Officer Bishop frowns: <i>'Skyler, security protocol 101: never walk around without your badge. Go get a replacement from my station if you lost it!'</i>")
      }
      return false // Blocks movement into restricted rooms
    }
  }
  return true
}


// =============================================================================
// 1. GLOBAL GAME STATE & PUZZLE TRACKING
// =============================================================================

const puzzles = {
  // Act 1 tracking
  contractorStopped: false,
  badgeVerified: false,
  badgeScanned: false,
  tokenFound: false,
  activeRSAPasscode: 0,
  monitorSync: false,
  elevatorUnlocked: false,
  act1Complete: false,

  // Act 2 tracking
  shadowAdminFixed: false,
  threatModelComplete: false,
  keycardGiven: false,
  bugSprayGiven: false,
  printerCleared: false,
  xssFixed: false,
  s3Locked: false,
  apiKeyRevoked: false,
  act2Complete: false,
  brownNoseDone: false,

  // Act 3 tracking
  bugsSquashed: false,
  gibsonPatched: false,
  act3Complete: false,
  hasAdminCredentials: false,
  unlockedWorkstationCleared: false,
  rogueModemCut: false,
  phishStopped: false,

  // Act 4 tracking
  execClearanceGranted: false,
  networkIsolated: false,
  backupRestored: false,
  act4Complete: false,

  // Side quests & inventory stats
  coffeeCount: 0,
  hasBugSpray: false
}

// SAVE & RESTORE CONFIGURATION (FIXED)
settings.save = function() {
  return {
    puzzlesJSON: JSON.stringify(puzzles),
    achievementsJSON: JSON.stringify(globalThis.metamenu?.achievements ?? loadMetamenuAchievementsFromStorage()),
  }
}

settings.load = function(data) {
  try {
    if (data.puzzlesJSON) {
      const parsedPuzzles = JSON.parse(data.puzzlesJSON)
      Object.assign(puzzles, parsedPuzzles)
    }

    if (data.achievementsJSON && globalThis.metamenu) {
      const parsedAchievements = JSON.parse(data.achievementsJSON)
      globalThis.metamenu.achievements = parsedAchievements
      saveMetamenuAchievementsToStorage(parsedAchievements)
    }
  } catch (err) {
    console.error("Save state restore error:", err)
  }

  // FORCE MAP TO RE-CENTER ON RESTORED PLAYER LOCATION
  setTimeout(function() {
    if (typeof showMap === 'function') {
      showMap()
    }
  }, 10)
}



// Add this helper function to the top of data.js (near your puzzles object):
function triggerAutoSave(slotName) {
  if (typeof saveLoad !== "undefined") {
    // 1. Try standard saveLoad method with overwrite flag if supported
    if (typeof saveLoad.saveGame === "function") {
      saveLoad.saveGame(slotName, true)
    } 
    // 2. Fallback for QuestJS versions that use saveGameAsString / localStorage directly
    else if (typeof saveLoad.saveGameAsString === "function") {
      let data = saveLoad.saveGameAsString()
      localStorage.setItem("QuestJS_" + slotName, data)
    }
    msg(`<br><small style="color:gray;"><i>[Progress auto-saved to slot '${slotName}']</i></small>`)
  }
}



// Register Achievements in QuestJS
if (typeof metamenu !== "undefined" && metamenu.addAchievement) {
  metamenu.addAchievement("social_engineer", "No Tailgating Allowed", "Stop the suspicious contractor from tailgating through the turnstile.")
  metamenu.addAchievement("mfa_master", "Factor This!", "Calibrate the RSA SecurID key and bypass the elevator MFA lock.")
  metamenu.addAchievement("cloud_guard", "Talk to the hand", "Block public read/write access on the customer log bucket.")
  metamenu.addAchievement("jenny_number", "Don't Change Your Number", "Called Jenny and tried to leave your phone number.")
  metamenu.addAchievement("xss_slayer", "DOM Purified", "Sanitize user input in order_comments.js to defeat Stored XSS.")
  metamenu.addAchievement("clean_desk", "Lock It Or Lose It", "Enforce Clean Desk policy on the unattended basement terminal.")
  metamenu.addAchievement("sudo_chef", "I Have the Power!", "Successfully use root privileges to force Joe to make you a sandwich.")
  metamenu.addAchievement("phish_slayer", "Master Angler", "Intercepted a malicious email with an executable before a Sales rep could run it.")
  metamenu.addAchievement("vend_etta", "Vend-etta", "Administered physical percussive maintenance to dislodge a stuck soda.")
  metamenu.addAchievement("bad_luck_clue", "Most Excellent Umbrella Discovery", "Opened an umbrella indoors and uncovered a forgotten sysadmin task.")
  metamenu.addAchievement("stapler_hero", "I Believe You Have My Stapler", "Return the Red Swingline Stapler to your Security Manager.")
  metamenu.addAchievement("brown_noser", "Brown-Nose Extraordinaire", "Delivered a complete lunch order to your manager and walked away with sweet corporate swag.")
  metamenu.addAchievement("modem_slayer", "War Games Neutralized", "Located and severed the rogue 56k dial-up modem backdoor in the Telecom Closet.")
  metamenu.addAchievement("peggy_approved", "The Peggy Protocol", "Convinced Peggy the Executive Assistant to grant access to the CEO's Office.")
  metamenu.addAchievement("ciso_promoted", "Like Totally Promoted!", "Neutralize the executive ransomware and restore corporate backups.")
}

function awardMetaAchievement(id) {
  if (typeof metamenu !== "undefined" && typeof metamenu.awardAchievement === "function") {
    metamenu.awardAchievement(id)
  } else if (typeof globalThis.metamenu !== "undefined" && typeof globalThis.metamenu.awardAchievement === "function") {
    globalThis.metamenu.awardAchievement(id)
  } else if (typeof globalThis.metamenu !== "undefined" && typeof globalThis.metamenu.achievements?.[id] !== "undefined") {
    globalThis.metamenu.achievements[id].unlocked = true
    globalThis.metamenu.renderAchievements()
  }
}

// Player Entity
createItem("me", PLAYER(), {
  loc: "floor1_entrance",
  alias: "Skyler",
  synonyms: ['me', 'myself', 'skyler'],
  examine: "You are Skyler, the newly hired and appointed Security Champion.",
})




// =============================================================================
// 2. ROOM DEFINITIONS (WITH MAP COORDINATES)
// =============================================================================

// --- BASEMENT ROOMS (z: 0) ---

createRoom("basement_landing", {
  alias: "Basement Landing",
  x: 0, y: 0, z: 0,
  desc: "The basement is cold and full of old server hum. Cracked concrete and exposed copper piping make the walls feel uneasy, illuminated only by flickering fluorescent tubes.",
  south: new Exit("elevator_1", {
    use: function(char, exit) {
      if (!w.elevator_1.doorOpen) {
        w.elevator_1.doorOpen = true
        msg("You press the call button and the elevator doors slide open.")
      }
      char.moveChar(exit)
      return true
    }
  }),
  east: new Exit("basement_server_room", { msg: "You enter the basement server room." }),
  west: new Exit("basement_archive", { msg: "You step into the dusty storage archive." }),
})

createRoom("basement_archive", {
  alias: "Storage Archive",
  x: -1, y: 0, z: 0,
  desc: "Piles of deprecated tape backups, obsolete hardware, and forgotten software documentation fill this damp room. A green monochrome terminal sits on a metal workbench beneath a faded poster reading: <i>'WANT TO PLAY A GAME?'</i>",
  east: new Exit("basement_landing", { msg: "You head back to the basement landing." }),
})

createRoom("basement_server_room", {
  alias: "Basement Server Room",
  x: 1, y: 0, z: 0,
  desc: function() {
    let baseDesc = "Dusty server racks hum in the cold, frosty 58°F room. Terminal screens flicker with commit logs and legacy system readouts waiting to be examined."
    if (!puzzles.bugsSquashed) {
      baseDesc += "<br><br><b>WARNING:</b> A swarm of massive, chittering server bugs (both literal insects attracted to heat and physical manifestations of unhandled race conditions) is crawling over <b>Server Rack #7 (The Gibson)</b>, blocking access to the terminal!"
    } else {
      baseDesc += "<br><br>Server Rack #7 (The Gibson) sits clear of pests, its terminal screen glowing softly in the cool blue light."
    }
    return baseDesc
  },
  west: new Exit("basement_landing", { msg: "You head back to the basement landing." }),
})

// --- FLOOR 1 ROOMS (z: 1) ---
createRoom("floor1_entrance", {
  alias: "HQ Plaza & Main Entrance",
  x: 2, y: 0, z: 1,
  desc: function() {
    let s = "Outside, heavy rain drumbeats against the architectural glass canopy covering the entrance plaza. Taxis and commuter shuttles splash through the circular drop-off loop, while a brass plaque beside the entrance reads: <i>'Tempest Weatherwear HQ — World Headquarters'</i>."
    if (!w.onboarding_packet.isHeld()) {
      s += "<br><br>Standing near the revolving glass doors under the canopy is <b>Morgan, the Incident Response Lead</b>. She catches your eye and waves you over to hand you your day-one paperwork."
    }
    return s
  },
  west: new Exit("floor1_reception", { msg: "You push through the heavy glass revolving doors into the building." }),
})

createRoom("floor1_reception", {
  alias: "Security Turnstiles & Visitor Check-In",
  x: 1, y: 0, z: 1,
  desc: function() {
    let s = "A row of optical speed-gates and security turnstiles controls access to the main building atrium to the west. A small security desk with a badge printer sits beside the turnstiles."
    if (!puzzles.contractorStopped) {
      s += "<br><br>A suspicious contractor wearing a high-vis vest and holding a clipboard is loitering near the visitor turnstile line."
    }
    s += "<br><br>Officer Bishop stands duty behind the check-in desk operating a desktop card printer."
    return s
  },
  west: new Exit("floor1_lobby", {
    use: function(char, exit) {
      if (!puzzles.contractorStopped) {
        msg("Officer Bishop steps out: <i>'Hold on! Someone is tailgating in the reception line. We need to clear that up before letting anyone through the turnstiles.'</i>")
        return false
      }
      if (!puzzles.badgeVerified) {
        msg("<b>*BZZZZT!*</b> You step toward the speed-gates, but the optical sensors flash red and the barrier arms lock tight.")
        msg("Officer Bishop calls out from behind the desk: <i>'Before you can head through the turnstiles into the atrium, I need to see your driver's license and print you a badge!'</i>")
        return false
      }
      msg("You swipe your badge at the turnstile and walk through into the main lobby atrium.")
      char.moveChar(exit)
      return true
    }
  }),
  east: new Exit("floor1_entrance", { msg: "You push back out through the revolving doors onto the rainy plaza." }),
  south: new Exit("security_office", {
    use: function(char, exit) {
      if (!w.security_office_door.isOpen) {
        if (!puzzles.badgeScanned) {
          msg("The heavy security door is locked tight. The scanner flashes red: <b>SCAN SECURITY BADGE TO ENTER</b>.")
        } else {
          msg("The heavy security door is closed. You'll need to open it before stepping through!")
        }
        return false // Blocks entry
      }
      msg("You step through the open doorway into the Security Office.")
      char.moveChar(exit)
      return true
    }
  }),
})

createRoom("floor1_lobby", {
  alias: "Main Atrium Lobby",
  x: 0, y: 0, z: 1,
  desc: "The spacious atrium of Tempest Weatherwear HQ features slick granite floors, a giant glass display case showcasing the evolution of the Tempest 'StormShield 5000' trenchcoat, and the hum of the main elevator bank to the south.",
  north: new Exit("floor1_hallway", { msg: "You walk into the office hallway." }),
  west: new Exit("floor1_facilities", { msg: "You open the door to the facilities closet." }),
  south: new Exit("elevator_1", {
    use: function(char, exit) {
      if (!canOpenElevatorDoorsFromFloor("floor1_lobby")) {
        msg("The elevator doors are locked shut. The call button panel flashes red: 'ACCESS DENIED — MULTI-FACTOR AUTH REQUIRED'.")
        return false
      }
      if (!w.elevator_1.doorOpen) {
        w.elevator_1.doorOpen = true
        msg("You press the call button and the lobby elevator doors slide open.")
      }
      msg("You swipe your badge, verify your MFA code, and step into the elevator car.")
      char.moveChar(exit)
      return true
    }
  }),
  east: new Exit("floor1_reception", { msg: "You walk back toward the reception turnstiles." }),
})

createRoom("floor1_facilities", {
  alias: "Facilities Closet",
  x: -1, y: 0, z: 1,
  desc: "Cleaning supplies, spare network cables, and ladder maintenance tools are stored neatly here. A heavy steel door to the north opens into the Telco Patch Bay.",
  east: new Exit("floor1_lobby", { msg: "You step back out into the lobby." }),
  north: new Exit("floor1_telecom_closet", { msg: "You push open the heavy door into the cramped Telecom Closet." }),
})

createRoom("floor1_telecom_closet", {
  alias: "Telecom & Patch Bay Closet",
  x: -1, y: 1, z: 1,
  desc: function() {
    let s = "A cramped, warm closet filled with wall-mounted 110 punch-down blocks, tangled bundles of blue CAT5 cables, and a flickering 19-inch rack."
    if (!puzzles.rogueModemCut) {
      s += "<br><br><b>NOISE ALERT:</b> A high-pitched dial-up handshake (<i>BEEP-BOOP-KSHHHHHHH</i>) is screeching from a rogue USRobotics 56k modem mounted near the top of the rack! A red activity light blinks rapidly as an unauthorized inbound connection bypasses the main firewall."
    } else {
      s += "<br><br>The modem rack sits silent. The rogue RJ11 line hangs unplugged, and the firewall perimeter is fully secured."
    }
    return s
  },
  south: new Exit("floor1_facilities", { msg: "You step back into the main facilities closet." }),
})

createRoom("floor1_hallway", {
  alias: "First Floor Hallway",
  x: 0, y: 1, z: 1,
  desc: "The central hallway connects the main lobby to the Leaky Mug Café.",
  south: new Exit("floor1_lobby", { msg: "You head back to the lobby." }),
  east: new Exit("leaky_mug_cafe", { msg: "You walk into the Security Champion Café." }),
})

createRoom("leaky_mug_cafe", {
  alias: "The Leaky Mug Café",
  x: 1, y: 1, z: 1,
  desc: function() {
    let baseDesc = "The official IT café for Tempest Weatherwear & Gear employees. It smells faintly of burnt espresso and vulcanized boot rubber. A dusty banner near the coffee pot proudly proclaims: 'Tempest: Weathering the Corporate Storm Since 1978.'"
    if (player.loc === "leaky_mug_cafe" && !puzzles.s3Locked && puzzles.act1Complete) {
      baseDesc += "<br><br>Sitting at a corner table with a sandwich and a glowing laptop is Morgan, the Incident Response Lead."
    }
    return baseDesc
  },
  west: new Exit("floor1_hallway", { msg: "You step back into the main hallway." }),
})

createRoom("security_office", {
  alias: "Badge & Security Office",
  x: 1, y: -1, z: 1,
  desc: "A narrow office with monitors, a bright badge printer, and a map of the building on the wall. A desk in the corner holds grey RSA SecurID keys.",
  north: new Exit("floor1_reception", { msg: "You leave the office and step back into the reception area." }),
})

// --- ELEVATOR BANK ---

function setElevatorMapLocation(dest) {
  const mapLocation = w.elevator_1.locations?.find(location => location.connectedRoom.name === dest)
  if (!mapLocation) return

  w.elevator_1.mapCurrentConnection = w.elevator_1.locations.indexOf(mapLocation)
  w.elevator_1.mapX = mapLocation.mapX
  w.elevator_1.mapY = mapLocation.mapY
  w.elevator_1.mapZ = mapLocation.mapZ
  w.elevator_1.mapRegion = mapLocation.mapRegion
}

function closeElevatorDoors() {
  w.elevator_1.doorOpen = false
  w.elevator_1.currentFloor = player.loc
  setElevatorMapLocation(player.loc)
}

function canOpenElevatorDoorsFromFloor(roomName) {
  if (roomName === "floor1_lobby") {
    return puzzles.monitorSync || puzzles.elevatorUnlocked
  }
  return true
}

function tryOpenElevatorDoorsFromFloor(roomName, char, exit) {
  if (!canOpenElevatorDoorsFromFloor(roomName)) {
    msg("The elevator doors remain locked tight. The lobby panel flashes red: <b>ACCESS DENIED — RSA TOKEN REQUIRED</b>.")
    return false
  }

  if (w.elevator_1.doorOpen) {
    msg("The elevator doors are already open.")
    char.moveChar(exit)
    return true
  }

  w.elevator_1.doorOpen = true
  msg("You press the elevator call button. The doors slide open with a soft chime.")
  char.moveChar(exit)
  return true
}

function closeElevatorDoorsAfterArrival(destRoom) {
  w.elevator_1.doorOpen = false
  w.elevator_1.currentFloor = destRoom
  setElevatorMapLocation(destRoom)
}

createRoom("elevator_1", {
  alias: "Elevator Car",
  mapMoveableLoc: true,
  transitDoorDir: "north",
  saveLoadExcludedAtts: ["locations"],
  mapIgnore: false,
  beforeEnter: function() {
    const enteredFrom = player.previousLoc
    const connectedToEntry = w.elevator_1.locations?.some(location => location.connectedRoom.name === enteredFrom)
    setElevatorMapLocation(connectedToEntry ? enteredFrom : w.elevator_1.currentFloor || "floor1_lobby")
  },
  desc: "The interior of the elevator features a sleek digital panel with illuminated buttons:<br/><b>[4] Floor 4 (Executive Suites)<br/>[3] Floor 3 (Dev Offices) <br/>[2] Floor 2 (DevOps) <br/>[1] Floor 1 (Lobby) <br/>[B] Basement </b>",
  north: new Exit("floor1_lobby", {
    use: function(char, exit) {
      let dest = w.elevator_1.currentFloor || "floor1_lobby"

      if (typeof world.gotoRoom === 'function') {
        world.gotoRoom(dest)
      } else {
        char.moveChar(new Exit(dest))
      }

      closeElevatorDoorsAfterArrival(dest)

      if (dest === "floor1_lobby") msg("The doors slide shut behind you and you step out into the Floor 1 Lobby.")
      else if (dest === "floor2_landing") msg("The doors slide shut behind you and you step out onto the Floor 2 DevOps Landing.")
      else if (dest === "floor3_landing") msg("The doors slide shut behind you and you step out onto the Floor 3 Developer Office Landing.")
      else if (dest === "floor4_landing") msg("The doors slide shut behind you and you step onto the plush carpet of Floor 4 Executive Lobby.")
      else if (dest === "basement_landing") msg("The doors slide shut behind you and you step out into the cold Basement Landing.")

      if (typeof showMap === 'function') {
        showMap()
      }
      return true
    }
  }),
})
w.elevator_1.currentFloor = "floor1_lobby"
w.elevator_1.doorOpen = false

// --- FLOOR 2 ROOMS (z: 2) ---

createRoom("floor2_landing", {
  alias: "Developer Pair Programming Landing",
  x: 0, y: 0, z: 2,
  desc: "The landing buzzes with the click of mechanical keyboards. Whiteboards are covered in index cards for 3-week XP iterations, user stories, and CRC (Class-Responsibility-Collaboration) card stacks.",
  south: new Exit("elevator_1", {
    use: function(char, exit) {
      return tryOpenElevatorDoorsFromFloor("floor2_landing", char, exit)
    }
  }),
  west: new Exit("floor2_meeting_room", { msg: "You step into the Security Operations Meeting Room." }),
  east: new Exit("floor2_dev_area", { msg: "You enter the developer workspace." }),
  north: new Exit("floor2_sales", { msg: "You walk through the glass doors into the Sales Department." }),
})

createRoom("floor2_sales", {
  alias: "Sales & Client Acquisition Department",
  x: 0, y: 1, z: 2,
  desc: "A sprawling floor of grey fabric cubicles buzzing with rapid-fire phone chatter and the clicking of mechanical keypads. Sales reps pacing in headsets talk prospective clients through Tempest's enterprise coat fleet pricing. Foam stress balls, oversized novelty checks, and brass 'President's Club' awards clutter every desk.",
  south: new Exit("floor2_landing", { msg: "You step back onto the Floor 2 landing." }),
  west: new Exit("sales_director_office", { msg: "You push open the frosted glass door into the Sales Director's office." }),
})

createRoom("sales_director_office", {
  alias: "Sales Director's Office",
  x: -1, y: 1, z: 2,
  desc: "A corner office featuring polished mahogany trim, an artificial ficus tree, and a mini-putting green stretched across the carpet. Framed revenue bar charts adorn the walls, though the Q4 projections have been hastily updated in red marker with question marks.",
  east: new Exit("floor2_sales", { msg: "You step back out into the main sales floor." }),
})

createRoom("floor2_meeting_room", {
  alias: "Security Operations Meeting Room",
  x: -1, y: 0, z: 2,
  desc: function() {
    let s = "A large conference room featuring a prominent whiteboard for architectural reviews."
    if (!puzzles.threatModelComplete) {
      s += " The whiteboard is filled with scattered system diagrams waiting to be analyzed."
    } else {
      s += " The whiteboard displays a complete Threat Model pointing directly to Legacy Server Rack #7 in the Basement."
    }
    return s
  },
  east: new Exit("floor2_landing", { msg: "You return to the elevator landing." }),
})

createRoom("floor2_dev_area", {
  alias: "Developer Area",
  x: 1, y: 0, z: 2,
  desc: "Desks are cluttered with dual monitors, mechanical keyboards, and half-tested samples of waterproof rubber boot linings. The bathroom is to the south and double doors to the north open into the employee breakroom, while a hallway banner overhead reads: 'Quality Code is Like a Good Umbrella: Zero Leaks Allowed.'",
  west: new Exit("floor2_landing", { msg: "You return to the landing." }),
  east: new Exit("floor2_devops", { msg: "You walk into the Build & Release Lab." }),
  north: new Exit("floor2_breakroom", { msg: "You push open the double doors into the employee breakroom." }),
  south: new Exit("floor2_restroom", {
    use: function(char, exit) {
      msg("You reach for the restroom door handle, but the deadbolt is locked firm.")
      msg("A muffled, polite voice responds from inside: <i>'Occupied! Just give me a minute, please!'</i>")
      return false // Blocks movement
    }
  }),
})

createRoom("floor2_restroom", {
  alias: "Floor 2 Restroom Door",
  x: 1, y: -1, z: 2,
  desc: "A brass deadbolt indicator displays a red ('OCCUPIED') message.",
  north: new Exit("floor2_dev_area", { msg: "You step back into the developer area." }),
})

createItem("floor2_restroom_door", {}, {
  loc: "floor2_dev_area",
  alias: "restroom door",
  synonyms: ['door', 'bathroom door', 'restroom door', 'restroom', 'bathroom', 'lock', 'handle'],
  icon: () => 'chair',

  examine: "A solid wooden door set into the south wall with a brass deadbolt indicator showing red ('OCCUPIED').",

  getVerbs: function() {
    return [
      { name: 'Examine', action: 'examine %' },
      { name: 'Knock on', action: 'knock on %' },
      { name: 'Try Handle', action: 'open %' },
    ]
  },

  open: function() {
    return executeTryRestroomDoor()
  },
  knock: function() {
    return executeTryRestroomDoor()
  }
})

function executeTryRestroomDoor() {
  msg("<b>*RATTLE-RATTLE*</b> You turn the brass handle, but the deadbolt is locked firm.")
  msg("A muffled, polite voice responds from inside: <i>'Occupied! Just give me a minute, please!'</i>")
  return world.SUCCESS
}

// Helper logic when trying to open or knock on the bathroom door
function executeTryRestroomDoor() {
  msg("<b>*RATTLE-RATTLE*</b> You turn the door handle, but the deadbolt is locked firm.")
  msg("A muffled, polite voice responds from inside: <i>'Occupied! Just give me a minute, please!'</i>")
  return world.SUCCESS
}

createRoom("floor2_breakroom", {
  alias: "Floor 2 Breakroom",
  x: 1, y: 1, z: 2,
  desc: function() {
    let s = "A classic corporate breakroom smelling of burnt microwave popcorn and stale coffee grounds. Formica tables sit surrounded by mismatched plastic chairs, and a bulletin board is pinned with faded memos."
    if (!puzzles.vendingShaken) {
      s += "<br><br>Near the water cooler stands a heavy <b>Vend-o-Matic 3000</b> vending machine. Inside, cold cans of <b>Surge</b> and <b>Jolt</b> are precariously chilled to perfection!"
    } else {
      s += "<br><br>The Vend-o-Matic 3000 stands quiet. A dent near the bottom coin return marks where percussive maintenance was administered."
    }
    return s
  },
  south: new Exit("floor2_dev_area", { msg: "You step back into the main developer workspace." }),
})


createRoom("floor2_devops", {
  alias: "Build & Release Lab",
  x: 2, y: 0, z: 2,
  desc: "CRT monitors hum beside high-speed automated build servers and dot-matrix printers. Red warning lights blink near a nightly build workstation running an automated batch script configured with excessive domain admin privileges.",
  west: new Exit("floor2_dev_area", { msg: "You head back toward the main developer area." }),
})

// --- FLOOR 3 ROOMS (z: 3) ---

createRoom("floor3_landing", {
  alias: "Developer Office Landing",
  x: 0, y: 0, z: 3,
  desc: "A bright landing area decorated with developer team photos and regional software awards. Double doors open west to team review rooms and east to individual developer offices.",
  north: new Exit("floor3_meeting_a1", { msg: "You walk into a large meeting room." }),
  south: new Exit("elevator_1", {
    use: function(char, exit) {
      return tryOpenElevatorDoorsFromFloor("floor3_landing", char, exit)
    }
  }),
  west: new Exit("floor3_meeting_b", { msg: "You enter Meeting Room B." }),
  east: new Exit("floor3_office_corridor", { msg: "You enter the main developer office corridor." }),
})

createRoom("floor3_meeting_b", {
  alias: "Meeting Room B",
  x: -1, y: 0, z: 3,
  desc: "A medium-sized conference room with a large screen and modular seating.",
  east: new Exit("floor3_landing", { msg: "You head back to the landing." }),
})

createRoom("floor3_meeting_a1", {
  alias: "Large Meeting Room A1",
  x: 0, y: 1, z: 3,
  desc: "The western side of the executive board room featuring a mahogany table and panoramic views of the city.",
  west: new Exit("floor3_meeting_a2", { msg: "You walk over to the western side of the room." }),
  south: new Exit("floor3_landing", { msg: "You step back into the landing." }),
})

createRoom("floor3_meeting_a2", {
  alias: "Large Meeting Room A2",
  x: -1, y: 1, z: 3,
  desc: "The eastern side of the executive board room featuring a mahogany table and panoramic views of the city.",
  east: new Exit("floor3_meeting_a1", { msg: "You step back into the eastern side of the room." }),
})


createRoom("floor3_office_corridor", {
  alias: "Developer Office Corridor",
  x: 1, y: 0, z: 3,
  desc: "A hallway lined with developer office doors numbered 1 through 8. Office 4 (your office) sits to the north, Office 5 (your manager) sits to the south, and Office 8 (Incident Response) sits to the east.",
  west: new Exit("floor3_landing", { msg: "You return to the Floor 3 landing." }),
  north: new Exit("office_4", { msg: "You enter your office." }),
  south: new Exit("office_5", { msg: "You enter your manager's office." }),
  east: new Exit("office_8", { msg: "You enter Office 8 (Incident Response Office)." }),
})

createRoom("office_4", {
  alias: "Office 4 — Skyler's Desk",
  x: 1, y: 1, z: 3,
  desc: "Your workstation sits near the window overlooking the city skyline. On your desk sits a novelty umbrella desk lamp, a Tempest Security Champion poster, and your onboarding checklist.",
  south: new Exit("floor3_office_corridor", { msg: "You step back into the office corridor." }),
})

createRoom("office_5", {
  alias: "Office 5 — Security Manager's Office",
  x: 1, y: -1, z: 3,
  desc: "A neat, organized office belonging to your Security Manager. A mahogany desk sits against the back wall, topped with a rain-sound white noise machine and a glass paperweight shaped like a tempest storm cloud.",
  north: new Exit("floor3_office_corridor", { msg: "You step back into the office corridor." }),
})

createRoom("office_8", {
  alias: "Office 8 — Incident Response Office",
  x: 2, y: 0, z: 3,
  desc: "A high-tech office lined with threat intelligence feeds, incident triage monitors, and empty coffee mugs. This is Morgan's main workstation when she isn't in the field.",
  west: new Exit("floor3_office_corridor", { msg: "You step back out into the office corridor." }),
})

// --- FLOOR 4 ROOMS (z: 4) ---

createRoom("floor4_landing", {
  alias: "Floor 4 — Executive Suite Landing",
  x: 0, y: 0, z: 4,
  desc: "Plush mahogany paneling and sound-dampening carpet replace the industrial feel of the lower floors. Double glass doors decorated with the gold Tempest logo lead north into the Executive Lobby.",
  south: new Exit("elevator_1", {
    use: function(char, exit) {
      return tryOpenElevatorDoorsFromFloor("floor4_landing", char, exit)
    }
  }),
  north: new Exit("floor4_lobby", { msg: "You step through the glass doors into the Executive Lobby." }),
  east: new Exit("exec_telecom_closet", {
    use: function(char, exit) {
      if (!puzzles.execAccessApproved) {
        msg("The heavy steel door to the server closet is locked tight. The scanner flashes red: <b>ACCESS DENIED — EXECUTIVE CLEARANCE REQUIRED</b>.")
        msg("Peggy leans around the corner and looks over her glasses: <i>'That closet holds our offline disaster recovery servers. Clear triage protocol with me before pushing through!'</i>")
        return false
      }
      msg("The biometric lock clicks green, and the heavy acoustic steel door unlatches.")
      char.moveChar(exit)
      return true
    }
  }),
})

createRoom("floor4_lobby", {
  alias: "Floor 4 — Executive Lobby",
  x: 0, y: 1, z: 4,
  desc: function() {
    let s = "An immaculate waiting lounge featuring leather armchairs and a floor-to-ceiling view of the city skyline. Crimson warning icons flash on every wall-mounted display: <i>'ALL FILES ENCRYPTED — CONTACT YOUR SYSTEM ADMINISTRATOR.'</i>"
    if (!puzzles.execAccessApproved) {
      s += "<br><br>Behind a polished mahogany desk sits <b>Peggy</b>, the Executive Assistant to the CEO. She is calmly reviewing printouts while managing a multi-line desk phone. Biometric scanners glow red beside the doors leading west into the CEO's Office and east into the Executive Telecom & Backup Closet."
    } else {
      s += "<br><br>Peggy's desktop console hums quietly. The biometric scanners beside the office door to the west and the server closet to the east glow steady green."
    }
    return s
  },
  south: new Exit("floor4_landing", { msg: "You step back out to the elevator landing." }),
  
  // CEO Office Door 
  east: new Exit("ceo_office", {
    use: function(char, exit) {
      if (!puzzles.execAccessApproved) {
        msg("You reach for the double doors to the CEO's office, but the biometric scanner flashes red: <b>ACCESS DENIED — GATEKEEPER APPROVAL REQUIRED</b>.")
        msg("Peggy steps out from behind her desk: <i>'Hold on right there! Ms. Sterling is in a high-priority meeting regarding an emergency. No one enters without verified Incident Response credentials.'</i>")
        msg("<i>(Talk to Peggy or show her your Tempest Notebook to verify credentials!)</i>")
        return false
      }
      msg("The biometric scanner chimes green as Peggy buzzes you through: <i>'Go right in, Skyler. She's waiting for you!'</i>")
      char.moveChar(exit)
      return true
    }
  }),
  west: new Exit("executive_boardroom", { msg: "You step into a very large and very expensive looking boardroom." }),  
})

createRoom("ceo_office", {
  alias: "CEO Corner Office",
  x: 1, y: 1, z: 4,
  desc: function() {
    let baseDesc = "A spacious corner office with polished mahogany furniture. CEO Victoria Sterling and your Security Manager are huddled behind the desk in crisis mode. On her 21-inch Sony Trinitron CRT monitor, a pixelated skull-and-crossbones graphic displays a countdown timer: <b>00:14:59 UNTIL PRIVATE DATA LEAK</b>."
    if (!puzzles.networkIsolated) {
      baseDesc += "<br><br>The red light on the network gateway switch under the desk is blinking frantically as ransomware attempts to exfiltrate files to an offsite C2 server!"
    } else {
      baseDesc += "<br><br>The network gateway switch is isolated (air-gapped), severing the ransomware's command-and-control connection."
    }
    return baseDesc
  },
  west: new Exit("floor4_lobby", { msg: "You exit back into the Executive Lobby." }),
})


createRoom("executive_boardroom", {
  alias: "Executive Boardroom (North)",
  x: -1, y: 1, z: 4,
  desc: "The northern half of the sprawling executive boardroom features a massive, high-gloss mahogany table surrounded by plush leather swivel chairs. A silver Polycom triangular conference phone sits dead center on a glass trivet. Framed corporate art line the walls, including a dramatic photo of a mountain climber under the header: <i>'TEAMWORK: Teamwork makes the Dream Work.'</i>",
  east: new Exit("floor4_lobby", { msg: "You return to the Executive Lobby." }),
  south: new Exit("boardroom_2", { msg: "You walk to the southern end of the boardroom." }),
})

createRoom("boardroom_2", {
  alias: "Executive Boardroom (South)",
  x: -1, y: 0, z: 4,
  desc: "The southern end of the boardroom opens up into an executive briefing lounge. A motorized projection screen hangs from the ceiling above a brass-trimmed credenza stocked with sparkling water bottles and cloth napkins. A second motivational poster depicts an eagle soaring over a canyon: <i>'LEADERSHIP: Eagles don't flock, you have to find them one at a time.'</i>",
  north: new Exit("executive_boardroom", { msg: "You walk to the northern end of the boardroom." }),
  east: new Exit("floor4_landing", { msg: "You step back out onto the Floor 4 landing." }),
})


createRoom("exec_telecom_closet", {
  alias: "Executive Telecom & Server Closet",
  x: 1, y: 0, z: 4,
  desc: "A quiet, climate-controlled server room humming at a cool 62°F. Cable trays channel neat bundles of fiber optic line along the ceiling. At the center rack sits an air-gapped <b>Offline Backup Domain Controller</b> console used exclusively for disaster recovery.",
  west: new Exit("floor4_landing", { msg: "You step back out into the Executive Landing." }),
})


// =============================================================================
// 3. ITEMS & NPCS DEFINITIONS
// =============================================================================

// --- ACT 1 ITEMS & NPCS ---
createItem("drivers_license", TAKEABLE(), {
  loc: "me",
  alias: "driver's license",
  synonyms: ['license', 'id', 'drivers license', 'photo id', 'card'],
  examine: "An official state driver's license bearing your name (Skyler) and photo. Essential for day-one HR onboarding!",
  getVerbs: function() {
    return [
      { name: 'Examine', action: 'examine %' },
      { name: 'Show Guard', action: 'show % to guard' },
    ]
  }
})

createItem("security_badge", WEARABLE(2, ['chest', 'lanyard']), {
  loc: false, // Spawns when Officer Bishop prints it!
  worn: false,
  alias: "security badge",
  synonyms: ['badge', 'id badge', 'keycard badge', 'lanyard'],
  examine: function() {
    let state = this.worn ? " (clipped to your lanyard)" : " (in your hand)"
    return "A crisp, freshly printed Tempest Weatherwear ID badge bearing your photo, name, and employee ID #423612" + state + ". It has an NFC chip and an Anti-Tamper Hologram with a small message that reads: <i>'SECTEC ASTRONOMY Security Corp.'</i>"
  },
  drop: function() {
    msg("You unclip your Tempest security badge and drop it onto the floor. Leaving credentials unattended feels like a major physical security violation!")
    this.loc = player.loc
    return world.SUCCESS
  }
})


createItem("contractor", NPC(), {
  loc: "floor1_reception",
  alias: "contractor",
  synonyms: ['contractor', 'suspicious contractor', 'man', 'vest'],
  examine: function() {
    if (puzzles.contractorStopped) {
      msg("The contractor is gone.")
    } else {
      msg("A guy in a high-vis neon vest carrying a clipboard and a step ladder, trying far too hard to look like an authorized technician. The embroidered logo on his vest reads: <i>'CyberDyne-ish IT Logistics — \"Building a Better Judgment-Free Tomorrow\"'</i> above a pixelated floppy disk graphic. Notably missing from his vest: a valid Tempest visitor badge.")
    }
  },
  getVerbs: function() {
    if (puzzles.contractorStopped) return []
    return [
      { name: 'Examine', action: 'examine %' },
      { name: 'Talk to', action: 'talk to %' },
      { name: 'Demand ID', action: 'confront %' },
    ]
  },
  talkto: function() {
    if (puzzles.contractorStopped) {
      msg("He's no longer here.")
    } else {
      msg("You ask the contractor who he's visiting. He stammers: 'Oh, uh... HVAC maintenance? I mean, I am here for an IT server delivery? I lost my ticket, but can you just tap me through the turnstile?' His story doesn't add up.")
    }
  },
})


createItem("security_guard", NPC(), {
  loc: "floor1_reception",
  alias: "security guard",
  synonyms: ['guard', 'security guard', 'officer', 'desk guard', 'bishop', 'officer bishop'],
  examine: "Officer Bishop sits behind the lobby security desk, reviewing access logs and operating a webcam attached to a desktop card printer.",
  getVerbs: function() {
    const verbs = [
      { name: 'Examine', action: 'examine %' },
      { name: 'Talk to', action: 'talk to %' }
    ]
    if (w.drivers_license.isHeld() && !puzzles.badgeVerified) {
      verbs.push({ name: 'Show ID', action: 'show license to %' })
    }
    return verbs
  },
  talkto: function() {
    // 1. FIRST DAY CHECK: Player hasn't shown Driver's License yet
    if (!puzzles.badgeVerified) {
      msg("Officer Bishop: <i>'Welcome to your first day at Tempest, Skyler! Before I can print your building keycard, I need to see your <b>driver's license</b> for identity verification.'</i>")
      msg("<i>(Type <b>show license to guard</b> or use the verb menu on your driver's license!)</i>")
      return world.SUCCESS
    }

    if (!w.onboarding_packet.isHeld() && !puzzles.elevatorUnlocked) {
      msg("Officer Bishop nods toward the entrance: <i>'You may want to grab your onboarding checklist from Morgan over by the display case.  She's been waiting for you!'</i>")
      return world.SUCCESS
    }


    // 2. DROPPED BADGE CHECK: Badge is printed, but not currently held or worn by player
    if (!w.security_badge.isHeld() && w.security_badge.loc !== "me") {
      // Case A: Badge is lying on the floor in the Lobby
      if (w.security_badge.loc === "floor1_lobby") {
        msg("Officer Bishop points to the floor near your feet: <i>'Skyler, your badge is literally lying right there on the tile. Pick it up before someone else turns it into lost-and-found!'</i>")
        return world.SUCCESS
      }
      
      // Case B: Badge is lost somewhere else in the building -> Issue a replacement!
      w.security_badge.loc = "me"
      w.security_badge.worn = true
      msg("Officer Bishop sighs, shakes his head, and keys something into his desktop console.")
      msg("<b>*BZZZZT-CLACK*</b> The badge printer hums to life and spits out a fresh ID card.")
      msg("Officer Bishop: <i>'I printed you a replacement ID #423612 badge. Keep it clipped to your lanyard this time—we record credential re-issuance on quarterly performance reviews!'</i>")
      return world.SUCCESS
    }

    // 3. TAILGATER INCIDENT CHECK
    if (!puzzles.contractorStopped) {
      msg("Officer Bishop: <i>'Please clear up that tailgating incident at the entrance before proceeding down the hallway.'</i>")
      return world.SUCCESS
    }

    // 4. UNLOCKED ELEVATOR / MFA RSA SecurID key CHECK
    if (!puzzles.elevatorUnlocked && !puzzles.tokenFound) {
      msg("Officer Bishop: <i>'Your identity is verified, Skyler. Head to the south to the Security Office to grab your RSA SecurID key so you can get through the elevator panel!'</i>")
      return world.SUCCESS
    }

    // 5. FRIENDLY REPEAT DIALOGUE (Elevator already unlocked)
    msg("Officer Bishop gives you a warm wave from behind his monitors: <i>'Hey Skyler! Hope your first day is going well.'</i>")
    return world.SUCCESS
  }
})


createItem("security_analyst", NPC(), {
  loc: "floor1_lobby",
  alias: "IT Security Analyst",
  synonyms: ['analyst', 'security analyst', 'it analyst', 'coworker'],
  examine: "An IT Security Analyst wearing a Tempest lanyard and holding a clipboard.",
  getVerbs: function() {
    return [
      { name: 'Examine', action: 'examine %' },
      { name: 'Talk to', action: 'talk to %' },
    ]
  }, 
  talkto: function() {
    if (!puzzles.contractorStopped) {
      msg("The IT Security Analyst squints past your shoulder: <i>'Whoa, Skyler... who is that standing right behind you? Did they swipe in at the turnstile, or are they tailgating you?'</i>")
      return world.SUCCESS
    }
    if (!puzzles.badgeVerified) {
      msg("Security Analyst: <i>'Skyler, congratulations on becoming the Security Champion for our team! Make sure Officer Bishop prints your official badge before you venture further into the building.'</i>")
      return world.SUCCESS
    }
    
    // Dynamic post-onboarding dialogue pool
    const analystQuotes = [
      "<i>'Nice work handling that tailgating attempt earlier. Physical security is always line item #1 on our audit compliance reports.'</i>",
      "<i>'I heard someone in Sales tried to run an untrusted executable yesterday. Keep an eye out when you get up to Floor 2.'</i>",
      "<i>'If you're heading up to the Dev wing, watch out for Chad. He's trying to push three release builds before the 5:00 PM deadline.'</i>"
    ]
    const randomQuote = analystQuotes[Math.floor(Math.random() * analystQuotes.length)]
    msg(`IT Security Analyst adjusts his lanyard and smiles:<br>${randomQuote}`)
    return world.SUCCESS
  }
})

createItem("time_sync_token", TAKEABLE(), {
  loc: "security_office",
  alias: "RSA SecurID fob",
  synonyms: ['token', 'time sync token', 'mfa token', 'hardware token', 'rsa securid', 'rsa key', 'securid', 'fob', 'key fob', 'rsa'],
  examine: function() {
    // Generate and lock in a new random passcode on examine
    const newCode = String(Math.floor(100000 + Math.random() * 900000))
    puzzles.activeRSAPasscode = newCode

    msg(`A heavy plastic keychain fob featuring a small monochrome LCD screen.<br>The digital timer bar ticks down as the screen displays a rolling passcode: <b style="letter-spacing: 2px;">[ ${newCode} ]</b>.<br><i>(Remember this code and type <b>enter code ${newCode}</b> at the MFA terminal.)</i>`)
  },
  take: function() {
    puzzles.tokenFound = true
    msg("You pick up the RSA SecurID key fob. Examine the fob to read the rolling 6-digit code off its LCD display.")
    this.loc = "me"
    return world.SUCCESS
  }
})


createItem("mfa_monitor", {
  loc: "floor1_lobby",
  alias: "MFA Monitor",
  synonyms: ['monitor', 'screen', 'mfa monitor', 'display', 'terminal'],
  examine: function() {
    if (puzzles.monitorSync) {
      const code = puzzles.currentRSAPasscode || 'VERIFIED'
      msg("The CRT monitor screen displays a crisp green prompt: <b>MFA TIME-SYNC VERIFIED — AUTHORIZATION CODE: ${code}</b>.")
    } else {
      msg("The amber-monochrome CRT screen displays the central elevator access terminal.<br>Prompt: <code>ENTER 6-DIGIT RSA SECURID PASSCODE: [ ______ ]</code>.<br><i>(Examine your RSA SecurID fob to read the current rolling 6-digit code, then type <b>enter code [number]</b>.)</i>")    }
  }
})

createItem("lineman_phone", {}, {
  loc: "floor1_telecom_closet",
  alias: "wall-mounted test telephone",
  synonyms: ['phone', 'test phone', 'butt set', 'lineman set', 'telephone', 'handset', 'wall phone'],
  icon: () => 'tool',
  examine: "A rugged yellow Harris Dracon craftsman telephone mounted securely to the plywood backboard beside the 110 punch-down blocks. Its coiled black cord hangs down to a heavy rubber handset with a built-in rotary/tone keypad.",
  getVerbs: function() {
    return [
      { name: 'Examine', action: 'examine %' },
      { name: 'Dial Jenny', action: 'dial 867-5309' },
    ]
  }
})

// --- CAFÉ ITEMS & NPCS ---

createItem("brewster", NPC(), {
  loc: "leaky_mug_cafe",
  alias: "Java Joe (Brewster)",
  synonyms: ['barista', 'brewster', 'worker', 'cafe worker', 'guy', 'java joe'],
  examine: "The brewster wears a rain-patterned apron over his Tempest IT polo. His name badge reads 'Java Joe'. He wipes down the counter with an air of profound corporate endurance.",
  getVerbs: function() {
    return [
      { name: 'Examine', action: 'examine %' },
      { name: 'Talk to', action: 'talk to %' },
    ]
  },
  talkto: function() {
    if (!w.cafe_coffee.isHeld()) {
      w.cafe_coffee.loc = "me"
      msg("Java Joe looks up from the espresso machine. 'Here you go—one hot cup of Tempest Industrial Roast.'")
      msg("<i>(Java Joe hands you a hot mug of coffee.)</i>")
    } else {
      msg("Java Joe nods at your mug. 'You've already got coffee, my friend. Finish that cup first before asking for a top-off!'")
    }

    if (puzzles.act1Complete) {
      msg("<br>Joe: 'If you're looking for lunch, I've got fresh turkey sandwiches today. Just say the word!'")
    }
    return world.SUCCESS
  },
})

createItem("morgan_ir_lead", NPC(), {
  loc: "floor1_entrance", // Starts right in the lobby next to Skyler!
  alias: "Morgan (IR Lead)",
  synonyms: ['morgan', 'ir lead', 'incident response lead', 'threat lead', 'analyst'],
  examine: function() {
    if (this.loc === "floor1_entrance") {
      return "Morgan from Incident Response stands under the entrance canopy, clutching a freshly printed clipboard and keeping dry out of the rain."
    } else if (this.loc === "leaky_mug_cafe") {
      return "Morgan is taking a quick lunch break, but her eyes are glued to a live SIEM threat feed on her laptop."
    } else if (this.loc === "floor2_meeting_room") {
      return "Morgan is at the table talking to Archie about some new secure standards she is thinking about implementing."
    } else {
      return "Morgan is reviewing threat intelligence logs across three vertical monitors at her desk in Office 8."
    }
  },
  getVerbs: function() {
    return [
      { name: 'Examine', action: 'examine %' },
      { name: 'Talk to', action: 'talk to %' }
    ]
  },
  talkto: function() {
    // Act 1: Initial Intro & Onboarding Checklist Hand-off
    if (this.loc === "floor1_entrance") {
      if (!w.onboarding_packet.isHeld()) {
        w.onboarding_packet.loc = "me"
        msg("Morgan turns to you and smiles: <i>'Welcome aboard, Skyler! I'm Morgan, the Incident Response Lead.  Your boss is in a meeting and sent me down to greet you. It's a perfect day to join Tempest Weatherwear...it's pouring out here!'</i>")        
        msg("Morgan: <i>'Keep track of that checklist! It outlines your primary audit goals and achievements while navigating the building today.'</i>")
        msg("Morgan: <i>'Head inside through the revolving doors and show your driver's license to Officer Bishop at the security desk to get your badge printed before heading up to your office on the 3rd floor.'</i>")
        msg("<br><i>(Morgan handed you the <b>Security Champion Onboarding Checklist</b>!)</i>")
        return world.SUCCESS
      } else {
        msg("Morgan nods toward the turnstiles: <i>'Get your badge verified with Officer Bishop so you can unlock elevator clearance before settling into your office on the 3rd floor.'</i>")
        return world.SUCCESS
      }
    }

    // Act 2: Security Ops Meeting Room (Floor 2)
    if (this.loc === "floor2_meeting_room") {
      if (!puzzles.s3Locked) {
        msg("Morgan looks up from her tablet: <i>'Skyler! Glad you made it up to Ops. Our SIEM just flagged a high-priority alert on this floor.'</i>")
        msg("Morgan: <i>'Skyler! Glad you made it up to Ops. Our intrusion detector just flagged a severe misconfiguration. Someone pushing the latest XP release candidate left our main customer log directory hosted on an unauthenticated FTP server with full World-Writable permissions!")
        msg("Morgan: <i>'Can you head out to the build terminal on the landing and lock down the anonymous FTP access before an external web crawler indexes our customer logs?'</i>")
        return world.SUCCESS
      } else if (!puzzles.threatModelComplete) {
        msg("Morgan points to the whiteboard: <i>'Great job securing that FTP server! Now place your Code Review Checklist and the Pipeline Logs on the table so we can map out our complete threat model on the whiteboard.'</i>")
        return world.SUCCESS
      }
    }

    // Default Office 8 dialogue
    msg("Morgan looks up from her laptop: <i>'Hey Skyler! I have been hearing great things about your work today.  Keep it up!'</i>")
    return world.SUCCESS
  }
})

createItem("cafe_coffee", TAKEABLE(), {
  loc: false,
  alias: "hot coffee",
  synonyms: ['coffee', 'cup of coffee', 'hot coffee', 'mug', 'espresso'],
  examine: "A heavy ceramic mug bearing the Tempest Weatherwear logo ('Dry People, Secure Systems'). The dark roast steams invitingly.",
  getVerbs: function() {
    return [
      { name: 'Examine', action: 'examine %' },
      { name: 'Drink', action: 'drink %' },
      { name: 'Drop', action: 'drop %' },
    ]
  },
  // Custom drink function recognized directly by QuestJS
  drink: function() {
    puzzles.coffeeCount++

    if (puzzles.coffeeCount === 1) {
      w.cafe_coffee.loc = false // Remove mug from inventory until refilled
      msg("Slurp! You take a deep drink of Tempest's dark roast. A surge of caffeine washes over you. You feel focused, energized, and ready to audit legacy code!")
      return true
    } else if (puzzles.coffeeCount === 2) {
      w.cafe_coffee.loc = false
      msg("Glug, glug! Second cup down. Your typing speed doubles and your heart rate elevates to a lively 110 BPM. Security threat models stand no chance!")
      return true
    } else if (puzzles.coffeeCount === 3) {
      w.cafe_coffee.loc = false
      msg("Gulp! Third cup consumed. Your hands are visibly twitching. You can hear the electrical hum of the fluorescent lights and smell code syntax errors from three rooms away.")
      return true
    } else if (puzzles.coffeeCount === 4) {
      w.cafe_coffee.loc = false
      msg("Down the hatch! Cup four. Time slows down. You achieve temporary enlightenment regarding multi-factor authentication protocols...")
      msg("...However, your stomach lets out an ominous, thunderous rumble. Your internal biological monitoring system alerts: <b>CRITICAL FLUID CAPACITY REACHED</b>.")
      return true
    } else {
      msg("You bring the empty mug to your lips, but hesitate. Your stomach churns like a server room cooling system on full overdrive.")
      msg("<i>Brewster narrows his eyes from behind the counter: 'Whoa there, Security Champion. Any more caffeine and you'll be auditing the plumbing on Floor 1. You seriously need to find a bathroom before drinking another drop!'</i>")
      return false
    }
  },
  // Custom drop verb handling to avoid spilling phrasing
  drop: function(options) {
    if (!this.isHeld()) {
      msg("You aren't holding the mug of coffee.")
      return false
    }
    this.loc = player.loc
    msg("You carefully set the mug of coffee down on a flat surface so you don't spill a drop.")
    return true
  }
})

createItem("sandwich", TAKEABLE(), {
  loc: false,
  alias: "artisanal turkey sandwich",
  synonyms: ['sandwich', 'turkey sandwich', 'food', 'lunch'],
  examine: "A fresh turkey and avocado sandwich wrapped in butcher paper. Your stomach rumbles just looking at it.",
  getVerbs: function() {
    return [
      { name: 'Examine', action: 'examine %' },
      { name: 'Eat', action: 'eat %' },
      { name: 'Drop', action: 'drop %' },
    ]
  },
  eat: function() {
    msg("You devour the sandwich. Hunger satisfied, your focus returns to 100%!")
    this.loc = false
    return world.SUCCESS
  }
})

createItem("aol_cd", TAKEABLE(), {
  loc: "leaky_mug_cafe",
  alias: "AOL install CD disk",
  synonyms: ['cd', 'disk', 'aol disk', 'coaster', 'install disk'],
  examine: "An orange and blue CD labeled <i>'America Online 4.0! with 100 Free Hours!'</i> There is a coffee cup ring over the label as it looks like it has been used as a drink coaster.",
  getVerbs: function() {
    const verbs = [
      { name: 'Examine', action: 'examine %' },
    ]

    if (this.isHeld()) {
      verbs.push({ name: 'Drop', action: 'drop %' })

      if (player.loc == "office_4") {
        verbs.push({ name: 'Insert', action: 'insert the % into pc' })
      }

    } else {
      verbs.push({ name: 'Take', action: 'take %' })
    }
    return verbs
  },
})


createItem("security_office_door", {}, {
  loc: "floor1_reception",
  alias: "Security Office heavy door",
  synonyms: ['door', 'security door', 'office door', 'badge reader', 'scanner', 'heavy door'],
  icon: () => 'keycard',
  isOpen: false,

  examine: function() {
    if (this.isOpen) {
      return "The heavy steel security door stands wide open, revealing the monitors and badge machinery of the Security Office inside. The wall-mounted reader glows steady green."
    }
    if (puzzles.badgeScanned) {
      return "The heavy steel security door is closed, but unlocked. The wall-mounted reader glows steady green: <b>ACCESS GRANTED</b>."
    }
    return "A heavy reinforced steel door protecting the Security Office. Beside the frame sits an illuminated badge reader flashing red: <b>SCAN SECURITY BADGE TO ENTER</b>."
  },

  getVerbs: function() {
    const verbs = [
      { name: 'Examine', action: 'examine %' }
    ]

    if (this.isOpen) {
      verbs.push({ name: 'Close Door', action: 'close %' })
    } else {
      if (!puzzles.badgeScanned) {
        verbs.push({ name: 'Scan Badge', action: 'scan badge' })
      } else {
        verbs.push({ name: 'Open Door', action: 'open %' })
      }
    }
    return verbs
  },

  open: function() {
    return executeOpenSecurityDoor(this)
  },
  close: function() {
    return executeCloseSecurityDoor(this)
  }
})

// Helper Functions for Door State Handling
function executeOpenSecurityDoor(item) {
  if (player.loc !== "floor1_reception") {
    msg("There is no security office door here to open.")
    return world.FAILED
  }

  if (item.isOpen) {
    msg("The heavy security door is already open.")
    return world.SUCCESS
  }

  if (!puzzles.badgeScanned) {
    msg("You pull on the heavy steel handle, but the door is locked tight. The scanner flashes red: <b>SCAN SECURITY BADGE TO ENTER</b>.")
    return world.FAILED
  }

  item.isOpen = true
  msg("<b>*CLACK-HEAVE*</b> You pull open the heavy acoustic steel door, exposing the Security Office interior.")
  return world.SUCCESS
}

function executeCloseSecurityDoor(item) {
  if (player.loc !== "floor1_reception") {
    msg("There is no security office door here to close.")
    return world.FAILED
  }

  if (!item.isOpen) {
    msg("The security door is already firmly closed.")
    return world.SUCCESS
  }

  item.isOpen = false
  msg("<b>*THUD-CLICK*</b> You swing the heavy steel door shut until the latch engages with a solid hydraulic seal.")
  return world.SUCCESS
}

createItem("lobby_armchair", FURNITURE({ sit: true }), {
  loc: "floor1_lobby",
  alias: "vinyl armchair",
  synonyms: ['chair', 'armchair', 'vinyl chair', 'seat'],
  examine: "A heavy maroon vinyl armchair with chrome legs, straight out of a 1994 corporate catalog. It looks reasonably comfortable for waiting out a security lockdown.",
})

createItem("rolodex", {}, {
  loc: "security_office",
  alias: "spinning metal Rolodex",
  synonyms: ['rolodex', 'card index', 'contacts', 'index'],
  icon: () => 'document',
  examine: "A heavy black-and-chrome desk Rolodex crammed with dog-eared index cards. A quick spin reveals phone numbers for Little Nero's Pizza (a local pizza restaurant), various vendor fax lines, emergency CRT repair, and a hand-written card with a heart drawn in red ink labeled: <i>'Jenny — 867-5309'</i>.",
})

createItem("sandwich_sign", {}, {
  loc: "floor1_hallway",
  alias: "sandwich sign",
  synonyms: ['sign', 'sandwich sign', 'chalkboard', 'lunch sign', 'poster', 'advertisement'],
  icon: () => 'document',
  examine: "A dry-erase chalkboard sign resting on an easel outside the café entrance. Handwritten in aggressive neon markers:<br><br><i>'TODAY'S LUNCH SPECIAL: Artisanal Turkey & Avocado Sandwich.'</i><br><br><small><i>'Yes, it's actual food. No, it won't fix your code. Eat it before your manager claims it on their expense account.'</i></small>",
  getVerbs: function() {
    return [
      { name: 'Examine', action: 'examine %' },
    ]
  },
})
// --- ACT 2 ITEMS & NPCS ---

createItem("devops_printer", {}, {
  loc: "floor2_landing", 
  alias: "Floor 2 network printer",
  synonyms: ['printer', 'network printer', 'laserjet'],
  examine: function() {
    if (!puzzles.printerCleared) {
      return "A heavy industrial network printer humming loudly. An angry red LED screen blinks rhythmically: <b>ERROR: PC LOAD LETTER</b>. A crumpled sheet of paper is jammed tightly inside the tray."
    } else {
      return "The network printer sits quiet and subdued after a well-placed boot. The tray holds a freshly dislodged printout."
    }
  }
})

createItem("dialup_cheatsheet", TAKEABLE(), {
  loc: "floor2_devops",
  alias: "laminated Hayes AT Command card",
  synonyms: ['cheatsheet', 'at commands', 'card', 'hayes card', 'modem card'],
  examine: "A wallet-sized laminated reference card listing modem string commands: <code>ATDT</code>, <code>ATH0</code>, <code>ATS0=1</code>. Essential reading if you ever need to manually configure an analog modem initialization string!",
})

createItem("printed_audit_clue", TAKEABLE(), {
  loc: false,
  alias: "tattered audit printout",
  synonyms: ['printout', 'paper', 'audit log', 'clue', 'tattered printout', 'sheet'],
  examine: "A thermal paper printout detailing legacy network routes. A highlighted note at the bottom reads: <i>'ATTN DEVOPS: Server Rack #7 in the Basement still runs on unpatched TELNET with default admin credentials (admin/admin).'</i>"
})


createItem("cloud_console", {}, {
  loc: "floor2_landing",
  alias: "FTP build terminal",
  synonyms: ['ftp terminal', 'build terminal', 'ftp server', 'console', 'terminal', 'ftp'],
  examine: function() {
    if (!puzzles.s3Locked) {
      return "The terminal monitor displays a flashing red vsftpd warning banner: <b>ANONYMOUS FTP ENABLED ON /var/log/tempest/</b><br>Permissions: <code>777 (World Read/Write)</code>."
    } else {
      return "The terminal displays a green status message: <b>FTP SERVER SECURED — Anonymous login disabled. CHROOT jail enforced.</b>"
    }
  }
})


createItem("qa_tester", NPC(), {
  loc: "floor2_landing",
  alias: "QA Tester",
  synonyms: ['qa', 'tester', 'qa tester', 'engineer', 'test engineer'],
  getVerbs: function() {
    return [
      { name: 'Examine', action: 'examine %' },
      { name: 'Talk to', action: 'talk to %' },
    ]
  },
  examine: "A sharp QA engineer wearing headphones and reviewing web application request logs on three vertical monitors. A mug on her desk reads: <i>'Break Code, Not Hearts.'</i>",
  talkto: function() {
    if (puzzles.xssFixed) {
      const qaQuotes = [
        "<i>'Awesome job patching that script tag rendering! Our automated OWASP ZAP scans are coming back 100% clean now.'</i>",
        "<i>'I caught Chad trying to bypass integration testing again, but your XSS fix in order_comments.js held firm!'</i>",
        "<i>'If only we could automate regression testing for physical server room bugs down in the basement...'</i>"
      ]
      const randomQuote = qaQuotes[Math.floor(Math.random() * qaQuotes.length)]
      msg(`QA Tester takes off her headphones and gives you a thumbs up:<br>${randomQuote}`)
      return world.SUCCESS
    }

    if (w.xss_bug_report.isHeld()) {
      msg("QA Tester: 'Take that Bug ticket back to your office and apply context-aware HTML escaping to <code>order_comments.js</code>!'")
      return world.SUCCESS
    }

    // Give the ticket to Skyler on talk
    w.xss_bug_report.loc = "me"
    msg("QA Tester: 'Skyler! Perfect timing. I was reviewing our customer ordering portal against the <b>OWASP Top 10</b> guidelines, and I hit a major red flag.'")
    msg("<i>'Someone bypassed input sanitization on the comment field. If a user inputs raw script tags, the browser executes them right on the admin dashboard!'</i>")
    msg("She hands you <b>Bug Ticket #SEC-309 (XSS vulnerability ticket)</b>.")
    msg("QA Tester: 'Head back to your office and patch the rendering logic in <code>order_comments.js</code>!'")
    return world.SUCCESS
  }
})

createItem("stress_ball", TAKEABLE(), {
  loc: "floor2_dev_area",
  alias: "foam stress ball",
  synonyms: ['stress ball', 'foam ball', 'ball', 'squeeze ball'],
  examine: "A squishy yellow foam ball shaped like a lightning bolt, printed with the text: <i>'Tempest DevOps: Under Pressure, Never Cracking.'</i> It has several teeth marks near the top from a frantic release build.",
  getVerbs: function() {
    return [
      { name: 'Examine', action: 'examine %' },
      { name: 'Squeeze', action: 'squeeze the %' },
      { name: 'Throw', action: 'throw the %' },
      { name: 'Bite', action: 'chew on the %' },
    ]
  },
  // Action handlers
  squeeze: function() {
    msg("You crush the foam lightning bolt in your fist. It slowly expands back into shape with a soft foam hiss. You feel 15% more prepared for an upcoming incident response audit.")
    return world.SUCCESS
  },
  throw: function() {
    msg("You lob the foam stress ball across the room. It bounces harmlessly off a monitor divider with a quiet <i>plink</i> and rolls right back to your feet.")

    this.loc = player.loc  // Drop the ball onto the floor of the current room
    return world.SUCCESS
  },
  bite: function() {
    msg("You sink your teeth into the high-density foam. It tastes like synthetic polymer and late-night deployment crunch hours. You leave a fresh set of bite marks right next to the previous ones.")
    return world.SUCCESS
  }
})

createItem("sales_director", NPC(), {
  loc: "sales_director_office",
  alias: "Sales Director",
  synonyms: ['director', 'sales director', 'vp of sales', 'boss'],
  examine: "The Sales Director sits behind a large mahogany desk, wearing a tailored navy blazer and furiously massaging his temples while staring at a spreadsheet on his monitor.",
  getVerbs: function() {
    return [
      { name: 'Examine', action: 'examine %' },
      { name: 'Talk to', action: 'talk to %' },
    ]
  },
  talkto: function() {
    if (puzzles.phishStopped) {
      msg("Sales Director sighs with relief: <i>'Kevin told me you stopped him from clicking that survey attachment. Good save, Skyler. Losing our client contact database right before Q4 close would have killed our team bonuses.'</i>")
      return world.SUCCESS
    }

const directorQuotes = [
      "<i>'Skyler! Tell me IT didn't block our outbound CRM pipeline again... I've got three regional distributors waiting on Q4 quotes, and my pipeline reports are showing zero throughput!'</i>",
      "<i>'If we don't hit our quarterly quota for StormShield trenchcoats, corporate isn't approving budget for your security tool upgrades next year.'</i>",
      "<i>'Have you seen Kevin on the sales floor? He keeps talking about winning a free gift card email. Tell him to get back on cold calls!'</i>"
    ]
    const randomQuote = directorQuotes[Math.floor(Math.random() * directorQuotes.length)]
    msg(`The Sales Director looks up from his spreadsheet:<br>${randomQuote}`)
    return world.SUCCESS
  }
})

createItem("putting_green", FURNITURE({ sit: false }), {
  loc: "sales_director_office",
  alias: "mini-putting green",
  synonyms: ['putting green', 'mat', 'putter', 'golf green', 'golf mat'],
  examine: "A six-foot strip of synthetic green turf with a battery-powered automatic ball return cup at the far end. A brass putter rests against the edge of the mat.",
  getVerbs: function() {
    return [
      { name: 'Examine', action: 'examine %' },
      { name: 'Putt', action: 'use %' },
    ]
  },
  use: function() {
    msg("You line up a quick three-foot putt with the brass putter. <i>*CLACK-PLUNK*</i> The battery-powered cup returns the ball right back to your shoes. Precision achieved!")
    return world.SUCCESS
  }
})

createItem("sales_reps", NPC(), {
  loc: "floor2_sales",
  alias: "sales representatives",
  synonyms: ['reps', 'sales reps', 'sales representative', 'agents', 'sales team', 'folks'],
  examine: function() {
    if (!puzzles.phishStopped) {
      return "A dozen account executives in headsets are cold-calling clients. Near the center row, a sales rep named Kevin is hovering his mouse over a flashing popup: <b>'CLAIM YOUR $100 GIFT CARD — CLICK TO INSTALL SURVEY.EXE'</b>."
    }
    return "The sales team is back to making calls, with Kevin safely reviewing real client contracts."
  },
  getVerbs: function() {
    const verbs = [
      { name: 'Examine', action: 'examine %' },
      { name: 'Talk to', action: 'talk to %' }
    ]
    if (!puzzles.phishStopped) {
      verbs.push({ name: 'Stop Phish', action: 'stop %' })
    }
    return verbs
  },
  talkto: function() {
    if (puzzles.phishStopped) {
      msg("Kevin nods sheepishly: <i>'Thanks again, Skyler. I almost clicked that executable thinking it was a legit $100 voucher!'</i>")
      return world.SUCCESS
    }

    msg("Kevin the Sales Rep looks up with excitement: <i>'Hey Skyler! Check this out—I just got an email from \"IT-Support-Rewards@tempest-free-giftcard.net\" saying I won employee of the month! All I have to do is run `survey_installer.exe` to claim it.'</i>")
    msg("He reaches for his mouse... <b>He's about to execute a rootkit!</b>")
    msg("<i>As a Security Champion, you must intervene!)</i>")
    return world.SUCCESS
  }
})


createItem("sales_cubicles", {}, {
  loc: "floor2_sales",
  alias: "cluttered sales cubicles",
  synonyms: ['cubicles', 'cubes', 'desks', 'junk', 'swag', 'awards', 'trophies'],
  examine: "Every surface is overflowing with classic corporate clutter: squeeze foam rain drops, branded Rolodexes, motivational posters reading <i>'CLOSERS GET COFFEE'</i>, and brass plaques for Q3 revenue quotas.",
  getVerbs: function() {
    return [
      { name: 'Examine', action: 'examine %' }
    ]
  }
})

createItem("xss_bug_report", TAKEABLE(), {
  loc: false,
  alias: "XSS vulnerability ticket",
  synonyms: ['ticket', 'bug report', 'bug ticket', 'xss report', 'paper ticket'],
  examine: "Bug Ticket #SEC-309 (OWASP A03:2021 — Stored XSS): Customer order comment field renders raw user input via innerHTML. Vulnerable to Stored XSS.",
})

createItem("skyler_workstation", {}, {
  loc: "office_4", 
  alias: "Skyler's workstation",
  synonyms: ['workstation', 'terminal', 'computer', 'monitors', 'my computer', 'ide', 'pc'],
  examine: function() {
    if (!puzzles.xssFixed) {
      if (w.xss_bug_report.isHeld()) {
        return "Your dual-monitor workstation is ready. Bug Ticket #SEC-309 is open on your left screen.<br>File: <code>order_comments.js</code><br>Issue: <b>Stored XSS in Order Review Box</b>. <i>(Time to squash some bugs!))</i>"
      } else {
        return "Your terminal is open to your development workspace. You have your usual tools open, but no active high-priority security tickets assigned to your queue yet."
      }
    } else {
      return "Your workstation monitor flashes a green CI/CD pipeline banner: <b>BUILD PASSED — HTML entity encoding active on all user inputs.</b>"
    }
  }
})

createItem("red_stapler", TAKEABLE(), {
  loc: "office_4",
  alias: "red Swingline stapler",
  synonyms: ['stapler', 'red stapler', 'swingline'],
  examine: "A bright red Swingline 747 stapler. It has a satisfying weight and binds 25 sheets of paper with authority. You feel an intense, almost primal urge to hold onto it.",
})

createItem("onboarding_packet", TAKEABLE(), {
  loc: false, // Handed to player by Morgan in the Lobby
  alias: "Security Champion Onboarding Checklist",
  synonyms: ['checklist', 'packet', 'onboarding packet', 'onboarding checklist', 'sheet'],
  examine: function() {
    let output = "<b>TEMPEST HQ — SECURITY CHAMPION AUDIT CHECKLIST</b><br>"
    output += "<i>Handed to you by Morgan (IR Lead). She highlighted five core security assignments. As you make additional discoveries during your audit, pencil them in:</i><br><br>"

    // Achievements known by Morgan at the start of the game
    const morgansList = [
      "social_engineer",
      "mfa_master",
      "cloud_guard",
      "xss_slayer",
      "clean_desk"
    ]

    const allAchievements = Object.values(globalThis.metamenu?.achievements ?? {})

    if (allAchievements.length === 0) {
      output += "• Stop the suspicious contractor (No Tailgating Allowed)<br>"
      output += "• Bypass elevator MFA lock (Factor This!)<br>"
      output += "• Block public access to customer logs (Talk to the Hand)<br>"
      output += "• Sanitize comment field inputs (DOM Purified)<br>"
      output += "• Enforce Clean Desk policy on unattended terminals (Lock It Or Lose It)<br>"
    } else {
      // Show achievements if they were on Morgan's list OR if Skyler unlocked them as new tasks
      const visibleAchievements = allAchievements.filter(ach => morgansList.includes(ach.id) || ach.unlocked)

      output += visibleAchievements.map(ach => {
        const isPenciledIn = !morgansList.includes(ach.id) ? " <i>(Penciled in)</i>" : ""
        const check = ach.unlocked 
          ? `<b style='color:green;'>[✔ COMPLETED]</b>` 
          : `<span style='color:gray;'>[ ] PENDING</span>`
        return `${check} <b>${ach.title}:</b> ${ach.desc}${isPenciledIn}`
      }).join("<br>")
    }

    return output
  },
  getVerbs: function() {
    const verbs = [
      { name: 'Examine', action: 'examine %' },
    ]
    if (this.isHeld()) {
      verbs.push({ name: 'Drop', action: 'drop %' })
    } else {
      verbs.push({ name: 'Take', action: 'take %' })
    }
    return verbs
  }
})

createItem("code_review_checklist", TAKEABLE(), {
  loc: "office_4",
  alias: "Code Review Checklist",
  synonyms: ['checklist', 'review checklist'],
  examine: "A document detailing static analysis patterns and PR approval policies, and dependency scanning requirements.",
})

createItem("swag_notebook", TAKEABLE(), {
  loc: false, // Spawns into inventory on completing the trade
  alias: "Tempest-branded notebook and pen",
  synonyms: ['notebook', 'pen', 'swag', 'pad', 'tempest notebook', 'spiral notebook'],
  examine: "A blue vinyl spiral notebook stamped with the Tempest Weatherwear logo ('Dry People, Secure Systems') and a matching cheap plastic ballpoint pen that clicks with a satisfying crunch.",
  getVerbs: function() {
    return [
      { name: 'Examine', action: 'examine %' },
      { name: 'Drop', action: 'drop %' },
    ]
  },
})

createItem("security_manager", NPC(), {
  loc: "office_5",
  alias: "Security Manager",
  synonyms: ['manager', 'security manager', 'boss', 'security boss'],
  examine: function() {
    if (puzzles.act3Complete) {
      return "Your Security Manager is leaning over CEO Victoria Sterling's desk, frantically monitoring network telemetry and packet captures during the ongoing crisis."
    }
    return "Your manager sits behind a desk piled high with compliance reports and empty espresso cups. He looks up from his monitor with a mix of fatigue and hope."
  },
  getVerbs: function() {
    return [
      { name: 'Examine', action: 'examine %' },
      { name: 'Talk to', action: 'talk to %' },
    ]
  },
  giveTo: function(options) {
    return this.handleGiveTo(options)
  },

  handleGiveTo: function(options) {
    const item = options.item || options.obj
    if (!item) return false

    const itemNames = [item.name, item.alias, ...(item.synonyms || [])].map(s => String(s).toLowerCase())

    // 1. Red Stapler Trade
    if (itemNames.some(s => s.includes('stapler') || s.includes('swingline'))) {
      if (!puzzles.bugSprayGiven) {
        puzzles.bugSprayGiven = true
        w.red_stapler.loc = "office_5"
        w.bug_spray.loc = "me"
        msg("Your manager's eyes lock onto the red Swingline in your hand. <i>'Ah, magnificent! My red stapler! I've been looking for that all week!'</i>")
        msg("He quickly snatches it from your hands and places it firmly on his desk like a prized trophy.")
        msg("He reaches under his desk and slides a heavy aerosol can over to you. <i>'Since you found my stapler, take this <b>can of bug spray</b>. Legacy code down in the Basement always brings real pests—go take care of those server room bugs!'</i>")
        msg("<br><i>(You received the <b>can of bug spray</b>!)</i>")
        awardMetaAchievement("stapler_hero")
        return true
      } else {
        msg("Security Manager: 'Thanks, but I already got my stapler back!'")
        return true
      }
    }

    // 2. Coffee & Sandwich / Lunch Trade
    const isFoodOrDrink = itemNames.some(s => s.includes('sandwich') || s.includes('coffee') || s.includes('lunch') || s.includes('food') || s.includes('turkey') || s.includes('mug'))

    if (isFoodOrDrink) {
      const playerItems = scopeHeldBy(player).map(obj => [obj.name, obj.alias, ...(obj.synonyms || [])].flat().map(s => String(s).toLowerCase()))

      const hasCoffee = playerItems.some(names => names.some(s => s.includes('coffee') || s.includes('mug') || s.includes('espresso')))
      const hasSandwich = playerItems.some(names => names.some(s => s.includes('sandwich') || s.includes('turkey') || s.includes('food')))

      if (hasCoffee && hasSandwich) {
        w.cafe_coffee.loc = false
        w.sandwich.loc = false
        puzzles.brownNoseDone = true
        w.swag_notebook.loc = "me"

        msg("You present the steaming mug of dark roast coffee AND the artisanal turkey sandwich to your Security Manager.")
        msg("He looks at the feast, narrows his eyes, and snorts: <i>'Quit being such a blatant brown-noser, Skyler... but honestly, I haven't eaten since 6 AM, so I'll take it! I'll trade you.'</i>")
        msg("He slides his stack of compliance reports aside, takes a massive bite of the sandwich, and reaches into his top desk drawer.")
        msg("Manager: <i>'Here, take this leftover <b>Tempest-branded notebook and pen set</b> from last year's vendor expo. Great for jotting down static analysis notes during code reviews!'</i>")
        msg("<br><i>(You received the <b>Tempest-branded notebook and pen</b>!)</i>")

        awardMetaAchievement("brown_noser")
        return true
      } else if (hasCoffee) {
        msg("Security Manager: <i>'Coffee? Thanks, but a dry cup of joe without a sandwich is just an empty promise. Bring me lunch to go with it!'</i>")
        return true
      } else if (hasSandwich) {
        msg("Security Manager: <i>'A turkey sandwich? Looks great, but how am I supposed to wash it down without a hot cup of coffee?'</i>")
        return true
      } else {
        msg("Security Manager: <i>'I wish I could get away for a bit to eat but these reports are piling up. What I would trade for some food right now!'</i>")
        return true
      }
    }

    msg(`Security Manager takes a glance at ${item.ilink()} and shakes his head: 'Thanks, but I don't need that right now.'`)
    return false
  },

  talkto: function() {
    // Act 4 Incident War Room Dialogue (CEO Office)
    if (puzzles.act3Complete) {
      if (!puzzles.networkIsolated) {
        msg("Security Manager: <i>'Skyler! Thank goodness you made it up from the basement. Ms. Sterling's workstation is leaking encrypted data over port 443 right now. Isolate that network gateway under her desk!'</i>")
        return world.SUCCESS
      } else if (!puzzles.backupRestored) {
        msg("Security Manager: <i>'Great job severing the outbound link! Now sprint into the Executive Telecom Closet next door and run a full system restore from the offline backup controller!'</i>")
        return world.SUCCESS
      } else {
        msg("Security Manager smiles and shakes your hand: <i>'Sensational work today, Skyler! You handled every level of this incident like a true Security Champion.'</i>")
        return world.SUCCESS
      }
    }

    // Default Acts 1–3 Dialogue
    let msgBuffer = []
    if (!puzzles.keycardGiven) {
      puzzles.keycardGiven = true
      w.least_privilege_keycard.loc = "me"
      msgBuffer.push("Security Manager: 'Hey Skyler! Here is your <b>Least Privilege Keycard</b> for the DevOps wing on Floor 2. You'll need it to sanitize that rogue deployment pipeline.'")
    }

    if (w.red_stapler.isHeld() && !puzzles.bugSprayGiven) {
      msgBuffer.push("<br>Your manager's eyes lock onto the red Swingline in your hand. <i>'Is that... my red stapler?! Hand it over!'</i>")
    } else if (!puzzles.bugSprayGiven) {
      msgBuffer.push("<br>Security Manager: 'By the way, have you seen my red Swingline stapler around? I could swear I left it on someone's desk...'")
    } else {
      if (puzzles.brownNoseDone) {
        msgBuffer.push("<br>Security Manager: 'Thanks for the coffee and sandwich! That was a nice gesture. I feel like I can take on the world now!'")
      } else {
        msgBuffer.push("<br>Security Manager: 'If you want to get on my good side, bring me a hot cup of coffee and a turkey sandwich from the café downstairs. I haven't eaten since 7 AM!'")
      }
    }
    msg(msgBuffer.join("<br>"))
    return world.SUCCESS
  }
})



createItem("least_privilege_keycard", TAKEABLE(), {
  loc: false, // Handed over by Security Manager
  alias: "Least Privilege Keycard",
  synonyms: ['keycard', 'least privilege keycard'],
  examine: "A security key provisioned with strictly scoped RBAC policies.",
})

createItem("bug_spray", TAKEABLE(), {
  loc: false, // Handed over by Security Manager in exchange for Red Stapler
  alias: "can of bug spray",
  synonyms: ['bug spray', 'spray', 'can', 'insecticide'],
  examine: "Industrial aerosol labeled: 'Debugger Pro 5000 — Formulated for Organic and Software Pests.'",
})

createItem("architect_archie", NPC(), {
  loc: "floor2_meeting_room",
  alias: "Archie (Enterprise Solutions Architect)",
  synonyms: ['archie', 'architect', 'solutions architect', 'enterprise architect', 'arthur'],
  examine: "Archie wears an impossibly crisp vest over a black turtleneck, holding a Trapper Keeper with a picture of a dog surfing in one hand and a dry-erase marker like a conductor's baton in the other. He is staring intensely at the whiteboard, lost in theoretical domain-driven abstractions.",
  getVerbs: function() {
    return [
      { name: 'Examine', action: 'examine %' },
      { name: 'Talk to', action: 'talk to %' },
    ]
  },
  talkto: function() {
    if (puzzles.threatModelComplete) {
      msg("Archie strokes his chin thoughtfully: <i>'Fascinating. Your threat model successfully decoupled our security assumptions from runtime realities. I might reference this paradigm in my next architectural whitepaper.'</i>")
      return world.SUCCESS
    }

    if (!w.dry_erase_markers.isHeld()) {
      msg("Archie gestures grandly toward the whiteboard without turning around:")
      msg("Archie: <i>'Ah, Skyler! I am currently conceptualizing the hyper-scalable CORBA/DCOM distributed object paradigm for Tempest's N-Tier enterprise architecture. However, I cannot materialize the abstraction layer without the dry-erase markers from the table.'</i>")
      return world.SUCCESS
    }

    if (!w.pipeline_logs.isHeld() || !w.code_review_checklist.isHeld()) {
      msg("Archie adjusts his turtleneck: <i>'We have the markers, yes, but a true Threat Model requires empirical data points, not just pristine architectural intent. Bring me the Nightly Build Logs and your Code Review Checklist so we can ground this abstraction in reality.'</i>")
      return world.SUCCESS
    }

    msg("Archie beams: <i>'Magnificent! You have the markers, the pipeline traces, and the checklist. Let us synthesize these artifacts into an unassailable Threat Model right here on the whiteboard!'</i>")
    msg("<i>(Type <b>threat model</b> or <b>draw threat model</b> to complete the diagram with Archie and Morgan!)</i>")
    return world.SUCCESS
  }
})

createItem("lead_developer", NPC(), {
  loc: "floor2_dev_area",
  alias: "Lead Developer",
  synonyms: ['lead dev', 'developer', 'lead developer', 'dev', 'senior dev'],
  examine: "She is staring intensely at two massive 21-inch CRT monitors displaying yellow text on a black terminal screen, surrounded by stacks of C++ reference books and red Visual SourceSafe merge conflict notices. Her shirt reads: <i>'It's Not a Bug, It's an Undocumented Feature.'</i>",
  getVerbs: function() {
    return [
      { name: 'Examine', action: 'examine %' },
      { name: 'Talk to', action: 'talk to %' },
    ]
  },
  talkto: function() {
    // State 1: Shadow Admin is NOT fixed yet
    if (!puzzles.shadowAdminFixed) {
      msg("The Lead Developer rubs her temples and groans without taking her hands off her mechanical keyboard.")
      msg("Lead Dev: <i>'Skyler! Look, I'd love to chat about threat models, but our pair programming partner on the build server configured our automated nightly build script to run under root!'</i>")
      msg("Lead Dev: <i>'If Chad pushes our iteration release right now, we're going to overwrite the production master tree. Head into the XP Wing and use your keycard to enforce Least Privilege on the build script!'</i>")
      return world.SUCCESS
    }

    // State 2: Shadow Admin is fixed, but threat model incomplete
    if (!puzzles.threatModelComplete) {
      if (!w.code_review_checklist.isHeld()) {
        msg("Lead Dev: <i>'Awesome work locking down that build script! Now we can actually run our threat model without production catching fire.'</i>")
        msg("Lead Dev: <i>'Go grab your <b>Code Review Checklist</b>. You'll need that and the Nightly Build Logs in the Meeting Room.'</i>")
        return world.SUCCESS
      } else {
        msg("Lead Dev: <i>'You've got the checklist! Archie and Morgan are already setting up in the <b>Meeting Room</b> over there. Go tell Archie to quit sniffing his markers and map out the data flows.'</i>")
        return world.SUCCESS
      }
    }

    // State 3: Flavor dialogue post-threat model
    const devQuotes = [
      "<i>'If anyone asks, those hardcoded test credentials in `legacy_auth.bat` were put there by a contractor who left in '94.'</i>",
      "<i>'I offered to rewrite the entire legacy core in C++, but Chad said it wasn't in the Q3 release schedule.'</i>",
      "<i>'Don't talk to me about unit test coverage until we figure out why the build succeeds on my local machine but crashes in Visual SourceSafe.'</i>",
      "<i>'You saved the build script, Skyler. I might actually get to leave before 8 PM tonight.'</i>"
    ]
    const randomQuote = devQuotes[Math.floor(Math.random() * devQuotes.length)]
    
    msg(`The Lead Developer takes a sip of stale coffee and gives you a weary nod:<br>${randomQuote}`)
    return world.SUCCESS
  }
})

createItem("shadow_admin_terminal", {}, {
  loc: "floor2_devops",
  alias: "Shadow Admin Terminal",
  synonyms: ['terminal', 'shadow admin', 'deployment terminal'],
  examine: function() {
    if (puzzles.shadowAdminFixed) {
      msg("The deployment build script's status is green: LEAST PRIVILEGE POLICY ENFORCED.")
    } else {
      msg("CRITICAL WARNING: Nightly Build Script 'make_release.bat' executing with full Domain Admin privileges!")
    }
  }
})

createItem("pipeline_logs", TAKEABLE(), {
  loc: false,
  alias: "DevOps Pipeline Logs",
  synonyms: ['logs', 'pipeline logs'],
  examine: "A thick dot-matrix printout of last night's automated C++ compilation and CVS commit trace. Highlighted in red ink: suspicious commits pushed directly to production without pair programming sign-off.",
})

createItem("whiteboard", {}, {
  loc: "floor2_meeting_room",
  alias: "whiteboard",
  synonyms: ['whiteboard', 'board', 'diagram'],
  examine: function() {
    if (!puzzles.threatModelComplete) {
      return "A giant glass whiteboard covered in dry-erase smudges, half-baked architectural diagrams, and a leftover flowchart labeled <i>'How to Synergize Cross-Functional Deliverables.'</i> Someone left a note in the corner: <i>'DO NOT ERASE — CRITICAL DEVOPS ROADMAP.'</i> It's crying out for an actual security threat model."
    } else {
      return "The whiteboard displays a complete Threat Model diagram mapping out the attack surface directly to Legacy Server Rack #7 in the Basement."
    }
  }
})

createItem("dry_erase_markers", TAKEABLE(), {
  loc: "floor2_meeting_room",
  alias: "dry-erase markers",
  synonyms: ['markers', 'marker', 'dry erase markers', 'pen', 'dry-erase marker'],
  examine: "A set of four colorful dry-erase markers (Red for Threats, Blue for Data Flows, Green for Controls, Black for Boundaries). Perfect for threat modeling.",
})

createItem("vending_machine", {}, {
  loc: "floor2_breakroom",
  alias: "Vend-o-Matic 3000",
  synonyms: ['vending machine', 'machine', 'vend-o-matic', 'snack machine'],
  examine: function() {
    if (!puzzles.vendingShaken) {
      return "A giant glass-front vending machine stocked with pretzels, cheese curls, and 90s sodas. Item #C4 (Surge Soda) is dangling right at the edge of the glass spiral!<br>"
    } else {
      return "The vending machine is operational, though slightly crooked on its rubber feet."
    }
  },
  getVerbs: function() {
    if (!puzzles.vendingShaken) {
      return [
        { name: 'Examine', action: 'examine %' },
        { name: 'Shake Machine', action: 'shake the %' },
      ]
    }
    return [{ name: 'Examine', action: 'examine %' }]
  }
})

createItem("surge_soda", TAKEABLE(), {
  loc: false,
  alias: "can of Surge Soda",
  synonyms: ['surge', 'soda', 'can', 'surge soda', 'drink', 'pop'],
  examine: "A bright green 12oz aluminum can of Surge Soda ('Feed the Rush!'). Loaded with citrus flavor and maximum caffeine.",
  wasDroppedRecently: false,

  getVerbs: function() {
    const verbs = [
      { name: 'Examine', action: 'examine %' },
    ]

    if (this.isHeld()) {
      verbs.push({ name: 'Drink', action: 'drink the %' })
      
      if (player.loc === "basement_archive") {
        verbs.push({ name: 'Give to Gus', action: 'give the % to gus' })
      }

      verbs.push({ name: 'Drop', action: 'drop %' })
    }

    return verbs
  },

  drop: function() {
    this.wasDroppedRecently = true
    this.loc = player.loc

    if (player.loc === "basement_archive") {
      msg("Gus gasps, diving off his metal stool in slow motion: <i>'NOOOOO!'</i> He catches the rolling can an inch before it hits the concrete floor, wiping it off with his sleeve. <i>'Don't treat the sacred elixir like a common cola, kid!'</i>")
      this.loc = "me" // Gus shoves it back into inventory!
      return world.SUCCESS
    }

    if (player.loc === "floor2_dev_area") {
      msg("You drop the Surge soda. It rolls under the Lead Dev's desk. She freezes, slowly lifting her feet off the floor: <i>'Skyler... if that nuclear citrus juice leaks near my surge protector, the whole build server goes down!'</i>")
      return world.SUCCESS
    }

    msg("You set down the can of Surge. It hits the floor with a heavy <b>THUD</b>, rolls three feet, and vibrates ominously. Dropping a pressurized 12-ounce can of radioactive citrus hyper-fuel seems risky...")
    return world.SUCCESS
  },

  drink: function() {
    if (this.wasDroppedRecently) {
      msg("You pop the tab. <b>FOOOOOOSH!</b> A high-pressure geyser of fluorescent green liquid violently blasts your face and the ceiling! You absorb about 20% of the soda via contact high, while the carpet claims the rest.")
    } else {
      msg("GLUG! You chug the neon green soda. An intense burst of citrus and sugar surges through your veins! Your focus hits 200%!")
    }
    this.loc = false
    return world.SUCCESS
  }
})


createItem("chad_pm", NPC(), {
  loc: "floor2_devops",
  alias: "Chad (Senior Project Manager)",
  synonyms: ['chad', 'pm', 'project manager', 'systems analyst', 'manager'],
  examine: "Chad wears a short-sleeved dress shirt with a neat pocket protector and holds a massive binder labeled 'Tempest HQ — System Development Life Cycle (SDLC) Phase II Specs'. He has a high-contrast PERT chart clipped to his board and looks deeply stressed about milestone delivery dates.",
  getVerbs: function() {
    return [
      { name: 'Examine', action: 'examine %' },
      { name: 'Talk to', action: 'talk to %' },
    ]
  },
  talkto: function() {
    if (puzzles.shadowAdminFixed) {
      msg("Chad taps his Gantt chart with a pencil: <i>'Fine! You locked down the build script service account to Least Privilege. But if our iteration velocity drops below 35 points, I'm noting it as a blocker in the Sprint Retrospective!'</i>")
      return world.SUCCESS
    }

    const chadQuotes = [
      "<i>'Look, Skyler, we committed to 40 Velocity Points this Sprint and our XP User Stories are locked in! We are halfway through Iteration 4, and the Scrum Master wants our build signed off by Friday! If your security audits delay our release candidate, the Change Control Board is going to hear about it during tomorrow's Stand-up!'</i>",
      "<i>'Upper management didn't allocate budget for extra security hardening in the initial Scope of Work... They want Phase 4 User Acceptance Testing completed by Friday! If your security audits delay final sign-off, the Change Control Board is going to hear about it.'</i>",
      "<i>'Look, the customer stories were signed off by product management. Nowhere in User Story #104 does it say 'must not run under domain admin privileges'</i>!'",
      "<i>'I just updated the Microsoft Project Gantt chart on the plot printer. If we don't freeze code requirements by 5:00 PM, the Critical Path slip is going to push our UAT milestone into Q4!'</i>"
    ]
    const randomQuote = chadQuotes[Math.floor(Math.random() * chadQuotes.length)]
    return world.SUCCESS
  }
})




createItem("breakroom_chair", FURNITURE({ sit: true }), {
  loc: "floor2_breakroom",
  alias: "mismatched plastic chair",
  synonyms: ['chair', 'plastic chair', 'seat', 'breakroom chair'],
  examine: "A molded blue plastic shell chair on metal legs. Someone etched <i>'C4 = SURGE'</i> into the armrest.",
})



createItem("office_chair", FURNITURE({ sit: true }), {
  loc: "office_4",
  alias: "ergonomic desk chair",
  synonyms: ['chair', 'desk chair', 'office chair', 'seat', 'task chair'],
  examine: "A black fabric desk chair with adjustable armrests and a slightly squeaky pneumatic lift cylinder. It's your home base for code reviews.",
  siton: function() {
    if (puzzles.coffeeCount >= 4) {
      msg("You sink into your desk chair, but your caffeine-fueled nervous system won't let you stay still for more than three seconds! You immediately stand back up.")
      return world.SUCCESS
    }
    msg("You sit down in your ergonomic desk chair. The pneumatic cylinder lets out a soft <i>whoosh</i>. Ah... baseline comfort achieved.")
    return world.SUCCESS
  }
})

commands.push(new Cmd('KnockRestroomDoor', {
  regex: /^(?:knock|knock on|rattle|open|use|enter)(?: (?:the|a))? (?:restroom|bathroom|restroom door|bathroom door|door)$/i,
  objects: [],
  script: function() {
    if (player.loc !== "floor2_dev_area") {
      msg("There isn't a restroom door here.")
      return world.FAILED
    }
    return executeTryRestroomDoor()
  }
}))

// --- ACT 3 ITEMS ---

createItem("gus_sysadmin", NPC(), {
  loc: "basement_archive",
  alias: "Gus (Legacy Sysadmin)",
  synonyms: ['gus', 'sysadmin', 'legacy admin', 'old sysadmin', 'admin'],
  examine: "Gus sits on a creaky metal stool wearing a faded 1992 tech conference polo and fingerless typing gloves. His eyes are perpetually squinted from years of staring at green monochrome phosphors.",
  getVerbs: function() {
    return [
      { name: 'Examine', action: 'examine %' },
      { name: 'Talk to', action: 'talk to %' },
    ]
  },
  giveTo: function(options) {
    return this.handleGiveTo(options)
  },
  handleGiveTo: function(options) {
    const item = options.item || options.obj
    if (!item) return false

    const itemNames = [item.name, item.alias, ...(item.synonyms || [])].map(s => String(s).toLowerCase())

    if (itemNames.some(s => s.includes('surge') || s.includes('soda'))) {
      w.surge_soda.loc = false

      msg("Gus's eyes widen to the size of CRT monitors as he beholds the glowing green holy grail of all soft drinks.")
      msg("Gus: <i>'Is that... real citrus Surge technology?! I thought the vending machine up on Floor 2 swallowed the last can!'</i>")
      msg("He snatches it from your hands with trembling, fingerless-gloved fingers, cracks the tab, and takes a legendary chug.")

      if (puzzles.hasAdminCredentials) {
        msg("Gus wipes his mouth with his sleeve: <i>'Kid, you are an absolute legend. Since you already spotted my sticky note on the terminal, just take my advice instead: disable Telnet before management catches us both!'</i>")
      } else {
        puzzles.hasAdminCredentials = true
        msg("Gus: <i>'Kid, you just bought yourself permanent root access to The Gibson next door. User is <b>admin</b>, password is <b>admin</b>. Now leave me to savor this heavenly nectar!'</i>")
      }
      
      return true
    }

    msg(`Gus blinks at ${item.ilink()} through his thick glasses: 'Unless it's an analog modem cable or high-fructose caffeine, I don't need it.'`)
    return false
  },
  talkto: function() {
    // --- PATH 1: Player ALREADY found credentials (or traded Surge) ---
    if (puzzles.hasAdminCredentials) {
      msg("Gus slowly turns from his green monochrome monitor and adjusts his thick glasses.")
      
      if (puzzles.bugsExterminated) {
        msg("Gus: <i>'Yeah, yeah... I see you found my yellow note AND you cleared out those nasties in the server room. Appreciate you taking care of those bugs, kid!'</i>")
      } else {
        msg("Gus: <i>'Yeah, yeah... I see you already found my yellow note stuck to the screen. Look, after twenty years of 80-hour work weeks down in this pit, a guy needs a cheat sheet so he doesn't forget the root pass every time the power flickers!'</i>")
        msg("He waves a gloved hand toward the door: <i>'Now go get Server Rack #7 patched up before the bugs chew through the rest of my CAT3 cabling.'</i>")
      }
      return world.SUCCESS
    }

    // --- PATH 2: Player has NOT found credentials yet ---
    msg("Gus slowly turns his head, blinking as if your presence is a sudden burst of harsh light.")
    msg("Gus: <i>'Sunlight? Haven't seen it since the '96 system migration, kid. Down here, time is measured in magnetic tape rotation speeds and fluorescent light flickers.'</i>")

    if (puzzles.bugsExterminated) {
      msg("Gus nods toward the server room: <i>'I noticed the aerosol fumes... thanks for spraying those server room bugs before they nest in my patch panels. The old Gibson gets cranky when it has a full nest of issues around it. If you plan to work on it, you'll want to look around the basement first.'</i>")
    } else {
      msg("Gus sighs: <i>'The old Gibson isn't the sort of machine you want to poke without a plan. It has a history of odd little habits, and the old notes in this place are half a century of trouble.'</i>")
    }
    return world.SUCCESS
  }
})

createItem("umbrella_note", TAKEABLE(), {
  loc: false, // Hidden inside the umbrella until opened indoors
  alias: "crumpled paper slip",
  synonyms: ['note', 'paper', 'paper slip', 'clue', 'slip', 'crumpled note'],
  examine: function() {
    return "A crumpled sticky note retrieved from inside the umbrella folds. Handwritten in pencil: <i>'To Do: Gibson in the basement still runs Telnet! Default root credentials are saved on a sticky note in the Archive Workbench.'</i>"
  },
  read: function() {
    return this.examine()
  },
  getVerbs: function() {
    const verbs = [
      { name: 'Examine', action: 'examine %' }
    ]

    if (this.isHeld()) {
      verbs.push({ name: 'Drop', action: 'drop %' })
    } else {
      verbs.push({ name: 'Take', action: 'take %' })
    }
    return verbs
  },
})


createItem("unattended_workstation", {}, {
  loc: "basement_archive",
  alias: "unattended workstation",
  synonyms: ['unlocked terminal', 'unattended pc', 'open terminal', 'sysadmin pc', 'workstation'],
  examine: function() {
    if (!puzzles.unlockedWorkstationCleared) {
      return "A sysadmin's workstation left wide open with active root privileges! The screen is glowing while the owner is nowhere to be seen."
    } else {
      return "The workstation monitor is locked tight, displaying the Windows login prompt. A yellow Security Champion card rests on the keyboard."
    }
  },
  // Interactive menu verbs when clicking the item
  getVerbs: function() {
    if (!puzzles.unlockedWorkstationCleared) {
      return [
        { name: 'Examine', action: 'examine %' },
        { name: 'Lock The Screen', action: 'secure %' },
      ]
    }
    return [{ name: 'Examine', action: 'examine %' }]
  }
})

createItem("gibson_rack", {}, {
  loc: "basement_server_room",
  alias: "Server Rack #7",
  synonyms: ['rack 7', 'rack', 'gibson', 'server rack', 'terminal', 'console'],
  examine: function() {
    if (!puzzles.bugsSquashed) {
      return "Server Rack #7 — dubbed 'The Gibson' by legacy sysadmins — is coated in a writhing swarm of hardware bugs. You can't reach the terminal keybaord without clearing them first!"
    } else if (!puzzles.gibsonPatched) {
      return "The Gibson's terminal prompt is active. A root login prompt blinks: <b>TELNET Connection Opened (Port 23)</b>.<br>Prompt: <i>User: admin | Password: [?]</i><br>An unpatched Telnet service is running wide open!"
    } else {
      return "Server Rack #7 is fully patched. Telnet Port 23 is closed, SSH key authentication is enforced, and firewall rules are locked tight."
    }
  }
})

createItem("bug_swarm", {}, {
  loc: "basement_server_room",
  alias: "swarm of bugs",
  synonyms: ['bugs', 'swarm', 'pests', 'insects', 'race conditions'],
  examine: "A terrifying hybrid of giant silverfish, copper-chewing beetles, and physical embodiments of null-pointer dereferences. They hate chemical spray.",
})

createItem("storage_terminal", {}, {
  loc: "basement_archive",
  alias: "green monochrome terminal",
  synonyms: ['terminal', 'monochrome screen'],
  examine: "An old CRT monitor displaying a blinking prompt.  It has a sticky note stuck to the side of it.",
})

createItem("sticky_note", TAKEABLE(), {
  loc: "basement_archive",
  alias: "yellow sticky note",
  synonyms: ['sticky note', 'note', 'yellow note', 'credentials note'],
  examine: function() {
    puzzles.hasAdminCredentials = true
    return "A bright yellow post-it note stuck to the ancient CRT monitor. In faded blue ink, someone wrote: <i>'Gibson Root Access — User: admin | Pass: admin (DO NOT REMOVE!)'</i>"
  },
  read: function() {
    return this.examine()
  }
})

createItem("rogue_modem", {}, {
  loc: "floor1_telecom_closet",
  alias: "USRobotics 56k Modem",
  synonyms: ['modem', 'usrobotics', 'rogue modem', 'dialup', 'dial-up modem', 'rack modem'],
  examine: function() {
    if (!puzzles.rogueModemCut) {
      return "A classic USRobotics Sportster 56K modem hooked directly into an unmonitored analog phone line! Its front LEDs (`OH`, `SD`, `RD`) are blinking furiously.  This doesn't appear to be a legitimate corporate device.</i>"
    } else {
      return "The USRobotics modem is powered down with its analog telephone line unplugged."
    }
  },
  getVerbs: function() {
    if (!puzzles.rogueModemCut) {
      return [
        { name: 'Examine', action: 'examine %' },
        { name: 'Unplug Line', action: 'unplug rj11' },
      ]
    }
    return [{ name: 'Examine', action: 'examine %' }]
  }
})

createItem("wire_stripper", TAKEABLE(), {
  loc: "floor1_telecom_closet",
  alias: "punch-down wire tool",
  synonyms: ['tool', 'wire tool', 'punchdown tool', 'stripper', 'crimper'],
  examine: "A yellow 110 punch-down tool used by network techs to terminate CAT5 cables into patch panels. Handy for physical layer repairs!",
  getVerbs: function() {
    return [
      { name: 'Examine', action: 'examine %' },
    ]
  }
})

// --- ACT 4 ITEMS ---

createItem("peggy_ea", NPC(), {
  loc: "floor4_lobby",
  alias: "Peggy (Executive Assistant)",
  synonyms: ['peggy', 'assistant', 'ea', 'executive assistant', 'secretary', 'peggy desk'],
  examine: "Peggy wears a tailored blazer with shoulder pads, reading glasses on a chain, and an unimpressed expression. A brass nameplate on her desk reads 'Peggy Mitchell — Executive Administration'. Her desk holds an IBM Wheelwriter typewriter, a Rolodex, and a steaming mug of peppermint tea.",
  getVerbs: function() {
    return [
      { name: 'Examine', action: 'examine %' },
      { name: 'Talk to', action: 'talk to %' },
    ]
  },
  talkto: function() {
    if (puzzles.execAccessApproved) {
      msg("<i>'Hurry inside, Skyler! The ransomware timer on Ms. Sterling's monitor is ticking down!'</i>")
      return world.SUCCESS
    }

    if (puzzles.act4Complete) {
      msg("Peggy takes a sip of peppermint tea and gives you a subtle nod: <i>'Splendid work saving Ms. Sterling's workstation, Skyler. I've already penciled in your promotion review on her calendar for Monday morning.'</i>")
      return world.SUCCESS
    }

    // Option A: Player has the Tempest Notebook & Pen (Brown-Noser reward)
    if (w.swag_notebook.isHeld()) {
      puzzles.execAccessApproved = true
      msg("You present your official <b>Tempest-branded notebook and pen</b> and point to your Security Champion badge.")
      msg("Peggy inspects the notebook, adjusts her glasses, and checks her daily log.")
      msg("Peggy: <i>'Ah, an official Security Champion authorization logbook! Excellent. Ms. Sterling's workstation just started flashing giant red skulls. Go right on in!'</i>")
      awardMetaAchievement("peggy_approved")
      return world.SUCCESS
    }

    // Option B: Standard Triage Check via security progress
    if (puzzles.act3Complete) {
      puzzles.execAccessApproved = true
      msg("Peggy: 'Skyler! The Security Manager just called up on the intercom to confirm you patched the legacy server in the basement. Ms. Sterling needs you in the corner office immediately!'")
      awardMetaAchievement("peggy_approved")
      return world.SUCCESS
    }

    const peggyQuotes = [
      "<i>'Look, honey, I've got three Vice Presidents on hold and the CEO's screen is locked up. Unless you have official Incident Response clearance documentation, you'll have to wait here.'</i>",
      "<i>'Executive Administration doesn't move for anyone without a signed paper trail or an official Tempest incident logbook.'</i>"
    ]
    const randomQuote = peggyQuotes[Math.floor(Math.random() * peggyQuotes.length)]

    msg("Peggy taps her pen on her desk: <i>'Look, honey, I've got three Vice Presidents on hold and the CEO's screen is locked up. Unless you have official Incident Response clearance documentation, you'll have to wait here.'</i>")
    return world.SUCCESS
  }
})


createItem("ceo_victoria", NPC(), {
  loc: "ceo_office",
  alias: "CEO Victoria Sterling",
  synonyms: ['ceo', 'victoria', 'sterling', 'boss', 'executive'],
  examine: "Victoria Sterling looks uncharacteristically frantic, holding a lukewarm cup of artisanal espresso while staring at her encrypted screen.",
  getVerbs: function() {
    return [
      { name: 'Examine', action: 'examine %' },
      { name: 'Talk to', action: 'talk to %' },
    ]
  },
  talkto: function() {
    if (!puzzles.networkIsolated) {
      msg("Victoria Sterling: 'Skyler! Thank goodness you're here. I just opened a PDF attached to an email titled <i>Q3_Executive_Bonus_Structure.pdf.exe</i> and now all my spreadsheets have .locked extensions!'")
      msg("<i>'Sever the network gateway under my desk before it spreads to the rest of the company!'</i>")
      return world.SUCCESS
    } else if (!puzzles.backupRestored) {
      msg("Victoria Sterling: 'Great job cutting the exfiltration feed! Now head into the Executive Telecom Closet and initiate an offline system restore from the immutable backup controller.'")
      return world.SUCCESS
    } else {
      msg("Victoria Sterling: 'You saved Tempest Weatherwear from a total security nightmare, Skyler! Drinks are on the executive expense account tonight!'")
      return world.SUCCESS
    }
  }
})

createItem("network_gateway", {}, {
  loc: "ceo_office",
  alias: "network gateway switch",
  synonyms: ['gateway', 'switch', 'network switch', 'cable', 'ethernet cable', 'red cable'],
  examine: function() {
    if (!puzzles.networkIsolated) {
      return "A high-speed fiber switch mounted beneath the desk. A thick red Ethernet cable is transmitting encrypted data out to an external IP address. You can type <b>unplug cable</b> or <b>isolate network</b> to kill the connection."
    } else {
      return "The red Ethernet cable hangs disconnected from the gateway switch. The outbound C2 data stream is dead."
    }
  }
})

createItem("backup_controller", {}, {
  loc: "exec_telecom_closet",
  alias: "backup domain controller",
  synonyms: ['backup controller', 'console', 'backup terminal', 'backup', 'terminal'],
  examine: function() {
    if (!puzzles.backupRestored) {
      return "An immutable, offline backup terminal. The screen reads: <b>SYSTEM RESTORE READY — AWAITING INCIDENT RESPONSE COMMAND</b>."
    } else {
      return "The terminal displays a green status bar: <b>100% RESTORE COMPLETE — SHARES ONLINE & REMEDIATED</b>."
    }
  }
})

// Flavor Scenery Objects
createItem("boot_display", {}, {
  loc: "floor1_lobby",
  alias: "boot display",
  synonyms: ['boot', 'boots', 'display case', 'rain boots'],
  examine: "A glass pedestal displaying Tempest's flagship product: the 'PuddleStomper Pro' rain boot line. A placard proudly notes: 'Guaranteed 100% waterproof up to 12 inches of standing water.'",
})

createItem("test_umbrella", TAKEABLE(), {
  loc: "floor1_facilities",
  alias: "windproof umbrella",
  synonyms: ['umbrella', 'storm umbrella', 'windproof umbrella', 'galeforce umbrella'],
  icon: () => 'umbrella',
  isOpen: false,

  examine: function() {
    let stateDesc = this.isOpen 
      ? " It is currently fully expanded indoors, defying corporate superstition." 
      : " It is neatly folded up and secured with a Velcro strap."
    return "A heavy-duty Tempest 'GaleForce 90' umbrella. The tag claims it can withstand 70 mph wind gusts, though IT hasn't tested it against server room cooling fans yet." + stateDesc
  },
  
  // Dynamic verb menu based on open/closed state
  getVerbs: function() {
    const verbs = [
      { name: 'Examine', action: 'examine %' }
    ]

    if(!this.isHeld()) {
      verbs.push({ name: 'Take', action: 'take %' })
    } else {
      verbs.push({ name: 'Drop', action: 'drop %' })
    }
    if (this.isOpen) {
      verbs.push({ name: 'Close', action: 'close %' })
    } else {
      verbs.push({ name: 'Use', action: 'use %' })
    }

    return verbs
  },

  // Engine Verb Handlers
  open: function() {
    return executeOpenUmbrella(this)
  },
  use: function() {
    return executeOpenUmbrella(this)
  },
  close: function() {
    return executeCloseUmbrella(this)
  }
})

// Helper: Open Logic
function executeOpenUmbrella(item) {
  if (!item.isHeld()) {
    msg("You aren't holding the umbrella!")
    return world.FAILED
  }

  if (item.isOpen) {
    msg("The umbrella is already open!")
    return world.SUCCESS
  }

  item.isOpen = true
  msg("<b>WHOOSH!</b> You press the spring-loaded release button on the Tempest 'GaleForce 90' umbrella.")
  msg("The canopy snaps open with a loud thud, instantly invoking seven years of bad corporate luck.")

  // First-time opening spawns the clue slip
  if (!puzzles.umbrellaOpened) {
    puzzles.umbrellaOpened = true
    w.umbrella_note.loc = player.loc // Spawns the note on the floor in current room
    msg("<br>As the canopy stretches, a tiny yellowed slip of paper tucked deep into the fiberglass ribs flutters down to the floor.")
    msg("<i>(A <b>crumpled paper slip</b> falls onto the floor!)</i>")
    awardMetaAchievement("bad_luck_clue")
  }

  return world.SUCCESS
}

// Helper: Close Logic
function executeCloseUmbrella(item) {
  if (!item.isHeld()) {
    msg("You aren't holding the umbrella!")
    return world.FAILED
  }

  if (!item.isOpen) {
    msg("The umbrella is already closed and strapped shut.")
    return world.SUCCESS
  }

  item.isOpen = false
  msg("<b>*CLICK-SHHH*</b> You pull down on the runner and collapse the canopy back down, wrapping the Velcro strap snugly around the folds. Corporate equilibrium is restored.")
  return world.SUCCESS
}

createItem("newton_pda", TAKEABLE(), {
  loc: "executive_boardroom",
  alias: "discarded Apple Newton",
  synonyms: ['newton', 'pda', 'stylus', 'apple newton'],
  examine: "An early handheld tablet with a stylus. The screen displays handwriting recognition log entries: <i>'Egg freckles... Beat eat makes...'</i> It sits in a decorative brass tray, abandoned in favor of paper note pads.",
})

// =============================================================================
// 4. COMMAND DEFINITIONS
// =============================================================================

// --- SYSTEM & CAFÉ COMMANDS ---
commands.push(new Cmd('PressElevatorButton', {
  regex: /^(?:press|push|select|go to|take elevator to|call elevator|press button)?\s*(?:the\s+)?(?:elevator\s+)?(?:button\s+)?([1234b]|basement|lobby|dev|developers|offices|executive|c-suite)?$/i,
  objects: [{special: 'text'}],
  script: function(objects) {
    const btnText = (objects && objects[0] ? String(objects[0]).trim() : '').toLowerCase()

    if (player.loc !== "elevator_1") {
      if (!btnText) {
        if (!canOpenElevatorDoorsFromFloor(player.loc)) {
          msg("The elevator call button on the lobby wall flashes red: <b>RSA TOKEN REQUIRED</b>.")
          return world.FAILED
        }
        if (w.elevator_1.doorOpen) {
          msg("The elevator doors are already open.")
          return world.SUCCESS
        }
        w.elevator_1.doorOpen = true
        msg("You press the elevator call button. The doors slide open with a soft chime.")
        return world.SUCCESS
      }

      msg("You need to be inside the elevator car to press the panel buttons.")
      return world.FAILED
    }

    let btn = btnText
    if (!btn) {
      msg("Which floor do you want to go to?")
      return world.FAILED
    }

    let dest = null
    let arrivalMsg = ""

    if (btn === "b" || btn === "basement") {
      dest = "basement_landing"
      arrivalMsg = "Ding! The elevator clunks and descends into the chilly Basement."
    } else if (btn === "1" || btn === "lobby") {
      dest = "floor1_lobby"
      arrivalMsg = "Ding! The elevator arrives smoothly at Floor 1 (Lobby)."
    } else if (btn === "2" || btn === "developers" || btn === "dev") {
      dest = "floor2_landing"
      arrivalMsg = "Ding! The elevator proceeds to Floor 2 (Developers & Business Teams)."
    } else if (btn === "3" || btn === "offices") {
      dest = "floor3_landing"
      arrivalMsg = "Ding! The elevator proceeds to Floor 3 (Developer Offices)."
    } else if (btn === "4" || btn === "executive" || btn === "c-suite") {
      dest = "floor4_landing"
      arrivalMsg = "Ding! A refined chime plays as plush carpet absorbs your steps on Floor 4 (Executive Suites)."
    }

    if (!dest) {
      msg("That button is invalid.")
      return world.FAILED
    }

    w.elevator_1.currentFloor = dest
    setElevatorMapLocation(dest)
    w.elevator_1.doorOpen = true
    msg(arrivalMsg)
    if (typeof showMap === 'function') {
      showMap()
    }

    world.endTurn()
    return world.SUCCESS
  }
}))

commands.push(new Cmd('DrinkCoffee', {
  regex: /^(?:drink|sip|quaff|consume|gulp)(?: (?:the|a))? (?:coffee|hot coffee|mug|cup|espresso)$/i,
  objects: [],
  script: function() {
    if (!w.cafe_coffee.isHeld()) {
      msg("You aren't holding any coffee! Go visit Joe in The Leaky Mug to get a cup.")
      return world.FAILED
    }

    puzzles.coffeeCount++
    w.cafe_coffee.loc = false

    if (puzzles.coffeeCount === 1) msg("Slurp! You take a deep drink of Tempest's dark roast. A surge of caffeine washes over you. You feel focused, energized, and ready to audit legacy code!")
    else if (puzzles.coffeeCount === 2) msg("Glug, glug! Second cup down. Your typing speed doubles and your heart rate elevates to a lively 110 BPM. Security threat models stand no chance!")
    else if (puzzles.coffeeCount === 3) msg("Gulp! Third cup consumed. Your hands are visibly twitching. You can hear the electrical hum of the fluorescent lights and smell code syntax errors from three rooms away.")
    else if (puzzles.coffeeCount === 4) msg("Down the hatch! Cup four. Time slows down. You achieve temporary enlighten-ment regarding multi-factor authentication protocols...<br>However, your stomach lets out an ominous, thunderous rumble. Your internal biological monitoring system alerts: <b>CRITICAL FLUID CAPACITY REACHED</b>.")
    else msg("You bring the empty mug to your lips, but hesitate. Your stomach churns like a server room cooling system on full overdrive.<br>Any more caffeine and you'll be auditing the plumbing on Floor 1. You seriously need to find a bathroom before drinking another drop!")

    w.cafe_coffee.loc = false // Remove mug from inventory until refilled

    return world.SUCCESS
  }
}))

commands.push(new Cmd('OrderFood', {
  regex: /^(?:order|buy|get|ask for|make me)(?: (?:a|an))? (?:sandwich|turkey sandwich|food|lunch)$/i,
  objects: [],
  script: function() {
    if (player.loc !== "leaky_mug_cafe") {
      msg("You need to be in The Leaky Mug Café to order food.")
      return world.FAILED
    }
    if (w.sandwich.isHeld()) {
      msg("Java Joe winks: 'You've already got a fresh sandwich right there!'")
      return world.SUCCESS
    }
    if (!puzzles.act1Complete) {
      msg("Java Joe shakes his head: 'Sorry, Skyler, the kitchen doesn't open for lunch until noon.'")
      return world.FAILED
    }
    w.sandwich.loc = "me"
    msg("Java Joe hands you a fresh turkey and avocado sandwich on sourdough bread and says, 'We'll put it on the company tab!'")
    return world.SUCCESS
  }
}))

commands.push(new Cmd('SudoSandwich', {
  regex: /^sudo (?:make me a sandwich|make sandwich|order sandwich)$/i,
  objects: [],
  script: function() {
    if (player.loc !== "leaky_mug_cafe") {
      msg("You are not in The Leaky Mug Café.")
      return world.FAILED
    }

    if (w.sandwich.isHeld()) {
      msg("Brewster smirks: 'Sudo elevated privileges accepted, but you already have a sandwich!'")
      return world.SUCCESS
    }

    w.sandwich.loc = "me"
    msg("<b>[SUDO DETECTED] Privilege escalation granted.</b>")
    msg("The brewster stops wiping the counter, blinks twice, and immediately constructs a sandwich at maximum speed.")
    msg("Java Joe: <i>'Okay, okay! Root privileges acknowledged. Here is your sandwich!'</i>")
    msg("<i>(An artisanal turkey sandwich appears in your hands!)</i>")
    awardMetaAchievement("sudo_chef")
    return world.SUCCESS
  }
}))

commands.push(new Cmd('CallPhone', {
  regex: /^(?:call|dial|phone|use)(?: (?:the|a))?(?: (?:phone|telephone|butt set|handset))?(?: (?:to dial|dial|call))? ([\d\-\s\+]+|[a-zA-Z]+)(?:.*)$/i,
  objects: [{ special: 'text' }],
  script: function(objects) {
    // Check if player is in a room with telephone access
    const phoneRooms = ["floor1_telecom_closet", "office_5", "floor4_lobby", "security_office"]
    
    if (!phoneRooms.includes(player.loc)) {
      msg("There isn't a telephone nearby to make an outbound call.")
      return world.FAILED
    }

    const rawInput = objects && objects[0] ? String(objects[0]).trim().toLowerCase() : ""
    
    // Clean raw input down to digits only for length/number checking
    const cleanDigits = rawInput.replace(/\D/g, "")

    // Map named inputs/aliases to clean digit strings
    let targetNum = cleanDigits
    if (rawInput.includes("jenny")) targetNum = "8675309"
    else if (rawInput.includes("ghostbusters")) targetNum = "5552368"
    else if (rawInput.includes("empire") || rawInput.includes("today")) targetNum = "5882300"
    else if (rawInput.includes("pizza") || rawInput.includes("nero")) targetNum = "5556161"
    else if (rawInput.includes("time") || rawInput.includes("clock")) targetNum = "8531212"
    else if (rawInput.includes("weather")) targetNum = "9361212"
    else if (rawInput.includes("moviefone") || rawInput.includes("777")) targetNum = "7773456"
    else if (rawInput.includes("matrix") || rawInput.includes("morpheus")) targetNum = "5550199"
    else if (rawInput.includes("operator") || rawInput === "0") targetNum = "0"
    else if (rawInput.includes("emergency") || rawInput === "911") targetNum = "911"

    // Audio click prefix
    msg(`<b>CLICK-BEEP-BOOP...</b> You unhook the handset and dial <b>${rawInput.toUpperCase()}</b>.`)

    // --- POP CULTURE EASTER EGG NUMBERS ---

    // 1. Jenny (867-5309)
    if (targetNum === "8675309") {
      msg("The line rings twice... followed by a crisp 80s pop-rock guitar riff over the receiver:")
      msg("<i>'♪ Jenny, I got your number... 8-6-7-5-3-0-9! ♪'</i>")
      msg("A digitized voice cuts in: <i>'We're sorry, the party you are trying to reach is currently stuck in 1982.'</i>")
      awardMetaAchievement("jenny_number")
      return world.SUCCESS
    }

    // 2. Ghostbusters (555-2368)
    if (targetNum === "5552368") {
      msg("A energetic brass horn fanfare blasts through the earpiece:")
      msg("<i>'If there's something strange in your neighborhood... who ya gonna call?'</i>")
      msg("A tired receptionist responds: <i>'Ghostbusters HQ. All spectral containment units are currently operational. Please hold.'</i>")
      return world.SUCCESS
    }

    // 3. Empire Today (588-2300)
    if (targetNum === "5882300") {
      msg("An impossibly catch baritone jingle plays immediately:")
      msg("<i>'♪ Five Eight Eight, Two Three-Hundred... EMPIRRRRE! ♪'</i>")
      msg("A voice prompt asks: <i>'Press 1 for next-day carpet installation in the Chicagoland area.'</i>")
      return world.SUCCESS
    }

    // 4. Little Nero's Pizza (555-6161)
    if (targetNum === "5556161") {
      msg("A guy answers over background kitchen noise:")
      msg("<i>'Little Nero's Pizza! Home of the 20-minute delivery guarantee. If you're calling about the valet who ran over our delivery boy's driveway ornaments, the owner is already filing a report!'</i>")
      return world.SUCCESS
    }

    // 5. Moviefone (777-FILM / 777-3456)
    if (targetNum === "7773456") {
      msg("An overly enthusiastic voice booming over the line:")
      msg("<i>'Hello! And welcome to MOVIEFONE! If you know the name of the movie you'd like to see, press 1 now! Showing tonight at Chicago Ridge 12: The Matrix and Armageddon!'</i>")
      return world.SUCCESS
    }

    // 6. Time & Temperature (853-1212)
    if (targetNum === "8531212") {
      msg("A precise robotic tone chiming in:")
      msg("<i>'At the tone, the Central Standard Time will be... 9:14 AM and 20 seconds. Temperature downtown is 48 degrees with heavy rain.' *BEEP*</i>")
      return world.SUCCESS
    }

    // 7. Weather Line (936-1212)
    if (targetNum === "9361212") {
      msg("A crackly recording begins:")
      msg("<i>'Chicago Doppler Radar Update: Gale warning in effect for Lake Michigan. High humidity, 100% precipitation. Expect severe rubber boot conditions across all downtown streets.'</i>")
      return world.SUCCESS
    }

    // 8. The Matrix Operator (555-0199)
    if (targetNum === "5550199") {
      msg("You hear rapid green-screen modem keystrokes over static:")
      msg("<i>'Operator... I need a hardline trace on Floor 4. Tank, lock down the landline egress before agents intercept the signal!'</i>")
      return world.SUCCESS
    }

    // 9. Operator (0)
    if (targetNum === "0") {
      msg("A polite automated switchboard operator speaks:")
      msg("<i>'Tempest Weatherwear automated switchboard. For IT Support, press 1. For Executive Offices, press 4. For security incidents, please panic quietly in your cubicle.'</i>")
      return world.SUCCESS
    }

    // 10. Emergency (911)
    if (targetNum === "911") {
      msg("A dispatch operator answers promptly:")
      msg("<i>'Chicago 911 Emergency Dispatch. Is your incident physical or IT-related? If it's a ransomware outbreak, please transfer your call to the Security Desk.'</i>")
      return world.SUCCESS
    }

    // 11. Directory Assistance (411)
    if (targetNum === "411") {
      msg("A crackly automated voice greets you over a burst of line static:")
      msg("<i>'City and state, please?'</i>")
      msg("You pause, and the voice continues automatically: <i>'Listing found for: TEMPEST WEATHERWEAR HQ — 100 Plaza Way, Chicago, IL. Connecting you now...'</i>")
      msg("<b>*CLICK-RITZZZ*</b>")
      msg("An automated voice-mail prompt answers: <i>'Thank you for calling Tempest Weatherwear. Our switchboard is currently experiencing high call volume due to an active network incident.'</i>")
      return world.SUCCESS
    }

    // --- DIGIT VALIDATION & FALLBACK LOGIC ---

    // Invalid length check (< 7 or > 10 digits)
    if (cleanDigits.length < 7 || cleanDigits.length > 10) {
      msg("<b>*ERR-BEEP-BEEP-BEEP*</b> An operator intercept recording plays:")
      msg("<i>'We're sorry, your call cannot be completed as dialed. Please check the number and dial again. Numbers must contain 7 or 10 digits.'</i>")
      return world.FAILED
    }

    // Standard valid 7 or 10 digit number -> Line Busy
    msg("<b>*BUSY-BUSY-BUSY-BUSY*</b>")
    msg("The receiver emits a fast busy tone. Looks like that line is currently occupied or unassigned.")
    return world.SUCCESS
  }
}))


// --- ACT 1 COMMANDS ---
commands.push(new Cmd('ShowLicenseToGuard', {
  regex: /^(?:show|present|hand|give)(?: (?:the|my))? (?:license|driver's license|drivers license|id|photo id)(?: (?:to|for))? (?:guard|officer|bishop|security guard)?$/i,
  objects: [],
  script: function() {
    if (player.loc !== "floor1_reception") {
      msg("Officer Bishop isn't here to check your ID.")
      return world.FAILED
    }

    if (!w.drivers_license.isHeld()) {
      msg("You don't have your driver's license!")
      return world.FAILED
    }

    if (w.security_badge.isHeld() || w.security_badge.loc === "me") {
      msg("Officer Bishop smiles: <i>'I've already verified your ID and printed your badge, Skyler!'</i>")
      return world.SUCCESS
    }

    // Badge creation sequence!
    puzzles.badgeVerified = true
    w.security_badge.loc = "me"
    w.security_badge.worn = true

    msg("You hand your driver's license over to Officer Bishop. He compares your photo, types your employee ID (<b>#423612</b>) into the computer terminal, and points a small desktop webcam at you.")
    msg("Officer Bishop: <i>'Look right into the lens... say cheese!'</i>")
    msg("<b>*FLASH!*</b>")
    msg("<b>*BZZZZT-CLACK*</b> The badge printer hums to life, spitting out a glossy Tempest ID card with your picture on it.")
    msg("Officer Bishop clips it to a blue lanyard and hands it to you: <i>'Welcome to Tempest Weatherwear, Skyler! Keep your ID #423612 badge visible at all times.'</i>")
    msg("<br><i>(You received your <b>Security Badge</b> and clipped it to your lanyard!)</i>")

    return world.SUCCESS
  }
}))
commands.push(new Cmd('ChallengeContractor', {
  regex: /^(?:challenge|confront|stop|question|report|check|ask|tell|deny)(?: (?:the|a))? (?:contractor|him|man|guy|tailgater|suspicious contractor)(?: (?:no|for id|to leave|badge))?$/,
  objects: [],
  script: function() {
    if (w.contractor.loc !== player.loc || puzzles.contractorStopped) {
      msg("There is no contractor here to challenge.")
      return world.FAILED
    }
    puzzles.contractorStopped = true
    w.contractor.loc = "nowhere"
    msg("You stand your ground and demand to see his work order and company ID. Flustered by your challenge, the contractor mutters an excuse, turns around, and quickly exits out the front doors!")
    msg("The security guard nods approvingly at you. 'Good eye catching that tailgater!'")
    if (puzzles.badgeVerified) {
      msg(" He glances at your ID badge and says, 'You can pass through the security check now.'")
    }
    awardMetaAchievement("social_engineer")
    return world.SUCCESS
  }
}))


commands.push(new Cmd('ScanBadge', {
  regex: /^(?:scan|swipe|use)(?: (?:the|a|my))? (?:security\s+)?(?:badge|id\s+)(?:\s+(?:on|at|against)?\s*(?:door|scanner|reader|security door|security office heavy door)?)?$/i,
  objects: [],
  script: function() {
    if (player.loc !== "floor1_reception") {
      msg("You get some weird looks from your coworkers. The badge scanner is only accessible from the Security Office entrance.")
      return world.FAILED
    }
    if (!puzzles.badgeVerified) {
      msg("It appears that you need a badge to scan. Speak to Officer Bishop to get one printed first!")
      return world.FAILED
    }
    if (w.security_office_door.isOpen) {
      msg("The scanner beeps green, but the heavy door is already propped open.")
      return world.SUCCESS
    }

    puzzles.badgeScanned = true
    w.security_office_door.isOpen = true
    msg("<b>*BEEP-CHIME*</b> You swipe your badge on the scanner. The LED indicator turns green, and the heavy door unlatches and clicks open!")
    return world.SUCCESS
  }
}))

commands.push(new Cmd('CloseSecurityDoor', {
  regex: /^(?:close|shut|slam)(?: (?:the|a))? (?:security door|office door|heavy door|door)$/i,
  objects: [],
  script: function() {
    return executeCloseSecurityDoor(w.security_office_door)
  }
}))

commands.push(new Cmd('SyncRSAToken', {
  // Matches: "enter 307126", "type 307126", "enter code 307126", "type 307126 into monitor", etc.
  regex: /^(?:enter|type|input|submit)(?: code| passcode)? (\d{6})(?:.*)$/i,
  objects: [
    { special: 'text' } // Tells QuestJS to map capture group 1 (\d{6}) to objects[0]
  ],
  script: function(objects) {
    // QuestJS passes captured text objects into objects[0] as a clean string!
    const inputCode = String(objects[0]).trim()

    if (player.loc !== "floor1_lobby") {
      msg("You need to be in the Main Atrium Lobby near the MFA monitor to enter an authentication code.")
      return world.FAILED
    }

    if (puzzles.monitorSync) {
      msg("The MFA monitor is already synchronized and verified!")
      return world.SUCCESS
    }

    if (!w.time_sync_token.isHeld()) {
      msg("You type the numbers into the prompt, but without an RSA SecurID fob to generate a valid time-synced key, the screen flashes: <code>##--INVALID PASSCODE--##</code>.")
      return world.FAILED
    }

    if (!puzzles.activeRSAPasscode) {
      msg("You haven't checked your RSA SecurID fob yet! Type <b>examine fob</b> to read the current LCD screen.")
      return world.FAILED
    }

    if (inputCode !== String(puzzles.activeRSAPasscode)) {
      msg(`You type <b>${inputCode}</b> into the terminal keyboard...`)
      msg(`The monitor flashes red: <code>##--ERR-DESYNC: CODE ${inputCode} INVALID OR EXPIRED--##</code>.`)
      msg("Check your RSA SecurID fob again (<b>examine fob</b>) to get the latest 6-digit rolling code!")
      return world.FAILED
    }

    // Success Path
    msg(`You type <b>${inputCode}</b> into the MFA Monitor terminal keyboard.`)
    msg(`<br>The static clears instantly! The screen displays a green checkmark: <b style='color:green;'>MFA TIME-SYNC SUCCESSFUL — PASSCODE ${inputCode} VERIFIED</b>.`)
    
    puzzles.currentRSAPasscode = inputCode
    puzzles.monitorSync = true
    puzzles.elevatorUnlocked = true  
    awardMetaAchievement("mfa_master")

    renderActBanner(
      "ACT I COMPLETE",
      "Access Granted",
      "Chime! The elevator keypad flashes a bright green verification light.")
      msg("A digitized voice: 'MFA VERIFIED. ELEVATOR CLEARANCE GRANTED TO THE BASEMENT AND FLOORS 2-4.'<br> The heavy elevator doors to the SOUTH slide open, ready to take you up into the organization.<br><i>You have passed the perimeter security check. Step into the elevator to begin <b>Act II: Mapping the Attack Surface</b>.</i>"
    )

    // Move Morgan from the lobby to the meeting room on floor 2 for Act 2
    w.morgan_ir_lead.loc = "floor2_meeting_room"
    return world.SUCCESS
  }
}))


// --- ACT 2 COMMANDS ---
commands.push(new Cmd('SqueezeStressBall', {
  regex: /^(?:squeeze|squish|compress)(?: (?:the|a))? (?:stress ball|foam stress ball|ball)$/i,
  objects: [],
  script: function() {
    if (!w.stress_ball.isHeld()) {
      msg("You need to pick up the stress ball first!")
      return world.FAILED
    }
    return w.stress_ball.squeeze()
  }
}))

commands.push(new Cmd('ThrowStressBall', {
  regex: /^(?:throw|toss|lob|pitch)(?: (?:the|a))? (?:stress ball|foam stress ball|ball)$/i,
  objects: [],
  script: function() {
    if (!w.stress_ball.isHeld()) {
      msg("You aren't holding the stress ball!")
      return world.FAILED
    }
    return w.stress_ball.throw()
  }
}))

commands.push(new Cmd('BiteStressBall', {
  regex: /^(?:bite|chew|gnaw)(?: (?:on)? (?:the|a))? (?:stress ball|foam stress ball|ball)$/i,
  objects: [],
  script: function() {
    if (!w.stress_ball.isHeld()) {
      msg("You aren't holding the stress ball!")
      return world.FAILED
    }
    return w.stress_ball.bite()
  }
}))


commands.push(new Cmd('DisableFTP', {
  regex: /^(?:disable|secure|lock|block|stop)(?: down)?(?: anonymous)? (?:ftp|ftp server|ftp service|build server)$/i,
  objects: [],
  script: function() {
    if (player.loc !== "floor2_landing") {
      msg("You need to be at the FTP build terminal on Floor 2 to modify server permissions.")
      return world.FAILED
    }

    if (puzzles.s3Locked) {
      msg("The FTP server is already secured with anonymous access disabled.")
      return world.SUCCESS
    }

    puzzles.s3Locked = true
    msg("<b>You edit /etc/vsftpd.conf on the build terminal:</b>")
    msg("<code>anonymous_enable=NO</code><br><code>local_enable=YES</code><br><code>write_enable=YES</code>")
    msg("<br>You execute <code>kill -HUP $(pgrep ftpd)</code> to restart the daemon.")
    msg("<br>The terminal console turns green! <b style='color:green;'>SUCCESS: ANONYMOUS FTP ACCESS NEUTRALIZED & CHROOT ENFORCED!</b>")
    awardMetaAchievement("cloud_guard")
    return world.SUCCESS
  }
}))

commands.push(new Cmd('FixXSS', {
  regex: /^(?:fix xss|sanitize input|escape html|patch portal|fix portal|encode input|fix bug)$/i,
  objects: [],
  script: function() {
    if (player.loc !== "office_4") {
      msg("You need to be at your workstation in your office (Office 4) to patch and deploy the portal code.")
      return world.FAILED
    }

    if (!w.xss_bug_report.isHeld()) {
      msg("You don't have the active XSS ticket! Talk to the QA Tester in Floor 2 DevOps to get the vulnerability details first.")
      return world.FAILED
    }

    if (puzzles.xssFixed) {
      msg("The XSS vulnerability is already patched. All user input in the ordering portal is strictly escaped.")
      awardMetaAchievement("xss_slayer")
      return world.SUCCESS
    }

    puzzles.xssFixed = true
    if (typeof metamenu !== "undefined") metamenu.awardAchievement("xss_slayer")

    msg("<b>You sit down at your workstation and open order_comments.js in VS Code:</b>")
    msg("<code>// BEFORE: container.innerHTML = userInput;</code>")
    msg("<code>// AFTER:  container.textContent = sanitizeHTML(userInput);</code>")
    msg("<br>You wrap the customer review field with strict HTML entity encoding, commit the changes to Git, and push to main.")
    msg("The automated pipeline passes! <b style='color:green;'>SUCCESS: STORED XSS VULNERABILITY NEUTRALIZED!</b>")
    
    return world.SUCCESS
  }
}))

// Fix Shadow Admin Command (DevOps Terminal)
commands.push(new Cmd('FixShadowAdmin', {
  regex: /^(?:sanitize|fix|secure|reconfigure|use) (?:keycard|least privilege keycard|terminal|shadow admin)$/,
  objects: [],
  script: function() {
    if (player.loc !== "floor2_devops") {
      msg("You need to be in the Build & Release Lab near the deployment terminal.")
      return world.FAILED
    }
    if (!w.least_privilege_keycard.isHeld()) {
      msg("You need the Least Privilege Keycard from your manager to access the server and reconfigure the access control policies.")
      return world.FAILED
    }
    puzzles.shadowAdminFixed = true
    w.pipeline_logs.loc = "me" 
    msg("You swipe the Least Privilege Keycard at the terminal. Over-privileged build script service accounts are revoked and restricted to read-only access!")
    msg("The terminal printer clacks furiously and spits out a fresh printout of the <b>Nightly Build Logs</b>. You pick them up.")
    return world.SUCCESS
  }
}))

commands.push(new Cmd('KickPrinter', {
  regex: /^(?:kick|hit|smash|percussive maintenance|fix|clear)(?: (?:the|a))? (?:printer|network printer|pc load letter)$/i,
  objects: [],
  script: function() {
    if (player.loc !== "floor2_landing") {
      msg("There's no malfunctioning printer here to kick.")
      return world.FAILED
    }

    if (puzzles.printerCleared) {
      msg("The printer is already cleared. No need to administer further physical corrections.")
      return world.SUCCESS
    }

    puzzles.printerCleared = true
    w.printed_audit_clue.loc = "floor2_landing" // Drops the clue in the room

    msg("<b>WHACK!</b> You channel your inner Michael Bolton and deliver a swift, cathartic kick to the side of the casing.")
    msg("The printer lets out a mechanical groan, spits out a flurry of paper scraps, and finally releases the jammed document onto the floor!")
    msg("<i>(A <b>tattered audit printout</b> falls onto the floor.)</i>")
    return world.SUCCESS
  }
}))

commands.push(new Cmd('RevokeAPIKey', {
  regex: /^(?:revoke key|remove api key|env variable|scan secrets|fix api key|revoke api key)$/i,
  objects: [],
  script: function() {
    if (player.loc !== "office_4") {
      msg("You need to be at your workstation in Office 4 to run repository secret scans.")
      return world.FAILED
    }

    if (puzzles.apiKeyRevoked) {
      msg("The hardcoded API key has already been revoked and replaced with environment variables.")
      return world.SUCCESS
    }

    puzzles.apiKeyRevoked = true
    msg("<b>You run git-leaks on the frontend repo:</b>")
    msg("Found hardcoded secret: <code>const STRIPE_SECRET_KEY = 'sk_live_99xTempestProdSecretKey';</code>")
    msg("<br>You immediately revoke the live key in the Stripe console, replace the code with <code>process.env.STRIPE_SECRET_KEY</code>, and add <code>.env</code> to <code>.gitignore</code>.")
    msg("<b style='color:green;'>SUCCESS: HARDCODED API KEY REVOKED & REMEDIATED!</b>")
    return world.SUCCESS
  }
}))

commands.push(new Cmd('UseCDOnWorkstation', {
  regex: /^(?:insert|put|load|use|play|run)(?: (?:the|a))? (?:aol cd|cd|cd-rom|disc|aol disc|aol install cd disk)(?: (?:in|into|on))? (?:workstation|terminal|computer|pc|cd drive|drive)?$/i,
  objects: [],
  script: function() {
    if (!w.aol_cd.isHeld()) {
      msg("You don't have the AOL CD-ROM in your inventory.")
      return world.FAILED
    }

    if (player.loc !== "office_4") {
      msg("You need to be at your workstation in Office 4 to try loading that CD.")
      return world.FAILED
    }

    msg("<b>*WHIRRRRRRR*</b> You press the eject button on your workstation's 24x CD-ROM drive, place the glossy AOL disc into the tray, and push it shut.")
    msg("The drive spins up with a high-pitched hum. Suddenly, your monitor flashes a red endpoint protection alert:")
    msg("<br><code style='color:red;'>[SECURITY POLICY VIOLATION] Unauthorized media auto-run blocked. Unvetted software installations are strictly prohibited on Tempest corporate endpoints.</code><br>")
    msg("<b>*CHUNK-CLICK*</b> The CD tray pops right back open, ejecting the disc back to you.")
    return world.SUCCESS
  }
}))


commands.push(new Cmd('PerformThreatModel', {
  regex: /^(?:threat model|analyze|use whiteboard|review whiteboard|draw threat model)$/i,
  objects: [],
  script: function() {
    if (player.loc !== "floor2_meeting_room") {
      msg("You need to be at the whiteboard in the Meeting Room.")
      return world.FAILED
    }
    if (!w.dry_erase_markers.isHeld()) {
      msg("You need to pick up the dry-erase markers from the conference table before you can draw the threat model on the whiteboard!")
      return world.FAILED
    }
    if (!w.pipeline_logs.isHeld() || !w.code_review_checklist.isHeld()) {
      msg("Archie taps his Trapper Keeper: <i>'We are missing essential telemetry! Bring the Nightly Build Logs and the Code Review Checklist so we can map data boundaries correctly.'</i>")
      return world.FAILED
    }

    puzzles.threatModelComplete = true
    
    renderActBanner(
      "ACT II COMPLETE",
      "Mapping the Attack Surface",
      "Uncapping the red and green dry-erase markers, you cross-reference the Nightly Build Logs with the Pair Programming Inspection Checklist directly on the glass whiteboard.<br><br>You map out the data boundaries of our XP user stories.  The threat model clearly isolates the root vulnerability: an unauthenticated legacy Telnetendpoint is running on <b>Legacy Server Rack #7 in the Basement</b>.<br><br><i>You are now ready to take the elevator down for <b>Act III: The Descent into Legacy</b>.</i>"
    )

     w.morgan_ir_lead.loc = "office_8" // Moves Morgan to her office for Act 3

    return world.SUCCESS
  }
}))

// --- ACT 3 COMMANDS ---
commands.push(new Cmd('GiveLunchToBoss', {
  regex: /^(?:give|hand|bring|feed)(?: (?:the|my|his))? (?:lunch|food|meal|coffee and sandwich|sandwich and coffee)(?: (?:to|for))? (?:manager|boss|security manager)?$/i,
  objects: [],
  script: function() {
    if (player.loc !== "office_5") {
      msg("Your Security Manager isn't here to take lunch.")
      return world.FAILED
    }
    return w.security_manager.giveTo({ obj: w.sandwich })
  }
}))


commands.push(new Cmd('GiveSurgeToGus', {
  regex: /^(?:give|hand|offer|trade)(?: (?:the|a))? (?:surge|soda|can of surge|surge soda|can of surge soda)(?: (?:to|for))? (?:gus|sysadmin|legacy admin)?$/i,
  objects: [],
  script: function() {
    if (player.loc !== "basement_archive") {
      msg("Gus isn't here to take the soda.")
      return world.FAILED
    }
    if (!w.surge_soda.isHeld()) {
      msg("You don't have the can of Surge Soda in your inventory!")
      return world.FAILED
    }
    return w.gus_sysadmin.handleGiveTo({ obj: w.surge_soda })
  }
}))

commands.push(new Cmd('OpenUmbrella', {
  regex: /^(?:open|use|unfold|pop|deploy)(?: (?:the|a))? (?:umbrella|windproof umbrella|gale force umbrella)$/i,
  objects: [],
  script: function() {
    return executeOpenUmbrella(w.test_umbrella)
  }
}))

commands.push(new Cmd('CloseUmbrella', {
  regex: /^(?:close|fold|collapse|shut)(?: (?:the|a))? (?:umbrella|windproof umbrella|gale force umbrella)$/i,
  objects: [],
  script: function() {
    return executeCloseUmbrella(w.test_umbrella)
  }
}))

commands.push(new Cmd('StopPhishingAttack', {
  regex: /^(?:stop|block|intercept|report|delete|cancel)(?: (?:the|a))? (?:phish|phishing|kevin|sales representative|installer|rootkit|survey\.exe|gift card)?$/i,
  objects: [],
  script: function() {
    if (player.loc !== "floor2_sales") {
      msg("There is no active phishing incident to stop here.")
      return world.FAILED
    }

    if (puzzles.phishStopped) {
      msg("The phishing email has already been deleted and reported to IT Security.")
      return world.SUCCESS
    }

    puzzles.phishStopped = true

    msg("<b>*SLAM!*</b> You grab Kevin's mouse just as his finger begins to press the left-click button.")
    msg("You point out the suspicious sender domain (<code>tempest-free-giftcard.net</code>) and the double-extension file payload (<code>survey_installer.exe</code>).")
    msg("Kevin's eyes go wide: <i>'Whoa... that would have installed a rootkit across our local subnet, wouldn't it?'</i>")
    msg("You forward the email to the security team and hit <b>Shift + Delete</b>, purge the message from his inbox.")
    msg("<br><b style='color:green;'>SUCCESS: PHISHING ROOTKIT INTERCEPTED & REMEDIATED!</b>")

    awardMetaAchievement("phish_slayer")
    return world.SUCCESS
  }
}))

commands.push(new Cmd('LockWorkstation', {
  regex: /^(?:lock screen|lock workstation|lock terminal|win\+l|lock pc|secure workstation|clean desk|secure terminal|secure unattended workstation)$/i,
  objects: [],
  script: function() {
    if (player.loc !== "basement_archive") {
      msg("There is no unlocked, unattended workstation here to secure.")
      return world.FAILED
    }

    if (puzzles.unlockedWorkstationCleared) {
      msg("The workstation is already locked.")
      return world.SUCCESS
    }

    puzzles.unlockedWorkstationCleared = true
    awardMetaAchievement("clean_desk")
    msg("<b>You press Win + L on the mechanical keyboard.</b>")
    msg("The screen locks instantly, returning to the domain login prompt.")
    msg("You leave a friendly yellow <b>'Security Champion Clean Desk Reminder'</b> card on top of the keyboard.")
    msg("<br><b style='color:green;'>SUCCESS: PHYSICAL CLEAN DESK AUDIT COMPLETE!</b>")
    return world.SUCCESS
  }
}))

commands.push(new Cmd('SprayBugs', {
  regex: /^(?:spray|use bug spray|kill bugs|exterminate|squash)(?: (?:the|a))? (?:bugs|swarm|pests|insects|rack|gibson|bug spray)?$/i,
  objects: [],
  script: function() {
    if (player.loc !== "basement_server_room") {
      msg("There are no server bugs here to spray.")
      return world.FAILED
    }
    
    if (puzzles.bugsSquashed) {
      msg("The server rack is already bug-free. The lingering smell of 'Debugger Pro 5000' keeps new pests at bay.")
      return world.SUCCESS
    }

    if (!w.bug_spray.isHeld()) {
      msg("You try to shoo the bugs away with your hands, but a race-condition beetle snaps at your fingers! You need chemical-grade <b>bug spray</b>.")
      return world.FAILED
    }

    puzzles.bugsSquashed = true
    msg("<b>PZZZZZZZT!</b> You unleash a thick cloud of Debugger Pro 5000 over Server Rack #7.")
    msg("The bugs screech in unhandled exceptions and scatter frantically into the floor grates. The terminal keyboard of <b>The Gibson</b> is now completely clear!")
    return world.SUCCESS
  }
}))

commands.push(new Cmd('DisconnectRogueModem', {
  regex: /^(?:unplug|cut|disconnect|disable|remove)(?: (?:the|a))?(?: (?:rj11|modem|phone line|line|cable|usrobotics|56k modem|usrobotics 56k modem))+(?:.*)$/i,
  objects: [],
  script: function() {
    if (player.loc !== "floor1_telecom_closet") {
      msg("There is no active modem line here to disconnect.")
      return world.FAILED
    }

    if (puzzles.rogueModemCut) {
      msg("The rogue modem line is already unplugged and neutralized.")
      return world.SUCCESS
    }

    puzzles.rogueModemCut = true
    msg("<b>YANK!</b> You grab the translucent plastic RJ11 clip and snap the phone line out of the modem's `LINE` port.")
    msg("The screeching dial-up static cuts out instantly with a soft click, and the `OH` (Off-Hook) LED dies.")
    msg("You leave a note on the rack: <i>'UNAUTHORIZED DIAL-IN BACKDOOR REMOVED — SEE SECURITY CHAMPION.'</i>")
    msg("<br><b style='color:green;'>SUCCESS: ROGUE WAR-DIALING BACKDOOR NEUTRALIZED!</b>")

    awardMetaAchievement("modem_slayer")

    return world.SUCCESS
  }
}))

commands.push(new Cmd('ShakeVendingMachine', {
  regex: /^(?:shake|kick|hit|shove|rock|percussive maintenance)(?: (?:the|a))? (?:vending machine|machine|vend-o-matic|c4|vend-o-matic 3000)?$/i,
  objects: [],
  script: function() {
    if (player.loc !== "floor2_breakroom") {
      msg("There is no vending machine here to shake.")
      return world.FAILED
    }

    if (puzzles.vendingShaken) {
      msg("You already knocked the stuck item free. Shaking it again will just attract Facilities maintenance!")
      return world.SUCCESS
    }

    puzzles.vendingShaken = true
    w.surge_soda.loc = "floor2_breakroom" // Drops soda into the room

    msg("<b>THUMP!</b> You shoulder-tackle the side of the Vend-o-Matic 3000 with calculated precision.")
    msg("The machine shudders and lets out a groan. The icy cold can drops into the retrieval chute with a satisfying <i>CLUNK!</i>")
    msg("<br><i>(A <b>can of Surge Soda</b> rolls out into the retrieval tray!)</i>")

    awardMetaAchievement("vend_etta")

    return world.SUCCESS
  }
}))

commands.push(new Cmd('PatchGibson', {
  regex: /^(?:patch|login|hack|fix|access|use)(?: (?:the|a))? (?:gibson|server|rack|terminal|rack 7)$/i,
  objects: [],
  script: function() {
    if (player.loc !== "basement_server_room") {
      msg("You need to be in the Basement Server Room to access The Gibson.")
      return world.FAILED
    }

    if (!puzzles.bugsSquashed) {
      msg("You can't reach the keyboard! The swarm of bugs is blocking the console.")
      return world.FAILED
    }

    if (puzzles.gibsonPatched) {
      msg("The Gibson is already secure. Telnet is disabled and SSH keys are active.")
      return world.SUCCESS
    }

    // --- REQUIREMENT CHECK: STICKY NOTE READ/HELD ---
    if (!puzzles.hasAdminCredentials) {
      msg("You sit down at the terminal prompt:")
      msg("<code>TELNET 192.168.1.107 (Port 23) — ENTER ROOT PASSWORD:</code>")
      msg("You try guessing standard corporate passwords, but access is denied. You need to find the documented admin credentials first!")
      return world.FAILED
    }

    // Successful patch sequence once credentials are known
    msg("You sit down at the terminal prompt:")
    msg("<code>TELNET 192.168.1.107 (Port 23) — ENTER ROOT PASSWORD:</code>")
    msg("Using the credentials from the yellow sticky note (<b>admin / admin</b>), you authenticate as root, terminate the unencrypted Telnet daemon, and deploy SSH hardening scripts across the legacy subnet.")
    msg("<br><b style='color:green;'>SUCCESS: LEGACY SERVER RACK #7 PATCHED & SECURED!</b>")
    
    puzzles.gibsonPatched = true
    puzzles.act3Complete = true

    // Trigger Act III Completion Narrative & Auto-Save
    renderActBanner(
      "ACT III COMPLETE",
      "The Descent into Legacy",
      "With the physical pests eliminated and the legacy Gibson server secured, the ominous humming in the basement turns into a smooth, compliant purr.<br><br>Suddenly, your pager buzzes with an urgent notification from the C-Suite on Floor 4:<br><b style='color:#dc3545;'>'CRITICAL EMERGENCY: Executive Ransomware Outbreak in Progress!'</b>"
    )

    // Move Boss from the office to the EEO Office
    w.morgan_ir_lead.loc = "ceo_office"
    return world.SUCCESS
    },
}))

// --- ACT 4 COMMANDS ---

commands.push(new Cmd('ShowCredentialsToPeggy', {
  regex: /^(?:show|give|present|hand)(?: (?:the|my))? (?:notebook|pen|credentials|badge|swag|packet)(?: to)? (?:peggy|assistant|ea)$/i,
  objects: [],
  script: function() {
    if (player.loc !== "floor4_lobby") {
      msg("Peggy isn't here to inspect your credentials.")
      return world.FAILED
    }

    if (!w.swag_notebook.isHeld() && !w.onboarding_packet.isHeld()) {
      msg("You don't have any physical credential documents in your inventory to show Peggy!")
      return world.FAILED
    }

    puzzles.execAccessApproved = true
    msg("You show Peggy your official Tempest documentation. She reviews the security stamp, unlatches the mahogany door, and buzzes you into the CEO's office!")
    awardMetaAchievement("peggy_approved")
    return world.SUCCESS
  }
}))

commands.push(new Cmd('UpgradeBadge', {
  regex: /^(?:upgrade badge|get executive clearance|authorize badge|request clearance)$/i,
  objects: [],
  script: function() {
    if (player.loc !== "floor3_landing" && player.loc !== "office_5") {
      msg("You need to request clearance at the Floor 3 Security Manager's desk.")
      return world.FAILED
    }
    
    puzzles.execClearanceGranted = true
    msg("You swipe your security badge at the administrative console. The reader beeps twice and flashes green: <b>EXECUTIVE CLEARANCE (LEVEL 4) GRANTED</b>.")
    msg("You can now access Floor 4 via the elevator!")
    return world.SUCCESS
  }
}))

commands.push(new Cmd('IsolateNetwork', {
  regex: /^(?:unplug|isolate|disconnect|cut)(?: (?:the|a))? (?:cable|network|gateway|switch|ethernet)?$/i,
  objects: [],
  script: function() {
    if (player.loc !== "ceo_office") {
      msg("There is no network gateway switch here to isolate.")
      return world.FAILED
    }

    if (puzzles.networkIsolated) {
      msg("The network is already isolated.")
      return world.SUCCESS
    }

    puzzles.networkIsolated = true
    msg("<b>CLACK!</b> You reach under CEO Victoria's desk and yank the red fiber cable straight out of the gateway switch.")
    msg("The skull-and-crossbones countdown freezes! The outbound data exfiltration link is immediately severed.")
    msg("Victoria sighs in relief: <i>'Phew! Now head to the Boardroom to restore our systems from the offline backup controller.'</i>")
    return world.SUCCESS
  }
}))

commands.push(new Cmd('RestoreBackups', {
  regex: /^(?:restore|run restore|restore backups|deploy fix|remediate)(?: (?:the|a))? (?:backup|system|controller|boardroom terminal)?$/i,
  objects: [],
  script: function() {
    if (player.loc !== "exec_telecom_closet") {
      msg("You must be in the Executive Telecom Closet at the offline backup controller to trigger a system restore.")
      return world.FAILED
    }

    if (!puzzles.networkIsolated) {
      msg("<b>CANNOT RESTORE:</b> The active network connection in the CEO's office is still leaking encrypted packets! Isolate the network connection first.")
      return world.FAILED
    }

    if (puzzles.backupRestored) {
      msg("System restore has already completed successfully.")
      return world.SUCCESS
    }

    puzzles.backupRestored = true
    puzzles.act4Complete = true

    msg("You type in the emergency incident recovery key and initiate the roll-back protocol.")
    msg("The backup domain controller purges the ransomware payloads, decrypts the CEO's workstation shares, and deploys zero-day signatures across all company endpoints.")
    msg("<br><b style='color:green;'>SUCCESS: EXECUTIVE RANSOMWARE THREAT FULLY NEUTRALIZED!</b>")

    // --- DYNAMIC SCORECARD CALCULATIONS ---
    const allAchievements = Object.values(globalThis.metamenu?.achievements ?? {})
    const totalCount = allAchievements.length || 15
    const unlockedCount = allAchievements.filter(ach => ach.unlocked).length
    const scorePct = Math.round((unlockedCount / totalCount) * 100)

    // Performance Rank Title
    let rankTitle = "JUNIOR IT SUPPORT TECH"
    if (scorePct === 100) rankTitle = "LEGENDARY CHIEF INFORMATION SECURITY OFFICER (CISO)"
    else if (scorePct >= 80) rankTitle = "SENIOR SECURITY CHAMPION"
    else if (scorePct >= 60) rankTitle = "INCIDENT RESPONSE SPECIALIST"
    else if (scorePct >= 40) rankTitle = "APPSEC CODE AUDITOR"

    // --- HIGH-IMPACT VICTORY SCREEN ---
// --- HIGH-IMPACT VICTORY SCREEN ---
    msg(`<br><div style="border: 3px double #00ff00; background-color: #041405; color: #33ff33; padding: 20px; border-radius: 8px; font-family: monospace; box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);">
      <div style="font-size: 1.6em; font-weight: bold; letter-spacing: 2px; text-align: center; color: #00ff00;">
        🎉 MISSION ACCOMPLISHED — TEMPEST HQ SAVED! 🎉
      </div>
      <div style="font-size: 1.0em; text-align: center; color: #17a2b8; margin-top: 4px; font-style: italic;">
        Official Incident Remediated — Downtown Chicago HQ
      </div>
      <hr style="border: 0; border-top: 1px solid #00aa00; margin: 12px 0;">
      
      <p>The alarm sirens silence across all four floors. The giant skull-and-crossbones graphic on CEO Victoria Sterling's monitor vanishes, replaced by a clean green prompt: <b style="color:#00ff00;">SYSTEM ENCRYPTION REMOVED — ALL FILES RESTORED</b>.</p>
      
      <p>Victoria Sterling breathes a massive sigh of relief, lets out a laugh, and turns to your Security Manager: <i>'Unbelievable teamwork! Skyler just stopped a catastrophic data leak, bridged the gap between Dev and Sec, and saved our Chicago headquarters!'</i></p>
      
      <p>Your Security Manager grins and nods approvingly: <i>'I told you hiring a Security Champion was the right move!'</i></p>
      
      <p>Victoria smiles and says to your manager: <i>'As soon as our network finishes stabilizing, I want you to fast-track Skyler for a well-earned promotion!'</i></p>

      <div style="border: 1px dashed #28a745; background-color: #09240c; padding: 12px; margin: 14px 0; border-radius: 5px;">
        <div style="font-size: 1.1em; font-weight: bold; color: #ffc107; text-align: center;">
          📊 FINAL SECURITY CHAMPION SCORECARD
        </div>
        <hr style="border: 0; border-top: 1px solid #1e7e34; margin: 8px 0;">
        <div style="font-size: 1.05em; line-height: 1.6;">
          • <b>Achievements Unlocked:</b> <span style="color:#00ff00; font-weight:bold;">${unlockedCount} / ${totalCount}</span> (${scorePct}% Completion)<br>
          • <b>Final Performance Rank:</b> <span style="color:#ffc107; font-weight:bold;">${rankTitle}</span><br>
          • <b>Status:</b> C-Suite Incident Closed & Executive Promotion Recommended
        </div>
      </div>

      <p style="text-align: center; font-weight: bold; color: #00ff00; margin-bottom: 0;">
        THANK YOU FOR PLAYING Security Champion: The Quest for Total Remediation!
      </p>
    </div><br>`)

    return world.SUCCESS
  }
}))