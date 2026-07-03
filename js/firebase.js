/* ============================================================
   firebase.js — Pousada do Marcão 2
   Funções: reservas, tarifas, iCal sync
============================================================ */
import { initializeApp }                    from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js';
import { getFirestore, collection, getDocs,
         addDoc, deleteDoc, setDoc, doc,
         getDoc }                            from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js';
import { getAuth, signInWithEmailAndPassword,
         signOut, onAuthStateChanged }        from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js';

const firebaseConfig = {
  apiKey:            'AIzaSyAXleS23p0UESd98A8JGvekRUGQfhDED0E',
  authDomain:        'pousada-do-marcao-2.firebaseapp.com',
  projectId:         'pousada-do-marcao-2',
  storageBucket:     'pousada-do-marcao-2.firebasestorage.app',
  messagingSenderId: '633574322592',
  appId:             '1:633574322592:web:d91da645d54a64ed8434c5'
};

const app  = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);

export const PRECOS_PADRAO = { '1': 650, '2': 880, '3': 880, '4': 900 };

export const ICAL_LINKS = {
  '1': 'https://ical.booking.com/v1/export?t=d583c20f-0ddb-4bfd-9aad-0662282bce41',
  '2': 'https://ical.booking.com/v1/export?t=8caca3a7-db0e-4dc1-9fc3-8123d0a56877',
  '3': 'https://ical.booking.com/v1/export?t=2868acb8-f098-4965-9a30-448218bb23d1',
  '4': 'https://ical.booking.com/v1/export?t=f90b7631-87c5-45e1-be3a-0cf6a67c2fbb'
};

/* ── RESERVAS ── */
export async function getReservas() {
  const snap = await getDocs(collection(db, 'reservas'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function adicionarReserva(suiteId, de, ate, obs, fonte) {
  return await addDoc(collection(db, 'reservas'), { suiteId, de, ate, obs: obs||'', fonte: fonte||'manual' });
}
export async function removerReserva(id) {
  return await deleteDoc(doc(db, 'reservas', id));
}

/* ── TARIFAS ── */
export async function getTarifas() {
  const snap = await getDocs(collection(db, 'tarifas'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function adicionarTarifa(suiteId, de, ate, valor) {
  return await addDoc(collection(db, 'tarifas'), { suiteId, de, ate, valor: Number(valor) });
}
export async function removerTarifa(id) {
  return await deleteDoc(doc(db, 'tarifas', id));
}

/* ── Calcula valor total de um período ── */
export async function calcularTotal(suiteId, entrada, saida) {
  const tarifas = await getTarifas();
  let total = 0;
  let d = new Date(entrada + 'T12:00:00');
  const fim = new Date(saida + 'T12:00:00');
  while (d < fim) {
    const ds = d.toISOString().split('T')[0];
    const esp = tarifas.find(t => t.suiteId===String(suiteId) && ds>=t.de && ds<t.ate);
    total += esp ? esp.valor : PRECOS_PADRAO[String(suiteId)];
    d.setDate(d.getDate()+1);
  }
  return total;
}

/* ── iCal Sync ── */
/* ── Proxy próprio no Cloudflare — muito mais confiável ── */
async function fetchComProxy(url) {
  const proxyUrl = `https://ical-proxy.gui-j3sus013.workers.dev/?url=${encodeURIComponent(url)}`;
  const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
  if (!resp.ok) throw new Error('Erro no proxy: ' + resp.status);
  const txt = await resp.text();
  if (!txt.includes('BEGIN:VCALENDAR')) throw new Error('Resposta inválida do iCal');
  return txt;
}

function parseIcal(txt) {
  const evs = [];
  txt.split('BEGIN:VEVENT').slice(1).forEach(b => {
    const ds = (b.match(/DTSTART[^:]*:(\d+)/)||[])[1];
    const de = (b.match(/DTEND[^:]*:(\d+)/)||[])[1];
    const sm = (b.match(/SUMMARY:(.+)/)||[])[1];
    if (ds && de) {
      evs.push({
        de:  ds.substring(0,4)+'-'+ds.substring(4,6)+'-'+ds.substring(6,8),
        ate: de.substring(0,4)+'-'+de.substring(4,6)+'-'+de.substring(6,8),
        obs: (sm||'Booking').trim()
      });
    }
  });
  return evs;
}

export async function sincronizarIcal(suiteId) {
  try {
    const txt  = await fetchComProxy(ICAL_LINKS[String(suiteId)]);
    const evs  = parseIcal(txt);
    const ress = await getReservas();
    for (const r of ress.filter(r => r.suiteId===String(suiteId) && r.fonte==='booking'))
      await removerReserva(r.id);
    for (const ev of evs)
      await adicionarReserva(String(suiteId), ev.de, ev.ate, ev.obs, 'booking');
    const ref = doc(db,'config','ical_sync');
    const conf = (await getDoc(ref)).exists() ? (await getDoc(ref)).data() : {};
    conf['suite_'+suiteId] = new Date().toISOString();
    await setDoc(ref, conf);
    return { ok: true, count: evs.length };
  } catch(e) { return { ok: false, msg: e.message }; }
}

export async function sincronizarTodasSuites() {
  const r = {};
  for (const id of ['1','2','3','4']) r[id] = await sincronizarIcal(id);
  return r;
}

export async function getUltimaSincronizacao() {
  try {
    const snap = await getDoc(doc(db,'config','ical_sync'));
    return snap.exists() ? snap.data() : {};
  } catch(e) { return {}; }
}

/* ── Configuração de preços por suíte ─────────────────── */
export const EXTRAS_PADRAO = { '1': 80, '2': 80, '3': 80, '4': 100 };

export async function getConfigSuites() {
  try {
    const snap = await getDoc(doc(db,'config','suites'));
    if (snap.exists()) return snap.data();
    return null;
  } catch(e) { return null; }
}

export async function salvarConfigSuites(config) {
  await setDoc(doc(db,'config','suites'), config);
}

export { signInWithEmailAndPassword, signOut, onAuthStateChanged };
