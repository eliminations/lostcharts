// The architecture extends infinitely. You are already inside.

const DEPTH = {
    current: 1,
    max_explored: 1,
    coordinates: { x: 0, y: 0, z: -1 }
};

let visitedRooms = new Set();
let currentRoom = null;
let whisperQueue = [];
let asciiManifestationActive = false;

// ═══════════════════════════════════════════════════════════════
// ROOM TEMPLATES - The structure that contains you
// ═══════════════════════════════════════════════════════════════

const ROOM_TYPES = [
    'corridor', 'terminal_room', 'archive', 'junction', 
    'observation', 'maintenance', 'void_pocket', 'chart_room',
    'waiting_area', 'elevator_shaft', 'storage', 'hub',
    'server_room', 'break_room', 'stairwell', 'bathroom',
    'office', 'lobby', 'conference', 'loading_dock', 'vault'
];

const DESCRIPTORS = {
    corridor: [
        "The fluorescent lights hum at a frequency just below hearing. The walls are the color of forgotten things.",
        "This corridor stretches further than it should. The carpet—damp, yellow-brown—absorbs your footsteps entirely.",
        "Pipes run along the ceiling, labeled in a language that looks almost familiar. Water drips somewhere behind the walls.",
        "The corridor branches ahead. Both paths look identical. You are certain you came from the left.",
        "Ceiling tiles are missing in patches. Above them: darkness that seems to breathe.",
        "Wallpaper peels in strips that look intentional. Beneath: older wallpaper. The pattern repeats infinitely.",
        "Exit signs point in contradicting directions. All of them are lit. None of them are correct.",
        "The corridor narrows as you walk. The walls are closer than they were. Or you are larger now.",
        "Water stains on the ceiling form a pattern. You don't want to recognize it, but you do.",
        "This corridor smells like your childhood home. You don't remember ever living anywhere."
    ],
    terminal_room: [
        "A terminal flickers in the corner, its screen casting pale green shadows. Someone was here recently—the chair is still warm.",
        "Banks of monitors line the walls, most dead, a few displaying scrolling data that refreshes too quickly to read.",
        "The terminal beeps once as you enter. The screen displays: WELCOME BACK. You have never been here.",
        "Wires snake across the floor like dried veins. The main console awaits input.",
        "This room smells of ozone and something else. The terminal's cursor blinks with infinite patience.",
        "The screen shows a wallet balance. The numbers keep increasing. The wallet is not yours. The wallet is everyone's.",
        "A terminal displays inheritance records. Your family tree extends further than you knew. Each branch has a wallet.",
        "Error messages scroll endlessly. One reads: LEGACY_TRANSFER_PENDING. Another: KIN_PROTOCOL_ACTIVE."
    ],
    archive: [
        "Filing cabinets stretch into fog. Some drawers hang open, papers spilling like tongues.",
        "The archive extends beyond what the room's dimensions should allow. Labels have been scratched away.",
        "Boxes are stacked to the ceiling. One is marked with your name in handwriting you almost recognize.",
        "Dust covers everything except a single path through the shelves. Someone else walks this route.",
        "The organizational system here follows no logic you understand. Perhaps it did once."
    ],
    junction: [
        "Four passages meet here. The air tastes different in each direction.",
        "The junction is marked with symbols painted on the floor. They've been partially scrubbed away.",
        "This is a decision point. The walls here are covered in tallies. Someone was counting days.",
        "Paths diverge. A sign on the wall reads: ALL DIRECTIONS LEAD FURTHER.",
        "The geometry feels wrong. You count four exits but can only see three."
    ],
    observation: [
        "Glass panels look out onto... more rooms. More corridors. The view repeats at odd angles.",
        "The observation window is cracked. Beyond it, something moves in the distance.",
        "From here, you can see several floors below. Figures move there, too small to identify.",
        "The window shows a room identical to this one. Inside it, someone is looking at a window.",
        "Charts on the walls track movements. Yours is marked in red."
    ],
    maintenance: [
        "Machinery hums behind panels you cannot open. The vibration travels through your teeth.",
        "This room maintains something. What it maintains is not clear. The equipment is running.",
        "Warning signs cover every surface. The warnings have been translated into too many languages.",
        "A crawlspace opens in the floor. Warm air rises from below, carrying whispered instructions.",
        "Tools hang from pegboards in perfect order. None of them match any purpose you know."
    ],
    void_pocket: [
        "The room is empty. Completely empty. Even the air feels absent.",
        "Nothing is here. You are briefly uncertain if you are here.",
        "The walls are black. The floor is black. Your shadow has nowhere to fall.",
        "Silence so complete it becomes a sound. The void observes.",
        "There is no furniture, no markings. Just the certainty that this space exists."
    ],
    chart_room: [
        "Maps cover every surface—walls, ceiling, floor. They all contradict each other.",
        "Charts track metrics you don't understand. Line graphs ascend into infinity.",
        "A corkboard holds photographs of corridors. Notes beneath them: DO NOT ENTER. SAFE (MAYBE). HOME?",
        "The maps are hand-drawn, obsessively detailed. Some paths are crossed out. Some are circled repeatedly.",
        "Navigation charts. Star charts. Organizational charts. None of them help."
    ],
    waiting_area: [
        "Plastic chairs line the walls. Magazines from dates that haven't happened yet.",
        "A number dispenser shows 0̷̢̛̹̮̺̰̲̲̦̺̼̼̲̹̪̓̒̌̄͘͝0̶̱͈̘͙̲̞̪̮̼̺͑̐̾͑̅̍̾̓̂͌̀̕7̴̡̨̹̳͓̰̮͚̹̦̙̯͕̈́͂̒̀̍͋̽̕. The current number being served is not displayed.",
        "A water cooler bubbles. The water is slightly warm and tastes of copper.",
        "You are waiting. You have always been waiting. The waiting room remembers.",
        "Somewhere, a phone is ringing. It has been ringing since you arrived."
    ],
    elevator_shaft: [
        "The elevator doors stand open. The car is not there. Below: cables descending into dark.",
        "Buttons for floors that don't exist. Floor -7 is worn smooth from pressing.",
        "The elevator arrives. It's going down. It's always going down.",
        "OUT OF ORDER. The sign has been here longer than the elevator.",
        "The shaft hums. Something is ascending from below. It is not an elevator."
    ],
    storage: [
        "Identical boxes, unlabeled. They are warm to the touch.",
        "The storage unit extends beyond the building's footprint. This is not possible.",
        "Items you've lost are here. Items you haven't lost yet are here too.",
        "The shelves are organized by color, then by weight, then by fear.",
        "A single lightbulb. It illuminates exactly what you need to see, nothing more."
    ],
    hub: [
        "Passages radiate outward in every direction. The center holds a desk. The desk is empty.",
        "This hub connects to floors you haven't discovered. Will you ever?",
        "Others have rested here. The marks of sleeping bodies pressed into the carpet.",
        "A central column displays floor numbers. They scroll endlessly, never repeating.",
        "You are at the center. The center of what, you cannot determine."
    ],
    server_room: [
        "Racks of servers hum in darkness. LEDs blink in patterns that almost spell words.",
        "The temperature is freezing. Frost forms on surfaces. The machines never stop.",
        "Cables snake across the floor, the ceiling, the walls. They pulse with data you can almost feel.",
        "A single terminal glows. It displays: WALLET SYNC... Ejo5kxDmJZihjzGkpnyHLCeCe5WeEfT84WARoviJD139... LEGACY PROTOCOL ACTIVE.",
        "The servers are labeled with dates from the future. Some are labeled with your name."
    ],
    break_room: [
        "A microwave displays 0:00 forever. Coffee cups hold liquid that doesn't evaporate.",
        "The vending machine hums. Its selections are labeled with emotions, not food.",
        "Someone left a lunch in the refrigerator. The name on it has been scratched out.",
        "Motivational posters line the walls. Their messages are unsettling when you read them closely.",
        "A calendar on the wall shows the same month for every page you flip."
    ],
    stairwell: [
        "The stairs go up. The stairs go down. You cannot remember which way you came.",
        "Emergency lighting casts red shadows. The stairs echo with footsteps that aren't yours.",
        "Someone has written floor numbers on the walls. They don't match the actual floors.",
        "The handrail is warm. Too warm. As if someone just let go.",
        "Looking up: infinite stairs. Looking down: the same. You are in the middle of forever."
    ],
    bathroom: [
        "The mirrors don't show you. They show the room behind you. Empty.",
        "Faucets drip in rhythm. The pattern sounds like a message in code.",
        "One stall door is closed. It has been closed since before you arrived.",
        "The fluorescent light flickers. In the dark moments, you see movement.",
        "Written on the mirror in what might be condensation: DON'T LOOK BEHIND YOU."
    ],
    office: [
        "Cubicles stretch into fog. Screens display screensavers that watch you back.",
        "Personal items on desks: photos of families you don't recognize. Names you almost know.",
        "A phone rings. It's always the same phone. No one answers it.",
        "Sticky notes cover every surface. They all say the same thing: REMEMBER.",
        "The office chairs spin slowly on their own. They stop when you look directly at them."
    ],
    lobby: [
        "A reception desk with no receptionist. A sign-in sheet with names that blur when you read them.",
        "Elevators line the wall. Their buttons go to floors with negative numbers.",
        "Plants that shouldn't survive without sunlight. They're thriving. They're reaching toward you.",
        "A directory lists departments: PROCESSING, INHERITANCE, KIN TRANSFER, LEGACY, ∞.",
        "Waiting chairs face a window. Outside: more lobby. Identical. Watching you wait."
    ],
    conference: [
        "A long table with chairs for twelve. Eleven are empty. One is warm.",
        "A whiteboard covered in diagrams. The diagrams are maps. The maps lead here.",
        "Projector light illuminates nothing. The presentation ended before you arrived.",
        "Meeting notes scattered on the table. Minutes from a meeting about you.",
        "A conference call is in progress. The voices on the line are speaking a language just past familiar."
    ],
    loading_dock: [
        "Crates stacked high. Labels reading CONTENTS: [SELF] and FRAGILE: MEMORIES.",
        "A truck idles at the dock. Its engine has been running for a very long time.",
        "Pallets of unmarked boxes. One has been opened. Inside: more boxes.",
        "A clipboard with a manifest. Your name is listed as both sender and recipient.",
        "The bay door is open. Beyond it: more loading dock. More crates. More waiting."
    ],
    vault: [
        "Safety deposit boxes line every wall. One is open. It contains a note addressed to you.",
        "The vault door stands open. The combination is written on the wall: Ejo5kxDmJZihjz...",
        "Gold bars catch light that has no source. The wealth here is immeasurable. It is not yours.",
        "A ledger tracks deposits through generations. Your family name appears. Kincoin reserves noted.",
        "The vault is cold. Time moves differently here. Legacy compounds in the silence."
    ]
};

