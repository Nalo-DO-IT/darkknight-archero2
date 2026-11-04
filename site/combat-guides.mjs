import {escapeHtml as e} from './guide.mjs';

export const COMBAT_GUIDES=Object.freeze([
  'croc-boss-control-playbook','flame-demon-circle-melee-playbook',
  'pvp-meteor-elemental-rune-playbook','jungle-sprite-domain-skill-priorities'
]);

const COPY={
  en:{
    hub:'Bosses & combat recipes',hubText:'Find the combination, understand its job, then check the requirements.',
    title:'Your combat plan',recipe:'BUILD AT A GLANCE',historical:'Historical recipe',community:'Community recipe',
    crocTitle:'Control the adds. Keep hitting Croc.',crocDate:'October 2026',
    crocCards:[['ice','Ice / Super Ice','Freeze support'],['bolt','Paralysis or Thor 5★','Choose the control route you own'],['bounce','4-bounce effect','Clear summoned enemies'],['leaf','Vines','Control support · unique enchant suggested']],
    crocFlow:['Control summons','Clear adds','Keep boss damage flowing'],
    crocNote:'Bounce helps when adds are the bottleneck. Check add survival and boss damage separately.',
    flameTitle:'Circles + flame + close-range damage',flameDate:'April 2025 · corrected recipe',
    flameCards:[['circle','4 circles','Core damage package'],['fire','2 flame skills','Close-range support'],['sword','Attack Power','Damage support'],['sprite','Melee sprite','Corrected final component']],
    flameSupport:'Supporting runes: double experience + revive.',boss:'BOSS',you:'YOU',xp:'XP',
    movement:'Stay near the boss, move around it, gather experience as it moves. Diagram shows the route concept, not a measured arena.',
    flameNote:'The follow-up replaces the timed meteor with a melee sprite. If close range ends your run early, compare a setup you can survive with.',
    pvpTitle:'One plan. Eight runes.',pvpDate:'April–September 2026',
    choose:'Choose one rune mix. Tiles show family counts, not equipment-slot placement.',
    families:{meteor:'Meteor',elemental:'Elemental',circle:'Circle',weapon:'Weapon',lightning:'Lightning',ice:'Ice'},
    layouts:['Meteor + elemental','Circle + elemental','Circle + weapon + lightning / ice'],
    resonance:'Potion-oriented hero example',lead:'Main hero',support:'Resonances',
    enchants:'Check these enchants',enchantItems:['Left elemental pair: unique effects with Cleo/Otta','Right fire rune: unique effect','Strike-potion unique: verify the pictured preset before replacing support'],
    pvpNote:'The 25% cooldown / 30% meteor-damage comparison needs the exact rune tooltip. Keep 3v3 bounce coverage separate from single-boss priorities.',
    jungleTitle:'Sprites lead. Domain clears.',jungleDate:'June 2026 · recheck after Twinborn',
    prerequisites:'Build requirements',jungleRequirements:['2 sprite etched runes + 1 elemental etched rune','Cleo recommended · RoA as shown in source preset','4 sprites · plant shield after green','Experience support + revive'],
    skillOrder:'Skill pick order',skills:[['sprite','Sprites'],['sprite','Sprite buffs'],['ice','Super Freeze'],['bolt','Elemental skills'],['speed','Attack Speed'],['sword','Attack Power']],
    breakpoint:'Beyond green?',domain:'Check Domain L2 investment. A kill must trigger the clearing effect; crowded waves expose weak elemental damage.',
    supportNote:'Awe supporting another build? Prioritize that build’s main damage instead.',
    jungleNote:'October 30 reports say Twinborn changed Jungle builds. This is a dated recipe, not a current universal ranking.'
  },
  es:{
    hub:'Jefes y combinaciones de combate',hubText:'Encuentra la combinación, entiende su función y comprueba los requisitos.',
    title:'Tu plan de combate',recipe:'BUILD DE UN VISTAZO',historical:'Receta histórica',community:'Receta de la comunidad',
    crocTitle:'Controla las invocaciones. Sigue dañando a Croc.',crocDate:'Octubre de 2026',
    crocCards:[['ice','Ice / Super Ice','Apoyo de congelación'],['bolt','Parálisis o Thor 5★','Elige la ruta de control que tengas'],['bounce','Efecto de 4 rebotes','Elimina enemigos invocados'],['leaf','Lianas','Apoyo de control · se sugiere encantamiento único']],
    crocFlow:['Controla invocaciones','Elimina esbirros','Mantén el daño al jefe'],
    crocNote:'Los rebotes ayudan cuando fallas por las invocaciones. Revisa por separado los esbirros vivos y el daño al jefe.',
    flameTitle:'Círculos + fuego + daño cercano',flameDate:'Abril de 2025 · receta corregida',
    flameCards:[['circle','4 círculos','Paquete principal de daño'],['fire','2 habilidades de fuego','Apoyo a corta distancia'],['sword','Attack Power','Apoyo de daño'],['sprite','Sprite cuerpo a cuerpo','Componente final corregido']],
    flameSupport:'Runas de apoyo: doble experiencia + resurrección.',boss:'JEFE',you:'TÚ',xp:'EXP',
    movement:'Mantente cerca, muévete alrededor del jefe y recoge experiencia cuando se desplace. El esquema representa la ruta, no una arena a escala.',
    flameNote:'La corrección sustituye el meteorito periódico por un sprite cuerpo a cuerpo. Si acercarte termina pronto el intento, compara una configuración con la que sobrevivas.',
    pvpTitle:'Un plan. Ocho runas.',pvpDate:'Abril–septiembre de 2026',
    choose:'Elige una distribución. Las fichas indican cantidades por familia, no casillas de equipo.',
    families:{meteor:'Meteorito',elemental:'Elemental',circle:'Círculo',weapon:'Arma',lightning:'Rayo',ice:'Hielo'},
    layouts:['Meteoritos + elementos','Círculos + elementos','Círculos + arma + rayo / hielo'],
    resonance:'Ejemplo de héroes con apoyo de pociones',lead:'Héroe principal',support:'Resonancias',
    enchants:'Comprueba estos encantamientos',enchantItems:['Pareja elemental izquierda: efectos únicos con Cleo/Otta','Runa de fuego derecha: efecto único','Único de strike potion: comprueba la configuración enlazada antes de sustituir apoyos'],
    pvpNote:'La comparación entre 25% de enfriamiento y 30% de daño de meteoritos requiere la descripción exacta de la runa. Distingue los rebotes para 3 contra 3 de las prioridades contra un jefe.',
    jungleTitle:'Los sprites dañan. Domain limpia.',jungleDate:'Junio de 2026 · revisar tras Twinborn',
    prerequisites:'Requisitos de la build',jungleRequirements:['2 runas grabadas de sprites + 1 elemental','Cleo recomendada · RoA según la configuración enlazada','4 sprites · escudo de plantas después de verde','Apoyo de experiencia + resurrección'],
    skillOrder:'Orden de elección de habilidades',skills:[['sprite','Sprites'],['sprite','Mejoras de sprites'],['ice','Super Freeze'],['bolt','Habilidades elementales'],['speed','Attack Speed'],['sword','Attack Power']],
    breakpoint:'¿Después de verde?',domain:'Comprueba la inversión Domain L2. Una baja debe activar el efecto de limpieza; las oleadas densas revelan si falta daño elemental.',
    supportNote:'¿Awe solo apoya otra build? Prioriza el daño principal de esa configuración.',
    jungleNote:'Un aviso del 30 de octubre señala cambios de builds por Twinborn. Es una receta fechada, no una clasificación universal actual.'
  }
};

