export interface DescriptionInput {
  title?: string;
  category?: string;
  condition?: string;
  keywords?: string;
  listingType?: 'buy' | 'sell' | 'rent' | 'lost' | 'found';
}

const conditionPhrases: Record<string, string[]> = {
  'new': ['brand new', 'never used', 'in perfect condition', 'still in original packaging'],
  'like new': ['barely used', 'in excellent condition', 'looks and works like new', 'minimal wear'],
  'good': ['in good working condition', 'well maintained', 'shows minor signs of use', 'fully functional'],
  'fair': ['in fair condition', 'shows some wear', 'works perfectly despite cosmetic wear', 'functional with visible use'],
  'poor': ['heavily used', 'shows significant wear', 'functional but cosmetically worn', 'priced to sell as-is'],
};

const categoryPhrases: Record<string, string[]> = {
  'electronics': ['perfect for students', 'great for coursework and projects', 'ideal for academic use'],
  'books': ['essential reading material', 'great for exam preparation', 'a must-have for the course'],
  'furniture': ['perfect for your dorm or apartment', 'sturdy and reliable', 'great for student living'],
  'clothing': ['stylish and comfortable', 'great condition', 'perfect for campus life'],
  'sports': ['great for staying active on campus', 'perfect for recreational use', 'ideal for fitness enthusiasts'],
  'stationery': ['essential for your studies', 'perfect for note-taking and projects', 'great quality'],
  'other': ['a great find', 'perfect for any student', 'don\'t miss this opportunity'],
};

export function generateDescription(input: DescriptionInput | string): string {
  if (typeof input === 'string') {
    return generateDescription({ keywords: input });
  }

  const { title, category, condition, keywords, listingType } = input;
  const parts: string[] = [];

  const conditionKey = condition?.toLowerCase() || '';
  const conditionPhrase = conditionPhrases[conditionKey]
    ? conditionPhrases[conditionKey][Math.floor(Math.random() * conditionPhrases[conditionKey].length)]
    : 'in good condition';

  const categoryKey = category?.toLowerCase() || 'other';
  const categoryPhrase = categoryPhrases[categoryKey] || categoryPhrases['other'];
  const catPhrase = categoryPhrase[Math.floor(Math.random() * categoryPhrase.length)];

  if (title) {
    parts.push(`${title} — ${conditionPhrase}.`);
  }

  if (keywords) {
    parts.push(`Key features: ${keywords}.`);
  }

  parts.push(`This item is ${catPhrase}.`);

  if (listingType === 'rent') {
    parts.push('Available for rent — contact via WhatsApp to arrange pickup/delivery.');
  } else if (listingType === 'sell') {
    parts.push('Selling as I no longer need it. Serious buyers only — contact via WhatsApp.');
  } else if (listingType === 'lost') {
    parts.push('If found, please contact me immediately. Your help is greatly appreciated!');
  } else if (listingType === 'found') {
    parts.push('Found on campus. Please contact me to claim your item with proof of ownership.');
  } else {
    parts.push('Contact via WhatsApp for more details or to arrange a meeting on campus.');
  }

  return parts.join(' ');
}
