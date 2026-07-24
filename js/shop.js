
const RARE_GOODS=[{id:'sunken_relic',sellPrice:50,reservationGroup:'relicbound_tackle'},{id:'pearl_hook',sellPrice:500,reservationGroup:'relicbound_tackle'}];
function nextRelicboundRecipe(){if(typeof normalizeFishingState==='function')normalizeFishingState();if(typeof forgeRecipe!=='function')return null;if(!Game.state.upgrades.relicbound_tackle_1)return forgeRecipe('relicbound_tackle_1');if(!Game.state.upgrades.relicbound_tackle_2)return forgeRecipe('relicbound_tackle_2');if(!Game.state.upgrades.relicbound_tackle_3)return forgeRecipe('relicbound_tackle_3');return null}
function rareGoodDefinition(id){return RARE_GOODS.find(g=>g.id===id)}
function rareGoodReservation(id){const r=nextRelicboundRecipe();return {qty:r?(r.materials[id]||0):0,recipe:r}}
function rareGoodSummary(id){const def=rareGoodDefinition(id),res=rareGoodReservation(id),total=ownedItemQuantity(id);return {def,res,total,inv:inventoryItemQuantity(id),bank:bankItemQuantity(id),excess:Math.max(0,total-res.qty),value:def.sellPrice}}
function renderRareGoods(){return `<h2>Rare Goods</h2><div class="rare-note">Rare Goods sales remove inventory copies first, then banked copies.</div>${RARE_GOODS.map(g=>{const s=rareGoodSummary(g.id),name=itemDef(g.id).name,res=s.res.recipe?`Reserved for ${s.res.recipe.name}: ${s.res.qty.toLocaleString()}`:'Reserved: 0',all=s.res.recipe?'':'<div class="rare-note">All duplicates are sellable</div>';return `<div class="entry rare-good-card"><h3>${name}</h3><div>Inventory: ${s.inv.toLocaleString()}</div><div>Bank: ${s.bank.toLocaleString()}</div><div>Total owned: ${s.total.toLocaleString()}</div><div class="reserved">${res}</div>${all}<div class="sellable">Sellable excess: ${s.excess.toLocaleString()}</div><div class="sale-value">Value: ${s.value.toLocaleString()} coins each</div><div>Total excess value: ${(s.excess*s.value).toLocaleString()} coins</div><button onclick="sellRareGood('${g.id}',1)">Sell 1</button> <button onclick="sellRareGoodExcess('${g.id}')" ${s.excess>0?'':'disabled'}>Sell all excess</button> <input class="rare-qty" id="sell-${g.id}" type="number" min="1" step="1"> <button onclick="sellRareGood('${g.id}',document.getElementById('sell-${g.id}').value)">Sell quantity</button></div>`}).join('')}`}
function validateRareSale(id,qty){qty=Number(qty);if(!Number.isInteger(qty)||qty<=0)return {ok:false,reason:'Enter a whole quantity greater than zero.'};const s=rareGoodSummary(id);if(!s.def)return {ok:false,reason:'Rare good unavailable.'};if(qty>s.total)return {ok:false,reason:`You only own ${s.total.toLocaleString()} ${itemDef(id).name}.`};return {ok:true,qty,summary:s}}
function completeRareSale(id,qty){const s=rareGoodSummary(id);if(!removeOwnedItemQuantity(id,qty))return shopFeedback('Sale failed; items were not removed.','bad');addItem('coins',qty*s.value);shopFeedback(`Sold ${qty.toLocaleString()} ${itemDef(id).name} for ${(qty*s.value).toLocaleString()} coins.`)}
function sellRareGoodExcess(id){const s=rareGoodSummary(id);if(s.excess<=0)return shopFeedback('No sellable excess available.','bad');completeRareSale(id,s.excess)}
function sellRareGood(id,qty){const v=validateRareSale(id,qty);if(!v.ok)return shopFeedback(v.reason,'bad');if(v.qty>v.summary.excess){const r=v.summary.res.recipe,one=v.qty===1;const msg=one?`Selling this ${itemDef(id).name} will leave you without enough materials for ${r?r.name:'the next upgrade'}. Continue?`:`This sale will use items reserved for ${r?r.name:'the next upgrade'}. Continue?`;if(!confirm(msg))return}completeRareSale(id,v.qty)}
function shopEntryName(entry) {
  return entry.name || itemDef(entry.id).name;
}