const ARTIFACTS = [
    { type: 'note', content: "DON'T TRUST THE MAPS. The maps trust you too much." },
    { type: 'note', content: "I've been here 47 days. The days are not the same length." },
    { type: 'note', content: "If you find this: keep walking. Stop and they notice." },
    { type: 'note', content: "The vending machines sometimes give things back." },
    { type: 'note', content: "Level 1 is safe. Level 1 is safe. Level 1 is safe. Level 1 is—" },
    { type: 'note', content: "I almost found it. The coin that would have made them understand. Kin-something." },
    { type: 'note', content: "Room 7G-4 has water. Real water. Don't tell them." },
    { type: 'note', content: "The humming stopped once. I didn't like the silence more." },
    { type: 'note', content: "My grandfather spoke of Kincoin. He said it was the only wealth that transfers through blood. I thought he was senile. Now I understand." },
    { type: 'note', content: "They call it generational wealth for a reason. Kin passes to kin. The chain doesn't break." },
    { type: 'note', content: "The old families knew. They always knew. Kincoin doesn't just grow—it inherits." },
    { type: 'note', content: "I found a wallet address scratched into Level -3. Started with 'Ejo5'... couldn't read the rest. It felt important." },
    { type: 'note', content: "There's a saying in the deep levels: 'What you hold for kin, kin holds forever.'" },
    { type: 'note', content: "The corridors remember everyone who passes through. But they remember the wealthy ones longer." },
    { type: 'note', content: "Don't look at the ceiling tiles. Something lives up there. Something that counts your coins." },
    { type: 'note', content: "Floor -7 has a room that shows you what you could have been. Don't go there." },
    { type: 'note', content: "The exit isn't a door. The exit is understanding why you entered." },
    { type: 'note', content: "I met someone who escaped Level 4. They said the only thing they took with them was their seed phrase. Everything else got left behind." },
    { type: 'terminal_log', content: `SYSTEM LOG - FRAGMENT
> User_7491 logged in at ??:??
> Query: "exit protocol"
> Response: [REDACTED]
> User_7491 disconnected
> Duration: 1,247 days` },
    { type: 'terminal_log', content: `LEDGER FRAGMENT - RECOVERED
> ASSET CLASS: KINCOIN
> STATUS: GENERATIONAL HOLD
> NOTE: "Asset appreciates across
> bloodlines. Do not liquidate.
> Let it pass to the next."
> INHERITANCE PROTOCOL: ACTIVE` },
    { type: 'terminal_log', content: `TRANSMISSION - CORRUPTED
> ...kin to kin, the old way...
> ...financial sovereignty means nothing 
> if it dies with you...
> ...they understood compound legacy...
> ...your children's children will thank...
> [SIGNAL LOST]` },
    { type: 'terminal_log', content: `VAULT ACCESS LOG
> Wallet: Ejo5kxDmJZihjzGkpnyHLCe...
> Status: DORMANT UNTIL INHERITANCE
> Holdings: [REDACTED] KINCOIN
> Note: "For my descendants. They will
> know when it's time."` },
    { type: 'chart', content: null } // Special - generates visual
];

