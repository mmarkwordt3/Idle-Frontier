# Idle Frontier: Browser RPG Design Brainstorm

## Project Goal

Create a compact, single-player browser RPG inspired by the satisfying progression loop of Old School RuneScape without attempting to recreate RuneScape itself.

The game should preserve the appeal of:

- Skill levels
- Resource tiers
- Better tools
- Rare drops
- Long-term grinding
- Visible account progression
- Low-attention gameplay that can be checked periodically while working

All names, artwork, dialogue, map layouts, items, enemies, and systems should be original.

Possible working titles include:

- Idle Frontier
- The Long Grind
- Tilebound
- Realm of Trades

## Core Requirements

The game should be:

- Single-player
- Browser-based
- Saved locally
- Entirely click-controlled
- Designed for low-attention play
- Visually simple and lightweight
- Smooth enough to run on an ordinary work computer
- Easy enough for Codex to build from one detailed prompt

The world should be a single 100×100 tile map.

The player character should occupy exactly one tile.

All movement and interaction should use:

- Click-to-move
- Click-to-interact

## Core Gameplay Loop

The primary gameplay loop should be:

1. Click a resource.
2. The character automatically walks to an adjacent valid tile.
3. The character repeatedly gathers from the resource.
4. The player gains resources and experience.
5. The resource eventually depletes.
6. The resource respawns after a delay.
7. The player banks or sells gathered materials.
8. The player unlocks better tools and higher-tier resources.
9. The cycle repeats in more valuable areas.

Clicking somewhere else should immediately interrupt the current action.

Gathering should continue until one of the following occurs:

- The resource depletes
- The inventory becomes full
- The player clicks somewhere else
- A dangerous event interrupts the action

## World Map

The entire world should exist on one continuous 100×100 tile grid rendered with an HTML canvas.

The map should be handcrafted rather than procedurally generated.

Most terrain objects should occupy one tile, although some decorative structures may occupy several tiles.

## Central Settlement

The center of the map should contain a safe settlement measuring approximately 20×20 tiles.

The settlement should contain:

- A bank
- A general store
- A tool merchant
- A healing fountain
- A task board
- A fame monument
- Decorative NPCs
- Roads connecting the settlement to the major regions

The settlement should function as the player's permanent home base.

## Western Forest

The western portion of the map should contain Woodcutting resources.

Possible tree progression:

1. Brushwood
2. Pine
3. Oak
4. Ironwood
5. Ancient Tree

Higher-tier trees should be located farther from town and behind more difficult terrain.

## Eastern Quarry

The eastern portion of the map should contain Mining resources.

Possible rock progression:

1. Stone
2. Copper
3. Iron
4. Silver
5. Starstone

Higher-level rocks should take longer to gather but provide more experience and greater value.

## Southern Coast

The southern portion of the map should contain Fishing resources.

Possible fish progression:

1. Minnows
2. Riverfish
3. Trout
4. Swordfish
5. Abyssal Eels

Fishing spots can be represented with simple animated water ripples or colored pixels.

## Northern Ruins

The northern portion of the map should contain combat encounters and rare resources.

The region could include:

- Weak creatures near the entrance
- Stronger monsters deeper inside
- One small dungeon-like ruin
- One elite monster or boss
- High-tier gathering nodes
- Valuable combat drops

## Outer Corners

The four corners of the map should contain some of the highest-value resources.

This creates progression through travel distance without requiring multiple maps.

Better resources should be more profitable, but banking them should require longer trips.

## Skills

The first version should contain only five skills.

### Woodcutting

The player clicks trees to receive logs.

Woodcutting should provide:

- Logs that can be sold
- Woodcutting experience
- Rare nests or seeds
- A chance to obtain a cosmetic Woodcutting pet

### Mining

The player clicks rocks to receive ore.

Mining should provide:

- Ore that can be sold
- Mining experience
- Rare gems
- A chance to obtain a cosmetic Mining pet

### Fishing

The player clicks fishing spots to receive fish.

Fishing should provide:

- Fish that can be sold
- Food that heals the player
- Rare treasure
- A chance to obtain a cosmetic Fishing pet

### Combat

The player clicks a monster once to begin automatic combat.

The player should:

1. Walk into attack range.
2. Automatically attack.
3. Continue attacking until the monster dies, the player dies, or the player moves away.

Combat should provide:

- Coins
- Bones
- Equipment
- Rare items
- Cosmetic pets
- Access to dangerous regions

Combat should initially be melee-only.

Magic, ranged combat, and complicated attack styles should not be included in the first version.

### Constitution

Constitution should determine the player's maximum health.

