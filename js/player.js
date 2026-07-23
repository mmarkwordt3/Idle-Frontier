function setAction(action) {
  Game.state.action = action;
  Game.uiDirty = true;
}

function cancel() {
  setAction({ type: 'idle' });
  Game.state.player.path = [];
}

function moveTo(x, y, after) {
  cancel();
  const player = Game.state.player;
  const path = astar({ x: player.x, y: player.y }, { x, y });

  if (!path) {
    logMsg('No clear path there.', 'bad');
    return false;
  }

  Game.state.destination = { x, y, createdAt: performance.now() };

  if (path.length === 0) {
    player.px = player.x;
    player.py = player.y;
    setAction({ type: 'idle' });
    if (typeof after === 'function') {
      after();
    }
    return true;
  }

  player.path = path;
  setAction({ type: 'moving', after });
  sound('move');
  return true;
}

function finishMovementCallback() {
  const after = Game.state.action.after;
  setAction({ type: 'idle' });
  if (typeof after === 'function') {
    after();
  }
}

function updatePlayer(dt) {
  const player = Game.state.player;

  if (player.path.length && !Game.state.settings.reducedMotion) {
    const speed = (Game.state.upgrades.speed_1 ? 7 : 5) * dt / 1000;
    const targetX = player.path[0].x;
    const targetY = player.path[0].y;
    const dx = targetX - player.px;
    const dy = targetY - player.py;
    const distance = Math.hypot(dx, dy);

    if (distance <= speed) {
      player.x = targetX;
      player.y = targetY;
      player.px = targetX;
      player.py = targetY;
      player.path.shift();
      if (!player.path.length) {
        finishMovementCallback();
      }
    } else if (distance > 0) {
      player.px += dx / distance * speed;
      player.py += dy / distance * speed;
    }
  } else if (player.path.length) {
    while (player.path.length) {
      const next = player.path.shift();
      player.x = player.px = next.x;
      player.y = player.py = next.y;
    }
    finishMovementCallback();
  }

  discoverRegion();
}

function discoverRegion() {
  const player = Game.state.player;
  const region = player.x < 32
    ? 'Western Forest'
    : player.x > 68
      ? 'Eastern Quarry'
      : player.y > 72
        ? 'Southern Coast'
        : player.y < 36
          ? 'Northern Ruins'
          : 'Settlement';

  if (!Game.state.discovered[region]) {
    Game.state.discovered[region] = true;
    logMsg(`Discovered ${region}.`);
  }
}
