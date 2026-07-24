const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const random = { values: [], calls: 0 };
const math = Object.create(Math);
math.random = () => {
  random.calls += 1;
  return random.values.length ? random.values.shift() : 0.999;
};

const context = {
  console,
  performance: { now: () => 1000 },
  document: {},
  Math: math,
  Date,
};
context.window = context;
vm.createContext(context);
for (const file of ['js/config.js', 'js/data.js', 'js/state.js', 'js/map.js', 'js/pathfinding.js', 'js/input.js', 'js/actions.js']) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
}

context.Game = vm.runInContext('Game', context);
context.ITEM = vm.runInContext('ITEM', context);
context.RESOURCES = vm.runInContext('RESOURCES', context);
context.itemDef = (id) => context.ITEM[id];
context.Game.map = context.makeMap();
context.spawnObjects();
context.setAction = (action) => { context.Game.state.action = action; };
context.hasSpaceFor = () => true;
context.moveTo = (x, y, after) => {
  context.Game.state.player.x = x;
  context.Game.state.player.y = y;
  if (typeof after === 'function') after();
  return true;
};
context.openBank = () => {};
context.openShop = () => {};
context.openTasks = () => {};
context.maxHp = () => 12;

const brushwoodItem = context.ITEM.brushwood;
assert.strictEqual(brushwoodItem.value, 2, 'Brushwood sale value should be 2');

assertResourceBalance(context.RESOURCES.woodcutting, [
  ['brushwood', 0.006, 12000],
  ['pine', 0.006, 18000],
  ['oak', 0.006, 30000],
  ['ironwood', 0.006, 45000],
  ['ancient_tree', 0.007, 80000],
]);
assertResourceBalance(context.RESOURCES.mining, [
  ['stone', 0.006, 12000],
  ['copper', 0.006, 18000],
  ['iron', 0.006, 32000],
  ['silver', 0.006, 48000],
  ['starstone', 0.007, 90000],
]);
assertResourceBalance(context.RESOURCES.fishing, [
  ['minnows', 0.006, 10000],
  ['riverfish', 0.006, 16000],
  ['trout', 0.006, 28000],
  ['swordfish', 0.006, 42000],
  ['abyssal_eels', 0.007, 85000],
]);

const woodNodes = context.Game.objects.filter((object) => object.kind === 'resource' && context.resDef(object.defId).skill === 'woodcutting');
const tierOneAvgX = average(woodNodes.filter((node) => context.resDef(node.defId).tier === 1).map((node) => node.x));
const tierFiveAvgX = average(woodNodes.filter((node) => context.resDef(node.defId).tier === 5).map((node) => node.x));
assert(tierOneAvgX > tierFiveAvgX, 'Tier 1 woodcutting resources should be closer to town than tier 5 resources');

const occupied = new Set();
for (const node of woodNodes) {
  const key = `${node.x},${node.y}`;
  assert(!occupied.has(key), `Woodcutting node overlaps at ${key}`);
  occupied.add(key);
  assert.strictEqual(context.Game.map[node.y][node.x], 'forest', `${node.defId} should spawn on forest terrain`);
  assert(context.adjacentTarget(node), `${node.defId} should have a reachable adjacent tile`);
}

const brushwoodNode = woodNodes.find((node) => context.resDef(node.defId).tier === 1);
let info = context.getHoverInfo({ type: 'resource', target: brushwoodNode });
assert.strictEqual(info.title, 'Brushwood');
assert(info.lines.includes('Woodcutting level 1'), 'Hover should show Brushwood level requirement');

const pineNode = woodNodes.find((node) => context.resDef(node.defId).id === 'pine');
info = context.getHoverInfo({ type: 'resource', target: pineNode });
assert.strictEqual(info.title, 'Pine');
assert.strictEqual(info.locked, true, 'Pine should be locked at Woodcutting level 1');
assert(info.lines.includes('Requires Woodcutting level 10'), 'Locked hover should show requirement');

context.Game.state.log = [];
context.clickObject(pineNode);
assert(context.Game.state.log[0].t.includes('Requires Woodcutting level 10 to gather Pine.'), 'Locked click should log requirement');

context.Game.state.log = [];
context.clickObject(brushwoodNode);
assert.strictEqual(context.Game.state.action.type, 'gathering', 'Unlocked resource should begin gathering after movement callback');
assert(context.Game.state.log.some((entry) => entry.t === 'Walking to Brushwood.'), 'Unlocked click should log walking message');
assert(context.Game.state.log.some((entry) => entry.t === 'Started gathering Brushwood.'), 'Unlocked click should log gathering start');

context.Game.state = context.newState();
context.Game.objects = [{ id: 'stone_node', defId: 'stone', active: true }];
context.Game.state.action = { type: 'gathering', target: 'stone_node', last: 0, progress: 0 };
random.values = [0.999, 0];
random.calls = 0;
context.updateAction(1800);
assert.strictEqual(context.Game.objects[0].active, false, 'Gathering should deactivate a node when its depletion roll succeeds');
assert.strictEqual(context.Game.state.action.type, 'idle', 'Gathering should stop when a node depletes');
assert.strictEqual(random.calls, 2, 'Gathering should roll depletion once for an attempted action even when gathering fails');

const respawnAt = Date.now() - 1;
context.Game.objects[0].respawnAt = respawnAt;
context.Game.state.resources.stone_node = respawnAt;
context.updateRespawns();
assert.strictEqual(context.Game.objects[0].active, true, 'Depleted nodes should reactivate after their respawn time');
assert.strictEqual(context.Game.objects[0].respawnAt, 0, 'Reactivated nodes should clear their respawn timestamp');
assert.strictEqual(context.Game.state.resources.stone_node, undefined, 'Reactivated nodes should clear saved respawn state');

console.log('Gathering balance tests passed');

function assertResourceBalance(resources, expected) {
  for (const [id, deplete, respawn] of expected) {
    const resource = resources.find((entry) => entry.id === id);
    assert(resource, `${id} should be defined`);
    assert.strictEqual(resource.deplete, deplete, `${resource.name} depletion should be ${deplete}`);
    assert.strictEqual(resource.respawn, respawn, `${resource.name} respawn should remain ${respawn}`);
  }
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
