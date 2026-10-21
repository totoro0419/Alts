(function(){
"use strict";
const chapters=(window.EXAM_BOOK_CHAPTERS||[]).slice();
const nav=document.getElementById("side-nav");
const page=document.getElementById("page");
const search=document.getElementById("search");
const shell=document.getElementById("layout");
const storage="sideworks:math-exam-book:";
let done=new Set();
let q="";
try{done=new Set(JSON.parse(localStorage.getItem(storage+"completed")||"[]"));}catch(e){done=new Set();}
try{if(localStorage.getItem(storage+"theme")==="dark")document.body.classList.add("dark");}catch(e){}
const encode=s=>s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function categoryOf(c){return c.category||"基本事項";}
function link(c){return "#"+c.id;}
function chapterMatches(c){
if(!q)return true;
const hay=(c.title+" "+c.description+" "+(c.tags||[]).join(" ")+" "+c.html.replace(/<[^>]*>/g," ")).toLowerCase();
return hay.includes(q);
}
function updateProgress(){
 const n=chapters.filter(c=>done.has(c.id)).length;
 document.getElementById("progress-summary").textContent="学習済み "+n+" / "+chapters.length+" 章";
}
function renderNav(active){
let cat="";
const matched=chapters.filter(chapterMatches);
let html='<a href="#guide" class="'+(active==="guide"?"active":"")+'"><span class="num">⌂</span><span>目次・学習ガイド</span></a>';
for(const c of matched){
 if(c.category!==cat){cat=categoryOf(c);html+='<div class="nav-heading">'+encode(cat)+'</div>';}
 html+='<a href="'+link(c)+'" class="'+(active===c.id?"active":"")+'"><span class="num">'+String(c.num).padStart(2,"0")+'</span><span>'+encode(c.title)+'</span>'+(done.has(c.id)?'<span class="checkmark" aria-label="学習済み">✓</span>':"")+'</a>';
}
if(!matched.length)html+='<div class="empty">該当する章がありません。</div>';
nav.innerHTML=html;
updateProgress();
}
function guide(){
const cards=chapters.filter(chapterMatches).map(c=>'<a class="chapter-card" href="'+link(c)+'"><span class="kicker">CHAPTER '+String(c.num).padStart(2,"0")+" · "+encode(categoryOf(c))+'</span><strong>'+encode(c.title)+'</strong><p>'+encode(c.description)+'</p></a>').join("");
return '<div class="hero"><p class="eyebrow">THE CORE OF MATHEMATICS / EXAM PREPARATION</p><h1>構造で解く<br>高校数学の教科書</h1><p class="lead">チェバ・メネラウス・方べき、四面体の体積、三角関数全般、直線のなす角、最大・最小。授業問題7枚の発想を抽象化し、別の問題でも使える形にまとめた試験対策教材です。</p><div class="metrics"><div class="metric"><strong>'+chapters.length+'</strong><small>学習章</small></div><div class="metric"><strong>数Ⅱまで</strong><small>三角関数の範囲</small></div><div class="metric"><strong>例題＋演習</strong><small>解答付き</small></div></div></div>'+
'<section id="guide"><h2>この教科書の使い方</h2><p>公式だけを眺めず、各章の<strong>「使う条件」「方針の決め方」「解く手順」</strong>を先に確認してください。最初に例題を自力で考え、解説を読んだあと演習で再現できるか確認します。</p><div class="focus"><strong>全分野共通の判断手順</strong><p>① 与件を整理する → ② 求める量を決める → ③ 比・角・面積・座標・関数のどの量に変換するか選ぶ → ④ 使う公式の条件を確認する → ⑤ 端点・符号・解の個数を見直す。</p></div><p>各章末の「学習済みにする」で進捗を記録できます（このブラウザー内のみ保存）。検索からキーワードに対応する章を絞り込めます。</p><p>学習範囲は提示された試験範囲を基準とし、授業問題のアイデアを<strong>オリジナルの説明と類題</strong>で整理しています。数Ⅲの微積分・極限、指数関数の底としての \(e\) は扱いません。</p></section>'+
'<section><h2>全章の目次</h2><div class="chapter-cards">'+(cards||'<p>検索結果がありません。</p>')+'</div></section>'+
'<section><h2>間違えやすい共通ポイント</h2><div class="checklist"><strong>答案を書く前に確かめること</strong><ul><li>線分の比は内分か外分か。メネラウスで延長部分を見落としていないか。</li><li>三角形の面積比は「高さが等しい」条件を満たすか。</li><li>立体で使う「高さ」は本当に底面に垂直か。</li><li>三角関数で文字を置換したら、値域と解の対応数を確認したか。</li><li>最大・最小では端点と等号成立を調べたか。</li><li>直線のなす角では鋭角・鈍角・垂直の場合を区別したか。</li></ul></div></section>';
}
function renderChapter(c){
 const idx=chapters.indexOf(c);
 const prev=idx>0?chapters[idx-1]:null;
 const next=idx<chapters.length-1?chapters[idx+1]:null;
 const chips=(c.tags||[]).map(x=>'<span class="chip">'+encode(x)+'</span>').join("");
 return '<article class="lesson"><header class="chapter-header"><p class="eyebrow"><span class="chapter-number">CHAPTER '+String(c.num).padStart(2,"0")+'</span> / '+encode(categoryOf(c))+'</p><h1>'+encode(c.title)+'</h1><p class="lead">'+encode(c.description)+'</p><div class="chiprow">'+chips+'</div></header>'+c.html+'</article><div class="chapter-footer"><div>'+ (prev?'<a class="nav-btn" href="'+link(prev)+'">← '+encode(prev.title)+'</a>':'<a class="nav-btn" href="#guide">← 目次</a>') +'</div><button class="mark-complete" id="complete-btn" type="button" data-done="'+done.has(c.id)+'">'+(done.has(c.id)?"✓ 学習済み":"□ 学習済みにする")+'</button><div>'+(next?'<a class="nav-btn primary" href="'+link(next)+'">'+encode(next.title)+' →</a>':'<a class="nav-btn primary" href="#guide">目次へ →</a>')+'</div></div>';
}
async function typeset(){
 const mj=window.MathJax;
 if(mj&&typeof mj.typesetPromise==="function"){
   try{await mj.typesetPromise([page]);}catch(e){console.warn("Math typesetting failed",e);}
 }
}
function render(){
 const target=decodeURIComponent((location.hash||"#guide").slice(1));
 const chapter=chapters.find(c=>c.id===target);
 const current=chapter?chapter.id:"guide";
 if(window.MathJax&&typeof MathJax.typesetClear==="function"){try{MathJax.typesetClear([page]);}catch(e){}}
 page.innerHTML=chapter?renderChapter(chapter):guide();
 renderNav(current);
 document.title=(chapter?chapter.title+"｜":"")+"数学試験対策 教科書";
 if(chapter){const btn=document.getElementById("complete-btn");btn.addEventListener("click",()=>{
   if(done.has(chapter.id))done.delete(chapter.id);else done.add(chapter.id);
   try{localStorage.setItem(storage+"completed",JSON.stringify([...done]));}catch(e){}
   btn.dataset.done=done.has(chapter.id);
   btn.textContent=done.has(chapter.id)?"✓ 学習済み":"□ 学習済みにする";
   renderNav(chapter.id);
 });}
 shell.classList.remove("menu-open");
 document.getElementById("menu-toggle").setAttribute("aria-expanded","false");
 window.scrollTo({top:0,behavior:"instant"});
 typeset();
}
search.addEventListener("input",e=>{q=e.target.value.trim().toLowerCase();const target=(location.hash||"#guide").slice(1);renderNav(target);if(!chapters.some(c=>c.id===target)){page.innerHTML=guide();typeset();}});
window.addEventListener("hashchange",render);
document.getElementById("menu-toggle").addEventListener("click",()=>{const yes=shell.classList.toggle("menu-open");document.getElementById("menu-toggle").setAttribute("aria-expanded",String(yes));});
document.getElementById("theme-btn").addEventListener("click",()=>{document.body.classList.toggle("dark");try{localStorage.setItem(storage+"theme",document.body.classList.contains("dark")?"dark":"light");}catch(e){}});
document.getElementById("print-btn").addEventListener("click",()=>window.print());
nav.addEventListener("click",e=>{if(e.target.closest("a"))shell.classList.remove("menu-open");});
render();
})();