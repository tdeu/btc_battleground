// RSS Feed sources for crypto/stablecoin news
export const RSS_FEEDS = [
  {
    name: 'CoinDesk',
    url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
    category: 'general',
  },
  {
    name: 'Cointelegraph',
    url: 'https://cointelegraph.com/rss',
    category: 'general',
  },
  {
    name: 'The Block',
    url: 'https://www.theblock.co/rss.xml',
    category: 'general',
  },
  {
    name: 'Decrypt',
    url: 'https://decrypt.co/feed',
    category: 'general',
  },
  {
    name: 'Bitcoin Magazine',
    url: 'https://bitcoinmagazine.com/.rss/full/',
    category: 'bitcoin',
  },
];

// Keywords to filter for stablecoin-related news
export const STABLECOIN_KEYWORDS = [
  // Stablecoins
  'stablecoin', 'usdt', 'tether', 'usdc', 'circle', 'dai', 'busd', 'pyusd',
  // Key people
  'howard lutnick', 'paolo ardoino', 'giancarlo devasini', 'jeremy allaire',
  'larry fink', 'david sacks', 'brian brooks',
  // Organizations
  'cantor fitzgerald', 'blackrock', 'paxos', 'chainalysis', 'palantir',
  // Concepts
  'cbdc', 'central bank digital', 'dollar hegemony', 'programmable money',
  'financial surveillance', 'treasury bill', 't-bill',
  // Government
  'treasury', 'federal reserve', 'sec crypto', 'fincen',
];

export interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
}

// Simple RSS parser (works in Edge runtime)
export async function parseRSSFeed(feedUrl: string, sourceName: string): Promise<RSSItem[]> {
  try {
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'StablecoinExplorer/1.0',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${sourceName}: ${response.status}`);
      return [];
    }

    const xml = await response.text();
    const items: RSSItem[] = [];

    // Simple regex-based XML parsing (works without external deps)
    const itemMatches = xml.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];

    for (const itemXml of itemMatches.slice(0, 20)) { // Limit to 20 items per feed
      const title = extractTag(itemXml, 'title');
      const description = extractTag(itemXml, 'description') || extractTag(itemXml, 'content:encoded');
      const link = extractTag(itemXml, 'link') || extractTag(itemXml, 'guid');
      const pubDate = extractTag(itemXml, 'pubDate') || extractTag(itemXml, 'dc:date');

      if (title && link) {
        items.push({
          title: cleanText(title),
          description: cleanText(description || ''),
          link: link.trim(),
          pubDate: pubDate || new Date().toISOString(),
          source: sourceName,
        });
      }
    }

    return items;
  } catch (error) {
    console.error(`Error parsing ${sourceName}:`, error);
    return [];
  }
}

function extractTag(xml: string, tagName: string): string | null {
  // Handle CDATA
  const cdataRegex = new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tagName}>`, 'i');
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1];

  // Handle regular tags
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1] : null;
}

function cleanText(text: string): string {
  return text
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

// Filter items by relevance to stablecoins
export function filterRelevantNews(items: RSSItem[]): RSSItem[] {
  return items.filter(item => {
    const text = `${item.title} ${item.description}`.toLowerCase();
    return STABLECOIN_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()));
  });
}

// Fetch all RSS feeds
export async function fetchAllRSSFeeds(): Promise<RSSItem[]> {
  const allItems: RSSItem[] = [];

  const results = await Promise.allSettled(
    RSS_FEEDS.map(feed => parseRSSFeed(feed.url, feed.name))
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value);
    }
  }

  // Filter for relevant news and sort by date
  const relevant = filterRelevantNews(allItems);
  relevant.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return relevant;
}