It should increase passively through combat and should not require its own interactive training method.

## Skills Excluded From the First Version

The following skills should be reserved for later expansions:

- Cooking
- Smithing
- Crafting
- Herblore
- Fletching
- Runecrafting
- Farming
- Thieving
- Agility

These skills would substantially increase the number of items, interfaces, recipes, and balance relationships.

## Level Progression

Each skill should have a maximum level of 99.

There should be five resource and tool tiers.

| Tier | Required Level |
|---|---:|
| 1 | 1 |
| 2 | 10 |
| 3 | 30 |
| 4 | 50 |
| 5 | 80 |

Better tools should:

- Increase gathering success
- Reduce time between gathering attempts
- Provide a small chance of gathering two resources
- Use visibly different inventory icons

The experience curve should become progressively slower.

The game should use an original exponential experience formula rather than copying RuneScape's exact formula.

## Inventory

The player should have a 24-slot inventory.

Gathered resources should stack to support AFK gameplay.

A stack could hold either 100 or 250 items before requiring another inventory slot.

Recommended inventory actions:

- Deposit all
- Deposit resources
- Withdraw one
- Withdraw ten
- Withdraw all
- Equip
- Use
- Drop

## Banking

The bank should have effectively unlimited storage in the first version.

The player should be able to:

- Deposit individual items
- Deposit all items
- Deposit all resources
- Withdraw items
- View item quantities
- Search or filter stored items if practical

## Economy

Resources can be sold to a merchant for coins.

Coins can be spent on:

- Better tools
- Basic combat equipment
- Inventory-capacity upgrades
- Permanent movement-speed upgrades
- Cosmetic clothing
- Fame

## Fame

Fame should be an expensive, nonfunctional prestige statistic.

Once the player owns the important upgrades, excess coins can be converted into fame.

Fame should:

- Provide no combat or gathering advantage
- Function as a flex statistic
- Create an indefinite endgame money sink
- Appear prominently in the interface
- Potentially unlock cosmetic milestones

## Combat System

Combat should remain simple.

The player clicks a monster, walks into range, and automatically attacks.

Each combatant should attack once every two seconds.

Possible enemy progression:

1. Cave Rat
2. Moss Creature
3. Ruin Guard
4. Stone Beast
5. Ancient Warden

All enemies should use the same underlying combat system.

Each enemy should be defined by data values for:

- Health
- Accuracy
- Maximum damage
- Defence
- Attack interval
- Respawn time
- Drop table
- Aggression behavior
- Experience reward

## Death

When the player dies:

- The player respawns in town
- Equipped tools and equipment are retained
- Unequipped inventory items are lost

Permanent inventory loss is easier to implement than a temporary grave system.

## Food and Healing

Fish should be consumable directly.

A separate Cooking skill should not be required in the first version.

Example healing values:

| Fish | Healing |
|---|---:|
| Minnow | 1 |
| Riverfish | 2 |
| Trout | 4 |
| Swordfish | 7 |
| Abyssal Eel | 10 |

The player should slowly regenerate health while outside combat.

This allows the player to recover without constant attention while keeping food useful.

## Tasks

Traditional quests should be replaced by a simple task board.

Example tasks:

- Gather 100 logs
- Mine 50 iron ore
- Catch 200 fish
- Defeat 25 cave creatures
- Reach level 30 Mining
- Purchase a Tier 3 tool
- Discover every major region

Tasks are easier to implement than quests because they do not require dialogue trees, scripted events, or complicated world-state changes.

Task rewards can include:

- Coins
- Experience
- Fame
- Cosmetic items
- Permanent inventory upgrades

## Achievements

Achievements should provide long-term goals.

Example achievements:

- Gather 10,000 logs
- Reach level 99 in a skill
- Obtain every tool
- Find every pet
- Defeat 1,000 monsters
- Accumulate one million fame
- Discover every region
- Complete every task

## Rare Drops

Rare drops should make repetitive actions more exciting.

Each gathering skill could contain:

- One cosmetic pet
- One rare resource
- One cosmetic tool variant
- One extremely rare valuable item

Pets should provide no statistical benefit.

They should simply follow the player on an adjacent tile.

Example pet rates could range from 1 in 1,000 to 1 in 10,000 successful actions, depending on action speed.

## Collection Log

The game should include a collection log showing discovered:

- Resources
- Enemies
- Pets
- Rare items
- Tools
- Equipment
- Fish
- Ores
- Logs

Undiscovered entries can appear as silhouettes or question marks.

## AFK-Friendly Mechanics

The game should calculate repeated actions using timestamps rather than relying entirely on live browser timers.

