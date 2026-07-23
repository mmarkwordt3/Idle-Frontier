const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const CONFIG = { W: 100, H: 100 };
const Game = {
  state: { player: { x: 50, y: 50 } },
  objects: [],
  enemies: [],
  map: Array.from({ length: 100 }, () => Array.from({ length: 100 }, () => 'grass')),
};

function blocked(x, y) {
  if (x < 0 || y < 0 || x >= CONFIG.W || y >= CONFIG.H) return true;
  if (Game.map[y][x] === 'wall') return true;
  return Game.objects.some((object) => object.x === x && object.y === y && object.active !== false) ||
    Game.enemies.some((enemy) => enemy.x === x && enemy.y === y && enemy.hp > 0);
}

const context = { CONFIG, Game, blocked, console };
vm.createContext(context);
vm.runInContext(fs.readFileSync('js/pathfinding.js', 'utf8'), context);

function assertValidPath(path, start) {
  for (const step of path) {
    assert.strictEqual(blocked(step.x, step.y), false, `Path step ${step.x},${step.y} is blocked`);
  }
  assert(path.length === 0 || path[0].x !== start.x || path[0].y !== start.y, 'Path should not include the starting tile');
}

let path = context.astar({ x: 50, y: 50 }, { x: 53, y: 50 });
assert(Array.isArray(path), 'Nearby path should exist');
assert.strictEqual(path.at(-1).x, 53, 'Path should end on requested x');
assert.strictEqual(path.at(-1).y, 50, 'Path should end on requested y');
assertValidPath(path, { x: 50, y: 50 });

path = context.astar({ x: 50, y: 50 }, { x: 50, y: 50 });
assert(Array.isArray(path), 'Current tile path should be an array');
assert.strictEqual(path.length, 0, 'Current tile path should be empty');

for (let y = 45; y <= 55; y += 1) Game.map[y][51] = 'wall';
Game.map[55][51] = 'grass';
path = context.astar({ x: 50, y: 50 }, { x: 52, y: 50 });
assert(Array.isArray(path), 'A path around an obstacle should exist');
assert.strictEqual(path.at(-1).x, 52);
assert.strictEqual(path.at(-1).y, 50);
assertValidPath(path, { x: 50, y: 50 });

Game.map[10][11] = 'wall';
Game.map[10][9] = 'wall';
Game.map[11][10] = 'wall';
Game.map[9][10] = 'wall';
assert.strictEqual(context.astar({ x: 50, y: 50 }, { x: 10, y: 10 }), null, 'Sealed destination should be unreachable');

Game.state.player = { x: 50, y: 50 };
Game.objects = [{ id: 'resource_test', x: 52, y: 50, active: true }];
const adjacent = context.adjacentTarget(Game.objects[0]);
assert(adjacent, 'adjacentTarget should return a reachable tile');
assert.strictEqual(Math.abs(adjacent.x - 52) + Math.abs(adjacent.y - 50), 1, 'Target should be orthogonally adjacent');
assert(Array.isArray(context.astar(Game.state.player, adjacent)), 'Returned adjacent tile should be reachable');

console.log('Pathfinding tests passed');
