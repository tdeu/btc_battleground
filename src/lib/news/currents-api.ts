// Currents API client for news search
// Free tier: 600 requests/day
// Sign up at: https://currentsapi.services/en

const CURRENTS_API_KEY = process.env.CURRENTS_API_KEY;
const CURRENTS_BASE_URL = 'https://api.currentsapi.services/v1';

export interface CurrentsNewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  author: string;
  image: string;
  language: string;
  category: string[];
  published: string;
}

export interface CurrentsResponse {
  status: string;
  news: CurrentsNewsItem[];
}

// Search for stablecoin-related news
export async function searchCurrentsNews(query: string = 'stablecoin'): Promise<CurrentsNewsItem[]> {
  if (!CURRENTS_API_KEY) {
    console.warn('CURRENTS_API_KEY not set, skipping Currents API');
    return [];
  }

  try {
    const params = new URLSearchParams({
      apiKey: CURRENTS_API_KEY,
      keywords: query,
      language: 'en',
      type: '1', // News articles only
    });

    const response = await fetch(`${CURRENTS_BASE_URL}/search?${params}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error(`Currents API error: ${response.status}`);
      return [];
    }

    const data: CurrentsResponse = await response.json();
    return data.news || [];
  } catch (error) {
    console.error('Currents API error:', error);
    return [];
  }
}

// Get latest news in crypto/finance category
export async function getLatestCryptoNews(): Promise<CurrentsNewsItem[]> {
  if (!CURRENTS_API_KEY) {
    console.warn('CURRENTS_API_KEY not set, skipping Currents API');
    return [];
  }

  try {
    const params = new URLSearchParams({
      apiKey: CURRENTS_API_KEY,
      language: 'en',
      category: 'finance,technology',
    });

    const response = await fetch(`${CURRENTS_BASE_URL}/latest-news?${params}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error(`Currents API error: ${response.status}`);
      return [];
    }

    const data: CurrentsResponse = await response.json();

    // Filter for crypto/stablecoin related
    const keywords = ['stablecoin', 'crypto', 'bitcoin', 'tether', 'usdc', 'usdt', 'blockchain', 'treasury'];
    return (data.news || []).filter(item => {
      const text = `${item.title} ${item.description}`.toLowerCase();
      return keywords.some(kw => text.includes(kw));
    });
  } catch (error) {
    console.error('Currents API error:', error);
    return [];
  }
}

// Search multiple stablecoin-related queries
export async function fetchAllCurrentsNews(): Promise<CurrentsNewsItem[]> {
  const queries = ['stablecoin', 'tether USDT', 'USDC circle', 'CBDC digital dollar'];
  const allNews: CurrentsNewsItem[] = [];
  const seenUrls = new Set<string>();

  for (const query of queries) {
    const news = await searchCurrentsNews(query);
    for (const item of news) {
      if (!seenUrls.has(item.url)) {
        seenUrls.add(item.url);
        allNews.push(item);
      }
    }
    // Small delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Sort by date
  allNews.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());

  return allNews;
}
