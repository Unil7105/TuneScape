
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
    id: string;
    title: string;
    thumbnail: string;
    channelTitle: string;
    duration: string;
}

/**
 * Parse YouTube playlist ID from various URL formats
 */
export const parsePlaylistId = (input: string): string | null => {
    // Already a playlist ID (simple alphanumeric check)
    if (/^[A-Za-z0-9_-]+$/.test(input) && input.length > 10) {
        return input;
    }

    // Try to extract from URL
    try {
        const url = new URL(input);

        // Format: ?list=PLAYLIST_ID
        const listParam = url.searchParams.get('list');
        if (listParam) return listParam;

        // Format: /playlist?list=PLAYLIST_ID
        if (url.pathname.includes('/playlist')) {
            return url.searchParams.get('list');
        }
    } catch {
        // Not a valid URL, might be just the ID
        return null;
    }

    return null;
};

/**
 * Convert ISO 8601 duration (PT1M30S) to seconds
 */
const parseDuration = (isoDuration: string): number => {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);

    return hours * 3600 + minutes * 60 + seconds;
};

/**
 * Fetch all videos from a YouTube playlist
 */
export const fetchPlaylistVideos = async (playlistId: string): Promise<YouTubeVideo[]> => {
    if (!YOUTUBE_API_KEY) {
        throw new Error('YouTube API key not configured. Please set VITE_YOUTUBE_API_KEY in .env.local');
    }

    const videos: YouTubeVideo[] = [];
    let pageToken: string | undefined;

    try {
        // Fetch playlist items (paginated)
        do {
            const playlistUrl = new URL(`${YOUTUBE_API_BASE}/playlistItems`);
            playlistUrl.searchParams.set('part', 'snippet');
            playlistUrl.searchParams.set('playlistId', playlistId);
            playlistUrl.searchParams.set('maxResults', '50');
            playlistUrl.searchParams.set('key', YOUTUBE_API_KEY);
            if (pageToken) playlistUrl.searchParams.set('pageToken', pageToken);

            const response = await fetch(playlistUrl.toString());
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Failed to fetch playlist');
            }

            const data = await response.json();

            // Extract video IDs
            const videoIds: string[] = data.items
                .filter((item: any) => item.snippet?.resourceId?.videoId)
                .map((item: any) => item.snippet.resourceId.videoId);

            // Fetch video details (for duration)
            if (videoIds.length > 0) {
                const videoDetailsUrl = new URL(`${YOUTUBE_API_BASE}/videos`);
                videoDetailsUrl.searchParams.set('part', 'contentDetails,snippet');
                videoDetailsUrl.searchParams.set('id', videoIds.join(','));
                videoDetailsUrl.searchParams.set('key', YOUTUBE_API_KEY);

                const detailsResponse = await fetch(videoDetailsUrl.toString());
                if (!detailsResponse.ok) {
                    throw new Error('Failed to fetch video details');
                }

                const detailsData = await detailsResponse.json();

                // Map to YouTubeVideo objects
                detailsData.items.forEach((video: any) => {
                    // Use direct YouTube thumbnail URL format that always exists
                    // hqdefault is 480x360 and always available
                    const thumbnailUrl = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;

                    videos.push({
                        id: video.id,
                        title: video.snippet.title,
                        thumbnail: thumbnailUrl,
                        channelTitle: video.snippet.channelTitle,
                        duration: parseDuration(video.contentDetails.duration).toString()
                    });
                });
            }

            pageToken = data.nextPageToken;
        } while (pageToken);

        return videos;
    } catch (error) {
        console.error('YouTube API Error:', error);
        throw error;
    }
};
