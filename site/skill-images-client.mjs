export function setupSkillImages(){
  const dialog=document.getElementById('skill-image-dialog');
  if(!dialog)return;
  const image=document.getElementById('skill-image-preview');
  const error=document.getElementById('skill-image-error');
  const referenceLink=document.getElementById('skill-image-reference');
  let trigger;
  const close=()=>dialog.close();
  for(const button of document.querySelectorAll('[data-skill-image]'))button.addEventListener('click',()=>{
    document.getElementById('skill-image-title').textContent=button.dataset.imageName??'';
    document.getElementById('skill-image-original').textContent=button.dataset.imageName===button.dataset.imageOriginal?'':button.dataset.imageOriginal??'';
    document.getElementById('skill-image-kind').textContent=button.dataset.imageKind??'';
    try{
      const source=button.querySelector('img');
      const url=new URL(source.currentSrc||source.src,location.href);
      const reference=new URL(button.dataset.imageReference);
      if(url.origin!==location.origin||!/^https?:$/.test(url.protocol)||reference.protocol!=='https:')throw new Error('Invalid image URL');
      trigger=button;error.hidden=true;image.hidden=false;
      image.alt=button.dataset.imageOriginal;image.src=url.href;
      referenceLink.href=reference.href;referenceLink.hidden=false;
      dialog.showModal();
    }catch{trigger=button;image.hidden=true;error.hidden=false;referenceLink.hidden=true;dialog.showModal();}
  });
  image.addEventListener('error',()=>{image.hidden=true;error.hidden=false;});
  dialog.querySelector('.image-dialog-close').addEventListener('click',close);
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const rect=dialog.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)close();
  });
  dialog.addEventListener('close',()=>{image.removeAttribute('src');trigger?.focus();});
}
