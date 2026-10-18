const STORAGE_KEY = 'sideworks:social-recall:progress:v1';
const SETTINGS_KEY = 'sideworks:social-recall:settings:v1';
const byId = (id) => document.getElementById(id);
const state = { dataset:null, passed:{}, revealed:{}, level:1, mode:'full', chapter:'all', section:'all', from:55, to:109, storageOK:true, mobileMenu:false, expanded:new Set() };
function readStored(key,fallback) { try {const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback;}catch{return fallback;} }
function persist() {try{localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,passed:state.passed,revealed:state.revealed}));byId('save-status').textContent='このブラウザに自動保存中。端末間の同期はありません。';state.storageOK=true;}catch{byId('save-status').textContent='保存できません。ブラウザの保存設定をご確認ください。';state.storageOK=false;}}
function persistSettings() {try{localStorage.setItem(SETTINGS_KEY,JSON.stringify({level:state.level,mode:state.mode,chapter:state.chapter,section:state.section,from:state.from,to:state.to}));}catch{}}
function sections() {return state.dataset.chapters.flatMap(ch=>ch.sections.map(s=>({...s,chapterId:ch.id,chapterTitle:ch.title})));}
function filteredSections() {return sections().filter(s=>(state.chapter==='all'||s.chapterId===state.chapter)&&(state.section==='all'||s.id===state.section)&&s.pageStart<=state.to&&s.pageEnd>=state.from);}
function selectedParagraphs() {return filteredSections().flatMap(s=>s.paragraphs.filter(p=>p.page>=state.from&&p.page<=state.to));}
function selectedTokens() {return selectedParagraphs().flatMap(p=>p.tokens).filter(t=>t.answer&&t.level<=state.level);}
function updateProgress(){const tokens=selectedTokens();const total=tokens.length;const passed=tokens.filter(t=>state.passed[t.id]===true).length;const rate=total?Math.round(100*passed/total):0;byId('passed-count').textContent=passed;byId('total-count').textContent=total;byId('side-count').textContent=`${passed} / ${total} 合格`;byId('side-rate').textContent=`${rate}%`;byId('side-bar').style.width=`${rate}%`;
}
function populate(select,items,desired){select.replaceChildren();for(const [value,label] of items){const option=new Option(label,value);select.add(option);}if(items.some(([v])=>String(v)===String(desired))) select.value=desired;else select.value=items[0]?.[0]??'';}
function syncSelectors({chapterChanged=false,sectionChanged=false}={}){
 const chapters=state.dataset.chapters;
 populate(byId('chapter'),[['all','すべての章'],...chapters.map(c=>[c.id,c.title])],state.chapter);
 const eligible=sections().filter(s=>state.chapter==='all'||s.chapterId===state.chapter);
 if(chapterChanged)state.section='all';
 populate(byId('section'),[['all','すべての節'],...eligible.map(s=>[s.id,s.title])],state.section);
 if(sectionChanged)state.section=byId('section').value;
 const selected=eligible.filter(s=>state.section==='all'||s.id===state.section);
 const low=Math.min(...selected.map(s=>s.pageStart));const high=Math.max(...selected.map(s=>s.pageEnd));
 if(chapterChanged||sectionChanged){state.from=low;state.to=high;}
 state.from=Math.max(low,Math.min(state.from,high));state.to=Math.max(state.from,Math.min(state.to,high));
 const pageOptions=Array.from({length:high-low+1},(_,i)=>[String(low+i),`p.${low+i}`]);
 populate(byId('from-page'),pageOptions,String(state.from));populate(byId('to-page'),pageOptions,String(state.to));
 document.querySelectorAll('input[name="level"]').forEach(i=>{i.checked=+i.value===state.level;});
 for(const [id,on] of [['full-mode',state.mode==='full'],['weak-mode',state.mode==='weak']]){byId(id).classList.toggle('active',on);byId(id).setAttribute('aria-pressed',String(on));}
}
function appendAnswer(container, token, paragraph){
 const passed=state.passed[token.id]===true;
 // In review mode passed words are ordinary text, but can be tapped to undo the pass.
 if(state.mode==='weak'&&passed&&!state.revealed[token.id]){
  const word=document.createElement('button');word.type='button';word.className='plain-passed';word.textContent=token.answer;word.title='合格済み：タップで合格解除';word.dataset.id=token.id;word.dataset.action='unpass';word.setAttribute('aria-label',`${token.answer}、合格済み。タップで合格解除`);container.append(word);return;
 }
 const btn=document.createElement('button');btn.type='button';btn.className='blank';btn.dataset.id=token.id;btn.dataset.action='cycle';btn.setAttribute('aria-label','隠された語句。タップで答えを表示');container.append(btn);updateBlank(btn,token);
 if(token.explanation&&state.revealed[token.id])appendExplanationControl(container,token);
}
function appendExplanationControl(container,token){const b=document.createElement('button');b.type='button';b.className='explain-btn';b.dataset.action='explain';b.dataset.id=token.id;b.setAttribute('aria-expanded',String(state.expanded.has(token.id)));b.textContent=state.expanded.has(token.id)?'解説を閉じる':'解説';container.append(b);
 if(state.expanded.has(token.id)){const box=document.createElement('span');box.className='explain-box';box.dataset.explainFor=token.id;const strong=document.createElement('strong');strong.textContent=token.answer+'｜';box.append(strong,document.createTextNode(token.explanation));container.append(box);}
}
function updateBlank(btn,token){const shown=Boolean(state.revealed[token.id]);const passed=Boolean(state.passed[token.id]);btn.classList.toggle('is-open',shown);btn.classList.toggle('is-passed',shown&&passed);btn.replaceChildren();if(shown){btn.append(document.createTextNode(token.answer));if(passed){const c=document.createElement('span');c.className='check';c.textContent='✓';c.setAttribute('aria-hidden','true');btn.append(c);}}else btn.textContent='□'.repeat(Math.min(6,Math.max(3,token.answer.length)));
 btn.setAttribute('aria-label',shown?`${token.answer}、${passed?'合格済み。タップで合格解除':'未合格。タップで合格'}`:'隠された語句。タップで答えを表示');btn.setAttribute('aria-pressed',String(passed));}
