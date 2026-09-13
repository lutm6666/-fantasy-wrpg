// Ashen Realms v0.3.4 — 灰港第二幕開場：《沒有名字的屍體》
(function(){
  const SAVE_VERSION=4;
  let pendingV034Feedback='';

  baseState.version=SAVE_VERSION;
  baseState.day=baseState.day||1;
  baseState.relationships=baseState.relationships||{mira:{trust:0,approval:0,debt:0}};

  // 依最新世界觀修正既有文字，不改變既有數值與職業相容性。
  if(races.undead){
    races.undead.desc='肉體已脫離正常生命狀態，卻仍維持完整人格的一類存在。形成原因各異，常遭活人社會戒備。';
    races.undead.trait='亡者之軀：不易受恐懼與疾病影響，能感知死亡魔力；部分 NPC 對你戒備。';
  }
  if(classes.gravebound){
    classes.gravebound.desc='研究如何控制自身死亡狀態、穩定人格並以死亡力量作戰的不死者武技傳承。';
  }

  const previousLockReason=lockReason;
  lockReason=function(rid,cid){
    if(cid==='paladin'&&rid==='undead') return '傳統授火儀式需要生命、靈魂與肉體形成特定共鳴；一般不死者無法建立這種結構。';
    return previousLockReason(rid,cid);
  };

  function ensureV034(){
    s.version=SAVE_VERSION;
    s.flags=s.flags||{};
    s.quests=s.quests||{};
    s.day=Math.max(1,Number(s.day)||1);
    s.relationships=s.relationships||{};
    s.relationships.mira=Object.assign({trust:0,approval:0,debt:0},s.relationships.mira||{});
    if(s.flags.reported&&s.quests.missing){s.quests.missing.completed=true;}
    if(s.quests.tide&&s.quests.tide.stage>=4){s.quests.tide.completed=true;}
    if(s.quests.namelessCorpse&&s.quests.namelessCorpse.stage>=7){s.quests.namelessCorpse.completed=true;}
    if(s.flags.grayharborAct2Started&&!s.quests.namelessCorpse){
      s.quests.namelessCorpse={name:'沒有名字的屍體',stage:1,desc:'前往舊港北渠，調查一名從排水渠走出的失蹤者。'};
    }
  }

  function feedbackV034(text){pendingV034Feedback=text||'';}
  function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
  function relationship(kind,delta,text){
    ensureV034();
    const m=s.relationships.mira;
    if(kind==='debt')m.debt=clamp((m.debt||0)+delta,0,3);
    else m[kind]=clamp((m[kind]||0)+delta,-3,3);
    if(text)feedbackV034(text);
  }
  function relationLabel(kind,n){
    const maps={
      trust:{'-3':'敵意','-2':'高度戒備','-1':'有所保留','0':'尚未建立','1':'願意合作','2':'信任','3':'高度信任'},
      approval:{'-3':'價值觀衝突','-2':'強烈不認同','-1':'有所不滿','0':'尚未判斷','1':'大致認同','2':'高度認同','3':'理念契合'},
      debt:{'0':'無','1':'記得一份人情','2':'有所虧欠','3':'重大人情'}
    };
    return maps[kind][String(n)]||'尚未判斷';
  }
  function addItemOnce(item){if(!s.inventory.some(x=>x.id===item.id))s.inventory.push(item);}
  function startNamelessQuest(){
    if(s.flags.grayharborAct2Started)return;
    s.flags.grayharborAct2Started=true;
    s.flags.allenAlive=true;
    s.quests.namelessCorpse={name:'沒有名字的屍體',stage:1,desc:'城衛封鎖了舊港北渠。據說一名已經死亡的失蹤者從排水渠自行走了出來。'};
    log('新任務：沒有名字的屍體。');
  }
  function setNameless(stage,desc){
    startNamelessQuest();
    s.quests.namelessCorpse.stage=Math.max(stage,s.quests.namelessCorpse.stage||1);
    if(desc)s.quests.namelessCorpse.desc=desc;
  }
  function go(scene){s.scene=scene;save();showScene();}

  ensureV034();

  // 將 v0.3.4 的敘事回饋插入既有 showScene，不破壞 v0.3.2 的回饋系統。
  const previousShowScene=showScene;
  showScene=function(){
    previousShowScene();
    if(!pendingV034Feedback)return;
    const copy=document.querySelector('.hero-copy');
    const choices=copy?.querySelector('.choices');
    if(copy&&choices){
      const note=document.createElement('div');
      note.className='story-feedback';
      note.setAttribute('role','status');
      note.textContent=pendingV034Feedback;
      copy.insertBefore(note,choices);
    }
    pendingV034Feedback='';
  };

  // 灰港中心增加休息與第二幕入口。
  const previousTavern=scenes.tavern;
  scenes.tavern=function(){
    const o=previousTavern();
    if(!o.choices.some(x=>x[1]==='restInn'))o.choices.splice(Math.max(0,o.choices.length-1),0,['租房休息到隔天（5 金幣）','restInn']);
    if(s.gold<5&&!s.flags.freeBenchRestUsed&&!o.choices.some(x=>x[1]==='restBench'))o.choices.splice(Math.max(0,o.choices.length-1),0,['在公共長椅休息','restBench']);
    return o;
  };
  const previousArrival=scenes.arrival;
  scenes.arrival=function(){
    const o=previousArrival();
    if(s.flags.grayharborAct2Started&&!s.flags.thirdDrainDiscovered&&!o.choices.some(x=>x[1]==='northCanal')){
      o.choices.splice(Math.max(0,o.choices.length-1),0,['前往城衛封鎖的北渠出口','northCanal']);
    }
    if(s.flags.thirdDrainDiscovered&&!o.choices.some(x=>x[1]==='thirdDrain')){
      o.choices.splice(Math.max(0,o.choices.length-1),0,['前往舊港第三排水閘','thirdDrain']);
    }
    return o;
  };

  scenes.act2Rumor=()=>({
    title:'灰港的第二個清晨',img:'tavern',
    text:'清晨的灰港比平常更吵。酒館外有人說城衛封鎖了舊港北渠；有人聲稱看見一具屍體從排水道走了出來。更奇怪的是——那具屍體正在要求見米菈。',
    choices:[['前往北渠出口','northCanal'],['先向哈洛打聽','act2AskHarlo'],['暫時不管','arrival']]
  });
  scenes.act2Harlo=()=>({
    title:'哈洛的消息',img:'tavern',
    text:'哈洛把酒杯推回架上。「城衛一早就把北渠封了。那傢伙沒咬人，也沒亂叫，就坐在牆邊一直說地下還有人。這比會咬人的死人更讓我不舒服。」',
    choices:[['前往北渠出口','northCanal'],['返回港口','arrival']]
  });

  scenes.northCanal=function(){
    const injured=s.flags.allenInjured?'艾倫的身體因剛才的衝突顯得更加僵硬，但他的神智仍然清楚。':'';
    if(s.flags.allenInterviewComplete){
      return{title:'北渠出口',img:'harbor',text:`城衛仍守著排水渠。艾倫坐在牆邊，等待你決定下一步。${injured}`,choices:[['整理地下入口的線索','allenClue'],['決定如何安置艾倫','allenDisposition'],['返回灰港','arrival']]};
    }
    return{title:'北渠出口',img:'harbor',text:'數名城衛持武器包圍著一個坐在濕牆邊的男人。他的衣服沾滿泥水，臉色沒有活人的血色，卻正平靜地看著所有人。城衛喝道：「再靠近一步，我就動手。」男人回答：「我沒有要靠近你。」城衛咬牙：「死人不會說話。」男人沉默片刻：「這幾天我也一直希望你是對的。」米菈看到你後只說：「很好。你來得比驗屍官快。」',choices:[['他沒有攻擊任何人，先讓他說完。','allenStanceHear'],['先限制他的行動，再問清楚。','allenStanceRestrain'],['死人就應該躺著。','allenStanceHostile'],...((s.classId==='cleric'||s.classId==='gravebound')?[['如果他還能回答問題，就先把他當成證人。','allenStanceWitness']]:[]),['返回灰港','arrival']]};
  };

  scenes.allenIdentity=()=>({
    title:'艾倫・梅爾',img:'harbor',
    text:'男人自稱艾倫・梅爾，是灰港碼頭搬運工。米菈翻出失蹤紀錄：「艾倫・梅爾，六天前失蹤。」艾倫怔了一下，低頭看著自己的手。「六天？我以為……最多兩天。」',
    choices:[['讓他說明失蹤後發生的事','allenTestimony'],['先讓城衛醫師檢查他','allenDoctor']]
  });
  scenes.allenDoctor=()=>({
    title:'沒有心跳的證人',img:'harbor',
    text:'城衛醫師檢查了很久，最後抬起頭：「他沒有正常心跳。」旁邊的城衛立刻說：「所以就是亡靈。」醫師冷冷回了一句：「我沒說他沒有意識。」',
    choices:[['聽艾倫的證詞','allenTestimony']]
  });
  scenes.allenTestimony=()=>({
    title:'地下的夜間工作',img:'harbor',
    text:'艾倫記得下工後有人以高薪招募夜間搬運。他被蒙眼帶進舊港地下；那裡遠比正常排水系統更深，有些牆甚至會自行亮起。他見過其他失蹤者，也記得有人對他們進行所謂的「測試」。最後的記憶是劇烈疼痛，以及研究人員彼此爭吵。再次醒來時，他已經不需要呼吸。',
    choices:[['進一步檢查艾倫的狀態','allenStatus'],['問他最想知道什麼','allenWifeQuestion']]
  });
  scenes.allenStatus=function(){
    const choices=[];
    if((s.classId==='mage'||s.classId==='spellblade')&&!s.flags.allenArcaneChecked)choices.push(['分析維持他的力量【奧術】','allenCheckArcane']);
    if(s.classId==='cleric'&&!s.flags.allenFaithChecked)choices.push(['感受他的意志是否完整【牧師】','allenCheckFaith']);
    if(s.classId==='gravebound'&&!s.flags.allenUndeadChecked)choices.push(['詢問他如何感覺自己的身體【墓誓者】','allenCheckUndead']);
    if((s.raceId==='dwarf'||s.classId==='runeguard')&&!s.flags.ancientDustFound)choices.push(['檢查衣物上的黑色粉末【矮人】','allenCheckDust']);
    if(s.classId==='spiritcaller'&&!s.flags.allenSpiritChecked)choices.push(['傾聽他周圍的祖靈回聲【祖靈使】','allenCheckSpirit']);
    choices.push(['繼續詢問艾倫','allenWifeQuestion']);
    return{title:'活著，還是活動著？',img:'harbor',text:'艾倫能理解問題、回憶過去，也會因城衛的戒備感到不安。但他的身體顯然已經不再依靠普通生命機能運作。',choices};
  };
  scenes.allenWifeQuestion=()=>({
    title:'艾倫的請求',img:'harbor',
    text:'艾倫沉默了一會兒，問：「我妻子還活著嗎？瑪拉・梅爾。她住在下城區。」米菈沒有替你回答，只觀察你會怎麼處理。',
    choices:[['我會帶你去見她。','promiseMara'],['先把地下發生的事全部說清楚。','infoBeforeMara'],['她不該看到你現在的樣子。','denyMara'],['她已經死了。','lieMara']]
  });
  scenes.guardConflict=()=>({
    title:'一觸即發',img:'harbor',
    text:'一名年輕城衛越看越緊張，突然把武器舉向艾倫。「再拖下去，等它發狂就晚了。」米菈正要開口，所有人的視線卻先落到你身上。',
    choices:[['直接擋在艾倫與城衛之間','defendAllen'],['叫艾倫退後，避免衝突','orderAllenBack'],['不介入','standAsideAllen'],['城衛說得對，先控制威脅','supportGuardAllen']]
  });
  scenes.allenClue=()=>({
    title:'未知黑色薄片',img:'harbor',
    text:'艾倫從破損衣物的內層取出一塊薄而堅硬的黑色物體。「醒來以前，有個研究者趁亂把這東西塞給我。他只說：『如果你還能醒來，就別走原來那條路。』」物體沒有文字，也看不出任何接縫。',
    choices:[['收下黑色薄片並詢問入口線索','takeAncientKeycard']]
  });
  scenes.allenDisposition=function(){
    const choices=[];
    if(s.flags.allenWifePromised&&!s.flags.allenMetMara&&s.flags.allenAlive!==false)choices.push(['履行承諾，帶艾倫去見瑪拉','visitMara']);
    if(s.flags.allenAlive!==false){
      choices.push(['請米菈安排城衛保護','protectAllen']);
      if(s.flags.allenMetMara)choices.push(['讓艾倫暫時留在妻子家','leaveAllenWithMara']);
      choices.push(['讓艾倫自行離開灰港','allenLeaveGrayharbor']);
      choices.push(['把艾倫交給研究這種現象的人','allenResearchers']);
      if(s.flags.playerSupportedGuardAgainstAllen)choices.push(['不再阻止城衛結束他的活動','allenKilled']);
    }else{
      choices.push(['離開北渠，繼續追查地下入口','drainSearch']);
    }
    return{title:'艾倫的去處',img:'harbor',text:'證詞已經取得，但艾倫不能永遠坐在北渠。城衛不知道該把他視為受害者、證人，還是一具危險的屍體。最後的處置仍需要有人做出決定。',choices};
  };
  scenes.maraHouse=()=>({
    title:'梅爾家',img:'harbor',
    text:'瑪拉開門看到艾倫時，下意識退了一步。她沒有立刻相信，也沒有立刻趕走他，而是問了幾件只有兩人知道的小事。艾倫全部答對。瑪拉低聲問：「如果你真的死了……那站在我面前的是誰？」艾倫說：「我不知道。但我還記得妳討厭下雨天晾衣服，也記得我們第一次吵架是因為那張該死的餐桌。如果那些都不算我，我也不知道還剩下什麼可以算。」瑪拉最後只對城衛說：「至少讓我自己決定他是不是我的丈夫。」',
    choices:[['返回北渠，決定艾倫的安置','allenDisposition']]
  });
  scenes.drainSearch=function(){
    const dust=s.flags.ancientDustFound?'你把衣物上的黑色粉末與老碼頭不同排水閘的石縫逐一比對，第三排水閘附近出現了相同殘留。':'';
    const key=s.flags.ancientKeycardObtained?'掌中的黑色薄片越靠近老碼頭北側，溫度越明顯。':'';
    return{title:'尋找地下入口',img:'harbor',text:`艾倫記得被蒙眼帶路時，曾聽見潮聲和巨大鐵鏈摩擦聲；途中水位明顯下降。${dust}${key}所有線索最後都指向退潮後才容易接近的第三排水閘。`,choices:[['前往舊港第三排水閘','thirdDrain']]};
  };
  scenes.thirdDrain=function(){
    if(s.flags.sunkenRoadUnlocked){
      return{title:'舊港第三排水閘',img:'harbor',text:'退潮後的黑色牆面仍靜靜立在排水閘最深處。門後傳來低沉而規律的震動。《沉在城下的道路》將從這裡繼續。',choices:[['嘗試進一步開啟','sunkenRoadGate'],['返回灰港','arrival']]};
    }
    return{title:'舊港第三排水閘',img:'harbor',text:'退潮後，污水降到膝蓋以下。排水閘最深處有一面過於平整的黑色牆面：沒有門把、沒有鎖，甚至看不見接縫。你把黑色薄片靠近時，它突然微微發熱，牆面隨即浮現一道極細的淡白光線。米菈盯著牆說：「告訴我那不是一道門。」你幾乎不用思考就知道答案。',choices:[['確認這是一道入口','discoverThirdDrain'],['返回灰港','arrival']]};
  };
  scenes.sunkenRoadGate=()=>({
    title:'沉在城下的道路',img:'harbor',
    text:'門後傳來低沉而規律的震動。你已經找到入口，但裡面的空間顯然比灰港任何排水設施都更加古老。你還需要更多準備。',
    choices:[['返回灰港','arrival']]
  });

  function settleAllen(flag,text){
    s.flags[flag]=true;
    s.flags.allenInterviewComplete=true;
    setNameless(5,'艾倫的證詞已經取得。沿著他留下的線索，尋找舊港地下入口。');
    feedbackV034(text);
    go('drainSearch');
  }

  const previousAct=act;
  act=function(a){
    ensureV034();
    if(['northCanal','act2Harlo','allenIdentity','allenDoctor','allenTestimony','allenStatus','allenWifeQuestion','guardConflict','allenClue','allenDisposition','maraHouse','drainSearch','thirdDrain','sunkenRoadGate','act2Rumor'].includes(a)){go(a);return;}

    if(a==='restInn'||a==='restBench'){
      if(a==='restInn'){
        if(s.gold<5){toast('金幣不足');return;}
        s.gold-=5;change('金幣',-5);s.hp=maxHp();s.day+=1;log(`你在斷錨酒館休息到第 ${s.day} 日。`);
      }else{
        if(s.flags.freeBenchRestUsed){toast('哈洛不會再讓你免費佔著長椅');return;}
        s.flags.freeBenchRestUsed=true;s.hp=Math.max(s.hp,Math.ceil(maxHp()*.6));s.day+=1;log(`你在酒館公共長椅休息到第 ${s.day} 日。`);
      }
      if(s.flags.reported&&!s.flags.grayharborAct2Started){
        startNamelessQuest();feedbackV034('鐘塔事件才剛告一段落，灰港又出現新的異常。');s.scene='act2Rumor';
      }else{s.scene='tavern';feedbackV034('你休息了一夜，恢復了精神。');}
      save();showScene();return;
    }
    if(a==='act2AskHarlo'){go('act2Harlo');return;}

    if(['allenStanceHear','allenStanceRestrain','allenStanceHostile','allenStanceWitness'].includes(a)){
      if(a==='allenStanceHear')relationship('approval',1,'米菈明顯認同你先聽證詞的處理方式。');
      if(a==='allenStanceHostile')relationship('approval',-1,'米菈沒有反駁，但你看得出她並不接受你的做法。');
      if(a==='allenStanceWitness')relationship('approval',1,'米菈明顯認同你先把艾倫視為證人的判斷。');
      setNameless(2,'確認北渠出現的男子是否真是失蹤的碼頭工艾倫・梅爾。');go('allenIdentity');return;
    }
    if(a==='allenDoctor'){go('allenDoctor');return;}
    if(a==='allenTestimony'){setNameless(3,'艾倫仍保有完整意識。調查他的狀態與地下經歷。');go('allenTestimony');return;}

    if(a==='allenCheckArcane'){
      s.flags.allenArcaneChecked=true;feedbackV034('你能感覺到某種力量正在維持艾倫，但它沒有普通死靈術那種明顯的外部控制結構。');go('allenStatus');return;
    }
    if(a==='allenCheckFaith'){
      s.flags.allenFaithChecked=true;feedbackV034('他的肉體沒有正常生命反應，但你仍能清楚感受到一個完整、自洽的意志。');go('allenStatus');return;
    }
    if(a==='allenCheckUndead'){
      s.flags.allenUndeadChecked=true;feedbackV034('你問他這具身體是否仍屬於自己。艾倫回答：「是。只是它不再自己幫我活著。」');go('allenStatus');return;
    }
    if(a==='allenCheckDust'){
      s.flags.ancientDustFound=true;feedbackV034('你在衣物與傷處附近找到極細黑色粉末。它不像任何常見金屬加工殘留。');go('allenStatus');return;
    }
    if(a==='allenCheckSpirit'){
      s.flags.allenSpiritChecked=true;feedbackV034('你感受到混亂而陌生的彼界雜訊，但沒有任何祖靈回答。');go('allenStatus');return;
    }

    if(['promiseMara','infoBeforeMara','denyMara','lieMara'].includes(a)){
      if(a==='promiseMara'){s.flags.allenWifePromised=true;relationship('approval',1,'米菈明顯認同你願意讓艾倫與家人自己面對真相。');}
      if(a==='denyMara')relationship('approval',-1,'米菈皺了一下眉；她顯然不認為這個決定應該由你替瑪拉做。');
      if(a==='lieMara'){s.flags.liedToAllenAboutMara=true;relationship('trust',-1,'米菈看你的眼神多了一層戒備。');}
      setNameless(4,'艾倫提供了地下研究場所的證詞；北渠的緊張情勢仍未解除。');go('guardConflict');return;
    }

    if(['defendAllen','orderAllenBack','standAsideAllen','supportGuardAllen'].includes(a)){
      if(a==='defendAllen'){
        s.flags.miraDefendedAllen=true;relationship('trust',1,'米菈似乎更願意相信你在危機中的判斷。');relationship('approval',1,'米菈明顯認同你沒有把尚未攻擊任何人的艾倫當成目標。');
      }
      if(a==='orderAllenBack')relationship('trust',1,'你沒有讓局面升高；米菈似乎更願意相信你的判斷。');
      if(a==='standAsideAllen')relationship('trust',-1,'米菈親自壓下衝突，之後看你的眼神明顯多了幾分保留。');
      if(a==='supportGuardAllen'){
        s.flags.playerSupportedGuardAgainstAllen=true;s.flags.allenInjured=true;relationship('approval',-2,'米菈的表情冷了下來。她不接受在艾倫沒有攻擊任何人時先以暴力處理。');
      }
      go('allenClue');return;
    }

    if(a==='takeAncientKeycard'){
      addItemOnce({id:'ancientKeycard',name:'未知黑色薄片',type:'quest',desc:'薄而堅硬的黑色物體。沒有明顯接縫或文字，材質不像任何常見金屬。'});
      s.flags.ancientKeycardObtained=true;s.flags.allenInterviewComplete=true;setNameless(5,'你取得一塊來自地下設施的未知黑色薄片。決定艾倫的去處，並追查真正入口。');toast('獲得：未知黑色薄片');go('allenDisposition');return;
    }

    if(a==='visitMara'){
      s.flags.allenMetMara=true;relationship('approval',1,'米菈明顯認同你履行了對艾倫的承諾。');go('maraHouse');return;
    }
    if(a==='protectAllen'){settleAllen('allenProtected','米菈安排一處不公開的城衛房間保護艾倫，並記下你替證人承擔的風險。');relationship('trust',1,'米菈似乎更願意相信你的判斷。');return;}
    if(a==='leaveAllenWithMara'){settleAllen('allenWithMara','瑪拉要求城衛暫時離開。她是否仍把艾倫視為丈夫，至少應該由她自己決定。');return;}
    if(a==='allenLeaveGrayharbor'){settleAllen('allenLeftGrayharbor','艾倫披上斗篷離開灰港。他沒有說目的地，只說如果還能找到答案，總有一天會再回來。');return;}
    if(a==='allenResearchers'){settleAllen('allenGivenToResearchers','你把艾倫交給願意研究這種現象的人。米菈沒有阻止，但她顯然記住了這項決定。');relationship('approval',-1,'米菈沒有反駁，但你看得出她對這個安排並不安心。');return;}
    if(a==='allenKilled'){
      s.flags.allenAlive=false;s.flags.allenInterviewComplete=true;relationship('approval',-2,'米菈沒有再說什麼，但你知道這項決定已經跨過她的底線。');setNameless(5,'艾倫已不再活動，但他的證詞與黑色薄片仍指向舊港地下。');feedbackV034('北渠重新安靜下來。這並沒有讓地下的問題消失。');go('drainSearch');return;
    }

    if(a==='discoverThirdDrain'){
      s.flags.thirdDrainDiscovered=true;s.flags.sunkenRoadUnlocked=true;
      setNameless(7,'艾倫・梅爾的遭遇將調查引向舊港第三排水閘下方，一處不屬於任何已知灰港建築的地下設施。');
      s.quests.namelessCorpse.completed=true;
      s.quests.sunkenRoad={name:'沉在城下的道路',stage:1,desc:'舊港第三排水閘後存在未知地下設施。準備妥當後，與米菈調查入口。'};
      if(!s.flags.namelessRewarded){s.flags.namelessRewarded=true;s.xp+=50;s.reputation=s.reputation||{guard:0,dockers:0,underworld:0};s.reputation.guard=(s.reputation.guard||0)+1;change('經驗',50);levelCheck();}
      log('完成任務：沒有名字的屍體。');feedbackV034('米菈盯著淡白色線條：「告訴我那不是一道門。」你確認後，她低聲嘆氣：「我就知道你會這麼說。」');save();showScene();return;
    }

    previousAct(a);
  };

  // 角色頁：保留既有裝備、聲望等內容，在下方加入重要人物。
  const previousShowCharacter=showCharacter;
  showCharacter=function(){
    previousShowCharacter();
    ensureV034();
    const sheet=$('#sheet');if(!sheet)return;
    const m=s.relationships.mira;
    sheet.insertAdjacentHTML('beforeend',`<div class="divider"></div><h3>重要人物</h3><div class="item"><b>米菈・維森</b><div class="muted" style="margin-top:6px">信任：${relationLabel('trust',m.trust)}<br>立場：${relationLabel('approval',m.approval)}<br>人情：${relationLabel('debt',m.debt)}</div></div>`);
  };

  // 任務日誌正式區分進行中與已完成。
  showJournal=function(){
    ensureV034();
    const qs=Object.values(s.quests||{});
    openModal(`<h2>任務日誌</h2>${qs.length?qs.map(q=>`<div class="item"><div class="spread"><b>${q.name}</b><span class="tag">${q.completed?'已完成':`階段 ${q.stage||1}`}</span></div><div class="muted" style="margin-top:6px">${q.desc||''}</div></div>`).join(''):'目前沒有進行中的任務。'}`);
  };

  showMenu=function(){
    openModal(`<h2>系統</h2><p>版本 <b>v0.3.4</b></p><p class="muted">「沒有名字的屍體」更新：新增灰港第二幕開場、艾倫與瑪拉事件、米菈三維關係、休息與日期推進、角色特殊調查、未知黑色薄片、第三排水閘與下一主線《沉在城下的道路》。並依最新世界設定修正不死者、墓誓者與授火相關文字。</p><div class="choices"><button onclick="save();toast('已儲存')">立即儲存</button><button class="danger" onclick="resetGame()">刪除存檔並重新開始</button></div>`);
  };

  ensureV034();save();
  if(s.created)showScene();
})();
