function octileDistance(a, b) {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  const diagonal = Math.min(dx, dy);
  const straight = Math.max(dx, dy) - diagonal;

  return diagonal * Math.SQRT2 + straight;
}

function pathTravelCost(start, path) {
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

function astar(start, goal, allowGoal = false) {
  const width = CONFIG.W;
  const height = CONFIG.H;
  const safetyLimit = width * height * 4;
  const directions = [
    { x: 1, y: 0, cost: 1 },
    { x: -1, y: 0, cost: 1 },
    { x: 0, y: 1, cost: 1 },
    { x: 0, y: -1, cost: 1 },
    { x: 1, y: 1, cost: Math.SQRT2 },
    { x: 1, y: -1, cost: Math.SQRT2 },
    { x: -1, y: 1, cost: Math.SQRT2 },
    { x: -1, y: -1, cost: Math.SQRT2 },
  ];
  const key = (x, y) => `${x},${y}`;
  const inBounds = (x, y) => x >= 0 && y >= 0 && x < width && y < height;
  const canTraverseDiagonal = (current, dir) => {
    if (dir.x === 0 || dir.y === 0) {
      return true;
    }

    return !blocked(current.x + dir.x, current.y) && !blocked(current.x, current.y + dir.y);
  };

  if (!start || !goal || !inBounds(start.x, start.y) || !inBounds(goal.x, goal.y)) {
    return null;
  }

  if (start.x === goal.x && start.y === goal.y) {
    return [];
  }

  if (blocked(goal.x, goal.y) && !allowGoal) {
    return null;
  }

  const startKey = key(start.x, start.y);
  const goalKey = key(goal.x, goal.y);
  const open = [{ x: start.x, y: start.y }];
  const openKeys = new Set([startKey]);
  const closed = new Set();
  const cameFrom = new Map();
  const gScore = new Map([[startKey, 0]]);
  const fScore = new Map([[startKey, octileDistance(start, goal)]]);

  let iterations = 0;
  while (open.length > 0 && iterations < safetyLimit) {
    iterations += 1;
    let bestIndex = 0;
    let bestScore = fScore.get(key(open[0].x, open[0].y)) ?? Infinity;
    for (let i = 1; i < open.length; i += 1) {
      const score = fScore.get(key(open[i].x, open[i].y)) ?? Infinity;
      if (score < bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    const current = open.splice(bestIndex, 1)[0];
    const currentKey = key(current.x, current.y);
    openKeys.delete(currentKey);

    if (currentKey === goalKey) {
      const path = [];
      let stepKey = currentKey;
      while (stepKey !== startKey) {
        const [x, y] = stepKey.split(',').map(Number);
        path.unshift({ x, y });
        stepKey = cameFrom.get(stepKey);
        if (!stepKey) {
          return null;
        }
      }
      return path;
    }

    closed.add(currentKey);

    for (const dir of directions) {
      const neighbor = { x: current.x + dir.x, y: current.y + dir.y };
      const neighborKey = key(neighbor.x, neighbor.y);
      const isGoal = neighborKey === goalKey;

      if (!inBounds(neighbor.x, neighbor.y) || closed.has(neighborKey)) {
        continue;
      }
      if (!canTraverseDiagonal(current, dir)) {
        continue;
      }
      if (blocked(neighbor.x, neighbor.y) && !(allowGoal && isGoal)) {
        continue;
      }

      const tentativeG = (gScore.get(currentKey) ?? Infinity) + dir.cost;
      if (tentativeG >= (gScore.get(neighborKey) ?? Infinity)) {
        continue;
      }

      cameFrom.set(neighborKey, currentKey);
      gScore.set(neighborKey, tentativeG);
      fScore.set(neighborKey, tentativeG + octileDistance(neighbor, goal));
      if (!openKeys.has(neighborKey)) {
        open.push(neighbor);
        openKeys.add(neighborKey);
      }
    }
  }

  console.warn('A* search failed or exceeded safety limit', { start, goal, iterations });
  return null;
}

function adjacentTarget(object) {
  if (!object) {
    return null;
  }

  const start = { x: Game.state.player.x, y: Game.state.player.y };
  const candidates = [
    { x: object.x + 1, y: object.y },
    { x: object.x - 1, y: object.y },
    { x: object.x, y: object.y + 1 },
    { x: object.x, y: object.y - 1 },
  ];

  let best = null;
  for (const candidate of candidates) {
    if (candidate.x < 0 || candidate.y < 0 || candidate.x >= CONFIG.W || candidate.y >= CONFIG.H) {
      continue;
    }
    if (blocked(candidate.x, candidate.y)) {
      continue;
    }
    const path = astar(start, candidate);
    if (!path) {
      continue;
    }
    const cost = pathTravelCost(start, path);
    if (!best || cost < best.cost - Number.EPSILON) {
      best = { tile: candidate, path, cost };
    }
  }

  return best ? best.tile : null;
}
