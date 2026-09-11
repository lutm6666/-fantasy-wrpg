// Compatibility shim: game.js v0.2 migrator clears combat from newer saves.
// Temporarily present v3+ saves as v2 during the base load; game-v03 restores version 3 immediately after.
(function(){
  try{
    const key='ashen-realms-save';
    const raw=localStorage.getItem(key);
    if(!raw)return;
    const data=JSON.parse(raw);
    if(Number(data?.version)>=3 && data?.combat){
      data.version=2;
      localStorage.setItem(key,JSON.stringify(data));
    }
  }catch(_e){}
})();
