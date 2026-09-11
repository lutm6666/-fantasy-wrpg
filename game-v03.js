// Ashen Realms v0.3 — Grayharbor hub expansion.
(function(){
  baseState.version=3;
  baseState.reputation={guard:0,dockers:0,underworld:0};
  function ensureV3(){
    s.version=3;
    s.flags=s.flags||{};
    s.quests=s.quests||{};
    s.reputation=Object.assign({guard:0,dockers:0,underworld:0},s.reputation||{});
    if(s.combat && !['rats','acolyte','warden','brineHound'].includes(s.combat.id)) s.combat=null;
    save();
  }

  renderHud=function(){
    if(!s.created)return;
    normalizeHp();
    $('#hud').classList.remove('hidden');$('#nav').classList.remove('hidden');
    const hpPct=Math.round(s.hp/maxHp()*100), levelBase=(s.level-1)*100;
    const xpPct=Math.min(100,Math.max(0,Math.round((s.xp-levelBase))));
    $('#hud').innerHTML=`<div class="spread"><div><b>${s.name}</b> <span class="pill">Lv.${s.level} ${race().name} · ${cls().name}</span><div class="muted">${s.location}</div></div><div class="legend">◆ ${s.gold}</div></div><div style="margin-top:10px"><div class="spread stat"><span>生命 ${s.hp}/${maxHp()}</span><span>攻擊 ${pow()} · 防禦 ${def()}</span></div><div class="bar"><div class="fill hp" style="width:${hpPct}%"></div></div><div class="bar" style="margin-top:5px"><div class="fill xp" style="width:${xpPct}%"></div></div></div>`;
  };

  const arrivalV02=scenes.arrival;
  scenes.arrival=function(){
    const o=arrivalV02();
    if(!o.choices.some(x=>x[1]==='market')) o.choices.splice(o.choices.length-1,0,['前往灰港市集與工匠區','market']);
    return o;
  };

  scenes.market=function(){
    const after=s.flags.reported?'鐘塔事件後，市集裡已經有人認得你；城衛看到你時也不再反覆盤問。':'';
    return{title:'灰港市集與工匠區',img:'harbor',text:`魚販的叫賣聲、鐵鎚聲與海風混在一起。黑爐鐵匠鋪靠近城牆，藥師則在拱廊下擺出瓶罐。往下走就是老碼頭。${after}`,choices:[['進入黑爐鐵匠鋪','forge'],['拜訪潮汐藥師','apothecary'],['前往老碼頭','oldDocks'],['返回港口','arrival']]};
  };
  scenes.forge=()=>({title:'黑爐鐵匠鋪',img:'harbor',text:'矮人鐵匠布蘭把燒紅的鐵件浸入水槽，抬眼打量你的裝備。「灰港外頭不太平。要活著回來，就別只相信運氣。」',choices:[['查看可購買裝備','forgeShop'],['返回市集','market']]});
  scenes.apothecary=()=>({title:'潮汐藥師',img:'harbor',text:'藥師瑟芮把一束乾燥海草掛到屋簷下。架上擺著簡單的治療藥水與旅行糧食，價格都寫得很清楚。',choices:[['查看藥品與補給','apothecaryShop'],['返回市集','market']]});
  scenes.oldDocks=function(){
    const q=s.quests.tide;
    if(!q)return{title:'老碼頭',img:'harbor',text:'退潮後，老碼頭下方露出一排很久沒人使用的排水拱洞。搬運工娜莎說，最近夜裡總有人聽見裡面傳來拖箱子的聲音，而一名學徒昨晚去查看後就沒回來。',choices:[['我去看看。','acceptTideQuest'],['先問清楚報酬','bargainTide'],['暫時離開','market']]};
    if(q.stage>=4)return{title:'老碼頭',img:'harbor',text:'排水洞事件已經告一段落。搬運工們重新使用這段碼頭，看到你時會點頭致意。',choices:[['返回市集','market']]};
    return{title:'老碼頭',img:'harbor',text:'老碼頭的工人已經在等你的消息。退潮排水洞入口就在木棧橋下方。',choices:[['前往退潮排水洞','drainEntrance'],['返回市集','market']]};
  };
  scenes.drainEntrance=function(){
    const note=s.raceId==='beastfolk'?'你聞到潮濕石壁後混著油脂與舊木箱的氣味，裡面顯然有人活動。':s.classId==='rogue'?'入口邊緣的繩結是走私客常用的快速固定法。':'';
    return{title:'退潮排水洞',img:'harbor',text:`海水已退到腳踝以下。拱洞深處有微弱燈火，泥地上拖著箱籠留下的長痕。${note}`,choices:[['循著拖痕深入','enterDrain'],['檢查入口附近的標記','inspectDrain'],['返回老碼頭','oldDocks']]};
  };
  scenes.drainCache=function(){
    const text=s.flags.drainEnemyDefeated?'洞內的威脅已經退去。你在木箱後找到失蹤的學徒，他只是被困住，沒有大礙；旁邊還有一本記錄貨物流向的帳冊。':'洞內仍不安全。';
    const choices=s.flags.drainEnemyDefeated?[['把學徒與帳冊都帶回碼頭','returnDockLedger'],['把帳冊交給城衛','giveGuardLedger'],['只帶學徒回去，留下帳冊','leaveLedger']]:[['退回入口','drainEntrance']];
    return{title:'走私藏貨間',img:'harbor',text,choices};
  };

  function vendorStock(type){
    if(type==='apothecary')return[
      {id:'shopPotion',name:'灰港治療藥水',price:12,type:'consumable',qty:1,desc:'回復 35 生命。'},
      {id:'shopBread',name:'香料硬麵包',price:4,type:'consumable',qty:1,desc:'回復 18 生命。'}
    ];
    return[
      {id:'reinforcedCoat',name:'加固旅行外套',price:28,type:'armor',def:2,desc:'適合旅人的輕型防具，防禦 +2。'},
      {id:'harborWeapon',name:`黑爐精製${cls().weapon}`,price:38,type:'weapon',pow:5,desc:'鐵匠依照你的戰鬥方式重新打造，攻擊 +5。'}
    ];
  }
  window.showVendor=function(type){
    const title=type==='forge'?'黑爐鐵匠鋪':'潮汐藥師',stock=vendorStock(type);
    openModal(`<h2>${title}</h2><p class="muted">持有金幣：◆ ${s.gold}</p>${stock.map(it=>{const owned=it.type!=='consumable'&&s.inventory.some(x=>x.id===it.id);return `<div class="item"><div class="spread"><b>${it.name}</b><span class="legend">◆ ${it.price}</span></div><div class="muted">${it.desc}</div><button style="margin-top:8px" ${owned?'disabled':''} onclick="buyVendor('${type}','${it.id}')">${owned?'已購買':'購買'}</button></div>`}).join('')}`);
  };
  window.buyVendor=function(type,id){
    const it=vendorStock(type).find(x=>x.id===id);if(!it)return;
    if(s.gold<it.price){toast('金幣不足');return}
    if(it.type!=='consumable'&&s.inventory.some(x=>x.id===it.id)){toast('已經擁有');return}
    s.gold-=it.price;
    if(it.type==='consumable'){
      const target=s.inventory.find(x=>x.id===it.id);if(target)target.qty++;else s.inventory.push({...it,qty:1});
    }else s.inventory.push({...it});
    log(`購買：${it.name}。`);save();toast(`獲得：${it.name}`);showVendor(type);
  };
  window.useItem=function(i){
    const it=s.inventory[i];if(!it||it.type!=='consumable'||!(it.qty>0))return;
    const amount=String(it.id).toLowerCase().includes('bread')?18:35,heal=Math.min(amount,maxHp()-s.hp);
    if(heal<=0){toast('生命已滿');return}
    it.qty--;s.hp+=heal;log(`使用 ${it.name}，回復 ${heal} 生命。`);save();toast(`生命 +${heal}`);showInventory();
  };

  showInventory=function(){openModal(`<h2>背包</h2><img class="concept" src="${ASSET.items}" alt="道具概念圖" onerror="this.style.display='none'"><p class="muted">裝備與任務物品可能改變數值或開啟特殊選項。</p>${s.inventory.map((it,i)=>`<div class="item"><div class="spread"><b>${it.name}${it.qty?` ×${it.qty}`:''}</b><span class="tag">${it.type}</span></div><div class="muted">${it.desc||''}</div>${['weapon','armor','trinket'].includes(it.type)?`<button style="margin-top:8px" onclick="equip(${i})">裝備</button>`:''}${it.type==='consumable'&&it.qty>0?`<button style="margin-top:8px;margin-left:6px" onclick="useItem(${i})">使用</button>`:''}</div>`).join('')}`)};
  showCharacter=function(){const portrait=s.raceId==='undead'?`<img class="portrait" src="${ASSET.undead}" alt="不死族角色概念圖" onerror="this.style.display='none'">`:'';openModal(`<h2>${s.name}</h2><p class="muted">Lv.${s.level} ${race().name} · ${cls().name}</p>${portrait}<div class="notice">${race().trait}</div><div class="grid" style="margin-top:12px"><div class="item"><div class="muted">生命</div><div class="kpi">${s.hp}/${maxHp()}</div></div><div class="item"><div class="muted">攻擊</div><div class="kpi">${pow()}</div></div><div class="item"><div class="muted">防禦</div><div class="kpi">${def()}</div></div><div class="item"><div class="muted">經驗</div><div class="kpi">${s.xp}</div></div></div><div class="divider"></div><h3>聲望</h3><div class="grid"><div class="item"><span class="muted">城衛</span><br><b>${s.reputation.guard}</b></div><div class="item"><span class="muted">碼頭工</span><br><b>${s.reputation.dockers}</b></div><div class="item"><span class="muted">地下人脈</span><br><b>${s.reputation.underworld}</b></div></div><div class="divider"></div><h3>職業能力</h3><p><b>${cls().skill}</b><br><span class="muted">${cls().skillText}</span></p><h3>裝備</h3>${['weapon','armor','trinket'].map(slot=>{const it=s.inventory.find(x=>x.id===s.equipment[slot]);return `<div class="item"><span class="muted">${{weapon:'武器',armor:'護甲',trinket:'飾品'}[slot]}</span><br>${it?it.name:'— 空 —'}</div>`}).join('')}`)};
  showMenu=function(){openModal(`<h2>系統</h2><p>版本 <b>v0.3</b></p><p class="muted">灰港樞紐更新：新增鐵匠與藥師商店、聲望、支線「低潮時的哭聲」、新敵人與三種帳冊處理結果；並修正經驗條與消耗品使用。</p><div class="choices"><button onclick="save();toast('已儲存')">立即儲存</button><button class="danger" onclick="resetGame()">刪除存檔並重新開始</button></div>`)};

  const actV02=act;
  act=function(a){
    if(['market','forge','apothecary','oldDocks','drainEntrance','drainCache'].includes(a)){s.scene=a;save();showScene();return}
    if(a==='forgeShop'){showVendor('forge');return}
    if(a==='apothecaryShop'){showVendor('apothecary');return}
    if(a==='acceptTideQuest'||a==='bargainTide'){
      s.quests.tide={name:'低潮時的哭聲',stage:1,desc:'前往老碼頭下方的退潮排水洞，尋找失蹤學徒。'};
      if(a==='acceptTideQuest'){s.reputation.dockers+=1;log('接下支線：低潮時的哭聲。')}
      else if(Math.random()<(s.raceId==='human'?.7:.48)){s.flags.tideBonus=true;log('娜莎答應事成後多付一些報酬。')}else log('娜莎沒有提高報酬。');
      s.scene='drainEntrance';save();showScene();return;
    }
    if(a==='inspectDrain'){
      if(!s.flags.drainClue){s.flags.drainClue=true;s.xp+=10;log('你確認這裡不只是野獸巢穴，也有人定期搬運貨物。');change('經驗',10);levelCheck()}
      s.scene='drainEntrance';save();showScene();return;
    }
    if(a==='enterDrain'){
      if(s.flags.drainEnemyDefeated){s.scene='drainCache';save();showScene();return}
      startCombat({id:'brineHound',name:'鹽蝕穴獸',hp:72,maxHp:72,pow:13,def:4,xp:45,gold:6,onWin:'brineHound'});return;
    }
    if(['returnDockLedger','giveGuardLedger','leaveLedger'].includes(a)){
      if(!s.flags.tideDone){
        s.flags.tideDone=true;s.quests.tide.stage=4;
        let gold=20+(s.flags.tideBonus?10:0),xp=35;
        if(a==='returnDockLedger'){s.reputation.dockers+=2;log('你把學徒與帳冊一起交還碼頭工人。')}
        if(a==='giveGuardLedger'){gold+=10;xp+=10;s.reputation.guard+=2;s.reputation.underworld-=1;log('你把帳冊交給城衛，走私線索因此曝光。')}
        if(a==='leaveLedger'){gold+=20;s.reputation.underworld+=1;log('你救回學徒，但沒有把帳冊交給任何人。')}
        s.gold+=gold;s.xp+=xp;change('金幣',gold);levelCheck();s.quests.tide.desc='你救回了失蹤學徒，並決定如何處理走私帳冊。';
      }
      s.scene='oldDocks';save();showScene();return;
    }
    const beforeReported=s.flags.reported;
    actV02(a);
    if(a==='reportQuest'&&!beforeReported&&s.flags.reported){s.reputation.guard+=2;save()}
  };

  const combatTurnV02=combatTurn;
  combatTurn=function(type){
    if(s.combat?.id==='brineHound'&&type==='flee'){
      if(Math.random()<.45){log('你成功退回排水洞入口。');s.combat=null;s.scene='drainEntrance';save();showScene();return}
      log('狹窄水道讓你無法脫身。');
      const taken=dmg(s.combat.pow,def());s.hp=Math.max(0,s.hp-taken);log(`${s.combat.name} 對你造成 ${taken} 傷害。`);
      if(s.hp<=0){s.hp=Math.ceil(maxHp()*.55);s.gold=Math.max(0,s.gold-8);s.combat=null;s.scene='arrival';s.location='灰港';log('你在城衛哨站醒來，失去了一些金幣。');toast('你被擊倒了');save();showScene();return}
      save();renderCombat();return;
    }
    combatTurnV02(type);
  };
  const winCombatV02=winCombat;
  winCombat=function(){
    if(s.combat?.onWin!=='brineHound'){winCombatV02();return}
    const e=s.combat;s.xp+=e.xp;s.gold+=e.gold;log(`擊敗 ${e.name}。獲得 ${e.xp} 經驗與 ${e.gold} 金幣。`);s.combat=null;s.flags.drainEnemyDefeated=true;
    if(s.quests.tide){s.quests.tide.stage=2;s.quests.tide.desc='你清除了排水洞裡的威脅，深入尋找失蹤學徒與貨物來源。'}
    s.scene='drainCache';log('排水洞安靜下來，你聽見木箱後傳來求救聲。');levelCheck();save();showScene();
  };

  ensureV3();
  if(s.created)showScene();
})();
