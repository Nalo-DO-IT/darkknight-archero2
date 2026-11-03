import { treasureAdvice } from './treasure.mjs';

// Independently implemented facts from the pinned companion model, 20 September 2025.
export const TREASURE_SOURCE = 'https://github.com/ksun4176/archero2-dice-companion/blob/62798d88e03e5fb9eab88d8d929fb95ea548426c/app/_utils/simulate.ts';
export const FISHING_SOURCE = 'https://github.com/JGDevAlpha/archero-fish-companion/blob/962612dfbb6ac51a97fe2f5369714be1bc199c5d/index.html';
export const BOARD_POINTS = Object.freeze([400,0,50,400,800,50,0,0,0,0,0,50,200,0,0,200,800,0,50,200,0,0,0,200]);
export const POINT_THRESHOLDS = Object.freeze([2000,5000,8000,12000,16000,20000,22000,25000,28000,32000,36000,40000,42000,45000,48000,52000,56000,60000,62000,65000,68000,72000,76000,80000,82000,85000,88000,92000,96000,100000]);
export const TASK_THRESHOLDS = Object.freeze([5,10,20,30,40,60,80,100,150,200,250,300,350,400,450,500,600]);
export const TASK_DICE = Object.freeze([1,2,2,2,2,3,3,5,5,5,5,5,5,5,5,5,5]);
export const POOLS = Object.freeze({ normal: Object.freeze({ rare:30, epic:9, legendary:1 }), polar: Object.freeze({ rare:60, epic:18, legendary:2 }) });

function integer(value, name, min, max) {
  if (!Number.isSafeInteger(value) || value < min || value > max) throw new RangeError(`${name}: ${min}–${max}`);
  return value;
}
function randomUnit(random) {
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new RangeError('Random value must be in [0, 1).');
  return value;
}
export function weightedChoice(values, weights, random = Math.random) {
  if (values.length !== weights.length || !values.length || weights.some((weight) => !Number.isFinite(weight) || weight <= 0)) throw new RangeError('Invalid weighted outcomes.');
  let cursor = randomUnit(random) * weights.reduce((sum, value) => sum + value, 0);
  for (let index = 0; index < weights.length; index++) { cursor -= weights[index]; if (cursor < 0) return values[index]; }
  return values.at(-1);
}
export function createTreasureState({ dice = 100, tile = 0, points = 0, spent = 0, strategy = 'smart', refunds = true } = {}) {
  integer(dice, 'dice', 0, 5000); integer(tile, 'tile', 0, 23); integer(points, 'points', 0, 10000000); integer(spent, 'spent', 0, 1000000);
  if (!['smart', 'one', 'maximum'].includes(strategy)) throw new RangeError('Unknown strategy.');
  if (typeof refunds !== 'boolean') throw new TypeError('Refunds must be boolean.');
  return { dice, tile, points, spent, strategy, refunds, turns:0 };
}
export function rollTreasure(state, random = Math.random) {
  integer(state.dice, 'dice', 0, 100000); integer(state.tile, 'tile', 0, 23);
  if (state.dice === 0) throw new RangeError('No dice remaining.');
  const multiplier = state.strategy === 'one' ? 1 : treasureAdvice(state.strategy === 'maximum' ? 8 : state.tile, state.dice).multiplier;
  const faces = [1 + Math.floor(randomUnit(random) * 6), 1 + Math.floor(randomUnit(random) * 6)];
  const tile = (state.tile + faces[0] + faces[1]) % 24;
  let gain = BOARD_POINTS[tile] * multiplier;
  let boardDice = [6,14].includes(tile) ? 2 * multiplier : 0;
  if (tile === 8) boardDice = weightedChoice([0,2,1], [6664,666,2666], random) * multiplier;
  if ([10,20].includes(tile)) gain = weightedChoice([100,200,500,1000], [3478,3478,2608,434], random) * weightedChoice([1,3,5], [6153,3076,769], random) * multiplier;
  if (tile === 22) {
    const reward = weightedChoice(['points','dice','other'], [2500,1500,6000], random);
    gain = reward === 'points' ? 500 * multiplier : 0;
    boardDice = reward === 'dice' ? multiplier : 0;
  }
  const points = state.points + gain;
  const spent = state.spent + multiplier;
  const taskRefund = state.refunds ? TASK_THRESHOLDS.reduce((sum, threshold, index) => sum + (state.spent < threshold && spent >= threshold ? TASK_DICE[index] : 0), 0) : 0;
  const scoreRefund = state.refunds ? POINT_THRESHOLDS.filter((threshold) => state.points < threshold && points >= threshold).length * 2 : 0;
  return { ...state, tile, points, spent, dice:state.dice - multiplier + boardDice + taskRefund + scoreRefund, turns:state.turns + 1,
    last:{ faces, multiplier, gain, boardDice, taskRefund, scoreRefund } };
}
export function runTreasure(initial, random = Math.random, maxTurns = 50000) {
  let state = { ...initial };
  let moves = 0;
  while (state.dice > 0 && moves < maxTurns) { state = rollTreasure(state, random); moves++; }
  if (state.dice > 0) throw new Error('Simulation limit reached; no estimate produced.');
  return state;
}
export function summarizeScores(scores, target = 0) {
  if (!scores.length || scores.some((score) => !Number.isFinite(score) || score < 0)) throw new RangeError('Invalid scores.');
  const sorted = [...scores].sort((a,b) => a-b);
  const percentile = (p) => sorted[Math.floor((sorted.length - 1) * p)];
  return { count:sorted.length, low:percentile(.1), median:percentile(.5), high:percentile(.9), mean:Math.round(sorted.reduce((a,b)=>a+b,0)/sorted.length), success:sorted.filter((score)=>score>=target).length/sorted.length };
}
export function fishingOdds(pool, batch = 1) {
  for (const key of ['rare','epic','legendary']) integer(pool[key], key, 0, POOLS.polar[key]);
  integer(batch, 'batch', 1, 10);
  const total = pool.rare + pool.epic + pool.legendary;
  if (!total) return { total:0, next:0, chance:0, expected:0, count:0 };
  if (batch > total) throw new RangeError('Batch crosses pool refill.');
  let none = 1;
  for (let index=0; index<batch; index++) none *= Math.max(0, total-pool.legendary-index)/(total-index);
  return { total, next:pool.legendary/total, chance:1-none, expected:batch*pool.legendary/total, count:batch };
}
export function castFishing(pool, batch = 1, random = Math.random) {
  const odds = fishingOdds(pool, batch);
  if (!odds.total) throw new RangeError('Empty pool.');
  const remaining = { ...pool }; const caught = { rare:0, epic:0, legendary:0 };
  for (let index=0; index<batch; index++) {
    const kinds = Object.keys(remaining).filter((key)=>remaining[key]>0);
    const kind = weightedChoice(kinds, kinds.map((key)=>remaining[key]), random);
    remaining[kind]--; caught[kind]++;
  }
  return { remaining, caught };
}
