// Ashen Realms input safety fixes.
(function(){
  function cleanPlayerName(value){
    const cleaned=String(value??'').replace(/[<>]/g,'').trim().slice(0,16);
    return cleaned||'無名旅人';
  }

  // Existing saves may contain names created before player-name validation was
  // introduced. Several legacy views interpolate the name into innerHTML, so
  // remove markup delimiters once at load time before any later user action can
  // render them again.
  if(s.created){
    const cleaned=cleanPlayerName(s.name);
    if(cleaned!==s.name){
      s.name=cleaned;
      save();
    }
  }

  // Keep the creation flow compatible with the existing character builder while
  // ensuring the stored value is plain text. This protects HUD, character and
  // combat-log rendering without changing legitimate names or gameplay state.
  const previousChooseClass=chooseClass;
  window.chooseClass=function(id){
    const input=document.querySelector('#nameInput');
    if(input) input.value=cleanPlayerName(input.value);
    previousChooseClass(id);
  };
})();
