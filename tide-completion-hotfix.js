// Ashen Realms — ensure the Grayharbor tide quest is marked complete immediately.
(function(){
  function syncTideCompletion(){
    const q=s.quests?.tide;
    if(q && q.stage>=4 && !q.completed){
      q.completed=true;
      return true;
    }
    return false;
  }

  const previousAct=act;
  act=function(a){
    previousAct(a);
    if(['returnDockLedger','giveGuardLedger','leaveLedger'].includes(a) && syncTideCompletion()){
      save();
    }
  };

  // Repair saves that completed the quest during the current browser session before
  // this fix loaded, without changing rewards, reputation, or narrative choices.
  if(syncTideCompletion()) save();
})();
