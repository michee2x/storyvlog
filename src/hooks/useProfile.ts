import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export interface ProfileData {
    id: string;
    username: string;
    avatar_url?: string;
}

// Keys for query caching
export const PROFILE_KEYS = {
    all: ['profiles'] as const,
    detail: (id: string) => [...PROFILE_KEYS.all, id] as const,
    me: () => [...PROFILE_KEYS.all, 'me'] as const,
};

// Hook: Get Current User Profile
export function useProfile() {
    const { session } = useAuth();

    return useQuery({
        queryKey: PROFILE_KEYS.me(),
        queryFn: async (): Promise<ProfileData | null> => {
            if (!session?.user?.id) return null;

            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, avatar_url')
                .eq('id', session.user.id)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!session?.user?.id, // Only run if logged in
        staleTime: 1000 * 60 * 60, // Consider data fresh for 1 hour (images don't change often)
    });
}

// Hook: Get Public Profile by ID
export function usePublicProfile(userId: string) {
    return useQuery({
        queryKey: PROFILE_KEYS.detail(userId),
        queryFn: async (): Promise<ProfileData | null> => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, avatar_url')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!userId,
    });
}

// Hook: Update Profile (Optimistic UI)
export function useUpdateProfile() {
    const queryClient = useQueryClient();
    const { session } = useAuth();

    return useMutation({
        mutationFn: async (updates: Partial<ProfileData>) => {
            if (!session?.user?.id) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', session.user.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        // When mutate is called:
        onMutate: async (newProfile) => {
            // 1. Cancel any outgoing refetches so they don't overwrite our optimistic update
            await queryClient.cancelQueries({ queryKey: PROFILE_KEYS.me() });

            // 2. Snapshot the previous value
            const previousProfile = queryClient.getQueryData(PROFILE_KEYS.me());

            // 3. Optimistically update to the new value
            queryClient.setQueryData(PROFILE_KEYS.me(), (old: ProfileData) => ({
                ...old,
                ...newProfile,
            }));

            // Return a context object with the snapshotted value
            return { previousProfile };
        },
        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (err, newProfile, context) => {
            if (context?.previousProfile) {
                queryClient.setQueryData(PROFILE_KEYS.me(), context.previousProfile);
            }
        },
        // Always refetch after error or success:
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.me() });
        },
    });
}
