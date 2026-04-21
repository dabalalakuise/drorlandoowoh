import { useState, useEffect } from "react";
import { FALLBACK_VIDEOS } from "./constants";

export function useSpotifyArtist() {
  const [artist, setArtist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/spotify-artist");
        const data = await res.json();
        
        if (data && !data.error) {
          setArtist(data);
        } else {
          setError(data.error || "Failed to load artist profile");
        }
      } catch (e) {
        console.error("Failed to load artist profile:", e);
        setError("Failed to load artist profile");
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, []);

  return { artist, loading, error };
}

export function useSpotifyDiscography() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/spotify-discography");
        const data = await res.json();
        if (Array.isArray(data)) {
          setAlbums(data);
        } else {
          setError("Invalid discography data");
        }
      } catch (e) {
        console.error("Failed to load albums:", e);
        setError("Failed to load albums");
      } finally {
        setLoading(false);
      }
    };
    fetchAlbums();
  }, []);

  return { albums, loading, error };
}

export function useBandsintownEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/bandsintown/events");
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load events:", e);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return { events, loading };
}

export function useYouTubeVideos() {
  const [videos, setVideos] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/youtube-videos");
      const data = await res.json();
      
      if (Array.isArray(data) && data.length > 0) {
        setVideos(data);
        setActiveVideo(data[0].id.videoId);
      } else {
        setVideos(FALLBACK_VIDEOS);
        setActiveVideo(FALLBACK_VIDEOS[0].id.videoId);
      }
    } catch (e) {
      console.error("YouTube fetch error:", e);
      setVideos(FALLBACK_VIDEOS);
      setActiveVideo(FALLBACK_VIDEOS[0].id.videoId);
      setError("API Connection Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return { videos, activeVideo, setActiveVideo, loading, error, retry: fetchVideos };
}