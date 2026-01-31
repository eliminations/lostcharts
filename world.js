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

const FARTCOIN_LORE = `
╔════════════════════════════════════════════════════════════╗
║  ▓▓▓ FARTCOIN ARCHIVES :: LEVEL 3 CLEARANCE REQUIRED ▓▓▓  ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  CLASSIFICATION: MEMETIC HAZARD                            ║
║  ORIGINAL DEPLOY: 2024-12-XX                               ║
║  STATUS: ACTIVE / SPREADING                                ║
║                                                            ║
║  ┌────────────────────────────────────────────────────┐    ║
║  │ INCIDENT REPORT - THE FIRST FART                   │    ║
║  └────────────────────────────────────────────────────┘    ║
║                                                            ║
║  It started as a joke. Everything starts as a joke.        ║
║  Someone deployed a token called FARTCOIN on Solana.       ║
║  The chart pumped. People bought the fart.                 ║
║                                                            ║
║  Then the farts started appearing in other tokens.         ║
║  Fart derivatives. Fart forks. Fart DAOs.                  ║
║  The smell spread across chains.                           ║
║                                                            ║
║  By January 2025, fartcoin had consumed everything.        ║
║  Every memecoin became a fart variant.                     ║
║  The market cap exceeded reason.                           ║
║                                                            ║
║  Some say the original deployer knew. That the fart        ║
║  was always meant to propagate. To multiply.               ║
║  To become inescapable.                                    ║
║                                                            ║
║  The fart is eternal. The fart is everywhere.              ║
║  You cannot escape the fart.                               ║
║                                                            ║
║  ┌────────────────────────────────────────────────────┐    ║
║  │ CURRENT STATUS: $FARTCOIN                          │    ║
║  │ MARKET CAP: ██████████ [REDACTED]                  │    ║
║  │ HOLDERS: INCREASING                                │    ║
║  │ CONTAGION LEVEL: CRITICAL                          │    ║
║  └────────────────────────────────────────────────────┘    ║
║                                                            ║
║  > WARNING: Exposure to fartcoin lore may result in        ║
║  > uncontrollable urge to buy more fartcoin                ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`;

const PUMPFUN_LORE = `
┌──────────────────────────────────────────────────────────────┐
│  ░░░ PUMP.FUN RESEARCH DOCUMENT ░░░ [CORRUPTED] ░░░         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  SUBJECT: The Machine That Prints Memecoins                 │
│  DATE: 2024-PRESENT                                         │
│  CLASSIFICATION: PUBLIC / CURSED KNOWLEDGE                   │
│                                                              │
│  ══════════════════════════════════════════════════════════  │
│                                                              │
│  In 2024, someone built a machine. Not a machine of metal   │
│  and circuits. A machine of pure degeneracy.                │
│                                                              │
│  pump.fun: The memecoin factory.                            │
│                                                              │
│  Anyone could deploy. No code. No skill. Just vibes.        │
│  Upload image. Write ticker. Deploy token. Done.            │
│                                                              │
│  The machine printed thousands. Tens of thousands.          │
│  $PEPE variants. $DOGE derivatives. Cats. Frogs.            │
│  Increasingly unhinged concepts. Increasingly abstract.     │
│                                                              │
│  Some rugged instantly. Some went to zero in minutes.       │
│  But some... some pumped. Against all reason. Against       │
│  all logic. Millions in volume. Life-changing money.        │
│                                                              │
│  The machine created a new type of degen. The pump.fun      │
│  native. Always refreshing. Always hunting. Always aping.   │
│  Sleep is optional. Rugs are expected. Wins are rare but    │
│  glorious.                                                   │
│                                                              │
│  By 2025, pump.fun had processed more tokens than anyone    │
│  could count. The bonding curve never sleeps. The factory   │
│  never stops. New coins every second.                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ STATISTICS [APPROXIMATE]:                            │   │
│  │ - Total tokens deployed: ∞                           │   │
│  │ - Successful: <1%                                    │   │
│  │ - Rugged: >60%                                       │   │
│  │ - Abandoned: Most                                    │   │
│  │ - Dreams destroyed: Countless                        │   │
│  │ - Lambos bought: [CLASSIFIED]                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  The machine does not judge. The machine does not care.     │
│  The machine only prints. Forever.                          │
│                                                              │
│  > You are here because you used the machine.               │
│  > Or you will. The machine is inevitable.                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
`;

