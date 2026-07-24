function actionSkillName(skill) {
  return skill.charAt(0).toUpperCase() + skill.slice(1);
}

function clickObject(object) {
  if (!object) return;
  if (Game.state.action.target === object.id) return;

  if (object.kind === 'resource') {
    const resource = resDef(object.defId);
    const level = Game.state.skills[resource.skill].level;
    if (level < resource.level) {
      logMsg(`Requires ${actionSkillName(resource.skill)} level ${resource.level} to gather ${resource.name}.`, 'bad');
      return;
    }
    logMsg(`Walking to ${resource.name}.`);
  } else {
    logMsg(`Walking to ${object.name || object.kind}.`);
  }

  const adjacent = adjacentTarget(object);
  if (!adjacent) {
    logMsg(`${object.name || object.kind} is unreachable.`, 'bad');
    return;
  }

  moveTo(adjacent.x, adjacent.y, () => interact(object));
}

function interact(object) {
  if (object.kind === 'building') {
    if (object.id === 'bank') openBank();
    else if (object.id === 'shop') openShop();
    else if (object.id === 'fountain') {
      Game.state.player.hp = maxHp();
      logMsg('The fountain restores you.');
    } else if (object.id === 'tasks') openTasks();
    else if (object.id === 'forge') openForge();
    else openShop('fame');
    return;
  }
  if (object.kind === 'resource') startGather(object);
}

function startGather(object) {
  const resource = resDef(object.defId);
  const skill = Game.state.skills[resource.skill];
  if (skill.level < resource.level) {
    logMsg(`Requires ${actionSkillName(resource.skill)} level ${resource.level} to gather ${resource.name}.`, 'bad');
    return;
  }
  setAction({ type: 'gathering', target: object.id, last: performance.now(), progress: 0 });
  logMsg(`Started gathering ${resource.name}.`);
}

const SKILL_PET_EXPECTED_LEVEL = 92;
const SKILL_PETS = { woodcutting: 'forest_sprite', mining: 'ore_mite', fishing: 'tide_pup' };

function skillPetChance(resourceXp) {
  const expectedXp = xpForLevel(SKILL_PET_EXPECTED_LEVEL);
  return 1 - Math.exp(-resourceXp / expectedXp);
}

function awardPet(id) {
  if (Game.state.pets.owned[id]) Game.state.pets.dupes[id] = (Game.state.pets.dupes[id] || 0) + 1;
  else Game.state.pets.owned[id] = true;
  Game.state.pets.active = id;
  discover(id);
  logMsg(`Pet found: ${itemDef(id).name}!`, 'rare');
  sound('rare');
}

function rollSkillPet(resource) {
  const petId = SKILL_PETS[resource.skill];
  if (!petId) return;
  if (Math.random() < skillPetChance(resource.xp)) awardPet(petId);
}

function updateAction(now) {
  const action = Game.state.action;
  if (action.type !== 'gathering') return;
  const object = Game.objects.find((candidate) => candidate.id === action.target);
  const resource = object && resDef(object.defId);
  if (!object || !object.active) {
    setAction({ type: 'idle' });
    return;
  }

  const tool = itemDef(Game.state.equipment[resource.skill]);
  const interval = resource.interval * (1 - (tool.tier - 1) * 0.11) * (typeof fishingIntervalMultiplier==='function'?fishingIntervalMultiplier(resource):1);
  const loops = Math.min(30, Math.floor((now - action.last) / interval));
  action.progress = ((now - action.last) % interval) / interval * 100;
  if (loops <= 0) return;

  for (let i = 0; i < loops; i += 1) {
    if (!hasSpaceFor(resource.item)) {
      logMsg('Inventory full; gathering stopped.', 'bad');
      setAction({ type: 'idle' });
      return;
    }

    action.last += interval;
    const success = Math.random() < (0.78 + tool.tier * 0.035);
    if (success) {
      const quantity = Math.random() < tool.tier * 0.03 ? 2 : 1;
      addItem(resource.item, quantity);
      gainXp(resource.skill, resource.xp);
      Game.state.counts.gathered += quantity;
      logMsg(`Received ${quantity} ${resource.name} (+${resource.xp} xp).`);
      rollRare(typeof fishingRareTable==='function'?fishingRareTable(resource):resource.rare);
      rollSkillPet(resource);
      sound('gather');
    }

    if (Math.random() < resource.deplete) {
      object.active = false;
      object.respawnAt = Date.now() + resource.respawn;
      Game.state.resources[object.id] = object.respawnAt;
      logMsg(`${resource.name} depleted.`);
      setAction({ type: 'idle' });
      return;
    }
  }
}

function rollRare(table) {
  for (const drop of table || []) {
    if (drop.rate && Math.random() < drop.rate) {
      if (itemDef(drop.id).type === 'pet') awardPet(drop.id);
      else if(addItem(drop.id, 1)){
        sound('rare');
      } else logMsg(`${itemDef(drop.id).name} was lost because your inventory was full.`, 'bad');
    }
  }
}

function updateRespawns() {
  const now = Date.now();
  Game.objects.forEach((object) => {
    if (object.respawnAt && now >= object.respawnAt) {
      object.active = true;
      object.respawnAt = 0;
      delete Game.state.resources[object.id];
    }
  });
  Game.enemies.forEach((enemy) => {
    const definition = enemyDef(enemy.defId);
    if (enemy.hp <= 0 && enemy.respawnAt && now >= enemy.respawnAt) {
      enemy.hp = definition.hp;
      enemy.respawnAt = 0;
      delete Game.state.enemies[enemy.uid];
    }
  });
}
