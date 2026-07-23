function setupInput() {
  const canvas = $('game');
  if (!canvas) {
    console.error('Game canvas not found; input disabled.');
    return;
  }

  canvas.addEventListener('click', (event) => {
    try {
      audioUnlock();
    } catch (error) {
      console.warn('Audio could not be initialized; movement will continue without sound.', error);
      logMsg('Audio unavailable; continuing without sound.');
    }

    const tile = canvasTileFromEvent(canvas, event);
    if (!tile) return;
    const { x, y } = tile;

    const enemy = Game.enemies.find((candidate) => candidate.x === x && candidate.y === y && candidate.hp > 0);
    if (enemy) {
      clickEnemy(enemy);
      return;
    }

    const object = Game.objects.find((candidate) => candidate.x === x && candidate.y === y && candidate.active !== false);
    if (object) {
      clickObject(object);
      return;
    }

    if (blocked(x, y)) {
      logMsg('That tile is blocked.', 'bad');
      return;
    }

    moveTo(x, y);
  });

  canvas.addEventListener('mousemove', (event) => updateCanvasTooltip(canvas, event));
  canvas.addEventListener('mouseleave', hideCanvasTooltip);

  $('closeModal').onclick = closeModal;
  $('bankBtn').onclick = openBank;
  $('shopBtn').onclick = openShop;
  $('tasksBtn').onclick = openTasks;
  $('achBtn').onclick = openAch;
  $('logBtn').onclick = openCollection;
  $('settingsBtn').onclick = openSettings;
  $('saveBtn').onclick = saveGame;
}

function canvasTileFromEvent(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  const tileSize = CONFIG.TILE;
  const cols = Math.ceil(canvas.width / tileSize);
  const rows = Math.ceil(canvas.height / tileSize);
  const player = Game.state.player;
  const startX = Math.max(0, Math.min(CONFIG.W - cols, Math.floor(player.px - cols / 2)));
  const startY = Math.max(0, Math.min(CONFIG.H - rows, Math.floor(player.py - rows / 2)));
  return {
    x: Math.floor((event.clientX - rect.left) / rect.width * canvas.width / tileSize) + startX,
    y: Math.floor((event.clientY - rect.top) / rect.height * canvas.height / tileSize) + startY,
  };
}

function findHoverTarget(x, y) {
  const enemy = Game.enemies.find((candidate) => candidate.x === x && candidate.y === y && candidate.hp > 0);
  if (enemy) return { type: 'enemy', target: enemy };
  const object = Game.objects.find((candidate) => candidate.x === x && candidate.y === y && candidate.active !== false);
  if (object) return { type: object.kind, target: object };
  return null;
}

function resourceSkillName(skill) {
  return skill.charAt(0).toUpperCase() + skill.slice(1);
}

function getHoverInfo(hit) {
  if (!hit) return null;
  if (hit.type === 'resource') {
    const resource = resDef(hit.target.defId);
    const skillName = resourceSkillName(resource.skill);
    const locked = Game.state.skills[resource.skill].level < resource.level;
    return {
      title: resource.name,
      locked,
      lines: locked
        ? [`Requires ${skillName} level ${resource.level}`]
        : [`${skillName} level ${resource.level}`, 'Click to gather'],
    };
  }
  if (hit.type === 'enemy') {
    const enemy = enemyDef(hit.target.defId);
    return { title: enemy.name, locked: false, lines: [`Health ${hit.target.hp}/${enemy.hp}`, 'Click to fight'] };
  }
  if (hit.type === 'building') {
    return { title: hit.target.name, locked: false, lines: ['Click to interact'] };
  }
  return null;
}

function updateCanvasTooltip(canvas, event) {
  const tooltip = $('canvasTooltip');
  if (!tooltip) return;
  const tile = canvasTileFromEvent(canvas, event);
  const info = tile && getHoverInfo(findHoverTarget(tile.x, tile.y));
  if (!info) {
    hideCanvasTooltip();
    return;
  }

  tooltip.innerHTML = `<strong>${info.title}</strong>${info.lines.map((line) => `<div>${line}</div>`).join('')}`;
  tooltip.classList.toggle('locked', info.locked);
  tooltip.classList.remove('hidden');

  const padding = 12;
  const width = tooltip.offsetWidth || 180;
  const height = tooltip.offsetHeight || 50;
  let left = event.clientX + 14;
  let top = event.clientY + 14;
  left = Math.min(left, window.innerWidth - width - padding);
  top = Math.min(top, window.innerHeight - height - padding);
  tooltip.style.left = `${Math.max(padding, left)}px`;
  tooltip.style.top = `${Math.max(padding, top)}px`;
}

function hideCanvasTooltip() {
  const tooltip = $('canvasTooltip');
  if (tooltip) tooltip.classList.add('hidden');
}
