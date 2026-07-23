const TERR = {
  grass: '#4f8a42',
  road: '#b98f54',
  forest: '#2f6f38',
  stone: '#777',
  sand: '#d6bd72',
  water: '#2f75b5',
  ruin: '#68605d',
  wall: '#3b3029',
  mountain: '#555',
};

function makeMap() {
  const tiles = Array.from({ length: CONFIG.H }, (_, y) =>
    Array.from({ length: CONFIG.W }, () => (y > 82 ? 'sand' : 'grass'))
  );

  for (let y = 86; y < CONFIG.H; y += 1) {
    for (let x = 0; x < CONFIG.W; x += 1) {
      tiles[y][x] = 'water';
    }
  }

  for (let x = 8; x < 40; x += 1) {
    for (let y = 18; y < 82; y += 1) {
      tiles[y][x] = 'forest';
    }
  }

  for (let x = 61; x < CONFIG.W; x += 1) {
    for (let y = 18; y < 82; y += 1) {
      tiles[y][x] = 'stone';
    }
  }

  for (let y = 42; y < 62; y += 1) {
    for (let x = 40; x < 60; x += 1) {
      tiles[y][x] = 'road';
    }
  }
  for (let i = 0; i < CONFIG.W; i += 1) {
    tiles[52][i] = 'road';
    tiles[i][50] = 'road';
  }

  for (let y = 5; y < 34; y += 1) {
    for (let x = 36; x < 65; x += 1) {
      tiles[y][x] = 'ruin';
    }
  }
  for (let x = 35; x < 66; x += 1) {
    tiles[5][x] = 'wall';
    tiles[34][x] = 'wall';
  }
  for (let y = 5; y < 35; y += 1) {
    tiles[y][35] = 'wall';
    tiles[y][65] = 'wall';
  }
  tiles[34][50] = 'road';
  for (let y = 18; y < 32; y += 4) {
    for (let x = 40; x < 62; x += 1) {
      tiles[y][x] = 'wall';
    }
  }

  for (let y = 22; y < 72; y += 5) {
    tiles[y][6] = 'mountain';
    tiles[y][7] = 'mountain';
  }
  for (let x = 72; x < 95; x += 4) {
    tiles[70][x] = 'mountain';
  }

  return tiles;
}

function blocked(x, y) {
  if (x < 0 || y < 0 || x >= CONFIG.W || y >= CONFIG.H) return true;
  const terrain = Game.map[y][x];
  if (['water', 'wall', 'mountain'].includes(terrain)) return true;
  return Game.objects.some((object) => object.x === x && object.y === y && object.active !== false) ||
    Game.enemies.some((enemy) => enemy.x === x && enemy.y === y && enemy.hp > 0);
}

function spawnObjects() {
  const objects = [];
  const occupied = new Set();
  const key = (x, y) => `${x},${y}`;
  const add = (kind, def, x, y) => {
    if (x < 0 || y < 0 || x >= CONFIG.W || y >= CONFIG.H) return;
    if (occupied.has(key(x, y))) return;
    occupied.add(key(x, y));
    objects.push({ id: `${kind}_${def.id}_${x}_${y}`, kind, defId: def.id, x, y, active: true, respawnAt: 0 });
  };

  const woodXByTier = { 1: 36, 2: 30, 3: 24, 4: 18, 5: 12 };
  for (const def of RESOURCES.woodcutting) {
    for (let i = 0; i < 8; i += 1) {
      const x = woodXByTier[def.tier] - (i % 2);
      const y = 38 + (i % 4) * 5 + Math.floor(i / 4) * 21;
      add('resource', def, x, y);
    }
  }

  const miningXByTier = { 1: 64, 2: 70, 3: 78, 4: 86, 5: 94 };
  for (const def of RESOURCES.mining) {
    for (let i = 0; i < 8; i += 1) {
      const x = miningXByTier[def.tier] + (i % 2);
      const y = 38 + (i % 4) * 5 + Math.floor(i / 4) * 21;
      add('resource', def, x, y);
    }
  }

  for (const def of RESOURCES.fishing) {
    for (let i = 0; i < 8; i += 1) {
      const x = 42 + (def.tier - 1) * 8 + (i % 4);
      const y = 74 + def.tier * 2 + Math.floor(i / 4);
      add('resource', def, x, y);
    }
  }

  ['bank', 'shop', 'fountain', 'tasks', 'fame'].forEach((kind, i) => {
    const x = 44 + i * 3;
    const y = 48;
    occupied.add(key(x, y));
    objects.push({
      id: kind,
      kind: 'building',
      name: { bank: 'Bank', shop: 'Merchant Hall', fountain: 'Healing Fountain', tasks: 'Task Board', fame: 'Fame Monument' }[kind],
      x,
      y,
      active: true,
    });
  });

  Game.objects = objects;
  Game.enemies = [];
  ENEMIES.forEach((def, tierIndex) => {
    for (let i = 0; i < 5; i += 1) {
      Game.enemies.push({
        uid: `${def.id}_${i}`,
        defId: def.id,
        x: 42 + tierIndex * 4 + (i % 3),
        y: 31 - tierIndex * 5 - Math.floor(i / 3),
        hp: def.hp,
        respawnAt: 0,
      });
    }
  });
}

function resDef(id) {
  return Object.values(RESOURCES).flat().find((resource) => resource.id === id);
}

function enemyDef(id) {
  return ENEMIES.find((enemy) => enemy.id === id);
}