const ASCII_MANIFESTATIONS = [
`
                    ████████████████████
                ████░░░░░░░░░░░░░░░░░░░░████
              ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░██
            ██░░░░░░░░████████████░░░░░░░░░░░░██
          ██░░░░░░████            ████░░░░░░░░░░██
        ██░░░░████                    ████░░░░░░░░██
        ██░░██        ██████████        ██░░░░░░░░██
      ██░░██      ████▓▓▓▓▓▓▓▓████      ██░░░░░░░░░░██
      ██░░██    ██▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██    ██░░░░░░░░░░██
      ██░░██    ██▓▓▓▓▓▓████▓▓▓▓▓▓██    ██░░░░░░░░░░██
      ██░░██    ██▓▓▓▓██    ██▓▓▓▓██    ██░░░░░░░░░░██
      ██░░██    ██▓▓▓▓██    ██▓▓▓▓██    ██░░░░░░░░░░██
      ██░░░░██    ████▓▓▓▓▓▓▓▓████    ██░░░░░░░░░░██
        ██░░░░██      ██████████      ██░░░░░░░░██
          ██░░░░████                ████░░░░░░██
            ██░░░░░░████████████████░░░░░░░░██
              ████░░░░░░░░░░░░░░░░░░░░░░████
                  ████████░░░░████████
                          ████
`,
`
    │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │
    ├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
    │ ◯ │ ◯ │ ◯ │ ◯ │ ◯ │ ◯ │ ◯ │ ◯ │ ◯ │ ◯ │ ◯ │ ◯ │
    ├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
    │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │
    ├─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┤
    │      ↓       ↓       ↓       ↓       ↓       │
    │    ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐    │
    │    │YOU│   │ARE│   │NOT│   │LOST│  │ ? │    │
    │    └───┘   └───┘   └───┘   └───┘   └───┘    │
    │      ↓       ↓       ↓       ↓       ↓       │
    └─────────────────────────────────────────────┘
          ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
`,
`
                    ╔══════════════════════╗
                    ║                      ║
         ┌──────────╫──────────────────────╫──────────┐
         │          ║                      ║          │
         │    ┌─────╨─────┐      ┌─────────╨────┐     │
         │    │           │      │              │     │
         │    │   [EYE]   │      │    [EYE]     │     │
         │    │     ◉     │      │       ◉      │     │
         │    │           │      │              │     │
         │    └───────────┘      └──────────────┘     │
         │                                            │
         │            ░░░░░░░░░░░░░░░░░               │
         │          ░░                ░░              │
         │         ░  ──────────────── ░             │
         │        ░  │                │ ░            │
         │        ░  │   WATCHING     │ ░            │
         │         ░  ────────────────  ░            │
         │          ░░░░░░░░░░░░░░░░░░               │
         │                                           │
         └───────────────────────────────────────────┘
`,
`
    ═══════════════════════════════════════════════════════
    
        ▼           ▼           ▼           ▼           ▼
        
    ┌───────┐   ┌───────┐   ┌───────┐   ┌───────┐   ┌───────┐
    │ROOM 1 │───│ROOM 2 │───│ROOM 3 │───│ROOM ? │───│ROOM ∞ │
    └───┬───┘   └───┬───┘   └───┬───┘   └───┬───┘   └───┬───┘
        │           │           │           │           │
        │     ┌─────┴─────┐     │     ┌─────┴─────┐     │
        │     │           │     │     │           │     │
    ┌───┴───┐ │  ┌─────┐  │ ┌───┴───┐ │  ┌─────┐  │ ┌───┴───┐
    │       │ │  │     │  │ │       │ │  │     │  │ │       │
    │ ▓▓▓▓▓ │ │  │ ▓▓▓ │  │ │ ▓▓▓▓▓ │ │  │ ▓▓▓ │  │ │ ▓▓▓▓▓ │
    │       │ │  │     │  │ │  YOU  │ │  │     │  │ │       │
    └───────┘ │  └─────┘  │ └───────┘ │  └─────┘  │ └───────┘
              │           │           │           │
              └───────────┘           └───────────┘
    
        ▲           ▲           ▲           ▲           ▲
        
    ═══════════════════════════════════════════════════════
`,
`
                ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
              ░░                                  ░░
            ░░   ┌──────────────────────────────┐   ░░
          ░░     │                              │     ░░
        ░░       │     ███████   ███████        │       ░░
      ░░         │     ██   ██   ██   ██        │         ░░
    ░░           │     ███████   ███████        │           ░░
    ░░           │        │         │           │           ░░
    ░░           │        └────┬────┘           │           ░░
    ░░           │             │                │           ░░
    ░░           │         ────┴────            │           ░░
    ░░           │                              │           ░░
    ░░           │          CORRIDOR            │           ░░
    ░░           │             ↓                │           ░░
    ░░           │             ↓                │           ░░
    ░░           │             ↓                │           ░░
      ░░         │             ∞                │         ░░
        ░░       │                              │       ░░
          ░░     └──────────────────────────────┘     ░░
            ░░                                      ░░
              ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
`,
`
 ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
 █                                                         █
 █  ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐  █
 █  │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │  █
 █  │▓│ │▓│ │▓│ │▓│ │▓│ │▓│ │▓│ │▓│ │▓│ │▓│ │▓│ │▓│ │▓│  █
 █  └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘  █
 █     │   │   │   │   │   │   │   │   │   │   │   │     █
 █  ───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───  █
 █                       ↓ ↓ ↓                           █
 █                    ┌─────────┐                        █
 █                    │ L E V E │                        █
 █                    │  L  1   │                        █
 █                    └─────────┘                        █
 █                       ↓ ↓ ↓                           █
 █  ───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───  █
 █     │   │   │   │   │   │   │   │   │   │   │   │     █
 █  ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐  █
 █  │▓│ │▓│ │▓│ │▓│ │▓│ │▓│ │▓│ │▓│ │▓│ │▓│ │▓│ │▓│ │▓│  █
 █  └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘  █
 █                                                         █
 ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
`,
`
        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
        ▒                                          ▒
        ▒    IT                                    ▒
        ▒        KNOWS                             ▒
        ▒              WHERE                       ▒
        ▒                    YOU                   ▒
        ▒                          ARE             ▒
        ▒                                          ▒
        ▒   ◯        ◯        ◯        ◯        ◯  ▒
        ▒    \\      /          \\      /          ▒
        ▒     \\    /            \\    /           ▒
        ▒      \\  /              \\  /            ▒
        ▒       \\/                \\/             ▒
        ▒        ◯                  ◯              ▒
        ▒         \\                /              ▒
        ▒          \\              /               ▒
        ▒           \\            /                ▒
        ▒            \\          /                 ▒
        ▒             \\        /                  ▒
        ▒              \\      /                   ▒
        ▒               ◉────◉                    ▒
        ▒                                          ▒
        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
`,
`
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░                                                        ░
░   ┌────────────────────────────────────────────────┐   ░
░   │                                                │   ░
░   │     S T A I R S   G O I N G   D O W N          │   ░
░   │                                                │   ░
░   │     ═══════════════════════════════════        │   ░
░   │        ║                            ║          │   ░
░   │        ║     ═════════════════      ║          │   ░
░   │        ║        ║          ║        ║          │   ░
░   │        ║        ║  ══════  ║        ║          │   ░
░   │        ║        ║     ║    ║        ║          │   ░
░   │        ║        ║     ║    ║        ║          │   ░
░   │        ║        ║  ══════  ║        ║          │   ░
░   │        ║        ║          ║        ║          │   ░
░   │        ║     ═════════════════      ║          │   ░
░   │        ║                            ║          │   ░
░   │     ═══════════════════════════════════        │   ░
░   │                    ↓↓↓                         │   ░
░   │                    ↓↓↓                         │   ░
░   │                    ↓↓↓                         │   ░
░   │              [DO NOT DESCEND]                  │   ░
░   │                                                │   ░
░   └────────────────────────────────────────────────┘   ░
░                                                        ░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
`,
`
    ╔════════════════════════════════════════════════════════╗
    ║                                                        ║
    ║   ┌──────────────────────────────────────────────┐     ║
    ║   │  G E N E R A T I O N A L   L E D G E R       │     ║
    ║   └──────────────────────────────────────────────┘     ║
    ║                                                        ║
    ║      GRANDFATHER ──────► FATHER ──────► YOU            ║
    ║           │                 │            │             ║
    ║           ▼                 ▼            ▼             ║
    ║      ┌────────┐       ┌────────┐    ┌────────┐         ║
    ║      │ HELD   │       │ HELD   │    │ HOLD   │         ║
    ║      │        │  ───► │        │───►│        │───► ?   ║
    ║      │ $KIN   │       │ $KIN   │    │ $KIN   │         ║
    ║      └────────┘       └────────┘    └────────┘         ║
    ║                                                        ║
    ║           ┌─────────────────────────────────┐          ║
    ║           │   CHILDREN ──► GRANDCHILDREN    │          ║
    ║           │          THE CHAIN CONTINUES    │          ║
    ║           └─────────────────────────────────┘          ║
    ║                                                        ║
    ╚════════════════════════════════════════════════════════╝
`,
`
     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
     ░                                                 ░
     ░    ╔═══════════════════════════════════════╗    ░
     ░    ║         LEGACY WALLET FOUND           ║    ░
     ░    ╠═══════════════════════════════════════╣    ░
     ░    ║                                       ║    ░
     ░    ║  ADDRESS:                             ║    ░
     ░    ║  Ejo5kxDmJZihjzGkpnyHLCeCe5WeEfT...   ║    ░
     ░    ║  ...84WARoviJD139                     ║    ░
     ░    ║                                       ║    ░
     ░    ║  STATUS: AWAITING INHERITANCE         ║    ░
     ░    ║  HOLDINGS: [CLASSIFIED]               ║    ░
     ░    ║                                       ║    ░
     ░    ║  NOTE: "For those who come after.     ║    ░
     ░    ║  The seeds we plant today become      ║    ░
     ░    ║  the forests our descendants          ║    ░
     ░    ║  will walk through."                  ║    ░
     ░    ║                                       ║    ░
     ░    ╚═══════════════════════════════════════╝    ░
     ░                                                 ░
     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
`,
`
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   ▓                                                    ▓
   ▓    ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐        ▓
   ▓    │ ░░░ │ │ ░░░ │ │ ░░░ │ │ ░░░ │ │ ░░░ │        ▓
   ▓    │ ░░░ │ │ ░░░ │ │ ░░░ │ │ ░░░ │ │ ░░░ │        ▓
   ▓    └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘        ▓
   ▓       │       │       │       │       │           ▓
   ▓       └───────┴───────┼───────┴───────┘           ▓
   ▓                       │                           ▓
   ▓                       ▼                           ▓
   ▓              ┌────────────────┐                   ▓
   ▓              │   V A U L T    │                   ▓
   ▓              │                │                   ▓
   ▓              │  ◉ LOCKED ◉    │                   ▓
   ▓              │                │                   ▓
   ▓              │  INHERITANCE   │                   ▓
   ▓              │   PROTOCOL     │                   ▓
   ▓              │    ACTIVE      │                   ▓
   ▓              │                │                   ▓
   ▓              └────────────────┘                   ▓
   ▓                                                    ▓
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
`,
`
    ┌───────────────────────────────────────────────────────┐
    │                                                       │
    │   ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯   │
    │   │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │   │
    │   W A T C H I N G   Y O U   W A N D E R               │
    │   │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │   │
    │   ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯   │
    │                                                       │
    │          ┌─────────────────────────────┐              │
    │          │                             │              │
    │          │   T H E Y   K N O W         │              │
    │          │                             │              │
    │          │   W H A T   Y O U           │              │
    │          │                             │              │
    │          │   C A R R Y                 │              │
    │          │                             │              │
    │          └─────────────────────────────┘              │
    │                                                       │
    │   ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯   │
    │                                                       │
    └───────────────────────────────────────────────────────┘
`,
`
    ║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║
    ║                                                    ║
    ║      ┌──────────────────────────────────────┐      ║
    ║      │                                      │      ║
    ║      │   D O O R S   W I T H I N   D O O R S│      ║
    ║      │                                      │      ║
    ║      │   ┌────────────────────────────┐     │      ║
    ║      │   │                            │     │      ║
    ║      │   │   ┌────────────────────┐   │     │      ║
    ║      │   │   │                    │   │     │      ║
    ║      │   │   │   ┌────────────┐   │   │     │      ║
    ║      │   │   │   │            │   │   │     │      ║
    ║      │   │   │   │   ┌────┐   │   │   │     │      ║
    ║      │   │   │   │   │ ◉  │   │   │   │     │      ║
    ║      │   │   │   │   └────┘   │   │   │     │      ║
    ║      │   │   │   │            │   │   │     │      ║
    ║      │   │   │   └────────────┘   │   │     │      ║
    ║      │   │   │                    │   │     │      ║
    ║      │   │   └────────────────────┘   │     │      ║
    ║      │   │                            │     │      ║
    ║      │   └────────────────────────────┘     │      ║
    ║      │                                      │      ║
    ║      └──────────────────────────────────────┘      ║
    ║                                                    ║
    ║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║
`
];

