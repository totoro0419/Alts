"use strict";
/* Main UI refinements loaded after index.html. No third-party scripts. */
if(!state.factScores) state.factScores={};
const grammarColumns=[
[12,"前置詞① 基本","於・于・乎：場所・対象・比較。自・従・由：起点。以：手段・理由。為：目的・対象。与：共同など。語の前後関係から訳す。","前置詞は名詞と結びついて述語を修飾する。「於邯鄲」は邯鄲に、「遠於市」は市より。"],
[13,"前置詞② 後置","「売其珠於鄭」の「於鄭」は「鄭に」、「薫以桂椒」の「以桂椒」は「桂椒をもって」。述語の後に置かれた句でも意味は変わらない。","飾りが本体を覆い隠すことを、嫁女と売珠の両方の話で示す。"],
[14,"前置詞③ 省略","文脈から明らかなとき前置詞が省略される。「遇呂尚渭水之陽」には場所を示す「於」が省かれていると読める。","「与語」は一緒に話す。「号之曰太公望」は〜と呼ぶ。呂尚＝太公望＝師尚父。"],
[15,"前置詞④ 述部の省略","「所以」は目的・理由を表す。「夫学者所以求益耳」では学ぶ目的を述べる。前置詞句のかかる述語が省略される場合もある。","「為己」「為人」は古と今で価値が逆転する。「春華」は議論・文章、「秋実」は実際の行動や徳。"],
[16,"接続詞① 基本","「而」には順接・並列・逆接。「乃」はそこで、「因」はそのため、「然」はそうだ／しかしなど、前後の論理によって判断する。","「孰」はどちらか、「無以」は〜する方法がない。「君与父孰重」の対比。"],
[17,"接続詞② 複文","「若」はもし〜ならば。「乃」「因」は前文を受ける。「以」は手段・理由。複文では前節が後節の条件・理由となる。","「為A所B」は受身。「我豈能得」は反語。誰が話しているか確認する。"]
];
factQueue=[];factIndex=0;let factShown=false;
function makeFactQueue(weak){
 const data=window.KANBUN_FACTS;
 factQueue=data.map((_,i)=>i).filter(i=>!weak||state.factScores[i]!==2);
 for(let i=factQueue.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[factQueue[i],factQueue[j]]=[factQueue[j],factQueue[i]];}
 factIndex=0;factShown=false;
}
makeFactQueue(true);
const oldTop=top;
top=function(kicker,title,desc){return oldTop(kicker,title,desc).replace("暫定教材・照合待ち","授業プリント・原典を参照");};
home=function(){
 const m=metrics(),pct=Math.round(m.known/m.all*100),fk=Object.values(state.factScores).filter(v=>v===2).length;
 let a=top("FOCUSED LEARNING","最短で、白文を攻略。","文章を理解 → 白文で書き下しと読みを思い出す → 間違えた項目だけ再確認。");
 a+='<div class="notice"><strong>重要：</strong> 試験では本文が白文で出ます。全作品・『史記』・文法演習12〜17を収録。書き下しは独自に作成した練習用です。学校で習った訓読・表記と異なる場合は学校の解答を優先してください。</div>';
 a+='<div class="section"><div class="cards"><div class="card"><div class="metriclabel">白文の習得</div><div class="metric mono">'+m.known+'<span style="font-size:15px;color:#9eabc1"> / '+m.all+'</span></div><div class="progress"><span style="width:'+pct+'%"></span></div><div class="metricmeta">書き下し＋読み</div></div><div class="card"><div class="metriclabel">要復習</div><div class="metric mono" style="color:#bc761c">'+m.review+'</div><div class="metricmeta">つまずいた句のみ</div></div><div class="card"><div class="metriclabel">重要知識</div><div class="metric mono">'+fk+'<span style="font-size:15px;color:#9eabc1"> / '+window.KANBUN_FACTS.length+'</span></div><div class="metricmeta">授業・参考書コラム</div></div></div></div>';
 a+='<div class="section"><h2 class="section-title">すぐに学習する</h2><div class="btnrow" style="margin-top:12px"><button class="btn primary" data-extra="recall">白文を暗記する →</button><button class="btn" data-extra="facts">重要知識 51問</button><button class="btn ghost" data-extra="weak">苦手だけ復習</button></div><p class="helper">「できた」の句は自動的に次回の苦手演習から除外。覚えたことの繰り返しを削減します。</p></div>';
 a+='<div class="section"><div class="section-head"><h2 class="section-title">漢詩 5題</h2><span class="helper">内容・心情・表現</span></div><div class="lesson-grid">'+poems.filter(p=>!p.type).map(p=>'<button class="lesson" data-poem="'+p.id+'"><span class="tag ready">'+escapeHTML(p.form)+'</span><div class="lesson-title">'+escapeHTML(p.title)+'</div><div class="smallmeta">'+escapeHTML(p.author)+' ／ '+p.lines.length+'句</div></button>').join("")+'</div></div>';
 a+='<div class="section"><div class="section-head"><h2 class="section-title">史記・文法演習 12〜17</h2><span class="helper">指定範囲</span></div><div class="lesson-grid">'+poems.filter(p=>p.type).map(p=>'<button class="lesson" data-poem="'+p.id+'"><span class="tag">'+(p.id==="shiji"?"史記":escapeHTML(p.form.split("／")[0]))+'</span><div class="lesson-title">'+escapeHTML(p.title)+'</div><div class="smallmeta">'+escapeHTML(p.author)+' ／ '+p.lines.length+'まとまり</div></button>').join("")+'</div></div>';
 a+='<div class="section">'+button("全出題範囲・原典を確認","goto-scope","")+'</div>';
 return a;
};
study=function(){
 const p=poems.find(x=>x.id===current)||poems[0],isRec=mode==="recall";
 let a=top(isRec?"ACTIVE RECALL":"UNDERSTAND",isRec?"白文から思い出す":"文章を理解する",isRec?"白文から書き下し・読みを再現してから開く。":"先に筋道を理解し、必要な解説だけ開いて学ぶ。");
 a+='<div class="study-panel"><div class="pickwrap"><label for="lessonPicker">教材を選択</label><select id="lessonPicker">'+poems.map(x=>'<option value="'+x.id+'" '+(x.id===p.id?"selected":"")+'>'+escapeHTML(x.title)+'</option>').join("")+'</select></div>';
 a+='<div class="poem-head"><div class="eyebrow">'+escapeHTML(p.author)+' ・ '+escapeHTML(p.form)+'</div><h2>'+escapeHTML(p.title)+'</h2><p>全'+p.lines.length+'区切り。出典と学校教材を基準に学習用訓読を作成。</p></div>';
 a+='<div class="blurb"><strong>まず話の流れ：</strong> '+escapeHTML(p.topic)+'<div style="margin-top:7px"><strong>試験のポイント：</strong> '+escapeHTML(p.tip)+'</div></div>';
 a+='<div class="verse-list">'+p.lines.map((l,i)=>{
  const k=p.id+"-"+i,op=isRec?!!studyRevealed[k]:studyRevealed[k]!==false,sc=status(k);
  let h='<article class="verse '+(op?"open":"")+'"><div class="verse-top"><span class="verse-no">'+(i+1)+' / '+p.lines.length+' ・ '+(sc===2?"✓習得":sc===1?"↻再確認":"未学習")+'</span><button class="link" data-extra-toggle="'+k+'">'+(op?"解答を隠す":"解答を見る")+'</button></div>';
  h+='<p class="kanbun">'+escapeHTML(l[0])+'</p>';
  if(op) h+='<div class="answer"><div class="answer-label">書き下し（学習用）</div><p class="kakikudashi">'+escapeHTML(l[1])+'</p><div class="answer-label">読み</div><p class="reading">'+escapeHTML(l[2])+'</p><div class="answer-label">普通の日本語で</div><div class="translation">'+escapeHTML(l[3])+'</div><div class="answer-label">ここが問われやすい</div><p class="plain">'+escapeHTML(l[4])+'</p><div class="btnrow verse-actions"><button class="btn green" data-rate="'+k+'" data-score="2">✓ できた</button><button class="btn warn" data-rate="'+k+'" data-score="1">↻ もう一度</button></div></div>';
  return h+'</article>';
 }).join("")+'</div><p class="helper">古典原文の参照元：<a href="'+encodeURI(p.source)+'" target="_blank" rel="noopener noreferrer">本文を照合 ↗</a>。現代の学校教科書の送り仮名や訓読は原典だけでは確定しないため、学校の解答を優先してください。</p></div>';
 return a;
};
function factsPage(){
 let a=top("GRAMMAR & KNOWLEDGE","重要知識・コラム","左下・右下コラムの文法事項、授業メモ、人物や心情を短時間で復習。");
 a+='<div class="btnrow" style="margin-bottom:16px"><button class="btn primary" data-extra="facts-weak">未習得だけ</button><button class="btn" data-extra="facts-all">全51問</button><button class="btn" data-extra="scope">範囲と出典</button></div>';
 a+='<div class="card"><div class="section-head"><h2 class="section-title">一問一答</h2><span class="helper">'+Math.min(factIndex+1,factQueue.length)+' / '+factQueue.length+'</span></div>';
 if(factIndex>=factQueue.length){a+='<p class="helper">今回の問題は終了しました。苦手な項目だけ繰り返せます。</p>';}
 else{const q=window.KANBUN_FACTS[factQueue[factIndex]];a+='<span class="tag">'+escapeHTML(q[3])+'</span><div class="test-kanbun" style="text-align:left;font-family:inherit;font-size:19px;padding:20px 0">'+escapeHTML(q[1])+'</div>';
 if(factShown) a+='<div class="test-answer">'+escapeHTML(q[2])+'</div><div class="btnrow" style="margin-top:16px"><button class="btn green" data-factgrade="2">✓ 覚えた・次へ</button><button class="btn warn" data-factgrade="1">↻ 不安・次へ</button></div>';
 else a+='<button class="btn primary" data-extra="reveal-fact">答えを表示</button>';
 }
 a+='</div><div class="section"><h2 class="section-title">参考書｜右下・左下の要点</h2><p class="helper">参考書の解説をそのまま転記せず、重要な構文と今回の本文との結びつきを要約しています。</p>';
 a+='<div class="column-notes">'+grammarColumns.map(c=>'<details class="noted"><summary><strong>第'+c[0]+'項 '+escapeHTML(c[1])+'</strong><span>本冊 '+(c[0]*2+2)+'〜'+(c[0]*2+3)+'頁</span></summary><div class="notedbody"><p>'+escapeHTML(c[2])+'</p><p>'+escapeHTML(c[3])+'</p></div></details>').join("")+'</div></div>';
 return a;
}
scopeView=function(){
 let a=top("EXAM SCOPE & SOURCES","試験範囲・原典","先生が指定した『史記』、漢詩5作品、文法演習12〜17、コラム・授業知識を照合。");
 a+='<div class="notice">原典と教科書は文字・送り仮名に異同があります。教科書の正答は授業資料を優先。細い鉛筆の書き込みなど確証のない箇所を断定していません。</div>';
 a+='<div class="section"><h2 class="section-title">対象範囲</h2><div class="card" style="margin-top:12px">'+[
 ["『史記会注考証』5頁1行〜6頁4行","『史記』項羽本紀。挙兵に至る人物関係・句形。"],
 ["漢詩5作品","王維『九月九日憶山東兄弟』、杜甫『登高』、李白『秋浦歌（十五）』、劉禹錫『秋風引』、白居易『燕子楼 其一』。"],
 ["『体系漢文法演習』12〜17","前置詞の基本・後置・省略、接続詞の基本・複文。"],
 ["左右下コラム・授業の書き込み","各項の右下・左下に相当する文法説明と授業知識を『重要知識』に整理。"],
 ["初見問題 少量","範囲内に出てくる文法の応用と読みを確認。"]
 ].map((r,i)=>'<div class="listline"><span class="bullet">'+(i+1)+'</span><div><strong>'+escapeHTML(r[0])+'</strong><div class="smallmeta">'+escapeHTML(r[1])+'</div></div></div>').join("")+'</div></div>';
 a+='<div class="section"><h2 class="section-title">原典照合先</h2><div class="card" style="margin-top:12px">'+poems.map(p=>'<div class="listline"><span class="bullet">↗</span><div><a href="'+encodeURI(p.source)+'" target="_blank" rel="noopener noreferrer">'+escapeHTML(p.title)+' ／ '+escapeHTML(p.author)+'</a></div></div>').join("")+'</div></div>';
 a+='<div class="section"><h2 class="section-title">学習履歴</h2><div class="btnrow" style="margin-top:12px">'+button("履歴を保存","export","")+button("読み込む","import","")+button("初期化","reset","warn")+'</div><input type="file" id="import-input" accept=".json,application/json" class="hidden"><p class="helper">進捗は端末のブラウザに保存。ブラウザデータ消去時のため、JSONバックアップを推奨します。</p></div>';
 return a;
};
render=function(){document.getElementById("view").innerHTML=nav==="home"?home():nav==="study"||nav==="recall"?study():nav==="test"?test():nav==="facts"?factsPage():scopeView();};
document.querySelectorAll(".nav [data-nav='scope']").forEach(e=>{
 const b=document.createElement("button");b.dataset.nav="facts";b.textContent="✦　重要知識・コラム";e.before(b);
});
document.querySelectorAll(".top-mobile [data-nav='scope']").forEach(e=>{e.dataset.nav="facts";e.innerHTML="<span>✦</span>知識";});
document.addEventListener("click",e=>{
 const b=e.target.closest("button");if(!b)return;
 if(b.dataset.extraToggle){const k=b.dataset.extraToggle;const rec=mode==="recall",open=rec?!!studyRevealed[k]:studyRevealed[k]!==false;studyRevealed[k]=!open;render();return;}
 if(b.dataset.factgrade){state.factScores[factQueue[factIndex]]=Number(b.dataset.factgrade);save();factIndex++;factShown=false;render();return;}
 const op=b.dataset.extra;
 if(op==="facts"||op==="facts-weak"){makeFactQueue(true);navTo("facts");}
 if(op==="facts-all"){makeFactQueue(false);navTo("facts");}
 if(op==="recall"){mode="recall";navTo("recall");}
 if(op==="weak"){resetTest(true);}
 if(op==="scope"){navTo("scope");}
 if(op==="reveal-fact"){factShown=true;render();}
});
document.addEventListener("change",e=>{if(e.target.id==="lessonPicker"){current=e.target.value;studyRevealed={};render();}});
const extraCss=document.createElement("style");
extraCss.textContent=".pickwrap{display:flex;align-items:center;gap:10px;margin:18px 0;flex-wrap:wrap}.pickwrap label{font-size:12px;color:var(--muted);font-weight:800}.pickwrap select{padding:12px 14px;min-width:200px;flex:1;border:1px solid var(--line);border-radius:12px;background:white;color:var(--ink);font-weight:700}.noted{border:1px solid var(--line);border-radius:14px;background:#fff;margin:10px 0;overflow:hidden}.noted summary{padding:16px;font-size:13px;display:flex;justify-content:space-between;gap:12px;cursor:pointer;align-items:center}.noted summary span{color:var(--muted);font-size:11px}.notedbody{padding:4px 16px 14px;display:grid;grid-template-columns:1fr 1fr;gap:18px;color:#475773;font-size:13px;line-height:1.9}@media(max-width:600px){.notedbody{grid-template-columns:1fr;gap:0}}";
document.head.appendChild(extraCss);
render();
