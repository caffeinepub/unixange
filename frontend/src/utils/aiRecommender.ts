import type { BuySellItem, RentalItem, LostFoundItem } from '../backend';

type AnyItem = BuySellItem | RentalItem | LostFoundItem;

function getItemText(item: AnyItem): string {
  return `${item.title} ${item.description}`.toLowerCase();
}

function getItemCategory(item: AnyItem): string {
  if ('category' in item) return (item as BuySellItem | RentalItem).category.toLowerCase();
  return '';
}

function getItemPrice(item: AnyItem): number {
  if ('price' in item) return Number((item as BuySellItem).price);
  if ('dailyPrice' in item) return Number((item as RentalItem).dailyPrice);
  return 0;
}

function scoreRecommendation(target: AnyItem, candidate: AnyItem): number {
  let score = 0;

  // Category match
  const targetCat = getItemCategory(target);
  const candidateCat = getItemCategory(candidate);
  if (targetCat && targetCat === candidateCat) {
    score += 10;
  }

  // Price proximity
  const targetPrice = getItemPrice(target);
  const candidatePrice = getItemPrice(candidate);
  if (targetPrice > 0 && candidatePrice > 0) {
    const diff = Math.abs(targetPrice - candidatePrice) / targetPrice;
    if (diff < 0.2) score += 5;
    else if (diff < 0.5) score += 2;
  }

  // Keyword overlap
  const targetWords = new Set(
    getItemText(target)
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );
  const candidateText = getItemText(candidate);
  for (const word of targetWords) {
    if (candidateText.includes(word)) score += 1;
  }

  return score;
}

export function getRecommendations<T extends AnyItem>(
  target: T,
  allItems: T[],
  n = 4
): T[] {
  return allItems
    .filter((item) => item.id !== target.id)
    .map((item) => ({ item, score: scoreRecommendation(target, item) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map(({ item }) => item);
}

// Legacy alias kept for backward compatibility
export const recommendSimilarItems = getRecommendations;
