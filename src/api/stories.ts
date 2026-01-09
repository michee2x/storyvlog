import { supabase } from '../lib/supabase';

export interface Story {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: any; // Keeping for compatibility, mapped from cover_url
  cover_url?: string;
  views: string;
  likes: string;
  rating?: number;
  category?: string;
  is_trending?: boolean;
  is_featured?: boolean;
  status?: string;
  created_at?: string;
  chapters_count?: number;
  chapters?: any[]; // Array of chapter objects
}

const formatCount = (count: number): string => {
  if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
  if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
  return count.toString();
};

export const mapStoryData = (data: any): Story => ({
  ...data,
  // Map cover_url to coverImage for UI compatibility
  coverImage: data.cover_url ? { uri: data.cover_url } : require('@/assets/images/romance-cover.png'),
  views: typeof data.views === 'number' ? formatCount(data.views) : data.views,
  likes: typeof data.likes === 'number' ? formatCount(data.likes) : data.likes,
});

export const fetchStories = async (): Promise<Story[]> => {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching stories:', error);
    return [];
  }

  return (data || []).map(mapStoryData);
};

export const fetchTrendingStories = async (): Promise<Story[]> => {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('is_trending', true)
    .order('views', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching trending stories:', error);
    return [];
  }

  return (data || []).map(mapStoryData);
};

export const fetchFeaturedStories = async (): Promise<Story[]> => {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('is_featured', true)
    .limit(5);

  if (error) {
    console.error('Error fetching featured stories:', error);
    return [];
  }

  return (data || []).map(mapStoryData);
};

export const fetchStoriesByCategory = async (categoryId: string): Promise<Story[]> => {
  // Queries story_categories junction table
  const { data, error } = await supabase
    .from('story_categories')
    .select('story_id, stories(*)') // Join with stories
    .eq('category_id', categoryId);

  if (error) {
    console.error('Error fetching stories by category:', error);
    return [];
  }

  // Extract story object from the join result
  return (data || [])
    .map((item: any) => item.stories)
    .filter((story: any) => story !== null)
    .map(mapStoryData);
};

export const fetchNewArrivals = async (): Promise<Story[]> => {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching new arrivals:', error);
    return [];
  }

  return (data || []).map(mapStoryData);
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

// Helper to get genre ID by slug (internal use or export if needed)
export const fetchStoriesByGenreSlug = async (slug: string, limit: number = 10): Promise<Story[]> => {
  // First get category ID
  const { data: cat } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single();

  if (!cat) return [];

  // Then fetch stories for that category
  const { data } = await supabase
    .from('story_categories')
    .select('stories(*)')
    .eq('category_id', cat.id)
    .limit(limit);

  return (data || [])
    .map((item: any) => item.stories)
    .filter((s: any) => s !== null)
    .map(mapStoryData);
};

// Fallback STATIC Data (keeping for safety until migration complete)
export const STORIES: Story[] = [
  // ... existing mock data can remain here as backup
];