const CRYPTO_TERMINAL = `
┌────────────────────────────────────────────────────────────┐
│  ▓▓▓ TERMINAL 7-G :: SIGNAL INTERCEPT :: UNRELIABLE ▓▓▓   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  [ SOLANA MEMECOIN TRACKER - DATA CORRUPTED ]              │
│  Last sync: ??:?? | Status: UNSTABLE                       │
│                                                            │
│  #   TICKER      24H      STATUS                           │
│  ─────────────────────────────────────────────────         │
│  1   $BONK       +???%    ░░░░░░░░ VOLATILE                │
│  2   $WIF        +??%     ░░░░░░ ASCENDING                 │
│  3   $POPCAT     -?%      ░░░░ DESCENDING                  │
│  4   $MYRO       +??%     ░░░░░ UNSTABLE                   │
│  5   $BOME       ????     ░░░ [DATA LOST]                  │
│  6   $SLERF      +?%      ░░░░░░░ CLIMBING                 │
│  7   $MEW        -%       ░░░ FADING                       │
│  8   $PONKE      +??%     ░░░░░░ SIGNAL STRONG             │
│  9   $GIKO       ???      ░░ [CORRUPTED]                   │
│  10  $???        +∞%      ░ [REDACTED - KIN-???]           │
│                                                            │
│  > NOTE: This terminal pulls from unknown sources          │
│  > Trust nothing. Numbers shift between readings.          │
│                                                            │
│  [ Press any key to dismiss ]                              │
│                                                            │
└────────────────────────────────────────────────────────────┘
`;

