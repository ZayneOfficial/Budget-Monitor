# Budget Monitor

A small Express and MongoDB application for recording income and expenses. Express serves the browser client and the API from the same origin, and the front-end is built with React.

## Requirements

- Node.js 20.19.0 or newer
- MongoDB 6 or newer, locally or through a managed MongoDB service

## Local Setup

1. Install and run MongoDB locally, or create a database with a managed MongoDB provider.
2. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI` to the connection string for your MongoDB deployment. Keep `server/.env` private and out of version control.
   Set `SESSION_SECRET` to a private random value of at least 32 characters (for example, generate one with `openssl rand -hex 32`).
3. Install and start the server:

   ```bash
   cd server
   npm ci
   npm start
   ```

4. Open `http://localhost:3000`. The database-backed health check is at `http://localhost:3000/api/health`.

For development with automatic restarts, run `npm run dev` from `server/`.

## Deployment

Deploy the repository as one Node.js web service so Express can serve both `client/` and `/api`. Set the service's install command to `cd server && npm ci` and its start command to `cd server && npm start`. The server uses the hosting provider's `PORT` value automatically.

Provision a managed MongoDB database separately, then configure `MONGODB_URI` as a private environment variable on the web service. Ensure the service is allowed to connect through the provider's network or IP allowlist settings. The application creates its transaction collection and indexes automatically.

Users can create an account or sign in from the home page. Sessions use an HTTP-only cookie, and each transaction is only visible to its owner. Passwords are stored as scrypt hashes; never reuse or publish the session secret.

The app can be installed as a PWA from a supported browser's install option. The app shell and scripts loaded while online are cached for offline startup; account and transaction data still require a connection. Service workers require HTTPS in production (localhost is supported for development).

If hosting the client on a separate origin, configure `CLIENT_ORIGIN` to that exact origin and update the client's API base path for that deployment. The default setup intentionally uses same-origin relative API URLs.

## Tests

Run the automated client filter tests with `cd server && npm test`.