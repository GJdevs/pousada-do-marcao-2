/* ============================================================
   POUSADA DO MARCÃO 2 — main.js
   Funcionalidades:
   1. Navbar: muda de transparente para sólida ao rolar
   2. Botão "Falar agora": monta link do WhatsApp com nome
   3. Scroll suave para âncoras (fallback para Safari antigo)
============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ── 1. NAVBAR SCROLL ──────────────────────────────────
     Quando o usuário rolar mais de 80px,
     a navbar fica com fundo sólido verde escuro.
  ──────────────────────────────────────────────────────── */
  const navbar = document.querySelector('.navbar');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 80) {
      navbar.style.background = 'rgba(4, 52, 44, 0.97)';
      navbar.style.backdropFilter = 'blur(12px)';
    } else {
      navbar.style.background = 'rgba(0, 0, 0, 0.18)';
      navbar.style.backdropFilter = 'blur(8px)';
    }
  });


  /* ── 2. BOTÃO "FALAR AGORA" → WHATSAPP ────────────────
     Pega o nome digitado e abre o WhatsApp com mensagem
     pronta. Troque o número abaixo pelo número real.
  ──────────────────────────────────────────────────────── */
  const NUMERO_WHATSAPP = '5513998059595'; // ← troque aqui

  const btnFalar = document.querySelector('.cta-form button');
  const inputNome = document.querySelector('.cta-form input[placeholder="Seu nome"]');

  if (btnFalar) {
    btnFalar.addEventListener('click', function () {
      const nome = inputNome && inputNome.value.trim()
        ? inputNome.value.trim()
        : 'visitante';

      const mensagem = encodeURIComponent(
        'Olá! Meu nome é ' + nome + ' e gostaria de mais informações sobre hospedagem na Pousada do Marcão 2.'
      );

      window.open('https://wa.me/' + NUMERO_WHATSAPP + '?text=' + mensagem, '_blank');
    });
  }


  /* ── 3. SCROLL SUAVE (FALLBACK) ────────────────────────
     O CSS já cuida do scroll-behavior: smooth na maioria
     dos navegadores. Este trecho cobre Safari mais antigo.
  ──────────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const alvo = document.querySelector(this.getAttribute('href'));
      if (alvo) {
        e.preventDefault();
        alvo.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

});
