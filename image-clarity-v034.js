// Ashen Realms v0.3.4 — high-DPI scene image clarity fix.
(function(){
  // Replace the tiny legacy 15 KB Grayharbor JPEG with a scalable 16:9 scene.
  if(typeof ASSET!=='undefined') ASSET.harbor='assets/grayharbor-hd.svg';

  const style=document.createElement('style');
  style.textContent=`
    .hero img,.scene-img{
      display:block;
      width:100%;
      aspect-ratio:16/9;
      object-fit:contain !important;
      object-position:center center !important;
      image-rendering:auto;
      filter:none !important;
      transform:none !important;
      background:#0b0e13;
    }
  `;
  document.head.appendChild(style);

  // Refresh the current scene immediately so an already-loaded legacy image is replaced.
  if(typeof s!=='undefined' && s.created && typeof showScene==='function') showScene();
})();
