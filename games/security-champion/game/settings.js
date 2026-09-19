"use strict"

settings.title = "Security Champion: The Quest for Total Remediation (Enterprise Edition)"
settings.author = "The Ahool Studios"
settings.version = "1.0"
settings.thanks = ["QuestJS for doing the heavy lifing", "OWASP Security Champions for their inspiration", "Most importantly, you for playing!"]
settings.warnings = "No warnings have been set for this game."
settings.playMode = "parser" //dev to enable debugging features, parser for the standard parser-based game, or choice for a choice-based game.
settings.placeholderLocations = ['nowhere']

// Hide the unused built-in status/health pane in the side panel.
settings.statusPane = false
settings.panes = 'left' // Tells QuestJS to render the UI sidebar on the left
settings.compassPane = true
settings.symbolsForDirections = ['↖', '↑', '↗', '←', 'U', '→', '↙', '↓', '↘', 'In', 'D', 'Out']

// Show map
// NOTE: This is built by hand (rather than via createAdditionalPane) so that it is
// NOT registered in settings.customPaneFunctions. QuestJS re-renders every pane in
// that list on every turn (io.updateUIItems), which would wipe out the #quest-map
// element after it gets moved in by settings.setup below.
settings.customUI = function() {
  if (document.querySelector('#quest-map-pane-outer')) return
  const panesEl = document.querySelector('#panes')
  if (!panesEl) return

  const div = document.createElement('div')
  div.id = 'quest-map-pane-outer'
  div.classList.add('pane-div')
  div.innerHTML = io.getSidePaneHeadingHTML('Tempest HQ Floor Map') + '<div id="quest-map-pane"><div id="side-map-container"></div></div>'
  panesEl.insertBefore(div, panesEl.children[1])
}

settings.mapShowNotVisited = false
settings.mapCellSize = 26
settings.mapScale = 28

// node-map.js derives settings.mapWidth/mapHeight from this at init time
// (map.init parses the width/height pixel strings), so it must stay defined even
// though the sidebar map's actual on-screen size/position now comes from CSS.
settings.mapStyle = {
  width: '300px',
  height: '150px',
}

// Rename the "Items Here" pane header since NPCs and other items are now presented in here
settings.herePaneHeader = 'Present Here'
settings.heldPaneHeader = 'Inventory'

// Enable Achievements and the Meta Menu in the UI.
settings.metamenu = true            // Enables the meta options menu in the UI
settings.showAchievements = true     // Displays the achievements button and notification toasts

if (!settings.files.includes('help')) {
  settings.files.push('help')
}


settings.mapGetStartingLocations = function() {
  const landingRooms = [
    'basement_landing',
    'floor1_lobby',
    'floor2_landing',
    'floor3_landing',
    'floor4_landing',
  ]

  const starts = []
  landingRooms.forEach((name) => {
    const room = w[name]
    if (!room) return

    room.mapX = 0
    room.mapY = 0
    room.mapZ = typeof room.z === 'number' ? room.z : 0
    room.mapRegion = 0
    starts.push(room)
  })

  return starts
}

if (!settings.libraries.includes('node-map')) {
  settings.libraries.push('node-map')
}

settings.setup = function() {
  setTimeout(function() {
    const mapEl = document.querySelector('#quest-map')
    const container = document.querySelector('#side-map-container')

    // Move the map element (created statically in index.html) inside the
    // sidebar pane built by settings.customUI above.
    if (mapEl && container) {
      container.appendChild(mapEl)
    }

    if (typeof showMap === 'function') {
      showMap()
    }
  }, 100)

  // Clear screen or display initial banner
  msg(`<div style="border: 2px solid #00ff00; background-color: #051005; color: #33ff33; padding: 18px; border-radius: 6px; font-family: monospace; box-shadow: 0 0 10px rgba(0, 255, 0, 0.2);">
    <div style="font-size: 1.4em; font-weight: bold; letter-spacing: 2px; text-align: center; color: #00ff00;">
      TEMPEST WEATHERWEAR & GEAR HQ
    </div>
    <div style="font-size: 0.9em; text-align: center; color: #00aa00; margin-bottom: 12px;">
      CORPORATE IT & SECURITY OPERATIONS SYSTEM v4.1 (1998)
    </div>
    <hr style="border: 0; border-top: 1px solid #00AA00; margin: 10px 0;">
    <p><b>MONDAY, 8:17 AM — NEAR DOWNTOWN CHICAGO</b></p>
    <p>A torrential late-autumn rain pounds against the glass dome of the Tempest plaza. Inside, fluorescent lights hum with an erratic 60Hz buzz, and the air smells faintly of ozone, floor wax, and burnt dark roast coffee.</p>
    <p>Today is your first official day as Tempest's newly appointed <b>Security Champion</b>. The corporate mandate is clear: bridge the gap between Chad's high-speed XP development sprint deadlines, legacy sysadmin backdoors, and the executive suite above.</p>
    <p>As you step under the glass canopy, your pager vibrates against your belt with a fresh alert banner: <i>AUDIT ONBOARDING ACTIVE</i>. Morgan, the Incident Response Lead, is standing near the revolving doors clutching a clipboard and waiting to hand off your day-one checklist.</p>
  </div><br>`)
}