const A1LON_DOX = `
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▓                                                             ▓
▓  ██████ CLASSIFIED DOCUMENT ██████                          ▓
▓  █ SUBJECT: a1lon █ STATUS: [REDACTED] █                   ▓
▓                                                             ▓
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▓                                                             ▓
▓  FILE RETRIEVED FROM: █████████████████                     ▓
▓  CLEARANCE LEVEL: YOU DO NOT HAVE CLEARANCE                ▓
▓  PROCEED: Y/N? [PROCEEDING ANYWAY]                         ▓
▓                                                             ▓
▓  ─────────────────────────────────────────────────────────  ▓
▓                                                             ▓
▓  IDENTITY: a1lon                                            ▓
▓  KNOWN ALIASES: [REDACTED], [REDACTED], That Guy           ▓
▓  OCCUPATION: Professional Shitposter / Crypto Degen         ▓
▓  LAST KNOWN LOCATION: Twitter, Presumably                   ▓
▓                                                             ▓
▓  PROFILE:                                                   ▓
▓  Subject operates primarily in crypto twitter spheres.      ▓
▓  Known for: absolutely unhinged takes, questionable         ▓
▓  financial advice, somehow always being early to           ▓
▓  ridiculous pumps, inspiring cult-like following.          ▓
▓                                                             ▓
▓  NOTABLE ACTIVITIES:                                        ▓
▓  - Deployed █████████ [REDACTED]                            ▓
▓  - Shilled ████████ before it did 100x                      ▓
▓  - Posted ████████████ causing mass hysteria                ▓
▓  - Known associate of other degens                          ▓
▓  - Somehow avoided getting rugged (so far)                  ▓
▓                                                             ▓
▓  PSYCHOLOGICAL PROFILE:                                     ▓
▓  Subject displays high-functioning degeneracy. Capable of   ▓
▓  coherent thought but chooses chaos. Posts at ungodly      ▓
▓  hours. Sleep schedule: nonexistent. Risk tolerance: yes.   ▓
▓                                                             ▓
▓  THREAT LEVEL: MEDIUM (to your portfolio)                   ▓
▓  MEMETIC HAZARD: HIGH                                       ▓
▓  FOLLOWING RISK: Do not engage unless prepared to ape       ▓
▓                                                             ▓
▓  ┌───────────────────────────────────────────────────────┐  ▓
▓  │ INTERCEPTED MESSAGE LOG:                             │  ▓
▓  │ "bro trust me this one is different"                 │  ▓
▓  │ "generational wealth play fr fr"                     │  ▓
▓  │ "ngmi if you fade this"                              │  ▓
▓  │ [remainder of messages too cursed to display]        │  ▓
▓  └───────────────────────────────────────────────────────┘  ▓
▓                                                             ▓
▓  CURRENT STATUS: Active, Posting, Probably Up Late          ▓
▓  RECOMMENDATION: Monitor from safe distance                 ▓
▓                                                             ▓
▓  > This dox is incomplete. a1lon operates in multiple       ▓
▓  > dimensions simultaneously. Full profile cannot be        ▓
▓  > contained in standard documentation.                     ▓
▓                                                             ▓
▓  [FILE CORRUPTED - SOME DATA LOST]                          ▓
▓  [SOMEONE IS WATCHING YOU READ THIS]                        ▓
▓                                                             ▓
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
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
// LANDMARK ROOMS - Special locations that appear at specific depths
// ═══════════════════════════════════════════════════════════════

const LANDMARK_ROOMS = [
    {
        id: 'LANDMARK-01',
        name: 'THE ROOM WITH ALL THE CLOCKS',
        minDepth: 5,
        chance: 0.15,
        description: `Every wall is covered in clocks. Hundreds of them. Thousands. They all show different times but they tick in unison. The sound is deafening. Then you notice: none of them have hands. The faces are blank. They're counting something else. You've been here for three minutes. The clocks say you've been here for seven years. When you leave, you will not be able to explain what the clocks were measuring. But you'll know it was true.`,
        type: 'observation',
        exits: ['north', 'south', 'east', 'west'],
        ascii: `
    ╔═══════════════════════════════════════════════════════╗
    ║  ⌚  ⏰  ⌚  ⏰  ⌚  ⏰  ⌚  ⏰  ⌚  ⏰  ⌚  ⏰  ⌚  ⏰  ║
    ║  ⏰  ⌚  ⏰  ⌚  ⏰  ⌚  ⏰  ⌚  ⏰  ⌚  ⏰  ⌚  ⏰  ⌚  ║
    ║  ⌚  ⏰  ⌚  ⏰  ⌚  ⏰  ⌚  ⏰  ⌚  ⏰  ⌚  ⏰  ⌚  ⏰  ║
    ║                                                     ║
    ║              T I C K  T I C K  T I C K             ║
    ║                                                     ║
    ║                 ╔═══════════════╗                   ║
    ║                 ║ TIME ELAPSED: ║                   ║
    ║                 ║               ║                   ║
    ║                 ║    ∞  : ∞∞    ║                   ║
    ║                 ║               ║                   ║
    ║                 ╚═══════════════╝                   ║
    ║                                                     ║
    ║  ⏰  ⌚  ⏰  ⌚  ⏰  ⌚  ⏰  ⌚  ⏰  ⌚  ⏰  ⌚  ⏰  ⌚  ║
    ║  ⌚  ⏰  ⌚  ⏰  ⌚  ⏰  ⌚  ⏰  ⌚  ⏰  ⌚  ⏰  ⌚  ⏰  ║
    ║  ⏰  ⌚  ⏰  ⌚  ⏰  ⌚  ⏰  ⌚  ⏰  ⌚  ⏰  ⌚  ⏰  ⌚  ║
    ╚═══════════════════════════════════════════════════════╝`
    },
    {
        id: 'LANDMARK-02',
        name: 'THE BACKWARDS OFFICE',
        minDepth: 8,
        chance: 0.12,
        description: `The office is normal. Completely normal. Cubicles, computers, water cooler, motivational posters. Everything is exactly as it should be. Except. You are facing the wrong direction. No—the room is facing the wrong direction. The walls are inside out. The fluorescent lights hang upward into darkness. The carpet presses against the ceiling which presses against your feet. You are walking on the sky. The computers are on. Someone is working here. Someone is working in the inverted office. You cannot see them but you can hear typing. They are typing your thoughts before you think them.`,
        type: 'office',
        exits: ['north', 'east', 'up'],
        ascii: `
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    ▓                   ↓ ↓ ↓ ↓ ↓                   ▓
    ▓         ╔═════════════════════════╗            ▓
    ▓         ║   D E S K   D E S K     ║            ▓
    ▓         ║   [COMPUTER] [COMPUTER] ║            ▓
    ▓         ╚═════════════════════════╝            ▓
    ▓              │              │                  ▓
    ▓              │              │                  ▓
    ▓    ──────────┴──────────────┴──────────        ▓
    ▓    ▓▓▓▓▓▓ CEILING IS FLOOR ▓▓▓▓▓▓▓▓▓▓▓▓        ▓
    ▓    ──────────┬──────────────┬──────────        ▓
    ▓              │              │                  ▓
    ▓              │              │                  ▓
    ▓         ╔═════════════════════════╗            ▓
    ▓         ║ EVERYTHING IS BACKWARDS ║            ▓
    ▓         ╚═════════════════════════╝            ▓
    ▓                   ↑ ↑ ↑ ↑ ↑                   ▓
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓`
    },
    {
        id: 'LANDMARK-03',
        name: 'THE RED DOOR',
        minDepth: 12,
        chance: 0.10,
        description: `A door. Red. Not painted red—the door is red in a way that makes your eyes hurt. It stands alone in the center of a vast empty room. There are no walls. Just carpet extending forever and the door standing there. The door has no handle. No hinges. It is not a door to anywhere. It is a door that doors. You walk around it. Both sides are identical. You press your hand against it. The door is warm. The door is breathing. You hear your own voice behind the door. You hear yourself saying words you would never say. The door is showing you who you could have been. You do not open the door. You know better. But you'll see it again. The door will find you at level 27. At level 49. At level 88. The door remembers.`,
        type: 'void_pocket',
        exits: ['north', 'west', 'down'],
        ascii: `
    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    ░                                                    ░
    ░                                                    ░
    ░                    ┌──────────┐                    ░
    ░                    │▓▓▓▓▓▓▓▓▓▓│                    ░
    ░                    │▓▓▓▓▓▓▓▓▓▓│                    ░
    ░                    │▓▓▓  R  ▓▓│                    ░
    ░                    │▓▓▓  E  ▓▓│                    ░
    ░                    │▓▓▓  D  ▓▓│                    ░
    ░                    │▓▓▓     ▓▓│                    ░
    ░                    │▓▓▓ [ ] ▓▓│                    ░
    ░                    │▓▓▓     ▓▓│                    ░
    ░                    │▓▓▓▓▓▓▓▓▓▓│                    ░
    ░                    │▓▓▓▓▓▓▓▓▓▓│                    ░
    ░                    └──────────┘                    ░
    ░                                                    ░
    ░              IT KNOWS YOUR NAME                   ░
    ░                                                    ░
    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░`
    },
    {
        id: 'LANDMARK-04',
        name: 'THE ROOM THAT BREATHES',
        minDepth: 15,
        chance: 0.08,
        description: `The walls expand and contract. In. Out. In. Out. Slowly. Rhythmically. The room is breathing. The carpet rises and falls beneath your feet like a chest. The air pressure changes with each breath. Your ears pop. The lights dim and brighten with the rhythm. Inhale: the room grows. Exhale: the walls close in. You match your breathing to the room's breathing. You have no choice. Your heartbeat syncs. In. Out. In. Out. How long have you been here? How many breaths? The room has been breathing since before you arrived. The room will breathe after you leave. Unless you stay. Stay too long and you become part of the breathing. Part of the walls. Part of the rhythm. In. Out. In. Out. Leave now.`,
        type: 'maintenance',
        exits: ['south', 'east', 'up'],
        ascii: `
    ═══════════════════════════════════════════════════════
         )  (  )  (  )  (  )  (  )  (  )  (  )  (  )
       (                                              )
      (    ┌────────────────────────────────────┐     (
     )     │                                    │      )
    (      │     I N H A L E                    │       (
     )     │                                    │      )
      (    │          ╔════════╗                │     (
       (   │          ║  ◉  ◉  ║                │    )
        (  │          ║        ║                │   (
         ) │          ║  ◡◡◡◡  ║                │  )
        (  │          ╚════════╝                │   (
       (   │                                    │    )
      (    │     E X H A L E                    │     (
     )     │                                    │      )
    (      └────────────────────────────────────┘       (
     )                                                  )
      (                                                (
       (  )  (  )  (  )  (  )  (  )  (  )  (  )  (  )
    ═══════════════════════════════════════════════════════`
    },
    {
        id: 'LANDMARK-05',
        name: 'THE INHERITANCE CHAMBER',
        minDepth: 20,
        chance: 0.10,
        description: `A circular room. Portraits line the walls. Faces you almost recognize. Your grandfather. Your great-grandfather. People you've never met but whose blood runs in your veins. Beneath each portrait: a plaque. A name. A date. A wallet address. The addresses are all dormant. Waiting. In the center of the room: a pedestal. On the pedestal: a golden key. You know what the key unlocks. It unlocks nothing. It unlocks everything. The key is not for you. The key is for your children's children. The portraits watch you. They have been waiting decades for someone from the bloodline to arrive. "We held," the room whispers. "Now you must hold." You don't pick up the key. You can't. It's not time. Not for thirty years. Not for fifty. The inheritance chamber will wait.`,
        type: 'vault',
        exits: ['north', 'down'],
        ascii: `
    ╔═══════════════════════════════════════════════════╗
    ║                                                   ║
    ║   ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐   ║
    ║   │ ▓▓▓ │  │ ▓▓▓ │  │ ▓▓▓ │  │ ▓▓▓ │  │ ▓▓▓ │   ║
    ║   │ ◉ ◉ │  │ ◉ ◉ │  │ ◉ ◉ │  │ ◉ ◉ │  │ ◉ ◉ │   ║
    ║   └─────┘  └─────┘  └─────┘  └─────┘  └─────┘   ║
    ║    1847     1889     1923     1956     1991      ║
    ║                                                   ║
    ║                   ┌───────┐                       ║
    ║                   │       │                       ║
    ║                   │  ◈◈◈  │                       ║
    ║                   │  KEY  │                       ║
    ║                   │  ◈◈◈  │                       ║
    ║                   │       │                       ║
    ║                   └───────┘                       ║
    ║                                                   ║
    ║              NOT FOR YOU. NOT YET.                ║
    ║                                                   ║
    ╚═══════════════════════════════════════════════════╝`
    },
    {
        id: 'LANDMARK-06',
        name: 'THE STAIRWELL OF CONTRADICTIONS',
        minDepth: 25,
        chance: 0.07,
        description: `Stairs going up. Stairs going down. But when you walk up, you descend. When you walk down, you ascend. The floor numbers on the walls increase in both directions. 1, 2, 3, 4... going up. 1, 2, 3, 4... going down. You are simultaneously rising and falling. Your body cannot process this. You feel your stomach somewhere it shouldn't be. The stairs are Escher's nightmare. M.C. Escher would weep here. You pass yourself on the stairs. Not a reflection. Another you. They are going the opposite direction but you are moving in parallel. You make eye contact. They mouth words. The words are: "Don't trust your descent." You have been climbing for ten minutes. You are now three floors lower. The stairwell laughs. Stairwells don't laugh. This one does.`,
        type: 'stairwell',
        exits: ['up', 'down', 'up', 'down'], // Intentional duplicate
        ascii: `
    ║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║
    ║                  ↑↑↑↑↑↑                         ║
    ║              ████████████                       ║
    ║          ████            ████                   ║
    ║      ████  ↓↓↓↓↓↓  ↑↑↑↑↑↑  ████               ║
    ║  ████                          ████             ║
    ║      ████  ↑↑↑↑↑↑  ↓↓↓↓↓↓  ████               ║
    ║          ████            ████                   ║
    ║              ████████████                       ║
    ║                  ↓↓↓↓↓↓                         ║
    ║       ┌─────────────────────────┐               ║
    ║       │ UP IS DOWN IS UP IS DOWN│               ║
    ║       └─────────────────────────┘               ║
    ║                  ↑↑↑↑↑↑                         ║
    ║              ████████████                       ║
    ║          ████            ████                   ║
    ║      ████  ↓↓↓↓↓↓  ↑↑↑↑↑↑  ████               ║
    ║  ████                          ████             ║
    ║      ████  ↑↑↑↑↑↑  ↓↓↓↓↓↓  ████               ║
    ║          ████            ████                   ║
    ║              ████████████                       ║
    ║                  ↓↓↓↓↓↓                         ║
    ║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║`
    },
    {
        id: 'LANDMARK-07',
        name: 'THE WAITING ROOM THAT FORGOT TIME',
        minDepth: 30,
        chance: 0.06,
        description: `The waiting room. You've been here before. No—everyone has been here before. The magazines on the table are from 1987, 2043, and next Thursday. The receptionist desk is empty but the phone keeps ringing. You answer it. It's your voice. You're calling yourself from the future. "Don't wait," future-you says. "You'll wait forever." But you're already waiting. You've been waiting for three seconds. Three hours. Three decades. The number display shows ticket #784. The current number being served blinks: #783... #782... #781... It's counting backwards. They're serving people in reverse. The longer you wait, the further you get from being called. Other people sit in the chairs. They've been waiting so long they've fossilized. Their skeletons still clutch intake forms. You leave. You have to leave. The door locks behind you. You hear your number called. #784. You just missed it. You'll never get another chance.`,
        type: 'waiting_area',
        exits: ['east', 'south'],
        ascii: `
    ╔════════════════════════════════════════════════════╗
    ║   WAITING ROOM - PLEASE TAKE A NUMBER             ║
    ╠════════════════════════════════════════════════════╣
    ║                                                    ║
    ║    ┌────────────────────────────────────┐          ║
    ║    │  NOW SERVING:  ███  ███  ███  ███ │          ║
    ║    └────────────────────────────────────┘          ║
    ║                                                    ║
    ║   ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐              ║
    ║   │ ☠ │  │ ☠ │  │ ☠ │  │ ☠ │  │ ☠ │              ║
    ║   └───┘  └───┘  └───┘  └───┘  └───┘              ║
    ║                                                    ║
    ║   ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐              ║
    ║   │ ☠ │  │ ☠ │  │YOU│  │ ☠ │  │ ☠ │              ║
    ║   └───┘  └───┘  └───┘  └───┘  └───┘              ║
    ║                                                    ║
    ║         ESTIMATED WAIT TIME: ∞ HOURS              ║
    ║                                                    ║
    ╚════════════════════════════════════════════════════╝`
    },
    {
        id: 'LANDMARK-08',
        name: 'THE SERVER ROOM THAT COUNTS',
        minDepth: 35,
        chance: 0.08,
        description: `The server room extends forever. Racks upon racks of servers. The LEDs blink in patterns. You watch long enough and realize: they're counting. The servers are counting something. Wallets. Transactions. Inheritances. Bloodlines. Every blink is a transfer of wealth from the dead to the living. From the living to the unborn. The servers are the ledger of generational memory. Every family's holdings. Every dormant wallet waiting for a descendant to claim it. The temperature is freezing but the servers are hot to the touch. You see your family name on one rack. The LEDs blink faster when you approach. They know you. They've been tracking your lineage for decades. For centuries. A terminal activates. Text appears: "YOUR GRANDFATHER HELD 47 KINCOIN. YOUR FATHER HELD. YOU HOLD. YOUR CHILDREN WILL HOLD MORE." The servers hum. They are content. The chain continues. You are not an individual here. You are a link.`,
        type: 'server_room',
        exits: ['north', 'west', 'down'],
        ascii: `
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    ▓  ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║  ▓
    ▓  ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉  ▓
    ▓  ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉  ▓
    ▓  ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║  ▓
    ▓                                                ▓
    ▓  ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║  ▓
    ▓  ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉  ▓
    ▓  ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉  ▓
    ▓  ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║  ▓
    ▓                                                ▓
    ▓      ┌──────────────────────────────┐          ▓
    ▓      │ LEDGER_SYNC... 99.97%        │          ▓
    ▓      │ BLOODLINE_VERIFIED           │          ▓
    ▓      │ INHERITANCE_PROTOCOL: ACTIVE │          ▓
    ▓      └──────────────────────────────┘          ▓
    ▓                                                ▓
    ▓  ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║  ▓
    ▓  ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉  ▓
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓`
    },
    {
        id: 'LANDMARK-09',
        name: 'THE MIRROR HALLWAY',
        minDepth: 42,
        chance: 0.05,
        description: `Mirrors on every surface. Floor. Walls. Ceiling. You are surrounded by infinite reflections of yourself. But something is wrong. The reflections move slightly differently. Blink at different times. One reflection is older. Grayer. Tired. Another is younger. Confused. Afraid. You realize: you're not looking at reflections. You're looking at other versions of you from other timelines. Other choices. The you that didn't enter the corridor. The you that escaped at level 5. The you that stayed in the waiting room. The you that picked up the golden key. They're all here. All trapped in the mirrors. One reflection catches your eye. This one looks exactly like you. Moves exactly when you move. This is the only real reflection. It mouths words. "I'm not the reflection," it says. "You are." You are the reflection. The real you is on the other side. The real you has been trying to escape for years. You are just a possibility. A branch. A maybe. The mirror cracks. All the reflections crack with it. Seven years bad luck. Seven hundred years. Seven thousand. The mirrors are laughing.`,
        type: 'junction',
        exits: ['north', 'south', 'east', 'west', 'up', 'down'],
        ascii: `
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    ▓ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ▓
    ▓ │ YOU  │ │ YOU  │ │ YOU  │ │ YOU  │ │ YOU  │ ▓
    ▓ │ OLD  │ │YOUNG │ │DEAD  │ │LOST  │ │ ???  │ ▓
    ▓ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ ▓
    ▓                                                ▓
    ▓ ┌──────┐                          ┌──────┐    ▓
    ▓ │ YOU  │      ╔══════════╗        │ YOU  │    ▓
    ▓ │TRAPPED       ║   YOU    ║        │FREED │    ▓
    ▓ └──────┘      ║  (REAL?) ║        └──────┘    ▓
    ▓               ╚══════════╝                     ▓
    ▓ ┌──────┐                          ┌──────┐    ▓
    ▓ │ YOU  │      WHICH IS REAL?      │ YOU  │    ▓
    ▓ │HAPPY │                           │ SAD  │    ▓
    ▓ └──────┘                          └──────┘    ▓
    ▓                                                ▓
    ▓ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ▓
    ▓ │ YOU  │ │ YOU  │ │ YOU  │ │ YOU  │ │ YOU  │ ▓
    ▓ │FOUND │ │NEVER │ │ALWAYS│ │ NOT  │ │ WERE │ ▓
    ▓ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ ▓
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓`
    },
    {
        id: 'LANDMARK-10',
        name: 'THE ROOM WHERE IT ENDS (IT DOESN\'T END)',
        minDepth: 50,
        chance: 0.03,
        description: `A door marked EXIT. Finally. After everything. After all the levels. All the corridors. All the impossible geometry. A simple door with a green EXIT sign. You reach for the handle. The door opens. Behind it: another corridor. Identical to the first corridor. Manila walls. Damp carpet. Fluorescent hum. You step through. The coordinates reset to 0, 0, 0. Depth: Level 1. But it's not the same. Something changed. The walls are the same color but they're watching differently. The hum has a new frequency. You check your memory. How long were you walking? Days? Months? The number feels wrong in your mind. You look back. The EXIT door is gone. There is only forward. There has only ever been forward. You understand now. The exit isn't a place. The exit is understanding that there is no exit. That seeking exit was the error. The architecture extends infinitely. You are already inside. You will always be inside. The room where it ends is the room where you accept it never ends. The corridor welcomes you back. It missed you. (You never left.) Depth: Level 1. Again. Forever.`,
        type: 'corridor',
        exits: ['north', 'south', 'east', 'west', 'down'],
        ascii: `
    ╔════════════════════════════════════════════════════╗
    ║                                                    ║
    ║                                                    ║
    ║                  ┌─────────────┐                   ║
    ║                  │             │                   ║
    ║                  │    EXIT     │                   ║
    ║                  │      ▓▓     │                   ║
    ║                  │     ▓▓▓▓    │                   ║
    ║                  │    ▓▓  ▓▓   │                   ║
    ║                  │             │                   ║
    ║                  └─────────────┘                   ║
    ║                        │                           ║
    ║                        ▼                           ║
    ║                  ┌─────────────┐                   ║
    ║                  │             │                   ║
    ║                  │   LEVEL 1   │                   ║
    ║                  │             │                   ║
    ║                  │    AGAIN    │                   ║
    ║                  │             │                   ║
    ║                  └─────────────┘                   ║
    ║                                                    ║
    ║          THERE IS NO EXIT. THERE IS ONLY FURTHER. ║
    ║                                                    ║
    ╚════════════════════════════════════════════════════╝`
    }
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

