// Ashen Realms v0.3.4 — high-DPI scene image clarity fix.
(function(){
  const HD_GRAYHARBOR='assets/grayharbor-hd.svg';
  const HD_MIRA='assets/mira-hd.svg';

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

    // The visual atlas only gives Mira an 80x100 crop. Replace it with a scalable portrait.
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
      object-position:center 34%;
      aspect-ratio:1/1;
      image-rendering:auto;
      background:#101722;
    }
  `;
  document.head.appendChild(style);

  // Refresh the current scene immediately so a cached low-resolution atlas image is replaced.
  if(typeof s!=='undefined' && s.created) showScene();
})();
