/* script.js
   UGC NET Political Science Quiz
   Features:
   - 150 Paper-2 MCQs + 50 Paper-1 MCQs
   - Accordion UI
   - Option selection, correct/incorrect marking, explanations
   - Timer (start/pause/resume/stop)
   - CSV export
   - Modal summary
   - Keyboard navigation
*/

/* ------------------ QUESTION BANKS ------------------ */
// REPLACE the placeholders below with actual questions

const mcqs2015 = [
  {
    id: 1,
    question: "Who is considered the father of Political Science?",
    options: ["Plato", "Aristotle", "Machiavelli", "Socrates"],
    answer: 1,
    explanation: "Aristotle (384–322 BCE) systematically analyzed constitutions in Politics; his empirical approach established political inquiry."
  },
  // ... add remaining 149 Paper-2 questions here ...
];

const paper1_50 = [
  {
    id: "P1-1",
    question: "Which of the following best describes research methodology?",
    options: [
      "Methods are the philosophical basis; methodology is just tools",
      "Methodology concerns the logic and justification of procedures while methods are techniques",
      "Methodology is identical to methods",
      "Methodology refers only to data collection"
    ],
    answer: 1,
    explanation: "Methodology reflects the epistemological rationale; methods are operational techniques."
  },
  // ... add remaining 49 Paper-1 questions here ...
];

/* ------------------ DOM UTILITIES ------------------ */
function qs(selector) { return document.querySelector(selector); }
function qsa(selector) { return Array.from(document.querySelectorAll(selector)); }
function mk(tag, attrs={}, ...children) {
  const el = document.createElement(tag);
  for(const k in attrs){
    if(k==='class') el.className = attrs[k];
    else if(k==='text') el.textContent = attrs[k];
    else el.setAttribute(k, attrs[k]);
  }
  children.forEach(c => {
    if(typeof c==='string') el.appendChild(document.createTextNode(c));
    else if(c) el.appendChild(c);
  });
  return el;
}

