async(page)=>{
  const base='http://127.0.0.1:4173/';const checks=[];const errors=[];
  const check=(value,label)=>{if(!value)throw new Error(label);checks.push(label);};
  const allowRequest=route=>route.continue();const onError=error=>errors.push(error.message);
  page.on('pageerror',onError);await page.route(base+'**',allowRequest);
  const ids=['croc-boss-control-playbook','flame-demon-circle-melee-playbook','pvp-meteor-elemental-rune-playbook','jungle-sprite-domain-skill-priorities'];
  try{
    await page.setViewportSize({width:1440,height:1000});
    for(const locale of ['en','es'])for(const id of ids){
      await page.goto(base+(locale==='es'?'es/':'')+'guides/'+id+'.html');
      const pictures=page.locator('[data-skill-image] img');
      await pictures.evaluateAll(images=>images.forEach(img=>img.loading='eager'));
      await page.waitForFunction(()=>[...document.querySelectorAll('[data-skill-image] img')].every(img=>img.complete&&img.naturalWidth>0));
      check(await pictures.count()>=6,`${locale} ${id} original images load`);
      check(await pictures.evaluateAll(images=>images.every(img=>new URL(img.src).origin===location.origin&&img.alt.length>0)),`${locale} ${id} local images and names`);
      const first=page.locator('[data-skill-image]').first();const expected=await first.getAttribute('data-image-name');
      await first.focus();await page.keyboard.press('Enter');
      check(await page.locator('#skill-image-dialog').isVisible(),`${locale} ${id} keyboard opens viewer`);
      check(await page.locator('#skill-image-title').innerText()===expected,`${locale} ${id} correct image name`);
      await page.waitForFunction(()=>document.querySelector('#skill-image-preview').complete&&document.querySelector('#skill-image-preview').naturalWidth>0);
      await page.keyboard.press('Escape');
      check(!await page.locator('#skill-image-dialog').isVisible(),`${locale} ${id} Escape closes viewer`);
      check(await first.evaluate(button=>document.activeElement===button),`${locale} ${id} keyboard focus restored`);
      for(const width of [360,768,1440]){
        const scale=(await page.evaluate(()=>innerWidth))/page.viewportSize().width;
        await page.setViewportSize({width:Math.round(width/scale),height:Math.round(900/scale)});
        check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${locale} ${id} no overflow ${width}px`);
      }
    }
    const scale=(await page.evaluate(()=>innerWidth))/page.viewportSize().width;
    await page.setViewportSize({width:Math.round(360/scale),height:Math.round(780/scale)});
    await page.locator('[data-skill-image="hero-cleo"]').click();
    check(await page.locator('#skill-image-kind').textContent()==='Héroe','hero portrait has correct type');
    check(await page.locator('#skill-image-dialog').evaluate(dialog=>{const box=dialog.getBoundingClientRect();return box.left>=0&&box.right<=innerWidth&&box.height<=innerHeight;}),'mobile viewer fits viewport');
    await page.locator('.image-dialog-close').click();
    check(!await page.locator('#skill-image-dialog').isVisible(),'close button works');
    await page.locator('[data-skill-image="rune-elemental-domain"]').click();
    check(await page.locator('#skill-image-kind').textContent()==='Runa','etched rune identified separately');
    await page.evaluate(()=>document.querySelector('#skill-image-preview').src='/missing-skill-test.png');
    await page.locator('#skill-image-error').waitFor({state:'visible'});
    check((await page.locator('#skill-image-error').innerText()).includes('Imagen no disponible'),'failed image has Spanish fallback');
    check((await page.locator('#skill-image-title').innerText()).includes('Dominio'),'failed image retains useful name');
    await page.keyboard.press('Escape');
    await page.locator('[data-skill-image="skill-super-freeze"]').evaluate(button=>button.dataset.imageReference='javascript:alert(1)');
    await page.locator('[data-skill-image="skill-super-freeze"]').click();
    check(await page.locator('#skill-image-error').isVisible(),'malformed image metadata handled');
    check(!await page.locator('#skill-image-reference').isVisible(),'unsafe reference never offered');
    await page.keyboard.press('Escape');
    check(errors.length===0,`no uncaught browser errors: ${errors.join('; ')}`);
    return {passed:checks.length,checks};
  }catch(error){throw new Error(`${error.message}; last check: ${checks.at(-1)}; ${page.url()}`);}
  finally{page.off('pageerror',onError);await page.unroute(base+'**',allowRequest);}
}
