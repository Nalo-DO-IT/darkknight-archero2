import { BOARD_POINTS } from './event-models.mjs';
import { HIGH_MULTIPLIER_TILES } from './treasure.mjs';

// Locations and colors checked against the original numbered island and game screenshot.
export const ISLAND_TILES = Object.freeze([
  [201,268,'purple'],[175,286,'green'],[149,304,'white'],[123,286,'purple'],
  [97,268,'yellow'],[71,250,'white'],[45,232,'purple'],[71,214,'green'],
  [97,196,'big_purple'],[71,178,'green'],[97,160,'gold'],[71,142,'white'],
  [97,124,'blue'],[123,106,'green'],[149,88,'purple'],[175,106,'blue'],
  [201,124,'yellow'],[227,142,'green'],[253,160,'white'],[227,178,'blue'],
  [201,196,'gold'],[227,214,'green'],[253,232,'big_purple'],[227,250,'blue']
].map(([x,y,color],id)=>Object.freeze({id,x,y,color})));

// Viewports display the original, unmodified game sprite atlas; no raster edits.
export const SPRITES = Object.freeze({
  pawn:[1490,198,110,154], gem:[855,715,188,165], gift:[1324,1142,206,216],
  prize:[1076,743,214,166], machine:[277,173,185,140], fate:[1525,1106,210,139],
  token:[1727,1849,168,182], roll:[97,863,318,294], star:[1650,494,135,147],
  chest:[1325,977,196,166], arrow:[1675,144,68,86],
  die1:[1718,1265,140,140], die2:[905,278,153,146], die3:[1218,218,140,133],
  die4:[905,133,140,142], die5:[1338,353,142,138], die6:[1479,351,133,137]
});

export const TREASURE_ART = Object.freeze([
  'assets/treasure/island.png','assets/treasure/atlas.png','assets/treasure/reference.jpeg',
  ...['purple','green','white','yellow','big_purple','gold','blue'].map((color)=>`assets/treasure/${color}.png`)
]);

export function tileReward(id, multiplier = 1) {
  if (!Number.isInteger(id)||id<0||id>23) throw new RangeError('Invalid island tile.');
  if (![0,1,2,3,5,10].includes(multiplier)) throw new RangeError('Invalid reward multiplier.');
  if (BOARD_POINTS[id]) return { icon:'token', amount:BOARD_POINTS[id]*multiplier, key:'pointUnit' };
  if ([1,7].includes(id)) return { icon:'gem', amount:50*multiplier, key:'gems' };
  if ([6,14].includes(id)) return { icon:'die1', amount:2*multiplier, key:'diceUnit' };
  if (id===8) return { icon:'prize', key:'prize' };
  if ([10,20].includes(id)) return { icon:'machine', key:'wheel' };
  if (id===22) return { icon:'fate', key:'fate' };
  return { icon:'gift', key:'gift' };
}

export function sprite(name, prefix, attributes = '') {
  if (!Object.hasOwn(SPRITES,name)) throw new RangeError('Unknown game sprite.');
  return `<svg viewBox="${SPRITES[name].join(' ')}" class="game-sprite sprite-${name}" aria-hidden="true" focusable="false" ${attributes}><image href="${prefix}assets/treasure/atlas.png" width="2048" height="2048"/></svg>`;
}

export function movePath(from, steps) {
  if (!Number.isInteger(from)||from<0||from>23||!Number.isInteger(steps)||steps<2||steps>12) throw new RangeError('Invalid island move.');
  return Array.from({length:steps},(_,index)=>(from+index+1)%24);
}

export function renderTreasureBoard(t, prefix) {
  const tiles = [...ISLAND_TILES].sort((a,b)=>a.y-b.y).map((tile)=>{
    const reward=tileReward(tile.id);
    const high=HIGH_MULTIPLIER_TILES.includes(tile.id);
    const label=`${t.tileNumber} ${tile.id}: ${reward.amount ?? ''} ${t[reward.key]}`;
    return `<button type="button" class="island-tile${high?' high-tile':''}" data-tile="${tile.id}" style="left:${tile.x/3.5}%;top:${tile.y/3.7}%" aria-label="${label}" title="${label}"><img src="${prefix}assets/treasure/${tile.color}.png" width="180" height="152" alt="" draggable="false"><span class="tile-reward${reward.amount?' flat-reward':' special-reward'}">${sprite(reward.icon,prefix)}${reward.amount?`<b data-reward-amount>×${reward.amount}</b>`:''}</span>${reward.amount?'':'<b class="tile-reward-scale" data-reward-amount hidden>×1</b>'}<span class="tile-number">${tile.id}</span>${high?'<span class="tile-strategy">×10</span>':''}</button>`;
  }).join('');
  return `<div class="island-game"><div class="island-hud"><div class="hud-score">${sprite('token',prefix)}<span>${t.score}<strong id="sim-score">0</strong></span></div><div class="hud-goal"><div class="goal-label"><span>${t.nextMilestone}</span><strong id="sim-next-goal">2,000</strong></div><progress id="sim-progress" max="2000" value="0">0</progress></div>${sprite('chest',prefix)}</div><div class="island-map" id="island-map" aria-label="${t.islandMap}"><img class="island-ground" src="${prefix}assets/treasure/island.png" width="734" height="860" alt="" draggable="false">${tiles}<div class="island-monument">${sprite('star',prefix)}</div><div class="island-dice" id="sim-faces">${sprite('die1',prefix,'data-die="0"')}${sprite('die3',prefix,'data-die="1"')}</div><div class="island-pawn" id="sim-pawn" aria-hidden="true">${sprite('arrow',prefix)}${sprite('pawn',prefix)}</div></div><div class="island-controls"><div class="dice-wallet">${sprite('die1',prefix)}<span>${t.diceLeft}<strong id="sim-dice-left">100</strong></span></div><button type="button" id="sim-roll" class="island-roll" aria-label="${t.roll}">${sprite('roll',prefix)}<span>${t.roll}</span></button><div class="multiplier-current"><span>${t.multiplier}</span><strong id="sim-multiplier">×1</strong></div></div><div class="multiplier-picker" role="group" aria-label="${t.manualMultiplier}">${[1,2,3,5,10].map((n)=>`<button type="button" data-bet="${n}" aria-pressed="false">×${n}</button>`).join('')}<button type="button" id="sim-smart" aria-pressed="true">${t.smartShort}</button></div></div><p class="board-key">${t.high} ${t.boardHelp}</p><div class="landing-card" id="landing-card"><span id="sim-tile-reward"></span><strong id="sim-current-tile">${t.tileNumber} 0</strong></div><div class="game-stats"><div><span>${t.turns}</span><strong id="sim-turns">0</strong></div><div><span>${t.taskProgress}</span><strong id="sim-task-progress">0</strong></div><div><span>${t.lastReward}</span><strong id="sim-last-reward">—</strong></div></div><div class="game-actions"><button type="button" id="sim-finish">${t.finish}</button><button type="button" id="sim-estimate">${t.estimate}</button><button type="button" id="sim-cancel" hidden>${t.cancel}</button></div><p id="sim-message" class="sim-message" role="status" aria-live="polite">${t.ready}</p><details class="board-reference"><summary>${t.referenceImage}</summary><a href="${prefix}assets/treasure/reference.jpeg" target="_blank" rel="noopener"><img src="${prefix}assets/treasure/reference.jpeg" alt="${t.referenceAlt}" width="2112" height="2475" loading="lazy"></a><a href="https://ksun4176.github.io/archero2-island-treasure-hunt/" target="_blank" rel="noopener noreferrer">${t.originalProject} ↗</a></details>`;
}
