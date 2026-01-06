import { supabase } from '../lib/supabase';

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    image_url: string;
    parent_id: string | null;
    order_index: number;
    is_active: boolean;
    created_at: string;
    parent_name?: string;
    parent_slug?: string;
}

/**
 * Fetch all active categories
 */
export const fetchCategories = async (): Promise<Category[]> => {
    const { data, error } = await supabase
        .from('categories_with_parent')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    return data || [];
};

/**
 * Fetch only top-level categories (no parent)
 */
export const fetchMainCategories = async (): Promise<Category[]> => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .is('parent_id', null)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

    if (error) {
        console.error('Error fetching main categories:', error);
        return [];
    }

    return data || [];
};

/**
 * Fetch subcategories for a specific parent category
 */
export const fetchSubcategories = async (parentId: string): Promise<Category[]> => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', parentId)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

    if (error) {
        console.error('Error fetching subcategories:', error);
        return [];
    }

    return data || [];
};

/**
 * Fetch a single category by slug
 */
export const fetchCategoryBySlug = async (slug: string): Promise<Category | null> => {
    const { data, error } = await supabase
        .from('categories_with_parent')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

    if (error) {
        console.error('Error fetching category:', error);
        return null;
    }

    return data;
};

/**
 * Fetch category by ID
 */
export const fetchCategoryById = async (id: string): Promise<Category | null> => {
    const { data, error } = await supabase
        .from('categories_with_parent')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

    if (error) {
        console.error('Error fetching category:', error);
        return null;
    }

    return data;
};

/**
 * Fetch categories with their subcategories (hierarchical structure)
 */
export const fetchCategoriesHierarchical = async () => {
    // Fetch all categories
    const { data: allCategories, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    // Organize into hierarchy
    const mainCategories = allCategories.filter(cat => !cat.parent_id);

    return mainCategories.map(main => ({
        ...main,
        subcategories: allCategories.filter(cat => cat.parent_id === main.id)
    }));
};
