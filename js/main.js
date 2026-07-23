let audioCtx = null;
let loopErrorReported = false;

function audioUnlock() {
  if (!audioCtx) {
    const AudioConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioConstructor) {
      throw new Error('Web Audio API is not supported by this browser.');
    }
    audioCtx = new AudioConstructor();
  }
}

function sound(kind) {
  const state = Game.state;
  if (state.settings.mute || !audioCtx) {
    return;
  }
  try {
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    oscillator.frequency.value = { move: 180, gather: 320, combat: 120, level: 620, rare: 880 }[kind] || 220;
    gain.gain.value = state.settings.volume * 0.12;
    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.07);
  } catch (error) {
    console.warn('Sound playback failed.', error);
  }
}

function init() {
  Game.map = makeMap();
  spawnObjects();
  loadGame();
  for (const id of Game.state.ownedTools) {
    discover(id);
  }
  setupInput();
  logMsg('Welcome to Idle Frontier. Click roads, resources, buildings, or enemies.');
  setInterval(saveGame, 30000);
  requestAnimationFrame(loop);
}

function loop(now) {
  try {
    const dt = Math.min(now - Game.last, CONFIG.ACTION_CATCHUP_MS);
    Game.last = now;
    updatePlayer(dt);
    updateRespawns();
    updateAction(now);
    updateCombat(now);
    if (Game.state.action.type !== 'fighting' && Game.state.player.hp < maxHp() && now % 3000 < 20) {
      Game.state.player.hp += 1;
    }
    updateAchievements();
    draw();
    renderUI();
  } catch (error) {
    console.error('Idle Frontier main loop error:', error);
    if (!loopErrorReported) {
      loopErrorReported = true;
      try {
        logMsg('A game loop error occurred. Check the browser console for details.', 'bad');
        renderUI();
      } catch (logError) {
        console.error('Unable to report loop error in game log:', logError);
      }
    }
  } finally {
    requestAnimationFrame(loop);
  }
}

window.addEventListener('load', init);
