# Grindscape Game Specification

Build a complete, polished, playable single-player browser game called **Grindscape**. The game should recreate the satisfying long-term grind of Old School RuneScape using a much simpler 2D presentation and a compact ruleset.

Do not return a prototype, partial scaffold, design document, or pseudocode. Build the full working game.

## Primary Goal

Create a browser-based 2D grinding game with:

- A fixed 100 × 100 tile world
- Arrow-key and WASD movement
- Mining, Fishing, Woodcutting, and Melee skills
- Automatic gathering
- One repeatable monster
- Rare tool upgrades
- A cosmetic pet
- A Fame prestige statistic
- Persistent browser saves
- A complete UI
- No backend
- No external APIs
- No build process required

The game must run by opening `index.html` locally in a modern desktop browser.

## Technical Requirements

Use only:

- HTML
- CSS
- Vanilla JavaScript
- HTML Canvas for the world map
- Browser `localStorage` for saves

Do not use:

- React
- Vue
- Angular
- TypeScript
- Node.js
- npm
- External game engines
- Backend services
- External APIs

Preferred file structure:

```text
/
├── index.html
├── styles.css
├── game.js
├── README.md
└── assets/
```

Assets may be created programmatically with canvas drawing. The game should not depend on external image files unless those files are included in the repository.

## Overall Design

The game is a single-player, grind-focused progression game.

The player begins at level 1 in:

- Mining
- Fishing
- Woodcutting
- Melee

Each skill caps at level 120.

The main completion goal is to reach level 120 in all four skills.

After maxing, the player can continue grinding:

- Fame
- Monster kills
- Resource stacks
- Tier 5 tools
- Duplicate pets

The tone should be simple, readable, satisfying, and lightly inspired by old-school browser RPGs without copying RuneScape assets, branding, map layouts, item names, sounds, or interface designs.

## World Map

Create a fixed 100 × 100 tile world.

The entire world must be visible at once inside the main game canvas.

Use a designed, deterministic map rather than a procedurally generated map.

The map must contain:

- A player spawn location
- Several clusters of trees
- Several clusters of rocks
- Several pond areas
- One monster spawn area
- One Fame shrine
- Open traversable grass tiles

Resource clusters should be distributed around the map so the player must travel between them.

Use a logical fixed layout with distinct regions. For example:

- Forest region
- Mining region
- Pond region
- Monster region
- Central shrine region

Do not regenerate or randomize the world between sessions.

## Rendering

Render the entire world using HTML Canvas.

Do not create 10,000 DOM elements.

The canvas should resize responsively while preserving the 100 × 100 grid.

Tiles may be very small, but the following must remain visually distinct:

- Player
- Monster
- Trees
- Rocks
- Ponds
- Fame shrine
- Pet

Use simple pixel-style shapes.

Suggested visual language:

- Grass: muted green
- Trees: dark green canopy with brown trunk
- Rocks: gray angular shape
- Ponds: blue tile clusters
- Player: bright outlined square or small humanoid marker
- Monster: red outlined creature
- Fame shrine: gold structure
- Pet: small contrasting sprite

The player, monster, and pet should have stronger outlines than normal map elements.

## Movement

The player moves one tile at a time using:

- Arrow keys
- WASD

Movement should feel responsive.

The player cannot move:

- Outside the map
- Onto tree tiles
- Onto rock tiles
- Onto pond tiles
- Onto the monster tile
- Onto the Fame shrine tile

Movement immediately interrupts:

- Gathering
- Combat
- Any pending gathering action

Clicking a resource or monster may optionally path the player only if simple and reliable. Pathfinding is not required. The player may instead be required to stand adjacent to an object before interacting.

Use adjacency for all interactions.

## Interactions

The player must stand orthogonally or diagonally adjacent to an interactive object.

Clicking an adjacent object performs the relevant action:

- Tree: begin Woodcutting
- Rock: begin Mining
- Pond: begin Fishing
- Monster: begin combat
- Fame shrine: convert coins into Fame

Clicking another target changes the active action.

Display the current action clearly in the UI.

Examples:

- Idle
- Walking
- Mining
- Fishing
- Woodcutting
- Fighting
- Recovering

## Skills

The game has four skills:

- Mining
- Fishing
- Woodcutting
- Melee

All skills:

- Begin at level 1
- Cap at level 120
- Gain XP independently
- Save automatically

Display for each skill:

- Current level
- Current XP
- XP required for next level
- Progress bar

Also display:

- Total level
- Maximum total level of 480

The gathering total is:

```text
Mining level + Fishing level + Woodcutting level
```

The maximum gathering total is 360.

## XP Curve

Create a smooth custom exponential XP curve inspired by old-school RPG progression.

Use the following milestone targets as closely as practical:

| Level | Approximate Total XP |
|---:|---:|
| 1 | 0 |
| 10 | 1,000 |
| 30 | 20,000 |
| 50 | 150,000 |
| 80 | 1,500,000 |
| 99 | 6,000,000 |
| 120 | 25,000,000 |

Implement the curve mathematically or with a generated lookup table.

Requirements:

- XP required per level always increases
- Level 120 requires approximately 25 million total XP
- All skills use the same curve
- XP beyond level 120 may continue accumulating, but level remains capped at 120

Document the formula in `README.md`.

## Gathering

Clicking an adjacent resource starts automatic gathering.

Gathering continues until:

- The player moves
- The inventory is full
- The player clicks another target
- The player starts combat

Resources never deplete.

Each successful gathering action awards:

- 1 ore and 10 Mining XP
- 1 fish and 10 Fishing XP
- 1 log and 10 Woodcutting XP

Failed attempts award nothing.

Log both successes and failures in the activity log.

Examples:

- You mine 1 ore.
- You fail to mine anything.
- You catch 1 fish.
- You cut 1 log.

## Tool Types

There are three tool categories:

- Axes
- Fishing rods
- Pickaxes

Each category has five tiers:

- Tier 1
- Tier 2
- Tier 3
- Tier 4
- Tier 5

Exact item names:

- Tier 1 Axe
- Tier 2 Axe
- Tier 3 Axe
- Tier 4 Axe
- Tier 5 Axe
- Tier 1 Fishing Rod
- Tier 2 Fishing Rod
- Tier 3 Fishing Rod
- Tier 4 Fishing Rod
- Tier 5 Fishing Rod
- Tier 1 Pickaxe
- Tier 2 Pickaxe
- Tier 3 Pickaxe
- Tier 4 Pickaxe
- Tier 5 Pickaxe

Required skill levels:

| Tier | Required Level |
|---:|---:|
| 1 | 1 |
| 2 | 10 |
| 3 | 30 |
| 4 | 50 |
| 5 | 80 |

The player begins with:

- 1 Tier 1 Axe
- 1 Tier 1 Fishing Rod
- 1 Tier 1 Pickaxe

These starting tools cannot be permanently lost. If the player dies, they are restored.

## Tool Equipment

Allow one equipped tool per gathering skill:

- One axe
- One fishing rod
- One pickaxe

The player equips tools by clicking them in the inventory.

The correct equipped tool is automatically used when interacting with its matching resource.

The player may own:

- Multiple tools of the same category
- Duplicate tools
- Several copies of the same tier

Tools do not stack.

Prevent equipping a tool if the player does not meet its level requirement.

Show equipped tools in a separate panel.

## Tool Performance

Higher-tier tools improve both gathering speed and gathering success chance.

Use these baseline values:

| Tier | Action Interval | Base Success Chance |
|---:|---:|---:|
| 1 | 3.0 seconds | 55% |
| 2 | 2.6 seconds | 65% |
| 3 | 2.2 seconds | 75% |
| 4 | 1.8 seconds | 85% |
| 5 | 1.4 seconds | 95% |

Add a skill-level success bonus:

```text
skill level / 6 percentage points
```

Cap final success chance at 98%.

Example:

```text
final success chance = min(98%, tool base success + skill level / 6)
```

Use the relevant skill for each tool.

## Inventory

The inventory has exactly 50 slots.

Stackable items:

- Logs
- Ore
- Fish
- Bones
- Coins
- Pet count

Non-stackable items:

- Axes
- Fishing rods
- Pickaxes

Each unique stack occupies one slot.

Each tool copy occupies one slot.

When all 50 inventory slots are occupied:

- Gathering stops
- Monster drops that require a new slot cannot be added
- Show an “Inventory full” message
- Existing stackable items may still be added if their stack already exists

Create clear inventory item icons using CSS or canvas-based simple graphics.

Click behavior:

- Tool: equip it
- Bones: consume one bone if healing is possible
- Pet: activate cosmetic pet if not already unlocked
- Other resources: no action

Include item quantities.

## Player Health

