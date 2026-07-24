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

function resetWorld() {
  Game.state.player = { x: 50, y: 50 };
  Game.objects = [];
  Game.enemies = [];
  Game.map = Array.from({ length: 100 }, () => Array.from({ length: 100 }, () => 'grass'));
}

function approx(actual, expected, message) {
  assert(Math.abs(actual - expected) < 0.000001, `${message}: expected ${expected}, got ${actual}`);
}

function travelCost(start, path) {
  let cost = 0;
  let previous = start;
  for (const step of path) {
    const dx = Math.abs(step.x - previous.x);
    const dy = Math.abs(step.y - previous.y);
    cost += dx === 1 && dy === 1 ? Math.SQRT2 : 1;
    previous = step;
  }
  return cost;
}

function diagonalSteps(start, path) {
  let count = 0;
  let previous = start;
  for (const step of path) {
    if (Math.abs(step.x - previous.x) === 1 && Math.abs(step.y - previous.y) === 1) {
      count += 1;
    }
    previous = step;
  }
  return count;
}

function hasStep(path, x, y) {
  return path.some((step) => step.x === x && step.y === y);
}

function assertValidPath(path, start, allowBlockedGoal = null) {
  let previous = start;
  for (const step of path) {
    const dx = step.x - previous.x;
    const dy = step.y - previous.y;
    assert(Math.abs(dx) <= 1, `Step ${previous.x},${previous.y} to ${step.x},${step.y} moves too far on x`);
    assert(Math.abs(dy) <= 1, `Step ${previous.x},${previous.y} to ${step.x},${step.y} moves too far on y`);
    assert(dx !== 0 || dy !== 0, `Step ${step.x},${step.y} does not move`);
    assert(
      !blocked(step.x, step.y) || (allowBlockedGoal && step.x === allowBlockedGoal.x && step.y === allowBlockedGoal.y),
      `Path step ${step.x},${step.y} is blocked`,
    );
    if (Math.abs(dx) === 1 && Math.abs(dy) === 1) {
      approx(Math.SQRT2, Math.SQRT2, 'Diagonal step cost should be SQRT2');
      assert.strictEqual(blocked(previous.x + dx, previous.y), false, 'Diagonal side x tile should be open');
      assert.strictEqual(blocked(previous.x, previous.y + dy), false, 'Diagonal side y tile should be open');
    } else {
      approx(1, 1, 'Cardinal step cost should be 1');
    }
    previous = step;
  }
  assert(path.length === 0 || path[0].x !== start.x || path[0].y !== start.y, 'Path should not include the starting tile');
}

resetWorld();
let path = context.astar({ x: 50, y: 50 }, { x: 53, y: 50 });
assert(Array.isArray(path), 'Nearby path should exist');
assert.strictEqual(path.at(-1).x, 53, 'Path should end on requested x');
assert.strictEqual(path.at(-1).y, 50, 'Path should end on requested y');
assertValidPath(path, { x: 50, y: 50 });

path = context.astar({ x: 50, y: 50 }, { x: 50, y: 50 });
assert(Array.isArray(path), 'Current tile path should be an array');
assert.strictEqual(path.length, 0, 'Current tile path should be empty');

resetWorld();
for (let y = 45; y <= 55; y += 1) Game.map[y][51] = 'wall';
Game.map[55][51] = 'grass';
path = context.astar({ x: 50, y: 50 }, { x: 52, y: 50 });
assert(Array.isArray(path), 'A path around an obstacle should exist');
assert.strictEqual(path.at(-1).x, 52);
assert.strictEqual(path.at(-1).y, 50);
assertValidPath(path, { x: 50, y: 50 });

resetWorld();
Game.map[10][11] = 'wall';
Game.map[10][9] = 'wall';
Game.map[11][10] = 'wall';
Game.map[9][10] = 'wall';
assert.strictEqual(context.astar({ x: 50, y: 50 }, { x: 10, y: 10 }), null, 'Sealed destination should be unreachable');

resetWorld();
Game.objects = [{ id: 'blocked_goal', x: 0, y: 0, active: true }];
assert.strictEqual(context.astar({ x: 1, y: 1 }, { x: 0, y: 0 }), null, 'Blocked goal should fail without allowance');
assert.strictEqual(context.astar({ x: 1, y: 1 }, { x: 0, y: 0 }, true).length, 1, 'Blocked goal allowance should allow goal tile');
Game.map[0][1] = 'wall';
Game.map[1][0] = 'wall';
assert.strictEqual(context.astar({ x: 1, y: 1 }, { x: 0, y: 0 }, true), null, 'Blocked side tiles should prevent diagonal allowGoal corner cutting');
assert.strictEqual(context.astar({ x: -1, y: 0 }, { x: 0, y: 0 }), null, 'Out-of-bounds start should fail');
assert.strictEqual(context.astar({ x: 0, y: 0 }, { x: 100, y: 0 }), null, 'Out-of-bounds goal should fail');

