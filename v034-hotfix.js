// Ashen Realms v0.3.4 — integration and continuity fixes loaded after the Act II module.
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
  function allenDispositionResolved(){
    return !!(s.flags?.allenDispositionResolved||s.flags?.allenProtected||s.flags?.allenWithMara||s.flags?.allenLeftGrayharbor||s.flags?.allenGivenToResearchers||s.flags?.allenAlive===false);
  }
  function markDispositionResolved(){
    s.flags=s.flags||{};
    s.flags.allenDispositionResolved=true;
  }
  function dispositionSummary(){
    if(s.flags?.allenAlive===false)return '艾倫已不再活動。北渠只剩下城衛封鎖線與他留下的證詞。';
    if(s.flags?.allenProtected)return '艾倫已被米菈秘密轉移到城衛保護地點。北渠現在只剩值守的城衛。';
    if(s.flags?.allenWithMara)return '艾倫已暫時回到瑪拉家。北渠的城衛仍守著排水口，防止其他人靠近。';
    if(s.flags?.allenLeftGrayharbor)return '艾倫已自行離開灰港。北渠只剩封鎖線與等待整理的調查紀錄。';
    if(s.flags?.allenGivenToResearchers)return '艾倫已被研究異常現象的人員帶離北渠。城衛仍對這個安排保持戒心。';
    return '艾倫的去向已經決定。北渠的調查重點只剩通往地下設施的線索。';
  }

  // Repair saves created before the disposition lock was added.
  if(allenDispositionResolved())markDispositionResolved();

  // After Allen has been moved, do not show him sitting at the canal or allow a
  // second, contradictory disposition choice.
  if(scenes.northCanal){
    const previousNorthCanal=scenes.northCanal;
    scenes.northCanal=function(){
      if(!allenDispositionResolved())return previousNorthCanal();
      return{
        title:'北渠出口',img:'harbor',text:dispositionSummary(),
        choices:[['整理地下入口的線索','drainSearch'],['返回灰港','arrival']]
      };
    };
  }
  if(scenes.allenDisposition){
    const previousAllenDisposition=scenes.allenDisposition;
    scenes.allenDisposition=function(){
      if(!allenDispositionResolved())return previousAllenDisposition();
      return{
        title:'艾倫的去向',img:'harbor',text:`${dispositionSummary()}這項決定已經做出，現在應把注意力轉回地下入口。`,
        choices:[['繼續追查地下入口','drainSearch'],['返回灰港','arrival']]
      };
    };
  }

  function syncAct2Location(){
    const scene=s.scene;
    let next=null;
    if(['act2Rumor','act2Harlo','northCanal','allenIdentity','allenDoctor','allenTestimony','allenStatus','allenWifeQuestion','guardConflict','allenClue','allenDisposition','maraHouse'].includes(scene))next='灰港';
    else if(scene==='drainSearch')next='舊港';
    else if(['thirdDrain','sunkenRoadGate'].includes(scene))next='舊港第三排水閘';
    if(next&&s.location!==next){s.location=next;return true;}
    return false;
  }

  const previousAct=act;
  act=function(a){
    // These two branches need the relationship update before scene rendering/save.
    if(a==='protectAllen'){
      const m=ensureMira();m.trust=clamp((m.trust||0)+1,-3,3);
      s.flags.allenProtected=true;s.flags.allenInterviewComplete=true;markDispositionResolved();
      ensureNameless();s.quests.namelessCorpse.stage=Math.max(5,s.quests.namelessCorpse.stage||1);
      s.quests.namelessCorpse.desc='艾倫已由城衛秘密保護。沿著他的證詞與黑色薄片，尋找舊港地下入口。';
      s.scene='drainSearch';s.location='舊港';log('米菈安排城衛秘密保護艾倫。');save();showScene();toast('米菈似乎更願意相信你的判斷。');return;
    }
    if(a==='allenResearchers'){
      const m=ensureMira();m.approval=clamp((m.approval||0)-1,-3,3);
      s.flags.allenGivenToResearchers=true;s.flags.allenInterviewComplete=true;markDispositionResolved();
      ensureNameless();s.quests.namelessCorpse.stage=Math.max(5,s.quests.namelessCorpse.stage||1);
      s.quests.namelessCorpse.desc='艾倫已被交給研究異常現象的人員。沿著他的證詞與黑色薄片，尋找舊港地下入口。';
      s.scene='drainSearch';s.location='舊港';log('你把艾倫交給研究這種現象的人。');save();showScene();toast('米菈對這個安排並不安心。');return;
    }

    // The remaining disposition routes are handled by the main Act II module.
    // Mark them before delegating so its own save persists the lock atomically.
    if(['leaveAllenWithMara','allenLeaveGrayharbor','allenKilled'].includes(a))markDispositionResolved();

    previousAct(a);
    if(syncAct2Location())save();
  };

  if(syncAct2Location())save();
})();
