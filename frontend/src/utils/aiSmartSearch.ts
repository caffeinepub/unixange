import type { BuySellItem, RentalItem } from '../backend';

export interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  category?: string;
  keywords?: string[];
}

export function parseSearchQuery(query: string): SearchFilters {
  const filters: SearchFilters = {};
  const lower = query.toLowerCase();

  // Price range patterns
  const underMatch = lower.match(/under\s*₹?\s*(\d+)/);
  const belowMatch = lower.match(/below\s*₹?\s*(\d+)/);
  const aboveMatch = lower.match(/above\s*₹?\s*(\d+)/);
  const betweenMatch = lower.match(/₹?\s*(\d+)\s*(?:to|-)\s*₹?\s*(\d+)/);

  if (betweenMatch) {
    filters.minPrice = parseInt(betweenMatch[1]);
    filters.maxPrice = parseInt(betweenMatch[2]);
  } else if (underMatch) {
    filters.maxPrice = parseInt(underMatch[1]);
  } else if (belowMatch) {
    filters.maxPrice = parseInt(belowMatch[1]);
  } else if (aboveMatch) {
    filters.minPrice = parseInt(aboveMatch[1]);
  }

  // Condition
  if (lower.includes('new')) filters.condition = 'new';
  else if (lower.includes('like new')) filters.condition = 'like new';
  else if (lower.includes('good')) filters.condition = 'good';
  else if (lower.includes('fair')) filters.condition = 'fair';

  // Category
  if (lower.includes('book') || lower.includes('textbook')) filters.category = 'books';
  else if (lower.includes('electronic') || lower.includes('laptop') || lower.includes('phone')) filters.category = 'electronics';
  else if (lower.includes('furniture') || lower.includes('chair') || lower.includes('table')) filters.category = 'furniture';
  else if (lower.includes('cloth') || lower.includes('shirt') || lower.includes('dress')) filters.category = 'clothing';
  else if (lower.includes('sport') || lower.includes('gym') || lower.includes('fitness')) filters.category = 'sports';

  // Keywords (remove price/condition/category tokens)
  const cleaned = lower
    .replace(/under\s*₹?\s*\d+/g, '')
    .replace(/below\s*₹?\s*\d+/g, '')
    .replace(/above\s*₹?\s*\d+/g, '')
    .replace(/₹?\s*\d+\s*(?:to|-)\s*₹?\s*\d+/g, '')
    .replace(/\b(new|like new|good|fair|poor|book|textbook|electronic|laptop|phone|furniture|chair|table|cloth|shirt|dress|sport|gym|fitness)\b/g, '')
    .trim();

  if (cleaned) {
    filters.keywords = cleaned.split(/\s+/).filter(k => k.length > 2);
  }

  return filters;
}

function scoreItem(title: string, description: string, filters: SearchFilters): number {
  let score = 0;
  const text = `${title} ${description}`.toLowerCase();

  if (filters.keywords) {
    for (const kw of filters.keywords) {
      if (text.includes(kw)) score += 2;
    }
  }

  return score;
}

export function filterBuySellItems(items: BuySellItem[], query: string): BuySellItem[] {
  if (!query.trim()) return items;
  const filters = parseSearchQuery(query);

  return items
    .filter(item => {
      if (filters.minPrice !== undefined && Number(item.price) < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && Number(item.price) > filters.maxPrice) return false;
      if (filters.condition && !item.condition.toLowerCase().includes(filters.condition)) return false;
      if (filters.category && !item.category.toLowerCase().includes(filters.category)) return false;
      if (filters.keywords && filters.keywords.length > 0) {
        const text = `${item.title} ${item.description}`.toLowerCase();
        return filters.keywords.some(kw => text.includes(kw));
      }
      return true;
    })
    .sort((a, b) => scoreItem(b.title, b.description, filters) - scoreItem(a.title, a.description, filters));
}

export function filterRentalItems(items: RentalItem[], query: string): RentalItem[] {
  if (!query.trim()) return items;
  const filters = parseSearchQuery(query);

  return items
    .filter(item => {
      if (filters.minPrice !== undefined && Number(item.dailyPrice) < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && Number(item.dailyPrice) > filters.maxPrice) return false;
      if (filters.condition && !item.condition.toLowerCase().includes(filters.condition)) return false;
      if (filters.category && !item.category.toLowerCase().includes(filters.category)) return false;
      if (filters.keywords && filters.keywords.length > 0) {
        const text = `${item.title} ${item.description}`.toLowerCase();
        return filters.keywords.some(kw => text.includes(kw));
      }
      return true;
    })
    .sort((a, b) => scoreItem(b.title, b.description, filters) - scoreItem(a.title, a.description, filters));
}