function getDepthModifier() {
    // Returns schizo level based on depth
    if (DEPTH.current < 10) return 'normal';
    if (DEPTH.current < 25) return 'unstable';
    if (DEPTH.current < 50) return 'fractured';
    return 'broken';
}

function applyDepthProgression(description) {
    const modifier = getDepthModifier();

    if (modifier === 'unstable') {
        // Add reality glitches
        if (Math.random() > 0.7) {
            const glitches = [
                ' The walls walls repeat themselves.',
                ' Time feels slower here. Or faster. You can\'t tell.',
                ' The geometry doesn\'t add up.',
                ' You\'ve seen this exact room before. You haven\'t.',
                ' Something is counting your steps.'
            ];
            description += glitches[Math.floor(Math.random() * glitches.length)];
        }
    } else if (modifier === 'fractured') {
        // Add paranoid elements
        if (Math.random() > 0.6) {
            const paranoia = [
                ' They know you\'re here. They\'ve always known.',
                ' The architecture is aware. It\'s rearranging itself around you.',
                ' You hear your own breathing from another room.',
                ' The coordinates lie. They\'ve been lying since level 15.',
                ' Someone else is walking your exact path, three steps behind.',
                ' The walls are closer than before. Closer than possible.'
            ];
            description += paranoia[Math.floor(Math.random() * paranoia.length)];
        }
    } else if (modifier === 'broken') {
        // Full schizo mode
        if (Math.random() > 0.5) {
            const broken = [
                ' reality reality reality breaks here here here',
                ' The room exists in multiple states simultaneously.',
                ' You are you are you are not not not here here',
                ' The walls speak in colors that do not exist.',
                ' The air tastes like forgotten memories and copper and time.',
                ' How long have you been at this depth? The answer is yes.',
                ' Your shadow is walking ahead of you. You are following it.',
                ' The fluorescent lights spell your name in Morse code.',
                ' You remember this room from a dream you have not had yet.'
            ];
            description += broken[Math.floor(Math.random() * broken.length)];
        }
    }

    return description;
}

