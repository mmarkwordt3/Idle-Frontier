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

    const rect = canvas.getBoundingClientRect();
    const tileSize = CONFIG.TILE;
    const cols = Math.ceil(canvas.width / tileSize);
    const rows = Math.ceil(canvas.height / tileSize);
    const player = Game.state.player;
    const startX = Math.max(0, Math.min(CONFIG.W - cols, Math.floor(player.px - cols / 2)));
    const startY = Math.max(0, Math.min(CONFIG.H - rows, Math.floor(player.py - rows / 2)));
    const x = Math.floor((event.clientX - rect.left) / rect.width * canvas.width / tileSize) + startX;
    const y = Math.floor((event.clientY - rect.top) / rect.height * canvas.height / tileSize) + startY;

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

  $('closeModal').onclick = closeModal;
  $('bankBtn').onclick = openBank;
  $('shopBtn').onclick = openShop;
  $('tasksBtn').onclick = openTasks;
  $('achBtn').onclick = openAch;
  $('logBtn').onclick = openCollection;
  $('settingsBtn').onclick = openSettings;
  $('saveBtn').onclick = saveGame;
}
