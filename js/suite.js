/* ============================================================
   POUSADA DO MARCÃO 2 — suite.js
   Funcionalidades das páginas de suíte:
   1. Troca de foto principal ao clicar nas thumbs
   2. Lightbox (ampliar foto)
   3. Navegação por teclado no lightbox
   4. Botão WhatsApp com mensagem personalizada
============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  const fotos = window.SUITE_FOTOS || [];
  let fotoAtual = 0;

  /* ── 1. TROCA DE FOTO PRINCIPAL ────────────────────── */
  const imgPrincipal = document.getElementById('foto-principal');
  const thumbs = document.querySelectorAll('.thumb');

  thumbs.forEach(function (thumb, i) {
    thumb.addEventListener('click', function () {
      fotoAtual = i;
      imgPrincipal.src = fotos[i];
      thumbs.forEach(function (t) { t.classList.remove('ativa'); });
      thumb.classList.add('ativa');
    });
  });

  /* ── 2. LIGHTBOX ────────────────────────────────────── */
  const lightbox     = document.getElementById('lightbox');
  const lightboxImg  = document.getElementById('lightbox-img');

  function abrirLightbox (index) {
    fotoAtual = index;
    lightboxImg.src = fotos[index];
    lightbox.classList.add('aberto');
    document.body.style.overflow = 'hidden';
  }

  function fecharLightbox () {
    lightbox.classList.remove('aberto');
    document.body.style.overflow = '';
  }

  function navLightbox (direcao) {
    fotoAtual = (fotoAtual + direcao + fotos.length) % fotos.length;
    lightboxImg.src = fotos[fotoAtual];
    thumbs.forEach(function (t, i) {
      t.classList.toggle('ativa', i === fotoAtual);
    });
    imgPrincipal.src = fotos[fotoAtual];
  }

  if (imgPrincipal) {
    imgPrincipal.style.cursor = 'zoom-in';
    imgPrincipal.addEventListener('click', function () {
      abrirLightbox(fotoAtual);
    });
  }

  const btnFechar = document.getElementById('lightbox-fechar');
  const btnPrev   = document.getElementById('lightbox-prev');
  const btnNext   = document.getElementById('lightbox-next');

  if (btnFechar) btnFechar.addEventListener('click', fecharLightbox);
  if (btnPrev)   btnPrev.addEventListener('click', function () { navLightbox(-1); });
  if (btnNext)   btnNext.addEventListener('click', function () { navLightbox(1); });

  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) fecharLightbox();
    });
  }

  /* ── 3. TECLADO ─────────────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    if (!lightbox || !lightbox.classList.contains('aberto')) return;
    if (e.key === 'Escape')      fecharLightbox();
    if (e.key === 'ArrowLeft')   navLightbox(-1);
    if (e.key === 'ArrowRight')  navLightbox(1);
  });

  /* ── 4. BOTÃO WHATSAPP ──────────────────────────────── */
  const NUMERO = '5513998059595'; // ← troque pelo número real
  const nomeSuite = document.title.split('·')[0].trim();

  const btnWpp = document.getElementById('btn-whatsapp');
  if (btnWpp) {
    btnWpp.addEventListener('click', function () {
      const msg = encodeURIComponent(
        'Olá! Tenho interesse em reservar a ' + nomeSuite +
        ' na Pousada do Marcão 2. Pode me passar mais informações?'
      );
      window.open('https://wa.me/' + NUMERO + '?text=' + msg, '_blank');
    });
  }

  /* ── 5. NAVBAR SCROLL (igual ao main.js) ────────────── */
  const navbar = document.querySelector('.navbar');
  if (navbar && !navbar.classList.contains('navbar-dark')) {
    window.addEventListener('scroll', function () {
      navbar.style.background = window.scrollY > 80
        ? 'rgba(4, 52, 44, 0.97)'
        : 'rgba(0, 0, 0, 0.18)';
    });
  }

});
