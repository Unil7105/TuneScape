
import React, { useState } from 'react';
import { parsePlaylistId } from '../services/youtubeService';
import { useAuth } from '../contexts/AuthContext';
import { SAMPLE_PLAYLISTS, SamplePlaylist } from '../constants/samplePlaylists';
import { UserPlaylist } from '../services/supabaseClient';

interface PlaylistInputProps {
    onLoadPlaylist: (playlistId: string, playlistName?: string, thumbnail?: string, videoCount?: number) => void;
    isLoading: boolean;
    error: string | null;
}

const PlaylistInput: React.FC<PlaylistInputProps> = ({ onLoadPlaylist, isLoading, error }) => {
    const [inputValue, setInputValue] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'discover' | 'my-playlists'>('discover');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { user, isLoading: authLoading, signIn, signOut, userPlaylists, removePlaylist } = useAuth();

    const handleSubmit = () => {
        setValidationError(null);

        if (!inputValue.trim()) {
            setValidationError('Please enter a YouTube playlist URL or ID');
            return;
        }

        const playlistId = parsePlaylistId(inputValue.trim());
        if (!playlistId) {
            setValidationError('Invalid YouTube playlist URL or ID');
            return;
        }

        onLoadPlaylist(playlistId);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    const handleSamplePlaylistClick = (playlist: SamplePlaylist) => {
        onLoadPlaylist(playlist.playlistId, playlist.name, playlist.thumbnail, playlist.videoCount);
    };

    const handleUserPlaylistClick = (playlist: UserPlaylist) => {
        onLoadPlaylist(playlist.playlist_id, playlist.playlist_name, playlist.thumbnail_url, playlist.video_count);
    };

    const handleDeletePlaylist = async (e: React.MouseEvent, playlistId: string) => {
        e.stopPropagation();
        setDeletingId(playlistId);
        await removePlaylist(playlistId);
        setDeletingId(null);
    };

    return (
        <div className="glass-ui p-8 w-full max-w-2xl overflow-hidden">
            {/* Content */}
            <div className="relative z-10">

                {/* Header with Auth */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-black tracking-tight heading-font">
                            🎵 TuneSpace
                        </h2>
                        <p className="text-[11px] text-gray-400 font-medium">
                            Immersive 3D Music Experience
                        </p>
                    </div>

                    {/* Auth Button */}
                    {authLoading ? (
                        <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse"></div>
                    ) : user ? (
                        <div className="flex items-center gap-3">
                            <img
                                src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
                                alt="Profile"
                                className="w-9 h-9 rounded-full border-2 border-white shadow-md"
                            />
                            <div className="hidden sm:block">
                                <p className="text-xs font-bold truncate max-w-[100px]">
                                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                                </p>
                                <button
                                    onClick={signOut}
                                    className="text-[10px] text-gray-400 hover:text-red-500 font-medium transition-colors"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={signIn}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 hover:shadow-md transition-all"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Sign in with Google
                        </button>
                    )}
                </div>

                {/* URL Input */}
                <div className="mb-6">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Paste YouTube playlist URL or ID..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            className="flex-1 bg-white/90 rounded-xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-sm font-medium tracking-tight disabled:opacity-50 border border-black/5"
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="px-6 bg-[#FF0000] text-white rounded-xl font-bold text-sm hover:bg-[#E60000] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-red-500/20"
                        >
                            {isLoading ? (
                                <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                                <i className="fas fa-play"></i>
                            )}
                        </button>
                    </div>
                    {(validationError || error) && (
                        <p className="mt-2 text-xs font-bold text-red-500">
                            <i className="fas fa-exclamation-circle mr-1"></i>
                            {validationError || error}
                        </p>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-4 p-1 bg-black/5 rounded-xl">
                    <button
                        onClick={() => setActiveTab('discover')}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'discover'
                            ? 'bg-white text-black shadow-md'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <i className="fas fa-compass mr-2"></i>
                        Discover
                    </button>
                    <button
                        onClick={() => setActiveTab('my-playlists')}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'my-playlists'
                            ? 'bg-white text-black shadow-md'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <i className="fas fa-heart mr-2"></i>
                        My Playlists
                        {userPlaylists.length > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-[9px] rounded-full">
                                {userPlaylists.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Content Area */}
                <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                    {activeTab === 'discover' ? (
                        <>
                            <p className="text-[11px] text-gray-400 font-medium">
                                <i className="fas fa-sparkles mr-1"></i>
                                Try these curated playlists to get started
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {SAMPLE_PLAYLISTS.map((playlist) => (
                                    <button
                                        key={playlist.id}
                                        onClick={() => handleSamplePlaylistClick(playlist)}
                                        disabled={isLoading}
                                        className="group relative overflow-hidden rounded-2xl p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                        style={{
                                            background: `linear-gradient(135deg, ${playlist.gradientColors[0]}, ${playlist.gradientColors[1]})`
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors"></div>
                                        <div className="relative z-10">
                                            <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-[9px] font-bold text-white uppercase tracking-wider mb-2">
                                                {playlist.genre}
                                            </span>
                                            <h3 className="font-bold text-white text-sm mb-0.5 drop-shadow-sm">
                                                {playlist.name}
                                            </h3>
                                            <p className="text-white/80 text-[10px] font-medium">
                                                {playlist.description}
                                            </p>
                                            <p className="text-white/60 text-[9px] mt-1 font-medium">
                                                <i className="fas fa-music mr-1"></i>
                                                {playlist.videoCount} tracks
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            {!user ? (
                                <div className="text-center py-10">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <i className="fas fa-user-lock text-2xl text-gray-300"></i>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-600 mb-2">
                                        Sign in to save playlists
                                    </h3>
                                    <p className="text-[11px] text-gray-400 mb-4 max-w-xs mx-auto">
                                        Connect your Google account to save and manage your favorite playlists
                                    </p>
                                    <button
                                        onClick={signIn}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                                            <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Sign in with Google
                                    </button>
                                </div>
                            ) : userPlaylists.length === 0 ? (
                                <div className="text-center py-10">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <i className="fas fa-folder-open text-2xl text-gray-300"></i>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-600 mb-2">
                                        No saved playlists yet
                                    </h3>
                                    <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                                        Load a playlist and it will automatically be saved here for quick access
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {userPlaylists.map((playlist) => (
                                        <button
                                            key={playlist.id}
                                            onClick={() => handleUserPlaylistClick(playlist)}
                                            disabled={isLoading || deletingId === playlist.id}
                                            className="w-full group flex items-center gap-4 p-3 bg-white/60 hover:bg-white rounded-xl border border-black/5 transition-all hover:shadow-md disabled:opacity-50 text-left"
                                        >
                                            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                {playlist.thumbnail_url ? (
                                                    <img
                                                        src={playlist.thumbnail_url}
                                                        alt={playlist.playlist_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <i className="fas fa-music text-gray-300"></i>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm text-gray-800 truncate group-hover:text-red-500 transition-colors">
                                                    {playlist.playlist_name}
                                                </h4>
                                                <p className="text-[10px] text-gray-400 font-medium">
                                                    <i className="fas fa-music mr-1"></i>
                                                    {playlist.video_count} tracks
                                                    {playlist.last_played_at && (
                                                        <span className="ml-2">
                                                            <i className="fas fa-clock mr-1"></i>
                                                            {new Date(playlist.last_played_at).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => handleDeletePlaylist(e, playlist.id)}
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                {deletingId === playlist.id ? (
                                                    <i className="fas fa-spinner fa-spin text-sm"></i>
                                                ) : (
                                                    <i className="fas fa-trash text-sm"></i>
                                                )}
                                            </button>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-black/5">
                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed text-center">
                        <i className="fas fa-info-circle mr-1"></i>
                        Enter any public YouTube playlist URL to create your immersive 3D music gallery
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PlaylistInput;
