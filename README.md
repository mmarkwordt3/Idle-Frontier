# Idle Frontier

Idle Frontier is an original static browser RPG about long-term gathering, combat, banking, shopping, collection logs, pets, and prestige Fame. It uses only HTML, CSS, vanilla JavaScript, canvas, Web Audio, and LocalStorage.

## Core gameplay loop

Click a tile to walk through the 100×100 handcrafted world. Click a tree, rock, fishing spot, enemy, or settlement building to pathfind beside it and interact. Gather resources, gain experience, bank or sell items, buy better tools and gear, complete tasks, unlock achievements, find rare drops and cosmetic pets, and convert surplus wealth into Fame.

## Controls

- Left-click ground: cancel current activity and move there.
- Left-click resources: walk adjacent and repeatedly gather until depletion, full inventory, or interruption.
- Left-click enemies: walk into melee range and auto-fight.
- Left-click buildings: open bank/shop/tasks or use the fountain/monument.
- Inventory item buttons: select an item, then equip, use, or drop it.

## Skills and resources

Skills cap at level 99 and use an original nonlinear experience curve. Gathering tiers unlock at levels 1, 10, 30, 50, and 80.

| Skill | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Tier 5 |
| --- | --- | --- | --- | --- | --- |
| Woodcutting | Brushwood | Pine | Oak | Ironwood | Ancient Tree |
| Mining | Stone | Copper | Iron | Silver | Starstone |
| Fishing | Minnows | Riverfish | Trout | Swordfish | Abyssal Eels |

Each gathering skill has five original tool tiers. Better tools are purchased from the merchant, require the relevant skill level, gather faster, improve success chance, and slightly increase double-yield chance.

## Combat and healing

Northern ruins contain Cave Rats, Moss Creatures, Ruin Guards, Stone Beasts, and Ancient Wardens. Combat is automatic melee with simple accuracy, defence, max-hit, attack timer, respawn, combat XP, constitution XP, and drops. Constitution raises maximum health. Fish are edible food: Minnows heal 1, Riverfish 2, Trout 4, Swordfish 7, and Abyssal Eels 10. The settlement fountain restores full health. Death returns the player to town, restores partial health, keeps equipped gear, and removes unequipped inventory items.

## Banking, economy, and Fame

The bank has unlimited distinct item storage with deposit one/ten/all, deposit inventory, deposit resources, withdraw one/ten/all, and search. The merchant buys resources and ordinary drops and sells tools, melee gear, inventory upgrades, movement upgrades, cosmetics, and Fame packages. Fame is a prestige-only currency with no gameplay advantage and is saved, displayed, tracked by tasks, and used by achievements.

## Tasks and achievements

The task board tracks gathering totals, levels, kills, tool ownership, region discovery, coin earning, Fame purchasing, pet discovery, and task completion. Achievements are separate long-term milestones for 10,000 resources, level 99, every tool, every pet, 1,000 monsters, all regions, one million Fame, and every task.

## Pets, rare drops, and collection log

Woodcutting, Mining, Fishing, and combat can award cosmetic pets and rare items from centralized drop tables. Pets provide no numeric benefits and follow beside the player without blocking movement. Duplicate pet drops are recorded as duplicate counts in the pet data/collection log rather than granting power. The collection log contains Logs, Ores, Fish, Enemies, Tools, Equipment, Pets, and Rare items; undiscovered entries appear as question marks.

## Saving

Progress is stored in versioned LocalStorage and includes position, health, skills, inventory, bank, equipment, coins, Fame, upgrades, pets, tasks, achievements, collection, respawns, discovered regions, settings, and timestamps. The game autosaves, has a manual save button, and the Settings panel supports export/import/reset. Import validation rejects malformed save text; reset requires confirmation.

## Local launch

Run a static server from the repository root:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`. Relative paths are used, so the same files also work on GitHub Pages.

## GitHub Pages deployment

A workflow is included at `.github/workflows/deploy-pages.yml`. It uses the official GitHub Pages actions to upload the repository as a static artifact without a build step. One-time repository setting: in GitHub, enable Pages with **Source: GitHub Actions** if it is not already enabled.

## File structure

```text
index.html                 App shell and script loading
styles.css                 Frontier-themed responsive UI
.nojekyll                  Disables Jekyll processing on Pages
assets/                    Placeholder for original static assets
js/config.js               Constants and XP curve
js/data.js                 Items, resources, enemies, shop data
js/state.js                Saveable state and shared helpers
js/map.js                  Deterministic 100×100 world and spawns
js/pathfinding.js          A* and interaction tile selection
js/player.js               Movement and action state transitions
js/actions.js              Gathering, respawns, rare drops
js/combat.js               Melee combat, drops, death
js/inventory.js            Item stack/equip/use/drop logic
js/bank.js                 Bank modal and transfers
js/shop.js                 Buying, selling, Fame conversion
js/tasks.js                Task definitions and claims
js/achievements.js         Long-term achievements
js/collection-log.js       Discovery and collection categories
js/save.js                 LocalStorage save/import/export/reset
js/ui.js                   DOM panels and modals
js/input.js                Canvas and button input
js/renderer.js             Canvas world/minimap drawing
js/main.js                 Main loop and audio
.github/workflows/         GitHub Pages deployment
```

## Known limitations

- Art is intentionally simple geometric canvas drawing.
- No offline closed-browser progression is granted; active-tab/background catch-up is capped.
- The first version has one map, melee-only combat, no crafting chains, no accounts, and no multiplayer.
- Browser automation was not required by the game itself; if unavailable, syntax/static checks and local serving are the expected verification path.

## Future expansion ideas

Cooking, crafting, more maps, story tasks, additional cosmetic collections, richer enemy abilities, optional accessibility themes, and more settlement NPC flavor can be added later without changing the static architecture.

## Originality

All game names, data definitions, visual style, UI implementation, generated sounds, and systems in this repository are original for Idle Frontier. No copyrighted game assets, external engines, CDN libraries, backend services, or API keys are used.
