// Global Types Definition for YourSkin Application
// Files with no top-level import/export are treated as ambient declarations,
// making these interfaces globally available without needing import statements.

interface IBrand {
    id?: string;
    name: string;
    image: string;
    parent_company: string;
    is_halal_certified: boolean;
    is_active: boolean;
}

interface ICategory {
    id?: string;
    name: string;
    icon?: string | null;
    is_active: boolean;
}

interface IProductImage {
    id?: string;
    product_id?: string;
    image_url: string;
    display_order: number;
    created_at?: string | Date;
    file: File;
}

interface IProductIngredient {
    id?: string;
    product_id?: string;
    ingredient_id: string;
    concentration_percentage: number;
    is_key_active: boolean;
    order_in_formula?: number;
    created_at?: string | Date;
}

interface IIngredient {
    id?: string;
    name: string;
    primary_function?: string;
    comedogenic_rating?: number;
    is_safe_for_pregnancy: boolean;
    is_safe_for_fungal_acne: boolean;
    target_conditions?: string[];
    is_active?: boolean;
}

interface IProduct {
    id?: string;
    brand_id: string;
    category_id: string;
    product_name: string;
    scope: string;
    format: string;
    ph_level?: number | null;
    volume_amount?: number | null;
    volume_unit?: string | null;
    target_concerns?: string[];
    is_fragrance_free?: boolean;
    is_alcohol_free?: boolean;
    stock_status?: boolean;
    created_at?: string | Date;
    is_active: boolean;

    // Relasi opsional dari API
    brand?: IBrand;
    category?: ICategory;
    images?: IProductImage[];
}

interface IUser {
    id: string;
    email: string;
    full_name?: string;
    role?: string;
    permissions?: string[];
    created_at?: string | Date;
}

