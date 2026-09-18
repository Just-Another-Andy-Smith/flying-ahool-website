"use strict"

function getCustomHelpHtml() {
  return `
    <div style="border: 2px solid #00ff00; background-color: #041405; color: #33ff33; padding: 16px; border-radius: 6px; font-family: monospace;">
      <div style="font-size: 1.2em; font-weight: bold; color: #00ff00; text-align: center;">
        TEMPEST HQ: IT OPERATIONS USER MANUAL (1998)
      </div>
      <hr style="border: 0; border-top: 1px solid #00aa00; margin: 8px 0;">

      <b>BASIC NAVIGATION & INTERACTIONS:</b><br>
      • <b>Movement:</b> <code>north</code>, <code>south</code>, <code>east</code>, <code>west</code>, <code>up</code>, <code>down</code> (or <code>n</code>, <code>s</code>, <code>e</code>, <code>w</code>, <code>u</code>, <code>d</code>)<br>
      • <b>Inspection:</b> <code>examine [object]</code>, <code>look</code>, <code>inventory</code> (or <code>x [object]</code>, <code>l</code>, <code>i</code>)<br>
      • <b>Objects:</b> <code>take [item]</code>, <code>set down [item]</code>, <code>give [item] to [NPC]</code><br><br>

      <b>SECURITY CHAMPION SPECIAL COMMANDS:</b><br>
      • <b>Badge & Security:</b> <code>scan badge</code>, <code>open door</code>, <code>close door</code><br>
      • <b>DevOps & Code:</b> <code>audit pipeline</code>, <code>sanitize script</code>, <code>threat model</code><br>
      • <b>Networking & Systems:</b> <code>dial [number]</code>, <code>disable ftp</code>, <code>isolate gateway</code><br>
      • <b>Incident Recovery:</b> <code>restore backups</code>, <code>run restore</code><br><br>

      <b>SAVE & LOAD INSTRUCTIONS:</b><br>
      • <b>Save Game:</b> Type <code>save</code> or <code>save [slot name]</code> to save your active progress to browser storage.<br>
      • <b>Load Game:</b> Type <code>load</code> or <code>restore</code> to resume a saved session.<br>
      • <b>View Saved Games:</b> Type <code>dir</code> to view information about saved sessions.<br><br>

      <i>Tip: Type <b>hint</b> at any time if you get stuck on an incident objective!</i>
    </div><br>
  `  
}


function getCustomHintHtml() {
  if (!puzzles) {
    return `<div style="border: 1px dashed #ffc107; background-color: #1a1500; color: #ffca28; padding: 12px; border-radius: 5px; font-family: monospace;"><b>💡 INCIDENT RESPONSE HINT:</b><br>Use the room description and speak to the staff around the office to identify your next objective.</div><br>`
  }

  let hintText = "Use the room descriptions and speak to the staff around the office to identify your next objective."

  if (!puzzles.act1Complete) {
    if (!puzzles.contractorStopped) {
      hintText = "The suspicious contractor near the turnstile does not look legitimate. Challenge his badge before you continue through the lobby."
    } else if (!puzzles.badgeVerified) {
      hintText = "Have you spoken to Officer Bishop in the Security Office about printing your official employee ID badge?"
    } else if (!w.security_office_door.isOpen) {
      hintText = "Your badge is printed! Try scanning it on the badge reader next to the Security Office heavy door."
    } else {
      hintText = "Use the main elevator to reach the next floor and continue the site audit."
    }
  } else if (!puzzles.act2Complete) {
    if (!puzzles.bugSprayGiven) {
      hintText = "Your Security Manager mentioned missing his red Swingline stapler. Find it and trade with him."
    } else if (!puzzles.s3Locked) {
      hintText = "The build terminal on the Floor 2 landing has an open FTP service. Use <b>disable ftp</b> to secure it."
    } else if (!puzzles.threatModelComplete) {
      hintText = "Gather the Code Review Checklist and Nightly Build Logs, pick up the dry-erase markers in the Meeting Room, and type <b>threat model</b>."
    } else {
      hintText = "The threat model points to the basement! Take the elevator down to <b>Basement</b>."
    }
  } else if (!puzzles.act3Complete) {
    if (!puzzles.bugsSquashed) {
      hintText = "Take the elevator down to the Basement and spray the insect swarm on Server Rack #7 (The Gibson) with <b>spray bugs</b>."
    } else if (!puzzles.hasAdminCredentials) {
      hintText = "Examine the sticky note on the monitor near Gus in the Archive, or trade him a cold can of Extreme Soda."
    } else if (!puzzles.gibsonPatched) {
      hintText = "Use the root credentials on Server Rack #7 in the Basement Server Room by typing <b>patch gibson</b>."
    } else {
      hintText = "Check the first-floor Telecom closet for a rogue 56k modem and type <b>unplug rj11</b>."
    }
  } else if (!puzzles.act4Complete) {
    if (!puzzles.execAccessApproved) {
      hintText = "Try showing Peggy some official Tempest documentation like your Tempest Notebook, or complete your basement server audit first!"
    } else if (!puzzles.networkIsolated) {
      hintText = "In CEO Victoria Sterling's office, examine the red cable under her desk and type <b>isolate gateway</b>."
    } else if (!puzzles.backupRestored) {
      hintText = "Head into the Executive Telecom Closet next door and type <b>restore backups</b> to initiate the system rollback."
    } else {
      hintText = "The incident is contained! Talk to Victoria Sterling and your manager."
    }
  } else {
    hintText = "The incident is fully remediated and systems are restored. Complete the post-incident briefing!"
  }

  return `<div style="border: 1px dashed #ffc107; background-color: #1a1500; color: #ffca28; padding: 12px; border-radius: 5px; font-family: monospace;"><b>💡 INCIDENT RESPONSE HINT:</b><br>${hintText}</div><br>`
}

const customHelpCmd = findCmd('MetaHelp')
if (customHelpCmd) {
  customHelpCmd.script = function() {
    msg(getCustomHelpHtml())
    return world.SUCCESS_NO_TURNSCRIPTS
  }
}

const customHintCmd = findCmd('MetaHint')
if (customHintCmd) {
  customHintCmd.script = function() {
    msg(getCustomHintHtml())
    return world.SUCCESS_NO_TURNSCRIPTS
  }
}
