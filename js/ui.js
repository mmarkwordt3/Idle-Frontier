function $(id) {
  return document.getElementById(id);
}

function modal(title, body) {
  $('modalTitle').textContent = title;
  $('modalBody').innerHTML = body;
  $('modal').classList.remove('hidden');
}

function closeModal() {
  $('modal').classList.add('hidden');
}

function renderLiveUI() {
  const state = Game.state;
  $('hp').textContent = `Health ${state.player.hp}/${maxHp()}`;
  $('coins').textContent = `Coins ${state.coins}`;
  $('fame').textContent = `Fame ${state.fame}`;
  $('action').textContent = `Action: ${state.action.type}${state.action.target ? '' : ''}`;
  $('progress').style.width = `${state.action.progress || 0}%`;
}

function renderStateUI() {
  renderSkills();
  renderInventory();
  renderEquipment();
  renderActionLog();
  Game.uiDirty = false;
}

function renderUI() {
  renderLiveUI();
  if (Game.uiDirty) {
    renderStateUI();
  }
}

function renderSkills() {
  $('skills').innerHTML = SKILLS.map((skill) => {
    const data = Game.state.skills[skill];
    return `<div class="skill"><b>${skill}</b> Lv ${data.level} (${data.xp}/${xpForLevel(Math.min(99, data.level + 1))})</div>`;
  }).join('');
}

function renderInventory() {
  const inventory = $('inventory');
  inventory.style.gridTemplateColumns = 'repeat(6,1fr)';
  const selected = Number.isInteger(Game.selectedInventoryIndex) ? Game.selectedInventoryIndex : null;
  inventory.innerHTML = Array.from({ length: Game.state.invCap }, (_, index) => {
    const stack = Game.state.inventory[index];
    const selectedClass = selected === index ? ' selected' : '';
    const label = stack ? itemDef(stack.id).name : '';
    const quantity = stack && stack.qty > 1 ? `<span class="qty">${stack.qty}</span>` : '';
    return `<button class="slot${selectedClass}" data-index="${index}" onclick="selectItem(${index})" aria-pressed="${selected === index}">${label}${quantity}</button>`;
  }).join('');
  renderSelectedItemInfo();
}

function renderEquipment() {
  const state = Game.state;
  $('equipment').innerHTML = Object.keys(state.equipment)
    .map((slot) => `<div>${slot}: ${state.equipment[slot] ? itemDef(state.equipment[slot]).name : 'None'}</div>`)
    .join('') + `<div>Pet: ${state.pets.active ? itemDef(state.pets.active).name : 'None'}</div>`;
}

function renderActionLog() {
  const log = $('log');
  log.style.display = Game.state.settings.log ? 'block' : 'none';
  log.innerHTML = Game.state.log
    .map((message) => `<div class="msg ${message.cls}">${new Date(message.at).toLocaleTimeString()} ${message.t}</div>`)
    .join('');
}

function selectItem(index) {
  if (!Number.isInteger(index) || index < 0 || index >= Game.state.invCap || !Game.state.inventory[index]) {
    clearSelectedInventory();
    return;
  }
  Game.selectedInventoryIndex = index;
  Game.uiDirty = true;
  renderStateUI();
}

function clearSelectedInventory() {
  Game.selectedInventoryIndex = null;
  const info = $('itemInfo');
  if (info) info.innerHTML = '';
  Game.uiDirty = true;
}

function reconcileSelectedInventory() {
  const index = Game.selectedInventoryIndex;
  if (!Number.isInteger(index) || index < 0 || index >= Game.state.inventory.length || !Game.state.inventory[index]) {
    Game.selectedInventoryIndex = null;
  }
}

function renderSelectedItemInfo() {
  reconcileSelectedInventory();
  const info = $('itemInfo');
  const index = Game.selectedInventoryIndex;
  if (!info || !Number.isInteger(index)) {
    if (info) info.innerHTML = '';
    return;
  }

  const stack = Game.state.inventory[index];
  if (!stack) {
    info.innerHTML = '';
    return;
  }

  const def = itemDef(stack.id);
  const actions = [];
  if (def.slot) actions.push(`<button onclick="equipIndex(${index})">Equip</button>`);
  if (def.heal) actions.push(`<button onclick="consumeIndex(${index})">Use</button>`);
  actions.push(`<button onclick="dropIndex(${index})">Drop</button>`);
  info.innerHTML = `<b>${def.name}</b><br>${def.type}${def.heal ? ` · Heals ${def.heal}` : ''}<br>${actions.join(' ')}`;
}

function openTasks() {
  modal('Task Board', TASKS.map((task) => {
    const progress = taskProgress(task);
    const claimed = Game.state.tasks[task[0]]?.claimed;
    return `<div class="entry ${progress >= task[2] ? 'complete' : ''}">${task[1]} (${Math.min(progress, task[2])}/${task[2]}) ${claimed ? 'Claimed' : progress >= task[2] ? `<button onclick="claimTask('${task[0]}')">Claim</button>` : ''}</div>`;
  }).join(''));
}

function openAch() {
  modal('Achievements', ACH.map((achievement) => `<div class="entry ${Game.state.achievements[achievement[0]] ? 'complete' : ''}">${Game.state.achievements[achievement[0]] ? '✓' : '?'} ${achievement[1]}</div>`).join(''));
}

function openCollection() {
  let html = '<h3>Active Pet</h3>' + Object.keys(Game.state.pets.owned).map((id) => `<button onclick="setPet('${id}')">${itemDef(id).name}</button>`).join(' ');
  const collection = categories();
  for (const category in collection) {
    html += `<h3>${category}</h3>` + collection[category].map((id) => {
      const seen = Game.state.collection[id] || Game.state.pets.owned[id] || Game.state.kills[id];
      const name = ITEM[id] ? itemDef(id).name : (enemyDef(id)?.name || id);
      const petInfo = ITEM[id]?.type === 'pet' && typeof PET_INFO !== 'undefined' ? `<div class="hint">${PET_INFO[id].join('<br>')}</div>` : '';
      return `<div class="entry">${seen ? `✓ ${name}` : '???'} x${Game.state.collection[id] || Game.state.pets.dupes[id] || Game.state.kills[id] || 0}${petInfo}</div>`;
    }).join('');
  }
  modal('Collection Log', html);
}

function setPet(id) {
  if (Game.state.pets.owned[id]) {
    Game.state.pets.active = id;
    logMsg(`Now followed by ${itemDef(id).name}.`);
    openCollection();
  }
}

function openSettings() {
  modal('Settings', `<label><input type="checkbox" onchange="Game.state.settings.mute=this.checked" ${s('mute')}> Mute</label><label><input type="checkbox" onchange="Game.state.settings.reducedMotion=this.checked" ${s('reducedMotion')}> Reduced motion</label><label><input type="checkbox" onchange="Game.state.settings.hideSplats=this.checked" ${s('hideSplats')}> Hide splats</label><label><input type="checkbox" onchange="Game.state.settings.minimap=this.checked" ${s('minimap')}> Minimap</label><label><input type="checkbox" onchange="Game.state.settings.log=this.checked" ${s('log')}> Action log</label><textarea id="saveText"></textarea><button onclick="exportSave()">Export</button><button onclick="importSave()">Import</button><button onclick="resetSave()">Reset</button>`);
}

function s(key) {
  return Game.state.settings[key] ? 'checked' : '';
}
