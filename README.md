# LavaStock Frontend

React and TypeScript product manager. All product and authentication requests go through the LavaLust API; the browser never connects to MySQL.

## Local setup

1. Copy `.env.example` to `.env.local` and set `VITE_API_BASE_URL` to the LavaLust API origin/base path.
2. Install dependencies with `npm install`.
3. Start the app with `npm run dev`.

The default API base is `http://localhost/Lab_6/Lava_Back_End/public`. Change it if your Laragon virtual host, port, or public path differs. In the Render Docker image, `public/` is the document root, so use the deployed API root URL without `/public`. Set the backend `FRONTEND_ORIGIN` to the exact frontend origin.

## Production deployment

Build with `npm run build` and publish the generated `dist/` directory to Render Static Sites. The `render.yaml` file is a blueprint for this frontend project. Set `VITE_API_BASE_URL` to the deployed LavaLust API URL in Render, then redeploy.

## Authentication

Access and refresh tokens stay in `sessionStorage`, expired access tokens refresh through `/api/auth/refresh`, and sign out revokes the refresh token. Use HTTPS in production.