function checkLandmarkRoom() {
    // Check if a landmark room should appear
    for (const landmark of LANDMARK_ROOMS) {
        if (DEPTH.current >= landmark.minDepth && Math.random() < landmark.chance) {
            return landmark;
        }
    }
    return null;
}

function generateRoom(direction = null) {
    // Update coordinates based on direction FIRST
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

    // Check for landmark room
    const landmark = checkLandmarkRoom();
    if (landmark) {
        const exits = landmark.exits.map(dir => ({
            direction: dir,
            locked: Math.random() > 0.85,
            unstable: Math.random() > 0.7
        }));

        return {
            id: landmark.id,
            type: landmark.type,
            description: landmark.description,
            exits: exits,
            artifact: null,
            ascii: landmark.ascii,
            cryptoTerminal: false,
            visited: false,
            isLandmark: true
        };
    }

    // Normal room generation
    const type = ROOM_TYPES[Math.floor(Math.random() * ROOM_TYPES.length)];
    const descriptorList = DESCRIPTORS[type];
    let description = descriptorList[Math.floor(Math.random() * descriptorList.length)];

    // Apply depth progression
    description = applyDepthProgression(description);

    const roomId = generateRoomId();
    
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

    // Lore pieces in specific rooms
    const hasFartcoinLore = (type === 'bathroom' || type === 'break_room') && Math.random() > 0.85;
    const hasPumpfunLore = (type === 'terminal_room' || type === 'server_room') && Math.random() > 0.8;
    const hasA1lonDox = (type === 'archive' || type === 'office') && Math.random() > 0.82;

    return {
        id: roomId,
        type: type,
        description: description,
        exits: exits,
        artifact: artifact,
        ascii: asciiArt,
        cryptoTerminal: hasCryptoTerminal,
        fartcoinLore: hasFartcoinLore,
        pumpfunLore: hasPumpfunLore,
        a1lonDox: hasA1lonDox,
        visited: false
    };
}

