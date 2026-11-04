import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {COMBAT_GUIDES,combatCopy,renderCombatVisual} from '../site/combat-guides.mjs';
import {renderWikiGuide,renderWikiHome} from '../site/wiki.mjs';

test('combat guides link sources and render visual contents in both languages',async()=>{
  for(const locale of ['en','es']){
    const {articles}=JSON.parse(await readFile(new URL(`../content/library${locale==='es'?'.es':''}.json`,import.meta.url),'utf8'));
    for(const id of COMBAT_GUIDES){
      const article=articles.find(item=>item.id===id);assert.ok(article,id);
      assert.ok(article.sources.some(({url})=>url.includes('/1353899985103749221/')));
      const html=renderWikiGuide(article,articles,locale);
      assert.match(html,/href="#combat-plan"/);assert.match(html,/combat\.css/);
      assert.equal((html.match(/id="combat-plan"/g)||[]).length,1);
      assert.ok(html.includes(combatCopy(locale).recipe));
      assert.equal(/ClubPenguen|Pengu/.test(article.body),false,'neutral public prose');
      assert.ok(renderWikiHome(articles,locale).includes(`guides/${id}.html`));
    }
  }
  assert.equal(renderCombatVisual('unrelated-guide','en'),'');
  assert.throws(()=>combatCopy('unknown'),/language/);
});

test('PvP diagrams preserve eight-rune alternatives without inventing slot positions',()=>{
  for(const locale of ['en','es']){
    const html=renderCombatVisual('pvp-meteor-elemental-rune-playbook',locale);
    const mixes=[...html.matchAll(/<div class="rune-mix">(.*?)<\/div>/gs)].map(match=>[...match[1].matchAll(/data-rune-family="(\w+)"/g)].map(item=>item[1]));
    assert.equal(mixes.length,3);for(const mix of mixes)assert.equal(mix.length,8);
    assert.deepEqual(mixes[0],['meteor','meteor','meteor','meteor','elemental','elemental','elemental','elemental']);
    assert.deepEqual(mixes[2],['circle','circle','circle','circle','weapon','weapon','lightning','ice']);
    assert.ok(html.includes(combatCopy(locale).choose));
  }
});

test('historical recipes retain corrections and requirements in visual summaries',()=>{
  for(const locale of ['en','es']){
    const t=combatCopy(locale);
    const flame=renderCombatVisual('flame-demon-circle-melee-playbook',locale);
    assert.ok(flame.includes(t.historical));assert.ok(flame.includes(t.flameCards[3][1]));
    assert.match(flame,/role="img" aria-label=/);
    const jungle=renderCombatVisual('jungle-sprite-domain-skill-priorities',locale);
    assert.ok(jungle.includes(t.historical));assert.match(jungle,/Domain L2/);assert.match(jungle,/Twinborn/);
    let previous=-1;
    for(const [,skill] of t.skills){const next=jungle.indexOf(`<strong>${skill}</strong>`);assert.ok(next>previous);previous=next;}
    assert.match(renderCombatVisual('croc-boss-control-playbook',locale),/Thor 5★/);
  }
});
