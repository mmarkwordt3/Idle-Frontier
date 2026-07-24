function invUsed() {
  return Game.state.inventory.length;
}

function itemDef(id) {
  return ITEM[id] || { id, name: id, value: 0, stack: true, type: 'unknown' };
}

function addItem(id, qty = 1) {
  if (id === 'coins') {
    Game.state.coins += qty;
    Game.state.counts.coinsEarned += qty;
    Game.uiDirty = true;
    return true;
  }

  const def = itemDef(id);
  let left = qty;
  if (def.stack) {
    for (const stack of Game.state.inventory) {
      if (stack.id === id && stack.qty < CONFIG.STACK) {
        const amount = Math.min(left, CONFIG.STACK - stack.qty);
        stack.qty += amount;
        left -= amount;
        if (!left) break;
      }
    }
  }

  while (left > 0 && invUsed() < Game.state.invCap) {
    const amount = def.stack ? Math.min(left, CONFIG.STACK) : 1;
    Game.state.inventory.push({ id, qty: amount });
    left -= amount;
  }

  if (left > 0) return false;
  discover(id);
  Game.uiDirty = true;
  return true;
}

function removeItem(index, qty = 1) {
  const stack = Game.state.inventory[index];
  if (!stack) return false;

  stack.qty -= qty;
  if (stack.qty <= 0) {
    Game.state.inventory.splice(index, 1);
  }

  if (Number.isInteger(Game.selectedInventoryIndex)) {
    if (Game.selectedInventoryIndex === index || Game.selectedInventoryIndex >= Game.state.inventory.length) {
      Game.selectedInventoryIndex = null;
    }
  }
  Game.uiDirty = true;
  return true;
}

function inventoryItemQuantity(id){return Game.state.inventory.filter((stack)=>stack.id===id).reduce((sum,stack)=>sum+stack.qty,0)}
function bankItemQuantity(id){return Game.state.bank[id]||0}
function ownedItemQuantity(id){return inventoryItemQuantity(id)+bankItemQuantity(id)}
function countInventoryItem(id){return inventoryItemQuantity(id)}
function removeOwnedItemQuantity(id,qty){let left=qty;for(let i=Game.state.inventory.length-1;i>=0&&left>0;i--){const s=Game.state.inventory[i];if(s.id!==id)continue;const take=Math.min(left,s.qty);s.qty-=take;left-=take;if(s.qty<=0)Game.state.inventory.splice(i,1)}if(left>0){const take=Math.min(left,Game.state.bank[id]||0);Game.state.bank[id]-=take;left-=take;if(Game.state.bank[id]<=0)delete Game.state.bank[id]}Game.uiDirty=true;return left===0}

function hasSpaceFor(id) {
  const def = itemDef(id);
  return (def.stack && Game.state.inventory.some((stack) => stack.id === id && stack.qty < CONFIG.STACK)) || invUsed() < Game.state.invCap;
}

function equipIndex(index) {
  const stack = Game.state.inventory[index];
  const def = stack && itemDef(stack.id);
  if (!def || !def.slot) return;

  if (def.skill && Game.state.skills[def.skill].level < CONFIG.tierReq[def.tier]) {
    logMsg(`Need ${def.skill} level ${CONFIG.tierReq[def.tier]} to equip ${def.name}.`, 'bad');
    return;
  }

  const old = Game.state.equipment[def.slot];
  Game.state.equipment[def.slot] = def.id;
  if (!Game.state.ownedTools.includes(def.id) && def.type === 'tool') {
    Game.state.ownedTools.push(def.id);
  }
  removeItem(index, 1);
  if (old) addItem(old, 1);
  discover(def.id);
  Game.selectedInventoryIndex = null;
  Game.uiDirty = true;
  logMsg(`Equipped ${def.name}.`);
}

function consumeIndex(index) {
  const stack = Game.state.inventory[index];
  const def = stack && itemDef(stack.id);
  if (!def || !def.heal) return;

  const before = Game.state.player.hp;
  Game.state.player.hp = Math.min(maxHp(), before + def.heal);
  removeItem(index, 1);
  Game.selectedInventoryIndex = null;
  Game.uiDirty = true;
  logMsg(`Ate ${def.name} and healed ${Game.state.player.hp - before}.`);
}

function dropIndex(index) {
  const stack = Game.state.inventory[index];
  const def = stack && itemDef(stack.id);
  if (!stack) return;
  if (def.rare && !confirm(`Drop rare item ${def.name}?`)) return;
  removeItem(index, stack.qty);
  Game.selectedInventoryIndex = null;
  Game.uiDirty = true;
  logMsg(`Dropped ${def.name}.`);
}
