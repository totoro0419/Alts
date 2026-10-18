"use strict";
(()=>{
const root=document.getElementById("app");
const works=[...(window.KANBUN_POEMS||[]),...(window.KANBUN_SUPPLEMENT||[])];
const facts=window.KANBUN_FACTS||[],columns=window.KANBUN_COLUMNS||[];
const workMap=new Map(works.map(w=>[w.id,w]));
const order=["shiji","wang","du","li","ryu","bai","g12","g13","g14","g15","g16","g17"];
const items=new Map(),all=[];
for(const slug of order){const w=workMap.get(slug);if(!w)continue;
w.lines.forEach((line,i)=>{const id="line:"+slug+":"+(i+(w.sourceOffset||0));items.set(id,{id,type:"line",w,line,i,title:w.title});all.push(id)});
if(slug[0]==="g"){const c=columns.find(c=>String(c[0])===slug.slice(1));if(c){const id="column:"+c[0];items.set(id,{id,type:"column",c,title:"第"+c[0]+"項 コラム"});all.push(id)}}
}
facts.forEach((f,i)=>{const id="fact:"+i;items.set(id,{id,type:"fact",f,i,title:"重要知識"});all.push(id)});
const KEY="sideworks:kanbun:progress:v3",OLD="alts-kanbun-study-v1";
const state={scores:{},session:null,selected:"shiji",positions:{}};
const open=new Set();let shown=false,storageOK=true,notice="";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const getJSON=k=>{try{return JSON.parse(localStorage.getItem(k)||"null")}catch{return null}};
const value=x=>x===2?2:x===1?1:0,score=id=>value(state.scores[id]);
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));storageOK=true}catch{storageOK=false;notice="ブラウザに進捗を保存できません。"}}
function load(){
 const d=getJSON(KEY);
 if(d&&typeof d==="object"){
  if(d.scores&&typeof d.scores==="object")for(const [id,n] of Object.entries(d.scores))if(items.has(id))state.scores[id]=value(n);
  if(typeof d.selected==="string"&&workMap.has(d.selected))state.selected=d.selected;
  if(d.positions&&typeof d.positions==="object")for(const [slug,n] of Object.entries(d.positions)){if(workMap.has(slug)&&Number.isInteger(n))state.positions[slug]=Math.max(0,Math.min(workMap.get(slug).lines.length-1,n));}
  if(d.session&&Array.isArray(d.session.ids)){const ids=[...new Set(d.session.ids.filter(id=>items.has(id)))];if(ids.length)state.session={mode:d.session.mode||"all",ids,pos:Math.max(0,Math.min(ids.length,Number.isInteger(d.session.pos)?d.session.pos:0))}}
 }else{
  const old=getJSON(OLD);
  if(old){if(old.scores)for(const [k,n] of Object.entries(old.scores)){const id="line:"+k.replace(/-(\d+)$/,":$1");if(items.has(id))state.scores[id]=value(n)}
  if(old.factScores)for(const [i,n] of Object.entries(old.factScores)){const id="fact:"+i;if(items.has(id))state.scores[id]=value(n)}save()}
 }
}
load();
function totals(){const t={all:all.length,done:0,weak:0,unseen:0};all.forEach(id=>{const x=score(id);if(x===2)t.done++;else if(x===1)t.weak++;else t.unseen++});return t}
function chip(id){const s=score(id);return '<span class="chip '+(s===2?"ok":s===1?"warn":"neutral")+'">'+(["未学習","要復習","習得済み"][s])+'</span>'}
function button(text,action,style="",attrs=""){return '<button class="btn '+style+'" type="button" data-act="'+action+'" '+attrs+'>'+text+'</button>'}
function getRoute(){try{return decodeURIComponent(location.hash.slice(1))||"home"}catch{return "home"}}
function go(to){if(location.hash!=="#"+to)location.hash=to;render();window.scrollTo(0,0)}
function navItem(to,text,active){return '<button type="button" class="navbtn '+(active===to?"active":"")+'" data-act="nav" data-to="'+to+'">'+text+'</button>'}
function mobItem(to,symbol,text,active){return '<button type="button" class="'+(active===to?"active":"")+'" data-act="nav" data-to="'+to+'"><span>'+symbol+'</span>'+text+'</button>'}
function frame(route){
const active=route.startsWith("lesson/")?"lesson":route;
return '<div class="layout"><aside class="sidebar"><div class="brand"><div class="brandmark">文</div><div>漢文<small>EXAM PREP</small></div></div><nav aria-label="教材メニュー">'+
navItem("home","⌂　ホーム",active)+navItem("session","▶　通し学習",active)+navItem("lesson","▤　本文を学ぶ",active)+navItem("knowledge","✦　重要知識・コラム",active)+navItem("scope","☷　試験範囲・出典",active)+
'</nav><div class="sidebarfoot">独立ページ /Alts/kanbun/<br>学習進捗は端末内に保存</div></aside><main class="main"><div id="content"></div><footer>※ 書き下し・解説は学習用。学校の指定表記と異なる場合は授業資料・解答を優先してください。</footer></main>'+
'<nav class="mobile-nav" aria-label="モバイルメニュー">'+mobItem("home","⌂","ホーム",active)+mobItem("session","▶","通し",active)+mobItem("lesson","▤","本文",active)+mobItem("knowledge","✦","知識",active)+mobItem("scope","☷","範囲",active)+'</nav></div>';
}
function title(tag,name,sub){return '<div class="topline"><span class="eyebrow">'+esc(tag)+'</span><span class="chip">2026年度 2学期中間</span></div><h1>'+esc(name)+'</h1><p class="lead">'+esc(sub)+'</p>'}
function bar(n,max){return '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="'+max+'" aria-valuenow="'+n+'"><span style="width:'+(max?Math.round(n/max*100):100)+'%"></span></div>'}
function metric(label,n,total,desc){return '<div class="panel"><div class="metricname">'+label+'</div><div class="value">'+n+(total?'<span style="font-size:15px;color:var(--muted)"> / '+total+'</span>':"")+'</div><div class="metricnote">'+desc+'</div></div>'}
function home(){
const t=totals(),s=state.session,continueSession=s&&s.ids.length&&s.pos<s.ids.length;
let a=title("STUDY SMARTER","白文から、確実に。","史記・漢詩5作品・漢文法演習12〜17。全範囲を通しで学び、苦手な問題だけを後から解き直せます。");
a+='<div class="notice"><strong>試験対策の重点：</strong> 白文→書き下し・読み。授業プリントと解答を最優先にし、本文の意味・人物関係・左右下コラムまで確認します。細かい手書き注釈の全件照合は未完了です。</div>';
a+='<p class="lead" style="margin:12px 0 0;font-size:12px">インストールしたのに開けない・アイコンが見つからない場合は、<a href="./install.html">アプリの状態を確認する ↗</a></p>';
a+='<section class="section"><div class="grid3">'+metric("習得済み",t.done,t.all,"白文・コラム・知識の合計")+metric("苦手・復習待ち",t.weak,null,"解答を開いて未習得も含む")+metric("未学習",t.unseen,null,"まだ着手していない項目")+'</div></section>';
a+='<section class="section"><div class="sectionheading"><h2>学習モード</h2><small>進捗は自動保存</small></div><div class="grid3">';
a+='<button class="feature" data-act="all"><span class="symbol">▶</span><strong>全範囲を通しで</strong><small>白文92・コラム6・重要知識51＝149項目を連続演習</small></button>';
a+='<button class="feature" data-act="weak"><span class="symbol">↻</span><strong>苦手だけやり直す</strong><small>「要復習」の項目のみを抽出。習得済みは飛ばす</small></button>';
a+='<button class="feature" data-act="unfinished"><span class="symbol">✓</span><strong>未習得だけ進める</strong><small>未学習と苦手を復習。習得済みは省略</small></button></div>';
if(continueSession)a+='<div class="panel" style="margin-top:14px"><div class="sectionheading"><strong>前回の続き</strong><small>'+(s.pos+1)+' / '+s.ids.length+'</small></div>'+bar(s.pos,s.ids.length)+'<div class="buttons" style="margin-top:12px">'+button("続きから再開 →","resume","primary")+'</div></div>';
a+='</section><section class="section"><div class="sectionheading"><h2>教材から選ぶ</h2><small>一文ずつ意味と読みを確認</small></div><div class="grid2">';
a+=order.filter(k=>workMap.has(k)).map(k=>{const w=workMap.get(k),done=w.lines.filter((_,i)=>score("line:"+k+":"+(i+(w.sourceOffset||0)))===2).length;return '<button type="button" class="lesson-card" data-act="open-lesson" data-id="'+k+'"><span class="chip neutral">'+(k==="shiji"?"史記":k[0]==="g"?"漢文法演習":"漢詩")+'</span><h3>'+esc(w.title)+'</h3><small>'+esc(w.author)+' ／ '+done+' / '+w.lines.length+'区切り習得</small></button>'}).join("");
return a+'</div></section>';
}
function front(item){
if(item.type==="line")return '<div class="testfront"><span class="chip neutral">'+esc(item.w.author)+' · 白文</span><div class="chinese">'+esc(item.line[0])+'</div><small>書き下し・読みを頭の中で再現してください</small></div>';
if(item.type==="fact")return '<div class="testfront"><span class="chip neutral">'+esc(item.f[3])+'</span><div class="question">'+esc(item.f[1])+'</div></div>';
return '<div class="testfront"><span class="chip neutral">左下・右下コラム</span><div class="question">第'+item.c[0]+'項「'+esc(item.c[1])+'」<br>文法の要点を説明できますか？</div></div>';
}
function answer(item){
if(item.type==="line")return '<div class="answer"><div class="fieldlabel">書き下し（学習用）</div><p class="kakikudashi">'+esc(item.line[1])+'</p><div class="fieldlabel">読み</div><p class="reading">'+esc(item.line[2])+'</p><div class="fieldlabel">普通の日本語で</div><div class="explain">'+esc(item.line[3])+'</div><div class="fieldlabel">重要ポイント</div><p class="notes">'+esc(item.line[4])+'</p></div>';
if(item.type==="fact")return '<div class="answer"><div class="fieldlabel">解答・解説</div><div class="explain">'+esc(item.f[2])+'</div></div>';
return '<div class="answer"><div class="fieldlabel">文法の要点</div><div class="explain">'+esc(item.c[2])+'</div><div class="fieldlabel">本文への応用</div><div class="explain">'+esc(item.c[3])+'</div></div>';
}
function createSession(mode,ids){
let list=Array.isArray(ids)?ids.filter(id=>items.has(id)):all.slice();
if(mode==="weak")list=list.filter(id=>score(id)===1);
if(mode==="unfinished")list=list.filter(id=>score(id)!==2);
state.session={mode,ids:list,pos:0};shown=false;save();go("session");
}
function session(){
const s=state.session,t=totals();
if(!s)return '<div class="panel empty"><h2>通し学習</h2><p>白文・コラム・重要知識を連続して学習できます。</p>'+button("通し学習を始める","all","primary")+button("苦手だけ","weak","tinted")+'</div>';
const names={all:"全範囲・通し学習",weak:"苦手だけ復習",unfinished:"未習得をまとめて",module:"教材別学習",knowledge:"知識・コラム通し"};
if(!s.ids.length)return title("ACTIVE RECALL",names[s.mode]||"学習","復習対象がない場合は、全範囲から始めてください。")+'<div class="panel empty"><h2>対象の項目はありません</h2><p>苦手だけ復習は、「要復習」と判定した項目を抽出します。</p>'+button("全範囲を始める","all","primary")+'</div>';
if(s.pos>=s.ids.length)return title("ACTIVE RECALL","今回の演習が終了","通し学習の最後まで到達しました。")+'<div class="panel empty"><span class="chip ok">演習完走</span><h2 style="margin-top:13px">'+s.ids.length+'項目を確認しました</h2><p>習得 '+t.done+' / '+t.all+'　 苦手 '+t.weak+'　 未学習 '+t.unseen+'</p><div class="buttons" style="justify-content:center">'+button("苦手だけやり直す","weak","primary")+button("全範囲をもう一度","all","tinted")+'</div></div>';
const id=s.ids[s.pos],item=items.get(id);
let a='<section class="learning-screen learning-session">';
a+='<div class="learning-topbar"><div class="learning-page-title"><span class="eyebrow">ACTIVE RECALL</span><strong>'+esc(names[s.mode]||"演習")+'</strong><span class="learning-item-name">'+esc(item.title)+'</span></div><div class="learning-shortcuts">'+button("全範囲","all","flat")+button("苦手","weak","flat")+button("閉じる","nav","flat",'data-to="home"')+'</div></div>';
a+='<div class="learning-tracker"><span>'+(s.pos+1)+' / '+s.ids.length+'</span>'+bar(s.pos,s.ids.length)+'</div>';
a+='<div class="learning-workspace">';
a+='<div class="learning-prompt"><div class="learning-pane-label">問題 · '+esc(item.title)+'</div>'+front(item)+'</div>';
a+='<div class="learning-response"><div class="learning-pane-label">書き下し・読み・解説</div><div class="learning-response-content">'+(shown?answer(item):'<div class="learning-placeholder">答えを思い出したら「解答を表示」</div>')+'</div><div class="learning-response-buttons">'+(shown?button("✓ できた・次へ","grade","success",'data-id="'+id+'" data-score="2"')+button("↻ 要復習・次へ","grade","retry",'data-id="'+id+'" data-score="1"'):button("答えを表示","reveal","primary",'data-id="'+id+'"'))+'</div></div>';
a+='</div><div class="learning-bottomrow"><div class="buttons">'+button("← 前の問題","prev","")+button("次の問題 →","next","")+'</div><small>解答を見るだけでは習得済みになりません</small></div></section>';
return a;
}
function lesson(slug){
const w=workMap.get(slug);if(!w)return home();
const i=Math.max(0,Math.min(w.lines.length-1,state.positions[slug]||0));
const id="line:"+slug+":"+(i+(w.sourceOffset||0));
const line=w.lines[i],item=items.get(id),visible=open.has(id);
let a='<section class="learning-screen learning-lesson">';
a+='<div class="learning-topbar"><div class="learning-page-title"><span class="eyebrow">TEXT STUDY</span><strong>'+esc(w.title)+'</strong><span class="learning-item-name">'+esc(w.author)+'</span></div><div class="learning-shortcuts">'+button("この教材を通しで","module","flat",'data-id="'+slug+'"')+button("苦手","weak","flat")+button("ホーム","nav","flat",'data-to="home"')+'</div></div>';
a+='<div class="learning-tracker"><label for="lesson-select">教材</label><select id="lesson-select">'+order.filter(k=>workMap.has(k)).map(k=>'<option value="'+k+'" '+(k===slug?"selected":"")+'>'+esc(workMap.get(k).title)+'</option>').join("")+'</select><span>'+(i+1)+' / '+w.lines.length+'</span>'+bar(i,w.lines.length)+'</div>';
a+='<details class="learning-context"><summary>作品全体のあらすじと試験ポイントを確認</summary><p><strong>内容：</strong>'+esc(w.topic)+'</p><p><strong>重要：</strong>'+esc(w.tip)+'</p></details>';
a+='<div class="learning-workspace">';
a+='<div class="learning-prompt"><div class="learning-pane-label">白文 '+(i+1)+' / '+w.lines.length+'　'+(score(id)===2?"✓ 習得済み":score(id)===1?"↻ 要復習":"未学習")+'</div>'+front(item)+'</div>';
a+='<div class="learning-response"><div class="learning-pane-label">書き下し・読み・解説</div><div class="learning-response-content">'+(visible?answer(item):'<div class="learning-placeholder">白文を読み、書き下しを考えてください。</div>')+'</div><div class="learning-response-buttons">'+(visible?button("✓ できた","grade","success",'data-id="'+id+'" data-score="2"')+button("↻ もう一度","grade","retry",'data-id="'+id+'" data-score="1"'):button("解答を見る","reveal","primary",'data-id="'+id+'"'))+'</div></div>';
a+='</div><div class="learning-bottomrow"><div class="buttons">'+button("← 前の文","lesson-prev","")+button("次の文 →","lesson-next","")+'</div><small><a href="'+esc(w.source)+'" rel="noopener noreferrer" target="_blank">原典の参照先 ↗</a>　学校で習った書き下しを優先</small></div></section>';
return a;
}
function knowledge(){
let a=title("GRAMMAR & CONTEXT","重要知識・左右下コラム","前置詞・接続詞、歴史上の人物関係、漢詩の心情を短時間で復習。");
a+='<div class="buttons">'+button("知識・コラム57項目を通しで","knowledge-session","primary")+button("苦手だけ","weak","tinted")+'</div><section class="section"><h2>第12〜17項 コラム</h2><p class="lead">教科書の要点を独自要約したものです。</p>';
a+=columns.map(c=>'<details class="column"><summary><strong>第'+c[0]+'項 '+esc(c[1])+'</strong>'+chip("column:"+c[0])+'</summary><div class="columnbody"><div><div class="fieldlabel">文法の要点</div><p>'+esc(c[2])+'</p></div><div><div class="fieldlabel">注意点</div><p>'+esc(c[3])+'</p></div></div><div class="buttons" style="padding:0 17px 16px">'+button("✓ 覚えた","grade","success",'data-id="column:'+c[0]+'" data-score="2"')+button("↻ 苦手","grade","retry",'data-id="column:'+c[0]+'" data-score="1"')+'</div></details>').join("");
a+='</section><section class="section"><h2>重要知識 51問</h2><div class="verse-list">';
a+=facts.map((f,i)=>{const id="fact:"+i,visible=open.has(id);return '<article class="verse"><div class="verse-head"><span class="chip neutral">'+esc(f[3])+'</span>'+chip(id)+'</div><p style="font-weight:760;margin:14px 0">'+esc(f[1])+'</p>'+button(visible?"答えを隠す":"答えを見る",visible?"hide":"reveal","tinted",'data-id="'+id+'"')+(visible?answer(items.get(id))+'<div class="buttons">'+button("✓ 覚えた","grade","success",'data-id="'+id+'" data-score="2"')+button("↻ 苦手","grade","retry",'data-id="'+id+'" data-score="1"')+'</div>':"")+'</article>'}).join("");
return a+'</div></section>';
}
function scope(){
let a=title("EXAM SCOPE","試験範囲・出典","先生の指定：史記5〜6頁、漢詩5作品、体系漢文法演習12〜17、左右下コラム、授業で扱った知識と少量の初見。");
a+='<div class="notice">学校指定の書き下し・読みが正答基準です。手書きの細部を完全に確認できていないため、完全一致を保証していません。</div>';
a+='<section class="section panel">'+[
["『史記会注考証』5頁1行〜6頁4行","『史記』項羽本紀"],["漢詩5作品","王維、杜甫、李白、劉禹錫、白居易"],["『体系漢文法演習』12〜17","前置詞・接続詞。本文は白文"],["右下・左下コラム","解説の要点と応用"],["授業で扱った漢文知識","手書きのメモを含む"],["初見問題 少量","既習句形の応用"]
].map((r,i)=>'<div class="rowline"><span class="number">'+(i+1)+'</span><div><strong>'+esc(r[0])+'</strong><div style="color:var(--muted)">'+esc(r[1])+'</div></div></div>').join("")+'</section>';
a+='<section class="section"><h2>古典本文の参考元</h2><div class="panel">'+order.filter(k=>workMap.has(k)).map(k=>{const w=workMap.get(k);return '<div class="rowline"><span class="number">↗</span><a href="'+esc(w.source)+'" target="_blank" rel="noopener noreferrer">'+esc(w.title)+' ／ '+esc(w.author)+'</a></div>'}).join("")+'</div></section>';
a+='<section class="section"><h2>学習履歴</h2><div class="buttons">'+button("バックアップ保存","export","")+button("バックアップ読込","import","")+button("進捗を初期化","clear","retry")+'</div><input class="hide" type="file" accept=".json,application/json" id="import-file"><p class="lead" style="font-size:12px">端末内に保存します。旧版からの進捗引継ぎに対応。</p></section>';
return a;
}
function render(){
try{
if(works.length!==12||facts.length!==51||columns.length!==6||all.length!==149)throw Error("教材の一部を読み込めませんでした");
const route=getRoute(),kind=route.startsWith("lesson/")?"lesson":route;
document.body.classList.toggle("learning-active",kind==="lesson"||(kind==="session"&&!!state.session&&state.session.pos<state.session.ids.length&&state.session.ids.length>0));
root.innerHTML=frame(route);
document.getElementById("content").innerHTML=kind==="home"?home():kind==="session"?session():kind==="lesson"?lesson(route.slice(7)):kind==="knowledge"?knowledge():kind==="scope"?scope():home();
if(notice){const p=document.createElement("p");p.className="notice";p.setAttribute("role","status");p.textContent=notice;document.getElementById("content").prepend(p);notice=""}
}catch(err){console.error("Kanbun:",err);root.innerHTML='<main class="main"><h1>教材を表示できませんでした</h1><p>再読み込みしてください。読み込みエラーが続く場合はサイトデータを確認してください。</p><button onclick="location.reload()">再読み込み</button></main>'}
}
function reveal(id){if(!items.has(id))return;
open.add(id);if(state.session?.ids[state.session.pos]===id)shown=true;
if(score(id)===0){state.scores[id]=1;save()}render()
}
function grade(id,grade){if(!items.has(id))return;state.scores[id]=grade===2?2:1;
if(getRoute()==="session"&&state.session?.ids[state.session.pos]===id){state.session.pos++;shown=false}
else if(getRoute().startsWith("lesson/")){const slug=getRoute().slice(7),w=workMap.get(slug);if(w&&state.positions[slug]<w.lines.length-1){state.positions[slug]=(state.positions[slug]||0)+1;open.delete("line:"+slug+":"+(state.positions[slug]+(w.sourceOffset||0)))}}
save();render()
}
function move(delta){if(!state.session)return;state.session.pos=Math.max(0,Math.min(state.session.ids.length,state.session.pos+delta));shown=false;save();render()}
function changeLesson(delta){
const slug=getRoute().slice(7),w=workMap.get(slug);
if(!w)return;
state.positions[slug]=Math.max(0,Math.min(w.lines.length-1,(state.positions[slug]||0)+delta));
save();render();
}
function backup(){
const blob=new Blob([JSON.stringify({format:"sideworks-kanbun-v3",scores:state.scores,session:state.session},null,2)],{type:"application/json"});
const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="kanbun-progress.json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)
}
async function restore(file){try{const x=JSON.parse(await file.text());if(!x||x.format!=="sideworks-kanbun-v3"||typeof x.scores!=="object"||!x.scores||Array.isArray(x.scores))throw Error();
const scores={};Object.entries(x.scores).forEach(([id,v])=>{if(items.has(id)&&[0,1,2].includes(v))scores[id]=v});
state.scores=scores;state.session=null;save();notice="学習履歴を復元しました";go("home")
}catch{notice="読み込めないバックアップです";render()}}
document.addEventListener("click",ev=>{
const b=ev.target.closest("button[data-act]");if(!b)return;const a=b.dataset.act,id=b.dataset.id;
switch(a){
case "nav":go(b.dataset.to==="lesson"?"lesson/"+state.selected:b.dataset.to);break;
case "open-lesson":state.selected=id;save();go("lesson/"+id);break;
case "all":createSession("all");break;
case "weak":createSession("weak");break;
case "unfinished":createSession("unfinished");break;
case "resume":go("session");break;
case "module":createSession("module",all.filter(x=>x.startsWith("line:"+id+":")||(id.startsWith("g")&&x==="column:"+id.slice(1))));break;
case "knowledge-session":createSession("knowledge",all.filter(x=>x.startsWith("fact:")||x.startsWith("column:")));break;
case "reveal":reveal(id);break;
case "hide":open.delete(id);if(state.session?.ids[state.session.pos]===id)shown=false;render();break;
case "grade":grade(id,Number(b.dataset.score));break;
case "next":move(1);break;
case "lesson-next":changeLesson(1);break;
case "lesson-prev":changeLesson(-1);break;
case "prev":move(-1);break;
case "export":backup();break;
case "import":document.getElementById("import-file")?.click();break;
case "clear":if(confirm("学習履歴と通し学習の進捗を初期化しますか？")){state.scores={};state.session=null;open.clear();save();notice="履歴を初期化しました";go("home")}break;
}
});
document.addEventListener("change",e=>{if(e.target.id==="lesson-select"){state.selected=e.target.value;save();go("lesson/"+state.selected)}if(e.target.id==="import-file"&&e.target.files?.[0])restore(e.target.files[0])});
window.addEventListener("hashchange",()=>{shown=false;render()});
if("serviceWorker" in navigator&&location.protocol==="https:")navigator.serviceWorker.register("./sw.js",{scope:"./"}).catch(()=>{});
render();
window.__KANBUN_DIAGNOSTICS__=Object.freeze({count:()=>all.length,totals:()=>({...totals()}),kinds:()=>all.reduce((o,id)=>{const k=items.get(id).type;o[k]=(o[k]||0)+1;return o},{}),session:()=>state.session?{mode:state.session.mode,pos:state.session.pos,length:state.session.ids.length}:null,storageOK:()=>storageOK});
})();