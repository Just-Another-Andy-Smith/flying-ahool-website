"use strict"

settings.title = "Security Champion: The Quest for Total Remediation (Enterprise Edition)"
settings.author = "The Ahool Studios"
settings.version = "0.5"
settings.thanks = ["QuestJS for doing the heavy lifing", "OWASP Security Champions for their inspiration", "And you for playing!"]
settings.warnings = "No warnings have been set for this game."
settings.playMode = "dev" //"parser" //dev to enable debugging features, parser for the standard parser-based game, or choice for a choice-based game.
settings.placeholderLocations = ['nowhere']

// Hide the unused built-in status/health pane in the side panel.
settings.statusPane = false
settings.panes = 'left' // Tells QuestJS to render the UI sidebar on the left
settings.compassPane = true
settings.symbolsForDirections = ['↖', '↑', '↗', '←', 'U', '→', '↙', '↓', '↘', 'In', 'D', 'Out']

// Enable Achievements and the Meta Menu in the UI.
settings.metamenu = true            // Enables the meta options menu in the UI
settings.showAchievements = true     // Displays the achievements button and notification toasts

if (!settings.files.includes('help')) {
  settings.files.push('help')
}

settings.mapShowNotVisited = true

settings.mapStyle = {
  right: '0',
  top: '180px',
  width: '340px',
  height: '340px',
  'background-color': '#071c0e',
  'border': '1px solid #59ff9d',
  'border-radius': '8px',
  'box-shadow': 'inset 0 0 14px rgba(89,255,157,0.25), 0 0 0 1px rgba(132,255,207,0.4), 0 0 16px rgba(89,255,157,0.12)',
  'padding': '8px',
  'overflow': 'hidden'
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