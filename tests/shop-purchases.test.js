const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

class FakeElement {
  constructor(id) {
    this.id = id;
    this.style = {};
    this._innerHTML = '';
    this.textContent = '';
    this.classList = { add() {}, remove() {}, toggle() {} };
  }
  set innerHTML(value) { this._innerHTML = value; }
  get innerHTML() { return this._innerHTML; }
}

function createContext() {
  const elements = {};
  const context = {
    console,
    performance: { now: () => 1000 },
    Date,
    Math,
    document: { getElementById: (id) => elements[id] || (elements[id] = new FakeElement(id)) },
    confirm: () => true,
  };
  context.window = context;
  vm.createContext(context);
  for (const file of ['js/config.js', 'js/data.js', 'js/state.js', 'js/pity.js','js/collection-log.js', 'js/inventory.js', 'js/ui.js', 'js/shop.js']) {
    vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
  }
  context.Game = vm.runInContext('Game', context);
  context.SHOP = vm.runInContext('SHOP', context);
  context.CONFIG = vm.runInContext('CONFIG', context);
  context.sound = () => {};
  return { context, elements };
}

function resetForCrescent(context) {
  const Game = context.Game;
  Game.state.coins = 4860;
  Game.state.inventory = [];
  Game.state.invCap = 24;
  Game.state.skills.woodcutting.level = 30;
  Game.state.ownedTools = ['woodcutting_tool_1'];
  Game.state.upgrades = {};
  Game.shopMessage = null;
}

function countItem(Game, id) {
  return Game.state.inventory.filter((stack) => stack.id === id).reduce((sum, stack) => sum + stack.qty, 0);
}

const { context, elements } = createContext();
const Game = context.Game;

const crescent = context.SHOP.find((entry) => entry.id === 'woodcutting_tool_3');
assert(crescent, 'Crescent Axe should be in the shop');
assert.strictEqual(crescent.price, 4860, 'Crescent Axe should cost 4,860 coins');
assert.strictEqual(context.CONFIG.tierReq[context.itemDef('woodcutting_tool_3').tier], 30, 'Crescent Axe should require Woodcutting level 30');

resetForCrescent(context);
Game.state.skills.woodcutting.level = 29;
const level29Coins = Game.state.coins;
context.openShop();
assert(elements.modalBody.innerHTML.includes('Requires Woodcutting 30'), 'Modal should show Crescent Axe level requirement');
context.buy('woodcutting_tool_3');
assert.strictEqual(Game.state.coins, level29Coins, 'Failed level check should not deduct coins');
assert.strictEqual(countItem(Game, 'woodcutting_tool_3'), 0, 'Level-29 player should not receive Crescent Axe');
assert(elements.modalBody.innerHTML.includes('You need Woodcutting level 30 to buy the Crescent Axe.'), 'Level failure should appear inside the shop modal');

resetForCrescent(context);
Game.state.coins = 3620;
context.openShop();
assert(elements.modalBody.innerHTML.includes('Need 1,240 more coins'), 'Modal should show exact missing coins');
context.buy('woodcutting_tool_3');
assert.strictEqual(Game.state.coins, 3620, 'Insufficient coin failure should not deduct coins');
assert.strictEqual(countItem(Game, 'woodcutting_tool_3'), 0, 'Insufficient coins should not receive Crescent Axe');
assert(elements.modalBody.innerHTML.includes('You need 1,240 more coins to buy the Crescent Axe.'), 'Coin failure should appear inside the shop modal');

resetForCrescent(context);
context.buy('woodcutting_tool_3');
assert.strictEqual(Game.state.coins, 0, 'Successful purchase should deduct the exact Crescent Axe price once');
assert.strictEqual(countItem(Game, 'woodcutting_tool_3'), 1, 'Successful purchase should add Crescent Axe to inventory');
assert(Game.state.ownedTools.includes('woodcutting_tool_3'), 'Successful tool purchase should update owned tools');
assert(elements.modalBody.innerHTML.includes('Purchased Crescent Axe for 4,860 coins.'), 'Success should appear inside the shop modal');
assert(elements.modalBody.innerHTML.includes('<b>Coins:</b> 0'), 'Shop coin total should refresh after purchase');

resetForCrescent(context);
Game.state.inventory = Array.from({ length: Game.state.invCap }, () => ({ id: 'brushwood', qty: 1 }));
const fullCoins = Game.state.coins;
context.buy('woodcutting_tool_3');
assert.strictEqual(Game.state.coins, fullCoins, 'Full inventory failure should not deduct coins');
assert.strictEqual(countItem(Game, 'woodcutting_tool_3'), 0, 'Full inventory should block item purchases');
assert(elements.modalBody.innerHTML.includes('Your inventory is full.'), 'Full inventory failure should appear inside the shop modal');

resetForCrescent(context);
Game.state.coins = 4860;
context.buy('woodcutting_tool_3');
context.buy('woodcutting_tool_3');
assert.strictEqual(Game.state.coins, 0, 'Rapid second purchase without enough coins should not deduct below zero');
assert.strictEqual(countItem(Game, 'woodcutting_tool_3'), 1, 'Rapid double click should not duplicate a purchase without enough coins for both');

resetForCrescent(context);
Game.state.coins = 100000;
Game.state.skills.mining.level = 10;
Game.state.skills.fishing.level = 10;
for (const id of ['mining_tool_2', 'fishing_tool_2', 'training_sword', 'frontier_blade', 'cloth_vest']) {
  context.buy(id);
  assert(countItem(Game, id) >= 1, `${id} should still be purchasable`);
}
context.buy('inv_4');
assert.strictEqual(Game.state.upgrades.inv_4, true, 'Inventory upgrade should still apply');
assert.strictEqual(Game.state.invCap, 28, 'Inventory upgrade should increase capacity');
context.buy('cosmetic_cloak');
assert.strictEqual(Game.state.upgrades.cosmetic_cloak, true, 'Cosmetic purchase should still apply');
const fameBefore = Game.state.fame;
context.buy('fame_100');
assert.strictEqual(Game.state.fame, fameBefore + 100, 'Fame purchase should still apply');

context.openShop();
const html = elements.modalBody.innerHTML;
assert(html.includes('Type: Tool'), 'Tool entries should show item type');
assert(html.includes('Gathering speed bonus'), 'Tool entries should show gathering speed bonus');
assert(html.includes('Success chance'), 'Tool entries should show success chance');
assert(html.includes('Double-resource chance'), 'Tool entries should show double-resource chance');
assert(html.includes('Accuracy bonus'), 'Weapon entries should show accuracy bonus');
assert(html.includes('Maximum damage'), 'Weapon entries should show maximum damage');
assert(html.includes('Defence bonus'), 'Armor entries should show defence bonus');

console.log('Shop purchase tests passed');