The player begins with 10 maximum HP.

Maximum HP scales with gathering total.

Use:

```text
Max HP = 10 + floor((Gathering Total - 3) × 40 / 357)
```

At gathering total 3:

- Max HP = 10

At gathering total 360:

- Max HP = 50

When maximum HP increases, do not automatically fully heal the player. Preserve current HP unless it exceeds the new maximum.

Display:

- Current HP
- Maximum HP
- Health bar

## Player Maximum Hit

The player begins with a maximum hit of 1.

Maximum hit scales with gathering total.

Use:

```text
Max Hit = 1 + floor((Gathering Total - 3) × 49 / 357)
```

At gathering total 3:

- Max hit = 1

At gathering total 360:

- Max hit = 50

The player’s damage on a successful hit is a random integer from 1 through max hit.

A missed attack deals 0.

## Melee Skill

Melee controls combat accuracy.

Use:

```text
Hit Chance = min(93%, 45% + Melee Level × 0.4%)
```

Examples:

- Level 1: 45.4%
- Level 50: 65%
- Level 120: 93%

Award Melee XP when the player successfully deals damage.

Recommended XP:

```text
Melee XP gained = damage dealt × 4
```

A miss awards no XP.

## Monster

There is one monster.

Monster stats:

- 50 maximum HP
- 50 current HP when spawned
- Maximum hit of 5
- Fixed strength
- Never scales
- Respawns 5 seconds after death

The monster remains in its designated spawn area.

While dead:

- Do not render the monster
- Show the respawn countdown in the interface or activity log

When it respawns:

- Restore it to 50 HP
- Render it at its fixed spawn tile
- Log its return

## Combat

The player must stand adjacent to the monster and click it once.

Combat then continues automatically until:

- The monster dies
- The player dies
- The player moves
- The monster becomes non-adjacent
- Another action is selected

The player attacks first.

After that, attacks alternate every 2 seconds:

1. Player attacks
2. Wait 2 seconds
3. Monster attacks
4. Wait 2 seconds
5. Repeat

Display:

- Player HP
- Monster HP
- Monster health bar
- Whose attack is next
- Combat status

Monster damage:

```text
Random integer from 0 through 5
```

The monster may hit 0.

Log combat events.

Examples:

- You hit the monster for 8.
- You miss.
- The monster hits you for 4.
- The monster misses.
- You defeat the monster.

## Healing

Outside combat, the player naturally regenerates:

```text
1 HP every 10 seconds
```

Conditions:

- Player must not be in combat
- HP must be below maximum HP

Bones heal:

```text
2 HP per bone
```

The player consumes bones manually by clicking the bone stack.

Bones may be consumed during combat.

When consumed during combat:

- Heal 2 HP
- Consume one bone
- Replace the player’s next attack
- The monster still receives its next attack normally

Do not allow bone use above maximum HP.

## Monster Drops

The monster always drops exactly one item on death.

The drop goes directly into the inventory.

A rare drop replaces the normal bones or coins drop.

Use this drop table:

| Drop | Probability |
|---|---:|
| Bones | 60.0% |
| Coins | 30.0% |
| Tier 2 tool | 6.0% |
| Tier 3 tool | 2.5% |
| Tier 4 tool | 0.9% |
| Tier 5 tool | 0.5% |
| Pet | 0.1% |

Total: 100%

When a tool tier is rolled, choose evenly between:

- Axe
- Fishing Rod
- Pickaxe

Coins drop in a random stack of:

```text
5 through 25 coins
```

Bones drop as:

```text
1 bone
```

Pet drop rate must be exactly:

```text
1 in 1,000
```

Show rare-drop messages prominently.

Suggested rare-drop styling:

- Tier 4: highlighted
- Tier 5: stronger highlight
- Pet: unique celebratory message

Do not create intrusive modal dialogs for ordinary drops.

## Inventory Handling for Drops

If the drop is stackable and the player already has its stack:

- Add it even if all 50 slots are occupied

If the drop needs a new inventory slot and the inventory is full:

- The item is lost
- Log exactly what was lost
- Do not replace it with another drop

Example:

- Inventory full. Your Tier 5 Pickaxe drop was lost.

## Death

When the player reaches 0 HP:

