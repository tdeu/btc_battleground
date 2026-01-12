// Entity matching system - links news items to entities in the database

import { entities } from '@/data/entities';

export interface EntityMatch {
  entityId: string;
  entityName: string;
  confidence: number;
}

// Keywords/aliases for each entity (for better matching)
const ENTITY_ALIASES: Record<string, string[]> = {
  // Stablecoins
  'usdt': ['tether', 'usdt', 'tether limited'],
  'usdc': ['usdc', 'usd coin', 'circle usdc'],
  'dai': ['dai', 'makerdao', 'maker dao'],
  'busd': ['busd', 'binance usd', 'binance stablecoin'],
  'pyusd': ['pyusd', 'paypal usd', 'paypal stablecoin'],

  // Organizations
  'tether-limited': ['tether', 'tether limited', 'tether holdings'],
  'circle': ['circle', 'circle internet', 'centre consortium'],
  'paxos': ['paxos', 'paxos trust'],
  'cantor-fitzgerald': ['cantor fitzgerald', 'cantor', 'howard lutnick'],
  'blackrock': ['blackrock', 'black rock', 'ishares'],
  'jpmorgan': ['jp morgan', 'jpmorgan', 'chase', 'jamie dimon'],
  'coinbase': ['coinbase', 'coinbase exchange'],
  'binance': ['binance', 'cz binance', 'changpeng zhao'],
  'chainalysis': ['chainalysis', 'chain analysis'],
  'palantir': ['palantir', 'peter thiel'],
  'alameda': ['alameda', 'alameda research'],
  'microstrategy': ['microstrategy', 'strategy', 'michael saylor'],

  // Government
  'fbi': ['fbi', 'federal bureau'],
  'treasury': ['treasury', 'us treasury', 'treasury department', 'janet yellen'],
  'federal-reserve': ['federal reserve', 'fed', 'jerome powell', 'fomc'],
  'sec': ['sec', 'securities and exchange', 'gary gensler'],
  'fincen': ['fincen', 'financial crimes enforcement'],
  'occ': ['occ', 'comptroller of the currency'],

  // Key People
  'howard-lutnick': ['howard lutnick', 'lutnick'],
  'paolo-ardoino': ['paolo ardoino', 'ardoino'],
  'giancarlo-devasini': ['giancarlo devasini', 'devasini'],
  'jeremy-allaire': ['jeremy allaire', 'allaire'],
  'charles-cascarilla': ['charles cascarilla', 'cascarilla'],
  'larry-fink': ['larry fink', 'fink'],
  'trump': ['donald trump', 'trump', 'president trump'],
  'jared-kushner': ['jared kushner', 'kushner'],
  'steve-mnuchin': ['steve mnuchin', 'mnuchin'],
  'david-sacks': ['david sacks', 'sacks'],
  'brian-brooks': ['brian brooks', 'brooks'],
  'sbf': ['sam bankman', 'bankman-fried', 'sbf', 'ftx'],
  'caroline-ellison': ['caroline ellison', 'ellison'],
  'michael-saylor': ['michael saylor', 'saylor'],
  'peter-thiel': ['peter thiel', 'thiel'],
  'sam-altman': ['sam altman', 'altman', 'openai'],
  'jamie-dimon': ['jamie dimon', 'dimon'],

  // Concepts
  'dollar-hegemony': ['dollar hegemony', 'dollar dominance', 'reserve currency'],
  'cbdc': ['cbdc', 'central bank digital', 'digital dollar', 'digital currency'],
  'programmable-money': ['programmable money', 'programmable currency', 'smart money'],
  'financial-surveillance': ['financial surveillance', 'surveillance', 'monitoring transactions'],
  'financial-industrial-complex': ['financial industrial complex', 'big finance'],
  'digital-id': ['digital id', 'digital identity', 'kyc'],

  // Events
  'ftx-collapse': ['ftx collapse', 'ftx bankruptcy', 'ftx fraud'],
  'tornado-cash': ['tornado cash', 'tornado sanctions'],
  'congressional-hearing': ['congressional hearing', 'congress stablecoin', 'senate hearing'],
};

// Find entities mentioned in text
export function matchEntities(text: string): EntityMatch[] {
  const normalizedText = text.toLowerCase();
  const matches: EntityMatch[] = [];
  const matchedIds = new Set<string>();

  // First, try alias matching (more specific)
  for (const [entityId, aliases] of Object.entries(ENTITY_ALIASES)) {
    for (const alias of aliases) {
      if (normalizedText.includes(alias.toLowerCase()) && !matchedIds.has(entityId)) {
        const entity = entities.find(e => e.id === entityId);
        if (entity) {
          matches.push({
            entityId: entity.id,
            entityName: entity.name,
            confidence: alias.length > 5 ? 0.9 : 0.7, // Longer matches = higher confidence
          });
          matchedIds.add(entityId);
        }
        break;
      }
    }
  }

  // Then, try direct name matching for any missed entities
  for (const entity of entities) {
    if (matchedIds.has(entity.id)) continue;

    const nameLower = entity.name.toLowerCase();
    // Only match if the full name appears (to avoid false positives)
    if (normalizedText.includes(nameLower) && nameLower.length > 3) {
      matches.push({
        entityId: entity.id,
        entityName: entity.name,
        confidence: 0.6,
      });
      matchedIds.add(entity.id);
    }
  }

  // Sort by confidence
  matches.sort((a, b) => b.confidence - a.confidence);

  return matches;
}

// Calculate relevance score for a news item
export function calculateRelevanceScore(
  title: string,
  description: string,
  matches: EntityMatch[]
): number {
  let score = 0;

  // Base score from number of entity matches
  score += matches.length * 0.2;

  // Bonus for high-confidence matches
  score += matches.filter(m => m.confidence > 0.8).length * 0.1;

  // Bonus for key terms in title
  const titleLower = title.toLowerCase();
  const keyTerms = ['stablecoin', 'tether', 'usdc', 'usdt', 'cbdc', 'digital dollar'];
  for (const term of keyTerms) {
    if (titleLower.includes(term)) {
      score += 0.15;
    }
  }

  // Cap at 1.0
  return Math.min(score, 1.0);
}
