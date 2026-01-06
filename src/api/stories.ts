import { supabase } from '../lib/supabase';

export interface Story {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: any; // URL string in real app, keeping any for compatibility
  cover_url?: string; // Real DB field
  views: string;
  likes: string;
  category?: string;
}

export const fetchStories = async (): Promise<Story[]> => {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching stories:', error);
    return []; // Return empty or handle error
  }

  // Map DB fields to App interface
  return data.map((item: any) => ({
    id: item.id,
    title: item.title,
    author: item.author,
    description: item.description,
    coverImage: { uri: item.cover_url }, // Adapter for Image component
    views: item.views?.toString() || '0',
    likes: item.likes?.toString() || '0',
    category: item.category
  }));
};

export const fetchStoryDetails = async (id: string) => {
  const { data: story, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  const { data: chapters, error: chapError } = await supabase
    .from('chapters')
    .select('*')
    .eq('story_id', id)
    .order('order_index', { ascending: true });

  if (chapError) throw chapError;

  // Map to app format - same as fetchStories
  return {
    ...story,
    coverImage: { uri: story.cover_url }, // Transform for Image component
    views: story.views?.toString() || '0',
    likes: story.likes?.toString() || '0',
    chapters
  };
};

// Fallback STATIC Data (keeping for safety until migration complete)
export const STORIES: Story[] = [
  // ... existing mock data can remain here as backup
];
