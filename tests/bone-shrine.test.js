const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

class El{constructor(){this.innerHTML='';this.textContent='';this.style={};this.classList={add(){},remove(){}}}}
function ctx(){
  const elements={};
  const c={console,Date,Math:Object.create(Math),performance:{now:()=>1000},document:{getElementById:id=>elements[id]||(elements[id]=new El()),addEventListener(){}},confirm:()=>true,localStorage:{getItem(){return null},setItem(){}},requestAnimationFrame(){},setInterval(){}};
  c.Math.NaN=NaN;c.Math.Infinity=Infinity;c.window=c;vm.createContext(c);
  ['js/config.js','js/data.js','js/state.js','js/inventory.js','js/map.js','js/pathfinding.js','js/player.js','js/tasks.js','js/achievements.js','js/collection-log.js','js/bank.js','js/shop.js','js/forge.js','js/shrine.js','js/combat.js','js/gathering-modes.js','js/actions.js','js/renderer.js','js/save.js','js/ui.js','js/input.js'].forEach(f=>vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f}));
  c.sound=()=>{};c.modal=(t,b)=>{(elements.modalTitle||(elements.modalTitle=new El())).textContent=t;(elements.modalBody||(elements.modalBody=new El())).innerHTML=b};
  return {c,elements,G:vm.runInContext('Game',c)};
}
function reset(env){env.G.state=env.c.newState();env.G.map=env.c.makeMap();env.c.spawnObjects();env.G.state.invCap=500;env.G.shrineMessage=null;}
function addBones(G,inv,bank){G.state.inventory=[];if(Array.isArray(inv))G.state.inventory=inv.map(q=>({id:'bones',qty:q}));else if(inv)G.state.inventory=[{id:'bones',qty:inv}];G.state.bank={};if(bank)G.state.bank.bones=bank;}
function snap(G){return JSON.stringify({inv:G.state.inventory,bank:G.state.bank,xp:G.state.skills.constitution.xp,count:G.state.counts.bonesSacrificed,coins:G.state.coins});}
let {c,elements,G}=ctx();reset({c,elements,G});
assert.strictEqual(vm.runInContext('BONE_SACRIFICE_XP',c),8);
addBones(G,5,0);assert.strictEqual(c.bonesOwned(),5,'inventory bones count');addBones(G,0,7);assert.strictEqual(c.bonesOwned(),7,'bank bones count');addBones(G,5,7);assert.strictEqual(c.bonesOwned(),12,'combined bones count');addBones(G,[3,4,5],0);assert.strictEqual(c.bonesOwned(),12,'multiple inventory stacks count');

reset({c,elements,G});G.state.inventory=[{id:'bones',qty:4},{id:'stone',qty:9}];G.state.bank={bones:6,stone:11};c.sacrificeBones(7);assert.strictEqual(c.inventoryItemQuantity('bones'),0);assert.strictEqual(c.bankItemQuantity('bones'),3);assert.strictEqual(c.ownedItemQuantity('bones'),3);assert.strictEqual(c.ownedItemQuantity('stone'),20,'unrelated items unchanged');

reset({c,elements,G});addBones(G,1,0);c.sacrificeBones(1);assert.strictEqual(c.bonesOwned(),0);assert.strictEqual(G.state.skills.constitution.xp,8);assert.strictEqual(G.state.counts.bonesSacrificed,1);assert(G.state.log.some(e=>e.t==='Sacrificed 1 Bone and gained 8 Constitution XP.'));
reset({c,elements,G});addBones(G,10,0);c.sacrificeBones(10);assert.strictEqual(c.bonesOwned(),0);assert.strictEqual(G.state.skills.constitution.xp,80);assert.strictEqual(G.state.counts.bonesSacrificed,10);
reset({c,elements,G});addBones(G,100,0);c.sacrificeBones(100);assert.strictEqual(c.bonesOwned(),0);assert.strictEqual(G.state.skills.constitution.xp,800);assert.strictEqual(G.state.counts.bonesSacrificed,100);
reset({c,elements,G});addBones(G,5,7);c.sacrificeBones('all');assert.strictEqual(c.bonesOwned(),0);assert.strictEqual(G.state.skills.constitution.xp,96);

