// Ashen Realms v0.3.2 — narrative gating, feedback, and continuity polish.
(function(){
  let pendingFeedback='';

  function feedback(text){ pendingFeedback=text||''; }
  function ensureFlags(){
    s.flags=s.flags||{};
    if(s.quests?.missing) s.flags.knowsMissing=true;
    if(['guard','towerRoad','towerDeep','cellarGate','cellarCrossroads','cells','ritualHall','dungeonCleared','epilogue'].includes(s.scene)){
      s.flags.knowsMissing=true;
    }
    if(['towerRoad','towerDeep','cellarGate','cellarCrossroads','cells','ritualHall','dungeonCleared','epilogue'].includes(s.scene)){
      s.flags.knowsTower=true;
    }
    if(s.flags.towerNoise||s.flags.cellarKey||s.flags.ratsDefeated||s.flags.cellarOpen||s.flags.acolyteDefeated||s.flags.bossDefeated){
      s.flags.knowsMissing=true;s.flags.knowsTower=true;
    }
    if(s.flags.sigil) s.flags.knowsMissing=true;
  }
  function knowsMissing(){ensureFlags();return !!s.flags.knowsMissing}
  function knowsTower(){ensureFlags();return !!s.flags.knowsTower}
  function sigilKnown(){return !!s.flags.sigil}

  scenes.arrival=function(){
    ensureFlags();
    const extra=s.raceId==='undead'?'你把兜帽拉低；巡查的守衛在你身上多停留了幾秒。':'';
    const after=s.flags.reported?'鐘塔事件後，港區的戒備稍微鬆了一些；幾名城衛已經認得你。':'';
    const choices=[['詢問守衛最近發生了什麼','guard'],['查看失蹤告示','notice'],['前往「斷錨酒館」','tavern'],['前往灰港市集與工匠區','market']];
    if(knowsTower()) choices.push([s.flags.ratsDefeated?'返回舊鐘塔':'前往舊鐘塔附近','towerRoad']);
    return{title:'鹽霧中的灰港',img:'harbor',text:`港口被低沉的鐘聲籠罩。灰斗篷守衛正在檢查旅客，一名老婦人緊抓著失蹤告示。遠處，斷裂鐘塔像黑色手指指向天空。${extra}${after}`,choices};
  };

  scenes.guard=function(){
    ensureFlags();s.flags.knowsMissing=true;s.flags.knowsTower=true;
    const undead=s.raceId==='undead'?'米菈看見你蒼白的手腕，沒有拔劍，只淡淡補了一句：「只要你守灰港的法律，我就不管你是不是死人。」':'';
    if(s.flags.reported){
      return{title:'城衛隊長米菈',img:'harbor',text:`米菈正在整理鐘塔事件的證物。她看見你便把一疊巡查紀錄壓到桌角。「至少灰港暫時安靜了。至於你帶回來的那些筆記……我還不敢說事情已經結束。」${undead}`,choices:[['返回港口','arrival']]};
    }
    if(s.quests?.missing){
      return{title:'城衛隊長米菈',img:'harbor',text:`米菈攤開一張簡陋地圖，指向北側的舊鐘塔。「最後幾個目擊都繞著那裡。先別相信議會說的逃兵故事；有發現就回來找我。」${undead}`,choices:[['前往舊鐘塔','towerRoad'],['返回港口','arrival']]};
    }
    return{title:'城衛隊長米菈',img:'harbor',text:`「第三個了。」女隊長壓低聲音。「三週內三個人失蹤，最後都有人看見他們往舊鐘塔走。議會說是逃兵或醉鬼，我不信。」${undead}`,choices:[['我可以調查。','acceptQuest'],['你願意付多少？','bargain'],['暫時不想惹麻煩。','arrival']]};
  };

  scenes.notice=function(){
    ensureFlags();s.flags.knowsMissing=true;
    const noted=s.flags.sigil?'你已經把那個被劈成兩半的眼形符號記在心裡。':'告示角落有一個不屬於官方的墨色符號——像被劈成兩半的眼睛。';
    const choices=[];
    if(!s.flags.sigil) choices.push(['仔細記住眼形符號','markSigil']);
    choices.push(['去酒館問問歐林的消息','tavern'],['找城衛隊長','guard'],['返回港口','arrival']);
    return{title:'被雨水浸透的告示',img:'harbor',text:`紙上畫著年輕抄寫員歐林：失蹤七日，最後出現於市場北街。${noted}`,choices};
  };

  scenes.tavern=function(){
    ensureFlags();
    if(!knowsMissing()){
      return{title:'斷錨酒館',img:'tavern',text:'廉價麥酒、濕羊毛與海鹽氣味混在一起。吟遊詩人彈著走調的小曲，角落幾桌水手各自談著港口生意。酒保哈洛只在你進門時抬了一下眼。',choices:[['花 3 金幣喝一杯黑麥酒','buyAle'],['返回港口','arrival']]};
    }
    const choices=[['向酒保打聽失蹤者','bartender']];
    if(!s.flags.towerNoise) choices.push(['留意角落傭兵的談話','mercs']);
    choices.push(['花 3 金幣喝一杯黑麥酒','buyAle'],['返回港口','arrival']);
    return{title:'斷錨酒館',img:'tavern',text:'廉價麥酒、濕羊毛與海鹽氣味混在一起。你提到失蹤者後，幾桌客人的聲音明顯低了一些；酒保哈洛假裝專心擦杯子，角落的傭兵則提到了夜裡的搬運工作。',choices};
  };

  scenes.bartender=function(){
    ensureFlags();s.flags.knowsMissing=true;s.flags.knowsTower=true;
    if(s.flags.cellarKey){
      return{title:'酒保哈洛',img:'tavern',text:'哈洛避開你的視線，手指在吧檯上敲了兩下。「鑰匙我已經給你了。別讓任何人知道是從我這裡拿的。」他顯然不打算再多說。',choices:[['返回酒館','tavern']]};
    }
    if(s.flags.bartenderPressed){
      return{title:'酒保哈洛',img:'tavern',text:'哈洛把擦乾的杯子倒扣在桌上。「我已經說過我知道的。鐘塔下面有人走動，剩下的你自己查。」',choices:[['返回酒館','tavern'],['前往舊鐘塔','towerRoad']]};
    }
    return{title:'酒保哈洛',img:'tavern',text:'「我只賣酒，不賣麻煩。」哈洛沒有看你。「不過那幾個失蹤的人……都問過舊鐘塔下面的路。」他說完立刻閉嘴，像是後悔自己已經說得太多。',choices:[['繼續追問','bartenderPress'],['先到鐘塔看看','towerRoad'],['不再逼他','tavern']]};
  };

  scenes.towerRoad=function(){
    ensureFlags();
    const after=s.flags.ratsDefeated?'通往鐘塔的側門已經被你清理過，裡面不再傳出鼠群騷動。':'';
    let clue='雨水把泥地沖得一片凌亂，一時看不出最近有哪些人來過。';
    if(s.flags.track) clue='你先前辨認出的拖行痕跡一路靠向鐘塔側牆，黑蠟碎屑卡在石縫裡。';
    else if(s.flags.trackChecked) clue='你已經檢查過泥地，但大雨抹掉了大部分能辨認的痕跡。';
    const choices=[];
    if(!s.flags.trackChecked) choices.push(['檢查地面是否留下線索','track']);
    choices.push([s.flags.ratsDefeated?'再次進入鐘塔':'進入鐘塔','towerEntry'],['返回灰港','arrival']);
    return{title:'舊鐘塔外圍',img:'tower',text:`雨水沿著破損鐘塔的石牆流下。半埋的石階通往一扇鏽蝕側門。${clue}${after}`,choices};
  };

  scenes.cellarCrossroads=function(){
    const undead=s.raceId==='undead'?'你感覺到一股只屬於亡者的寒意從右側深處傳來。':'';
    const right=s.flags.survivorFound?'傷者所說的祭壇就在右側走廊深處。':'右側走廊掛著陌生的眼形布幔，深處有冷焰忽明忽滅。';
    const rightChoice=s.flags.survivorFound?'依照傷者指示前往祭壇':'查看右側的冷焰走廊';
    return{title:'鐘塔地窖：岔路',img:'cellar',text:`地下拱廊比鐘塔本身古老得多。左側是一排鐵籠，${right}${undead}`,choices:[['搜索囚籠區','cells'],[rightChoice,'ritualHall'],['返回鐘塔','towerDeep']]};
  };

  scenes.cells=function(){
    let text;
    if(s.flags.survivorFound){
      text=s.flags.bossDefeated?'被救出的碼頭工已經離開。空籠裡只剩斷繩；想到祭壇已經沉寂，你終於能確定他提供的方向沒有錯。':'被救出的碼頭工已經離開，空籠裡只留下斷繩。他最後告訴你：歐林被灰面具的人帶往右側冷焰走廊。';
    }else{
      text='最裡面的鐵籠傳來微弱敲擊聲。一名失蹤的碼頭工仍然清醒；他看見你後立刻說，抄寫員歐林被「披灰面具的人」帶去了右側深處。';
    }
    const choices=s.flags.survivorFound?[['搜索附近殘留物','searchCells'],['返回岔路','cellarCrossroads']]:[['救出碼頭工並詢問歐林','rescueSurvivor'],['先搜索附近','searchCells'],['返回岔路','cellarCrossroads']];
    return{title:'廢棄囚籠',img:'cellar',text,choices};
  };

  scenes.ritualHall=function(){
    const knowsRoute=!!s.flags.survivorFound;
    const title=knowsRoute||sigilKnown()?'眼形祭壇':'冷焰石廳';
    let special;
    if(s.raceId==='undead') special='你不需要理解牆上的符號，也能感覺到這不是單純召魂：儀式正試圖把某種人格或靈魂狀態固定在活人身上。';
    else if(s.classId==='mage'||s.classId==='spellblade') special='殘留的奧術結構顯示，這套儀式正在強行固定某種靈魂資訊。';
    else special='石台旁散落著骨片與黑蠟，和你一路看到的眼形標記屬於同一套儀式。';
    const choices=[];
    if(!s.flags.acolyteDefeated)choices.push(['逼近正在看守石台的人','fightAcolyte']);
    else if(!s.flags.bossDefeated)choices.push(['進入侍從身後打開的暗門','fightWarden']);
    else choices.push(['檢查已沉寂的石台與側室','dungeonCleared']);
    choices.push(['退回岔路','cellarCrossroads']);
    return{title,img:'cellar',text:`高聳石柱之間吊著空鐵籠，中央石台燃著不自然的冷焰。${special}`,choices};
  };

  scenes.dungeonCleared=function(){
    return{title:'沉默的鐘塔',img:'cellar',text:'暗門後的側室裡，失蹤的抄寫員歐林仍然活著。他已經非常疲憊，但神智清楚。歐林把藏在衣內的筆記交給你，說灰面具的人自稱「裂眼」，而灰港只是他們眾多活動地點之一。你終於找到了失蹤案最重要的證人，也第一次知道這個名字並不只代表牆上的符號。',choices:[['護送歐林並帶著證據返回米菈身邊','reportQuest'],['先繼續探索地窖','cellarCrossroads']]};
  };

  scenes.epilogue=function(){
    return{title:'第一章：餘響',img:'harbor',text:'歐林被城衛帶去休息後，米菈獨自讀完他的筆記。她在其中幾頁停留得特別久，最後把一枚城衛徽記推到你面前。「如果這個叫裂眼的組織在別處也有據點，我們會需要一個不屬於議會的人去查。」失蹤案得到交代，但灰港地下留下的東西顯然只是開端。',choices:[['回到灰港自由探索','arrival']]};
  };

  const oldDocksBase=scenes.oldDocks;
  scenes.oldDocks=function(){
    const q=s.quests?.tide;
    if(!q) return oldDocksBase();
    if(q.stage>=4){
      let text='排水洞事件已經告一段落。';
      if(s.flags.tideOutcome==='returnDockLedger') text+='你把帳冊交回碼頭工人後，他們開始自己核對失竊貨物；娜莎見到你時明顯放鬆了許多。';
      else if(s.flags.tideOutcome==='giveGuardLedger') text+='城衛已經依照帳冊上的貨物流向展開盤查。碼頭工感謝你救回學徒，但也有人擔心接下來會有更多搜查。';
      else if(s.flags.tideOutcome==='leaveLedger') text+='學徒平安回來了，但那本帳冊沒有落到碼頭工或城衛手裡。有人似乎察覺你刻意留下了一條沒有說明的線索。';
      else text+='搬運工們重新使用這段碼頭，看到你時會點頭致意。';
      return{title:'老碼頭',img:'harbor',text,choices:[['返回市集','market']]};
    }
    return{title:'老碼頭',img:'harbor',text:'老碼頭的工人已經在等你的消息。娜莎指向木棧橋下方：「入口就在退潮時露出的排水拱洞。那孩子最後就是往那邊去的。」',choices:[['前往退潮排水洞','drainEntrance'],['返回市集','market']]};
  };

  scenes.drainEntrance=function(){
    let text='海水已退到腳踝以下。泥地被潮水反覆沖刷，幾道模糊刮痕通往拱洞深處，但現在還看不出是人、箱子還是野獸留下的。';
    if(s.flags.drainClue) text='你已確認泥地上的長痕來自反覆拖運的箱籠，入口邊還殘留燈油與固定貨物用的繩纖維；這裡顯然長期有人進出。';
    if(s.raceId==='beastfolk'&&!s.flags.drainClue) text+='你的嗅覺還捕捉到油脂、舊木箱與人的氣味。';
    if(s.classId==='rogue'&&!s.flags.drainClue) text+='入口石柱上的繩結方式讓你想到走私客常用的快速固定法。';
    const choices=[];
    if(!s.flags.drainClue) choices.push(['仔細檢查入口痕跡','inspectDrain']);
    choices.push(['深入排水洞','enterDrain'],['返回老碼頭','oldDocks']);
    return{title:'退潮排水洞',img:'harbor',text,choices};
  };

  showScene=function(){
    closeModal();
    if(s.combat){renderCombat();return}
    ensureFlags();
    const fn=scenes[s.scene]||scenes.arrival,o=fn();
    const note=pendingFeedback?`<div class="story-feedback" role="status">${escapeHtml(pendingFeedback)}</div>`:'';
    pendingFeedback='';
    main.innerHTML=`<section class="card hero">${sceneImage(o.img)}<div class="hero-copy"><h2>${o.title}</h2><p class="story">${o.text}</p>${note}<div class="choices">${o.choices.map(([t,a])=>`<button onclick="act('${a}')">${t}</button>`).join('')}</div></div></section>`;
  };

  const previousAct=act;
  act=function(a){
    ensureFlags();

    if(a==='guard'){s.flags.knowsMissing=true;s.flags.knowsTower=true;previousAct(a);return}
    if(a==='notice'){s.flags.knowsMissing=true;previousAct(a);return}
    if(a==='bartender'){
      if(!knowsMissing()){toast('你還沒有理由追問失蹤者');return}
      s.flags.knowsTower=true;previousAct(a);return;
    }
    if(a==='towerRoad'&&!knowsTower()){
      toast('你還不知道鐘塔與事件有什麼關係');return;
    }

    if(a==='acceptQuest'){
      if(!s.quests.missing){
        ensureQuest();s.gold+=10;change('金幣',10);log('接下任務：鐘塔下的失蹤者。');
        feedback('米菈先付給你 10 金幣作為調查訂金，並在地圖上圈出舊鐘塔的位置。');
      }
      s.flags.knowsMissing=true;s.flags.knowsTower=true;s.scene='guard';save();showScene();return;
    }

    if(a==='bargain'){
      if(!s.quests.missing){
        ensureQuest();
        const ok=Math.random()<(s.raceId==='human'?0.65:0.5);
        if(ok){s.gold+=20;change('金幣',20);log('你成功讓米菈提高訂金。');feedback('米菈盯了你幾秒，最後把訂金提高到 20 金幣。「拿了錢就給我帶點能用的消息回來。」');}
        else{log('米菈拒絕討價還價。');feedback('米菈沒有加價，只把鐘塔的位置點給你看。「先證明你值得更多報酬。」你仍然接下了調查。');}
      }
      s.flags.knowsMissing=true;s.flags.knowsTower=true;s.scene='guard';save();showScene();return;
    }

    if(a==='markSigil'){
      if(!s.flags.sigil){s.flags.sigil=true;log('你記下了眼形符號。');toast('獲得線索：眼形符號');feedback('你把符號的缺口、墨色與筆劃方向記了下來。現在若在其他地方再看到它，你應該能認出來。');}
      s.scene='notice';save();showScene();return;
    }

    if(a==='mercs'){
      s.flags.towerNoise=true;s.flags.knowsTower=true;log('你聽見傭兵提到鐘塔下面有人夜間搬運箱籠。');toast('獲得線索：夜間搬運');feedback('你裝作沒有留意，卻聽清楚其中一句：「又是北邊那座破鐘塔，半夜還有人把箱子往下面搬。」');
      s.scene='tavern';save();showScene();return;
    }

    if(a==='bartenderPress'){
      if(s.flags.bartenderPressed){s.scene='bartender';save();showScene();return}
      s.flags.bartenderPressed=true;
      const ok=Math.random()<(.48+(s.classId==='rogue'?.3:0));
      if(ok){
        if(!s.flags.cellarKey){s.flags.cellarKey=true;s.inventory.push({id:'cellarKey',name:'生鏽的地窖鑰匙',type:'quest',desc:'哈洛偷偷塞給你的鑰匙。'});toast('獲得：地窖鑰匙')}
        log('哈洛承認有人利用鐘塔地窖進出。');feedback('哈洛沉默許久，最後把一把生鏽鑰匙從吧檯下推過來。「鐘塔地窖的舊鎖。別問我是怎麼拿到的，也別說是我給你的。」');
      }else{
        log('哈洛拒絕再說任何話。');feedback('哈洛的表情立刻冷了下來。「我已經說得夠多了。」無論你再怎麼追問，他都不肯開口。');
      }
      s.scene='bartender';save();showScene();return;
    }

    if(a==='buyAle'){
      if(s.gold>=3){
        s.gold-=3;const h=Math.min(8,maxHp()-s.hp);s.hp+=h;change('金幣',-3);change('生命',h);log('你喝了一杯味道可疑的黑麥酒。');feedback(h>0?`黑麥酒比聞起來更烈。你暖了些，也回復了 ${h} 點生命。`:'黑麥酒讓喉嚨發熱，但你現在不需要更多休息。');
      }else feedback('你摸了摸錢袋，只好把酒杯推回去。');
      s.scene='tavern';save();showScene();return;
    }

    if(a==='track'){
      if(s.flags.trackChecked){s.scene='towerRoad';save();showScene();return}
      s.flags.trackChecked=true;
      const good=['ranger','rogue'].includes(s.classId)||s.raceId==='woodElf'||s.raceId==='beastfolk';
      const ok=Math.random()<(good?0.85:0.5);
      if(ok){s.flags.track=true;log('你發現拖行痕跡與少量黑蠟通往鐘塔側牆。');toast('獲得線索：拖行痕跡');feedback('撥開積水後，你辨認出反覆拖運重物留下的溝痕；幾點黑蠟則黏在靠近側門的石縫裡。');}
      else{log('雨水沖掉了大部分痕跡。');feedback('你蹲下檢查了好一會兒，但連日大雨已經把能辨認的足跡沖得差不多了。');}
      s.scene='towerRoad';save();showScene();return;
    }

    if(['openCellar','pickCellar','dwarfCellar'].includes(a)){
      const msg=a==='openCellar'?'生鏽鑰匙轉了半圈才咬住鎖舌。幾次用力後，地窖門終於向內鬆開。':a==='pickCellar'?'老鎖結構簡單，但被人重新上過油。你避開磨損最重的簧片，很快撬開鎖舌。':'你沿著後砌石框找到承重弱點，卸下兩塊固定石後，整個鎖座直接鬆了下來。';
      feedback(msg);previousAct(a);return;
    }

    if(a==='forceCellar'){
      const strong=s.classId==='warrior'||s.raceId==='orc';
      const ok=Math.random()<(strong?0.8:0.42);
      if(ok){
        if(!s.quests.missing)ensureQuest();s.flags.cellarOpen=true;s.location='鐘塔地窖';s.quests.missing.stage=Math.max(3,s.quests.missing.stage||1);s.quests.missing.desc='深入鐘塔地窖，尋找失蹤者與眼形組織的線索。';log('你用蠻力撬開了地窖門。');feedback('門框先是發出刺耳摩擦聲，接著整片鎖座從鬆動石縫裡彈開。冷霧立刻從門後湧了出來。');s.scene='cellarCrossroads';
      }else{
        const hurt=Math.min(5,Math.max(0,s.hp-1));s.hp-=hurt;log(`鐵門紋絲不動，你在嘗試中損失 ${hurt} 生命。`);feedback(`你全力撬動門板，鎖座卻紋絲不動。反震讓你損失 ${hurt} 點生命。`);s.scene='cellarGate';
      }
      save();showScene();return;
    }

    if(a==='rescueSurvivor') feedback('你割斷束縛，把傷者扶出鐵籠。他喘了幾口氣後立刻告訴你：歐林被灰面具的人帶往右側冷焰走廊。');
    if(a==='searchCells') feedback(s.flags.cellsLoot?'你又翻了一遍破箱與草蓆，沒有找到新的東西。':'你在破箱夾層裡摸到一瓶仍封著蠟的治療藥水。');

    if(a==='acceptTideQuest'){
      s.quests.tide={name:'低潮時的哭聲',stage:1,desc:'前往老碼頭下方的退潮排水洞，尋找失蹤學徒。'};s.reputation.dockers+=1;log('接下支線：低潮時的哭聲。');feedback('娜莎立刻帶你到棧橋邊，指著退潮後露出的排水拱洞。「把孩子帶回來，其他事回來再說。」');s.scene='oldDocks';save();showScene();return;
    }

    if(a==='bargainTide'){
      s.quests.tide={name:'低潮時的哭聲',stage:1,desc:'前往老碼頭下方的退潮排水洞，尋找失蹤學徒。'};
      const ok=Math.random()<(s.raceId==='human'?0.7:0.48);
      if(ok){s.flags.tideBonus=true;log('娜莎答應事成後多付一些報酬。');feedback('娜莎皺著眉衡量了一下，最後點頭：「人平安回來，我再多補你 10 金幣。」');}
      else{log('娜莎沒有提高報酬。');feedback('娜莎直接搖頭：「碼頭最近沒多少現錢。先把孩子找回來，我只能照原本的報酬算。」');}
      s.scene='oldDocks';save();showScene();return;
    }

    if(a==='inspectDrain'){
      if(!s.flags.drainClue){s.flags.drainClue=true;s.xp+=10;log('你確認這裡不只是野獸巢穴，也有人定期搬運貨物。');change('經驗',10);levelCheck();feedback('你沿著刮痕找到燈油、繩纖維和反覆拖箱留下的溝槽。這不是偶然有人經過，而是一條固定搬運路線。');}
      s.scene='drainEntrance';save();showScene();return;
    }

    if(['returnDockLedger','giveGuardLedger','leaveLedger'].includes(a)){
      s.flags.tideOutcome=a;
      if(a==='returnDockLedger') feedback('你把學徒和帳冊一起交給娜莎。她先確認孩子平安，才翻開帳冊；看到其中幾個熟悉名字後，表情立刻沉了下來。');
      if(a==='giveGuardLedger') feedback('你先把學徒送回碼頭，再把帳冊交給城衛。米菈的人立刻封存證物，準備依照貨物流向盤查。');
      if(a==='leaveLedger') feedback('你把學徒帶回老碼頭，卻沒有提起帳冊。那本記錄貨物流向的證物仍留在你掌握之外，至少暫時沒有落進任何官方手裡。');
      previousAct(a);return;
    }

    previousAct(a);
  };

  showMenu=function(){
    openModal(`<h2>系統</h2><p>版本 <b>v0.3.2</b></p><p class="muted">敘事流程更新：情報相關選項會依玩家實際取得的線索逐步出現；主要調查、追問、搜索與支線結算增加即時文本回饋，並補上歐林與帳冊分支的劇情承接。</p><div class="choices"><button onclick="save();toast('已儲存')">立即儲存</button><button class="danger" onclick="resetGame()">刪除存檔並重新開始</button></div>`);
  };

  const style=document.createElement('style');
  style.textContent=`
    .story-feedback{margin:14px 0;padding:11px 12px;border-left:3px solid #bca06b;background:#171d27;border-radius:8px;color:#eadfc9;line-height:1.65;font-size:.95rem}
  `;
  document.head.appendChild(style);

  ensureFlags();
  if(s.created){save();showScene()}
})();
