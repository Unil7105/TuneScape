
import { Song } from './types';

const BASE_SONGS: Song[] = [
  {
    id: '1',
    title: 'Midnight City',
    artist: 'M83',
    album: 'Hurry Up, We\'re Dreaming',
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 252,
    genre: 'Synthpop'
  },
  {
    id: '2',
    title: 'Starboy',
    artist: 'The Weeknd',
    album: 'Starboy',
    coverUrl: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 230,
    genre: 'R&B'
  },
  {
    id: '3',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: 203,
    genre: 'Pop'
  },
  {
    id: '4',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    coverUrl: 'https://images.unsplash.com/photo-1514525253344-933390f77914?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: 200,
    genre: 'Synth-pop'
  },
  {
    id: '5',
    title: 'Save Your Tears',
    artist: 'The Weeknd',
    album: 'After Hours',
    coverUrl: 'https://images.unsplash.com/photo-1459749411177-042180ce6742?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    duration: 215,
    genre: 'Synth-pop'
  }
];

// Create a massive cloud of 300 songs for a rich 3D environment
export const MOCK_SONGS: Song[] = Array.from({ length: 300 }, (_, i) => ({
  ...BASE_SONGS[i % BASE_SONGS.length],
  id: `song-${i}`,
  coverUrl: `https://picsum.photos/seed/aura-v2-${i}/400/400`
}));
