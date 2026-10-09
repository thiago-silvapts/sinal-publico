# Sinal Público

React / Express / tRPC / Drizzle starter, adapted from the Sandbox web-db-user template.

- `pnpm dev`: development server; honors `PORT` (default 3000).
- `pnpm build` / `pnpm start`: build and serve `dist/index.js` and `dist/public/`.
- `pnpm db:migrate`: apply checked-in migrations. `pnpm db:push`: generate and apply new schema changes.
- `pnpm check` / `pnpm test`: types and application tests.

## Executar a partir do GitHub

O repositório contém o código completo do aplicativo: frontend em `client/`, servidor em `server/`, banco e migrações em `drizzle/`, tipos compartilhados em `shared/`, além de `package.json`, `pnpm-lock.yaml`, `vite.config.ts`, `tsconfig.json` e `Dockerfile`.

```bash
pnpm install --frozen-lockfile
cp .env.example .env
# preencha DATABASE_URL e as variáveis Manus no arquivo .env
pnpm db:migrate
pnpm dev
```

Para produção:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

As variáveis de ambiente estão documentadas em `.env.example`. Os valores reais de banco, OAuth e chaves Manus não devem ser enviados ao GitHub.

Start with the Webdev skill's default-template guide. Platform login, storage, payments and service contracts live in its shared references; read the relevant capability before extending its helper.

`server/_core/publicConfig.ts` exposes only named public runtime values. Private keys stay server-side. The platform serves managed `/manus-storage/` assets; the application does not register a second proxy.

Platform configuration is readable and editable through `webdev.config`. Default settings are initial values, not enforced constraints. The agent may modify the files, commands and configuration or follow the flexible guide for another stack.
