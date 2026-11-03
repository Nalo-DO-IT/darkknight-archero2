import { CATEGORIES, STATUSES } from './catalog.mjs';

export const UI = Object.freeze({
  en: {
    home: 'Wiki home', all: 'All guides', tools: 'Event tools', topics: 'Topics', shortcuts: 'Quick access',
    fishing: 'Fishing strategy', treasure: 'Treasure Island', search: 'Search the wiki', searchHint: 'Search guides, skills, events…',
    menu: 'Menu', close: 'Close menu', navigation: 'Wiki navigation', language: 'Language', skip: 'Skip to content',
    intro: 'Your next run starts here.', introText: 'The DarkKnight knowledge base for Archero 2. Find your build, plan your event and make every upgrade count.',
    start: 'New to the game?', startText: 'Start with equipment, then learn the skills that fit your build.', startAction: 'Start learning',
    featured: 'Essential guides', featuredText: 'Four useful places to start.', browse: 'Browse all guides',
    guides: 'guides', references: 'references', languages: 'languages', updated: 'Updated', minutes: 'min read',
    indexIntro: 'Search every guide or narrow the library by topic and review status.',
    allTopics: 'All topics', allStatuses: 'All review statuses', status: 'Review status', reset: 'Clear filters',
    results: 'guides found', empty: 'No guides found.', emptyText: 'Try fewer words or clear the filters.',
    searchError: 'Full-text search is unavailable. Titles and summaries remain searchable.',
    contents: 'On this page', related: 'Related guides', backTopic: 'Back to topic', sources: 'Links & references',
    discussions: 'Discussion references', membership: 'Discord links may require server membership.',
    version: 'Game version', reviewed: 'Content reviewed', top: 'Back to top',
    communityNote: 'Community reports are starting points, not guaranteed results. Check the conditions, dates and game version before spending resources.',
    outdatedNote: 'Historical advice: check current event rules and patch changes before using this guide.',
    legendTitle: 'Know what you are reading', legendText: 'Review labels describe the evidence. Editorial review does not mean live-game testing.',
    footer: 'Unofficial Archero 2 guild wiki. Not affiliated with the game publisher.',
    toolsIntro: 'Practical helpers for planning event rewards. Read the guide before using a model.',
    multiplier: 'Which multiplier?', tileHelp: 'Use your current departure tile, before rolling. Tile 0 is Start.',
    tile: 'Current tile (0–23)', dice: 'Dice held', check: 'Check move',
    toolCaveat: 'September 2025 companion model; current rules need checking. ×10 concentrates risk. No score guarantee.',
    map: 'Read the map & strategy', diceText: 'Explore score targets, estimated odds and your current run.',
    fishText: 'Track catches, remaining fish, line breaks and your reward route.',
    model: 'Historical model', external: 'External tools', moreLanguages: 'More languages',
    autoTranslation: 'Automatic translation through Google Translate. Game terminology may vary.',
    translate: 'Translate page', screenshot: 'Original game screenshot; in-image text keeps its original language.'
  },
  es: {
    home: 'Inicio de la wiki', all: 'Todas las guías', tools: 'Herramientas', topics: 'Temas', shortcuts: 'Acceso rápido',
    fishing: 'Estrategia de pesca', treasure: 'Isla del Tesoro', search: 'Buscar en la wiki', searchHint: 'Busca guías, habilidades, eventos…',
    menu: 'Menú', close: 'Cerrar menú', navigation: 'Navegación de la wiki', language: 'Idioma', skip: 'Saltar al contenido',
    intro: 'Tu próxima partida empieza aquí.', introText: 'La base de conocimiento de DarkKnight para Archero 2. Encuentra tu build, prepara los eventos y aprovecha cada mejora.',
    start: '¿Acabas de empezar?', startText: 'Empieza por el equipo y descubre qué habilidades encajan con tu build.', startAction: 'Primeros pasos',
    featured: 'Guías esenciales', featuredText: 'Cuatro buenos puntos de partida.', browse: 'Ver todas las guías',
    guides: 'guías', references: 'referencias', languages: 'idiomas', updated: 'Actualizado', minutes: 'min de lectura',
    indexIntro: 'Busca en todas las guías o filtra por tema y estado de revisión.',
    allTopics: 'Todos los temas', allStatuses: 'Todos los estados', status: 'Estado de revisión', reset: 'Borrar filtros',
    results: 'guías encontradas', empty: 'No se encontraron guías.', emptyText: 'Prueba con menos palabras o borra los filtros.',
    searchError: 'La búsqueda en el texto completo no está disponible. Puedes buscar por título y resumen.',
    contents: 'En esta página', related: 'Guías relacionadas', backTopic: 'Volver al tema', sources: 'Enlaces y referencias',
    discussions: 'Referencias de debates', membership: 'Los enlaces de Discord pueden requerir acceso al servidor.',
    version: 'Versión del juego', reviewed: 'Contenido revisado', top: 'Volver arriba',
    communityNote: 'Los informes de la comunidad sirven de orientación; no garantizan resultados. Comprueba las condiciones, las fechas y la versión antes de gastar recursos.',
    outdatedNote: 'Consejo histórico: comprueba las reglas del evento actual y los cambios de versión antes de usar esta guía.',
    legendTitle: 'Entiende lo que estás leyendo', legendText: 'Las etiquetas indican la evidencia disponible. Una revisión editorial no equivale a una prueba dentro del juego.',
    footer: 'Wiki no oficial de la hermandad de Archero 2. Sin afiliación con la distribuidora del juego.',
    toolsIntro: 'Ayudas prácticas para planificar las recompensas de los eventos. Lee la guía antes de usar un modelo.',
    multiplier: '¿Qué multiplicador usar?', tileHelp: 'Introduce la casilla donde estás ANTES de tirar. La casilla 0 es la salida.',
    tile: 'Casilla actual (0–23)', dice: 'Dados disponibles', check: 'Comprobar tirada',
    toolCaveat: 'Modelo de septiembre de 2025; comprueba las reglas actuales. ×10 concentra el riesgo. No garantiza una puntuación.',
    map: 'Ver el mapa y la estrategia', diceText: 'Consulta objetivos de puntuación, probabilidades estimadas y tu partida actual.',
    fishText: 'Registra capturas, peces restantes, roturas de sedal y tu ruta de recompensas.',
    model: 'Modelo histórico', external: 'Herramientas externas', moreLanguages: 'Más idiomas',
    autoTranslation: 'Traducción automática con Google Translate. La terminología del juego puede variar.',
    translate: 'Traducir página', screenshot: 'Captura original del juego; el texto de la imagen conserva su idioma original.'
  }
});

