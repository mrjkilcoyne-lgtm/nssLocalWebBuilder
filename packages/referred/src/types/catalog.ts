export interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  category: string;
  subcategory: string | null;
  website_url: string | null;
  founded_year: number | null;
  hq_country: string | null;
  operations_regions: string[];
  credit_rating: string;
  google_review_score: number | null;
  google_review_count: number;
}

export interface Product {
  id: string;
  company_id: string;
  company?: Company;
  name: string;
  slug: string;
  description: string | null;
  modality: string;
  price_range_low: number | null;
  price_range_high: number | null;
  currency: string;
  beginner_friendly: boolean;
  tags: string[];
  regions: string[];
}

export interface AffiliateLink {
  id: string;
  company_id: string;
  product_id: string;
  url: string;
  amazon_url: string | null;
  amazon_asin: string | null;
  link_type: string;
  commission_rate: number | null;
  cookie_duration_days: number | null;
  status: string;
  region: string | null;
}

export interface PriceHistory {
  id: string;
  product_id: string;
  price: number;
  currency: string;
  source: string | null;
  recorded_at: string;
}

export type Modality = 'compute' | 'audio' | 'video' | 'networking' | 'storage' | 'software' | 'financial' | 'hub';
export type Region = 'US' | 'EU' | 'CN' | 'ROW';

export interface CatalogFilters {
  search: string;
  categories: string[];
  region: Region;
  priceMin: number | null;
  priceMax: number | null;
  modalities: Modality[];
  beginnerFriendly: boolean | null;
  sortBy: 'rating' | 'price_low' | 'price_high' | 'newest';
}
