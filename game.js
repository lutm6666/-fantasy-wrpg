const $=q=>document.querySelector(q), main=$('#main');
const ASSET={harbor:'assets/grayharbor.jpg',tavern:'assets/scene-placeholder.svg',tower:'assets/scene-placeholder.svg',cellar:'assets/scene-placeholder.svg',undead:'assets/portrait-placeholder.svg',items:'assets/item-placeholder.svg'};
const races={
 human:{name:'人類',desc:'遍布西境的諸王國居民，文化多樣、適應力強。',hp:0,pow:0,def:0,trait:'適應者：沒有明顯弱項，能選擇最多基礎職業。',allow:['warrior','paladin','ranger','rogue','mage','cleric']},
 highElf:{name:'高等精靈',desc:'古老奧術城邦的後裔，重視學識與血統。',hp:-5,pow:2,def:0,trait:'奧術感知：部分魔法事件有額外解法。',allow:['warrior','paladin','rogue','mage','cleric','spellblade']},
 woodElf:{name:'森林精靈',desc:'生活於古林與邊境的氏族，擅長追蹤與伏擊。',hp:0,pow:1,def:1,trait:'林地步伐：追蹤與自然相關判定更有利。',allow:['warrior','ranger','rogue','mage','cleric']},
 dwarf:{name:'矮人',desc:'山城與地下堡壘的建造者，以鍛造、石工和氏族傳統聞名。',hp:10,pow:0,def:2,trait:'石之記憶：能辨識古代建築、符文與機關。',allow:['warrior','paladin','ranger','rogue','cleric','runeguard']},
 orc:{name:'獸人',desc:'來自東部高地的部族民族，重視誓言、祖靈與武勇。',hp:12,pow:2,def:0,trait:'鐵血：生命較高，威嚇與體魄相關選項更突出。',allow:['warrior','ranger','rogue','cleric','spiritcaller']},
 beastfolk:{name:'獸裔',desc:'擁有獸類特徵的多支族群，感官敏銳但常受城市居民戒備。',hp:0,pow:1,def:0,trait:'敏銳感官：更容易察覺伏擊、氣味與細微聲響。',allow:['warrior','ranger','rogue','mage','cleric']},
 undead:{name:'不死族',desc:'仍保有意志與記憶的復生者，被活人稱為「灰裔」。',hp:5,pow:1,def:1,trait:'亡者之軀：不易受恐懼與疾病影響，能感知死亡魔力；部分 NPC 對你戒備。',allow:['warrior','ranger','rogue','mage','cleric','gravebound']}
};
const classes={
 warrior:{name:'戰士',desc:'重甲近戰，以怒氣與防守反擊壓制敵人。',hp:130,pow:15,def:10,skill:'盾擊',skillText:'高傷害並強化本回合防守。',weapon:'舊軍刀'},
 paladin:{name:'聖騎士',desc:'以誓言與聖火作戰的重甲守護者。',hp:120,pow:13,def:11,skill:'聖光裁決',skillText:'造成傷害並治療自己。',weapon:'朝聖者戰槌'},
 ranger:{name:'遊俠',desc:'遠程獵手，擅長追蹤、伏擊與野外探索。',hp:105,pow:16,def:7,skill:'穿心箭',skillText:'有較高機率造成暴擊。',weapon:'榆木長弓'},
 rogue:{name:'盜賊',desc:'敏捷的機會主義者，能撬鎖、偷襲並利用地下人脈。',hp:100,pow:17,def:6,skill:'背刺',skillText:'敵人生命越低，傷害越高。',weapon:'缺口短劍'},
 mage:{name:'法師',desc:'奧術施法者，脆弱但具強大爆發能力。',hp:90,pow:20,def:4,skill:'霜火爆裂',skillText:'極高傷害，偶爾會失控反噬。',weapon:'學徒法杖'},
 cleric:{name:'牧師',desc:'研究信仰、秘儀與驅邪術的施法者。',hp:110,pow:12,def:8,skill:'祈禱之槌',skillText:'穩定傷害並獲得護佑。',weapon:'銀紋權杖'},
 spellblade:{name:'魔劍士',special:'高等精靈專屬',desc:'將奧術編入劍技的古老軍學傳承。',hp:105,pow:18,def:7,skill:'奧刃共鳴',skillText:'造成強力傷害並短暫削弱敵人。',weapon:'符文細劍'},
 runeguard:{name:'符文守衛',special:'矮人專屬',desc:'以刻印符文強化盾甲與武器的氏族守衛。',hp:138,pow:13,def:13,skill:'岩印猛擊',skillText:'造成傷害並大幅提高本回合防守。',weapon:'刻印戰斧'},
 spiritcaller:{name:'祖靈使',special:'獸人專屬',desc:'與祖先和元素靈溝通的部族施法者。',hp:118,pow:15,def:8,skill:'祖靈震擊',skillText:'造成傷害並有機率回復生命。',weapon:'祖靈骨杖'},
 gravebound:{name:'墓誓者',special:'不死族專屬',desc:'以死亡之力維持意志，介於戰士與死靈術士之間。',hp:125,pow:17,def:9,skill:'墓寒斬',skillText:'造成寒冷的死亡傷害，對受傷敵人更強。',weapon:'黑鐵墓刃'}
};
const baseState={version:2,created:false,name:'',raceId:'',classId:'',level:1,xp:0,gold:35,hp:100,location:'灰港',scene:'arrival',flags:{},quests:{},inventory:[{id:'bread',name:'乾硬麵包',type:'consumable',qty:2,desc:'回復 18 生命。'},{id:'potion',name:'初級治療藥水',type:'consumable',qty:1,desc:'回復 35 生命。'}],equipment:{weapon:null,armor:null,trinket:null},combat:null,log:[]};
let draftRace='human';
function clone(x){return JSON.parse(JSON.stringify(x))}
function migrate(raw){if(!raw)return clone(baseState);const n=Object.assign(clone(baseState),raw);n.version=2;n.flags=Object.assign({},raw.flags||{});n.quests=Object.assign({},raw.quests||{});n.inventory=Array.isArray(raw.inventory)?raw.inventory:clone(baseState.inventory);n.equipment=Object.assign({weapon:null,armor:null,trinket:null},raw.equipment||{});n.log=Array.isArray(raw.log)?raw.log:[];if(!n.raceId)n.raceId='human';if(n.quests.missing&&n.quests.missing.stage>=2)n.flags.ratsDefeated=true;if(!races[n.raceId])n.raceId='human';if(!classes[n.classId]&&n.created)n.classId='warrior';if(raw.version!==2&&n.combat)n.combat=null;return n}
function load(){try{return migrate(JSON.parse(localStorage.getItem('ashen-realms-save')))}catch(e){return clone(baseState)}}
let s=load();
function save(){localStorage.setItem('ashen-realms-save',JSON.stringify(s));renderHud()}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(window.__tt);window.__tt=setTimeout(()=>e.classList.remove('show'),1700)}
function log(t){s.log.unshift(t);s.log=s.log.slice(0,50)}
function change(label,n){if(n)toast(`${label} ${n>0?'+':''}${n}`)}
function race(){return races[s.raceId]||races.human}
function cls(){return classes[s.classId]||classes.warrior}
function equipped(){return Object.values(s.equipment||{}).map(id=>s.inventory.find(x=>x.id===id)).filter(Boolean)}
function maxHp(){return Math.max(1,cls().hp+race().hp+(s.level-1)*10+equipped().reduce((a,x)=>a+(x.hp||0),0))}
function pow(){return cls().pow+race().pow+(s.level-1)*2+equipped().reduce((a,x)=>a+(x.pow||0),0)}
function def(){return cls().def+race().def+(s.level-1)+equipped().reduce((a,x)=>a+(x.def||0),0)}
function normalizeHp(){s.hp=Math.min(Math.max(0,Number(s.hp)||0),maxHp())}
function renderHud(){if(!s.created)return;normalizeHp();$('#hud').classList.remove('hidden');$('#nav').classList.remove('hidden');let hpPct=Math.round(s.hp/maxHp()*100),xpPct=Math.min(100,Math.round((s.xp%Math.max(100,s.level*100))/Math.max(100,s.level*100)*100));$('#hud').innerHTML=`<div class="spread"><div><b>${s.name}</b> <span class="pill">Lv.${s.level} ${race().name} · ${cls().name}</span><div class="muted">${s.location}</div></div><div class="legend">◆ ${s.gold}</div></div><div style="margin-top:10px"><div class="spread stat"><span>生命 ${s.hp}/${maxHp()}</span><span>攻擊 ${pow()} · 防禦 ${def()}</span></div><div class="bar"><div class="fill hp" style="width:${hpPct}%"></div></div><div class="bar" style="margin-top:5px"><div class="fill xp" style="width:${xpPct}%"></div></div></div>`}
function sceneImage(key){return key?`<img class="scene-img" src="${ASSET[key]}" alt="場景插圖" loading="eager" onerror="this.style.display='none'">`:''}
function boot(){if(!s.created)showCreate();else{normalizeHp();renderHud();showScene()}}
function showCreate(){const name=$('#nameInput')?.value||'';main.innerHTML=`<section class="card"><h2>建立你的冒險者</h2><p class="muted">西境曆 742 年。灰港的鐘聲已經七夜沒有停過，而你正乘著一艘漏水商船抵達這座邊境港城。</p><label>角色名稱</label><input id="nameInput" maxlength="16" placeholder="輸入名稱" value="${escapeHtml(name)}"><h3>選擇種族</h3><div class="grid">${Object.entries(races).map(([id,r])=>`<button class="select-card ${draftRace===id?'selected':''}" onclick="pickRace('${id}')"><b>${r.name}</b><span>${r.desc}</span><div class="race-note">${r.trait}</div></button>`).join('')}</div><div class="divider"></div><h3>選擇職業</h3><p class="muted">部分職業受到種族文化、宗教或生理限制。被鎖定的職業仍會顯示原因。</p><div class="grid">${Object.entries(classes).map(([id,c])=>{const ok=races[draftRace].allow.includes(id);return `<button class="select-card" ${ok?`onclick="chooseClass('${id}')"`:'disabled'}><b>${c.name}</b><span>${c.desc}</span><div class="stat" style="margin-top:7px">生命 ${c.hp+races[draftRace].hp} · 攻擊 ${c.pow+races[draftRace].pow} · 防禦 ${c.def+races[draftRace].def}</div>${c.special?`<div class="tag" style="margin-top:7px">${c.special}</div>`:''}${ok?'':`<div class="lock">無法選擇：${lockReason(draftRace,id)}</div>`}</button>`}).join('')}</div></section>`}
function pickRace(id){const name=$('#nameInput')?.value||'';draftRace=id;showCreate();$('#nameInput').value=name}
function lockReason(rid,cid){if(cid==='gravebound')return '只有不死族能承受墓誓。';if(cid==='runeguard')return '符文守衛只傳授給矮人氏族。';if(cid==='spiritcaller')return '祖靈使必須接受獸人部族的祖靈儀式。';if(cid==='spellblade')return '魔劍術由高等精靈城邦嚴格守秘。';if(cid==='paladin'&&rid==='undead')return '聖火拒絕已死之軀。';return '此種族沒有這項職業傳統。'}
function chooseClass(id){if(!races[draftRace].allow.includes(id))return;let name=$('#nameInput').value.trim()||'無名旅人';s=clone(baseState);s.created=true;s.name=name;s.raceId=draftRace;s.classId=id;s.hp=maxHp();s.inventory.push({id:'starter',name:classes[id].weapon,type:'weapon',pow:3,desc:'陪你踏入灰港的第一件武器。'});s.equipment.weapon='starter';log(`${name}，一名${races[draftRace].name}${classes[id].name}，抵達灰港。`);save();showScene();toast(`角色建立：${races[draftRace].name} ${classes[id].name}`)}
const scenes={
 arrival(){let extra=s.raceId==='undead'?'你把兜帽拉低；巡查的城衛在你身上停留了更久。':'';return{title:'灰港',img:'harbor',text:`鹽霧裡混著煤煙。碼頭工人拖著箱子穿過濕滑木棧道，遠處的舊鐘塔在陰天裡像一根焦黑的手指。${extra}`,choices:[['前往斷錨酒館','tavern'],['查看城衛告示','notice'],['直接前往舊鐘塔','towerRoad']]}}
};
/* Remaining game content unchanged below. */