const ICONS={
  ice:'M12 2v20M3.34 7l17.32 10M3.34 17L20.66 7M9 4l3 3 3-3M9 20l3-3 3 3',
  bolt:'M13 2L4 14h7l-1 8 10-13h-7z',
  bounce:'M3 19l5-13 7 13 6-13M17 7l4-1 1 4',
  leaf:'M20 3C6 1 1 9 7 16s15-1 13-13M4 21L16 8',
  circle:'M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18M12 7a5 5 0 1 0 0 10 5 5 0 1 0 0-10',
  fire:'M12 2C15 9 20 9 20 15a8 8 0 0 1-16 0c0-4 4-6 5-10l2 6z',
  sword:'M4 20L18 6l3-3v6L7 23M3 14l7 7',
  sprite:'M12 6C6 1 1 8 6 12l-3 5 7-2 2 7 2-7 7 2-3-5c5-4 0-11-6-6z',
  speed:'M3 6h12M1 12h9M3 18h12M15 3l7 9-7 9',
  meteor:'M13 3L4 12a6 6 0 0 0 8 8l9-9M8 16h.01M16 2l-4 7M22 7l-7 4'
};
function icon(name){return `<svg class="combat-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${ICONS[name]??ICONS.circle}"/></svg>`;}
function cards(items){return `<div class="combat-components">${items.map(([name,title,detail])=>`<div class="combat-component tone-${name}">${icon(name)}<strong>${e(title)}</strong><span>${e(detail)}</span></div>`).join('')}</div>`;}
function note(text){return `<p class="combat-note">${e(text)}</p>`;}
function croc(t){return cards(t.crocCards)+`<ol class="combat-flow">${t.crocFlow.map((step,index)=>`<li><b>${index+1}</b>${e(step)}</li>`).join('')}</ol>`+note(t.crocNote);}
function flame(t){
  return cards(t.flameCards)+`<div class="combat-positioning"><svg viewBox="0 0 360 240" role="img" aria-label="${e(t.movement)}"><rect x="1" y="1" width="358" height="238" rx="18" fill="#151d2b"/><ellipse cx="180" cy="116" rx="112" ry="74" fill="none" stroke="#79c8c0" stroke-width="3" stroke-dasharray="9 7"/><path d="M268 61l23 9-7-23" fill="none" stroke="#79c8c0" stroke-width="3"/><circle cx="180" cy="116" r="40" fill="#6e3040" stroke="#ed947d" stroke-width="2"/><text x="180" y="122" text-anchor="middle" fill="#fff2db" font-size="16" font-weight="bold">${t.boss}</text><circle cx="79" cy="150" r="18" fill="#4584ba" stroke="#bdd8ff" stroke-width="2"/><text x="79" y="155" text-anchor="middle" fill="white" font-size="11" font-weight="bold">${t.you}</text>${[[117,53],[245,176],[209,40]].map(([x,y])=>`<path d="M${x} ${y-7}l6 7-6 7-6-7z" fill="#f5da8c"/>`).join('')}<text x="180" y="221" text-anchor="middle" fill="#f5da8c" font-size="12">${t.xp}</text></svg><div><h4>${e(t.flameSupport)}</h4><p>${e(t.movement)}</p></div></div>`+note(t.flameNote);
}
const MIXES=[['meteor','meteor','meteor','meteor','elemental','elemental','elemental','elemental'],['circle','circle','circle','circle','elemental','elemental','elemental','elemental'],['circle','circle','circle','circle','weapon','weapon','lightning','ice']];
function pvp(t){
  const layouts=MIXES.map((mix,index)=>`<details class="rune-recipe"${index===0?' open':''}><summary><span>0${index+1}</span>${e(t.layouts[index])}<b>8</b></summary><div class="rune-mix">${mix.map((family)=>`<span class="rune-token family-${family}" data-rune-family="${family}">${icon({elemental:'bolt',weapon:'sword',lightning:'bolt'}[family]??family)}<span>${e(t.families[family])}</span></span>`).join('')}</div></details>`).join('');
  return `<p>${e(t.choose)}</p>${layouts}<h4>${e(t.resonance)}</h4><div class="hero-resonances"><div><small>${e(t.lead)}</small><strong>Phynx</strong></div><span aria-hidden="true">+</span><div><small>${e(t.support)}</small><strong>Otta + Cleo</strong></div></div><h4>${e(t.enchants)}</h4><ul class="combat-checklist">${t.enchantItems.map(item=>`<li>${e(item)}</li>`).join('')}</ul>`+note(t.pvpNote);
}
function jungle(t){
  return `<h4>${e(t.prerequisites)}</h4><ul class="combat-checklist">${t.jungleRequirements.map(item=>`<li>${e(item)}</li>`).join('')}</ul><h4>${e(t.skillOrder)}</h4><ol class="skill-priority">${t.skills.map(([name,label],index)=>`<li><b>${index+1}</b>${icon(name)}<strong>${e(label)}</strong></li>`).join('')}</ol><div class="combat-breakpoint"><strong>${e(t.breakpoint)}</strong><p>${e(t.domain)}</p></div><p>${e(t.supportNote)}</p>`+note(t.jungleNote);
}

export function combatCopy(locale){if(!Object.hasOwn(COPY,locale))throw new RangeError('Unsupported combat guide language.');return COPY[locale];}
export function renderCombatVisual(id,locale){
  const index=COMBAT_GUIDES.indexOf(id);if(index<0)return '';
  const t=combatCopy(locale);const kind=['croc','flame','pvp','jungle'][index];
  return `<section class="combat-visual" id="combat-plan" aria-labelledby="combat-plan-title"><header><span class="combat-eyebrow">${t.recipe}</span><h2 id="combat-plan-title">${e(t[`${kind}Title`])}</h2><p><span class="combat-date">${e(t[`${kind}Date`])}</span> · ${index===1||index===3?t.historical:t.community}</p></header>${[croc,flame,pvp,jungle][index](t)}</section>`;
}
