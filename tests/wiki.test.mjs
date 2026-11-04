import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { publicLibrary, filterArticles } from '../site/catalog.mjs';
import { validateTranslation } from '../site/wiki-i18n.mjs';
import { renderWikiGuide, renderWikiHome, renderWikiIndex, renderWikiTools } from '../site/wiki.mjs';
import { article } from './fixtures.mjs';

const read = async (locale) => publicLibrary(JSON.parse(await readFile(new URL(`../content/library${locale === 'es' ? '.es' : ''}.json`,import.meta.url),'utf8')));
test('all practical guides have complete Spanish counterparts and identical source URLs',async()=>{
  const en=await read('en'); const es=await read('es');
  validateTranslation(en,es); assert.equal(en.articles.length,50);
  for(const a of en.articles){
    const translated=es.articles.find(({id})=>id===a.id);
    for(const field of ['title','summary','body']) assert.notEqual(a[field],translated[field],`${a.id}.${field}`);
    assert.notEqual(a.category,'bugs');
  }
  assert.equal(en.articles.some(({id})=>id==='arena-meteors-missing-damage-report-november-2026'),false);
  for(const id of ['gems-spending-plan','upgrade-priority-roadmap','build-planner-by-mode','daily-weekly-progression-checklist','event-spending-decision-guide']) assert.ok(en.articles.some((a)=>a.id===id));
  assert.ok(filterArticles(es.articles,{query:'gemas'}).length>0);
});
test('missing/stale translations reject publication rather than silently falling back',()=>{
  const en={articles:[article()]};
  assert.throws(()=>validateTranslation(en,{articles:[]}),/coverage/);
  assert.throws(()=>validateTranslation(en,{articles:[article({status:'outdated'})]}),/metadata/);
  assert.throws(()=>validateTranslation(en,{articles:[article({sources:[{label:'x',url:'https://example.com/different'}]})]}),/references/);
});
test('Spanish guide retains path, language switch, breadcrumb and stable section anchors',()=>{
  const a=article({body:'## Plan\nTexto\n\n## Plan\nSegundo'}); const html=renderWikiGuide(a,[a],'es');
  assert.match(html,/<html lang="es">/); assert.match(html,/href="\.\.\/\.\.\/guides\/test-guide.html" lang="en"/);
  assert.match(html,/href="\.\.\/\.\.\/es\/topics\/expedition.html"/);
  assert.match(html,/id="section-1"/); assert.match(html,/id="section-2"/);
  assert.equal((html.match(/id="section-1"/g)||[]).length,1);
  assert.match(html,/En esta página/); assert.match(html,/Guías relacionadas/);
});
test('wiki rendering never executes source markup, even in search lists and titles',()=>{
  const attack='<img src=x onerror=alert(1)>';const a=article({title:attack,summary:attack,body:`## ${attack}`});
  for(const html of [renderWikiGuide(a,[a]),renderWikiIndex([a]),renderWikiHome([a])]){
    assert.equal(html.includes(attack),false);assert.match(html,/DarkKnight/);
  }
});
test('both language tools provide source models, forms and exactly24 board tiles',()=>{
  for(const locale of ['en','es']){
    const html=renderWikiTools(locale);
    assert.equal((html.match(/data-tile="/g)||[]).length,24);
    assert.match(html,/id="sim-target"/);assert.match(html,/id="fish-breaks"/);
    assert.match(html,/62798d88e03e5fb9eab88d8d929fb95ea548426c/);
    assert.match(html,/962612dfbb6ac51a97fe2f5369714be1bc199c5d/);
  }
});
