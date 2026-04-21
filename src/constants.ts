export const SECTION_IDS = {
  HERO: "hero",
  DISCOGRAPHY: "discography",
  VIDEOS: "videos",
  STORE: "store",
  EVENTS: "events",
  REVIEWS: "reviews",
  ABOUT: "about",
} as const;

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/drorlandoowoh",
  twitter: "https://twitter.com/drorlandoowoh",
  youtube: "https://youtube.com/@UCPd1dJab8isJwQITcmFEZnA",
  facebook: "https://facebook.com/drorlandoowoh",
  linkedin: "https://linkedin.com/in/drorlandoowoh",
} as const;

export const ARTIST_INFO = {
  name: "DR. ORLANDO OWOH",
  titles: ["Kennery", "The Fuji & Highlife Legend"],
  image: "https://i.scdn.co/image/ab6761610000e5ebab6d77b6ce349595d200f33d",
  genres: ["Fújì", "Highlife"],
} as const;

export const FALLBACK_VIDEOS = [
  { id: { videoId: "dQw4w9WgXcQ" }, snippet: { title: "Dr. Orlando Owoh - Classic Performance", thumbnails: { medium: { url: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg" } }, publishedAt: new Date().toISOString() } },
];

export const FALLBACK_EVENTS = [
  { 
    id: "fb1", 
    datetime: new Date(Date.now() + 86400000 * 30).toISOString(), 
    venue: { name: "TBA", city: "Lagos", country: "NG" },
    url: "https://open.spotify.com/artist/4JlARvQLGoU9Ri1RdZXWGm"
  }
];

export const REVIEWS = [
  { 
    text: "DR. ORLANDO OWOH IS A RARE TALENT WHOSE MUSIC TRANSCENDS BORDERS. HIS CATALOGUE IS A TIMELESS TREASURE THAT BELONGS IN EVERY COLLECTION WORLDWIDE.",
    author: "BLUE PIE RECORDS",
    rating: 5
  },
  { 
    text: "WORKING WITH DR. ORLANDO OWOH HAS BEEN AN HONOUR. HIS ARTISTRY, DEDICATION, AND PASSION FOR MUSIC IS UNMATCHED. A TRUE LEGEND OF AFRICAN SOUND.",
    author: "LJ ENTERTAINMENT",
    rating: 5
  },
  { 
    text: "DR. ORLANDO OWOH'S MUSIC NEVER GETS OLD. EVERY TRACK IS A MASTERCLASS IN STORYTELLING AND RHYTHM. THE DANCE FLOORS NEVER LIE — THIS MAN IS ICONIC.",
    author: "DJ CENTRAL CEE",
    rating: 5
  },
];