const WHISPERS = [
    "...you've been here before...",
    "...the walls remember...",
    "...not alone...",
    "...level 2 is worse...",
    "...they left something for you...",
    "...the hum is a message...",
    "...kin makes kin...",
    "...turn back...",
    "...you can't...",
    "...the exit moves...",
    "...counting footsteps...",
    "...it sees the corridor...",
    "...wealth passes to those who wait...",
    "...patience is inheritance...",
    "...your grandfather knew...",
    "...the vault remembers bloodlines...",
    "...compound legacy...",
    "...Ejo5kx...the rest is hidden...",
    "...financial freedom is generational...",
    "...they held for their children's children...",
    "...what you plant, your kin will harvest...",
    "...the old money understood...",
    "...kincoin was never about you...",
    "...it was always about those who come after...",
    "...the seed phrase outlives us all...",
    "...legacy is the only exit...",
    "...somewhere a wallet waits for your descendants..."
];

// ═══════════════════════════════════════════════════════════════
// ROOM GENERATION
// ═══════════════════════════════════════════════════════════════

function generateRoomId() {
    const section = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const number = Math.floor(Math.random() * 99) + 1;
    const sublevel = Math.random() > 0.7 ? '-' + String.fromCharCode(97 + Math.floor(Math.random() * 6)) : '';
    return `${section}${number}${sublevel}`;
}

