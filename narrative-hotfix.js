// Ashen Realms v0.3.2 — small follow-up for clue ordering.
(function(){
  const priorTavern=scenes.tavern;
  scenes.tavern=function(){
    if(!s.flags?.knowsMissing) return priorTavern();
    const choices=[['向酒保打聽失蹤者','bartender']];
    if(!s.flags.towerNoise) choices.push(['留意角落傭兵的談話','mercs']);
    choices.push(['花 3 金幣喝一杯黑麥酒','buyAle'],['返回港口','arrival']);
    return{title:'斷錨酒館',img:'tavern',text:'廉價麥酒、濕羊毛與海鹽氣味混在一起。知道有人失蹤之後，你開始注意到酒館裡幾個不自然的反應：哈洛刻意避開相關話題，角落傭兵則一直壓低聲音交談。',choices};
  };

  const priorAct=act;
  act=function(a){
    priorAct(a);
    if(['openCellar','pickCellar','dwarfCellar'].includes(a) && s.quests?.missing && !s.flags?.bossDefeated){
      s.quests.missing.desc='深入鐘塔地窖，尋找失蹤者，並查清眼形符號背後的人在做什麼。';
      save();
    }
  };
})();
