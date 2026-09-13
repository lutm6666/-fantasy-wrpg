// Ashen Realms v0.3.4 — small integration fixes loaded after the Act II module.
(function(){
  // Correct older ritual wording to match the finalized soul/personality rules.
  if(scenes.ritualHall){
    const previousRitualHall=scenes.ritualHall;
    scenes.ritualHall=function(){
      const o=previousRitualHall();
      o.text=String(o.text)
        .replace('人格或靈魂狀態固定在活人身上','人格與肉體之間的連結固定在活人身上')
        .replace('某種靈魂資訊','某種人格資訊');
      return o;
    };
  }

  function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
  function ensureMira(){
    s.relationships=s.relationships||{};
    s.relationships.mira=Object.assign({trust:0,approval:0,debt:0},s.relationships.mira||{});
    return s.relationships.mira;
  }
  function ensureNameless(){
    s.quests=s.quests||{};
    if(!s.quests.namelessCorpse){
      s.quests.namelessCorpse={name:'沒有名字的屍體',stage:5,desc:'艾倫的證詞已經取得。沿著他留下的線索，尋找舊港地下入口。'};
    }
  }

  const previousAct=act;
  act=function(a){
    // These two branches need the relationship update before scene rendering/save.
    if(a==='protectAllen'){
      const m=ensureMira();m.trust=clamp((m.trust||0)+1,-3,3);
      s.flags.allenProtected=true;s.flags.allenInterviewComplete=true;
      ensureNameless();s.quests.namelessCorpse.stage=Math.max(5,s.quests.namelessCorpse.stage||1);
      s.quests.namelessCorpse.desc='艾倫已由城衛秘密保護。沿著他的證詞與黑色薄片，尋找舊港地下入口。';
      s.scene='drainSearch';log('米菈安排城衛秘密保護艾倫。');save();showScene();toast('米菈似乎更願意相信你的判斷。');return;
    }
    if(a==='allenResearchers'){
      const m=ensureMira();m.approval=clamp((m.approval||0)-1,-3,3);
      s.flags.allenGivenToResearchers=true;s.flags.allenInterviewComplete=true;
      ensureNameless();s.quests.namelessCorpse.stage=Math.max(5,s.quests.namelessCorpse.stage||1);
      s.quests.namelessCorpse.desc='艾倫已被交給研究異常現象的人員。沿著他的證詞與黑色薄片，尋找舊港地下入口。';
      s.scene='drainSearch';log('你把艾倫交給研究這種現象的人。');save();showScene();toast('米菈對這個安排並不安心。');return;
    }
    previousAct(a);
  };
})();
