# Plano — Sinal Público

## Escopo

Criar um protótipo web responsivo, inspirado no `index.html` fornecido, para conectar pessoas surdas a estabelecimentos públicos e privados em videochamadas com apoio de intérprete. O fluxo deve parecer um app de celular, funcionar em desktop e oferecer instalação como PWA.

## Abordagem de implementação

- **Frontend:** React + TypeScript no starter web-db-user já inicializado.
- **Autenticação:** preservar Manus OAuth e o hook `useAuth` do starter para login real. O app não cria um sistema paralelo de senha própria: a senha de 8 dígitos permanece como requisito visual do fluxo solicitado, enquanto a sessão real usa o OAuth seguro da plataforma.
- **Perfil persistente:** ampliar a tabela `users` com telefone, cidade, estado, gênero e perfil de uso (`deaf_person`, `interpreter` ou `establishment`), sem CPF ou CNPJ. Atualização e exclusão usam procedimentos protegidos no servidor.
- **Experiência de chamada:** estado navegável de sala com código, vídeo local/remoto simulados visualmente, presença do intérprete, controles de microfone/câmera e encerramento. A integração WebRTC real fica preparada como próxima camada, sem fingir que uma chamada está conectada.
- **PWA:** manifesto próprio, ícone SVG, service worker básico e botão de instalação quando o navegador disponibilizar `beforeinstallprompt`.
- **Dados:** o banco e a autenticação do starter permanecem disponíveis para conectar usuários, salas e histórico em uma iteração seguinte.

## Design

- **Movimento:** Mobile editorial / quiet technology — uma interface de serviço público acolhedora, com composição de cartões empilhados e uma moldura de celular no desktop.
- **Princípios:** acessibilidade visual, confiança explícita, foco em uma ação por vez e linguagem humana.
- **Filosofia de cor:** azul-marinho profundo cria segurança para a moldura do produto; turquesa é a cor proprietária da conexão e da Libras; fundos verde-gelo mantêm longas sessões confortáveis; coral só aparece para estados de atenção e encerramento.
- **Paradigma de layout:** app-shell vertical com cabeçalho compacto, conteúdo em fluxo e navegação inferior fixa; no desktop, a moldura fica em uma superfície ampla, sem virar um dashboard em grade.
- **Elementos assinatura:** marca circular com gesto de mãos, pílulas de status com ponto vivo e cartões com bordas suaves e uma linha lateral turquesa.
- **Interação:** cada toque produz resposta visual imediata; formulários mostram o próximo passo sem sobrecarregar; controles de chamada têm rótulo e ícone, não dependem só de cor.
- **Animação:** entrada suave de telas, pulso discreto no status ao vivo e microescala nos botões; sem movimento contínuo que distraia durante a interpretação.
- **Tipografia:** Plus Jakarta Sans para títulos e Inter/System UI para leitura; títulos curtos e densos, labels pequenos e com contraste alto.
- **Essência:** tecnologia de atendimento que coloca a comunicação em primeiro lugar — acessível, confiável, próxima.
- **Voz:** direta, acolhedora e sem jargão. Exemplos: “A comunicação começa aqui.” / “Seu intérprete já está a caminho.”
- **Marca:** wordmark “Sinal Público” acompanhado por um círculo com duas formas abstratas de mãos se encontrando.
- **Cor proprietária:** `#0F766E`, o verde-petróleo que sinaliza conexão, presença e confiança.

## Estrutura

- `client/src/App.tsx`: shell do app, autenticação de demonstração, painel, sala e estados de interação.
- `client/src/index.css`: sistema visual mobile-first, moldura de app, chamada e estados responsivos.
- `client/index.html`: metadados em português, manifest e título.
- `client/public/manifest.webmanifest`: metadados instaláveis do PWA.
- `client/public/sw.js`: cache mínimo e fallback offline do shell.
- `client/public/pwa-icon.svg`: ícone da marca usado no PWA.
- `public/manus-routes.json`: manifesto de rotas exigido pelo Webdev.
- `server/`: backend e autenticação Manus preservados para evolução real de usuários, perfis, salas, fila e histórico.
- `drizzle/`: schema e migrações do banco para perfis e futuras entidades de atendimento.
