import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, signInWithGoogle, signOut as supabaseSignOut, UserPlaylist, getUserPlaylists, saveUserPlaylist, deleteUserPlaylist } from '../services/supabaseClient';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    userPlaylists: UserPlaylist[];
    refreshPlaylists: () => Promise<void>;
    addPlaylist: (playlistId: string, playlistName: string, thumbnailUrl: string, videoCount: number) => Promise<void>;
    removePlaylist: (playlistDbId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userPlaylists, setUserPlaylists] = useState<UserPlaylist[]>([]);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);

            if (session?.user) {
                loadUserPlaylists(session.user.id);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    loadUserPlaylists(session.user.id);
                } else {
                    setUserPlaylists([]);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const loadUserPlaylists = async (userId: string) => {
        const playlists = await getUserPlaylists(userId);
        setUserPlaylists(playlists);
    };

    const signIn = async () => {
        await signInWithGoogle();
    };

    const signOut = async () => {
        await supabaseSignOut();
        setUserPlaylists([]);
    };

    const refreshPlaylists = async () => {
        if (user) {
            await loadUserPlaylists(user.id);
        }
    };

    const addPlaylist = async (playlistId: string, playlistName: string, thumbnailUrl: string, videoCount: number) => {
        if (user) {
            await saveUserPlaylist(user.id, playlistId, playlistName, thumbnailUrl, videoCount);
            await loadUserPlaylists(user.id);
        }
    };

    const removePlaylist = async (playlistDbId: string) => {
        await deleteUserPlaylist(playlistDbId);
        if (user) {
            await loadUserPlaylists(user.id);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            isLoading,
            signIn,
            signOut,
            userPlaylists,
            refreshPlaylists,
            addPlaylist,
            removePlaylist
        }}>
            {children}
        </AuthContext.Provider>
    );
};
