export const HIGH_MULTIPLIER_TILES = Object.freeze([8, 9, 20, 21, 22]);

export function treasureAdvice(tile, dice) {
  if (!Number.isInteger(tile) || tile < 0 || tile > 23) throw new Error('Choose a current tile from 0 to 23.');
  if (!Number.isSafeInteger(dice) || dice < 0 || dice > 100000) throw new Error('Enter whole dice between 0 and 100,000.');
  if (dice === 0) return { multiplier: 0, highTile: HIGH_MULTIPLIER_TILES.includes(tile) };
  const cap = dice >= 100 ? 10 : dice >= 50 ? 5 : dice >= 30 ? 3 : dice >= 20 ? 2 : 1;
  const highTile = HIGH_MULTIPLIER_TILES.includes(tile);
  return { multiplier: highTile ? cap : 1, highTile };
}

export function setupTreasureTool(locale = 'en') {
  const form = document.getElementById('treasure-form');
  if (!form) return;
  const tile = document.getElementById('current-tile');
  const dice = document.getElementById('held-dice');
  const output = document.getElementById('roll-advice');
  const update = () => {
    try {
      if (!tile.value.trim() || !dice.value.trim()) throw new Error(locale === 'es' ? 'Introduce la casilla actual y los dados disponibles.' : 'Enter both current tile and held dice.');
      if (locale === 'es' && (!Number.isInteger(Number(tile.value)) || Number(tile.value) < 0 || Number(tile.value) > 23)) throw new Error('Elige una casilla actual entre 0 y 23.');
      if (locale === 'es' && (!Number.isSafeInteger(Number(dice.value)) || Number(dice.value) < 0 || Number(dice.value) > 100000)) throw new Error('Introduce un número entero de dados entre 0 y 100 000.');
      const advice = treasureAdvice(Number(tile.value), Number(dice.value));
      output.textContent = locale === 'es'
        ? (advice.multiplier === 0 ? 'No tienes dados. Recoge recompensas antes de tirar.' : `El modelo sugiere ×${advice.multiplier} desde la casilla ${tile.value}.${advice.highTile && advice.multiplier < 10 ? ' Limitado por los dados disponibles.' : ''} Comprueba de nuevo al moverte.`)
        : (advice.multiplier === 0 ? 'No dice available. Collect rewards before rolling.' : `Model suggests ×${advice.multiplier} from tile ${tile.value}.${advice.highTile && advice.multiplier < 10 ? ' Limited by held dice.' : ''} Recheck after moving.`);
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
