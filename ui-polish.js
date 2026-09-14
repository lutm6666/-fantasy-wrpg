// Ashen Realms v0.3.4 — interface close controls and race-specific class lock lore.
(function(){
  const lockLore={
    human:{
      spellblade:'高等精靈將奧刃誓式視為城邦軍秘；人類學徒甚至看不到完整劍譜。',
      runeguard:'符文守衛的鎧印與氏族血誓相連，矮人不向外族傳授核心刻印。',
      spiritcaller:'祖靈使必須由獸人祖祠承認血脈與部族名；外族無法完成喚祖儀式。',
      gravebound:'墓誓要求死者之軀承受亡寒；活人的心跳會讓誓印崩解。'
    },
    highElf:{
      ranger:'高等精靈軍制依賴城邦斥候與奧術結界；「荒野遊俠」被視為森林精靈的古老誓職，學院不授此階。',
      runeguard:'矮人的爐印必須由氏族長老親授；高等精靈的奧術血脈反而會干擾石符共鳴。',
      spiritcaller:'獸人祖祠只回應被部族接納的名字；精靈的長生血脈無法代替祖靈誓約。',
      gravebound:'墓誓會切斷精靈靈魂與星界回響；高等精靈把這視為比死亡更嚴重的放逐。'
    },
    woodElf:{
      paladin:'森林精靈不向聖火教會宣讀騎士誓詞；古林誓約禁止讓單一神殿凌駕季節與諸靈。',
      spellblade:'奧刃劍譜被高等精靈城邦封存；森林氏族只保留與自然共鳴的舊式劍術。',
      runeguard:'矮人的氏族符文需要爐火、祖石與血誓共同認印，森林精靈無法取得這三重傳承。',
      spiritcaller:'森林精靈能與自然之靈交流，但獸人「祖靈使」的力量來自部族祖祠，兩者不是同一套傳承。',
      gravebound:'古林認為亡者應回歸土壤與根系；主動立下墓誓被視為拒絕自然循環。'
    },
    dwarf:{
      mage:'矮人禁忌讓未束縛的奧術直接穿過血肉；魔力必須先被刻進石、金屬或符文。',
      spellblade:'高等精靈的奧刃術要求以裸露奧術灌注劍身，正好違反矮人「魔力必須受器物約束」的戒律。',
      spiritcaller:'矮人尊崇祖先，但他們把祖靈封存在氏族石與墓銘中，不採用獸人的附靈與圖騰儀式。',
      gravebound:'矮人相信姓名應刻入祖石後安眠；讓屍身重新起誓會被視為奪走死者在氏族中的位置。'
    },
    orc:{
      paladin:'獸人的誓言屬於氏族、戰團與祖靈；聖火教會要求的神殿臣服與他們的誓約觀念彼此衝突。',
      mage:'獸人把無主奧術稱為「空火」：力量強大，卻會蓋過祖靈的聲音，因此部族不培養學院法師。',
      spellblade:'奧刃術要求接受高等精靈城邦的軍學誓約；獸人戰士不會把自己的武器誓言交給外族議會。',
      runeguard:'矮人的符文守衛必須在氏族熔爐前完成認印；獸人的骨圖騰與石符系統無法互相替代。',
      gravebound:'獸人相信亡者應進入祖靈長列；墓誓者把靈魂留在屍身，被視為拒絕祖先召喚。'
    },
    beastfolk:{
      paladin:'多數聖火修會至今仍拒絕讓獸裔宣讀正式騎士誓詞；不是缺乏信仰，而是教會尚未承認他們的騎士身分。',
      spellblade:'高等精靈的奧刃學院只向城邦血籍開放，獸裔甚至無法取得進入內院的資格。',
      runeguard:'矮人的氏族符文只承認爐籍與祖石中的名字；獸裔沒有可供認印的矮人氏族血統。',
      spiritcaller:'獸裔也有自己的祖先崇拜，但獸人祖靈使必須由特定部族祖祠承認，外族感官再敏銳也無法取代這層關係。',
      gravebound:'獸裔文化多把氣味、呼吸與心跳視為靈魂仍在世的證明；墓誓會抹去這些象徵，因此被視為自我放逐。'
    },
    undead:{
      paladin:'你仍可以信仰聖火，但傳統授火儀式需要生者的生命、靈魂與肉體形成完整共鳴；亡者之軀無法完成這套騎士誓儀。',
      spellblade:'高等精靈的奧刃結界會把亡者視為被污染的靈魂容器，在第一重共鳴時就排斥你。',
      runeguard:'矮人的氏族符文以祖血與爐火啟動；亡者之軀無法通過「活血認印」。',
      spiritcaller:'獸人祖靈不接受已脫離生命循環者作為祖祠媒介；你的呼喚只會換來沉默。'
    }
  };

  window.lockReason=function(rid,cid){
    return lockLore[rid]?.[cid] || '這項職業的誓約、傳承或身分條件與你的種族背景相衝突。';
  };

  window.openModal=function(html){
    const sheet=document.querySelector('#sheet');
    const modal=document.querySelector('#modal');
    sheet.innerHTML=`<button class="modal-close" type="button" aria-label="關閉介面" title="關閉" onclick="closeModal()">×</button>${html}`;
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
  };

  window.closeModal=function(){
    document.querySelector('#modal')?.classList.add('hidden');
    document.body.classList.remove('modal-open');
  };

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape' && !document.querySelector('#modal')?.classList.contains('hidden')) closeModal();
  });

  // Keep the in-game version label consistent with the page header.
  window.showMenu=function(){
    openModal(`<h2>系統</h2><p>版本 <b>v0.3.4</b></p><p class="muted">灰港餘響：延伸灰港第二幕與「沒有名字的屍體」調查，並包含任務／NPC 後續對話、裝備介面、存檔遷移、流程防重複結算、素材與 iPhone Safari 相容性修正。</p><div class="choices"><button onclick="save();toast('已儲存')">立即儲存</button><button class="danger" onclick="resetGame()">刪除存檔並重新開始</button></div>`);
  };

  const style=document.createElement('style');
  style.textContent=`
    .sheet{position:relative;padding-top:14px}
    .modal-close{position:sticky;top:0;z-index:4;float:right;width:44px;height:44px;margin:-5px -4px 8px 12px;padding:0;border-radius:999px;border:1px solid #59657a;background:#202735eF;color:#f3e6cf;font-size:30px;line-height:40px;font-weight:400;text-align:center;box-shadow:0 4px 16px #0007;backdrop-filter:blur(10px)}
    .modal-close:active{transform:scale(.96)}
    .modal-open{overflow:hidden}
    @media (hover:hover){.modal-close:hover{background:#30394a;border-color:#8a99b3}}
  `;
  document.head.appendChild(style);
})();