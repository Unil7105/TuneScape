import { createClient } from '@supabase/supabase-js';

// Supabase configuration - Replace with your actual Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database
export interface UserPlaylist {
    id: string;
    user_id: string;
    playlist_id: string;
    playlist_name: string;
    thumbnail_url?: string;
    video_count: number;
    created_at: string;
    last_played_at?: string;
}

// Auth functions
export const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin
        }
    });
    return { data, error };
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};

export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

// Playlist management functions
export const getUserPlaylists = async (userId: string): Promise<UserPlaylist[]> => {
    const { data, error } = await supabase
        .from('user_playlists')
        .select('*')
        .eq('user_id', userId)
        .order('last_played_at', { ascending: false, nullsFirst: false });

    if (error) {
        console.error('Error fetching playlists:', error);
        return [];
    }
    return data || [];
};

export const saveUserPlaylist = async (
    userId: string,
    playlistId: string,
    playlistName: string,
    thumbnailUrl: string,
    videoCount: number
): Promise<UserPlaylist | null> => {
    // Check if playlist already exists
    const { data: existing } = await supabase
        .from('user_playlists')
        .select('*')
        .eq('user_id', userId)
        .eq('playlist_id', playlistId)
        .single();

    if (existing) {
        // Update last played time
        const { data, error } = await supabase
            .from('user_playlists')
            .update({ last_played_at: new Date().toISOString() })
            .eq('id', existing.id)
            .select()
            .single();

        if (error) console.error('Error updating playlist:', error);
        return data;
    }

    // Insert new playlist
    const { data, error } = await supabase
        .from('user_playlists')
        .insert({
            user_id: userId,
            playlist_id: playlistId,
            playlist_name: playlistName,
            thumbnail_url: thumbnailUrl,
            video_count: videoCount,
            last_played_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) {
        console.error('Error saving playlist:', error);
        return null;
    }
    return data;
};

export const deleteUserPlaylist = async (playlistDbId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('user_playlists')
        .delete()
        .eq('id', playlistDbId);

    if (error) {
        console.error('Error deleting playlist:', error);
        return false;
    }
    return true;
};
