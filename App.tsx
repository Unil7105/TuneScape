
import React, { useState, useRef, useEffect } from 'react';
import { Song, Recommendation } from './types';
import { getSongRecommendations } from './services/geminiService';
import { fetchPlaylistVideos } from './services/youtubeService';
import MusicSpace from './components/MusicSpace';
import YouTubePlayer from './components/YouTubePlayer';
import PlaylistInput from './components/PlaylistInput';

const App: React.FC = () => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Song[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAiOracle, setShowAiOracle] = useState(false);
  const [showControlsHint, setShowControlsHint] = useState(true);
  const [showPlaylistInput, setShowPlaylistInput] = useState(true);
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false);
  const [playlistError, setPlaylistError] = useState<string | null>(null);

  const youtubePlayerRef = useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowControlsHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (youtubePlayerRef.current && youtubePlayerRef.current.seekTo) {
      youtubePlayerRef.current.seekTo(time);
      setCurrentTime(time);
    }
  };

  const loadPlaylist = async (playlistId: string) => {
    setIsLoadingPlaylist(true);
    setPlaylistError(null);

    try {
      const videos = await fetchPlaylistVideos(playlistId);

      if (videos.length === 0) {
        throw new Error('No videos found in playlist');
      }

      const songs: Song[] = videos.map((video) => ({
        id: `yt-${video.id}`,
        title: video.title,
        artist: video.channelTitle,
        album: 'YouTube Playlist',
        coverUrl: video.thumbnail,
        audioUrl: '', // Not used for YouTube
        duration: parseInt(video.duration),
        genre: 'Various',
        youtubeId: video.id
      }));

      setQueue(songs);
      setCurrentSong(songs[0]);
      setShowPlaylistInput(false);
    } catch (error: any) {
      setPlaylistError(error.message || 'Failed to load playlist');
    } finally {
      setIsLoadingPlaylist(false);
    }
  };

  const playSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const skipTrack = (direction: 'next' | 'prev') => {
    const currentIndex = queue.findIndex(s => s.id === currentSong?.id);
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % queue.length;
    } else {
      nextIndex = (currentIndex - 1 + queue.length) % queue.length;
    }
    playSong(queue[nextIndex]);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchAiRecommendations = async () => {
    if (!searchQuery) return;
    setIsAiLoading(true);
    const results = await getSongRecommendations(searchQuery);
    setRecommendations(results);
    setIsAiLoading(false);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden no-select bg-white">
      {/* YouTube Player (hidden) */}
      {currentSong?.youtubeId && (
        <YouTubePlayer
          ref={youtubePlayerRef}
          videoId={currentSong.youtubeId}
          isPlaying={isPlaying}
          onReady={() => console.log('YouTube player ready')}
          onStateChange={(state) => {
            // YT.PlayerState: UNSTARTED=-1, ENDED=0, PLAYING=1, PAUSED=2, BUFFERING=3, CUED=5
            if (state === 0) skipTrack('next'); // Auto-play next on end
          }}
          onTimeUpdate={(current, dur) => {
            setCurrentTime(current);
            setDuration(dur);
          }}
          onError={(error) => console.error('YouTube player error:', error)}
        />
      )}

      {/* Playlist Input Modal */}
      {showPlaylistInput && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm">
          <PlaylistInput
            onLoadPlaylist={loadPlaylist}
            isLoading={isLoadingPlaylist}
            error={playlistError}
          />
        </div>
      )}

      {/* 3D Immersive Music Gallery */}
      {queue.length > 0 && currentSong && (
        <MusicSpace
          songs={queue}
          currentSong={currentSong}
          onSelectSong={playSong}
          isPlaying={isPlaying}
          currentTime={currentTime}
        />
      )}

      {/* Control Hints Overlay */}
      {showControlsHint && queue.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 transition-opacity duration-1000">
          <div className="bg-black/80 backdrop-blur-md text-white px-8 py-4 rounded-3xl flex gap-10 text-[10px] font-bold uppercase tracking-widest animate-in fade-in zoom-in duration-500">
            <div className="flex items-center gap-3"><i className="fas fa-mouse text-base"></i> Right-Click Drag to Navigate</div>
            <div className="flex items-center gap-3"><i className="fas fa-arrows-up-down text-base"></i> Scroll to Zoom</div>
            <div className="flex items-center gap-3"><i className="fas fa-hand-pointer text-base"></i> Left-Click to Play</div>
          </div>
        </div>
      )}

      {/* Modern Fixed Header */}
      {queue.length > 0 && (
        <header className="absolute top-0 inset-x-0 p-10 flex justify-between items-center z-20 pointer-events-none">
          {/* <div className="flex items-center gap-5 pointer-events-auto">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-2xl">
              <i className="fas fa-record-vinyl text-white animate-spin-slow"></i>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black tracking-tighter heading-font">AURA</h1>
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400">Gallery V3</span>
            </div>
          </div> */}

          <button
            onClick={() => setShowPlaylistInput(true)}
            className="pointer-events-auto px-8 py-3 rounded-full font-bold text-[11px] uppercase tracking-widest transition-all shadow-xl bg-white text-black hover:bg-black hover:text-white"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Load New Playlist
          </button>
        </header>
      )}

      {/* AI Discovery Panel */}
      {showAiOracle && queue.length > 0 && (
        <div className="absolute left-10 top-32 w-80 glass-ui p-6 z-30 animate-in fade-in slide-in-from-left-8 duration-500">
          <h2 className="text-xs font-black uppercase tracking-widest mb-4 opacity-50">Discovery Engine</h2>
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="What's the vibe?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchAiRecommendations()}
              className="w-full bg-black/5 rounded-xl py-3.5 pl-4 pr-12 focus:outline-none text-xs font-bold tracking-tight"
            />
            <button onClick={fetchAiRecommendations} className="absolute right-2 top-2 w-9 h-9 flex items-center justify-center bg-black text-white rounded-lg transition-transform active:scale-90">
              {isAiLoading ? <i className="fas fa-spinner fa-spin text-[10px]"></i> : <i className="fas fa-magic text-[10px]"></i>}
            </button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
            {recommendations.map((rec, i) => (
              <div key={i} className="p-4 bg-white/60 hover:bg-white rounded-2xl border border-black/5 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                <p className="text-xs font-bold text-black group-hover:text-indigo-600 transition-colors">{rec.title}</p>
                <p className="text-[10px] text-gray-400 font-bold">{rec.artist}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Master Control Floating Hub */}
      {queue.length > 0 && currentSong && (
        <div className="absolute bottom-12 inset-x-0 flex justify-center z-20 px-10">
          <div className="glass-ui w-full max-w-lg p-6 flex items-center gap-10 shadow-2xl">
            <div className="flex items-center gap-6">
              <button onClick={() => skipTrack('prev')} className="text-gray-300 hover:text-black transition-all">
                <i className="fas fa-backward-step text-lg"></i>
              </button>
              <button
                onClick={togglePlay}
                className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl shadow-black/10"
              >
                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-lg`}></i>
              </button>
              <button onClick={() => skipTrack('next')} className="text-gray-300 hover:text-black transition-all">
                <i className="fas fa-forward-step text-lg"></i>
              </button>
            </div>

            <div className="flex-grow flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.1em]">
                <span className="truncate max-w-[150px] text-black">{currentSong?.title || 'No song selected'}</span>
                <span className="text-gray-400 font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
              <div className="relative h-1 w-full bg-black/5 rounded-full overflow-hidden">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full opacity-0 z-10 cursor-pointer"
                />
                <div
                  className="absolute left-0 top-0 h-full bg-black"
                  style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