function formatCoins(amount) {
  return Math.max(0, amount).toLocaleString();
}

function formatSkill(skill) {
  return skill ? skill[0].toUpperCase() + skill.slice(1) : '';
}

function toolStats(def) {
  const tier = def.tier || 1;
  return {
    speedBonus: `${Math.max(0, (tier - 1) * 11)}%`,
    successChance: `${Math.min(100, (78 + tier * 3.5)).toFixed(1)}%`,
    doubleChance: `${Math.max(0, tier * 3)}%`,
  };
}

function shopEntryDetails(entry) {
  const details = [];
  if (entry.type === 'item') {
    const def = itemDef(entry.id);
    details.push(`Type: ${def.slot === 'weapon' ? 'Weapon' : def.slot === 'armor' ? 'Armor' : formatSkill(def.type)}`);
    if (def.skill) details.push(`Requires ${formatSkill(def.skill)} ${CONFIG.tierReq[def.tier]}`);
    if (def.type === 'tool') {
      const stats = toolStats(def);
      details.push(`Tier ${def.tier}`);
      details.push(`Required skill level ${CONFIG.tierReq[def.tier]}`);
      details.push(`Gathering speed bonus ${stats.speedBonus}`);
      details.push(`Success chance ${stats.successChance}`);
      details.push(`Double-resource chance ${stats.doubleChance}`);
    }
    if (def.slot === 'weapon') {
      details.push(`Accuracy bonus ${def.stats.accuracy || 0}`);
      details.push(`Maximum damage ${def.stats.maxDamage || 0}`);
    }
    if (def.slot === 'armor') details.push(`Defence bonus ${def.stats.defence || 0}`);
  } else if (entry.type === 'upgrade') {
    details.push('Type: Upgrade');
  } else if (entry.type === 'fame') {
    details.push('Type: Fame');
    details.push(`Grants ${formatCoins(entry.amount)} Fame`);
  } else if (entry.type === 'cosmetic') {
    details.push('Type: Cosmetic');
  } else {
    details.push(`Type: ${formatSkill(entry.type)}`);
  }
  return details;
}

function shopOwnership(entry) {
  if (entry.type === 'item') {
    const def = itemDef(entry.id);
    const inInventory = Game.state.inventory.some((stack) => stack.id === entry.id);
    const equipped = Object.values(Game.state.equipment).includes(entry.id);
    const ownedTool = def.type === 'tool' && Game.state.ownedTools.includes(entry.id);
    return inInventory || equipped || ownedTool;
  }
  if (entry.type === 'upgrade' || entry.type === 'cosmetic') return !!Game.state.upgrades[entry.id];
  return false;
}

function shopValidation(entry) {
  if (!entry) return { ok: false, label: 'Unavailable', reason: 'That shop item is unavailable.' };
  const name = shopEntryName(entry);
  if (entry.type === 'item') {
    const def = itemDef(entry.id);
    if (def.skill && Game.state.skills[def.skill].level < CONFIG.tierReq[def.tier]) {
      return { ok: false, label: `Requires ${formatSkill(def.skill)} ${CONFIG.tierReq[def.tier]}`, reason: `You need ${formatSkill(def.skill)} level ${CONFIG.tierReq[def.tier]} to buy the ${name}.` };
    }
  }
  if (Game.state.coins < entry.price) {
    return { ok: false, label: `Need ${formatCoins(entry.price - Game.state.coins)} more coins`, reason: `You need ${formatCoins(entry.price - Game.state.coins)} more coins to buy the ${name}.` };
  }
  if (entry.type === 'item' && !hasSpaceFor(entry.id)) return { ok: false, label: 'Inventory full', reason: 'Your inventory is full.' };
  if (entry.type === 'upgrade' && Game.state.upgrades[entry.id]) return { ok: false, label: 'Already purchased', reason: `${name} is already purchased.` };
  if (entry.type === 'cosmetic' && Game.state.upgrades[entry.id]) return { ok: false, label: 'Owned', reason: `${name} is already owned.` };
  return { ok: true, label: 'Buy', reason: '' };
}

