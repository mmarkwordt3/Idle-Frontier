const BONE_SACRIFICE_XP = 8;

function normalizeNonnegativeInteger(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

function normalizeShrineState() {
  Game.state.counts = Game.state.counts || {};
  Game.state.counts.bonesSacrificed = normalizeNonnegativeInteger(Game.state.counts.bonesSacrificed);
  return Game.state.counts.bonesSacrificed;
}

function bonesOwned() {
  return ownedItemQuantity('bones');
}

function constitutionXpRemainingToMax() {
  const skill = Game.state.skills.constitution;
  return Math.max(0, xpForLevel(CONFIG.MAX_LEVEL) - skill.xp);
}

function usefulBonesRemaining() {
  const remainingXp = constitutionXpRemainingToMax();
  return remainingXp > 0 ? Math.ceil(remainingXp / BONE_SACRIFICE_XP) : 0;
}

function shrineSacrificeAmount(quantity) {
  if (quantity === 'all') return Math.min(bonesOwned(), usefulBonesRemaining());
  const n = Number(quantity);
  if (!Number.isInteger(n) || n <= 0) return 0;
  return n;
}

function shrineXpForBones(quantity) {
  return Math.min(quantity * BONE_SACRIFICE_XP, constitutionXpRemainingToMax());
}

function shrineBoneWord(quantity) {
  return quantity === 1 ? 'Bone' : 'Bones';
}

function sacrificeBones(quantity) {
  normalizeShrineState();
  const requested = shrineSacrificeAmount(quantity);
  const owned = bonesOwned();
  const useful = usefulBonesRemaining();
  if (!requested) return false;
  if (Game.state.skills.constitution.level >= CONFIG.MAX_LEVEL || useful <= 0) return false;
  if (quantity !== 'all' && (owned < requested || useful < requested)) return false;
  const amount = Math.min(requested, owned, useful);
  if (!amount) return false;
  const xp = shrineXpForBones(amount);
  if (xp <= 0) return false;
  if (!removeOwnedItemQuantity('bones', amount)) return false;
  Game.state.counts.bonesSacrificed += amount;
  gainXp('constitution', xp);
  const maxXp = xpForLevel(CONFIG.MAX_LEVEL);
  if (Game.state.skills.constitution.xp > maxXp) {
    Game.state.skills.constitution.xp = maxXp;
    Game.state.skills.constitution.level = levelForXp(maxXp);
  }
  if (typeof snapshotCompletedTaskRewards === 'function') snapshotCompletedTaskRewards();
  const message = `Sacrificed ${amount.toLocaleString()} ${shrineBoneWord(amount)} and gained ${xp.toLocaleString()} Constitution XP.`;
  logMsg(message, 'rare');
  openMemorialShrine({ text: message, cls: 'rare' });
  return { bones: amount, xp };
}

function shrineButton(quantity, label) {
  const owned = bonesOwned();
  const useful = usefulBonesRemaining();
  const disabled = Game.state.skills.constitution.level >= CONFIG.MAX_LEVEL || owned < quantity || useful < quantity;
  return `<button onclick="sacrificeBones(${quantity})" ${disabled ? 'disabled' : ''}>Sacrifice ${label}</button>`;
}

function sacrificeAllBones() {
  const amount = Math.min(bonesOwned(), usefulBonesRemaining());
  const xp = shrineXpForBones(amount);
  if (!amount || xp <= 0) return false;
  if (!confirm(`Sacrifice ${amount.toLocaleString()} ${shrineBoneWord(amount)} for ${xp.toLocaleString()} Constitution XP?`)) return false;
  return sacrificeBones('all');
}

function openMemorialShrine(message) {
  normalizeShrineState();
  const skill = Game.state.skills.constitution;
  const maxXp = xpForLevel(CONFIG.MAX_LEVEL);
  const nextXp = skill.level >= CONFIG.MAX_LEVEL ? maxXp : xpForLevel(skill.level + 1);
  const nextRemaining = Math.max(0, nextXp - skill.xp);
  const inventoryBones = inventoryItemQuantity('bones');
  const bankBones = bankItemQuantity('bones');
  const totalBones = bonesOwned();
  const usefulBones = usefulBonesRemaining();
  const allXp = shrineXpForBones(Math.min(totalBones, usefulBones));
  const feedback = message ? `<div class="shrine-feedback msg ${message.cls || ''}">${message.text}</div>` : '<div class="shrine-feedback msg"></div>';
  const maxNotice = skill.level >= CONFIG.MAX_LEVEL ? '<div class="bad">Constitution is already at the maximum level.</div>' : '';
  const allDisabled = skill.level >= CONFIG.MAX_LEVEL || Math.min(totalBones, usefulBones) <= 0;
  modal('Memorial Shrine', `<div class="shrine-summary entry">
    <div>Constitution level: ${skill.level.toLocaleString()}</div>
    <div>Current Constitution XP: ${skill.xp.toLocaleString()}</div>
    <div>XP required for next level: ${nextXp.toLocaleString()}</div>
    <div>XP remaining to next level: ${nextRemaining.toLocaleString()}</div>
    <div>Bones in inventory: ${inventoryBones.toLocaleString()}</div>
    <div>Bones in bank: ${bankBones.toLocaleString()}</div>
    <div>Total Bones owned: ${totalBones.toLocaleString()}</div>
    <div>Bones sacrificed historically: ${Game.state.counts.bonesSacrificed.toLocaleString()}</div>
    <div>XP per Bone: ${BONE_SACRIFICE_XP.toLocaleString()}</div>
    <div>Maximum useful Bones remaining before level 99: ${usefulBones.toLocaleString()}</div>
    <div>XP available from sacrificing all useful Bones: ${allXp.toLocaleString()}</div>
  </div>${maxNotice}${feedback}<div class="shrine-actions">${shrineButton(1, '1')}${shrineButton(10, '10')}${shrineButton(100, '100')}<button onclick="sacrificeAllBones()" ${allDisabled ? 'disabled' : ''}>Sacrifice All</button></div>`);
}
