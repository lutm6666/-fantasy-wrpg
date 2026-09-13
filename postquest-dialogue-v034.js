// Ashen Realms v0.3.4 — post-quest dialogue continuity for Grayharbor NPCs.
(function(){
  function hasCompleted(id){return !!s.quests?.[id]?.completed;}
  function act2Started(){return !!s.flags?.grayharborAct2Started;}
  function act2Completed(){return !!s.flags?.thirdDrainDiscovered||hasCompleted('namelessCorpse');}

  // 米菈：依灰港主線進度更新談話，不再重複第一章進行中的情報。
  if(scenes.guard){
    const previousGuard=scenes.guard;
    scenes.guard=function(){
      if(act2Completed()){
        return{
          title:'城衛隊長米菈',img:'harbor',
          text:'米菈把北渠與第三排水閘的巡查圖攤在桌上。「鐘塔那件事已經結案，艾倫的案子也把我們帶到了真正的入口。現在城衛能做的是封住外圍，別讓不知情的人闖進去。」她抬眼看你。「門後面的事，才是下一步。」',
          choices:[['談談下一步調查','thirdDrain'],['返回港口','arrival']]
        };
      }
      if(act2Started()){
        const text=s.flags?.allenInterviewComplete
          ?'米菈桌上已經換成北渠的證詞與舊港水道圖。「鐘塔案的卷宗我已經封存。現在重要的是艾倫說的地下設施，以及那些還沒找到的人。」'
          :'米菈幾乎沒有坐下。北渠剛被封鎖，幾名城衛正在來回報告。「鐘塔的事先放到一邊。那個從排水渠走出來的人，才是現在最急的問題。」';
        return{title:'城衛隊長米菈',img:'harbor',text,choices:[['前往北渠出口','northCanal'],['返回港口','arrival']]};
      }
      if(s.flags?.reported){
        return{
          title:'城衛隊長米菈',img:'harbor',
          text:'鐘塔事件的證物已經被城衛封存，失蹤案也暫時告一段落。米菈揉了揉眉心：「歐林平安回來，鐘塔下面也清乾淨了。至少這一件事，我們算是做完了。」她指了指酒館方向。「去休息吧。灰港不會因為少一樁案子就突然變安靜。」',
          choices:[['前往斷錨酒館','tavern'],['返回港口','arrival']]
        };
      }
      return previousGuard();
    };
  }

  // 哈洛與酒館：完成第一章後不再持續追問「失蹤者」。
  if(scenes.tavern){
    const previousTavern=scenes.tavern;
    scenes.tavern=function(){
      const o=previousTavern();
      if(!s.flags?.reported)return o;

      if(act2Completed()){
        o.text='斷錨酒館又恢復了原本的吵雜。鐘塔失蹤案已經成了幾桌酒客反覆加工的故事，而北渠的新封鎖線則成了下一個話題。哈洛看見你進門，只把杯子往吧檯上一放：「別告訴我這次又是從地下挖出來的麻煩。」';
      }else if(act2Started()){
        o.text='鐘塔事件已經沒有人再當成失蹤案談論；現在所有人都在議論北渠。哈洛一邊擦杯子一邊抱怨城衛封路害他少了兩桌碼頭客。';
      }else{
        o.text='鐘塔事件結束後，酒館裡關於失蹤者的竊竊私語少了許多。歐林已經回來，幾名碼頭工也重新上工；哈洛看到你時，只把一杯剛洗好的酒杯倒扣回架上。';
      }

      // 移除仍把案件當作進行中的舊選項。
      o.choices=(o.choices||[]).filter(x=>!['bartender','mercs'].includes(x[1]));
      if(!o.choices.some(x=>x[1]==='bartenderPost'))o.choices.splice(0,0,['和哈洛聊聊最近的事','bartenderPost']);
      return o;
    };
  }

  scenes.bartenderPost=function(){
    if(act2Completed()){
      return{title:'酒保哈洛',img:'tavern',text:'「先是鐘塔，再來北渠，現在又多一道會自己亮的牆。」哈洛搖頭。「我以前以為灰港最麻煩的是走私客。現在想想，那些人至少還會用正常的門。」',choices:[['返回酒館','tavern']]};
    }
    if(act2Started()){
      return{title:'酒保哈洛',img:'tavern',text:'「鐘塔那批人被你清掉之後，本來大家都以為事情完了。」哈洛朝北邊努了努嘴。「結果今天又封了一條水道。至少這次城衛沒有假裝什麼都沒發生。」',choices:[['返回酒館','tavern']]};
    }
    return{title:'酒保哈洛',img:'tavern',text:'「歐林回來了，鐘塔下面也沒人再失蹤。」哈洛把杯子擦乾。「這就算好消息。至於那個裂眼符號，我勸你別因為贏了一次就覺得它已經消失。」',choices:[['返回酒館','tavern']]};
  };

  // 已結束的失蹤告示改為事件後狀態。
  if(scenes.notice){
    const previousNotice=scenes.notice;
    scenes.notice=function(){
      if(!s.flags?.reported)return previousNotice();
      return{
        title:'撤下的失蹤告示',img:'harbor',
        text:'原本貼滿失蹤告示的木板已經清掉大半。歐林的那張紙被雨水泡得發皺，如今角落蓋著城衛的「已尋獲」印記。只有那個被劈成兩半的眼形符號仍讓你無法完全把這件事當成結束。',
        choices:[['返回港口','arrival']]
      };
    };
  }

  // 娜莎／老碼頭：依玩家處理帳冊的方式保留事件後記憶。
  if(scenes.oldDocks){
    const previousOldDocks=scenes.oldDocks;
    scenes.oldDocks=function(){
      const q=s.quests?.tide;
      if(!(q?.completed||q?.stage>=4))return previousOldDocks();
      let text='退潮排水洞的事情已經告一段落。失蹤學徒重新回到碼頭工作，工人看到你時仍會點頭致意。';
      if(s.flags?.tideOutcome==='giveGuardLedger')text+=' 娜莎對城衛接手帳冊仍有些不放心，但至少走私路線已經開始被盤查。';
      else if(s.flags?.tideOutcome==='returnDockLedger')text+=' 娜莎把帳冊收了起來，碼頭工們開始私下清查究竟是誰把貨送進排水洞。';
      else if(s.flags?.tideOutcome==='leaveLedger')text+=' 至於那本帳冊，你沒有交給任何人；碼頭上沒有人知道你曾經找到它。';
      return{title:'老碼頭',img:'harbor',text,choices:[['返回市集','market']]};
    };
  }

  const previousAct=act;
  act=function(a){
    if(a==='bartenderPost'){s.scene='bartenderPost';save();showScene();return;}
    previousAct(a);
  };
})();
