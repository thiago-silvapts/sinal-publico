# Sinal Público — versão estática para GitHub Pages

Esta pasta contém uma versão independente do protótipo, sem Node, React ou servidor. Ela pode ser publicada diretamente como um site estático no GitHub Pages, Netlify ou Cloudflare Pages.

## Arquivos

- `index.html` — entrada da aplicação.
- `styles.css` — layout mobile-first e estilos responsivos.
- `app.js` — navegação, login/cadastro demonstrativo, sala e controles.
- `manifest.webmanifest`, `sw.js` e `pwa-icon.svg` — suporte PWA.

## Publicar no GitHub Pages

1. Copie o conteúdo desta pasta para a raiz de um repositório GitHub.
2. Faça commit e push para a branch `main`.
3. Em **Settings → Pages**, selecione **Deploy from a branch**, branch `main` e pasta `/root`.
4. Abra a URL gerada pelo GitHub Pages.

O login por email/senha e a sala de chamada nesta versão são demonstrativos. Para autenticação real, banco de usuários e WebRTC entre dispositivos, mantenha também o projeto principal React/Express e publique o backend separadamente.