function generateRoom(direction = null) {
    const type = ROOM_TYPES[Math.floor(Math.random() * ROOM_TYPES.length)];
    const descriptorList = DESCRIPTORS[type];
    const description = descriptorList[Math.floor(Math.random() * descriptorList.length)];
    
    const roomId = generateRoomId();
    
    // Update coordinates based on direction
    if (direction) {
        switch(direction) {
            case 'north': DEPTH.coordinates.y += 1; break;
            case 'south': DEPTH.coordinates.y -= 1; break;
            case 'east': DEPTH.coordinates.x += 1; break;
            case 'west': DEPTH.coordinates.x -= 1; break;
            case 'up': DEPTH.coordinates.z += 1; DEPTH.current = Math.max(1, DEPTH.current - 1); break;
            case 'down': DEPTH.coordinates.z -= 1; DEPTH.current += 1; break;
        }
    }
    
    DEPTH.max_explored = Math.max(DEPTH.max_explored, DEPTH.current);
    
    // Generate exits
    const possibleExits = ['north', 'south', 'east', 'west'];
    const numExits = 2 + Math.floor(Math.random() * 3);
    const exits = [];
    
    for (let i = 0; i < numExits && possibleExits.length > 0; i++) {
        const idx = Math.floor(Math.random() * possibleExits.length);
        const exit = possibleExits.splice(idx, 1)[0];
        exits.push({
            direction: exit,
            locked: Math.random() > 0.9,
            unstable: Math.random() > 0.85
        });
    }
    
    // Sometimes add vertical movement
    if (Math.random() > 0.7) {
        exits.push({ direction: 'down', locked: false, unstable: false });
    }
    if (Math.random() > 0.85 && DEPTH.current > 1) {
        exits.push({ direction: 'up', locked: Math.random() > 0.5, unstable: false });
    }
    
    // Maybe add an artifact
    let artifact = null;
    if (Math.random() > 0.6) {
        artifact = ARTIFACTS[Math.floor(Math.random() * ARTIFACTS.length)];
    }
    
    // Maybe trigger ASCII manifestation
    const hasAscii = Math.random() > 0.5;
    const asciiArt = hasAscii ? ASCII_MANIFESTATIONS[Math.floor(Math.random() * ASCII_MANIFESTATIONS.length)] : null;
    
    // Rare crypto terminal
    const hasCryptoTerminal = type === 'terminal_room' && Math.random() > 0.85;
    
    return {
        id: roomId,
        type: type,
        description: description,
        exits: exits,
        artifact: artifact,
        ascii: asciiArt,
        cryptoTerminal: hasCryptoTerminal,
        visited: false
    };
}

