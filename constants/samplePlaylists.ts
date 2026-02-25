// Sample playlists for users to try
export interface SamplePlaylist {
    id: string;
    playlistId: string;
    name: string;
    description: string;
    thumbnail: string;
    videoCount: number;
    genre: string;
    gradientColors: [string, string];
}

export const SAMPLE_PLAYLISTS: SamplePlaylist[] = [
    {
        id: 'sample-1',
        playlistId: 'PLDIoUOhQQPlXr63I_vwF9GD8sAKh77dWU',
        name: 'Lofi Hip Hop',
        description: 'Chill beats to relax and study',
        thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
        videoCount: 50,
        genre: 'Lofi',
        gradientColors: ['#667eea', '#764ba2']
    },
    {
        id: 'sample-2',
        playlistId: 'PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf',
        name: 'Pop Hits 2024',
        description: 'Top trending pop songs',
        thumbnail: 'https://i.ytimg.com/vi/kTJczUoc26U/hqdefault.jpg',
        videoCount: 100,
        genre: 'Pop',
        gradientColors: ['#f093fb', '#f5576c']
    },
    {
        id: 'sample-3',
        playlistId: 'PLhQCJTkrHOwSX8LUnIMgaTq3chP1tiTut',
        name: 'Epic Orchestral',
        description: 'Cinematic movie soundtracks',
        thumbnail: 'https://i.ytimg.com/vi/ASj81daun5Q/hqdefault.jpg',
        videoCount: 75,
        genre: 'Classical',
        gradientColors: ['#4facfe', '#00f2fe']
    },
    {
        id: 'sample-4',
        playlistId: 'PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5',
        name: 'Electronic Dance',
        description: 'High energy EDM tracks',
        thumbnail: 'https://i.ytimg.com/vi/pt8VYOfr8To/hqdefault.jpg',
        videoCount: 80,
        genre: 'EDM',
        gradientColors: ['#fa709a', '#fee140']
    },
    {
        id: 'sample-5',
        playlistId: 'PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI',
        name: 'Indie Acoustic',
        description: 'Relaxing acoustic vibes',
        thumbnail: 'https://i.ytimg.com/vi/CvFH_6DNRCY/hqdefault.jpg',
        videoCount: 60,
        genre: 'Indie',
        gradientColors: ['#a8edea', '#fed6e3']
    },
    {
        id: 'sample-6',
        playlistId: 'PL4fGSI1pDJn6O1LS0XSdF3RyO0Rq6VeTd',
        name: 'Jazz Classics',
        description: 'Smooth jazz essentials',
        thumbnail: 'https://i.ytimg.com/vi/Hrr3dp7zRQY/hqdefault.jpg',
        videoCount: 45,
        genre: 'Jazz',
        gradientColors: ['#ffecd2', '#fcb69f']
    }
];
