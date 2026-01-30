
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

interface YouTubePlayerProps {
    videoId: string | null;
    isPlaying: boolean;
    onReady: () => void;
    onStateChange: (state: number) => void;
    onTimeUpdate: (currentTime: number, duration: number) => void;
    onError: (error: any) => void;
}

export interface YouTubePlayerHandle {
    seekTo: (seconds: number) => void;
}

// YouTube IFrame Player API types
declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

const YouTubePlayer = forwardRef<YouTubePlayerHandle, YouTubePlayerProps>(({
    videoId,
    isPlaying,
    onReady,
    onStateChange,
    onTimeUpdate,
    onError
}, ref) => {
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [apiReady, setApiReady] = useState(false);
    const timeUpdateIntervalRef = useRef<number | null>(null);

    // Expose seekTo function via ref
    useImperativeHandle(ref, () => ({
        seekTo: (seconds: number) => {
            if (playerRef.current && playerRef.current.seekTo) {
                try {
                    playerRef.current.seekTo(seconds, true);
                } catch (error) {
                    console.error('Seek error:', error);
                }
            }
        }
    }));

    // Load YouTube IFrame API
    useEffect(() => {
        if (window.YT && window.YT.Player) {
            setApiReady(true);
            return;
        }

        // Load the IFrame Player API code asynchronously
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        // API will call this when ready
        window.onYouTubeIframeAPIReady = () => {
            setApiReady(true);
        };
    }, []);

    // Time update polling
    const startTimeUpdatePolling = () => {
        stopTimeUpdatePolling();
        timeUpdateIntervalRef.current = window.setInterval(() => {
            if (playerRef.current) {
                try {
                    const currentTime = playerRef.current.getCurrentTime();
                    const duration = playerRef.current.getDuration();
                    onTimeUpdate(currentTime, duration);
                } catch (error) {
                    console.error('Time update error:', error);
                }
            }
        }, 100); // Update every 100ms for smooth progress
    };

    const stopTimeUpdatePolling = () => {
        if (timeUpdateIntervalRef.current) {
            clearInterval(timeUpdateIntervalRef.current);
            timeUpdateIntervalRef.current = null;
        }
    };

    // Initialize player when API is ready
    useEffect(() => {
        if (!apiReady || !containerRef.current) return;

        playerRef.current = new window.YT.Player(containerRef.current, {
            height: '1',
            width: '1',
            videoId: videoId || '',
            playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                modestbranding: 1,
                playsinline: 1
            },
            events: {
                onReady: (event: any) => {
                    onReady();
                    startTimeUpdatePolling();
                },
                onStateChange: (event: any) => {
                    onStateChange(event.data);

                    if (event.data === window.YT.PlayerState.PLAYING) {
                        startTimeUpdatePolling();
                    } else {
                        stopTimeUpdatePolling();
                    }
                },
                onError: (event: any) => {
                    onError(event.data);
                }
            }
        });

        return () => {
            stopTimeUpdatePolling();
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, [apiReady]);

    // Handle video changes
    useEffect(() => {
        if (playerRef.current && videoId) {
            playerRef.current.loadVideoById(videoId);
        }
    }, [videoId]);

    // Handle play/pause
    useEffect(() => {
        if (!playerRef.current) return;

        try {
            const playerState = playerRef.current.getPlayerState();

            if (isPlaying && playerState !== window.YT.PlayerState.PLAYING) {
                playerRef.current.playVideo();
            } else if (!isPlaying && playerState === window.YT.PlayerState.PLAYING) {
                playerRef.current.pauseVideo();
            }
        } catch (error) {
            console.error('YouTube player control error:', error);
        }
    }, [isPlaying]);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                bottom: '-100px',
                left: '-100px',
                width: '1px',
                height: '1px',
                pointerEvents: 'none',
                opacity: 0
            }}
        />
    );
});

YouTubePlayer.displayName = 'YouTubePlayer';

export default YouTubePlayer;
