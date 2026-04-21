import type { VercelRequest, VercelResponse } from '@vercel/node';

async function getSpotifyToken(): Promise<{ token: string | null; error?: string }> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) return { token: null, error: 'Missing credentials' };

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const data = await response.json();
    if (data.error) return { token: null, error: `Spotify: ${data.error} - ${data.error_description}` };
    return { token: data.access_token };
  } catch (e) {
    return { token: null, error: `Token fetch exception: ${String(e)}` };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const artistId = process.env.SPOTIFY_ARTIST_ID;
  if (!artistId) return res.status(503).json({ error: 'Missing SPOTIFY_ARTIST_ID' });

  const { token, error: tokenError } = await getSpotifyToken();
  if (!token) return res.status(503).json({ error: tokenError });

  try {
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (data.error) return res.status(response.status).json({ error: data.error.message });
    return res.json(data);
  } catch (error) {
    return res.status(503).json({ error: `Artist fetch failed: ${String(error)}` });
  }
}
