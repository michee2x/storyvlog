import { supabase } from '../lib/supabase';
import { Story, mapStoryData } from './stories';

export interface SearchResult {
  stories: Story[];
  users: Profile[];
}

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
}

export const searchStories = async (query: string): Promise<Story[]> => {
  if (!query) return [];

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .ilike('title', `%${query}%`)
    .limit(10);

  if (error) {
    console.error('Error searching stories:', error);
    return [];
  }

  return (data || []).map(mapStoryData);
};

export const searchUsers = async (query: string): Promise<Profile[]> => {
  if (!query) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .ilike('username', `%${query}%`)
    .limit(10);

  if (error) {
    console.error('Error searching users:', error);
    return [];
  }

  return data || [];
};
