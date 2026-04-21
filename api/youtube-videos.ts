import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
    console.error('YouTube credentials missing');
    return res.status(503).json({ error: "Service unavailable", details: "YouTube credentials not configured" });
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=6&type=video`
    );
    const data = await response.json();
    
    if (data.error) {
      console.error('YouTube API error:', data.error);
      return res.status(response.status).json({ error: data.error.message });
    }
    
    return res.json(data.items || []);
  } catch (error) {
    console.error('YouTube fetch error:', error);
    return res.status(503).json({ error: "Service unavailable", details: String(error) });
  }
}
