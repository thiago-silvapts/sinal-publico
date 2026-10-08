# Entregas do Sinal Público

- [x] **Interface mobile-first em português do Brasil** — Entregue com aparência de aplicativo de celular, adaptação para smartphones e desktop, referência visual do `index.html` enviado e navegação inferior entre início, chamadas e conta.
- [x] **Fluxo de entrada na conta** — Entregue com tela para email ou telefone e senha, validação essencial, mostrar/ocultar senha e alternativa de login da conta Manus.
- [x] **Fluxo de criação de conta** — Entregue com tela para nome, telefone, email e senha, validação essencial, feedback de sucesso e indicação de que a autenticação própria está em modo de demonstração.
- [x] **Criação e entrada em sala** — Entregue com ação para criar uma nova chamada e campo para entrar usando código de acesso, incluindo feedback quando o código for inválido.
- [x] **Sala de videochamada** — Entregue com áreas de vídeo local e remoto, identificação do intérprete, código da sala, estado ao vivo, qualidade de conexão e indicação de proteção.
- [x] **Controles da chamada** — Entregue com alternância de microfone e câmera, indicação visual de câmera desativada e ação explícita para encerrar a chamada.
- [x] **PWA instalável** — Entregue com manifesto, ícone, service worker básico, botão de instalação quando suportado e configuração `application_owned` salva no projeto.
- [x] **Base preparada para autenticação real** — O starter Manus OAuth, banco e servidor foram preservados, sem credenciais próprias inventadas no frontend; os formulários de email/senha são o fluxo demonstrativo solicitado.
- [x] **Acesso aos serviços protegido por conta** — A tela inicial permanece pública e com aparência de celular, mas criar chamada, entrar com código e acessar chamadas exigem login ou criação de conta; visitantes recebem uma chamada clara para entrar ou criar conta.
- [x] **Perfil completo com localização IBGE** — O cadastro agora solicita nome, telefone, email, estado e cidade carregados da API oficial do IBGE, além de senha numérica com exatamente 8 dígitos.
- [x] **Gerenciamento da conta** — Usuário autenticado pode abrir Minha conta, alterar nome, telefone, email, estado e cidade, salvar alterações, sair e solicitar exclusão da conta com confirmação.

## Validação

`pnpm check`, `pnpm build` e `pnpm test` foram executados com sucesso. O preview respondeu em `http://127.0.0.1:3000`, e `/manifest.webmanifest`, `/sw.js` e `/manus-routes.json` retornaram HTTP 200. A API do IBGE respondeu com os 27 estados brasileiros.
