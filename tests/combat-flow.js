async(page)=>{
  const checks=[];const errors=[];const onError=error=>errors.push(error.message);
  const check=(value,label)=>{if(!value)throw new Error(label);checks.push(label);};
  const base='http://127.0.0.1:4173/';
  const allowRequest=route=>route.continue();await page.route(base+'**',allowRequest);
  const ids=['croc-boss-control-playbook','flame-demon-circle-melee-playbook','pvp-meteor-elemental-rune-playbook','jungle-sprite-domain-skill-priorities'];
  page.on('pageerror',onError);
  try{
    for(const locale of ['en','es']){
      const root=base+(locale==='es'?'es/':'');
      await page.goto(root+'tools.html');
      await page.evaluate(language=>localStorage.setItem('darkknight-language',language),locale);
      await page.goto(root+'index.html');
      check(await page.locator('.combat-hub .guide-row').count()===4,`${locale} four visual guide entrypoints`);
      await page.locator('.combat-hub a').first().click();
      check(page.url().includes(ids[0]),`${locale} home opens Croc guide`);
      for(const id of ids){
        await page.goto(root+`guides/${id}.html`);
        check(await page.locator('#combat-plan').isVisible(),`${locale} ${id} visual available`);
        await page.locator('.contents a[href="#combat-plan"]').click();
        check(page.url().endsWith('#combat-plan'),`${locale} ${id} contents reaches diagram`);
        check(await page.locator('.references a[href*="discord.com/channels/"]').count()>0,`${locale} ${id} source references`);
        for(const width of [360,768,1440]){
          const scale=(await page.evaluate(()=>innerWidth))/page.viewportSize().width;
          await page.setViewportSize({width:Math.round(width/scale),height:Math.round(900/scale)});
          check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${locale} ${id} no overflow at${width}px`);
          check(Math.abs((await page.evaluate(()=>innerWidth))-width)<=1,`${locale} CSS viewport ${width}px`);
        }
        if(id===ids[2]){
          check(await page.locator('.rune-mix:visible [data-rune-family]').count()===8,`${locale} first rune recipe shows eight`);
          await page.locator('.rune-recipe summary').nth(2).focus();await page.keyboard.press('Enter');
          check(await page.locator('.rune-recipe').nth(2).locator('[data-rune-family]:visible').count()===8,`${locale} keyboard expands alternative recipe`);
        }
      }
      await page.locator(`[data-language="${locale==='en'?'es':'en'}"]`).click();
      check(page.url().includes(ids[3]+'.html#combat-plan'),`${locale} language switch preserves visual anchor`);
    }
    check(errors.length===0,`no browser errors: ${errors.join('; ')}`);
    return {passed:checks.length,checks};
  }finally{page.off('pageerror',onError);await page.unroute(base+'**',allowRequest);}
}
