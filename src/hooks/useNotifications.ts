import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Notification } from '../types/notification';

export const NOTIFICATION_KEYS = {
    all: ['notifications'] as const,
    list: () => [...NOTIFICATION_KEYS.all, 'list'] as const,
    unread: () => [...NOTIFICATION_KEYS.all, 'unread'] as const,
};

export function useNotifications() {
    const { session } = useAuth();
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: NOTIFICATION_KEYS.list(),
        queryFn: async () => {
            if (!session?.user?.id) return [];

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Notification[];
        },
        enabled: !!session?.user?.id,
    });

    const markAsRead = useMutation({
        mutationFn: async (notificationId: string) => {
            if (!session?.user?.id) throw new Error("Not authenticated");

            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', notificationId)
                .eq('user_id', session.user.id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.list() });
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unread() });
        },
    });

    const markAllAsRead = useMutation({
        mutationFn: async () => {
            if (!session?.user?.id) throw new Error("Not authenticated");

            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', session.user.id)
                .eq('read', false);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.list() });
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unread() });
        },
    });

    return {
        ...query,
        markAsRead,
        markAllAsRead,
    };
}

export function useUnreadNotificationCount() {
    const { session } = useAuth();
    
    return useQuery({
        queryKey: NOTIFICATION_KEYS.unread(),
        queryFn: async () => {
             if (!session?.user?.id) return 0;

            const { count, error } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true }) // head: true only fetches metadata, faster
                .eq('user_id', session.user.id)
                .eq('read', false);

            if (error) throw error;
            return count || 0;
        },
        enabled: !!session?.user?.id,
        // Refresh every minute or on focus
        refetchInterval: 60000, 
    });
}
