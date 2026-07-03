# Pousada do Marcão 2 — Site Institucional

Site institucional desenvolvido para a **Pousada do Marcão 2**, localizada na Praia do Pernambuco em Guarujá, SP.

---

## 🌐 Deploy

O site está hospedado na **Cloudflare Pages** e pode ser acessado em:
> https://pousadadomarcao2.com.br/

---

## 📋 Sobre o projeto

Site completo com foco em conversão de visitantes em reservas, integrando WhatsApp Business e futuro sistema de disponibilidade em tempo real via Firebase.

### Páginas
- **index.html** — Página inicial com hero, diferenciais, suítes, galeria, localização e contato
- **suite-1.html** — Suíte Standard
- **suite-2.html** — Suíte Família
- **suite-3.html** — Suíte Dupla
- **suite-4.html** — Suíte Master
- **admin.html** — Painel administrativo (acesso restrito)

---

## 🛠️ Tecnologias utilizadas

- **HTML5** — Estrutura semântica
- **CSS3** — Estilização responsiva com variáveis CSS
- **JavaScript (ES6+)** — Interações, lightbox, galeria e integração WhatsApp
- **Firebase Firestore** — Banco de dados em tempo real para sistema de disponibilidade
- **Firebase Authentication** — Autenticação do painel administrativo
- **Google Maps** — Mapa de localização via iframe embed
- **Cloudflare Pages** — Hospedagem gratuita com CDN global

---

## 📁 Estrutura do projeto

```
pousada-do-marcao-2/
├── index.html
├── suite-1.html
├── suite-2.html
├── suite-3.html
├── suite-4.html
├── admin.html
├── css/
│   ├── style.css          # Estilos globais
│   ├── suite.css          # Estilos das páginas de suíte
│   └── disponibilidade.css # Estilos do sistema de disponibilidade
├── js/
│   ├── main.js            # Scripts globais (navbar, WhatsApp)
│   ├── suite.js           # Scripts das suítes (galeria, lightbox)
│   ├── firebase.js        # Configuração e funções do Firebase
│   └── disponibilidade.js # Lógica de verificação de datas
└── img/
    ├── pousada/           # Fotos das áreas comuns
    ├── quartos/           # Fotos das suítes (suite-1 a suite-4)
    │   ├── suite-1/
    │   ├── suite-2/
    │   ├── suite-3/
    │   └── suite-4/
    └── videos/            # Vídeos de drone
```

---

## ✨ Funcionalidades

- ✅ Layout 100% responsivo (mobile e desktop)
- ✅ Galeria de fotos com lightbox e navegação por teclado
- ✅ Vídeos de drone com player integrado na galeria
- ✅ Integração com WhatsApp com mensagens automáticas personalizadas por suíte
- ✅ Mapa de localização integrado
- ✅ SEO básico para buscas de "pousada no Guarujá"
- ✅ Painel administrativo com login para gestão de disponibilidade
- ✅ Sistema de verificação de datas em tempo real via Firebase
- ✅ Navbar com scroll suave e efeito de opacidade

---

## 🔐 Segurança

As chaves do Firebase expostas no `js/firebase.js` são seguras pois:
- As **regras do Firestore** permitem leitura pública mas escrita apenas para usuários autenticados
- O painel admin requer login via Firebase Authentication
- Nenhuma chave privada ou dado sensível está exposto no repositório

---

## 📦 Como usar localmente

Não é necessário instalar nada. Basta clonar o repositório e abrir o `index.html` no navegador:

```bash
git clone https://github.com/GJdevs/pousada-do-marcao-2.git
cd pousada-do-marcao-2
# Abra o index.html no seu navegador
```

> **Obs:** Para o sistema de disponibilidade funcionar localmente, é necessário configurar as credenciais do Firebase no `js/firebase.js`.

---

## 👨‍💻 Desenvolvido por

**Guilherme de Jesus Santos**
- GitHub: [@GJdevs](https://github.com/GJdevs)
- LinkedIn: [linkedin.com/in/guilherme-jesus](https://linkedin.com/in/guilherme-jesus)

---

## 📄 Licença

Este projeto foi desenvolvido sob contrato para uso exclusivo da Pousada do Marcão 2. Todos os direitos reservados.
