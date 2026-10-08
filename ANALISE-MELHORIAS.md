# Auditoria do Sinal Público

## Escopo analisado

Foram revisados o frontend React/TypeScript, o servidor tRPC, o schema/migração Drizzle, a PWA, o fluxo de autenticação/perfil e a versão estática existente no repositório GitHub.

A validação atual passou em:

- `pnpm check`
- `pnpm test` — 6 testes
- `pnpm build`

## Correções necessárias antes de avançar

### 1. Separar claramente demonstração de autenticação real

O formulário de email/telefone e senha ainda aceita qualquer valor que passe na validação visual. O login real continua sendo Manus OAuth. A interface precisa deixar isso explícito e, para produção, o formulário deve ser conectado a um provedor de identidade real ou removido em favor do OAuth.

### 2. Não usar senha de exatamente 8 números em produção

O requisito visual foi implementado, mas oito dígitos numéricos têm baixa entropia. Para produção, usar OAuth, código temporário ou senha com pelo menos 8 caracteres variados e recuperação segura.

### 3. Persistir também o cadastro demonstrativo ou removê-lo

A persistência no banco funciona quando existe um usuário Manus autenticado. O cadastro demonstrativo ainda fica apenas no estado do navegador. É preciso escolher entre conectar o formulário a uma autenticação real ou marcar o fluxo exclusivamente como protótipo.

### 4. Evitar feedback duplicado ao salvar perfil

Quando o usuário está autenticado, o salvamento pode exibir a mensagem local e a mensagem de sucesso do servidor. Deve existir uma única fonte de feedback.

### 5. Corrigir exclusão otimista da conta

A interface volta para a home antes de confirmar que a exclusão no servidor terminou. O correto é aguardar a resposta, mostrar estado de carregamento e só limpar a sessão quando a operação for confirmada.

### 6. Atualizar o perfil completo ao iniciar a sessão

O app atualmente preenche principalmente nome e email vindos do usuário Manus. Deve consultar `auth.profile.me` ao iniciar e hidratar telefone, cidade, estado, gênero e perfil de uso do banco.

### 7. Evitar chamadas duplicadas ou obsoletas à API do IBGE

O efeito de cidades depende de tela, estado do formulário e estado do perfil. É necessário cancelar requisições antigas com `AbortController`, tratar respostas não-200 e separar o cache de cidades do cadastro e da edição.

### 8. Sincronizar as versões do app

A versão React e a versão estática em `github-site` já começaram a divergir. A versão estática raiz do GitHub também contém um fluxo antigo. Definir uma fonte principal e gerar a exportação estática a partir dela, ou documentar que são produtos separados.

### 9. Substituir ações sem comportamento

Há botões de ajuda, mensagens, histórico, “Ver tudo” e “Saiba mais” com `onClick={() => undefined}`. Eles devem abrir telas reais, diálogos acessíveis ou ser removidos até existir comportamento.

### 10. Melhorar o tratamento de erros do servidor

As rotas de perfil precisam retornar mensagens consistentes, registrar falhas sem dados sensíveis e diferenciar indisponibilidade do banco, validação e sessão expirada.

## 20 melhorias que podemos acrescentar

### Conta, identidade e perfis

1. **Tela de seleção de perfil após o cadastro** — confirmar se a pessoa é surda, intérprete ou estabelecimento e adaptar o início do app.
2. **Recuperação de acesso** — fluxo seguro por email, OAuth ou código temporário, sem exibir senhas.
3. **Verificação de email e telefone** — confirmar contatos antes de liberar recursos sensíveis.
4. **Preferências de comunicação** — Libras, texto, voz, legenda, leitura labial e idioma preferido.
5. **Sessões e dispositivos conectados** — listar sessões ativas, permitir encerrar uma sessão específica e mostrar último acesso.

### Estabelecimentos e atendimento

6. **Cadastro de estabelecimento sem CPF/CNPJ** — nome, tipo, endereço, cidade, estado, horário e serviços oferecidos.
7. **Painel do estabelecimento** — criar atendimento, gerar código de sala, chamar intérprete e acompanhar status.
8. **Fila de intérpretes** — mostrar disponíveis, ocupados, em pausa e tempo estimado de espera.
9. **Convite e aceite de atendimento** — intérprete pode aceitar, recusar ou transferir a solicitação.
10. **Status da sala em tempo real** — aguardando, intérprete solicitado, conectado, encerrado e cancelado.

### Videochamada

11. **WebRTC real** — solicitar câmera e microfone, conectar participantes e exibir estado real de conexão.
12. **Servidor de sinalização** — trocar ofertas, respostas e candidatos ICE entre pessoa surda, estabelecimento e intérprete.
13. **STUN/TURN** — permitir chamadas em redes móveis, corporativas e atrás de NAT.
14. **Layout de três participantes** — pessoa surda, estabelecimento e intérprete com foco automático no vídeo de Libras.
15. **Recursos durante a chamada** — chat, compartilhar link/código, reconectar, trocar câmera, teste de áudio e relatório técnico.

### Histórico, segurança e operação

16. **Histórico persistente** — data, duração, estabelecimento, intérprete, status e código interno da chamada.
17. **Avaliação pós-atendimento** — nota opcional, comentário e relato de problema, sem expor dados sensíveis.
18. **Consentimento e privacidade** — termos, política, consentimento de câmera/microfone e aviso sobre gravação; por padrão, não gravar.
19. **Auditoria e administração** — logs de ações, moderação, bloqueio de conta, gestão de intérpretes e métricas de atendimento.
20. **Acessibilidade e qualidade** — navegação por teclado, foco visível, leitor de tela, alto contraste, fonte ajustável, legendas, testes automatizados e monitoramento de erros.

## Ordem recomendada de execução

### Fase 1 — corrigir a base

- Hidratar o perfil real no carregamento.
- Corrigir salvamento/exclusão assíncronos.
- Resolver divergência entre React, `github-site` e raiz do GitHub.
- Remover ações sem comportamento.
- Adicionar testes de perfil e permissões.

### Fase 2 — transformar o atendimento em produto

- Criar entidades de estabelecimentos, salas, participantes, solicitações e histórico.
- Criar os três painéis por perfil.
- Implementar geração e validação de códigos de sala.
- Criar fila de intérpretes.

### Fase 3 — videochamada real

- Implementar sinalização.
- Integrar WebRTC.
- Configurar STUN/TURN.
- Adicionar reconexão e permissões de mídia.

### Fase 4 — produção

- Finalizar segurança, consentimentos, privacidade e recuperação de conta.
- Fazer auditoria de acessibilidade.
- Criar testes end-to-end.
- Publicar backend, banco e frontend com HTTPS e monitoramento.

## Decisões mantidas

- Continuar com React + TypeScript + Node.js.
- Usar o banco Drizzle/MySQL já configurado.
- Manter a experiência mobile-first e PWA.
- Não adicionar CPF ou CNPJ ao cadastro.
- Manter gênero e perfil de uso como dados de conta distintos.
