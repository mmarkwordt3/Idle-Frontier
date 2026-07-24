const WOODCUTTING_VISUALS = {
  1: { canopy: '#8fd16f', trunk: '#8a5a2c', accent: '#d9f5a2', radius: 8, trunkWidth: 5, shape: 'shrub' },
  2: { canopy: '#174f2f', trunk: '#7a4b25', accent: '#78b96a', radius: 11, trunkWidth: 5, shape: 'pine' },
  3: { canopy: '#3f8f45', trunk: '#7b4a24', accent: '#b8df77', radius: 13, trunkWidth: 6, shape: 'round' },
  4: { canopy: '#3f7770', trunk: '#533a2a', accent: '#8cc5bc', radius: 15, trunkWidth: 7, shape: 'round' },
  5: { canopy: '#4b3f72', trunk: '#6b4b25', accent: '#d8b64e', radius: 17, trunkWidth: 8, shape: 'ancient' },
};

function draw() {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const tileSize = CONFIG.TILE;
  const player = Game.state.player;
  const cols = Math.ceil(canvas.width / tileSize);
  const rows = Math.ceil(canvas.height / tileSize);
  const startX = Math.max(0, Math.min(CONFIG.W - cols, Math.floor(player.px - cols / 2)));
  const startY = Math.max(0, Math.min(CONFIG.H - rows, Math.floor(player.py - rows / 2)));

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = startY; y < startY + rows; y += 1) {
    for (let x = startX; x < startX + cols; x += 1) {
      ctx.fillStyle = TERR[Game.map[y]?.[x]] || '#000';
      ctx.fillRect((x - startX) * tileSize, (y - startY) * tileSize, tileSize, tileSize);
      ctx.strokeStyle = 'rgba(0,0,0,.08)';
      ctx.strokeRect((x - startX) * tileSize, (y - startY) * tileSize, tileSize, tileSize);
    }
  }

  Game.objects.forEach((object) => {
    if (!object.active) return;
    const x = (object.x - startX) * tileSize;
    const y = (object.y - startY) * tileSize;
    if (x < -tileSize || y < -tileSize || x > canvas.width || y > canvas.height) return;
    if (object.kind === 'resource') drawResource(ctx, object, x, y);
    else drawBuilding(ctx, object, x, y);
  });

  Game.enemies.forEach((enemy) => {
    if (enemy.hp <= 0) return;
    const x = (enemy.x - startX) * tileSize;
    const y = (enemy.y - startY) * tileSize;
    ctx.fillStyle = '#8b2f3b';
    ctx.fillRect(x + 7, y + 7, 18, 18);
    ctx.fillStyle = 'red';
    ctx.fillRect(x + 4, y + 3, 24 * (enemy.hp / enemyDef(enemy.defId).hp), 3);
  });

  if (Game.state.pets.active) {
    ctx.fillStyle = '#ffb6e8';
    ctx.beginPath();
    ctx.arc((player.px - startX - 0.55) * tileSize + 16, (player.py - startY + 0.55) * tileSize + 16, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  const destination = Game.state.destination;
  if (destination) {
    const dx = (destination.x - startX) * tileSize;
    const dy = (destination.y - startY) * tileSize;
    if (dx > -tileSize && dy > -tileSize && dx < canvas.width && dy < canvas.height) {
      ctx.strokeStyle = '#ffdf5d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(dx + 16, dy + 16, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 1;
    }
  }

  ctx.fillStyle = '#ffe0a0';
  ctx.beginPath();
  ctx.arc((player.px - startX) * tileSize + 16, (player.py - startY) * tileSize + 16, 11, 0, Math.PI * 2);
  ctx.fill();

  Game.state.floating = Game.state.floating.filter((float) => {
    float.life -= 16;
    ctx.fillStyle = float.text === 'miss' ? '#fff' : '#ffef65';
    ctx.fillText(float.text, (float.x - startX) * tileSize + 8, (float.y - startY) * tileSize + float.life / 45);
    return float.life > 0;
  });

  drawMini();
}

function drawResource(ctx, object, x, y) {
  const resource = resDef(object.defId);
  if (resource.skill === 'woodcutting') {
    drawWoodcuttingResource(ctx, resource, x, y);
    return;
  }

  if (resource.skill === 'mining') {
    ctx.fillStyle = ['#aaa', '#b87333', '#9da6ad', '#d4d5dd', '#87d8ff'][resource.tier - 1];
    ctx.strokeStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 23);
    ctx.lineTo(x + 14, y + 8);
    ctx.lineTo(x + 24, y + 12);
    ctx.lineTo(x + 27, y + 23);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    return;
  }

  ctx.fillStyle = ['#9ee9ff', '#67c6ff', '#508dff', '#314da8', '#20264f'][resource.tier - 1];
  ctx.strokeStyle = '#e5fbff';
  ctx.beginPath();
  ctx.arc(x + 16, y + 16, 7 + resource.tier, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawWoodcuttingResource(ctx, resource, x, y) {
  const visual = WOODCUTTING_VISUALS[resource.tier];
  ctx.fillStyle = visual.trunk;
  ctx.fillRect(x + 16 - visual.trunkWidth / 2, y + 18, visual.trunkWidth, 9);
  ctx.strokeStyle = '#1d2118';
  ctx.lineWidth = 2;

  if (visual.shape === 'pine') {
    ctx.fillStyle = visual.canopy;
    ctx.beginPath();
    ctx.moveTo(x + 16, y + 3);
    ctx.lineTo(x + 5, y + 22);
    ctx.lineTo(x + 27, y + 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = visual.accent;
    ctx.fillRect(x + 14, y + 8, 4, 10);
    return;
  }

  ctx.fillStyle = visual.canopy;
  ctx.beginPath();
  ctx.arc(x + 16, y + 14, visual.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = visual.accent;
  if (visual.shape === 'shrub') {
    ctx.beginPath();
    ctx.arc(x + 10, y + 18, 4, 0, Math.PI * 2);
    ctx.arc(x + 21, y + 11, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (visual.shape === 'ancient') {
    ctx.beginPath();
    ctx.arc(x + 9, y + 9, 3, 0, Math.PI * 2);
    ctx.arc(x + 24, y + 19, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = visual.accent;
    ctx.beginPath();
    ctx.arc(x + 16, y + 14, visual.radius + 3, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(x + 11, y + 9, 3, 0, Math.PI * 2);
    ctx.arc(x + 22, y + 18, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBuilding(ctx, object, x, y) {
  if(object.id==='forge'){ctx.fillStyle='#3b3f46';ctx.fillRect(x+4,y+8,24,18);ctx.fillStyle='#ff7a3d';ctx.fillRect(x+11,y+3,10,8);ctx.fillStyle='#111';ctx.fillText('F',x+12,y+22);return;}
  ctx.fillStyle = '#d9c06b';
  ctx.fillRect(x + 5, y + 5, 22, 22);
  ctx.fillStyle = '#111';
  ctx.fillText(object.name[0], x + 12, y + 20);
}

function drawMini() {
  const minimap = document.getElementById('minimap');
  if (!Game.state.settings.minimap) {
    minimap.style.display = 'none';
    return;
  }
  minimap.style.display = 'block';
  const ctx = minimap.getContext('2d');
  const scale = minimap.width / CONFIG.W;
  for (let y = 0; y < CONFIG.H; y += 1) {
    for (let x = 0; x < CONFIG.W; x += 1) {
      ctx.fillStyle = TERR[Game.map[y][x]];
      ctx.fillRect(x * scale, y * scale, scale + 1, scale + 1);
    }
  }
  ctx.fillStyle = '#ffd76b';
  Game.objects.filter((object) => object.active).forEach((object) => ctx.fillRect(object.x * scale, object.y * scale, 2, 2));
  ctx.fillStyle = 'red';
  Game.enemies.filter((enemy) => enemy.hp > 0).forEach((enemy) => ctx.fillRect(enemy.x * scale, enemy.y * scale, 2, 2));
  ctx.fillStyle = '#fff';
  ctx.fillRect(Game.state.player.x * scale - 1, Game.state.player.y * scale - 1, 4, 4);
}
