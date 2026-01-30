
import React, { useState } from 'react';
import { parsePlaylistId } from '../services/youtubeService';

interface PlaylistInputProps {
    onLoadPlaylist: (playlistId: string) => void;
    isLoading: boolean;
    error: string | null;
}

const PlaylistInput: React.FC<PlaylistInputProps> = ({ onLoadPlaylist, isLoading, error }) => {
    const [inputValue, setInputValue] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);

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

    return (
        <div className="glass-ui p-8 w-full max-w-md">
            <h2 className="text-sm font-black uppercase tracking-widest mb-6 opacity-60">
                Load YouTube Playlist
            </h2>

            <div className="space-y-4">
                <div>
                    <input
                        type="text"
                        placeholder="Paste playlist URL or ID..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        className="w-full bg-white/80 rounded-xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-black/10 text-sm font-medium tracking-tight disabled:opacity-50 border border-black/5"
                    />
                    <p className="text-[10px] text-gray-400 mt-2 font-medium">
                        Example: https://www.youtube.com/playlist?list=PLxxx...
                    </p>
                </div>

                {(validationError || error) && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                        <p className="text-xs font-bold text-red-600">
                            {validationError || error}
                        </p>
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                    {isLoading ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Loading Playlist...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-play"></i>
                            Load Playlist
                        </>
                    )}
                </button>
            </div>

            <div className="mt-6 pt-6 border-t border-black/5">
                <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                    <i className="fas fa-info-circle mr-1"></i>
                    Enter any public YouTube playlist URL. We'll fetch all videos and create your immersive 3D music gallery.
                </p>
            </div>
        </div>
    );
};

export default PlaylistInput;
