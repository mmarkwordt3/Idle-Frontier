const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const random = { values: [], calls: 0 };
const math = Object.create(Math);
math.random = () => {
  random.calls += 1;
  return random.values.length ? random.values.shift() : 0.999;
};

const context = { console, Math: math, Date, performance: { now: () => 0 }, document: {} };
context.window = context;
vm.createContext(context);
for (const file of ['js/config.js', 'js/data.js', 'js/state.js', 'js/actions.js', 'js/save.js']) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
}

context.Game = vm.runInContext('Game', context);
context.ITEM = vm.runInContext('ITEM', context);
context.RESOURCES = vm.runInContext('RESOURCES', context);
context.ENEMIES = vm.runInContext('ENEMIES', context);
context.SKILL_PET_EXPECTED_LEVEL = vm.runInContext('SKILL_PET_EXPECTED_LEVEL', context);
context.skillPetChance = vm.runInContext('skillPetChance', context);
context.SKILL_PETS = vm.runInContext('SKILL_PETS', context);
context.newState = vm.runInContext('newState', context);
context.updateAction = vm.runInContext('updateAction', context);
context.loadGame = vm.runInContext('loadGame', context);
context.itemDef = (id) => context.ITEM[id];
context.resDef = (id) => Object.values(context.RESOURCES).flat().find((resource) => resource.id === id);
context.setAction = (action) => { context.Game.state.action = action; };
context.hasSpaceFor = () => true;
context.addItem = (id, qty) => { context.Game.state.inventory.push({ id, qty }); };
context.discover = (id) => { context.Game.state.collection[id] = (context.Game.state.collection[id] || 0) + 1; };
context.sound = (kind) => { context.Game.lastSound = kind; };
context.maxHp = () => 12;

assert.strictEqual(context.SKILL_PET_EXPECTED_LEVEL, 92, 'Skilling pets should target level 92');
assert.strictEqual(context.xpForLevel(context.SKILL_PET_EXPECTED_LEVEL), 1036744, 'Level 92 XP should be the skilling-pet expectation');
assert.strictEqual(context.SKILL_PETS.woodcutting, 'forest_sprite');
assert.strictEqual(context.SKILL_PETS.mining, 'ore_mite');
assert.strictEqual(context.SKILL_PETS.fishing, 'tide_pup');

const resource = (skill, id) => context.RESOURCES[skill].find((entry) => entry.id === id);
const chance = (skill, id) => context.skillPetChance(resource(skill, id).xp);
assert(chance('woodcutting', 'ancient_tree') > chance('woodcutting', 'brushwood'), 'Higher-XP woodcutting resources should have higher pet chance');
assert(chance('mining', 'starstone') > chance('mining', 'stone'), 'Higher-XP mining resources should have higher pet chance');
assert(chance('fishing', 'abyssal_eels') > chance('fishing', 'minnows'), 'Higher-XP fishing resources should have higher pet chance');
assert(chance('woodcutting', 'brushwood') < chance('woodcutting', 'ancient_tree'), 'Brushwood should have a lower per-action pet chance than Ancient Trees');
assert(chance('mining', 'stone') < chance('mining', 'starstone'), 'Stone should have a lower per-action pet chance than Starstone');
assert(chance('fishing', 'minnows') < chance('fishing', 'abyssal_eels'), 'Minnows should have a lower per-action pet chance than Abyssal Eels');

const expectedXp = context.xpForLevel(92);
const brushwoodCumulative = 1 - Math.pow(1 - chance('woodcutting', 'brushwood'), expectedXp / resource('woodcutting', 'brushwood').xp);
const ancientTreeCumulative = 1 - Math.pow(1 - chance('woodcutting', 'ancient_tree'), expectedXp / resource('woodcutting', 'ancient_tree').xp);
assert(Math.abs(brushwoodCumulative - ancientTreeCumulative) < 1e-10, 'Equal total XP should produce approximately equal cumulative pet odds across resource tiers');
assert(Math.abs(brushwoodCumulative - (1 - Math.exp(-1))) < 1e-10, 'Expected XP threshold should have about 63.2% cumulative probability');

