# Budget Monitor

A small Express and MySQL application for recording income and expenses. Express serves the browser client and the API from the same origin.

## Requirements

- Node.js 20 or newer
- MySQL 8 or a compatible managed MySQL service

## Local Setup

1. Create the database and table:

   ```bash
   mysql -u root -p < server/schema.sql
   ```

2. Create a MySQL user for the application and grant it access to `budget_monitor`. Do not use the MySQL root account for the app.
3. Copy `server/.env.example` to `server/.env` and enter the database connection values. Keep `server/.env` private and out of version control.
4. Install and start the server:

   ```bash
   cd server
   npm ci
   npm start
   ```

5. Open `http://localhost:3000`. The database-backed health check is at `http://localhost:3000/api/health`.

For development with automatic restarts, run `npm run dev` from `server/`.

## Deployment

Deploy the repository as one Node.js web service so Express can serve both `client/` and `/api`. Set the service's install command to `cd server && npm ci` and its start command to `cd server && npm start`. The server uses the hosting provider's `PORT` value automatically.

Provision a managed MySQL database separately, then configure `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `DB_PORT` as private environment variables on the web service. Set `DB_SSL=true` when the database provider requires TLS. Apply `server/schema.sql` to that database before starting the app, and allow the web service to connect through the provider's network or IP allowlist settings.

If hosting the client on a separate origin, configure `CLIENT_ORIGIN` to that exact origin and update the client's API base path for that deployment. The default setup intentionally uses same-origin relative API URLs.

## Tests

Run the automated client filter tests with `cd server && npm test`.