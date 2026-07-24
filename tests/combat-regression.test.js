const assert = require('assert'), fs = require('fs'), vm = require('vm');

class El { constructor() { this.style = {}; this.classList = { add(){}, remove(){}, toggle(){} }; this.innerHTML = ''; } }
const elements = {}, logs = [], moves = [], sounds = [];
const context = {
  console,
  Date,
  performance: { now: () => 1234 },
  document: { getElementById: id => elements[id] || (elements[id] = new El()) },
  localStorage: { getItem(){ return null; }, setItem(){} },
  confirm: () => true,
};
context.window = context;
context.Math = Object.create(Math);
vm.createContext(context);
['js/config.js','js/data.js','js/state.js','js/collection-log.js','js/inventory.js','js/pity.js','js/forge.js','js/map.js','js/player.js','js/combat.js','js/input.js'].forEach(f => vm.runInContext(fs.readFileSync(f, 'utf8'), context, { filename: f }));
context.sound = id => sounds.push(id);
context.logMsg = (m, c = '') => logs.unshift({ m, c });
context.saveGame = () => { context.saved = true; };
const Game = vm.runInContext('Game', context), ENEMIES = vm.runInContext('ENEMIES', context);

function reset() {
  Game.state = context.newState();
  Game.enemies = [];
  logs.length = 0;
  moves.length = 0;
  sounds.length = 0;
  context.saved = false;
  context.Math.random = Math.random;
}

['clickEnemy','startFight','updateCombat','die','float'].forEach(name => assert.strictEqual(typeof context[name], 'function', `${name} should be defined`));
assert(fs.readFileSync('js/input.js', 'utf8').includes('clickEnemy(enemy)'), 'input enemy click path should call clickEnemy(enemy)');

reset();
let adjacentCalled = false;
const enemy = { uid: 'rat-1', defId: 'cave_rat', x: 12, y: 12, hp: 10 };
context.adjacentTarget = target => { adjacentCalled = target === enemy; return { x: 12, y: 13 }; };
context.moveTo = (x, y, after) => { moves.push({ x, y, after }); };
context.clickEnemy(enemy);
assert(adjacentCalled, 'adjacentTarget(enemy) should be called');
assert.strictEqual(moves.length, 1);
assert.deepStrictEqual({ x: moves[0].x, y: moves[0].y }, { x: 12, y: 13 });
assert.strictEqual(typeof moves[0].after, 'function');
moves[0].after();
assert.strictEqual(Game.state.action.type, 'fighting');
assert.strictEqual(Game.state.action.target, enemy.uid);
assert.strictEqual(Game.state.action.progress, 0);
assert.strictEqual(typeof Game.state.action.pLast, 'number');
assert.strictEqual(typeof Game.state.action.eLast, 'number');
assert(logs.some(l => l.m === 'Engaging Cave Rat.'));

reset();
context.startFight(enemy);
assert.strictEqual(Game.state.action.type, 'fighting');
assert.strictEqual(Game.state.action.target, enemy.uid);
assert.strictEqual(Game.state.action.progress, 0);
assert.strictEqual(Game.state.action.pLast, 1234);
assert.strictEqual(Game.state.action.eLast, 1234);

reset();
const retaliator = { uid: 'rat-2', defId: 'cave_rat', x: 14, y: 14, hp: 10 };
Game.enemies = [retaliator];
Game.state.action = { type: 'fighting', target: retaliator.uid, pLast: 5000, eLast: 5000, progress: 0 };
Game.state.player.hp = 12;
Game.state.equipment.armor = 'cloth_vest';
let randoms = [0.99, 0]; // player misses, enemy hits for 1
context.Math.random = () => randoms.shift() ?? 0;
context.updateCombat(7000);
assert.strictEqual(Game.state.action.eLast, 7000, 'enemy attack timer should advance');
assert.strictEqual(Game.state.player.hp, 11, 'enemy retaliation should damage the player');
assert(logs.some(l => l.m === 'Cave Rat hits you for 1.'), 'enemy hit should be logged');

reset();
context.float(1, 2, '-3');
assert.strictEqual(JSON.stringify(Game.state.floating), JSON.stringify([{ x: 1, y: 2, text: '-3', life: 900 }]));
Game.state.settings.hideSplats = true;
context.float(3, 4, 'miss');
assert.strictEqual(Game.state.floating.length, 1);

reset();
Game.state.inventory = [{ id: 'coins', qty: 10 }];
Game.state.bank = { rat_charm: 1 };
Game.state.action = { type: 'fighting', target: 'rat-3' };
Game.state.player.x = Game.state.player.px = 7;
Game.state.player.y = Game.state.player.py = 8;
context.die();
assert.strictEqual(JSON.stringify(Game.state.inventory), JSON.stringify([]));
assert.strictEqual(Game.state.player.x, context.CONFIG.START.x);
assert.strictEqual(Game.state.player.px, context.CONFIG.START.x);
assert.strictEqual(Game.state.player.y, context.CONFIG.START.y);
assert.strictEqual(Game.state.player.py, context.CONFIG.START.y);
assert.strictEqual(Game.state.player.hp, Math.ceil(context.maxHp() / 2));
assert.strictEqual(Game.state.action.type, 'idle');
assert.strictEqual(JSON.stringify(Game.state.bank), JSON.stringify({ rat_charm: 1 }));
assert(logs.some(l => l.m === 'You died, returned to settlement, and lost inventory.' && l.c === 'bad'));
assert.strictEqual(context.saved, true);

reset();
context.normalizeEnemyDropPity();
let drop = ENEMIES.find(e => e.id === 'cave_rat').drops.find(d => d.id === 'rat_charm');
context.Math.random = () => 0.99;
let roll = context.rollEnemyDrop('cave_rat', drop);
assert.strictEqual(roll.dropped, false);
assert.strictEqual(Game.state.pity.enemyDrops['cave_rat:rat_charm'], 1);
Game.state.pity.enemyDrops['cave_rat:rat_charm'] = 383;
Game.state.inventory = Array.from({ length: Game.state.invCap }, () => ({ id: 'brushwood', qty: 1 }));
roll = context.rollEnemyDrop('cave_rat', drop);
assert.strictEqual(roll.dropped, true);
let delivered = context.addItem(drop.id, 1);
context.settleEnemyDropRoll(roll, delivered);
assert.strictEqual(delivered, false);
assert.strictEqual(Game.state.pity.enemyDrops['cave_rat:rat_charm'], 384);
roll = context.rollEnemyDrop('cave_rat', drop);
assert.strictEqual(roll.dropped, true);
Game.state.inventory.pop();
delivered = context.addItem(drop.id, 1);
context.settleEnemyDropRoll(roll, delivered);
assert.strictEqual(Game.state.pity.enemyDrops['cave_rat:rat_charm'], 0);
let coins = ENEMIES.find(e => e.id === 'cave_rat').drops.find(d => d.id === 'coins');
context.Math.random = () => 0.99;
roll = context.rollEnemyDrop('cave_rat', coins);
assert.strictEqual(roll.eligible, false);
assert.strictEqual(roll.dropped, true);
let pet = ENEMIES.find(e => e.id === 'ruin_guard').drops.find(d => d.id === 'rubble_imp');
roll = context.rollEnemyDrop('ruin_guard', pet);
assert.strictEqual(roll.eligible, false);

console.log('Combat regression tests passed');
