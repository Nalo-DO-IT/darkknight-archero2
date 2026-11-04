import {escapeHtml as e} from './guide.mjs';
import {SKILL_ART} from './skill-art-data.mjs';

const UI={
  en:{skill:'Skill',rune:'Rune',hero:'Hero',view:'Enlarge image',close:'Close image',hint:'Match the pictures to your game. Select an image to see its name and a larger view.',translation:'Spanish labels describe the images; original English names remain visible.',reference:'Image reference',error:'Image unavailable. Use the name below to identify it.'},
  es:{skill:'Habilidad',rune:'Runa',hero:'Héroe',view:'Ampliar imagen',close:'Cerrar imagen',hint:'Reconoce los iconos dentro del juego. Pulsa una imagen para verla ampliada con su nombre.',translation:'Los nombres españoles son orientativos; también se muestra el nombre original en inglés.',reference:'Referencia de la imagen',error:'Imagen no disponible. Puedes identificarla por el nombre.'}
};
export function imageCopy(locale){if(!Object.hasOwn(UI,locale))throw new RangeError('Unsupported image language.');return UI[locale];}
export function skillImage(id,locale,prefix='./',compact=false){
  if(!Object.hasOwn(SKILL_ART,id))throw new RangeError(`Unknown game image: ${id}`);
  if(!/^(?:\.\.\/)+$|^\.\/$/.test(prefix))throw new RangeError('Images require a relative site prefix.');
  const art=SKILL_ART[id];const t=imageCopy(locale);const label=locale==='es'?art.spanish:art.name;
  return `<button type="button" class="skill-image-button kind-${art.kind}${compact?' compact-image':''}" data-skill-image="${id}" data-image-name="${e(label)}" data-image-original="${e(art.name)}" data-image-kind="${t[art.kind]}" data-image-reference="${e(art.reference)}" aria-label="${t.view}: ${e(label)}"><span class="skill-image-frame"><img src="${prefix}${art.path}" width="${art.width}" height="${art.height}" alt="${e(art.name)}" loading="lazy" decoding="async"><span class="image-zoom" aria-hidden="true">⤢</span></span><span class="skill-image-caption"><small>${t[art.kind]}</small><strong>${e(label)}</strong>${locale==='es'&&label!==art.name?`<span lang="en">${e(art.name)}</span>`:''}</span></button>`;
}
export function skillImages(ids,locale,prefix,compact=false){return `<div class="skill-image-strip">${ids.map(id=>skillImage(id,locale,prefix,compact)).join('')}</div>`;}
export function imageDialog(locale){
  const t=imageCopy(locale);
  return `<dialog class="skill-image-dialog" id="skill-image-dialog" aria-labelledby="skill-image-title"><button type="button" class="image-dialog-close" aria-label="${t.close}" autofocus>×</button><div class="image-preview-stage"><img id="skill-image-preview" alt=""></div><p class="image-preview-kind" id="skill-image-kind"></p><h2 id="skill-image-title"></h2><p id="skill-image-original" lang="en"></p><p id="skill-image-error" role="status" hidden>${t.error}</p><a id="skill-image-reference" target="_blank" rel="noopener noreferrer">${t.reference} ↗</a></dialog>`;
}
