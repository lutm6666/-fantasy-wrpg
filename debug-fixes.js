// Ashen Realms runtime bug fixes that do not change story/design direction.
(function(){
  // Legacy saves only validated whether the race/class IDs still existed. They did
  // not validate whether that class is legal for the saved race, so older or
  // malformed saves could bypass the current race/class restrictions entirely.
  if(s.created && races[s.raceId] && classes[s.classId] && !races[s.raceId].allow.includes(s.classId)){
    const oldClass=classes[s.classId].name;
    s.classId='warrior';
    normalizeHp();
    log(`舊存檔職業「${oldClass}」不符合目前的${race().name}職業限制，已改為戰士。`);
    save();
  }

  // Safari can reject localStorage writes (for example in restricted/private
  // browsing contexts or when storage quota is unavailable). A thrown setItem
  // previously aborted the current action after the state had already changed,
  // leaving buttons/scenes apparently frozen. Keep the session playable in
  // memory and continue rendering even when persistence is unavailable.
  save=function(){
    try{
      localStorage.setItem('ashen-realms-save',JSON.stringify(s));
      window.__ashenStorageUnavailable=false;
    }catch(_e){
      window.__ashenStorageUnavailable=true;
    }
    renderHud();
  };

  const previousResetGame=resetGame;
  resetGame=function(){
    if(!window.__ashenStorageUnavailable){previousResetGame();return}
    if(confirm('確定要刪除存檔嗎？')){
      try{localStorage.removeItem('ashen-realms-save')}catch(_e){}
      s=clone(baseState);
      location.reload();
    }
  };

  // Avoid 404s for scene art that has not been added yet.
  ASSET.tavern='assets/scene-placeholder.svg';
  ASSET.tower='assets/scene-placeholder.svg';
  ASSET.cellar='assets/scene-placeholder.svg';
  ASSET.undead='assets/portrait-placeholder.svg';
  ASSET.items='assets/item-placeholder.svg';

  // Keep the HUD location aligned with the actual scene. Older saves and several
  // return paths could leave the player shown as being in the cellar after they
  // had already returned to the tower or Grayharbor.
  function syncLocation(){
    const scene=s.scene;
    let next=null;
    if(['arrival','guard','notice','tavern','bartender','market','forge','apothecary','oldDocks','epilogue'].includes(scene)) next='灰港';
    else if(['towerRoad','towerDeep','cellarGate'].includes(scene)) next='舊鐘塔';
    else if(['cellarCrossroads','cells','ritualHall','dungeonCleared'].includes(scene)) next='鐘塔地窖';
    else if(['drainEntrance','drainCache'].includes(scene)) next='退潮排水洞';
    if(next && s.location!==next){s.location=next;return true}
    return false;
  }

  const previousAct=act;
  act=function(a){
    // Prevent repeatedly collecting the Grayharbor investigation advance.
    if((a==='acceptQuest'||a==='bargain') && s.quests?.missing){
      s.scene='towerRoad';
      log('你已經接下米菈的調查，不會再次領取訂金。');
      syncLocation();
      save();showScene();return;
    }

    previousAct(a);

    // The force-open route should advance the quest exactly like the key/rogue/dwarf routes.
    if(a==='forceCellar' && s.flags?.cellarOpen){
      if(!s.quests.missing) ensureQuest();
      s.quests.missing.stage=Math.max(3,s.quests.missing.stage||1);
      s.quests.missing.desc='深入鐘塔地窖，尋找失蹤者與裂眼組織的線索。';
    }

    // Some base scene transitions save before updating the semantic location.
    // Repair it after the action and refresh the HUD/save only when necessary.
    if(syncLocation()) save();
  };

  const previousCombatTurn=combatTurn;
  combatTurn=function(type){
    if(type==='potion'){
      if(s.hp>=maxHp()){
        toast('生命已滿');
        return;
      }
      // Base combat code searches potion IDs case-sensitively. Temporarily normalize
      // vendor IDs (e.g. shopPotion) for the base turn, then restore the canonical ID
      // so later shop purchases keep stacking into the same inventory entry.
      const potion=s.inventory.find(x=>x.type==='consumable'&&String(x.id).toLowerCase().includes('potion')&&x.qty>0);
      if(potion && !String(potion.id).includes('potion')){
        const originalId=potion.id;
        potion.id=String(potion.id).replace(/potion/ig,'potion');
        previousCombatTurn(type);
        potion.id=originalId;
        save();
        return;
      }
    }
    previousCombatTurn(type);
  };

  // Repair stale location labels immediately when loading an older save.
  if(syncLocation()) save();
})();