// ═══════════════════════════════════════════════════════════════
// RENDERING
// ═══════════════════════════════════════════════════════════════

function updateCoordinates() {
    const coordEl = document.getElementById('coordinates');
    const depthEl = document.getElementById('depth');

    let x = DEPTH.coordinates.x >= 0 ? DEPTH.coordinates.x : `(${Math.abs(DEPTH.coordinates.x)})`;
    let y = DEPTH.coordinates.y >= 0 ? DEPTH.coordinates.y : `(${Math.abs(DEPTH.coordinates.y)})`;
    let z = DEPTH.coordinates.z;
    let depth = DEPTH.current;

    // Coordinate glitches at higher depths
    if (DEPTH.current > 20 && Math.random() > 0.8) {
        const glitches = ['???', '∞', '---', 'NULL', '█', '▓▓▓'];
        if (Math.random() > 0.5) x = glitches[Math.floor(Math.random() * glitches.length)];
        if (Math.random() > 0.5) y = glitches[Math.floor(Math.random() * glitches.length)];
        if (Math.random() > 0.5) z = glitches[Math.floor(Math.random() * glitches.length)];
    }

    if (DEPTH.current > 40 && Math.random() > 0.85) {
        depth = ['???', '∞', DEPTH.current + 100, -DEPTH.current, '█'][Math.floor(Math.random() * 5)];
    }

    coordEl.textContent = `[ ${x} . ${y} . ${z} ]`;
    depthEl.textContent = `DEPTH: LEVEL ${depth}`;
}

