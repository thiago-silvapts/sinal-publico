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
- [x] **Gênero e perfil de uso no cadastro** — A criação de conta agora solicita gênero e permite indicar pessoa surda, intérprete de Libras ou estabelecimento; CPF e CNPJ não fazem parte do fluxo.
- [x] **Persistência real do perfil** — A tabela `users` recebeu telefone, cidade, estado, gênero e perfil de uso; foram criadas rotas protegidas para consultar, atualizar e excluir o perfil, com migração aplicada pelo Drizzle.
- [x] **Correções da base do perfil e IBGE** — O perfil persistido é hidratado ao iniciar a sessão, o salvamento/exclusão aguardam resposta do servidor, e as requisições de estados/cidades do IBGE validam HTTP e podem ser canceladas.
- [x] **Painel administrativo de locais** — Administradores autenticados podem cadastrar, listar, editar, ativar/desativar e excluir locais de atendimento com nome, cidade, telefone e email; CPF e CNPJ não são solicitados.
- [x] **Dois acessos administrativos** — O painel possui duas vagas por email Manus; o administrador pode adicionar ou remover cada acesso, e o login da pessoa convidada recebe a permissão `admin`.
- [x] **Tela de entrada obrigatória** — O app inicia no login/criação de conta e retorna para o login após sair ou excluir a conta; as telas de serviço ficam protegidas.
- [x] **Agendamentos** — Usuários autenticados podem criar, consultar e excluir eventos com título, data, horário e local pela aba Agenda na navegação inferior.
- [ ] **Atendimentos reais** — Criar entidades e telas de salas, fila de intérpretes, videochamada WebRTC e histórico persistente.
- [ ] **Acessibilidade e segurança de produção** — Concluir permissões de mídia, consentimentos, termos, política de privacidade, recuperação de conta, alto contraste, teclado, leitor de tela e publicação final.

## Validação

`pnpm check`, `pnpm build` e `pnpm test` foram executados com sucesso. A migração `drizzle/0001_eager_doomsday.sql` foi gerada e aplicada. A API do IBGE respondeu com os 27 estados brasileiros.