function shopStatusClass(validation) {
  return validation.ok ? 'good' : 'bad';
}

function renderShopEntries() {
  return SHOP.map((entry) => {
    const name = shopEntryName(entry);
    const validation = shopValidation(entry);
    const owned = shopOwnership(entry);
    const affordable = Game.state.coins >= entry.price;
    const details = shopEntryDetails(entry).map((line) => `<li>${line}</li>`).join('');
    return `<div class="entry shop-entry"><div><b>${name}</b></div><div>Price: ${formatCoins(entry.price)} coins</div><div>Owned: ${owned ? 'Yes' : 'No'}</div><div>Can afford: ${affordable ? 'Yes' : 'No'}</div><ul>${details}</ul><button onclick="buy('${entry.id}')" ${validation.ok ? '' : 'disabled'}>${validation.label}</button><span class="shop-status ${shopStatusClass(validation)}">${validation.ok ? (owned ? 'Owned' : '') : validation.label}</span></div>`;
  }).join('');
}

function openShop(message) {
  if (message !== undefined) Game.shopMessage = message;
  const feedback = Game.shopMessage ? `<div id="shopFeedback" class="msg ${Game.shopMessage.cls || ''}">${Game.shopMessage.text}</div>` : '<div id="shopFeedback" class="msg"></div>';
  modal('Merchant Hall', `<div class="shop-summary"><b>Coins:</b> ${formatCoins(Game.state.coins)}</div>${feedback}<button onclick="sellAll()">Sell resources and ordinary drops</button>${renderRareGoods()}<div>${renderShopEntries()}</div>`);
}

function shopFeedback(text, cls) {
  Game.shopMessage = { text, cls };
  logMsg(text, cls);
  Game.uiDirty = true;
  openShop(Game.shopMessage);
}

function buy(id) {
  const entry = SHOP.find((shopEntry) => shopEntry.id === id);
  const validation = shopValidation(entry);
  if (!validation.ok) return shopFeedback(validation.reason, 'bad');

  const name = shopEntryName(entry);
  let applied = false;
  if (entry.type === 'item') {
    const def = itemDef(entry.id);
    applied = addItem(entry.id, 1);
    if (!applied) return shopFeedback('Your inventory is full.', 'bad');
    if (def.type === 'tool' && !Game.state.ownedTools.includes(entry.id)) Game.state.ownedTools.push(entry.id);
    discover(entry.id);
  } else if (entry.type === 'upgrade') {
    if (Game.state.upgrades[id]) return shopFeedback(`${name} is already purchased.`, 'bad');
    Game.state.upgrades[id] = true;
    if (id === 'inv_4') Game.state.invCap += 4;
    applied = true;
  } else if (entry.type === 'fame') {
    Game.state.fame += entry.amount;
    Game.state.counts.fameBought += entry.amount;
    applied = true;
  } else {
    if (entry.type === 'cosmetic' && Game.state.upgrades[id]) return shopFeedback(`${name} is already owned.`, 'bad');
    Game.state.upgrades[id] = true;
    applied = true;
  }

  if (!applied) return shopFeedback(`Could not buy ${name}.`, 'bad');
  Game.state.coins -= entry.price;
  shopFeedback(`Purchased ${name} for ${formatCoins(entry.price)} coins.`);
}

function sellAll(){let total=0;for(let i=Game.state.inventory.length-1;i>=0;i--){let s=Game.state.inventory[i],d=itemDef(s.id);if(['log','ore','fish','drop','rare'].includes(d.type)&&!d.rare){total+=d.value*s.qty;Game.state.inventory.splice(i,1)}}if(total){addItem('coins',total);shopFeedback(`Sold goods for ${total} coins.`)}Game.selectedInventoryIndex=null;Game.uiDirty=true;openShop()}
