/* Social Recall · notebook collection. The textbook app and its storage are untouched. */
'use strict';
const STORAGE_KEY='sideworks:social-recall:notes:progress:v1';
const SETTINGS_KEY='sideworks:social-recall:notes:settings:v1';
const $=id=>document.getElementById(id);
const state={data:null,passed:{},revealed:{},expanded:new Set(),level:1,mode:'full',chapter:'all',section:'all',from:20,to:35,mobileMenu:false,showPassed:false};
let tokenIndex=new Map();
function saved(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function writeProgress(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,passed:state.passed,revealed:state.revealed}));$('save-status').textContent='ノートの学習状況をこの端末に保存しました。';}catch{$('save-status').textContent='保存できません。ブラウザの設定を確認してください。';}}
function writeSettings(){try{localStorage.setItem(SETTINGS_KEY,JSON.stringify({level:state.level,mode:state.mode,chapter:state.chapter,section:state.section,from:state.from,to:state.to,showPassed:state.showPassed}))}catch{}}
function sections(){return state.data.chapters.flatMap(ch=>ch.sections.map(s=>({...s,chapterId:ch.id})));}
function visibleSections(){return sections().filter(s=>(state.chapter==='all'||s.chapterId===state.chapter)&&(state.section==='all'||s.id===state.section)&&s.pageStart<=state.to&&s.pageEnd>=state.from)}
function visibleParagraphs(){return visibleSections().flatMap(s=>s.paragraphs.filter(p=>p.page>=state.from&&p.page<=state.to))}
function visibleTokens(){return visibleParagraphs().flatMap(p=>p.tokens).filter(t=>t.answer&&t.level<=state.level)}
function populate(el,items,preferred){el.replaceChildren();for(const [v,label] of items)el.add(new Option(label,v));el.value=items.some(([v])=>String(v)===String(preferred))?preferred:items[0]?.[0]??''}
function syncControls({chapterChanged=false,sectionChanged=false}={}){
 const chs=state.data.chapters;
 populate($('chapter'),[['all','すべての章'],...chs.map(ch=>[ch.id,ch.title])],state.chapter);
 if(chapterChanged)state.section='all';
 const candidates=sections().filter(s=>state.chapter==='all'||s.chapterId===state.chapter);
 populate($('section'),[['all','すべての節'],...candidates.map(s=>[s.id,s.title])],state.section);
 if(sectionChanged)state.section=$('section').value;
 const selected=candidates.filter(s=>state.section==='all'||s.id===state.section);
 if(!selected.length)return;
 const lo=Math.min(...selected.map(s=>s.pageStart)),hi=Math.max(...selected.map(s=>s.pageEnd));
 if(chapterChanged||sectionChanged){state.from=lo;state.to=hi;}
 state.from=Math.max(lo,Math.min(state.from,hi));state.to=Math.max(state.from,Math.min(state.to,hi));
 const pages=Array.from({length:hi-lo+1},(_,i)=>[String(lo+i),`p.${lo+i}`]);
 populate($('from-page'),pages,String(state.from));populate($('to-page'),pages,String(state.to));
 $('show-passed').checked=state.showPassed;
 document.querySelectorAll('input[name="level"]').forEach(el=>el.checked=+el.value===state.level);
 for(const [id,value] of [['full-mode',state.mode==='full'],['weak-mode',state.mode==='weak']]){$(id).classList.toggle('active',value);$(id).setAttribute('aria-pressed',String(value));}
}
function updateProgress(){
 const tokens=visibleTokens(),total=tokens.length,passed=tokens.filter(t=>state.passed[t.id]===true).length;
 $('passed-count').textContent=passed;$('total-count').textContent=total;$('remaining-count').textContent=total-passed;
 $('side-count').textContent=`${passed} 合格 / ${total-passed} 未合格`;
 const rate=total?Math.round(100*passed/total):0;$('side-rate').textContent=`${rate}%`;$('side-bar').style.width=`${rate}%`;
}
function createAnswer(t){
 const passed=state.passed[t.id]===true;
 if(state.mode==='weak'&&passed){
  const w=document.createElement('button');w.type='button';w.className='plain-passed';w.dataset.id=t.id;w.dataset.action='unpass';w.textContent=t.answer;w.title='合格解除する';w.setAttribute('aria-label',`${t.answer} 合格済み。タップで合格解除`);return w;
 }
 const b=document.createElement('button');b.type='button';b.className='blank';b.dataset.id=t.id;b.dataset.action='cycle';const open=state.revealed[t.id]===true||(state.showPassed&&passed);
 b.classList.toggle('is-open',open);b.classList.toggle('is-passed',open&&passed);
 b.textContent=open?t.answer:'□'.repeat(Math.min(6,Math.max(3,[...t.answer].length)));
 b.setAttribute('aria-pressed',String(passed));b.setAttribute('aria-label',open?`${t.answer} ${passed?'合格済み、タップで合格解除':'未合格、タップで合格'}`:'隠された語句、タップで答えを表示');return b;
}
function appendTarget(parent,t){const container=document.createElement('span');container.className='answer-unit';container.dataset.unit=t.id;container.append(createAnswer(t));
 if(t.explanation&&(state.revealed[t.id]||(state.showPassed&&state.passed[t.id]))){
  const b=document.createElement('button');b.className='explain-btn';b.type='button';b.dataset.id=t.id;b.dataset.action='explain';b.setAttribute('aria-expanded',String(state.expanded.has(t.id)));b.textContent=state.expanded.has(t.id)?'解説を閉じる':'解説';container.append(b);
  if(state.expanded.has(t.id)){const note=document.createElement('span');note.className='explain-box';note.append(document.createTextNode(t.answer+'｜'+t.explanation));container.append(note);}
 }parent.append(container);
}
function render(){if(!state.data)return;
 const target=$('article');target.replaceChildren();const secs=visibleSections(),paragraphs=visibleParagraphs(),tokens=visibleTokens();tokenIndex=new Map(tokens.map(t=>[t.id,t]));
 const top=document.createElement('div');top.className='article-top';const a=document.createElement('span');a.className='article-kicker';a.textContent=state.mode==='weak'?'REVIEW · NOTEBOOK':'READING · NOTEBOOK';const range=document.createElement('span');range.className='article-range';range.textContent=`ノート p.${state.from}–${state.to}`;top.append(a,range);target.append(top);
 const h=document.createElement('h2');h.className='article-heading';h.textContent=state.level===1?'LEVEL 1 · 穴埋め':'LEVEL 2 · 穴埋め＋下線';target.append(h);
 if(!paragraphs.length){const msg=document.createElement('p');msg.className='empty';msg.textContent='この範囲には学習文がありません。';target.append(msg);updateProgress();return;}
 for(const s of secs){const paras=s.paragraphs.filter(p=>p.page>=state.from&&p.page<=state.to);if(!paras.length)continue;
  const section=document.createElement('section');section.className='section';section.id='section-'+s.id;const head=document.createElement('div');head.className='section-head';const title=document.createElement('h3');title.textContent=s.title;const page=document.createElement('span');page.className='page-label';page.textContent=`p.${s.pageStart}`;head.append(title,page);section.append(head);
  for(const p of paras){const para=document.createElement('p');para.className='text-paragraph';const label=document.createElement('span');label.className='page-marker';label.textContent=p.page;para.append(label);
   for(const t of p.tokens){if('text' in t)para.append(document.createTextNode(t.text));else if(t.level>state.level)para.append(document.createTextNode(t.answer));else appendTarget(para,t)}section.append(para);}
  target.append(section);
 }
 if(state.mode==='weak'&&tokens.length&&tokens.every(t=>state.passed[t.id])){
  const done=document.createElement('div');done.className='empty';const strong=document.createElement('strong');strong.textContent='この範囲はすべて合格です';done.append(strong,document.createTextNode('次に復習するときも、合格した語句は通常の文章として表示されます。'));target.append(done);
 }
 updateProgress();
}
function refreshUnit(id){const unit=[...$('article').querySelectorAll('.answer-unit')].find(x=>x.dataset.unit===id);if(!unit)return;const replacement=document.createDocumentFragment();appendTarget(replacement,tokenIndex.get(id));const hadFocus=unit.contains(document.activeElement);unit.replaceWith(replacement);if(hadFocus){const match=[...$('article').querySelectorAll('.answer-unit')].find(x=>x.dataset.unit===id);match?.querySelector('button')?.focus({preventScroll:true});}}
function cycle(id,unpass=false){if(!tokenIndex.has(id))return;
 if(unpass){state.passed[id]=false;state.revealed[id]=true;}
 else if(state.revealed[id]!==true&&!(state.showPassed&&state.passed[id])){state.revealed[id]=true;}
 else{state.passed[id]=!Boolean(state.passed[id]);state.revealed[id]=true;}
 state.expanded.delete(id);writeProgress();refreshUnit(id);updateProgress();}
