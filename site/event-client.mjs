import { createTreasureState, rollTreasure, runTreasure, summarizeScores, POOLS, fishingOdds, castFishing } from './event-models.mjs';
import { EVENT_COPY } from './event-copy.mjs';
import { treasureAdvice } from './treasure.mjs';

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
  let state; let cancelled = false; let busy = false;
  const initial = () => createTreasureState({ dice:number('sim-dice'), tile:number('sim-tile'), points:number('sim-points'), spent:number('sim-spent'), strategy:$('sim-strategy').value, refunds:$('sim-refunds').checked });
  const message = (text) => { $('sim-message').textContent = text; };
  const drawState = () => {
    $('sim-dice-left').textContent = format(state.dice);
    $('sim-score').textContent = format(state.points);
    $('sim-turns').textContent = format(state.turns);
    for (const tile of document.querySelectorAll('[data-tile]')) {
      const active = Number(tile.dataset.tile) === state.tile;
      tile.classList.toggle('player-tile', active);
      if (active) tile.setAttribute('aria-current', 'location'); else tile.removeAttribute('aria-current');
    }
    const multiplier = state.dice ? state.strategy === 'one' ? 1 : treasureAdvice(state.strategy === 'maximum' ? 8 : state.tile, state.dice).multiplier : 0;
    $('sim-multiplier').textContent = `×${multiplier}`;
    $('sim-roll').disabled = busy || !state.dice;
    $('sim-finish').disabled = busy || !state.dice;
    if (state.last) {
      $('sim-faces').textContent = state.last.faces.map((face)=>String.fromCodePoint(0x267F + face)).join(' ');
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
    try { state = initial(); $('sim-results').hidden = true; $('sim-faces').textContent = '⚄ ⚄'; drawState(); message(t.ready); }
    catch { message(t.invalid); }
  };
  $('sim-form').addEventListener('submit', (event) => { event.preventDefault(); restart(); });
  $('sim-roll').addEventListener('click', () => {
    try { state = rollTreasure(state); drawState(); } catch { message(t.invalid); }
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
