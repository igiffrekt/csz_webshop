# Project: CSZ Webshop

## Deployment — igifftest.cc (production)

When the user says "push to igifftest.cc" or "deploy", do the following **without asking**:

1. Commit and push to GitHub (`origin`, branch `csz-webshop-sanity`)
2. SSH into the server and pull + build + copy static assets:
   ```
   ssh -p 22 igifftes1@152.53.66.114 "source ~/.nvm/nvm.sh && cd /var/www/edbef45c-7559-49a9-b9fb-333699368e6a/public_html && git pull origin csz-webshop-sanity && pnpm install --frozen-lockfile && pnpm --filter web build && cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/static && cp -r apps/web/public apps/web/.next/standalone/apps/web/public"
   ```
3. Tell the user to **restart Node.js** from their hosting panel (this is a manual step they handle themselves)

**IMPORTANT**: The app runs via Next.js standalone mode (`server.js`). After every build, you MUST copy `static/` and `public/` into the standalone directory or assets will 404.

- SSH: `ssh -p 22 igifftes1@152.53.66.114`
- Repo path on server: `/var/www/edbef45c-7559-49a9-b9fb-333699368e6a/public_html/`
- Node/pnpm available via `source ~/.nvm/nvm.sh`
- Live site: https://igifftest.cc
- Sanity Studio: https://csz.sanity.studio/

## Staging — csz.wedopixels.hu

- SSH: `wedopixe1@152.53.66.114`
- Same server, different account

## Tech Stack

- Monorepo (pnpm workspaces): `apps/web` (Next.js 16), `apps/studio` (Sanity), `packages/types`
- Branch: `csz-webshop-sanity`
- Language: Hungarian (UI text in Hungarian)
