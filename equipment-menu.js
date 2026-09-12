// Ashen Realms v0.3.3 — keep the system panel aligned with the equipment update.
(function(){
  window.showMenu=function(){
    openModal(`<h2>系統</h2><p>版本 <b>v0.3.3</b></p><p class="muted">新增獨立裝備介面：可直接查看武器、護甲、飾品的裝配狀態、總生命／攻擊／防禦、替換裝備的屬性差值，並支援換裝與卸下；同時保留 v0.3.2 的情報解鎖與敘事回饋更新。</p><div class="choices"><button onclick="save();toast('已儲存')">立即儲存</button><button class="danger" onclick="resetGame()">刪除存檔並重新開始</button></div>`);
  };
})();
