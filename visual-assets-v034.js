// Ashen Realms v0.3.4 — generated visual asset integration.
(function(){
  const raw=window.__ashenVisualAtlasB64||'';
  if(!raw)return;
  const ATLAS='data:image/webp;base64,'+raw;
  delete window.__ashenVisualAtlasB64;
  const AW=640,AH=1080;
  const CROPS={"grayharbor":[0,0,320,180],"oldDocks":[320,0,320,180],"tavern":[0,180,320,180],"northCanal":[320,180,320,180],"thirdDrain":[0,360,320,180],"tower":[320,360,320,180],"sunkenRoad":[0,540,320,180],"altar":[320,540,320,180],"underground":[0,720,320,180],"notice":[320,720,320,180],"portrait_mira":[0,900,80,100],"portrait_allen":[80,900,80,100],"portrait_mara":[160,900,80,100],"portrait_harlo":[240,900,80,100],"portrait_nasha":[320,900,80,100],"portrait_guard":[400,900,80,100],"portrait_undead":[480,900,80,100],"keycard":[560,900,80,80],"items":[0,1005,640,70]};
  const ALT={grayharbor:'灰港',oldDocks:'老碼頭',tavern:'斷錨酒館',northCanal:'北渠',thirdDrain:'舊港第三排水閘',tower:'舊鐘塔',sunkenRoad:'沉在城下的道路',altar:'地下祭壇',underground:'地下通道',notice:'失蹤告示',portrait_mira:'米菈・維森',portrait_allen:'艾倫・梅爾',portrait_mara:'瑪拉・梅爾',portrait_harlo:'哈洛',portrait_nasha:'娜莎',portrait_guard:'灰港城衛',portrait_undead:'不死族冒險者',keycard:'未知黑色薄片',items:'冒險物品'};
  function cropStyle(key){const [x,y,w,h]=CROPS[key];const sx=AW/w*100,sy=AH/h*100;const px=(AW===w?0:x/(AW-w)*100),py=(AH===h?0:y/(AH-h)*100);return `background-size:${sx}% ${sy}%;background-position:${px}% ${py}%;aspect-ratio:${w}/${h}`;}
  function cropHtml(key,className='generated-art'){return `<div class="generated-art ${className}" style="${cropStyle(key)}" role="img" aria-label="${ALT[key]||'遊戲插圖'}"></div>`;}
  const previousSceneImage=sceneImage;
  sceneImage=function(key){if(CROPS[key])return cropHtml(key,'scene-img generated-scene-art');return previousSceneImage(key);};
  function wrapScene(name,key){const previous=scenes[name];if(!previous)return;scenes[name]=function(...args){const out=previous.apply(this,args);if(out)out.img=key;return out;};}
  [['grayharbor',['arrival','guard','market','forge','apothecary','epilogue','maraHouse']],['tavern',['tavern','bartender','bartenderPost','act2Rumor','act2Harlo']],['tower',['towerRoad','towerDeep','cellarGate']],['underground',['cellarCrossroads','cells','dungeonCleared','drainCache']],['altar',['ritualHall']],['oldDocks',['oldDocks','drainEntrance']],['northCanal',['northCanal','allenIdentity','allenDoctor','allenTestimony','allenStatus','allenWifeQuestion','guardConflict','allenClue','allenDisposition']],['thirdDrain',['drainSearch','thirdDrain']],['sunkenRoad',['sunkenRoadGate']],['notice',['notice']]].forEach(([key,names])=>names.forEach(name=>wrapScene(name,key)));
  const portraitForScene={guard:'mira',bartender:'harlo',bartenderPost:'harlo',act2Harlo:'harlo',oldDocks:'nasha',northCanal:'allen',allenIdentity:'allen',allenDoctor:'allen',allenTestimony:'allen',allenStatus:'allen',allenWifeQuestion:'allen',guardConflict:'allen',allenClue:'allen',allenDisposition:'allen',maraHouse:'mara',thirdDrain:'mira'};
  const previousShowScene=showScene;
  showScene=function(){previousShowScene();const who=portraitForScene[s.scene],key=who&&`portrait_${who}`;const copy=document.querySelector('.hero-copy'),story=copy?.querySelector('.story');if(!key||!CROPS[key]||!copy||!story)return;const holder=document.createElement('div');holder.innerHTML=cropHtml(key,'npc-scene-portrait');copy.insertBefore(holder.firstChild,story);};
  const previousShowCharacter=showCharacter;
  showCharacter=function(){previousShowCharacter();if(s.raceId!=='undead')return;const old=document.querySelector('#sheet img.portrait');if(!old)return;const holder=document.createElement('div');holder.innerHTML=cropHtml('portrait_undead','portrait generated-character-portrait');old.replaceWith(holder.firstChild);};
  const previousShowInventory=showInventory;
  showInventory=function(){previousShowInventory();const concept=document.querySelector('#sheet img.concept');if(concept){const h=document.createElement('div');h.innerHTML=cropHtml('items','concept generated-item-strip');concept.replaceWith(h.firstChild);}document.querySelectorAll('#sheet .item').forEach(card=>{const name=card.querySelector('b')?.textContent||'';if(!name.startsWith('未知黑色薄片')||card.querySelector('.quest-item-thumb'))return;const h=document.createElement('div');h.innerHTML=cropHtml('keycard','quest-item-thumb');card.insertBefore(h.firstChild,card.firstChild);});};
  const style=document.createElement('style');
  style.textContent=`.generated-art{background-image:url("${ATLAS}");background-repeat:no-repeat;background-color:#0b0e13}.generated-scene-art{width:100%;height:auto;min-height:0;background-color:#0a0d12}.npc-scene-portrait{float:left;width:78px;height:auto;margin:2px 12px 8px 0;border:1px solid #4b566c;border-radius:11px;box-shadow:0 6px 18px #0007}.hero-copy .choices{clear:both}.generated-character-portrait{width:min(100%,330px);height:auto;margin:8px auto 14px;border:1px solid var(--line);border-radius:14px}.generated-item-strip{width:100%;height:auto;margin:8px 0 12px;border:1px solid var(--line);border-radius:13px}.quest-item-thumb{float:left;width:64px;height:64px;margin:1px 10px 7px 0;border:1px solid #3f4a60;border-radius:9px}@media(max-width:380px){.npc-scene-portrait{width:68px;margin-right:10px}}`;
  document.head.appendChild(style);
  if(s.created)showScene();
})();
