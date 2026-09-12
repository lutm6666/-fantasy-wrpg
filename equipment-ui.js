// Ashen Realms v0.3.3 — dedicated equipment interface.
(function(){
  const SLOT_LABEL={weapon:'武器',armor:'護甲',trinket:'飾品'};
  const SLOT_ICON={weapon:'⚔',armor:'🛡',trinket:'◆'};

  function itemById(id){return id?s.inventory.find(x=>x.id===id):null}
  function statLine(it){
    if(!it)return '尚未裝備';
    const bits=[];
    if(it.hp)bits.push(`生命 ${it.hp>0?'+':''}${it.hp}`);
    if(it.pow)bits.push(`攻擊 ${it.pow>0?'+':''}${it.pow}`);
    if(it.def)bits.push(`防禦 ${it.def>0?'+':''}${it.def}`);
    return bits.length?bits.join(' · '):'無直接戰鬥屬性';
  }
  function delta(n){return n===0?'—':`${n>0?'+':''}${n}`}
  function candidateDelta(it,slot){
    const cur=itemById(s.equipment?.[slot]);
    return {
      hp:(it.hp||0)-(cur?.hp||0),
      pow:(it.pow||0)-(cur?.pow||0),
      def:(it.def||0)-(cur?.def||0)
    };
  }
  function deltaClass(n){return n>0?'equip-up':n<0?'equip-down':'equip-same'}

  window.showEquipment=function(){
    const totalHp=maxHp(),totalPow=pow(),totalDef=def();
    const slots=['weapon','armor','trinket'];
    const equippedCards=slots.map(slot=>{
      const it=itemById(s.equipment?.[slot]);
      return `<div class="equip-slot ${it?'filled':'empty'}">
        <div class="equip-slot-head"><span class="equip-icon">${SLOT_ICON[slot]}</span><div><div class="equip-slot-label">${SLOT_LABEL[slot]}</div><b>${it?escapeHtml(it.name):'— 空 —'}</b></div></div>
        <div class="equip-stats">${it?statLine(it):'可從下方背包裝備中選擇'}</div>
        ${it?.desc?`<div class="muted equip-desc">${escapeHtml(it.desc)}</div>`:''}
        ${it?`<button class="equip-remove" onclick="unequipSlot('${slot}')">卸下</button>`:''}
      </div>`;
    }).join('');

    const candidates=slots.map(slot=>{
      const list=s.inventory.map((it,i)=>({it,i})).filter(x=>x.it.type===slot);
      return `<section class="equip-group"><h3>${SLOT_ICON[slot]} ${SLOT_LABEL[slot]}替換</h3>${list.length?list.map(({it,i})=>{
        const active=s.equipment?.[slot]===it.id;
        const d=candidateDelta(it,slot);
        return `<div class="equip-candidate ${active?'active':''}">
          <div class="spread"><div><b>${escapeHtml(it.name)}</b>${active?'<span class="tag equip-active-tag">裝備中</span>':''}</div><span class="tag">${SLOT_LABEL[slot]}</span></div>
          <div class="equip-stats">${statLine(it)}</div>
          ${it.desc?`<div class="muted equip-desc">${escapeHtml(it.desc)}</div>`:''}
          ${active?'':`<div class="equip-compare"><span class="${deltaClass(d.hp)}">生命 ${delta(d.hp)}</span><span class="${deltaClass(d.pow)}">攻擊 ${delta(d.pow)}</span><span class="${deltaClass(d.def)}">防禦 ${delta(d.def)}</span></div><button class="primary equip-button" onclick="equipFromPanel(${i})">裝備</button>`}
        </div>`;
      }).join(''):'<div class="item muted">背包中沒有這個槽位的其他裝備。</div>'}</section>`;
    }).join('');

    openModal(`<div class="equipment-panel">
      <div class="spread equipment-title"><div><h2>裝備</h2><div class="muted">${escapeHtml(s.name)} · Lv.${s.level} ${race().name} ${cls().name}</div></div><button class="equipment-bag-link" onclick="showInventory()">背包</button></div>
      <div class="equipment-summary"><div><span>生命</span><b>${s.hp}/${totalHp}</b></div><div><span>攻擊</span><b>${totalPow}</b></div><div><span>防禦</span><b>${totalDef}</b></div></div>
      <div class="equip-slots">${equippedCards}</div>
      <div class="divider"></div>
      <div class="muted equipment-help">下方只列出可裝備物品。屬性差值是與目前同槽位裝備比較後的變化。</div>
      ${candidates}
    </div>`);
  };

  window.equipFromPanel=function(i){
    const it=s.inventory[i];
    if(!it||!['weapon','armor','trinket'].includes(it.type))return;
    const old=itemById(s.equipment?.[it.type]);
    s.equipment[it.type]=it.id;
    normalizeHp();
    log(`裝備 ${it.name}${old?`，替換 ${old.name}`:''}。`);
    save();
    toast(`已裝備：${it.name}`);
    showEquipment();
  };

  window.unequipSlot=function(slot){
    if(!['weapon','armor','trinket'].includes(slot))return;
    const old=itemById(s.equipment?.[slot]);
    if(!old)return;
    s.equipment[slot]=null;
    normalizeHp();
    log(`卸下 ${old.name}。`);
    save();
    toast(`已卸下：${old.name}`);
    showEquipment();
  };

  // Keep legacy inventory equip buttons compatible, but land in the equipment view.
  window.equip=function(i){equipFromPanel(i)};

  const previousInventory=showInventory;
  window.showInventory=function(){
    previousInventory();
    const sheet=document.querySelector('#sheet');
    const heading=sheet?.querySelector('h2');
    if(heading && !sheet.querySelector('.inventory-equipment-link')){
      const btn=document.createElement('button');
      btn.className='inventory-equipment-link primary';
      btn.textContent='查看目前裝備';
      btn.onclick=showEquipment;
      heading.insertAdjacentElement('afterend',btn);
    }
    if(sheet){
      const equippedIds=new Set(Object.values(s.equipment||{}).filter(Boolean));
      const itemNodes=[...sheet.querySelectorAll('.item')];
      itemNodes.forEach((node,idx)=>{
        const inv=s.inventory[idx];
        if(inv && equippedIds.has(inv.id)){
          const badge=document.createElement('span');
          badge.className='tag equip-inventory-badge';
          badge.textContent='裝備中';
          node.querySelector('.spread')?.appendChild(badge);
        }
      });
    }
  };

  const style=document.createElement('style');
  style.textContent=`
    .bottom-inner{grid-template-columns:repeat(6,minmax(0,1fr))}.bottom button{font-size:11px;padding-left:2px;padding-right:2px;min-height:44px;line-height:1.15}.equipment-title{align-items:flex-start;gap:12px}.equipment-title h2{margin-bottom:2px}.equipment-bag-link{padding:8px 12px;white-space:nowrap}.equipment-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0}.equipment-summary>div{background:#10151e;border:1px solid #364056;border-radius:12px;padding:10px;text-align:center}.equipment-summary span{display:block;color:#9ea9ba;font-size:12px}.equipment-summary b{font-size:19px;color:#f3d59c}.equip-slots{display:grid;grid-template-columns:1fr;gap:9px}.equip-slot{border:1px solid #3d485e;border-radius:14px;padding:12px;background:#141a24}.equip-slot.empty{border-style:dashed;opacity:.82}.equip-slot-head{display:flex;gap:10px;align-items:center}.equip-icon{width:38px;height:38px;border-radius:10px;background:#222b3a;border:1px solid #46536d;display:grid;place-items:center;font-size:20px}.equip-slot-label{font-size:11px;color:#9ea9ba;text-transform:uppercase}.equip-stats{font-size:13px;color:#e4c98f;margin-top:8px}.equip-desc{font-size:12px;margin-top:4px}.equip-remove{margin-top:9px;padding:7px 10px;font-size:12px}.equip-group{margin-top:18px}.equip-group h3{font-size:17px}.equip-candidate{border:1px solid #343d51;border-radius:12px;background:#151a23;padding:11px;margin-top:8px}.equip-candidate.active{border-color:#8b7043;background:#1d1b18}.equip-active-tag{margin-left:7px;color:#e9cb91}.equip-compare{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:9px;font-size:12px}.equip-compare span{padding:5px 6px;border-radius:8px;text-align:center;background:#10151d}.equip-up{color:#82d69e}.equip-down{color:#e58b8b}.equip-same{color:#9ea9ba}.equip-button{width:100%;margin-top:9px}.equipment-help{font-size:12px}.inventory-equipment-link{width:100%;margin:5px 0 10px}.equip-inventory-badge{margin-left:auto;color:#e9cb91}
    @media(min-width:580px){.equip-slots{grid-template-columns:repeat(3,1fr)}}
    @media(max-width:390px){.equipment-summary b{font-size:17px}.equip-compare{font-size:11px}.bottom button{font-size:10.5px}}
  `;
  document.head.appendChild(style);
})();