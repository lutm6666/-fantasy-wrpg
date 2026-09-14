// Ashen Realms — repair Mira contract flow when the tower quest was self-started.
(function(){
  const previousGuard=scenes.guard;
  scenes.guard=function(){
    const selfStarted=!!s.quests?.missing && !s.flags?.reported && s.flags?.investigationContractResolved!==true;
    if(selfStarted){
      return{
        title:'城衛隊長米菈',img:'harbor',
        text:'米菈聽完你已經先去過舊鐘塔的經過，皺著眉在地圖上補了幾個記號。「你比我的人還快。既然你已經插手，就把這件事正式接下來；至少城衛該付的調查訂金不能少。」',
        choices:[['正式接受委託','acceptQuest'],['既然我已有線索，談談更高的訂金','bargain'],['先繼續自行調查','towerRoad'],['返回港口','arrival']]
      };
    }
    return previousGuard();
  };

  const previousAct=act;
  act=function(a){
    if(!['acceptQuest','bargain'].includes(a)){
      previousAct(a);
      return;
    }

    s.flags=s.flags||{};
    if(s.flags.reported||s.flags.investigationContractResolved===true){
      previousAct(a);
      return;
    }

    const existingQuest=s.quests?.missing;
    if(existingQuest){
      // narrative-flow.js only grants the contract advance when the quest object
      // does not exist. Temporarily hide the self-started quest so the canonical
      // acceptance/negotiation logic (including bargain odds and failed-bargain
      // fallback payment) runs, then restore the player's actual quest progress.
      delete s.quests.missing;
      previousAct(a);
      s.quests.missing=existingQuest;
      s.flags.investigationContractResolved=true;
      save();
      showScene();
      return;
    }

    previousAct(a);
    if(s.quests?.missing){
      s.flags.investigationContractResolved=true;
      save();
    }
  };
})();
