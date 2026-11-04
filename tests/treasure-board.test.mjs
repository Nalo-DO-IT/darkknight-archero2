import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ISLAND_TILES, TREASURE_ART, SPRITES, tileReward, movePath, renderTreasureBoard} from '../site/treasure-board.mjs';
import {EVENT_COPY} from '../site/event-copy.mjs';
import {BOARD_POINTS,createTreasureState,rollTreasure} from '../site/event-models.mjs';

test('board positions preserve actual island orientation and24unique source tiles',()=>{
  assert.equal(ISLAND_TILES.length,24);
  assert.equal(new Set(ISLAND_TILES.map(({x,y})=>`${x},${y}`)).size,24);
  assert.deepEqual(ISLAND_TILES[0],{id:0,x:201,y:268,color:'purple'});
  assert.deepEqual(ISLAND_TILES[2],{id:2,x:149,y:304,color:'white'});
  assert.deepEqual(ISLAND_TILES[14],{id:14,x:149,y:88,color:'purple'});
  assert.equal(ISLAND_TILES[6].x,45);
  assert.equal(ISLAND_TILES[22].x,253);
  assert.equal(ISLAND_TILES[8].color,'big_purple');
  assert.equal(ISLAND_TILES[10].color,'gold');
  assert.equal(ISLAND_TILES[20].color,'gold');
});
test('visible rewards distinguish gifts, gems, dice, point machines and wheels',()=>{
  for(const tile of [9,13,17,21])assert.equal(tileReward(tile).icon,'gift');
  for(const tile of [1,7])assert.deepEqual(tileReward(tile),{icon:'gem',amount:50,key:'gems'});
  for(const tile of [6,14])assert.deepEqual(tileReward(tile),{icon:'die1',amount:2,key:'diceUnit'});
  assert.equal(tileReward(8).icon,'prize');assert.equal(tileReward(22).icon,'fate');
  assert.equal(tileReward(10).icon,'machine');assert.equal(tileReward(20).icon,'machine');
  for(const invalid of [-1,24,2.5,NaN,'0'])assert.throws(()=>tileReward(invalid));
});
test('movement visits every intermediate tile and wraps23to0',()=>{
  assert.deepEqual(movePath(22,4),[23,0,1,2]);
  for(let from=0;from<24;from++)for(let steps=2;steps<=12;steps++){
    const path=movePath(from,steps);assert.equal(path.length,steps);assert.equal(path.at(-1),(from+steps)%24);
  }
  for(const pair of [[24,2],[0,1],[0,13],[0,2.5],[-1,2]])assert.throws(()=>movePath(...pair));
});

test('every fixed board reward displays the active multiplier and matches landing points',()=>{
  for(const multiplier of [1,2,3,5,10])for(let id=0;id<24;id++){
    const base=tileReward(id);const scaled=tileReward(id,multiplier);
    if(base.amount!==undefined)assert.equal(scaled.amount,base.amount*multiplier);
    else assert.equal(scaled.amount,undefined,'random rewards are not fabricated');
    if(BOARD_POINTS[id]){
      const start=createTreasureState({dice:100,tile:(id+22)%24,strategy:'manual',multiplier,refunds:false});
      assert.equal(rollTreasure(start,()=>0).last.gain,scaled.amount);
    }
  }
  assert.equal(tileReward(4,2).amount,1600);
  assert.equal(tileReward(4,5).amount,4000);
  assert.equal(tileReward(16,10).amount,8000);
  assert.equal(tileReward(1,10).amount,500);
  assert.equal(tileReward(14,10).amount,20);
  assert.equal(tileReward(4,0).amount,0);
  for(const invalid of [-1,4,1.5,NaN,'10'])assert.throws(()=>tileReward(4,invalid));
});
test('game assets ship locally and sprite viewports stay inside original2048atlas',async()=>{
  let bytes=0;
  for(const asset of TREASURE_ART){
    const data=await readFile(new URL(`../site/${asset}`,import.meta.url));bytes+=data.length;
    if(asset.endsWith('.png'))assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
    else assert.equal(data.subarray(0,2).toString('hex'),'ffd8');
  }
  assert.ok(bytes<5000000,'Treasure art stays below5MB');
  for(const [name,[x,y,width,height]] of Object.entries(SPRITES)){
    assert.ok(x>=0&&y>=0&&width>0&&height>0&&x+width<=2048&&y+height<=2048,name);
  }
});
test('board supports both languages, accessible tile selection and five manual multipliers',()=>{
  for(const locale of ['en','es']){
    const html=renderTreasureBoard(EVENT_COPY[locale],'../');
    assert.equal((html.match(/data-tile="/g)||[]).length,24);
    assert.equal((html.match(/data-bet="/g)||[]).length,5);
    assert.equal((html.match(/data-reward-amount/g)||[]).length,24);
    assert.match(html,/id="sim-pawn"/);assert.match(html,/id="sim-progress"/);
    assert.match(html,/\.\.\/assets\/treasure\/island.png/);
    assert.ok(html.includes(EVENT_COPY[locale].referenceImage));
  }
});