let tokenById=new Map();
function render(){if(!state.dataset)return;const target=byId('article');target.replaceChildren();tokenById=new Map(selectedTokens().map(t=>[t.id,t]));const chosen=filteredSections();const included=selectedParagraphs();const total=selectedTokens().length;
 const top=document.createElement('div');top.className='article-top';const eyebrow=document.createElement('div');eyebrow.className='article-kicker';eyebrow.textContent=state.mode==='weak'?'REVIEW · NOT YET PASSED':'READING · ALL TARGETS';const range=document.createElement('span');range.className='article-range';range.textContent=`p.${state.from}–${state.to}`;top.append(eyebrow,range);target.append(top);
 const heading=document.createElement('h2');heading.className='article-heading';const levelLabel=['','基本','標準','発展'][state.level];heading.textContent=`${levelLabel}の日本史`;target.append(heading);
 if(!total||!included.length){const empty=document.createElement('div');empty.className='empty';empty.textContent='この範囲には出題できる語句がありません。ページ範囲か難易度を変更してください。';target.append(empty);updateProgress();return;}
 let number=0;
 for(const s of chosen){const paras=s.paragraphs.filter(p=>p.page>=state.from&&p.page<=state.to);if(!paras.length)continue;const section=document.createElement('section');section.className='section';section.id=`section-${s.id}`;const head=document.createElement('div');head.className='section-head';const name=document.createElement('h3');name.textContent=s.title;const pages=document.createElement('span');pages.className='page-label';pages.textContent=`p.${s.pageStart}–${s.pageEnd}`;head.append(name,pages);section.append(head);
  for(const p of paras){const para=document.createElement('p');para.className='text-paragraph';const marker=document.createElement('span');marker.className='page-marker';marker.textContent=`${p.page}`;para.append(marker);
   for(const t of p.tokens){if('text' in t){para.append(document.createTextNode(t.text));continue;}
    if(t.level>state.level){para.append(document.createTextNode(t.answer));continue;}
    appendAnswer(para,t,p);
   }section.append(para);number++;}
  target.append(section);
 }
 if(state.mode==='weak'&&selectedTokens().every(t=>state.passed[t.id])){const e=document.createElement('div');e.className='empty';e.innerHTML='<strong>この範囲はすべて合格です ✓</strong>すべての語句は通常の文章で読めます。<br>「すべて学習」で合格済みの問題にも再挑戦できます。';target.append(e);}
 updateProgress();
}
function replaceWordControl(id){const token=tokenById.get(id);if(!token)return;const btn=Array.from(byId('article').querySelectorAll('[data-action="cycle"],[data-action="unpass"]')).find(x=>x.dataset.id===id);if(!btn)return;const fragment=document.createDocumentFragment();appendAnswer(fragment,token);const next=btn.nextSibling;
 // Remove a previous explanation control and text after this target only, without rerendering the paragraph.
 let cursor=next;while(cursor instanceof HTMLElement && (cursor.dataset.id===id&&cursor.dataset.action==='explain'||cursor.dataset.explainFor===id)){const after=cursor.nextSibling;cursor.remove();cursor=after;}
 btn.replaceWith(fragment);
}
function cycle(id, unpass=false){const t=tokenById.get(id);if(!t)return;
 if(unpass){state.passed[id]=false;state.revealed[id]=true;}
 else if(!state.revealed[id]) state.revealed[id]=true;
 else state.passed[id]=!Boolean(state.passed[id]);
 state.expanded.delete(id);persist();replaceWordControl(id);updateProgress();}
