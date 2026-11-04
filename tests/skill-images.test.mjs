import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {SKILL_ART,SKILL_ASSETS} from '../site/skill-art-data.mjs';
import {skillImage,imageCopy,imageDialog} from '../site/skill-images.mjs';
import {COMBAT_GUIDES,renderCombatVisual} from '../site/combat-guides.mjs';

test('original skill, rune and hero images match source hashes and dimensions',async()=>{
  const manifest=JSON.parse(await readFile(new URL('../content/skill-art-sources.json',import.meta.url),'utf8'));
  assert.equal(Object.keys(SKILL_ART).length,41);assert.equal(new Set(SKILL_ASSETS).size,41);
  let bytes=0;
  for(const item of Object.values(SKILL_ART)){
    const data=await readFile(new URL(`../site/${item.path}`,import.meta.url));bytes+=data.length;
    const evidence=manifest.assets.find(asset=>asset.path===item.path);assert.ok(evidence);
    assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
    assert.equal(data.readUInt32BE(16),item.width);assert.equal(data.readUInt32BE(20),item.height);
    assert.equal(createHash('sha256').update(data).digest('hex'),evidence.sha256);
    assert.equal(evidence.unmodified,true);assert.equal(new URL(evidence.source).protocol,'https:');
    assert.ok(item.name&&item.spanish&&['skill','rune','hero'].includes(item.kind));
  }
  assert.ok(bytes<650000,'Whole image library below650KB');
});

test('image buttons use native labels, correct relative paths and accessible enlargement names',()=>{
  for(const locale of ['en','es'])for(const [id,art] of Object.entries(SKILL_ART)){
    const prefix=locale==='es'?'../../':'../';const html=skillImage(id,locale,prefix);
    assert.ok(html.includes(`src="${prefix}${art.path}"`));
    assert.ok(html.includes('aria-label="'+imageCopy(locale).view));
    assert.ok(html.includes('loading="lazy"'));assert.ok(html.includes(`kind-${art.kind}`));
  }
  assert.throws(()=>skillImage('__proto__','en'),/Unknown/);
  assert.throws(()=>skillImage('skill-freeze','en','https://example.com/'),/relative/);
  assert.throws(()=>imageCopy('fr'),/language/);
  assert.match(imageDialog('es'),/Cerrar imagen/);
});

test('each combat recipe has real images, one viewer and no unregistered image IDs',()=>{
  for(const locale of ['en','es'])for(const id of COMBAT_GUIDES){
    const html=renderCombatVisual(id,locale,'../../');
    const ids=[...html.matchAll(/data-skill-image="([^"]+)"/g)].map(match=>match[1]);
    assert.ok(ids.length>=6,id);for(const key of ids)assert.ok(Object.hasOwn(SKILL_ART,key),key);
    assert.equal((html.match(/id="skill-image-dialog"/g)||[]).length,1);
    assert.match(html,/Image and name references|Imágenes y nombres de referencia/);
  }
  const croc=renderCombatVisual('croc-boss-control-playbook','en');
  assert.match(croc,/data-skill-image="rune-sharp-arrow"/);
  assert.doesNotMatch(croc,/data-skill-image="skill-ricochet-arrow"/);
  const flame=renderCombatVisual('flame-demon-circle-melee-playbook','en');
  assert.match(flame,/data-skill-image="rune-melee-sprite"/);
  assert.match(flame,/does not identify the exact ATK PWR rune/);
});