for (const resources of Object.values(context.RESOURCES)) {
  for (const entry of resources) {
    const expectedDrops = [
      [entry.skill === 'woodcutting' ? 'amber_seed' : entry.skill === 'mining' ? 'crystal_gem' : 'sunken_relic', 0.02],
      [entry.skill === 'woodcutting' ? 'golden_bough' : entry.skill === 'mining' ? 'meteor_core' : 'pearl_hook', 0.002],
    ];
    assert.strictEqual(JSON.stringify(entry.rare.map((drop) => [drop.id, drop.rate])), JSON.stringify(expectedDrops), 'Other gathering rare drops should retain existing rates without fixed pet drops');
  }
}

const ruinGuard = context.ENEMIES.find((enemy) => enemy.id === 'ruin_guard');
const stoneBeast = context.ENEMIES.find((enemy) => enemy.id === 'stone_beast');
const ancientWarden = context.ENEMIES.find((enemy) => enemy.id === 'ancient_warden');
assert.strictEqual(ruinGuard.drops.find((drop) => drop.id === 'rubble_imp').rate, 0.0025, 'Rubble Imp should be 0.0025 from Ruin Guards');
assert.strictEqual(stoneBeast.drops.find((drop) => drop.id === 'rubble_imp').rate, 0.0025, 'Rubble Imp should be 0.0025 from Stone Beasts');
assert.strictEqual(ancientWarden.drops.find((drop) => drop.id === 'warden_echo').rate, 0.005, 'Warden Echo should be 0.005');
assert(context.ENEMIES.filter((enemy) => enemy.id !== 'ancient_warden').every((enemy) => !enemy.drops.some((drop) => drop.id === 'warden_echo')), 'Warden Echo should remain exclusive to Ancient Wardens');

context.Game.state = context.newState();
context.Game.objects = [{ id: 'brushwood_node', defId: 'brushwood', active: true }];
context.Game.state.action = { type: 'gathering', target: 'brushwood_node', last: 0, progress: 0 };
random.values = [0.999, 0.999, 0.999];
random.calls = 0;
context.updateAction(1700);
assert(!context.Game.state.pets.owned.forest_sprite, 'Failed gathering actions should not roll skilling pets');
assert.strictEqual(random.calls, 2, 'Failed gathering should only roll success and depletion checks');

context.Game.state = context.newState();
context.Game.objects = [{ id: 'brushwood_node', defId: 'brushwood', active: true }];
context.Game.state.action = { type: 'gathering', target: 'brushwood_node', last: 0, progress: 0 };
random.values = [0, 0.999, 0.999, 0.999, 0, 0.999];
random.calls = 0;
context.updateAction(1700);
assert(context.Game.state.pets.owned.forest_sprite, 'Successful gathering actions should roll and award skilling pets');
assert.strictEqual(context.Game.state.pets.active, 'forest_sprite', 'Awarded pet should become active');
assert.strictEqual(context.Game.state.collection.forest_sprite, 1, 'Awarded pet should update the collection log');

context.awardPet('forest_sprite');
assert.strictEqual(context.Game.state.pets.dupes.forest_sprite, 1, 'Duplicate-pet tracking should increment duplicate count');

const saved = context.newState();
saved.pets.owned.forest_sprite = true;
saved.pets.dupes.forest_sprite = 2;
saved.pets.active = 'forest_sprite';
context.localStorage = { getItem: () => JSON.stringify({ v: context.CONFIG.SAVE_VERSION, state: saved }) };
context.Game.state = context.newState();
context.Game.objects = [];
context.Game.enemies = [];
context.loadGame();
assert.strictEqual(context.Game.state.pets.owned.forest_sprite, true, 'Existing owned pets should survive save loading');
assert.strictEqual(context.Game.state.pets.dupes.forest_sprite, 2, 'Existing duplicate-pet counts should survive save loading');
assert.strictEqual(context.Game.state.pets.active, 'forest_sprite', 'Existing active pet should survive save loading');

console.log('Pet balance tests passed');
