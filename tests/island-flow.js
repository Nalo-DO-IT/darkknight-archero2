async (page) => {
  const checks=[];
  const check=(value,label)=>{if(!value)throw new Error(label);checks.push(label);};
  const errors=[];const onError=(error)=>errors.push(error.message);
  page.on('pageerror',onError);
  const viewport=async(size)=>{
    const scale=(await page.evaluate(()=>innerWidth))/page.viewportSize().width;
    await page.setViewportSize({width:Math.round(size.width/scale),height:Math.round(size.height/scale)});
  };
  const base='http://127.0.0.1:4173/';
  const allowRequest=route=>route.continue();await page.route(base+'**',allowRequest);
  try {
    await viewport({width:1440,height:1000});
    for(const locale of ['en','es']){
      await page.goto(base+(locale==='es'?'es/':'')+'tools.html');
      await page.locator('#sim-roll').waitFor();
      await page.evaluate(()=>{Math.random=()=>0;});
      const reset=async(dice,tile,strategy='manual')=>{
        await page.locator('#sim-dice').fill(String(dice));
        await page.locator('#sim-tile').fill(String(tile));
        await page.locator('#sim-strategy').selectOption(strategy);
        await page.locator('#sim-refunds').uncheck();
        await page.locator('#sim-form button').click();
      };
      await reset(100,2);
      for(const bet of [1,2,3,5,10]){
        await page.locator(`[data-bet="${bet}"]`).click();
        const format=(number)=>new Intl.NumberFormat(locale).format(number);
        for(const [tile,amount] of [[4,800],[16,800],[0,400],[1,50],[14,2]]){
          const button=page.locator(`[data-tile="${tile}"]`);
          check(await button.locator('[data-reward-amount]').innerText()===`×${format(amount*bet)}`,`${locale} tile${tile} reward ×${bet}`);
          check((await button.getAttribute('aria-label')).includes(format(amount*bet)),`${locale} tile${tile} accessible reward ×${bet}`);
        }
        check(await page.locator('[data-tile="9"] [data-reward-amount]').isVisible()===(bet>1),`${locale} gift scale ×${bet}`);
      }
      await page.locator('[data-bet="2"]').click();
      await page.emulateMedia({reducedMotion:'no-preference'});
      await page.evaluate(()=>{
        window.islandMoves=[];
        window.islandObserver=new MutationObserver(()=>window.islandMoves.push(Number(document.querySelector('#sim-pawn').dataset.position)));
        window.islandObserver.observe(document.querySelector('#sim-pawn'),{attributes:true,attributeFilter:['data-position']});
      });
      await page.locator('#sim-roll').click();
      check(await page.locator('[data-bet="5"]').isDisabled(),`${locale} multiplier locked during movement`);
      await page.waitForFunction(()=>document.querySelector('#sim-turns').textContent==='1');
      check(await page.locator('#sim-score').innerText()===new Intl.NumberFormat(locale).format(1600),`${locale} 800×2 pays1600`);
      check(await page.locator('#sim-dice-left').innerText()==='98',`${locale} ×2 costs two dice`);
      check(await page.evaluate(()=>window.islandMoves.includes(3)&&window.islandMoves.includes(4)),`${locale} pawn walks intermediate tiles`);
      await page.evaluate(()=>window.islandObserver.disconnect());
      await page.emulateMedia({reducedMotion:'reduce'});
      await reset(100,2);
      await page.locator('[data-bet="10"]').click();
      await page.locator('#sim-roll').click();
      await page.waitForFunction(()=>document.querySelector('#sim-turns').textContent==='1');
      check(await page.locator('#sim-score').innerText()===new Intl.NumberFormat(locale).format(8000),`${locale} 800×10 pays8000`);
      check(await page.locator('#sim-multiplier').innerText()==='×5',`${locale} bet reduces below100dice`);
      check(await page.locator('[data-tile="4"] [data-reward-amount]').innerText()===`×${new Intl.NumberFormat(locale).format(4000)}`,`${locale} displayed reward follows reduced bet`);
      await page.locator('#sim-smart').click();
      check(await page.locator('#sim-multiplier').innerText()==='×1',`${locale} recommendation follows departure tile`);
      await page.locator('[data-tile="8"]').click();
      check(await page.locator('#sim-pawn').getAttribute('data-position')==='8',`${locale} selecting tile resets starting position`);
      check(await page.locator('#sim-multiplier').innerText()==='×10',`${locale} recommended tile updates multiplier`);
      await reset(0,0);
      check(await page.locator('#sim-roll').isDisabled(),`${locale} empty wallet cannot roll`);
      check(await page.locator('[data-tile="4"] [data-reward-amount]').innerText()==='×0',`${locale} no active reward without dice`);
      await reset(100,22);
      await page.locator('[data-bet="5"]').focus();await page.keyboard.press('Enter');
      check(await page.locator('#sim-multiplier').innerText()==='×5',`${locale} keyboard selects multiplier`);
      check(await page.locator('.island-ground').evaluate(img=>img.complete&&img.naturalWidth===734),`${locale} original game background loads`);
    }
    check(errors.length===0,`no browser errors: ${errors.join('; ')}`);
    return {passed:checks.length,checks};
  } finally {
    page.off('pageerror',onError);
    await page.unroute(base+'**',allowRequest);
    await page.emulateMedia({reducedMotion:'no-preference'});
  }
}
