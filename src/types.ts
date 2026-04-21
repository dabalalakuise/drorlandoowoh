export interface SpotifyAlbum {
  id: string;
  name: string;
  album_type: string;
  release_date: string;
  images: { url: string }[];
  external_urls: { spotify: string };
}

export interface YouTubeVideo {
  id: { videoId: string };
  snippet: {
    title: string;
    thumbnails: { medium: { url: string } };
    publishedAt: string;
  };
}

export interface BandsintownEvent {
  id: string;
  datetime: string;
  venue: {
    name: string;
    city: string;
    country: string;
  };
  url: string;
}

export interface LoadingState {
  albums: boolean;
  videos: boolean;
  events: boolean;
}
