const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const context = {
  console,
  performance: { now: () => 1000 },
  document: {},
  Math,
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
context.Game.map = context.makeMap();
context.spawnObjects();
context.setAction = (action) => { context.Game.state.action = action; };
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
const brushwoodResource = context.RESOURCES.woodcutting.find((resource) => resource.id === 'brushwood');
assert.strictEqual(brushwoodResource.deplete, 0.006, 'Brushwood depletion should be 0.006');
assert.strictEqual(brushwoodItem.value, 2, 'Brushwood sale value should be 2');

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

console.log('Gathering balance tests passed');

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
