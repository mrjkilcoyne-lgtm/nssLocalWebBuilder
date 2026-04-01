// ---------------------------------------------------------------------------
// REFERRED Integration — catalog knowledge base for MP
// ---------------------------------------------------------------------------

export interface ReferredProduct {
  id: string
  company: string
  name: string
  category: string
  description: string
  priceRange: string
  regions: string[]
  affiliateUrl?: string
  amazonUrl?: string
  beginnerFriendly: boolean
  tags: string[]
}

// Cached catalog — loaded once from Supabase, stored in memory
let catalogCache: ReferredProduct[] = []
let lastFetch = 0
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

/**
 * Fetch the REFERRED catalog from Supabase public API.
 * Caches in memory with 30-minute TTL.
 */
export async function fetchCatalog(
  supabaseUrl?: string,
  supabaseKey?: string,
): Promise<ReferredProduct[]> {
  if (catalogCache.length > 0 && Date.now() - lastFetch < CACHE_TTL) {
    return catalogCache
  }

  if (!supabaseUrl || !supabaseKey) {
    return catalogCache
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/products?select=*,companies(name,category)`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
    )

    if (!res.ok) return catalogCache

    const data = await res.json()
    catalogCache = data.map((item: any) => ({
      id: item.id,
      company: item.companies?.name ?? '',
      name: item.name,
      category: item.companies?.category ?? '',
      description: item.description ?? '',
      priceRange: item.price_range ?? '',
      regions: item.regions ?? [],
      affiliateUrl: item.affiliate_url,
      amazonUrl: item.amazon_url,
      beginnerFriendly: item.beginner_friendly ?? false,
      tags: item.tags ?? [],
    }))
    lastFetch = Date.now()
    return catalogCache
  } catch {
    return catalogCache
  }
}

/**
 * Search the catalog by query string.
 * Simple keyword matching against name, company, category, tags.
 */
export function searchCatalog(
  query: string,
  filters?: {
    category?: string
    region?: string
    beginnerFriendly?: boolean
  },
): ReferredProduct[] {
  const queryWords = query
    .toLowerCase()
    .split(/\W+/)
    .filter(w => w.length > 2)

  return catalogCache
    .filter(product => {
      if (filters?.category && product.category !== filters.category) return false
      if (filters?.region && !product.regions.includes(filters.region)) return false
      if (
        filters?.beginnerFriendly !== undefined &&
        product.beginnerFriendly !== filters.beginnerFriendly
      )
        return false

      if (queryWords.length === 0) return true
      const searchable =
        `${product.name} ${product.company} ${product.category} ${product.tags.join(' ')} ${product.description}`.toLowerCase()
      return queryWords.some(w => searchable.includes(w))
    })
    .slice(0, 20)
}

/**
 * Get recommendations for a category, formatted for MP to present.
 */
export function getRecommendations(
  category: string,
  limit = 5,
): ReferredProduct[] {
  return catalogCache
    .filter(p => p.category.toLowerCase() === category.toLowerCase())
    .slice(0, limit)
}

/**
 * Get catalog stats for MP's knowledge.
 */
export function getCatalogStats(): {
  totalProducts: number
  categories: string[]
  regions: string[]
} {
  const categories = [...new Set(catalogCache.map(p => p.category))]
  const regions = [...new Set(catalogCache.flatMap(p => p.regions))]
  return {
    totalProducts: catalogCache.length,
    categories,
    regions,
  }
}
