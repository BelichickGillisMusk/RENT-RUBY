# Rent-Ruby

Rent-Ruby is a full-stack React/Vite and Express app for the Ruby Street tenant
portal and property management dashboard. It is not a static-only SPA: the UI
calls same-origin `/api/*` routes served by `server.ts`.

## Run locally

**Prerequisites:** Node.js 22+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY`.
3. Start the development server:
   ```bash
   npm run dev
   ```

## Production

Build the frontend and start the Express server:

```bash
npm run build
npm start
```

The production server serves `dist/` and the API from the same Node process.
Use these environment variables in production:

- `GEMINI_API_KEY` - required for Gemini-powered features.
- `PORT` - injected automatically by hosts such as Cloud Run.
- `APP_URL` - public app URL, for example `https://rent-ruby.com`.
- `DATABASE_PATH` - optional SQLite path. For durable production data, point
  this at a mounted volume or migrate the data layer to a managed database.

## Cloud Run deployment

This repo includes a `Dockerfile` compatible with Cloud Run.

```bash
gcloud run deploy rent-ruby \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars APP_URL=https://rent-ruby.com,DATABASE_PATH=/data/rentroll_v3.db \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

After the service is healthy, map the custom domain in Cloud Run:

```bash
gcloud run domain-mappings create \
  --service rent-ruby \
  --domain rent-ruby.com \
  --region us-central1
```

Then add the DNS records returned by Google Cloud for the domain. If the domain
is actually `rent-rubyl.com`, use that value for `APP_URL` and the domain
mapping instead.

## Deployment notes

- Static hosts such as basic Firebase Hosting, Netlify static deploys, or
  Cloudflare Pages without a Node backend will not serve the API routes.
- The bundled SQLite database is suitable for demos and single-container
  launches. Production data should use a mounted volume or managed database.
- View the original AI Studio applet at
  https://ai.studio/apps/85f4144f-dabc-4ffc-b990-b6a65dc46dad.
