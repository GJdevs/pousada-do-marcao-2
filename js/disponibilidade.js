/* ============================================================
   disponibilidade.js — Pousada do Marcão 2
   v4 — adultos/crianças/bebês, pessoa extra, feriados
============================================================ */
import {
  getReservas, getTarifas, PRECOS_PADRAO, EXTRAS_PADRAO,
  getConfigSuites, sincronizarTodasSuites
} from './firebase.js';

const SUITES = [
  { id:'1', nome:'Suíte Casal',      desc:'Cama de casal + solteiro · Banheiro privativo · Ar-condicionado', link:'suite-1.html' },
  { id:'2', nome:'Suíte Standard',   desc:'Beliche + solteiros · Banheiro privativo · Ar-condicionado',      link:'suite-2.html' },
  { id:'3', nome:'Suíte Standard 2', desc:'2 camas de casal · Banheiro privativo · Ar-condicionado',         link:'suite-3.html' },
  { id:'4', nome:'Suíte Master',     desc:'Casal + solteiro · Varanda privativa · Banheiro privativo',       link:'suite-4.html' },
];
const NUM     = '5513998059595';
const BOOKING = 'https://www.booking.com/hotel/br/pousada-do-marcao-2-guaruj.pt-br.html';
const MESES   = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const MAX_POR_SUITE = 8;

/* ── Feriados nacionais ────────────────────────────────── */
const FERIADOS = {
  '01-01':'Confraternização Universal','04-21':'Tiradentes',
  '05-01':'Dia do Trabalho','09-07':'Independência do Brasil',
  '10-12':'Nossa Sra. Aparecida','11-02':'Finados',
  '11-15':'Proclamação da República','12-25':'Natal',
  '2026-02-16':'Carnaval','2026-02-17':'Carnaval','2026-02-18':'Carnaval',
  '2026-04-03':'Sexta-feira Santa','2026-04-05':'Páscoa','2026-06-11':'Corpus Christi',
  '2027-02-08':'Carnaval','2027-02-09':'Carnaval',
  '2027-03-26':'Sexta-feira Santa','2027-03-28':'Páscoa','2027-06-03':'Corpus Christi',
};
const ESPECIAIS = {
  '05-10':'Dia das Mães','06-12':'Dia dos Namorados','08-09':'Dia dos Pais',
  '10-31':'Halloween','12-24':'Véspera de Natal','12-31':'Réveillon',
};

function getDiaInfo(ds) {
  const [,m,d] = ds.split('-');
  const key = m+'-'+d;
  if(FERIADOS[ds])    return { tipo:'feriado',  nome:FERIADOS[ds] };
  if(FERIADOS[key])   return { tipo:'feriado',  nome:FERIADOS[key] };
  if(ESPECIAIS[key])  return { tipo:'especial', nome:ESPECIAIS[key] };
  return null;
}