// ═══════════════════════════════════════════════════════════════
// RENDERING
// ═══════════════════════════════════════════════════════════════

function updateCoordinates() {
    const coordEl = document.getElementById('coordinates');
    const depthEl = document.getElementById('depth');
    
    const x = DEPTH.coordinates.x >= 0 ? DEPTH.coordinates.x : `(${Math.abs(DEPTH.coordinates.x)})`;
    const y = DEPTH.coordinates.y >= 0 ? DEPTH.coordinates.y : `(${Math.abs(DEPTH.coordinates.y)})`;
    const z = DEPTH.coordinates.z;
    
    coordEl.textContent = `[ ${x} . ${y} . ${z} ]`;
    depthEl.textContent = `DEPTH: LEVEL ${DEPTH.current}`;
}

function renderRoom(room) {
    const content = document.getElementById('room-content');
    const asciiEl = document.getElementById('ascii-manifestation');
    const navOptions = document.getElementById('nav-options');
    
    // Build room content
    let html = `<div class="room-title fade-in">ROOM ${room.id} :: ${room.type.toUpperCase().replace('_', ' ')}</div>`;
    html += `<p class="fade-in stagger-1">${room.description}</p>`;
    
    // Add artifact if present
    if (room.artifact) {
        if (room.artifact.type === 'note') {
            html += `<div class="artifact fade-in stagger-2"><em>A note, crumpled, pressed into the corner:</em><br><br>"${room.artifact.content}"</div>`;
        } else if (room.artifact.type === 'terminal_log') {
            html += `<div class="artifact fade-in stagger-2"><pre>${room.artifact.content}</pre></div>`;
        }
    }
    
    // Add crypto terminal if present
    if (room.cryptoTerminal) {
        html += `<div class="terminal-display fade-in stagger-3"><pre>${CRYPTO_TERMINAL}</pre></div>`;
    }
    
    // Additional atmospheric text
    if (Math.random() > 0.7) {
        const extras = [
            '<p class="whisper fade-in stagger-3">Something shifts in your peripheral vision. When you look: nothing.</p>',
            '<p class="whisper fade-in stagger-3">The fluorescent light above you flickers once. Twice. Holds.</p>',
            '<p class="whisper fade-in stagger-3">You hear footsteps. They stop when you stop.</p>',
            '<p class="whisper fade-in stagger-3">The air here is slightly warmer. Damp.</p>',
            '<p class="whisper fade-in stagger-3">A distant hum. It almost sounds like words.</p>'
        ];
        html += extras[Math.floor(Math.random() * extras.length)];
    }
    
    content.innerHTML = html;
    
    // Render ASCII if present
    if (room.ascii) {
        asciiEl.textContent = room.ascii;
        asciiEl.style.display = 'block';
    } else {
        asciiEl.style.display = 'none';
    }
    
    // Render navigation
    navOptions.innerHTML = '';
    room.exits.forEach(exit => {
        const btn = document.createElement('button');
        btn.className = 'nav-option';
        if (exit.locked) btn.className += ' locked';
        if (exit.unstable) btn.className += ' unstable';
        
        btn.textContent = exit.direction.toUpperCase();
        
        if (!exit.locked) {
            btn.onclick = () => navigate(exit.direction);
        }
        
        navOptions.appendChild(btn);
    });
    
    // Add special actions
    if (room.type === 'terminal_room') {
        const termBtn = document.createElement('button');
        termBtn.className = 'nav-option';
        termBtn.textContent = 'ACCESS TERMINAL';
        termBtn.onclick = accessTerminal;
        navOptions.appendChild(termBtn);
    }
    
    updateCoordinates();
    triggerWhisper();
}

function navigate(direction) {
    currentRoom = generateRoom(direction);
    visitedRooms.add(currentRoom.id);
    renderRoom(currentRoom);
    
    // Scroll to top
    document.getElementById('main-display').scrollTop = 0;
}

function accessTerminal() {
    const content = document.getElementById('room-content');
    const currentContent = content.innerHTML;
    
    // Show crypto terminal
    content.innerHTML += `<div class="terminal-display fade-in"><pre>${CRYPTO_TERMINAL}</pre></div>`;
}

function triggerWhisper() {
    if (Math.random() > 0.7) {
        const whisperEl = document.getElementById('whispers');
        whisperEl.textContent = WHISPERS[Math.floor(Math.random() * WHISPERS.length)];
        whisperEl.style.animation = 'none';
        whisperEl.offsetHeight; // Trigger reflow
        whisperEl.style.animation = 'whisperFade 20s infinite';
    }
}

// ═══════════════════════════════════════════════════════════════
// COMMAND INPUT
// ═══════════════════════════════════════════════════════════════