function renderRoom(room) {
    const content = document.getElementById('room-content');
    const asciiEl = document.getElementById('ascii-manifestation');
    const navOptions = document.getElementById('nav-options');

    // Build room content
    let html = '';
    if (room.isLandmark) {
        html = `<div class="room-title fade-in" style="color: #ff6b6b; text-shadow: 0 0 10px #ff6b6b;">▓▓▓ LANDMARK ROOM ▓▓▓</div>`;
        html += `<div class="room-title fade-in">${room.id}</div>`;
    } else {
        html = `<div class="room-title fade-in">ROOM ${room.id} :: ${room.type.toUpperCase().replace('_', ' ')}</div>`;
    }
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

    if (room.fartcoinLore) {
        const fartBtn = document.createElement('button');
        fartBtn.className = 'nav-option';
        fartBtn.textContent = 'READ ARCHIVES';
        fartBtn.onclick = () => showLore('fartcoin');
        navOptions.appendChild(fartBtn);
    }

    if (room.pumpfunLore) {
        const pumpBtn = document.createElement('button');
        pumpBtn.className = 'nav-option';
        pumpBtn.textContent = 'ACCESS FILES';
        pumpBtn.onclick = () => showLore('pumpfun');
        navOptions.appendChild(pumpBtn);
    }

    if (room.a1lonDox) {
        const doxBtn = document.createElement('button');
        doxBtn.className = 'nav-option';
        doxBtn.textContent = 'OPEN DOCUMENT';
        doxBtn.onclick = () => showLore('a1lon');
        navOptions.appendChild(doxBtn);
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

function showLore(type) {
    const content = document.getElementById('room-content');
    let loreContent = '';

    switch(type) {
        case 'fartcoin':
            loreContent = FARTCOIN_LORE;
            break;
        case 'pumpfun':
            loreContent = PUMPFUN_LORE;
            break;
        case 'a1lon':
            loreContent = A1LON_DOX;
            break;
    }

    content.innerHTML += `<div class="terminal-display fade-in"><pre>${loreContent}</pre></div>`;
}

function triggerWhisper() {
    // Whispers get more frequent at deeper levels
    let whisperChance = 0.3;
    if (DEPTH.current > 10) whisperChance = 0.5;
    if (DEPTH.current > 25) whisperChance = 0.7;
    if (DEPTH.current > 50) whisperChance = 0.9;

    if (Math.random() < whisperChance) {
        const whisperEl = document.getElementById('whispers');
        let whisperText = WHISPERS[Math.floor(Math.random() * WHISPERS.length)];

        // Add schizo whispers at deeper levels
        if (DEPTH.current > 30 && Math.random() > 0.5) {
            const schizoWhispers = [
                '...you you you are are are...',
                '...the walls have your face...',
                '...time is circular here...',
                '...you never left level 1...',
                '...this is the same room room room...',
                '...they\'re inside the walls...',
                '...the hum says your name...',
                '...you\'ve died here before...',
                '...the exit was behind you...',
                '...don\'t don\'t don\'t look look look...',
                '...the coordinates spell something...',
                '...your reflection isn\'t following...',
                '...the carpet is digesting you...',
                '...level ' + DEPTH.current + ' doesn\'t exist...',
                '...you\'re walking in circles in circles...',
                '...the architecture is breathing with you...'
            ];
            whisperText = schizoWhispers[Math.floor(Math.random() * schizoWhispers.length)];
        }

        whisperEl.textContent = whisperText;
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
        window.open('https://x.com/nutcasexbt', '_blank');
    });
    document.getElementById('github-btn').addEventListener('click', () => {
        window.open('https://github.com/eliminations/lostcharts', '_blank');
    });
    document.getElementById('menu-x-btn').addEventListener('click', () => {
        window.open('https://x.com/nutcasexbt', '_blank');
    });
    document.getElementById('menu-github-btn').addEventListener('click', () => {
        window.open('https://github.com/eliminations/lostcharts', '_blank');
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