/* ------------------ RENDER QUIZ ------------------ */
(function renderQuiz(){
  const container = qs('#question-container') || qs('.container') || document.body;
  if(!container) return;

  const frag = document.createDocumentFragment();

  function renderSection(title, items, topicLabel){
    const header = mk('div',{class:'section-header', text:title});
    frag.appendChild(header);

    items.forEach(q => {
      const acc = mk('div',{class:'accordion'});
      const hdr = mk('button',{
        class:'accordion-header',
        type:'button',
        'aria-expanded':'false',
        'aria-controls':`content-${String(q.id).replace(/\s+/g,'')}`,
        text:`Q${q.id}: ${q.question}`
      });
      acc.appendChild(hdr);

      const content = mk('div',{class:'accordion-content', id:`content-${String(q.id).replace(/\s+/g,'')}`});
      content.setAttribute('aria-hidden','true');
      const badge = mk('div',{class:'topic-badge', text: topicLabel || 'Topic: Advanced Political Science'});
      content.appendChild(badge);

      const optsWrap = mk('div',{class:'options-wrapper'});
      q.options.forEach((opt,i)=>{
        const btn = mk('button',{
          class:'option',
          type:'button',
          'data-qid':q.id,
          'data-idx':i,
          text:`${String.fromCharCode(65+i)}. ${opt}`
        });
        optsWrap.appendChild(btn);
      });
      content.appendChild(optsWrap);

      const correctDiv = mk('div',{
        class:'correct-answer',
        text:`Correct Answer: ${String.fromCharCode(65+q.answer)}. ${q.options[q.answer]}`
      });
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

  // Event delegation for accordions and options
  container.addEventListener('click',(ev)=>{
    const hdr = ev.target.closest('.accordion-header');
    if(hdr){
      const acc = hdr.closest('.accordion');
      const content = acc.querySelector('.accordion-content');
      const expanded = hdr.getAttribute('aria-expanded')==='true';
      hdr.setAttribute('aria-expanded',String(!expanded));
      content.setAttribute('aria-hidden',String(expanded));
      content.style.display = expanded ? 'none':'block';
      return;
    }

    const opt = ev.target.closest('.option');
    if(opt){
      const qid = opt.getAttribute('data-qid');
      const idx = Number(opt.getAttribute('data-idx'));
      const q = mcqs2015.find(x=>String(x.id)===String(qid)) || paper1_50.find(x=>String(x.id)===String(qid));
      if(!q) return;
      const content = opt.closest('.accordion-content');
      const opts = Array.from(content.querySelectorAll('.option'));
      opts.forEach(b=>{ b.disabled=true; b.classList.remove('selected','correct','incorrect'); });
      opt.classList.add('selected');
      const correctIdx = q.answer;
      if(idx===correctIdx) opt.classList.add('correct');
      else {
        opt.classList.add('incorrect');
        const corr = opts.find(b=>Number(b.getAttribute('data-idx'))===correctIdx);
        if(corr) corr.classList.add('correct');
      }
      content.querySelector('.correct-answer').style.display='block';
      content.querySelector('.explanation').style.display='block';
    }
  });

  // collapse all initially
  qsa('.accordion-content').forEach(c=>c.style.display='none');
})();

/* ------------------ TIMER MODULE ------------------ */
(() => {
  const timerDiv = qs('#timer') || qs('.timer');
  let _intervalId=null,_remaining=0;
  function pad2(n){return String(n).padStart(2,'0');}
  function formatTime(s){return `${pad2(Math.floor(s/60))}:${pad2(s%60)}`;}
  function update(){ if(timerDiv) timerDiv.textContent=`Time: ${formatTime(_remaining)}`; }
  function tick(){ _remaining=Math.max(0,_remaining-1); update(); if(_remaining<=0) stop(); }
  function start(sec){ stop(); _remaining=Number(sec)||0; update(); if(_remaining>0) _intervalId=setInterval(tick,1000); }
  function pause(){ if(_intervalId){ clearInterval(_intervalId); _intervalId=null; } }
  function resume(){ if(!_intervalId && _remaining>0) _intervalId=setInterval(tick,1000); }
  function stop(){ if(_intervalId){ clearInterval(_intervalId); _intervalId=null; } _remaining=0; update(); }
  window.appTimer={start,pause,resume,stop,getRemaining:()=>_remaining};
  update();
})();

/* ------------------ EXPORT & RESULTS ------------------ */
function exportAnswersCSV(filename='ugcnet_answers.csv'){
  const rows=[['Question Label','Selected Option','Selected Index','Correct Option','Correct Index','Explanation']];
  qsa('.accordion').forEach(acc=>{
    const qLabel = acc.querySelector('.accordion-header')?.textContent||'';
    const content = acc.querySelector('.accordion-content');
    const selected = content.querySelector('.option.selected');
    const correctBtn = content.querySelector('.option.correct');
    const expl = content.querySelector('.explanation')?.textContent||'';
    rows.push([
      qLabel,
      selected?.textContent||'',
      selected?.getAttribute('data-idx')||'',
      correctBtn?.textContent||'',
      correctBtn?.getAttribute('data-idx')||'',
      expl
    ]);
  });
  const csv = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv],{type:'text/csv'}); 
  const a = document.createElement('a'); 
  a.href = URL.createObjectURL(blob); 
  a.download=filename; 
  document.body.appendChild(a); a.click(); a.remove();
}

function showResultsModal(){
  let answered=0,score=0,total=qsa('.accordion').length;
  qsa('.accordion').forEach(acc=>{
    const sel = acc.querySelector('.option.selected');
    if(sel){ answered++; if(sel.classList.contains('correct')) score++; }
  });
  const modal = qs('#result-modal'); if(!modal) return;
  qs('#modal-answered').textContent=answered;
  qs('#modal-score').textContent=score;
  qs('#modal-total').textContent=total;
  modal.style.display='flex';
}

/* Expose for external buttons */
window.exportAnswersCSV = exportAnswersCSV;
window.showResultsModal = showResultsModal;