resetWorld();
path = context.astar({ x: 10, y: 10 }, { x: 13, y: 13 });
assert(Array.isArray(path), 'Direct diagonal path should exist');
assert.strictEqual(path.at(-1).x, 13);
assert.strictEqual(path.at(-1).y, 13);
assert.strictEqual(diagonalSteps({ x: 10, y: 10 }, path), 3, 'Direct route should use three diagonal steps');
approx(travelCost({ x: 10, y: 10 }, path), 3 * Math.SQRT2, 'Direct diagonal cost should be weighted');
assertValidPath(path, { x: 10, y: 10 });

path = context.astar({ x: 10, y: 10 }, { x: 14, y: 12 });
assert(Array.isArray(path), 'Mixed cardinal and diagonal path should exist');
approx(travelCost({ x: 10, y: 10 }, path), 2 * Math.SQRT2 + 2, 'Mixed route should use weighted cost');
assertValidPath(path, { x: 10, y: 10 });

resetWorld();
Game.map[10][11] = 'wall';
Game.map[11][10] = 'wall';
path = context.astar({ x: 10, y: 10 }, { x: 11, y: 11 });
assert(Array.isArray(path), 'Route around blocked diagonal sides should exist');
assert(!hasStep(path, 11, 11) || path.length > 1, 'Path should not make the direct corner-cutting diagonal move');
assertValidPath(path, { x: 10, y: 10 });

resetWorld();
Game.map[10][11] = 'wall';
Game.map[11][10] = 'wall';
Game.map[12][11] = 'wall';
Game.map[11][12] = 'wall';
assert.strictEqual(context.astar({ x: 10, y: 10 }, { x: 11, y: 11 }), null, 'Fully sealed diagonal should be unreachable');

resetWorld();
Game.map[10][11] = 'wall';
path = context.astar({ x: 10, y: 10 }, { x: 11, y: 11 });
assert(Array.isArray(path), 'One blocked side tile may still allow route around');
assert(path[0].x !== 11 || path[0].y !== 11, 'One blocked side tile should reject direct diagonal step');
assertValidPath(path, { x: 10, y: 10 });

resetWorld();
path = context.astar({ x: 10, y: 10 }, { x: 11, y: 11 });
assert.strictEqual(path.length, 1, 'Open diagonal should be one step');
assert.strictEqual(path[0].x, 11, 'Open diagonal should end at x');
assert.strictEqual(path[0].y, 11, 'Open diagonal should end at y');
assertValidPath(path, { x: 10, y: 10 });

resetWorld();
Game.objects = [{ id: 'tree', x: 11, y: 10, active: true }];
Game.enemies = [{ id: 'slime', x: 10, y: 11, hp: 1 }];
path = context.astar({ x: 10, y: 10 }, { x: 11, y: 11 });
assert(Array.isArray(path), 'Dynamic blockers should allow route around when possible');
assert(path[0].x !== 11 || path[0].y !== 11, 'Dynamic blockers should prevent direct diagonal corner cutting');
assertValidPath(path, { x: 10, y: 10 });

resetWorld();
Game.state.player = { x: 10, y: 10 };
Game.objects = [{ id: 'resource_test', x: 13, y: 12, active: true }];
let adjacent = context.adjacentTarget(Game.objects[0]);
assert(adjacent, 'adjacentTarget should return a reachable tile');
assert.strictEqual(Math.abs(adjacent.x - 13) + Math.abs(adjacent.y - 12), 1, 'Target should be orthogonally adjacent');
path = context.astar(Game.state.player, adjacent);
assert(diagonalSteps(Game.state.player, path) > 0, 'Route to cardinal interaction tile may contain diagonal steps');

resetWorld();
Game.state.player = { x: 8, y: 8 };
Game.objects = [{ id: 'weighted_target', x: 10, y: 10, active: false }];
Game.map[8][9] = 'wall';
Game.map[9][8] = 'wall';
adjacent = context.adjacentTarget(Game.objects[0]);
assert.strictEqual(adjacent.x, 9, 'adjacentTarget should choose lower weighted-cost x');
assert.strictEqual(adjacent.y, 10, 'adjacentTarget should choose lower weighted-cost y');

console.log('Pathfinding tests passed');
