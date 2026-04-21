import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  return res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
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
