// Ashen Realms v0.3.4 — high-DPI scene image clarity fix.
(function(){
  // Cache-busted generated artwork. Do not point these back to the old vector placeholders.
  const HD_GRAYHARBOR='assets/grayharbor-hd.svg?v=20260914b';
  const HD_MIRA='assets/mira-hd.svg?v=20260914b';

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
    .hd-npc-portrait{
      object-fit:cover;
      object-position:center 28%;
      aspect-ratio:4/5;
      image-rendering:auto;
      background:#101722;
    }
  `;
  document.head.appendChild(style);

  // Refresh the current scene immediately so a cached low-resolution or placeholder image is replaced.
  if(typeof s!=='undefined' && s.created) showScene();
})();