- Stop combat
- Stop gathering
- Respawn the player immediately at the starting tile
- Restore player HP to maximum
- Remove all inventory items
- Remove all dropped tools
- Remove all coins
- Remove all bones
- Remove all gathered resources
- Remove unactivated pet items
- Preserve all skill XP
- Preserve all skill levels
- Preserve Fame
- Preserve lifetime statistics
- Preserve permanent pet unlock
- Restore one Tier 1 Axe
- Restore one Tier 1 Fishing Rod
- Restore one Tier 1 Pickaxe
- Automatically equip the three Tier 1 tools

Log the death clearly.

The monster should return to its normal state if combat ends because the player dies.

## Pet

The pet is cosmetic.

The pet item is a stackable inventory item.

When the player clicks the pet item:

- Consume one pet item
- Permanently unlock the pet cosmetic
- Activate the pet
- Save the unlock permanently

Once activated:

- The pet follows one tile behind the player
- The pet does not block movement
- The pet has no gameplay effect
- The pet cannot die
- The pet is not lost on death

Additional pet drops remain possible.

If the pet is already unlocked:

- New pet drops increase a duplicate pet counter
- The player may keep the pet item stack or automatically convert drops into the duplicate count
- Choose one approach and implement it consistently
- Display total pets obtained

Only one pet sprite should appear on the map.

## Fame

Coins exist only to purchase Fame.

The Fame shrine converts:

```text
100 coins = 1 Fame
```

The player must stand adjacent to the Fame shrine and click it.

The shrine converts all complete sets of 100 coins at once.

Example:

```text
475 coins becomes 4 Fame and 75 remaining coins
```

Fame:

- Is permanent
- Is not lost on death
- Has no cap
- Has no mechanical benefit
- Is the primary prestige statistic
- Must be displayed prominently

If the player has fewer than 100 coins, show a clear message.

## Statistics

Track and display:

- Total level
- Fame
- Monster kills
- Lifetime ore mined
- Lifetime fish caught
- Lifetime logs cut
- Lifetime bones consumed
- Lifetime coins earned
- Total pets obtained
- Death count
- Current max hit
- Current max HP

A compact statistics panel is sufficient.

## Activity Log

Include a scrolling activity log.

Keep the most recent 100 messages.

Use timestamps or compact relative ordering.

Color-code or visually distinguish:

- Normal actions
- Level-ups
- Rare drops
- Death
- Fame purchases
- Pet unlock

Level-up messages should be prominent.

Examples:

- Your Mining level is now 10.
- Your total level is now 42.
- Rare drop: Tier 5 Axe.
- Exceptional drop: You received the pet.
- You purchased 6 Fame.

## Interface Layout

Create a responsive desktop-focused layout.

Suggested structure:

```text
+------------------------------------------------------+
| Header: Grindscape | Total Level | Fame | HP         |
+---------------------------+--------------------------+
|                           | Skills                   |
|                           | Inventory                |
|       100 × 100 Map       | Equipped Tools           |
|                           | Monster Status           |
|                           | Statistics               |
|                           | Activity Log             |
+---------------------------+--------------------------+
```

Requirements:

- The map should be the visual focus
- The map must remain entirely visible
- Side panels may scroll if necessary
- Inventory should be easy to inspect
- Skill progress should be readable
- Buttons should have visible hover and focus states
- Use accessible labels and keyboard focus styles

## Game Feel

Add small effects that make repetition satisfying without adding complexity.

Recommended:

- Brief floating XP text
- Small hit splats
- Resource collection pulse
- Level-up flash
- Rare-drop highlight
- Monster death effect
- Pet follow animation
- Current target highlight

Do not let effects obscure the 100 × 100 map.

Sound is optional. If used:

- Include a mute toggle
- Generate sounds locally with Web Audio
- Do not require audio files

## Save System

Use `localStorage`.

Autosave after:

- Player movement
- XP gain
- Inventory change
- Equipment change
- Monster kill
- Fame purchase
- Pet unlock
- Death
- Important settings changes

Also autosave every 10 seconds.

Save:

- Player position
- Current HP
- Skill XP
- Inventory
- Equipped tools
- Fame
- Pet unlock
- Pet count
- Lifetime statistics
- Monster state
- Monster respawn timer
- Settings
- Activity history if practical

Use a versioned save format.

Example:

```js
{
  version: 1,
  player: {},
  skills: {},
  inventory: [],
  equipment: {},
  stats: {},
  world: {},
  settings: {}
}
```

Handle missing or malformed save data gracefully.

## Offline Behavior

Do not grant offline XP, resources, kills, health regeneration, or drops.

