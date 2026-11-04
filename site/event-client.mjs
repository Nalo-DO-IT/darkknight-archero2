import { createTreasureState, rollTreasure, rollMultiplier, runTreasure, summarizeScores, POINT_THRESHOLDS, POOLS, fishingOdds, castFishing } from './event-models.mjs';
import { EVENT_COPY } from './event-copy.mjs';
import { treasureAdvice } from './treasure.mjs';
import { ISLAND_TILES, SPRITES, tileReward, movePath } from './treasure-board.mjs';

export function setupEventTools(locale) {
  if (!document.getElementById('sim-form')) return;
  const t = EVENT_COPY[locale];
  const $ = (id) => document.getElementById(id);
  const number = (id) => {
    const input = $(id);
    if (!input.value.trim() || !input.checkValidity()) throw new RangeError(t.invalid);
    return Number(input.value);
  };
  const format = (value) => new Intl.NumberFormat(locale).format(value);
  const percent = (value) => new Intl.NumberFormat(locale, { style:'percent', maximumFractionDigits:2 }).format(value);
  let state; let cancelled = false; let busy = false; let manualMultiplier = 1;
  const initial = () => createTreasureState({ dice:number('sim-dice'), tile:number('sim-tile'), points:number('sim-points'), spent:number('sim-spent'), strategy:$('sim-strategy').value, refunds:$('sim-refunds').checked, multiplier:manualMultiplier });
  const message = (text) => { $('sim-message').textContent = text; };
  const diceFaces = (faces) => {
    document.querySelectorAll('[data-die]').forEach((die,index)=>die.setAttribute('viewBox',SPRITES[`die${faces[index]}`].join(' ')));
    $('sim-faces').setAttribute('aria-label',faces.join(' + '));
  };
  const movePawn = (id) => {
    const tile=ISLAND_TILES[id];
    $('sim-pawn').style.left=`${(tile.x+23)/3.5}%`;
    $('sim-pawn').style.top=`${(tile.y+18)/3.7}%`;
    $('sim-pawn').dataset.position=String(id);
  };
  const drawState = () => {
    $('sim-dice-left').textContent = format(state.dice);
    $('sim-score').textContent = format(state.points);
    $('sim-turns').textContent = format(state.turns);
    $('sim-task-progress').textContent = format(state.spent);
    $('sim-last-reward').textContent = state.last ? `+${format(state.last.gain)}` : '—';
    const next=POINT_THRESHOLDS.find((points)=>points>state.points);
    $('sim-next-goal').textContent=next?format(next):t.noMoreMilestones;
    $('sim-progress').max=next??1;
    $('sim-progress').value=next?state.points:1;
    const multiplier = rollMultiplier(state);
    const reward=tileReward(state.tile,multiplier);
    $('sim-current-tile').textContent=`${t.tileNumber} ${state.tile}`;
    $('sim-tile-reward').textContent=reward.amount===undefined?`${t[reward.key]} · ×${multiplier}`:`${format(reward.amount)} ${t[reward.key]}`;
    movePawn(state.tile);
    for (const tile of document.querySelectorAll('[data-tile]')) {
      const id=Number(tile.dataset.tile);
      const active = id === state.tile;
      const scaled=tileReward(id,multiplier);
      const amount=tile.querySelector('[data-reward-amount]');
      const label=`${t.tileNumber} ${id}: ${scaled.amount===undefined?`${t[scaled.key]} · ×${multiplier}`:`${format(scaled.amount)} ${t[scaled.key]}`}`;
      amount.textContent=`×${scaled.amount===undefined?multiplier:format(scaled.amount)}`;
      amount.hidden=scaled.amount===undefined&&multiplier<=1;
      tile.setAttribute('aria-label',label);
      tile.title=label;
      tile.classList.toggle('player-tile', active);
      if (active) tile.setAttribute('aria-current', 'location'); else tile.removeAttribute('aria-current');
      tile.disabled=busy;
    }
    $('sim-multiplier').textContent = `×${multiplier}`;
    const cap=state.dice?treasureAdvice(8,state.dice).multiplier:0;
    for(const button of document.querySelectorAll('[data-bet]')) {
      button.disabled=busy||Number(button.dataset.bet)>cap;
      button.setAttribute('aria-pressed',String(state.strategy==='manual'&&Number(button.dataset.bet)===multiplier));
    }
    $('sim-smart').disabled=busy;
    $('sim-smart').setAttribute('aria-pressed',String(state.strategy==='smart'));
    $('sim-roll').disabled = busy || !state.dice;
    $('sim-finish').disabled = busy || !state.dice;
    if (state.last) {
      diceFaces(state.last.faces);
      message(`${t.rollResult}: ${state.last.faces.join(' + ')} · ×${state.last.multiplier} · ${t.land} ${state.tile}. +${format(state.last.gain)} ${t.gained}; +${state.last.boardDice + state.last.taskRefund + state.last.scoreRefund} ${t.returned}. ${!state.dice ? t.noDice : ''}`);
    }
  };
  const lock = (value) => {
    busy = value;
    $('sim-form').querySelector('fieldset').disabled = value;
    $('sim-estimate').disabled = value;
    $('sim-cancel').hidden = !value;
    drawState();
  };
  const restart = () => {
    try { state = initial(); $('sim-results').hidden = true; diceFaces([1,3]); drawState(); message(t.ready); }
    catch { message(t.invalid); }
  };
  $('sim-form').addEventListener('submit', (event) => { event.preventDefault(); restart(); });
  const delay=(ms)=>new Promise((resolve)=>setTimeout(resolve,ms));
  $('sim-roll').addEventListener('click', async () => {
    if(busy||!state.dice)return;
    cancelled=false; lock(true);
    let result; let failed=false;
    try {
      result=rollTreasure(state);
      if(!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        $('sim-faces').classList.add('dice-rolling'); message(t.rolling);
        for(let index=0;index<5&&!cancelled;index++){diceFaces([index+1,((index+3)%6)+1]);await delay(70);}
        $('sim-faces').classList.remove('dice-rolling');diceFaces(result.last.faces);
        for(const tile of movePath(state.tile,result.last.faces[0]+result.last.faces[1])) {
          if(cancelled)break;
          movePawn(tile);message(`${t.moving} ${tile}…`);await delay(100);
        }
      }
      state=result;
    } catch { failed=true; }
    finally { $('sim-faces').classList.remove('dice-rolling');lock(false);if(failed)message(t.invalid); }
  });
  for(const button of document.querySelectorAll('[data-bet]')) button.addEventListener('click',()=>{
    if(busy)return;
    manualMultiplier=Number(button.dataset.bet);
    state={...state,strategy:'manual',multiplier:manualMultiplier};
    $('sim-strategy').value='manual';drawState();
  });
  $('sim-smart').addEventListener('click',()=>{
    if(busy)return;state={...state,strategy:'smart'};$('sim-strategy').value='smart';drawState();
  });
  for(const tile of document.querySelectorAll('[data-tile]'))tile.addEventListener('click',()=>{
    if(busy)return;$('sim-tile').value=tile.dataset.tile;restart();
  });
  $('sim-cancel').addEventListener('click', () => { cancelled = true; });
  $('sim-estimate').addEventListener('click', async () => {
    let origin; let target;
    try { origin = initial(); target = number('sim-target'); } catch { message(t.invalid); return; }
    cancelled = false; $('sim-results').hidden = true; lock(true);
    let error = false;
    const scores = [];
    try {
      for (let index=0; index<300; index++) {
        if (cancelled) break;
        scores.push(runTreasure(origin).points);
        if (index % 5 === 0) { message(`${t.simulating} ${index+1}/300…`); await new Promise((resolve)=>setTimeout(resolve,0)); }
      }
      if (!cancelled) {
        const stats = summarizeScores(scores,target);
        $('sim-bars').replaceChildren();
        for (const [label,value] of [[t.low,stats.low],[t.median,stats.median],[t.highScore,stats.high]]) {
          const row = document.createElement('div'); row.className = 'estimate-row';
          const name = document.createElement('span'); name.textContent = label;
          const bar = document.createElement('div'); bar.className = 'estimate-bar';
          const fill = document.createElement('i'); fill.style.width = `${stats.high ? value/stats.high*100 : 0}%`; bar.append(fill);
          const count = document.createElement('strong'); count.textContent = format(value);
          row.append(name,bar,count); $('sim-bars').append(row);
        }
        $('sim-summary').textContent = `${t.mean}: ${format(stats.mean)} · ${t.chance} (${format(target)}): ${percent(stats.success)}`;
        $('sim-results').hidden = false;
      }
    } catch { error = true; }
    finally { lock(false); message(error ? t.limit : cancelled ? t.cancelled : t.sampleNote); }
  });
  $('sim-finish').addEventListener('click', async () => {
    cancelled = false; lock(true); let moves = 0; let error = false;
    try {
      while (state.dice > 0 && !cancelled) {
        if (++moves > 50000) throw new Error('Limit');
        state = rollTreasure(state);
        if (moves % 25 === 0) { drawState(); await new Promise((resolve)=>setTimeout(resolve,0)); }
      }
    } catch { error = true; }
    finally { lock(false); if (error || cancelled) message(error ? t.limit : t.cancelled); }
  });
  restart();

  const pool = () => Object.fromEntries(['rare','epic','legendary'].map((kind)=>[kind,number(`fish-${kind}`)]));
  const fishMessage = (text) => { $('fish-message').textContent = text; };
  const updateFish = (note) => {
    try {
      const remaining = pool(); const batch = number('fish-batch'); const used = number('fish-breaks');
      const total = Object.values(remaining).reduce((a,b)=>a+b,0);
      const crossing = total > 0 && batch > total;
      const odds = fishingOdds(remaining, crossing ? 1 : batch);
      $('fish-total').textContent = total;
      $('fish-next').textContent = total ? percent(odds.next) : '—';
      $('fish-chance').textContent = total && !crossing ? percent(odds.chance) : '—';
      $('fish-refunds').textContent = 120-used;
      $('fish-form').querySelector('[type="submit"]').disabled = !total || crossing;
      $('fish-break').disabled = used >= 120 || !total;
      $('fish-pool-bars').replaceChildren();
      for (const kind of ['rare','epic','legendary']) {
        const segment = document.createElement('span'); segment.className = kind;
        segment.style.flex = remaining[kind]; segment.title = `${t[kind]}: ${remaining[kind]}`;
        if (remaining[kind]) $('fish-pool-bars').append(segment);
      }
      fishMessage(crossing ? t.crossing : !total ? t.empty : note || (!remaining.legendary ? t.noLegend : t.fishReady));
      return true;
    } catch {
      for (const id of ['fish-total','fish-next','fish-chance','fish-refunds']) $(id).textContent = '—';
      $('fish-form').querySelector('[type="submit"]').disabled = true; $('fish-break').disabled = true;
      fishMessage(t.invalid); return false;
    }
  };
  const refill = () => {
    const full = POOLS[$('fish-lake').value];
    for (const kind of ['rare','epic','legendary']) { $(`fish-${kind}`).max = full[kind]; $(`fish-${kind}`).value = full[kind]; }
    updateFish();
  };
  $('fish-lake').addEventListener('change', refill);
  $('fish-reset').addEventListener('click', refill);
  $('fish-form').addEventListener('input', () => updateFish());
  $('fish-form').addEventListener('submit', (event) => {
    event.preventDefault();
    try {
      const result = castFishing(pool(),number('fish-batch'));
      for (const kind of ['rare','epic','legendary']) $(`fish-${kind}`).value = result.remaining[kind];
      updateFish(`${t.caught}: ${Object.entries(result.caught).map(([kind,count])=>`${count} ${t[kind].toLowerCase()}`).join(' · ')}.`);
    } catch { fishMessage(t.invalid); }
  });
  $('fish-break').addEventListener('click', () => {
    try {
      const used = number('fish-breaks');
      if (used >= 120) { fishMessage(t.fishLimit); return; }
      $('fish-breaks').value = used+1; updateFish();
    } catch { fishMessage(t.invalid); }
  });
  updateFish();
}
