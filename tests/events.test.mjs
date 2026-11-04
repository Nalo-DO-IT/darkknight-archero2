import test from 'node:test';
import assert from 'node:assert/strict';
import { createTreasureState, rollTreasure, rollMultiplier, runTreasure, weightedChoice, summarizeScores, fishingOdds, castFishing, POOLS } from '../site/event-models.mjs';

const sequence = (...values) => { let index=0; return () => values[index++ % values.length]; };
const near = (actual,expected) => assert.ok(Math.abs(actual-expected)<1e-10, `${actual} != ${expected}`);

test('Treasure validates budgets, state and strategy', () => {
  for (const dice of [-1,5001,1.5,NaN,Infinity,'100']) assert.throws(()=>createTreasureState({dice}));
  for (const tile of [-1,24,0.5]) assert.throws(()=>createTreasureState({tile}));
  assert.throws(()=>createTreasureState({strategy:'unknown'}));
  assert.throws(()=>createTreasureState({refunds:'true'}));
  assert.throws(()=>rollTreasure(createTreasureState({dice:0})));
});
test('two independent dice move, cost multiplier once, only landing rewards count', () => {
  const result = rollTreasure(createTreasureState({dice:100,tile:22,refunds:false}),sequence(0,0));
  assert.equal(result.tile,0); assert.equal(result.points,4000); assert.equal(result.dice,90); assert.equal(result.spent,10);
  const pass = rollTreasure(createTreasureState({dice:10,tile:23,refunds:false}),sequence(0,0));
  assert.equal(pass.tile,1); assert.equal(pass.points,0); assert.equal(pass.turns,1);
});
test('strategy and held-dice cap use departure tile before spending', () => {
  for (const [dice,multiplier] of [[19,1],[20,2],[30,3],[50,5],[100,10]]) {
    const result = rollTreasure(createTreasureState({dice,tile:8,refunds:false}),sequence(0,0,.01,.01));
    assert.equal(result.last.multiplier,multiplier);
    assert.equal(result.points,100*multiplier);
  }
  assert.equal(rollTreasure(createTreasureState({tile:8,strategy:'one'}),()=>0).last.multiplier,1);
  assert.equal(rollTreasure(createTreasureState({tile:0,strategy:'maximum'}),()=>0).last.multiplier,10);
});

test('manual multipliers apply to any tile while respecting available-dice caps',()=>{
  for(const multiplier of [1,2,3,5,10]){
    const start=createTreasureState({dice:100,tile:0,strategy:'manual',multiplier,refunds:false});
    const result=rollTreasure(start,()=>0);
    assert.equal(result.last.multiplier,multiplier);
    assert.equal(result.points,50*multiplier);
    assert.equal(result.dice,100-multiplier);
  }
  assert.equal(rollMultiplier(createTreasureState({dice:99,strategy:'manual',multiplier:10})),5);
  assert.equal(rollMultiplier(createTreasureState({dice:19,strategy:'manual',multiplier:10})),1);
  assert.equal(rollMultiplier(createTreasureState({dice:0,strategy:'manual',multiplier:10})),0);
  for(const multiplier of [0,4,6,11,NaN,'10'])assert.throws(()=>createTreasureState({strategy:'manual',multiplier}));
});
test('wheel weights normalize their true sums and independent bonus draws', () => {
  assert.equal(weightedChoice([0,2,1],[6664,666,2666],()=>.9999),1);
  assert.equal(weightedChoice([100,200,500,1000],[3478,3478,2608,434],()=>.99999),1000);
  const wheel = rollTreasure(createTreasureState({tile:8,refunds:false}),sequence(0,0,.99,.99));
  assert.equal(wheel.points,50000);
  const prize = rollTreasure(createTreasureState({tile:6,refunds:false}),sequence(0,0,.7));
  assert.equal(prize.last.boardDice,2);
  const fate = rollTreasure(createTreasureState({tile:20,refunds:false}),sequence(0,0,.3));
  assert.equal(fate.last.boardDice,10); assert.equal(fate.points,0);
  assert.throws(()=>weightedChoice([1],[1],()=>1));
});
test('all crossed milestones pay once, prior claimed rewards never repeat', () => {
  const crossing = rollTreasure(createTreasureState({dice:100,tile:8,spent:0,points:1900}),sequence(0,0,.99,.99));
  assert.equal(crossing.last.taskRefund,3); // 5 and10 spent thresholds.
  assert.equal(crossing.last.scoreRefund,30); // 2k through48k, 15 thresholds.
  const claimed = rollTreasure(createTreasureState({dice:100,tile:8,spent:600,points:100000}),()=>0);
  assert.equal(claimed.last.taskRefund,0); assert.equal(claimed.last.scoreRefund,0);
  const boardDice = rollTreasure(createTreasureState({dice:10,tile:4,refunds:false}),()=>0);
  assert.equal(boardDice.dice,11);
});
test('full run stops, deterministic result, bounded runaway reported', () => {
  const finished = runTreasure(createTreasureState({dice:1,tile:0,refunds:false}),()=>0);
  assert.equal(finished.dice,0); assert.equal(finished.points,50);
  assert.throws(()=>runTreasure(createTreasureState({dice:100}),()=>0,1),/limit/);
  assert.equal(runTreasure(createTreasureState({dice:0,points:500})).points,500);
});
test('score percentiles and target fraction describe sample without mutation', () => {
  const scores=[100,400,200,300,500]; const copy=[...scores];
  const result=summarizeScores(scores,300);
  assert.equal(result.median,300); assert.equal(result.mean,300); assert.equal(result.success,.6);
  assert.deepEqual(scores,copy); assert.throws(()=>summarizeScores([]));
});
test('fishing exact no-replacement odds for normal and Polar pools', () => {
  near(fishingOdds(POOLS.normal,1).next,.025);
  near(fishingOdds(POOLS.normal,10).chance,.25);
  near(fishingOdds(POOLS.polar,10).chance,1-(70*69)/(80*79));
  near(fishingOdds({rare:9,epic:0,legendary:1},10).chance,1);
  near(fishingOdds({rare:30,epic:0,legendary:0},10).chance,0);
});
test('fishing empty pool, invalid counts and crossing refill are explicit', () => {
  assert.equal(fishingOdds({rare:0,epic:0,legendary:0}).total,0);
  assert.throws(()=>fishingOdds({rare:2,epic:0,legendary:1},10),/refill/);
  for (const rare of [-1,61,NaN,2.5]) assert.throws(()=>fishingOdds({rare,epic:0,legendary:1}));
  assert.throws(()=>castFishing({rare:0,epic:0,legendary:0}));
});
test('fishing practice removes caught fish, preserves input, cannot overspend pool', () => {
  const initial={rare:1,epic:1,legendary:1};
  const result=castFishing(initial,3,()=>0);
  assert.deepEqual(result.caught,{rare:1,epic:1,legendary:1});
  assert.deepEqual(result.remaining,{rare:0,epic:0,legendary:0});
  assert.deepEqual(initial,{rare:1,epic:1,legendary:1});
});