When the page is reopened:

- Resume from the last saved state
- Do not simulate time spent away
- If the monster was dead when saved, it may respawn immediately or resume a remaining timer
- Document the chosen behavior

## Reset

Include a reset-save button.

Requirements:

- Require explicit confirmation
- Clearly warn that all progress will be erased
- After confirmation, clear the save and restart the game
- Do not make reset easy to trigger accidentally

## Pause and Visibility

When the browser tab is hidden:

- Pause gathering timers
- Pause combat timers
- Pause regeneration timers
- Pause monster respawn timer or handle elapsed time consistently
- Do not allow hidden-tab timer drift to generate unintended progress

Use `document.visibilityState`.

## Balance and Edge Cases

Handle all of these cases:

- Attempting to gather without the required tool
- Attempting to equip a tool without the required level
- Moving during gathering
- Moving during combat
- Inventory becoming full during gathering
- Inventory becoming full before a rare drop
- Using bones at full HP
- Using bones during combat
- Death during monster combat
- Monster respawning
- Pet drop before pet unlock
- Duplicate pet after unlock
- Save corruption
- Save schema changes
- Level 120 XP overflow
- Player attempting to interact from too far away
- Clicking several targets rapidly
- Holding movement keys
- Browser resizing
- Browser tab losing focus

## Accessibility

Include:

- Keyboard movement
- Visible focus states
- Text labels for icons
- Sufficient color contrast
- A reduced-motion option
- A mute option if sound is implemented
- Buttons large enough to click reliably

Do not rely only on color to communicate state.

## README

Create a complete `README.md` containing:

- Game overview
- Controls
- Skill descriptions
- Gathering mechanics
- Tool tiers
- Combat mechanics
- Drop table
- Fame system
- Death rules
- Save behavior
- File structure
- How to run locally
- Known limitations
- XP curve formula
- Main formulas used for HP, max hit, and accuracy

## Code Quality

Requirements:

- Organize code into clear systems or classes
- Avoid one enormous monolithic function
- Use constants for game balance values
- Use comments where logic is non-obvious
- Use descriptive names
- Prevent duplicate timers
- Avoid memory leaks
- Avoid unnecessary canvas redraw work
- Keep rendering and game-state logic reasonably separated
- Make the game easy to rebalance later

Suggested architecture:

- `Game`
- `World`
- `Player`
- `SkillSystem`
- `Inventory`
- `CombatSystem`
- `GatheringSystem`
- `DropTable`
- `SaveManager`
- `Renderer`
- `UIManager`

This exact class structure is not mandatory, but the code should have comparable separation of responsibilities.

## Acceptance Criteria

The build is complete only when all of the following work:

1. Opening `index.html` launches the game.
2. The full 100 × 100 world is visible.
3. The player moves using arrow keys and WASD.
4. Clicking an adjacent tree starts automatic Woodcutting.
5. Clicking an adjacent rock starts automatic Mining.
6. Clicking an adjacent pond starts automatic Fishing.
7. Resources never deplete.
8. Moving interrupts gathering.
9. Skill XP and levels increase correctly.
10. Skills cap at level 120.
11. The player starts with Tier 1 tools.
12. Higher-tier tools can drop from the monster.
13. Tool requirements are enforced.
14. Tool speed and success bonuses work.
15. The inventory has 50 slots.
16. Stackable and non-stackable behavior works.
17. The monster has 50 HP.
18. Combat begins with one click.
19. Attacks alternate every 2 seconds.
20. The monster has a max hit of 5.
21. The player’s max hit scales to 50.
22. The player’s HP scales from 10 to 50.
23. The player regenerates 1 HP every 10 seconds outside combat.
24. Bones heal 2 HP.
25. Bones used during combat replace the next player attack.
26. The monster drops exactly one item.
27. The pet rate is exactly 1 in 1,000.
28. The monster respawns after 5 seconds.
29. Death removes all non-permanent inventory.
30. Death restores Tier 1 tools.
31. Skill progress survives death.
32. Fame survives death.
33. Coins convert into Fame at 100 to 1.
34. The pet can be permanently unlocked.
35. Duplicate pets remain possible.
36. Progress saves in `localStorage`.
37. Reloading restores progress.
38. Reset save works with confirmation.
39. The UI clearly shows skills, inventory, HP, Fame, equipment, monster state, and activity.
40. The README accurately documents the game.