reset({c,elements,G});addBones(G,9,0);const before=snap(G);assert.strictEqual(c.sacrificeBones(10),false);assert.strictEqual(snap(G),before,'insufficient fixed sacrifice does not mutate');
for(const q of [0,-1,1.5,NaN,Infinity,'everything',null,undefined]){reset({c,elements,G});addBones(G,20,0);const b=snap(G);assert.strictEqual(c.sacrificeBones(q),false,`invalid ${q} should fail`);assert.strictEqual(snap(G),b);}

reset({c,elements,G});addBones(G,100,0);G.state.skills.constitution.xp=c.xpForLevel(c.CONFIG.MAX_LEVEL);G.state.skills.constitution.level=c.CONFIG.MAX_LEVEL;const maxBefore=snap(G);assert.strictEqual(c.sacrificeBones(1),false);assert.strictEqual(snap(G),maxBefore);c.openMemorialShrine();assert(elements.modalBody.innerHTML.includes('Constitution is already at the maximum level.'));assert.strictEqual((elements.modalBody.innerHTML.match(/disabled/g)||[]).length,4,'all controls disabled at max');

reset({c,elements,G});addBones(G,10,0);G.state.skills.constitution.xp=c.xpForLevel(c.CONFIG.MAX_LEVEL)-3;G.state.skills.constitution.level=c.levelForXp(G.state.skills.constitution.xp);c.sacrificeBones(1);assert.strictEqual(c.bonesOwned(),9);assert.strictEqual(G.state.skills.constitution.xp,c.xpForLevel(c.CONFIG.MAX_LEVEL));assert.strictEqual(G.state.skills.constitution.level,c.CONFIG.MAX_LEVEL);assert.strictEqual(c.sacrificeBones(1),false);assert.strictEqual(c.bonesOwned(),9);
reset({c,elements,G});addBones(G,100,0);G.state.skills.constitution.xp=c.xpForLevel(c.CONFIG.MAX_LEVEL)-24;G.state.skills.constitution.level=c.levelForXp(G.state.skills.constitution.xp);c.sacrificeBones('all');assert.strictEqual(c.bonesOwned(),97);assert.strictEqual(G.state.skills.constitution.xp,c.xpForLevel(c.CONFIG.MAX_LEVEL));

for(const [input,expected] of [[undefined,0],[-5,0],[3.9,3],[NaN,0],[Infinity,0],[12,12]]){reset({c,elements,G});if(input===undefined)delete G.state.counts.bonesSacrificed;else G.state.counts.bonesSacrificed=input;c.normalizeShrineState();assert.strictEqual(G.state.counts.bonesSacrificed,expected,`normalize ${input}`);}

reset({c,elements,G});const coords={bank:[44,48],shop:[47,48],fountain:[50,48],tasks:[53,48],fame:[56,48],forge:[59,48],shrine:[62,48]};for(const [id,[x,y]] of Object.entries(coords)){const o=G.objects.find(obj=>obj.id===id);assert(o,`${id} exists`);assert.strictEqual(o.x,x);assert.strictEqual(o.y,y);}assert.strictEqual(G.objects.find(o=>o.id==='shrine').name,'Memorial Shrine');
let opened=[];c.openMemorialShrine=()=>opened.push('shrine');c.openShop=()=>opened.push('shop');c.openForge=()=>opened.push('forge');c.openTasks=()=>opened.push('tasks');c.interact(G.objects.find(o=>o.id==='shrine'));assert.deepStrictEqual(opened,['shrine']);
const renderer=fs.readFileSync('js/renderer.js','utf8');assert(renderer.includes("object.id==='shrine'"));assert(renderer.includes("object.id==='forge'"));
const bonesDef=vm.runInContext('ITEM.bones',c);assert.strictEqual(bonesDef.value,3);assert.strictEqual(bonesDef.type,'drop');assert(bonesDef.description.includes('Memorial Shrine'));assert(!bonesDef.heal);assert(!bonesDef.slot);assert(!bonesDef.use);

console.log('Bone shrine tests passed');
