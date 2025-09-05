/* script.js
   Quiz application logic
*/

/* ------------------ QUESTION BANKS ------------------ */
const mcqs2015 = [
  // Placeholder: replace with full 150 Paper-2 questions
  { id: 1, question: "Who is considered the father of Political Science?", options: ["Plato","Aristotle","Machiavelli","Socrates"], answer: 1, explanation: "Aristotle is considered the father of Political Science due to his systematic treatment of constitutions in 'Politics'." }
];

const paper1_50 = [
  // Placeholder: replace with full 50 Paper-1 questions
  { id: "P1-1", question: "Principal aim of research methodology?", options: ["Methods are philosophical basis","Methodology is logic and justification","Methodology is same as methods","Methodology only data collection"], answer: 1, explanation: "Methodology reflects the rationale and justification for methods; methods are techniques." }
];

/* ------------------ DOM UTILITIES ------------------ */
function qs(s){return document.querySelector(s);}
function qsa(s){return Array.from(document.querySelectorAll(s));}
function mk(tag, attrs={}, ...children){
  const el = document.createElement(tag);
  for(const k in attrs){
    if(k==='class') el.className=attrs[k];
    else if(k==='text') el.textContent=attrs[k];
    else el.setAttribute(k, attrs[k]);
  }
  children.forEach(c=>{if(typeof c==='string') el.appendChild(document.createTextNode(c)); else if(c) el.appendChild(c);});
  return el;
}

/* ------------------ RENDER QUESTIONS ------------------ */
(function renderAll(){
  const container = qs('#question-container') || document.body;
  if(!container) return;

  const frag = document.createDocumentFragment();

  function renderSection(title, items, topicLabel){
    const header = mk('div',{class:'section-header', text:title});
    frag.appendChild(header);

    items.forEach(q=>{
      const acc = mk('div',{class:'accordion'});
      const hdr = mk('button',{class:'accordion-header',type:'button','aria-expanded':'false','aria-controls':`content-${q.id}`, text:`Q${q.id}: ${q.question}`});
      acc.appendChild(hdr);

      const content = mk('div',{class:'accordion-content',id:`content-${q.id}`});
      content.setAttribute('aria-hidden','true');
      const badge = mk('div',{class:'topic-badge', text: topicLabel || 'Topic: Advanced Political Science'});
      content.appendChild(badge);

      const optsWrap = mk('div',{class:'options-wrapper'});
      q.options.forEach((opt,i)=>{
        const btn = mk('button',{class:'option',type:'button','data-qid':q.id,'data-idx':i, text:`${String.fromCharCode(65+i)}. ${opt}`});
        optsWrap.appendChild(btn);
      });
      content.appendChild(optsWrap);

      const correctDiv = mk('div',{class:'correct-answer', text:`Correct Answer: ${String.fromCharCode(65+q.answer)}. ${q.options[q.answer]}`});
      correctDiv.style.display='none';
      content.appendChild(correctDiv);

      const expl = mk('div',{class:'explanation', text: q.explanation || ''});
      expl.style.display='none';
      content.appendChild(expl);

      acc.appendChild(content);
      frag.appendChild(acc);
    });
  }

  renderSection('UGC NET POLITICAL SCIENCE — 150 MCQs', mcqs2015, 'Advanced Political Science');
  renderSection('UGC NET PAPER-1 — 50 MCQs', paper1_50, 'Paper-1: TRA');

  container.appendChild(frag);

  /* Event delegation for accordions and options */
  container.addEventListener('click', ev=>{
    const hdr = ev.target.closest('.accordion-header');
    if(hdr){
      const acc = hdr.closest('.accordion');
      const content = acc.querySelector('.accordion-content');
      const expanded = hdr.getAttribute('aria-expanded')==='true';
      hdr.setAttribute('aria-expanded', String(!expanded));
      content.setAttribute('aria-hidden', String(expanded));
      content.style.display = expanded ? 'none' : 'block';
      return;
    }

    const opt = ev.target.closest('.option');
    if(opt){
      const qid = opt.dataset.qid;
      const idx = Number(opt.dataset.idx);
      const q = mcqs2015.find(x=>x.id==qid) || paper1_50.find(x=>x.id==qid);
      if(!q) return;

      const content = opt.closest('.accordion-content');
      const opts = Array.from(content.querySelectorAll('.option'));
      opts.forEach(b=>{ b.disabled=true; b.classList.remove('selected','correct','incorrect'); });
      opt.classList.add('selected');

      const correctIdx = q.answer;
      if(idx === correctIdx) opt.classList.add('correct');
      else {
        opt.classList.add('incorrect');
        const corr = opts.find(b=>Number(b.dataset.idx)===correctIdx);
        if(corr) corr.classList.add('correct');
      }

      const correctDiv = content.querySelector('.correct-answer'); if(correctDiv) correctDiv.style.display='block';
      const expl = content.querySelector('.explanation'); if(expl) expl.style.display='block';
    }
  });

  // collapse all initially
  qsa('.accordion-content').forEach(c=>c.style.display='none');
})();

