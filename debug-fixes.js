// Ashen Realms runtime bug fixes that do not change story/design direction.
(function(){
  // Avoid 404s for scene art that has not been added yet.
  ASSET.tavern='assets/scene-placeholder.svg';
  ASSET.tower='assets/scene-placeholder.svg';
  ASSET.cellar='assets/scene-placeholder.svg';
  ASSET.undead='assets/portrait-placeholder.svg';
  ASSET.items='assets/item-placeholder.svg';

  const previousAct=act;
  act=function(a){
    // Prevent repeatedly collecting the Grayharbor investigation advance.
    if((a==='acceptQuest'||a==='bargain') && s.quests?.missing){
      s.scene='towerRoad';
      log('你已經接下米菈的調查，不會再次領取訂金。');
      save();showScene();return;
    }

    previousAct(a);

    // The force-open route should advance the quest exactly like the key/rogue/dwarf routes.
    if(a==='forceCellar' && s.flags?.cellarOpen){
      if(!s.quests.missing) ensureQuest();
      s.quests.missing.stage=Math.max(3,s.quests.missing.stage||1);
      s.quests.missing.desc='深入鐘塔地窖，尋找失蹤者與裂眼組織的線索。';
      save();
    }
  };

  const previousCombatTurn=combatTurn;
  combatTurn=function(type){
    if(type==='potion' && s.hp>=maxHp()){
      toast('生命已滿');
      return;
    }
    previousCombatTurn(type);
  };
})();