function explain(id){const t=tokenIndex.get(id);if(!t?.explanation||!(state.revealed[id]||(state.showPassed&&state.passed[id])))return;state.expanded.has(id)?state.expanded.delete(id):state.expanded.add(id);refreshUnit(id)}
function closeMenu(){state.mobileMenu=false;$('sidebar').classList.remove('open');$('overlay').hidden=true;$('menu').setAttribute('aria-expanded','false')}
function updateSettings(){writeSettings();syncControls();state.expanded.clear();render()}
function selectMode(mode){if(state.mode===mode)return;state.mode=mode;for(const t of visibleTokens())delete state.revealed[t.id];state.expanded.clear();writeProgress();updateSettings()}
function wire(){
 $('article').addEventListener('click',event=>{const b=event.target.closest('button[data-action]');if(!b||!$('article').contains(b))return;const a=b.dataset.action;if(a==='cycle')cycle(b.dataset.id);else if(a==='unpass')cycle(b.dataset.id,true);else if(a==='explain')explain(b.dataset.id)});
 $('chapter').addEventListener('change',event=>{state.chapter=event.target.value;syncControls({chapterChanged:true});updateSettings();closeMenu()});
 $('section').addEventListener('change',event=>{state.section=event.target.value;syncControls({sectionChanged:true});updateSettings();closeMenu()});
 $('from-page').addEventListener('change',event=>{state.from=+event.target.value;if(state.from>state.to)state.to=state.from;updateSettings();closeMenu()});
 $('to-page').addEventListener('change',event=>{state.to=+event.target.value;if(state.to<state.from)state.from=state.to;updateSettings();closeMenu()});
 document.querySelectorAll('input[name="level"]').forEach(el=>el.addEventListener('change',event=>{state.level=+event.target.value;updateSettings();closeMenu()}));
 $('full-mode').addEventListener('click',()=>selectMode('full'));$('weak-mode').addEventListener('click',()=>selectMode('weak'));
 $('show-passed').addEventListener('change',event=>{state.showPassed=event.target.checked;state.expanded.clear();writeSettings();if(state.mode==='full'){const y=window.scrollY;render();window.scrollTo(0,y);}});
 $('reset').addEventListener('click',()=>{$('reset-dialog').showModal();closeMenu()});
 $('reset-dialog').addEventListener('close',()=>{if($('reset-dialog').returnValue!=='confirm')return;for(const p of visibleParagraphs())for(const t of p.tokens)if(t.answer){delete state.passed[t.id];delete state.revealed[t.id]};state.expanded.clear();writeProgress();render()});
 $('menu').addEventListener('click',()=>{state.mobileMenu=!state.mobileMenu;$('sidebar').classList.toggle('open',state.mobileMenu);$('overlay').hidden=!state.mobileMenu;$('menu').setAttribute('aria-expanded',String(state.mobileMenu))});
 $('overlay').addEventListener('click',closeMenu);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
}
function validate(data){if(!data?.chapters?.length)throw Error('ノートの章データがありません');const ids=new Set();let count=0;for(const ch of data.chapters)for(const s of ch.sections)for(const p of s.paragraphs){if(p.page<s.pageStart||p.page>s.pageEnd)throw Error('ページ指定の不一致: '+p.id);for(const t of p.tokens)if(t.answer){if(ids.has(t.id))throw Error('IDが重複: '+t.id);if(![1,2].includes(t.level))throw Error('難易度指定の不一致: '+t.id);ids.add(t.id);count++}}if(count!==data.counts.total)throw Error('問題数の不一致')}
async function start(){try{
 const res=await fetch('./assets/note-data.json');if(!res.ok)throw Error('教材データを取得できません (HTTP '+res.status+')');state.data=await res.json();validate(state.data);
 const progress=saved(STORAGE_KEY,{});state.passed=progress.passed&&typeof progress.passed==='object'?progress.passed:{};state.revealed=progress.revealed&&typeof progress.revealed==='object'?progress.revealed:{};
 const settings=saved(SETTINGS_KEY,{});state.level=[1,2].includes(+settings.level)?+settings.level:1;state.mode=['full','weak'].includes(settings.mode)?settings.mode:'full';state.showPassed=settings.showPassed===true;state.chapter=state.data.chapters.some(c=>c.id===settings.chapter)?settings.chapter:'all';state.section=sections().some(s=>s.id===settings.section)?settings.section:'all';state.from=Number.isInteger(settings.from)?settings.from:20;state.to=Number.isInteger(settings.to)?settings.to:35;
 syncControls();wire();render();
 }catch(e){$('article').textContent='ノート教材を読み込めませんでした。'+e.message;console.error(e);}}
start();