function astar(start, goal, allowGoal = false) {
  const width = CONFIG.W;
  const height = CONFIG.H;
  const safetyLimit = width * height * 4;
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];
  const key = (x, y) => `${x},${y}`;
  const inBounds = (x, y) => x >= 0 && y >= 0 && x < width && y < height;
  const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

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
  const fScore = new Map([[startKey, heuristic(start, goal)]]);

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
      if (blocked(neighbor.x, neighbor.y) && !(allowGoal && isGoal)) {
        continue;
      }

      const tentativeG = (gScore.get(currentKey) ?? Infinity) + 1;
      if (tentativeG >= (gScore.get(neighborKey) ?? Infinity)) {
        continue;
      }

      cameFrom.set(neighborKey, currentKey);
      gScore.set(neighborKey, tentativeG);
      fScore.set(neighborKey, tentativeG + heuristic(neighbor, goal));
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
    if (!best || path.length < best.path.length) {
      best = { tile: candidate, path };
    }
  }

  return best ? best.tile : null;
}
