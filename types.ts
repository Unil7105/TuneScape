
export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
  duration: number; // in seconds
  genre: string;
  youtubeId?: string; // YouTube video ID for playlist integration
}

export interface Recommendation {
  title: string;
  artist: string;
  reason: string;
}