/* ── Helpers ───────────────────────────────────────────── */
function fmt(d){ return d.toISOString().split('T')[0]; }
function fmtCurto(s){ const m=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']; const[,mo,d]=s.split('-'); return d+' '+m[parseInt(mo)-1]; }
function fmtBr(s){ if(!s)return''; const[a,m,d]=s.split('-'); return `${d}/${m}/${a}`; }
function dsMes(ano,mes,dia){ return `${ano}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`; }

function estaOcupado(RC, sid, entrada, saida){
  return RC.some(r => r.suiteId===sid && r.de<saida && r.ate>entrada);
}

function proximaDisponivel(RC, sid, entrada, saida){
  const overlap = RC.filter(r => r.suiteId===sid && r.de<saida && r.ate>entrada)
    .sort((a,b)=>a.ate.localeCompare(b.ate));
  return overlap.length ? overlap[overlap.length-1].ate : null;
}

function calcTotal(TC, sid, entrada, saida, pessoasCobravel, cfg){
  const base  = cfg ? (cfg['base_'+sid]  || PRECOS_PADRAO[sid])  : PRECOS_PADRAO[sid];
  const extra = cfg ? (cfg['extra_'+sid] || EXTRAS_PADRAO[sid])  : EXTRAS_PADRAO[sid];
  const adicionais = Math.max(0, pessoasCobravel - 2);
  let total=0, vMaxNoite=0;
  let d=new Date(entrada+'T12:00:00');
  const fim=new Date(saida+'T12:00:00');
  while(d<fim){
    const ds=fmt(d);
    const tar=TC.find(t=>t.suiteId===sid&&ds>=t.de&&ds<t.ate);
    const baseNoite = tar ? tar.valor : base;
    const v = baseNoite + (adicionais * extra);
    total+=v; if(v>vMaxNoite) vMaxNoite=v;
    d.setDate(d.getDate()+1);
  }
  return {total, vMaxNoite, base, extra, adicionais};
}

function wppMsg(nome, entrada, saida, adultos, criancas){
  const noites=Math.round((new Date(saida)-new Date(entrada))/86400000);
  const hospedesStr = adultos+' adulto'+(adultos>1?'s':'')+(criancas>0?', '+criancas+' criança'+(criancas>1?'s':''):'');
  return encodeURIComponent('Olá! Gostaria de reservar a '+nome+' de '+fmtCurto(entrada)+' a '+fmtCurto(saida)+' ('+noites+' noite'+(noites>1?'s':'')+') para '+hospedesStr+' na Pousada do Marcão 2. Podem confirmar disponibilidade?');
}

function iconeWpp(){ return `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`; }

/* ── Seletor de pessoas (adultos/crianças/bebês) ────────── */
function criarSeletorPessoas(prefixo, onChange){
  return `
    <div class="pessoas-wrap" id="${prefixo}-wrap">
      <div class="pessoas-toggle" onclick="document.getElementById('${prefixo}-drop').classList.toggle('open')">
        <span id="${prefixo}-txt">Selecione o número de hóspedes</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
      </div>
      <div class="pessoas-drop" id="${prefixo}-drop">
        <div class="pessoas-row">
          <div class="pessoas-info"><div class="pessoas-tipo">Adultos</div><div class="pessoas-sub">13+ anos</div></div>
          <div class="pessoas-ctrl">
            <button class="pessoas-btn" onclick="pesssoasAjustar('${prefixo}','ad',-1)">−</button>
            <span id="${prefixo}-adv">0</span>
            <button class="pessoas-btn" onclick="pesssoasAjustar('${prefixo}','ad',1)">+</button>
          </div>
        </div>
        <div class="pessoas-row">
          <div class="pessoas-info"><div class="pessoas-tipo">Crianças</div><div class="pessoas-sub">2–12 anos</div></div>
          <div class="pessoas-ctrl">
            <button class="pessoas-btn" onclick="pesssoasAjustar('${prefixo}','cr',-1)">−</button>
            <span id="${prefixo}-crv">0</span>
            <button class="pessoas-btn" onclick="pesssoasAjustar('${prefixo}','cr',1)">+</button>
          </div>
        </div>
        <div class="pessoas-row">
          <div class="pessoas-info"><div class="pessoas-tipo">Bebês</div><div class="pessoas-sub">Até 2 anos · Grátis</div></div>
          <div class="pessoas-ctrl">
            <button class="pessoas-btn" onclick="pesssoasAjustar('${prefixo}','be',-1)">−</button>
            <span id="${prefixo}-bev">0</span>
            <button class="pessoas-btn" onclick="pesssoasAjustar('${prefixo}','be',1)">+</button>
          </div>
        </div>
        <div class="pessoas-nota">Máximo ${MAX_POR_SUITE} pessoas por suíte (adultos + crianças)</div>
        <button class="pessoas-fechar" onclick="pesssoasFechar('${prefixo}')">Confirmar</button>
      </div>
    </div>`;
}

/* Funções globais do seletor */
window.pesssoasAjustar = function(prefixo, tipo, delta){
  const adEl  = document.getElementById(prefixo+'-adv');
  const crEl  = document.getElementById(prefixo+'-crv');
  const beEl  = document.getElementById(prefixo+'-bev');
  if(!adEl) return;
  let ad = parseInt(adEl.textContent)||0;
  let cr = parseInt(crEl.textContent)||0;
  let be = parseInt(beEl.textContent)||0;
  if(tipo==='ad') ad = Math.max(0, Math.min(8-cr, ad+delta));
  if(tipo==='cr') cr = Math.max(0, Math.min(8-ad, cr+delta));
  if(tipo==='be') be = Math.max(0, be+delta);
  adEl.textContent = ad;
  crEl.textContent = cr;
  beEl.textContent = be;
  // Atualiza texto do toggle
  const total = ad + cr;
  const txt = total === 0
    ? 'Selecione o número de hóspedes'
    : ad+(ad!==1?' adultos':' adulto')
      +(cr>0?', '+cr+(cr!==1?' crianças':' criança'):'')
      +(be>0?', '+be+(be!==1?' bebês':' bebê'):'');
  document.getElementById(prefixo+'-txt').textContent = txt;
  // Dispara evento para o index recalcular
  const wrap = document.getElementById(prefixo+'-wrap');
  if(wrap) wrap.dispatchEvent(new CustomEvent('pessoasChange', {detail:{ad,cr,be}}));
};

window.pesssoasFechar = function(prefixo){
  const drop = document.getElementById(prefixo+'-drop');
  if(drop) drop.classList.remove('open');
};

/* ── CALENDÁRIO CLICÁVEL ───────────────────────────────── */
function criarCalendario({ containerId, RC, TC, mostrarPassados, onPeriodoSelecionado }){
  const container = document.getElementById(containerId);
  if(!container) return;

  let ano = new Date().getFullYear();
  let mes = new Date().getMonth();
  let entrada = null, saida = null;
  const HOJE = fmt(new Date());

  function render(){
    container.innerHTML = `
      <div class="cal-disp">
        <div class="cal-disp-nav">
          <button class="cal-disp-btn" id="${containerId}-prev">‹</button>
          <span class="cal-disp-title">${MESES[mes]} ${ano}</span>
          <button class="cal-disp-btn" id="${containerId}-next">›</button>
        </div>
        <div class="cal-disp-header">
          <span>Dom</span><span>Seg</span><span>Ter</span>
          <span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span>
        </div>
        <div class="cal-disp-days" id="${containerId}-days"></div>
        <div class="cal-disp-info" id="${containerId}-info">Clique na data de entrada</div>
        <div class="cal-disp-legenda">
          <div class="cal-leg-item"><div class="cal-leg-dot" style="background:#E1F5EE;border:0.5px solid #5DCAA5;"></div>Disponível</div>
          <div class="cal-leg-item"><div class="cal-leg-dot" style="background:#FCEBEB;border:0.5px solid #F09595;"></div>Indisponível</div>
          <div class="cal-leg-item"><div class="cal-leg-dot" style="background:#FAEEDA;border:0.5px solid #F0C27B;"></div>Feriado</div>
          <div class="cal-leg-item"><div class="cal-leg-dot" style="background:#EEF2FF;border:0.5px solid #A5B4FC;"></div>Data especial</div>
        </div>
      </div>`;

    document.getElementById(containerId+'-prev').onclick = () => { mes--; if(mes<0){mes=11;ano--;} render(); };
    document.getElementById(containerId+'-next').onclick = () => { mes++; if(mes>11){mes=0;ano++;} render(); };

    // Verifica se tem hóspedes selecionados
    function temHospedes(){
      const adIdx = document.getElementById('idx-pessoas-adv');
      const adSv  = document.getElementById('sv-adv');
      const ad = parseInt((adIdx||adSv)?.textContent)||0;
      const cr = parseInt(document.getElementById((adIdx?'idx-pessoas':'sv')+'-crv')?.textContent)||0;
      return (ad+cr) > 0;
    }

    function piscarDropdown(){
      const toggle = document.querySelector('.pessoas-toggle');
      if(!toggle) return;
      toggle.classList.remove('piscar');
      void toggle.offsetWidth; // força reflow
      toggle.classList.add('piscar');
      setTimeout(()=>toggle.classList.remove('piscar'), 800);
      // Abre o dropdown automaticamente
      const drop = document.querySelector('.pessoas-drop');
      if(drop) drop.classList.add('open');
    }

    function atualizarBloqueio(){
      const days = document.getElementById(containerId+'-days');
      if(!days) return;
      if(!temHospedes()){
        days.classList.add('bloqueado');
      } else {
        days.classList.remove('bloqueado');
      }
    }

    // Observa mudança de hóspedes para desbloquear
    const observer = new MutationObserver(atualizarBloqueio);
    ['idx-pessoas-adv','idx-pessoas-crv','sv-adv','sv-crv'].forEach(id => {
      const el = document.getElementById(id);
      if(el) observer.observe(el, {childList:true, characterData:true, subtree:true});
    });

    const cont = document.getElementById(containerId+'-days');
    const primeiro = new Date(ano,mes,1).getDay();
    const total    = new Date(ano,mes+1,0).getDate();

    for(let i=0;i<primeiro;i++){
      const v=document.createElement('span'); v.className='cal-disp-day vazio'; cont.appendChild(v);
    }

    for(let d=1;d<=total;d++){
      const ds   = dsMes(ano,mes,d);
      const past = ds < HOJE;
      const isEnt = ds === entrada;
      const isSai = ds === saida;
      const isRng = entrada && saida && ds > entrada && ds < saida;
      const foiReservado = mostrarPassados && past && RC && RC.some(r => ds>=r.de && ds<r.ate);
      const estaReservado = !past && RC && RC.some(r => ds>=r.de && ds<r.ate);
      const diaInfo = !past ? getDiaInfo(ds) : null;

      let cls = 'cal-disp-day';
      if(past){
        cls += foiReservado ? ' passado-reservado' : ' passado';
      } else if(isEnt || isSai || isRng) {
        cls += ' sel';
      } else if(estaReservado) {
        cls += ' ocupado';
      } else if(diaInfo && diaInfo.tipo === 'feriado') {
        cls += ' feriado';
      } else if(diaInfo && diaInfo.tipo === 'especial') {
        cls += ' especial';
      } else {
        cls += ' livre';
      }

      const el = document.createElement('span');
      el.className = cls;

      if(diaInfo && !isEnt && !isSai && !isRng){
        const palavras = diaInfo.nome.split(' ');
        const tag = palavras.slice(0,2).join(' ')+(palavras.length>2?'…':'');
        el.innerHTML = '<span class="cal-day-num">'+d+'</span><span class="cal-day-tag">'+tag+'</span>';
        el.title = diaInfo.nome;
      } else {
        el.textContent = d;
      }
      if(foiReservado) el.title = 'Período reservado';

      if(!past) el.addEventListener('click', () => {
        if(!temHospedes()){
          piscarDropdown();
          return;
        }
        if(!entrada || saida){ entrada=ds; saida=null; }
        else if(ds <= entrada){ entrada=ds; saida=null; }
        else { saida=ds; }
        render();
        if(entrada && saida && onPeriodoSelecionado) onPeriodoSelecionado(entrada, saida);
        const infoEl = document.getElementById(containerId+'-info');
        if(!infoEl) return;
        if(!saida) infoEl.textContent = 'Entrada: '+fmtCurto(entrada)+' — Clique na data de saída';
        else {
          const n=Math.round((new Date(saida)-new Date(entrada))/86400000);
          infoEl.textContent = fmtCurto(entrada)+' → '+fmtCurto(saida)+' · '+n+' noite'+(n>1?'s':'');
        }
      });
      cont.appendChild(el);
    }
    // Aplica bloqueio visual após renderizar
    setTimeout(atualizarBloqueio, 0);
  }
  render();
}

/* ── CARDS DE SUÍTES ───────────────────────────────────── */
function renderCards(RC, TC, entrada, saida, adultos, criancas, containerId, cfg){
  const cont = document.getElementById(containerId);
  if(!cont) return;
  if(!entrada || !saida){
    cont.innerHTML='<div class="disp-hint">Selecione as datas no calendário acima para ver disponibilidade e preços.</div>';
    return;
  }
  const noites = Math.round((new Date(saida)-new Date(entrada))/86400000);
  const pessoasCobravel = adultos + criancas; // bebês não contam
  let livres=0;
  let html = `<div class="disp-resumo"><strong>${fmtCurto(entrada)} → ${fmtCurto(saida)}</strong> · ${noites} noite${noites>1?'s':''}</div>`;

  html += SUITES.map(s => {
    const ocup = estaOcupado(RC, s.id, entrada, saida);
    if(!ocup) livres++;
    const {total, vMaxNoite, base, extra, adicionais} = calcTotal(TC, s.id, entrada, saida, pessoasCobravel, cfg);
    const especial = vMaxNoite !== (cfg ? (cfg['base_'+s.id]||PRECOS_PADRAO[s.id]) : PRECOS_PADRAO[s.id]) + (adicionais*extra);

    const extraHtml = adicionais > 0
      ? `<div class="disp-extra-badge">+R$ ${(adicionais*extra).toLocaleString('pt-BR')}/noite (${adicionais} pessoa${adicionais>1?'s':''} extra${adicionais>1?'s':''})</div>`
      : '';

    let proxDisp = '';
    if(ocup){
      const prox = proximaDisponivel(RC, s.id, entrada, saida);
      if(prox) proxDisp = `<div class="disp-prox-disp">📅 Disponível a partir de <strong>${fmtBr(prox)}</strong></div>`;
    }

    const botoes = ocup
      ? `<span class="disp-btn-indisp">Indisponível</span>`
      : `<div class="disp-btns-row">
           <a class="disp-btn-booking" href="${BOOKING}" target="_blank">Booking.com</a>
           <a class="disp-btn-wpp" href="https://wa.me/${NUM}?text=${wppMsg(s.nome,entrada,saida,adultos,criancas)}" target="_blank">${iconeWpp()} WhatsApp</a>
         </div>`;

    return `<div class="disp-suite-card ${ocup?'ocup':'disp'}">
      <div class="disp-sc-info">
        <span class="disp-sc-tag ${ocup?'tag-o':'tag-d'}">${ocup?'Ocupado':'Disponível'}</span>
        <a href="${s.link}" class="disp-sc-nome">${s.nome}</a>
        <span class="disp-sc-desc">${s.desc}</span>
        ${proxDisp}
      </div>
      <div class="disp-sc-acao">
        ${ocup?'':`
          <div class="disp-sc-preco">Total: R$ ${total.toLocaleString('pt-BR')}</div>
          ${extraHtml}
          <div class="disp-sc-parcelas">12x de R$ ${Math.ceil(total/12).toLocaleString('pt-BR')}</div>`}
        ${botoes}
      </div>
    </div>`;
  }).join('');

  if(livres===0) html+='<div class="disp-aviso aviso-warn">Nenhuma suíte disponível neste período. Tente outras datas.</div>';
  cont.innerHTML = html;
}

/* ── PONTO DE ENTRADA: INDEX ───────────────────────────── */
export async function iniciarBuscaIndex(containerId){
  const container = document.getElementById(containerId);
  if(!container) return;
  container.innerHTML = '<div class="disp-loading">Carregando disponibilidade...</div>';
  try {
    sincronizarTodasSuites().catch(()=>{});
    const [RC, TC, cfg] = await Promise.all([getReservas(), getTarifas(), getConfigSuites()]);

    let adultos=0, criancas=0, bebes=0;
    let entradaSel=null, saidaSel=null;

    container.innerHTML = `
      <div class="disp-controles">
        ${criarSeletorPessoas('idx-pessoas', null)}
      </div>
      <div id="${containerId}-cal"></div>
      <div id="${containerId}-cards" style="margin-top:1rem;"></div>`;

    // Fecha dropdown ao clicar fora
    document.addEventListener('click', e => {
      const drop = document.getElementById('idx-pessoas-drop');
      const wrap = document.getElementById('idx-pessoas-wrap');
      if(drop && wrap && !wrap.contains(e.target)) drop.classList.remove('open');
    });

    // Atualiza quando pessoas mudam
    document.getElementById('idx-pessoas-wrap').addEventListener('pessoasChange', (e) => {
      adultos  = e.detail.ad;
      criancas = e.detail.cr;
      bebes    = e.detail.be;
      if(entradaSel && saidaSel) renderCards(RC, TC, entradaSel, saidaSel, adultos, criancas, containerId+'-cards', cfg);
    });

    renderCards(RC, TC, null, null, adultos, criancas, containerId+'-cards', cfg);
    criarCalendario({
      containerId: containerId+'-cal',
      RC, TC, mostrarPassados: false,
      onPeriodoSelecionado: (ent, sai) => {
        entradaSel=ent; saidaSel=sai;
        renderCards(RC, TC, ent, sai, adultos, criancas, containerId+'-cards', cfg);
      }
    });
  } catch(e) {
    container.innerHTML = '<div class="disp-aviso aviso-err">Erro ao carregar. Tente novamente.</div>';
  }
}

/* ── PONTO DE ENTRADA: SUITE ───────────────────────────── */
export async function iniciarVerificacaoSuite(suiteId, containerId){
  const container = document.getElementById(containerId);
  if(!container) return;
  container.innerHTML = '<div class="disp-loading">Carregando...</div>';
  try {
    const [RC, TC, cfg] = await Promise.all([getReservas(), getTarifas(), getConfigSuites()]);
    const rcSuite = RC.filter(r => r.suiteId===String(suiteId));

    container.innerHTML = `
      <div style="font-size:11px;font-weight:500;color:#0F6E56;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Selecione as datas</div>
      <div id="${containerId}-cal"></div>`;

    function calcularEAtualizar(entrada, saida){
      const ocup = estaOcupado(RC, String(suiteId), entrada, saida);
      const adultos  = parseInt(document.getElementById('sv-adv')?.textContent)||0;
      const criancas = parseInt(document.getElementById('sv-crv')?.textContent)||0;
      const pessoasCobravel = Math.max(1, adultos + criancas);
      const {total, vMaxNoite} = calcTotal(TC, String(suiteId), entrada, saida, pessoasCobravel, cfg);
      let proxDispStr = '';
      if(ocup){
        const prox = proximaDisponivel(RC, String(suiteId), entrada, saida);
        if(prox) proxDispStr = fmtBr(prox);
      }
      if(window._svCallback) window._svCallback(entrada, saida, vMaxNoite, total, ocup, proxDispStr);
    }

    // Expõe trigger para o botão verificar
    window._svTriggerCallback = calcularEAtualizar;

    criarCalendario({
      containerId: containerId+'-cal',
      RC: rcSuite, TC, mostrarPassados: true,
      onPeriodoSelecionado: (entrada, saida) => {
        calcularEAtualizar(entrada, saida);
      }
    });
  } catch(e) {
    container.innerHTML = '<div class="disp-aviso aviso-err">Erro ao carregar. Tente novamente.</div>';
  }
}