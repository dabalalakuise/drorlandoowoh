import type { VercelRequest, VercelResponse } from '@vercel/node';

async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

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
  if (data.error) {
    console.error('Spotify token error:', data);
    return null;
  }
  return data.access_token as string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const artistId = process.env.SPOTIFY_ARTIST_ID;
  if (!artistId) return res.status(503).json({ error: 'Service unavailable' });

  const token = await getSpotifyToken();
  if (!token) return res.status(503).json({ error: 'Token fetch failed', clientId: !!process.env.SPOTIFY_CLIENT_ID, secret: !!process.env.SPOTIFY_CLIENT_SECRET });

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&limit=20&market=US`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await response.json();
    if (data.error) return res.status(response.status).json({ error: data.error.message, status: data.error.status });
    return res.json(data.items || []);
  } catch (error) {
    return res.status(503).json({ error: 'Fetch failed', details: String(error) });
  }
}
