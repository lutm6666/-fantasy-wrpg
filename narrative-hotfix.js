// Ashen Realms v0.3.2 — clue-order and narrative continuity fixes.
(function(){
  const priorTavern=scenes.tavern;
  scenes.tavern=function(){
    if(!s.flags?.knowsMissing) return priorTavern();
    const choices=[['向酒保打聽失蹤者','bartender']];
    if(!s.flags.towerNoise) choices.push(['留意角落傭兵的談話','mercs']);
    choices.push(['花 3 金幣喝一杯黑麥酒','buyAle'],['返回港口','arrival']);
    return{title:'斷錨酒館',img:'tavern',text:'廉價麥酒、濕羊毛與海鹽氣味混在一起。知道有人失蹤之後，你開始注意到酒館裡幾個不自然的反應：哈洛刻意避開相關話題，角落傭兵則一直壓低聲音交談。',choices};
  };

  // Until Orin explicitly identifies the organization, combat and loot should only
  // describe what the player can actually observe: gray masks and the eye-shaped mark.
  const priorStartCombat=startCombat;
  startCombat=function(e){
    if(e?.id==='acolyte'&&!s.flags?.riftNameKnown)e.name='灰面侍從';
    priorStartCombat(e);
  };

  const priorWinCombat=winCombat;
  winCombat=function(){
    const encounter=s.combat?.onWin;
    priorWinCombat();
    if(s.flags?.riftNameKnown)return;

    if(encounter==='rats'){
      const i=s.log.findIndex(x=>String(x).includes('刻著裂眼符號的骨片'));
      if(i>=0)s.log[i]=s.log[i].replace('刻著裂眼符號的骨片','刻著陌生眼形符號的骨片');
    }
    if(encounter==='acolyte'){
      const shard=s.inventory?.find(x=>x.id==='riftShard');
      if(shard){
        shard.name='眼形刻印骨片';
        shard.desc='灰面侍從攜帶的骨片，上面刻著與失蹤告示相似的眼形記號。';
      }
    }
    save();
  };

  const priorDungeonCleared=scenes.dungeonCleared;
  scenes.dungeonCleared=function(){
    // Reaching Orin is the first point at which the organization names itself.
    if(!s.flags.riftNameKnown){
      s.flags.riftNameKnown=true;
      const shard=s.inventory?.find(x=>x.id==='riftShard');
      if(shard){
        shard.name='裂眼骨片';
        shard.desc='灰面侍從攜帶的刻印骨片。歐林已證實這個眼形記號屬於自稱「裂眼」的組織。';
      }
      save();
    }
    return priorDungeonCleared();
  };

  const priorAct=act;
  act=function(a){
    priorAct(a);

    if(['openCellar','pickCellar','dwarfCellar'].includes(a) && s.quests?.missing && !s.flags?.bossDefeated){
      s.quests.missing.desc='深入鐘塔地窖，尋找失蹤者，並查清眼形符號背後的人在做什麼。';
      save();
    }

    if(a==='rescueSurvivor'&&s.quests?.missing&&!s.flags?.riftNameKnown){
      s.quests.missing.desc='你救出一名失蹤者；歐林被灰面具的人帶往右側的冷焰石廳。';
      save();
    }
  };
})();
