import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_PORT = 3005;
const DEFAULT_HOST = process.env.CODESPACE_NAME ? "0.0.0.0" : "127.0.0.1";

function getPort() {
  const parsedPort = Number(process.env.PORT);

  if (Number.isInteger(parsedPort) && parsedPort > 0) {
    return parsedPort;
  }

  if (process.env.PORT) {
    console.warn(`Invalid PORT value "${process.env.PORT}", falling back to ${DEFAULT_PORT}`);
  }

  return DEFAULT_PORT;
}

// Validate required environment variables
function validateEnv() {
  const required = ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET', 'SPOTIFY_ARTIST_ID', 'YOUTUBE_API_KEY', 'YOUTUBE_CHANNEL_ID'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
    console.warn('Some features may not work correctly. Please check your .env file.');
  }
}

validateEnv();

async function startServer() {
  const app = express();
  const PORT = getPort();
  const HOST = process.env.HOST || DEFAULT_HOST;
  const localAppUrl = `http://localhost:${PORT}`;

  app.use(express.json());

  // Rate limiting for API endpoints
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  });

  app.use('/api/', apiLimiter);

  // SEO: robots.txt
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send(`User-agent: *
Allow: /
Sitemap: ${process.env.APP_URL || localAppUrl}/sitemap.xml`);
  });

  // SEO: sitemap.xml
  app.get("/sitemap.xml", (req, res) => {
    res.type("application/xml");
    const baseUrl = process.env.APP_URL || localAppUrl;
    const routes = ['', '/discography', '/videos', '/store', '/events', '/reviews', '/about'];
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${routes.map(route => `
  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
</urlset>`;
    res.send(sitemap);
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Spotify Integration
  let spotifyToken = "";
  let tokenExpiry = 0;

  async function getSpotifyToken() {
    if (spotifyToken && Date.now() < tokenExpiry) return spotifyToken;

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.warn("Spotify credentials missing");
      return null;
    }

    try {
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });
      const data = await response.json();
      spotifyToken = data.access_token;
      tokenExpiry = Date.now() + data.expires_in * 1000;
      return spotifyToken;
    } catch (error) {
      console.error("Error getting Spotify token:", error);
      return null;
    }
  }

  app.get("/api/spotify-artist", async (req, res) => {
    const artistId = process.env.SPOTIFY_ARTIST_ID;
    if (!artistId) return res.status(503).json({ error: "Service temporarily unavailable" });

    const token = await getSpotifyToken();
    if (!token) return res.status(503).json({ error: "Service temporarily unavailable" });

    try {
      const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Spotify API error:', error);
      res.status(503).json({ error: "Service temporarily unavailable" });
    }
  });

  app.get("/api/spotify-discography", async (req, res) => {
    const artistId = process.env.SPOTIFY_ARTIST_ID;
    if (!artistId) return res.status(503).json({ error: "Service temporarily unavailable" });

    const token = await getSpotifyToken();
    if (!token) return res.status(503).json({ error: "Service temporarily unavailable" });

    try {
      const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      res.json(data.items || []);
    } catch (error) {
      console.error('Spotify API error:', error);
      res.status(503).json({ error: "Service temporarily unavailable" });
    }
  });

  // YouTube Integration
  app.get("/api/youtube-videos", async (req, res) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const channelId = process.env.YOUTUBE_CHANNEL_ID || "UC5cIPShwLQ4ANh-5ibP_-WQ";

    if (!apiKey || !channelId) {
      return res.status(503).json({ error: "Service temporarily unavailable" });
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=6&type=video`
      );
      const data = await response.json();
      res.json(data.items || []);
    } catch (error) {
      console.error('YouTube API error:', error);
      res.status(503).json({ error: "Service temporarily unavailable" });
    }
  });

  app.get("/api/bandsintown/events", async (req, res) => {
    const appId = process.env.BANDSINTOWN_APP_ID;
    const artistName = "KULIO";

    if (!appId) {
      console.warn("Bandsintown App ID missing, returning an empty events list.");
      return res.json([]);
    }

    try {
      const response = await fetch(
        `https://rest.bandsintown.com/artists/${encodeURIComponent(artistName)}/events?app_id=${appId}`
      );
      const data = await response.json();
      res.json(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Bandsintown API error:', error);
      res.json([]);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        host: HOST,
        port: PORT,
        strictPort: true,
        middlewareMode: true,
        hmr: {
          host: HOST,
          clientPort: process.env.CODESPACE_NAME ? 443 : PORT,
          protocol: process.env.CODESPACE_NAME ? 'wss' : 'ws'
        }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`Server running on ${localAppUrl}`);
    if (HOST !== "127.0.0.1") {
      console.log(`Bound to http://${HOST}:${PORT}`);
    }
    if (process.env.CODESPACE_NAME) {
      console.log(`GitHub Codespace URL: https://${process.env.CODESPACE_NAME}-${PORT}.app.github.dev`);
    }
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Set a different PORT and try again.`);
    } else if (error.code === "EACCES" || error.code === "EPERM") {
      console.error(`Permission denied while binding ${HOST}:${PORT}. Try a different HOST/PORT or run with the required privileges.`);
    } else {
      console.error("Server failed to start:", error);
    }

    process.exit(1);
  });
}

startServer();