/* ------------------ TIMER ------------------ */
(() => {
  const timerDiv = qs('#timer');
  let _interval=null, _remaining=0;

  function pad2(n){return String(n).padStart(2,'0');}
  function formatTime(s){const m=Math.floor(Math.max(0,s)/60); const se=Math.floor(Math.max(0,s)%60); return `${pad2(m)}:${pad2(se)}`}
  function update(){ if(timerDiv) timerDiv.textContent=`Time: ${formatTime(_remaining)}`;}
  function tick(){ _remaining=Math.max(0,_remaining-1); update(); if(_remaining<=0){stop(); timerDiv?.dispatchEvent(new CustomEvent('timer-ended',{bubbles:true}));} }
  function start(sec){ stop(); _remaining=sec; update(); if(_remaining>0) _interval=setInterval(tick,1000); }
  function pause(){ if(_interval){clearInterval(_interval);_interval=null;} }
  function resume(){ if(!_interval && _remaining>0) _interval=setInterval(tick,1000); }
  function stop(){ if(_interval){clearInterval(_interval);_interval=null;} _remaining=0; update(); }

  window.appTimer={start,pause,resume,stop,getRemaining:()=>_remaining};
  update();
})();

/* ------------------ CSV EXPORT ------------------ */
function exportAnswersCSV(filename='ugcnet_answers.csv'){
  const rows=[['Question Label','Selected Option','Selected Index','Correct Option','Correct Index','Explanation']];
  qsa('.accordion').forEach(acc=>{
    const qLabel = acc.querySelector('.accordion-header')?.textContent?.trim() || '';
    const content = acc.querySelector('.accordion-content');
    const selected = content?.querySelector('.option.selected');
    const correctBtn = content?.querySelector('.option.correct');
    const expl = content?.querySelector('.explanation')?.textContent?.trim() || '';
    rows.push([
      qLabel,
      selected ? selected.textContent.trim() : '',
      selected ? selected.dataset.idx : '',
      correctBtn ? correctBtn.textContent.trim() : '',
      correctBtn ? correctBtn.dataset.idx : '',
      expl
    ]);
  });
  const csv = rows.map(r=>r.map(c=>`"${(c||'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
window.exportAnswersCSV = exportAnswersCSV;

/* ------------------ RESULTS MODAL ------------------ */
function showResultsModal(){
  const accs = qsa('.accordion'); let answered=0, score=0, total=accs.length;
  accs.forEach(acc=>{
    const chosen = acc.querySelector('.option.selected');
    if(chosen){ answered++; if(chosen.classList.contains('correct')) score++; }
  });
  qs('#modal-score').textContent = score;
  qs('#modal-answered').textContent = answered;
  qs('#modal-total').textContent = total;
  const modal = qs('#result-modal');
  if(modal){ modal.style.display='flex'; modal.setAttribute('aria-hidden','false'); qs('#close-modal')?.focus(); }
}
window.showResultsModal = showResultsModal;
