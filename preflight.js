// Compatibility shim: game.js v0.2 migrator clears combat from newer saves.
// Temporarily present v3+ saves as v2 during the base load; game-v03 restores version 3 immediately after.
(function(){
  try{
    const key='ashen-realms-save';
    const raw=localStorage.getItem(key);
    if(!raw)return;
    const data=JSON.parse(raw);
    if(Number(data?.version)>=3 && data?.combat){
      // Keep an in-memory copy as a fallback. Some Safari storage modes can read an
      // existing save but reject writes; in that case the v0.2 migrator would still
      // clear the combat before the later compatibility layers have a chance to run.
      window.__ashenPreflightCombat=JSON.parse(JSON.stringify(data.combat));
      data.version=2;
      try{
        localStorage.setItem(key,JSON.stringify(data));
        window.__ashenPreflightDowngradeWritten=true;
      }catch(_e){
        window.__ashenPreflightDowngradeWritten=false;
      }
    }
  }catch(_e){}
})();
