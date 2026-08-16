// ---------- tabs ----------
  function goTab(id){
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('panel-' + id).classList.add('active');
    document.querySelector('.tab-btn[data-tab="' + id + '"]').classList.add('active');
    window.scrollTo({top:0, behavior:'smooth'});
  }
  document.querySelectorAll('.tab-btn').forEach(btn=>{
    btn.addEventListener('click', ()=> goTab(btn.dataset.tab));
  });

  const answers = {};

  // ---------- build NPS scale (P6) ----------
  const npsWrap = document.getElementById('nps-p6');
  for(let i=0;i<=10;i++){
    const b = document.createElement('button');
    b.type='button'; b.className='nps-btn'; b.textContent=i;
    b.addEventListener('click', ()=>{
      npsWrap.querySelectorAll('.nps-btn').forEach(x=>x.classList.remove('sel'));
      b.classList.add('sel');
      answers.p6 = i;
      updateProgress();
    });
    npsWrap.appendChild(b);
  }

  // ---------- build matrix rows (P7) ----------
  const scaleCols = 5;
  document.querySelectorAll('.matrix-row').forEach(row=>{
    const name = 'p7_' + row.dataset.row;
    for(let i=1;i<=scaleCols;i++){
      const td = document.createElement('td');
      const input = document.createElement('input');
      input.type='radio'; input.name=name; input.value=i;
      input.addEventListener('change', ()=>{ answers[name]=i; updateProgress(); });
      td.appendChild(input);
      row.appendChild(td);
    }
  });

  // ---------- build chip groups (P4, P5, P8) ----------
  document.querySelectorAll('.chip-row').forEach(wrap=>{
    const qId = wrap.closest('.q').dataset.q;
    const opts = JSON.parse(wrap.dataset.options);
    opts.forEach(opt=>{
      const c = document.createElement('button');
      c.type='button'; c.className='chip'; c.textContent=opt;
      c.addEventListener('click', ()=>{
        wrap.querySelectorAll('.chip').forEach(x=>x.classList.remove('sel','grad'));
        c.classList.add('sel');
        answers[qId] = opt;
        if(qId === 'p4'){
          const cond = document.getElementById('p4-conditional');
          cond.style.display = (opt !== 'No alcancé a producir nada') ? 'block' : 'none';
        }
        updateProgress();
      });
      wrap.appendChild(c);
    });
  });

  document.getElementById('p4-detail').addEventListener('input', (e)=>{ answers.p4_detail = e.target.value; });

  // ---------- checkboxes (P10) ----------
  const p10Contact = ['Una segunda sesión técnica para construir automatizaciones en vivo','Que revisen un proceso de mi empresa (diagnóstico sin costo)','Recibir plantillas y tips por correo'];
  document.querySelectorAll('#checkbox-p10 .checkbox-item input[type=checkbox]').forEach(cb=>{
    cb.addEventListener('change', ()=>{
      cb.closest('.checkbox-item').classList.toggle('sel', cb.checked);
      const checked = Array.from(document.querySelectorAll('#checkbox-p10 input[type=checkbox]:checked')).map(x=>x.value);
      answers.p10 = checked.join('; ');
      const showContact = checked.some(v => p10Contact.includes(v));
      document.getElementById('p10-conditional').style.display = showContact ? 'block' : 'none';
      updateProgress();
    });
  });
  ['p10-nombre','p10-empresa','p10-contacto'].forEach(id=>{
    document.getElementById(id).addEventListener('input', (e)=>{ answers[id] = e.target.value; });
  });

  // ---------- open textareas (P1, P2, P3, P9) ----------
  const openIds = ['p1','p2','p3','p9'];
  openIds.forEach(id=>{
    const ta = document.querySelector('.q[data-q="'+id+'"] textarea');
    ta.addEventListener('input', ()=>{ answers[id] = ta.value; updateProgress(); });
  });

  // ---------- progress ----------
  function countTotal(){
    // p1,p2,p3 (3) + p4 (1) + p5 (1) + p6 (1) + p7 rows (6) + p8 (1) + p9 (1) + p10 (1) = 15
    return 3 + 1 + 1 + 1 + 6 + 1 + 1 + 1;
  }
  function countFilled(){
    let n = 0;
    openIds.forEach(k=>{ if(answers[k] && answers[k].trim().length>0) n++; });
    if(answers.p4) n++;
    if(answers.p5) n++;
    if(answers.p6 !== undefined) n++;
    ['claridad','demos','cuaderno','balance','instalaciones','logistica'].forEach(k=>{ if(answers['p7_'+k]) n++; });
    if(answers.p8) n++;
    if(answers.p10 && answers.p10.length>0) n++;
    return n;
  }
  function updateProgress(){
    const pct = Math.round((countFilled() / countTotal()) * 100);
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progressPct').textContent = pct + '%';
  }

  // ---------- submit ----------
  document.getElementById('evalForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    document.getElementById('evalForm').style.display = 'none';
    document.getElementById('thanksPanel').classList.add('show');
    window.scrollTo({top:0, behavior:'smooth'});
  });

  function resetForm(){
    document.getElementById('thanksPanel').classList.remove('show');
    document.getElementById('evalForm').style.display = 'block';
    document.getElementById('evalForm').reset();
    document.querySelectorAll('.nps-btn.sel, .chip.sel').forEach(x=>x.classList.remove('sel','grad'));
    document.querySelectorAll('.checkbox-item.sel').forEach(x=>x.classList.remove('sel'));
    document.getElementById('p4-conditional').style.display = 'none';
    document.getElementById('p10-conditional').style.display = 'none';
    for(const k in answers) delete answers[k];
    updateProgress();
  }

  function downloadResponses(){
    let out = 'EVALUACIÓN · TALLER DE IA APLICADA A LOS NEGOCIOS (COPARMEX)\n';
    out += 'Generado: ' + new Date().toLocaleString('es-MX') + '\n';
    out += '='.repeat(60) + '\n\n';

    const v = (k) => (answers[k] !== undefined && answers[k] !== '' ? answers[k] : '(sin respuesta)');

    out += 'SECCIÓN 1 · QUÉ TE LLEVAS\n\n';
    out += 'P1 — Información que nunca subirían a una IA pública\n' + v('p1') + '\n\n';
    out += 'P2 — Respuesta ante "la IA ya me dio el dato, lo mando así"\n' + v('p2') + '\n\n';
    out += 'P3 — Diferencia entre usar la IA a mano y automatizar\n' + v('p3') + '\n\n';

    out += 'SECCIÓN 2 · QUÉ PRODUJISTE\n\n';
    out += 'P4 — ¿Te llevas algo hecho hoy?\n' + v('p4');
    if(answers.p4_detail) out += ' → ' + answers.p4_detail;
    out += '\n\n';
    out += 'P5 — Actividad que más sirvió\n' + v('p5') + '\n\n';

    out += 'SECCIÓN 3 · CÓMO ESTUVO\n\n';
    out += 'P6 — Recomendación (NPS 0-10)\n' + v('p6') + '\n\n';
    out += 'P7 — Matriz de satisfacción\n';
    const matrixLabels = {claridad:'Claridad del instructor', demos:'Utilidad de las demos', cuaderno:'Cuaderno digital', balance:'Balance teoría/práctica', instalaciones:'Instalaciones y proyección', logistica:'Organización y logística'};
    Object.keys(matrixLabels).forEach(k=>{ out += '  · ' + matrixLabels[k] + ': ' + v('p7_'+k) + '/5\n'; });
    out += '\n';
    out += 'P8 — Ritmo de la sesión\n' + v('p8') + '\n\n';

    out += 'SECCIÓN 4 · QUÉ SIGUE\n\n';
    out += 'P9 — Qué le cambiarían al taller\n' + v('p9') + '\n\n';
    out += 'P10 — Interés después del taller\n' + v('p10') + '\n';
    if(answers['p10-nombre'] || answers['p10-empresa'] || answers['p10-contacto']){
      out += '  Contacto: ' + (answers['p10-nombre']||'') + ' · ' + (answers['p10-empresa']||'') + ' · ' + (answers['p10-contacto']||'') + '\n';
    }

    const blob = new Blob([out], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'evaluacion-taller-ia-coparmex.txt';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  updateProgress();
