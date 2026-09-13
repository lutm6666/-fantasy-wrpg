// Ashen Realms v0.3.4 — high-DPI scene image clarity fix.
(function(){
  // Cache-busted generated artwork. Do not point these back to the old vector placeholders.
  const HD_GRAYHARBOR='assets/grayharbor-hd.svg?v=20260914c';
  const HD_MIRA='assets/mira-hd.svg?v=20260914c';

  // Replace the tiny legacy JPEG and bypass the 320x180 generated atlas crop.
  if(typeof ASSET!=='undefined') ASSET.harbor=HD_GRAYHARBOR;
  const previousSceneImage=sceneImage;
  sceneImage=function(key){
    if(key==='grayharbor'||key==='harbor'){
      return `<img class="scene-img hd-scene-img" src="${HD_GRAYHARBOR}" alt="灰港" loading="eager" decoding="async">`;
    }
    return previousSceneImage(key);
  };

  const previousShowScene=showScene;
  showScene=function(){
    previousShowScene();

    // Replace the tiny legacy Mira crop with the generated portrait.
    if(['guard','thirdDrain'].includes(s.scene)){
      const old=document.querySelector('.npc-scene-portrait');
      if(old){
        const img=document.createElement('img');
        img.className='npc-scene-portrait hd-npc-portrait';
        img.src=HD_MIRA;
        img.alt='城衛隊長米菈';
        img.decoding='async';
        old.replaceWith(img);
      }
    }
  };

  const style=document.createElement('style');
  style.textContent=`
    .hero img.hd-scene-img,.scene-img.hd-scene-img{
      display:block;
      width:100%;
      height:auto;
      aspect-ratio:16/9;
      object-fit:contain !important;
      object-position:center center !important;
      image-rendering:auto;
      filter:none !important;
      transform:none !important;
      background:#0b0e13;
    }

    /* NPC portraits are not scene banners. Override the global .hero img 16:9 rule. */
    .hero img.hd-npc-portrait,
    img.npc-scene-portrait.hd-npc-portrait{
      display:block !important;
      float:left !important;
      width:104px !important;
      max-width:32% !important;
      height:auto !important;
      aspect-ratio:4/5 !important;
      object-fit:contain !important;
      object-position:center center !important;
      margin:2px 14px 10px 0 !important;
      border:1px solid #4b566c;
      border-radius:12px;
      box-shadow:0 6px 18px #0007;
      image-rendering:auto;
      background:#101722;
    }

    .hero-copy .story{overflow:visible;}
    .hero-copy .choices{clear:both;}

    @media(max-width:380px){
      .hero img.hd-npc-portrait,
      img.npc-scene-portrait.hd-npc-portrait{
        width:92px !important;
        max-width:31% !important;
        margin-right:11px !important;
      }
    }
  `;
  document.head.appendChild(style);

  // Refresh the current scene immediately so a cached low-resolution or badly cropped image is replaced.
  if(typeof s!=='undefined' && s.created) showScene();
})();
