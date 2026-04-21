import type { VercelRequest, VercelResponse } from '@vercel/node';

let spotifyToken = "";
let tokenExpiry = 0;

async function getSpotifyToken() {
  if (spotifyToken && Date.now() < tokenExpiry) return spotifyToken;

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Spotify credentials missing:', { clientId: !!clientId, clientSecret: !!clientSecret });
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
    if (data.error) {
      console.error('Spotify token error:', data);
      return null;
    }
    spotifyToken = data.access_token;
    tokenExpiry = Date.now() + data.expires_in * 1000;
    return spotifyToken;
  } catch (error) {
    console.error('Spotify token fetch error:', error);
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { path } = req.query;

  if (path && path[0] === 'spotify-artist') {
    const artistId = process.env.SPOTIFY_ARTIST_ID;
    if (!artistId) {
      console.error('Spotify Artist ID missing');
      return res.status(503).json({ error: "Service unavailable", details: "Artist ID not configured" });
    }

    const token = await getSpotifyToken();
    if (!token) {
      console.error('Failed to get Spotify token');
      return res.status(503).json({ error: "Service unavailable", details: "Authentication failed" });
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.error) {
        return res.status(response.status).json({ error: data.error.message });
      }
      return res.json(data);
    } catch (error) {
      return res.status(503).json({ error: "Service unavailable", details: String(error) });
    }
  }

  if (path && path[0] === 'spotify-discography') {
    const artistId = process.env.SPOTIFY_ARTIST_ID;
    if (!artistId) {
      console.error('Spotify Artist ID missing');
      return res.status(503).json({ error: "Service unavailable", details: "Artist ID not configured" });
    }

    const token = await getSpotifyToken();
    if (!token) {
      console.error('Failed to get Spotify token');
      return res.status(503).json({ error: "Service unavailable", details: "Authentication failed" });
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.error) {
        console.error('Spotify API error:', data.error);
        return res.status(response.status).json({ error: data.error.message });
      }
      return res.json(data.items || []);
    } catch (error) {
      console.error('Spotify fetch error:', error);
      return res.status(503).json({ error: "Service unavailable", details: String(error) });
    }
  }

  if (path && path[0] === 'youtube-videos') {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const channelId = process.env.YOUTUBE_CHANNEL_ID || "UC5cIPShwLQ4ANh-5ibP_-WQ";

    if (!apiKey || !channelId) {
      console.error('YouTube credentials missing:', { apiKey: !!apiKey, channelId: !!channelId });
      return res.status(503).json({ error: "Service unavailable", details: "YouTube credentials not configured" });
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=6&type=video`
      );
      const data = await response.json();
      
      if (data.error) {
        // Enhanced logging for Vercel Function Logs
        console.error(`[YouTube API Error] Status: ${response.status}`, {
          message: data.error.message,
          reason: data.error.errors?.[0]?.reason || 'unknown',
          domain: data.error.errors?.[0]?.domain
        });
        return res.status(response.status).json({ error: data.error.message, details: data.error });
      }
      
      return res.json(data.items || []);
    } catch (error) {
      console.error('YouTube fetch error:', error);
      return res.status(503).json({ error: "Service unavailable", details: String(error) });
    }
  }

  if (path && (path[0] === 'bandsintown-events' || (path[0] === 'bandsintown' && path[1] === 'events'))) {
    const appId = process.env.BANDSINTOWN_APP_ID;
    const artistName = "KULIO";

    if (!appId) {
      console.warn('Bandsintown App ID missing, returning an empty events list.');
      return res.json([]);
    }

    try {
      const response = await fetch(
        `https://rest.bandsintown.com/artists/${encodeURIComponent(artistName)}/events?app_id=${appId}`
      );
      const data = await response.json();
      return res.json(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Bandsintown fetch error:', error);
      return res.json([]);
    }
  }

  // Health check endpoint
  if (path && path[0] === 'health') {
    return res.json({ 
      status: 'ok',
      env: {
        hasSpotifyClientId: !!process.env.SPOTIFY_CLIENT_ID,
        hasSpotifyClientSecret: !!process.env.SPOTIFY_CLIENT_SECRET,
        hasSpotifyArtistId: !!process.env.SPOTIFY_ARTIST_ID,
        hasYoutubeApiKey: !!process.env.YOUTUBE_API_KEY,
        hasYoutubeChannelId: !!process.env.YOUTUBE_CHANNEL_ID,
        hasBandsintownAppId: !!process.env.BANDSINTOWN_APP_ID
      }
    });
  }

  return res.status(404).json({ error: "Not found" });
}