const SPANISH_CATEGORIES = [
  ['Primeros pasos', 'Progresión, conceptos básicos y decisiones para empezar.'],
  ['Builds y habilidades', 'Configuraciones, combinaciones y habilidades para cada modo.'],
  ['Equipo y mejoras', 'Armas, armaduras, runas y planificación de recursos.'],
  ['Hermandad y expedición', 'Estrategia compartida, roles y coordinación de la hermandad.'],
  ['Consejos y eventos', 'Pesca, tesoros y descubrimientos que merece la pena conocer.'],
  ['Gemas y recursos', 'Prioridades de gasto, farmeo y presupuesto de mejoras.']
];

export function localeCode(value) { return value === 'es' ? 'es' : 'en'; }
export function categoriesFor(locale) {
  return CATEGORIES.map((category, index) => locale === 'es'
    ? { ...category, label: SPANISH_CATEGORIES[index][0], description: SPANISH_CATEGORIES[index][1] }
    : { ...category, ...(category.id === 'tips' ? { label: 'Tips & events', description: 'Fishing, treasure and discoveries worth keeping.' } : {}) });
}
export function statusesFor(locale) {
  return locale === 'es' ? { verified: 'Probado por la hermandad', community: 'Informe de la comunidad', outdated: 'Requiere comprobación' } : STATUSES;
}
export function localizedPath(locale, path = 'index.html') { return `${locale === 'es' ? 'es/' : ''}${path}`; }

// A missing or stale translation is a build error, never an invisible English fallback.
export function validateTranslation(original, translated) {
  const byId = new Map(translated.articles.map((article) => [article.id, article]));
  if (original.articles.length !== translated.articles.length) throw new Error('Spanish translation coverage differs from English.');
  for (const article of original.articles) {
    const other = byId.get(article.id);
    if (!other) throw new Error(`Missing Spanish translation: ${article.id}`);
    for (const field of ['category', 'status', 'updatedOn', 'reviewedOn', 'published']) {
      if (article[field] !== other[field]) throw new Error(`Translation metadata mismatch: ${article.id}.${field}`);
    }
    if (JSON.stringify(article.sources.map(({ url }) => url)) !== JSON.stringify(other.sources.map(({ url }) => url))) {
      throw new Error(`Translation references mismatch: ${article.id}`);
    }
  }
  return translated;
}
