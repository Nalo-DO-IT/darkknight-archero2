export const HIGH_MULTIPLIER_TILES = Object.freeze([8, 9, 20, 21, 22]);

export function treasureAdvice(tile, dice) {
  if (!Number.isInteger(tile) || tile < 0 || tile > 23) throw new Error('Choose a current tile from 0 to 23.');
  if (!Number.isSafeInteger(dice) || dice < 0 || dice > 100000) throw new Error('Enter whole dice between 0 and 100,000.');
  if (dice === 0) return { multiplier: 0, highTile: HIGH_MULTIPLIER_TILES.includes(tile) };
  const cap = dice >= 100 ? 10 : dice >= 50 ? 5 : dice >= 30 ? 3 : dice >= 20 ? 2 : 1;
  const highTile = HIGH_MULTIPLIER_TILES.includes(tile);
  return { multiplier: highTile ? cap : 1, highTile };
}

export function setupTreasureTool() {
  const form = document.getElementById('treasure-form');
  if (!form) return;
  const tile = document.getElementById('current-tile');
  const dice = document.getElementById('held-dice');
  const output = document.getElementById('roll-advice');
  const update = () => {
    try {
      if (!tile.value.trim() || !dice.value.trim()) throw new Error('Enter both current tile and held dice.');
      const advice = treasureAdvice(Number(tile.value), Number(dice.value));
      output.textContent = advice.multiplier === 0 ? 'No dice available. Collect rewards before rolling.' : `Model suggests ×${advice.multiplier} from tile ${tile.value}.${advice.highTile && advice.multiplier < 10 ? ' Limited by held dice.' : ''} Recheck after moving.`;
      output.dataset.state = 'ready';
    } catch (error) {
      output.textContent = error.message;
      output.dataset.state = 'error';
    }
  };
  form.addEventListener('submit', (event) => { event.preventDefault(); update(); });
  form.addEventListener('input', update);
  update();
}
