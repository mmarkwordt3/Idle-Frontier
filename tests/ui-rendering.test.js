const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

class FakeElement {
  constructor(id) {
    this.id = id;
    this.style = {};
    this._innerHTML = '';
    this.textContent = '';
    this.writeCount = 0;
    this.firstElementChild = { owner: id, version: 0 };
    this.classList = { add() {}, remove() {}, toggle() {} };
  }
  set innerHTML(value) {
    this._innerHTML = value;
    this.writeCount += 1;
    this.firstElementChild = { owner: this.id, version: this.writeCount };
  }
  get innerHTML() {
    return this._innerHTML;
  }
}

const elements = {};
const ids = ['hp', 'coins', 'fame', 'action', 'progress', 'skills', 'inventory', 'equipment', 'log', 'itemInfo', 'modalTitle', 'modalBody', 'modal'];
for (const id of ids) elements[id] = new FakeElement(id);

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

const Game = vm.runInContext('Game', context);
context.Game = Game;
context.sound = () => {};

Game.state.skills.woodcutting.level = 10;
Game.state.coins = 2000;
Game.state.inventory = [];
Game.state.equipment.woodcutting = 'woodcutting_tool_1';
context.buy('woodcutting_tool_2');
assert(Game.state.inventory.some((stack) => stack.id === 'woodcutting_tool_2'), 'Buying Bronzebite Axe should place it in inventory');
Game.uiDirty = true;

context.renderStateUI();
const initialWrites = elements.inventory.writeCount;
const stableSlot = elements.inventory.firstElementChild;

for (let i = 0; i < 10; i += 1) {
  context.renderLiveUI();
}
assert.strictEqual(elements.inventory.writeCount, initialWrites, 'Inventory should not be rebuilt by live UI rendering');
assert.strictEqual(elements.inventory.firstElementChild, stableSlot, 'Inventory slot object should remain stable during live UI updates');

context.selectItem(0);
assert.strictEqual(Game.selectedInventoryIndex, 0, 'Selecting a slot should store the selected index');
assert(elements.itemInfo.innerHTML.includes('Bronzebite Axe'), 'Selected tool info should show the item name');
assert(elements.itemInfo.innerHTML.includes('Equip'), 'Selected tool info should show Equip');
assert(elements.itemInfo.innerHTML.includes('Drop'), 'Selected tool info should show Drop');
assert(!elements.itemInfo.innerHTML.includes('Use'), 'Selected tool info should not show Use');

context.equipIndex(0);
assert.strictEqual(Game.state.equipment.woodcutting, 'woodcutting_tool_2', 'Equipping should update the equipment slot');
assert(Game.state.inventory.some((stack) => stack.id === 'woodcutting_tool_1'), 'Old tool should return to inventory');
assert.strictEqual(Game.selectedInventoryIndex, null, 'Selection should clear after equip');
assert(Game.state.log.some((entry) => entry.t === 'Equipped Bronzebite Axe.'), 'Equip should log the equipped item');

const countBeforeEmptySelect = elements.itemInfo.writeCount;
context.selectItem(99);
assert.strictEqual(Game.selectedInventoryIndex, null, 'Empty or invalid slots should clear selection safely');
assert(elements.itemInfo.writeCount >= countBeforeEmptySelect, 'Empty selection should not throw and may clear item info');

Game.state.inventory = [{ id: 'minnows', qty: 1 }];
Game.selectedInventoryIndex = 0;
context.removeItem(0, 1);
assert.strictEqual(Game.selectedInventoryIndex, null, 'Selection should clear when selected item is removed');

console.log('UI rendering tests passed');