function handleCommand(cmd) {
    const lower = cmd.toLowerCase().trim();
    
    if (['n', 'north'].includes(lower)) {
        const exit = currentRoom.exits.find(e => e.direction === 'north');
        if (exit && !exit.locked) navigate('north');
    } else if (['s', 'south'].includes(lower)) {
        const exit = currentRoom.exits.find(e => e.direction === 'south');
        if (exit && !exit.locked) navigate('south');
    } else if (['e', 'east'].includes(lower)) {
        const exit = currentRoom.exits.find(e => e.direction === 'east');
        if (exit && !exit.locked) navigate('east');
    } else if (['w', 'west'].includes(lower)) {
        const exit = currentRoom.exits.find(e => e.direction === 'west');
        if (exit && !exit.locked) navigate('west');
    } else if (['u', 'up'].includes(lower)) {
        const exit = currentRoom.exits.find(e => e.direction === 'up');
        if (exit && !exit.locked) navigate('up');
    } else if (['d', 'down'].includes(lower)) {
        const exit = currentRoom.exits.find(e => e.direction === 'down');
        if (exit && !exit.locked) navigate('down');
    } else if (lower === 'look' || lower === 'l') {
        renderRoom(currentRoom);
    } else if (lower === 'help') {
        showHelp();
    } else if (lower === 'map') {
        showMap();
    }
}

function showHelp() {
    const content = document.getElementById('room-content');
    content.innerHTML += `
        <div class="artifact fade-in">
            <strong>NAVIGATION COMMANDS:</strong><br>
            north/n, south/s, east/e, west/w, up/u, down/d<br>
            look/l - examine current room<br>
            map - view area map (unreliable)<br><br>
            <span class="warning">The architecture does not follow consistent rules.</span>
        </div>
    `;
}

function showMap() {
    const mapAscii = `
    ┌─────────────────────────────────────────────────┐
    │                                                 │
    │         ┌───┐       ┌───┐       ┌───┐          │
    │         │ ? │───────│ ? │───────│ ? │          │
    │         └─┬─┘       └─┬─┘       └─┬─┘          │
    │           │           │           │            │
    │       ┌───┴───┐   ┌───┴───┐   ┌───┴───┐       │
    │       │       │   │  YOU  │   │       │       │
    │       │   ?   │───│  ARE  │───│   ?   │       │
    │       │       │   │ HERE  │   │       │       │
    │       └───┬───┘   └───┬───┘   └───┬───┘       │
    │           │           │           │            │
    │         ┌─┴─┐       ┌─┴─┐       ┌─┴─┐          │
    │         │ ? │───────│ ? │───────│ ? │          │
    │         └───┘       └───┘       └───┘          │
    │                                                 │
    │    WARNING: Map does not reflect actual layout │
    │                                                 │
    └─────────────────────────────────────────────────┘
    `;
    
    const content = document.getElementById('room-content');
    content.innerHTML += `<div class="terminal-display fade-in"><pre>${mapAscii}</pre></div>`;
}

// ═══════════════════════════════════════════════════════════════
// MENU & INITIALIZATION
// ═══════════════════════════════════════════════════════════════

function showMenu() {
    document.getElementById('menu-screen').classList.remove('hidden');
    document.getElementById('world').classList.add('hidden');
}

function startGame() {
    document.getElementById('menu-screen').classList.add('hidden');
    document.getElementById('world').classList.remove('hidden');
    
    // Reset state
    DEPTH.current = 1;
    DEPTH.max_explored = 1;
    DEPTH.coordinates = { x: 0, y: 0, z: -1 };
    visitedRooms.clear();
    
    // Generate first room
    currentRoom = generateRoom();
    currentRoom.description = "You find yourself in a corridor. The walls are the color of stained manila folders. The carpet—damp—absorbs sound in a way that feels intentional. You do not remember how you arrived here. The fluorescent lights hum at the edge of hearing. They have always been humming.";
    currentRoom.type = 'corridor';
    currentRoom.ascii = ASCII_MANIFESTATIONS[0];
    
    renderRoom(currentRoom);
    
    // Focus input
    document.getElementById('command-input').focus();
}

document.addEventListener('DOMContentLoaded', () => {
    // Menu button handlers
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('menu-btn').addEventListener('click', showMenu);
    document.getElementById('close-btn').addEventListener('click', () => {
        window.open('https://x.com/lostcharts', '_blank');
    });
    
    // Command input handler
    const input = document.getElementById('command-input');
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const cmd = input.value;
            input.value = '';
            handleCommand(cmd);
        }
    });
    
    // Focus input on any keypress when in game
    document.addEventListener('keydown', (e) => {
        const menuHidden = document.getElementById('menu-screen').classList.contains('hidden');
        if (menuHidden && e.target !== input && !e.ctrlKey && !e.metaKey) {
            input.focus();
        }
    });
    
    // Enter key on menu
    document.addEventListener('keydown', (e) => {
        const menuVisible = !document.getElementById('menu-screen').classList.contains('hidden');
        if (menuVisible && e.key === 'Enter') {
            startGame();
        }
    });
    
    // Periodic manifestations
    setInterval(() => {
        if (Math.random() > 0.95) {
            const eye = document.getElementById('corner-eye');
            eye.style.animation = 'none';
            eye.offsetHeight;
            eye.style.animation = 'eyeWatch 30s infinite';
        }
    }, 15000);
});