Browsers may slow or pause inactive tabs.

The game should record:

- When an action began
- The action interval
- The time of the last completed action
- Whether the resource still exists
- Whether the inventory has room
- Whether the player is still eligible to continue the action

When the tab becomes active again, the game should calculate how many actions should have occurred.

## Limits on Automation

The first version should not include:

- Automatic banking
- Automatic travel between resource nodes
- Automatic selling
- Automatic tool purchasing
- Fully offline progression while the game is closed

The game should remain a click-driven skilling game rather than becoming a fully passive idle game.

A reasonable interaction frequency would be once every five to fifteen minutes, depending on resource durability and stack sizes.

## Visual Direction

The game should use a top-down HTML canvas with simple geometric graphics.

Possible visual representations:

- Grass: green square
- Roads: tan square
- Water: blue square
- Mountains: gray square
- Trees: green circles above brown trunks
- Rocks: irregular gray polygons
- Fishing spots: animated white or blue pixels
- NPCs: colored humanoid shapes
- Player: simple sprite or colored figure
- Monsters: distinct geometric silhouettes

The player should move smoothly between tiles, but all underlying game logic should remain tile-based.

The game should avoid:

- Detailed 3D rendering
- Complex lighting
- Expensive particle systems
- Large sprite sheets
- Detailed animation
- Heavy visual effects

## Interface Layout

A practical desktop interface should include:

- Main game canvas in the center
- Minimap in the upper-right
- Skill levels near the minimap
- Inventory on the right
- Equipment panel on the right
- Chat and action log along the bottom
- Current action display
- Current action progress bar
- Health bar
- Bank modal
- Shop modal
- Task board modal
- Collection log modal
- Settings panel
- Save controls

## Action Log

The chat area does not need multiplayer chat.

It should display system messages such as:

> You receive an Iron Ore.

> Your Mining level is now 31.

> The Ancient Tree has been depleted.

> You found a rare Forest Sprite pet.

## Saving

The game should use LocalStorage.

It should save:

- Player position
- Skill levels
- Skill experience
- Inventory
- Bank
- Equipment
- Coins
- Fame
- Tool ownership
- Tasks
- Achievements
- Collection log
- Pets
- Settings
- Resource respawn states
- Enemy respawn states

The game should also support:

- Exporting save data as text or a file
- Importing save data
- Resetting the save after confirmation

## Sound

Sound should be minimal and optional.

Possible sounds:

- Movement click
- Gathering action
- Level-up
- Rare drop
- Combat hit
- Player death

There should be a clear mute option.

## Features Excluded From the First Build

The following features should not be included in the first Codex build:

- Multiplayer
- User accounts
- Servers
- Databases
- Player trading
- Procedurally generated maps
- Complex quests
- Crafting production chains
- Magic
- Ranged combat
- Multiple combat styles
- Equipment degradation
- NPC schedules
- Dynamic economies
- Multiple floors
- Separate world maps
- Online leaderboards
- Real-money purchases
- Complex mobile optimization

These features can be considered later, but the first build should prioritize a complete and functioning game.

## Recommended First-Build Scope

The initial version should contain:

- One handcrafted 100×100 map
- Click-to-move controls
- A* pathfinding
- Click-to-interact behavior
- Woodcutting
- Mining
- Fishing
- Combat
- Constitution
- Five resource tiers per gathering skill
- Five tool tiers
- Five enemy types
- One bank
- One shop
- One task board
- Inventory
- Equipment
- Coins
- Fame
- Experience
- Levels
- Resource depletion
- Resource respawning
- Monster drops
- Food
- Healing
- Three cosmetic pets
- Collection log
- Achievements
- LocalStorage saving
- Save import
- Save export
- Minimal sound
- Mute option
- No backend
- No installation process

## Technical Structure

The simplest reliable implementation should use:

- HTML
- CSS
- Vanilla JavaScript
- HTML canvas
- LocalStorage
- No build system
- No framework
- No server
- No external database

The game should be able to run by opening `index.html` or through a simple static local server.

The map, items, resources, enemies, tasks, tools, and progression values should be stored in structured JavaScript data objects.

This will allow later expansion without requiring the game engine to be rewritten.

## Development Philosophy

The first build should focus on a complete gameplay loop rather than feature count.

The highest priorities should be:

1. Reliable movement
2. Reliable interaction
3. Satisfying gathering
4. Clear progression
5. Stable saving
6. Smooth performance
7. Expandable data structures

The final result should feel like a small but real skilling RPG rather than an incomplete attempt to recreate a full MMORPG.