function toggleExplanation(id){const t=tokenById.get(id);if(!t?.explanation||!state.revealed[id])return;if(state.expanded.has(id))state.expanded.delete(id);else state.expanded.add(id);replaceWordControl(id);}
function changeMode(next){if(state.mode===next)return;state.mode=next;for(const t of selectedTokens())state.revealed[t.id]=false;state.expanded.clear();persist();persistSettings();syncSelectors();render();}
function closeMenu(){state.mobileMenu=false;byId('sidebar').classList.remove('open');byId('overlay').hidden=true;byId('menu').setAttribute('aria-expanded','false');}
function updateSettings(){persistSettings();syncSelectors();state.expanded.clear();render();}
async function loadData(){const res=await fetch('./assets/data.json',{cache:'no-cache'});if(!res.ok)throw Error('教材データを取得できません ('+res.status+')');return res.json();}
function validate(data){if(!data?.chapters?.length)throw Error('教材データに章がありません');const ids=new Set();for(const ch of data.chapters){for(const s of ch.sections){for(const p of s.paragraphs){if(p.page<s.pageStart||p.page>s.pageEnd)throw Error('教材ページの対応が不正です: '+p.id);for(const t of p.tokens){if(!t.answer)continue;if(ids.has(t.id))throw Error('IDが重複しています: '+t.id);ids.add(t.id);if(![1,2,3].includes(t.level))throw Error('難易度が不正です');}}}}if(ids.size!==data.counts.total)throw Error('出題数が一致しません');}
function wire(){byId('article').addEventListener('click',event=>{const b=event.target.closest('button[data-action]');if(!b||!byId('article').contains(b))return;if(b.dataset.action==='cycle')cycle(b.dataset.id);else if(b.dataset.action==='unpass')cycle(b.dataset.id,true);else if(b.dataset.action==='explain')toggleExplanation(b.dataset.id);});
 byId('chapter').addEventListener('change',e=>{state.chapter=e.target.value;syncSelectors({chapterChanged:true});updateSettings();closeMenu();});
 byId('section').addEventListener('change',e=>{state.section=e.target.value;syncSelectors({sectionChanged:true});updateSettings();closeMenu();});
 byId('from-page').addEventListener('change',e=>{state.from=+e.target.value;if(state.from>state.to)state.to=state.from;updateSettings();closeMenu();});
 byId('to-page').addEventListener('change',e=>{state.to=+e.target.value;if(state.to<state.from)state.from=state.to;updateSettings();closeMenu();});
 document.querySelectorAll('input[name="level"]').forEach(r=>r.addEventListener('change',e=>{state.level=+e.target.value;updateSettings();closeMenu();}));
 byId('full-mode').addEventListener('click',()=>changeMode('full'));byId('weak-mode').addEventListener('click',()=>changeMode('weak'));
 byId('reset').addEventListener('click',()=>{byId('reset-dialog').showModal();closeMenu();});
 byId('reset-dialog').addEventListener('close',()=>{if(byId('reset-dialog').returnValue!=='confirm')return;for(const t of selectedTokens()){delete state.passed[t.id];delete state.revealed[t.id];}state.expanded.clear();persist();render();});
 byId('menu').addEventListener('click',()=>{state.mobileMenu=!state.mobileMenu;byId('sidebar').classList.toggle('open',state.mobileMenu);byId('overlay').hidden=!state.mobileMenu;byId('menu').setAttribute('aria-expanded',String(state.mobileMenu));});byId('overlay').addEventListener('click',closeMenu);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
}
async function start(){try{state.dataset=await loadData();validate(state.dataset);const saved=readStored(STORAGE_KEY,{version:1,passed:{},revealed:{}});state.passed=saved.passed&&typeof saved.passed==='object'?saved.passed:{};state.revealed=saved.revealed&&typeof saved.revealed==='object'?saved.revealed:{};const settings=readStored(SETTINGS_KEY,{});
 state.level=[1,2,3].includes(+settings.level)?+settings.level:1;state.mode=['full','weak'].includes(settings.mode)?settings.mode:'full';state.chapter=state.dataset.chapters.some(c=>c.id===settings.chapter)?settings.chapter:'all';state.section=sections().some(s=>s.id===settings.section)?settings.section:'all';state.from=Number.isInteger(+settings.from)?+settings.from:55;state.to=Number.isInteger(+settings.to)?+settings.to:109;
 syncSelectors();wire();render();}catch(error){const out=byId('article');out.replaceChildren();const box=document.createElement('div');box.className='empty';box.textContent=`教材の読み込みに失敗しました。ページを再読み込みしてください。詳細：${error.message}`;out.append(box);console.error(error);}}
start();