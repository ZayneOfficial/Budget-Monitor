# Budget Monitor

A small Express and MongoDB application for recording income and expenses. Express serves the browser client and the API from the same origin, and the front-end is built with React.

## Requirements

- Node.js 20.19.0 or newer
- MongoDB 6 or newer, locally or through a managed MongoDB service

## Local Setup

1. Install and run MongoDB locally, or create a database with a managed MongoDB provider.
2. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI` to the connection string for your MongoDB deployment. Keep `server/.env` private and out of version control.
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

If hosting the client on a separate origin, configure `CLIENT_ORIGIN` to that exact origin and update the client's API base path for that deployment. The default setup intentionally uses same-origin relative API URLs.

## Tests

Run the automated client filter tests with `cd server && npm test`.