import { Entity, TimelineEvent, EdgeType, GraphData, GraphLink } from '@/types';

// Edge type classification patterns
const EDGE_TYPE_PATTERNS: Record<EdgeType, RegExp> = {
  ownership: /owns|owned|subsidiary|parent|acquir|controls|controlled|majority|issued|issues/i,
  partnership: /partner|co-creat|collaborat|joint venture|alliance|cooperat/i,
  regulatory: /regulat|sanction|lawsuit|sue|investigat|wells notice|enforcement|fine|audit|killed|forced|ordered/i,
  funding: /invest|funded|raised|backing|capital|venture|seed|series|major.*investor/i,
  boardSeat: /board|director|\bceo\b|\bcto\b|\bcfo\b|\bcoo\b|founder|co-founder|executive|chief|president|chairman|works with|associate/i,
  custody: /custod|holds|stores|safekeep|vault|reserve|treasury|backing/i,
  other: /.*/i,
};

export function classifyEdgeType(relationship: string): EdgeType {
  const r = relationship.toLowerCase();
  if (EDGE_TYPE_PATTERNS.ownership.test(r)) return 'ownership';
  if (EDGE_TYPE_PATTERNS.regulatory.test(r)) return 'regulatory';
  if (EDGE_TYPE_PATTERNS.boardSeat.test(r)) return 'boardSeat';
  if (EDGE_TYPE_PATTERNS.funding.test(r)) return 'funding';
  if (EDGE_TYPE_PATTERNS.custody.test(r)) return 'custody';
  if (EDGE_TYPE_PATTERNS.partnership.test(r)) return 'partnership';
  return 'other';
}

export const entities: Entity[] = [
  // STABLECOINS
  {
    id: 'usdt',
    name: 'USDT (Tether)',
    type: 'stablecoin',
    description: 'Largest stablecoin. ~$100B+ in circulation.',
    decentralizationScore: 25,
    connections: [
      { targetId: 'tether-limited', targetName: 'Tether Limited', relationship: 'issued by' },
      { targetId: 'cantor-fitzgerald', targetName: 'Cantor Fitzgerald', relationship: 'treasury custodian' },
      { targetId: 'fbi', targetName: 'FBI', relationship: 'direct system access' },
      { targetId: 'chainalysis', targetName: 'Chainalysis', relationship: 'surveillance partner' },
      { targetId: 'binance', targetName: 'Binance', relationship: 'primary trading venue' },
    ],
  },
  {
    id: 'usdc',
    name: 'USDC',
    type: 'stablecoin',
    description: 'Second largest stablecoin. ~$25B+. US-regulated.',
    decentralizationScore: 30,
    connections: [
      { targetId: 'circle', targetName: 'Circle', relationship: 'issued by' },
      { targetId: 'blackrock', targetName: 'BlackRock', relationship: 'major investor' },
      { targetId: 'coinbase', targetName: 'Coinbase', relationship: 'co-creator' },
      { targetId: 'us-treasury', targetName: 'US Treasury', relationship: 'direct partnership' },
      { targetId: 'fincen', targetName: 'FinCEN', relationship: 'reporting pipeline' },
    ],
  },
  {
    id: 'dai',
    name: 'DAI',
    type: 'stablecoin',
    description: '"Decentralized" stablecoin. ~$5B. Crypto-collateralized.',
    decentralizationScore: 45,
    connections: [
      { targetId: 'usdc', targetName: 'USDC', relationship: 'significant collateral' },
      { targetId: 'dollar-hegemony', targetName: 'Dollar Hegemony', relationship: 'still pegged to USD' },
    ],
  },
  {
    id: 'busd',
    name: 'BUSD',
    type: 'stablecoin',
    description: 'Binance USD. Discontinued by regulatory order.',
    decentralizationScore: 25,
    connections: [
      { targetId: 'paxos', targetName: 'Paxos', relationship: 'was issued by' },
      { targetId: 'binance', targetName: 'Binance', relationship: 'branded by' },
      { targetId: 'sec', targetName: 'SEC', relationship: 'killed it' },
    ],
  },
  {
    id: 'pyusd',
    name: 'PYUSD',
    type: 'stablecoin',
    description: "PayPal's stablecoin.",
    decentralizationScore: 25,
    connections: [
      { targetId: 'paxos', targetName: 'Paxos', relationship: 'issued by' },
      { targetId: 'charles-cascarilla', targetName: 'Charles Cascarilla', relationship: 'Paxos CEO' },
    ],
  },

  // ORGANIZATIONS
  {
    id: 'tether-limited',
    name: 'Tether Limited',
    type: 'organization',
    description: 'Issues USDT. British Virgin Islands.',
    decentralizationScore: 20,
    connections: [
      { targetId: 'usdt', targetName: 'USDT (Tether)', relationship: 'issues' },
      { targetId: 'paolo-ardoino', targetName: 'Paolo Ardoino', relationship: 'CTO' },
      { targetId: 'giancarlo-devasini', targetName: 'Giancarlo Devasini', relationship: 'CFO' },
      { targetId: 'cantor-fitzgerald', targetName: 'Cantor Fitzgerald', relationship: 'treasury custodian' },
      { targetId: 'fbi', targetName: 'FBI', relationship: 'onboarded directly' },
    ],
  },
  {
    id: 'circle',
    name: 'Circle',
    type: 'organization',
    description: 'Issues USDC. US-based, regulated.',
    decentralizationScore: 25,
    connections: [
      { targetId: 'usdc', targetName: 'USDC', relationship: 'issues' },
      { targetId: 'jeremy-allaire', targetName: 'Jeremy Allaire', relationship: 'CEO' },
      { targetId: 'blackrock', targetName: 'BlackRock', relationship: 'investor' },
      { targetId: 'coinbase', targetName: 'Coinbase', relationship: 'co-creator' },
      { targetId: 'us-treasury', targetName: 'US Treasury', relationship: 'direct partnership' },
    ],
  },
  {
    id: 'paxos',
    name: 'Paxos',
    type: 'organization',
    description: 'Regulated stablecoin issuer. White-label model.',
    decentralizationScore: 25,
    connections: [
      { targetId: 'charles-cascarilla', targetName: 'Charles Cascarilla', relationship: 'CEO' },
      { targetId: 'pyusd', targetName: 'PYUSD', relationship: 'issues for PayPal' },
      { targetId: 'busd', targetName: 'BUSD', relationship: 'issued (discontinued)' },
      { targetId: 'peter-thiel', targetName: 'Peter Thiel', relationship: 'investor' },
    ],
  },
  {
    id: 'cantor-fitzgerald',
    name: 'Cantor Fitzgerald',
    type: 'organization',
    description: 'Financial services firm. Primary custodian for Tether reserves.',
    decentralizationScore: 15,
    connections: [
      { targetId: 'howard-lutnick', targetName: 'Howard Lutnick', relationship: 'CEO' },
      { targetId: 'tether-limited', targetName: 'Tether Limited', relationship: 'holds their treasury' },
      { targetId: 'usdt', targetName: 'USDT (Tether)', relationship: 'custodies backing' },
      { targetId: 'donald-trump', targetName: 'Donald Trump', relationship: 'Lutnick in cabinet' },
    ],
  },
  {
    id: 'blackrock',
    name: 'BlackRock',
    type: 'organization',
    description: "World's largest asset manager. ~$12 trillion AUM.",
    category: 'both',
    decentralizationScore: 10,
    captureStory: 'BlackRock represents the apex of financial centralization. With ~$12 trillion AUM, they are the largest investor in most major corporations. Their IBIT Bitcoin ETF quickly became the largest, and their USDC investment ties them to stablecoins. When BlackRock speaks, markets move. Their embrace of crypto signals not decentralization, but the absorption of crypto into traditional finance.',
    connections: [
      { targetId: 'larry-fink', targetName: 'Larry Fink', relationship: 'CEO' },
      { targetId: 'circle', targetName: 'Circle', relationship: 'major investor' },
      { targetId: 'us-treasury', targetName: 'US Treasury', relationship: 'advisory role' },
      { targetId: 'federal-reserve', targetName: 'Federal Reserve', relationship: 'crisis manager' },
      { targetId: 'ibit', targetName: 'iShares Bitcoin Trust (IBIT)', relationship: 'issues' },
      { targetId: 'coinbase-custody', targetName: 'Coinbase Custody', relationship: 'uses for IBIT custody' },
    ],
  },
  {
    id: 'jp-morgan',
    name: 'JP Morgan',
    type: 'organization',
    description: 'Largest US bank.',
    decentralizationScore: 10,
    connections: [
      { targetId: 'jamie-dimon', targetName: 'Jamie Dimon', relationship: 'CEO' },
      { targetId: 'federal-reserve', targetName: 'Federal Reserve', relationship: 'primary dealer' },
      { targetId: 'blackrock', targetName: 'BlackRock', relationship: 'intertwined' },
    ],
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    type: 'organization',
    description: 'Largest US crypto exchange.',
    decentralizationScore: 35,
    connections: [
      { targetId: 'usdc', targetName: 'USDC', relationship: 'co-creator' },
      { targetId: 'circle', targetName: 'Circle', relationship: 'partner' },
      { targetId: 'brian-brooks', targetName: 'Brian Brooks', relationship: 'former Chief Legal' },
      { targetId: 'chainalysis', targetName: 'Chainalysis', relationship: 'surveillance partner' },
    ],
  },
  {
    id: 'binance',
    name: 'Binance',
    type: 'organization',
    description: "World's largest crypto exchange by volume.",
    decentralizationScore: 30,
    connections: [
      { targetId: 'usdt', targetName: 'USDT (Tether)', relationship: 'primary stablecoin' },
      { targetId: 'busd', targetName: 'BUSD', relationship: 'was branded by' },
      { targetId: 'alameda-research', targetName: 'Alameda Research', relationship: 'major counterparty' },
    ],
  },
  {
    id: 'chainalysis',
    name: 'Chainalysis',
    type: 'organization',
    description: 'Blockchain analytics and surveillance company.',
    decentralizationScore: 10,
    connections: [
      { targetId: 'fbi', targetName: 'FBI', relationship: 'major client' },
      { targetId: 'tether-limited', targetName: 'Tether Limited', relationship: 'partner' },
      { targetId: 'circle', targetName: 'Circle', relationship: 'partner' },
      { targetId: 'coinbase', targetName: 'Coinbase', relationship: 'partner' },
    ],
  },
  {
    id: 'palantir',
    name: 'Palantir',
    type: 'organization',
    description: 'Data analytics and surveillance company.',
    decentralizationScore: 10,
    connections: [
      { targetId: 'peter-thiel', targetName: 'Peter Thiel', relationship: 'founder' },
      { targetId: 'financial-surveillance', targetName: 'Financial Surveillance', relationship: 'builds infrastructure' },
    ],
  },
  {
    id: 'alameda-research',
    name: 'Alameda Research',
    type: 'organization',
    description: 'Crypto trading firm. Collapsed with FTX.',
    decentralizationScore: 20,
    connections: [
      { targetId: 'sam-bankman-fried', targetName: 'Sam Bankman-Fried', relationship: 'founder' },
      { targetId: 'caroline-ellison', targetName: 'Caroline Ellison', relationship: 'CEO' },
      { targetId: 'usdt', targetName: 'USDT (Tether)', relationship: 'major issuer' },
      { targetId: 'ftx-collapse', targetName: 'FTX Collapse (2022)', relationship: 'collapsed' },
    ],
  },
  {
    id: 'strategy',
    name: 'Strategy (MicroStrategy)',
    type: 'organization',
    description: 'Largest corporate Bitcoin holder. ~450,000 BTC via convertible debt.',
    category: 'bitcoin',
    decentralizationScore: 25,
    connections: [
      { targetId: 'michael-saylor', targetName: 'Michael Saylor', relationship: 'founder' },
      { targetId: 'financial-industrial-complex', targetName: 'Financial Industrial Complex', relationship: 'subordinate to creditors' },
      { targetId: 'coinbase-custody', targetName: 'Coinbase Custody', relationship: 'custodian for BTC holdings' },
      { targetId: 'btc-etf-approval', targetName: 'BTC ETF Approval (Jan 2024)', relationship: 'benefited from approval' },
    ],
  },

  // BITCOIN ETFs
  {
    id: 'ibit',
    name: 'iShares Bitcoin Trust (IBIT)',
    type: 'organization',
    description: 'BlackRock Bitcoin ETF. Largest BTC ETF by AUM (~$55B).',
    category: 'bitcoin',
    decentralizationScore: 15,
    connections: [
      { targetId: 'blackrock', targetName: 'BlackRock', relationship: 'issued by' },
      { targetId: 'coinbase-custody', targetName: 'Coinbase Custody', relationship: 'custodian' },
      { targetId: 'larry-fink', targetName: 'Larry Fink', relationship: 'CEO of parent company' },
      { targetId: 'btc-etf-approval', targetName: 'BTC ETF Approval (Jan 2024)', relationship: 'approved' },
      { targetId: 'sec', targetName: 'SEC', relationship: 'regulated by' },
    ],
  },
  {
    id: 'fbtc',
    name: 'Fidelity Wise Origin (FBTC)',
    type: 'organization',
    description: 'Fidelity Bitcoin ETF. Second largest BTC ETF (~$20B AUM).',
    category: 'bitcoin',
    decentralizationScore: 20,
    connections: [
      { targetId: 'fidelity', targetName: 'Fidelity Investments', relationship: 'issued by' },
      { targetId: 'fidelity-digital', targetName: 'Fidelity Digital Assets', relationship: 'self-custody' },
      { targetId: 'btc-etf-approval', targetName: 'BTC ETF Approval (Jan 2024)', relationship: 'approved' },
      { targetId: 'sec', targetName: 'SEC', relationship: 'regulated by' },
    ],
  },
  {
    id: 'gbtc',
    name: 'Grayscale Bitcoin Trust (GBTC)',
    type: 'organization',
    description: 'First Bitcoin trust, converted to ETF. ~$18B AUM. High fees caused outflows.',
    category: 'bitcoin',
    decentralizationScore: 20,
    connections: [
      { targetId: 'grayscale', targetName: 'Grayscale Investments', relationship: 'issued by' },
      { targetId: 'coinbase-custody', targetName: 'Coinbase Custody', relationship: 'custodian' },
      { targetId: 'btc-etf-approval', targetName: 'BTC ETF Approval (Jan 2024)', relationship: 'converted to ETF' },
      { targetId: 'sec', targetName: 'SEC', relationship: 'sued SEC to force approval' },
    ],
  },
  {
    id: 'arkb',
    name: 'ARK 21Shares Bitcoin ETF (ARKB)',
    type: 'organization',
    description: 'ARK Invest and 21Shares joint Bitcoin ETF. ~$4B AUM.',
    category: 'bitcoin',
    decentralizationScore: 20,
    connections: [
      { targetId: 'cathie-wood', targetName: 'Cathie Wood', relationship: 'ARK Invest CEO' },
      { targetId: 'coinbase-custody', targetName: 'Coinbase Custody', relationship: 'custodian' },
      { targetId: 'btc-etf-approval', targetName: 'BTC ETF Approval (Jan 2024)', relationship: 'approved' },
    ],
  },

  // BITCOIN CUSTODIANS
  {
    id: 'coinbase-custody',
    name: 'Coinbase Custody',
    type: 'organization',
    description: 'Institutional crypto custody. Custodian for 8 of 11 spot Bitcoin ETFs.',
    category: 'bitcoin',
    decentralizationScore: 15,
    captureStory: 'Coinbase Custody represents the most critical single point of failure in Bitcoin ETFs. With custody of ~90% of all ETF Bitcoin holdings, a security breach, regulatory action, or operational failure could affect hundreds of billions in assets. This concentration directly contradicts Bitcoin\'s decentralization ethos.',
    connections: [
      { targetId: 'coinbase', targetName: 'Coinbase', relationship: 'subsidiary of' },
      { targetId: 'ibit', targetName: 'iShares Bitcoin Trust (IBIT)', relationship: 'custodian for' },
      { targetId: 'gbtc', targetName: 'Grayscale Bitcoin Trust (GBTC)', relationship: 'custodian for' },
      { targetId: 'arkb', targetName: 'ARK 21Shares Bitcoin ETF (ARKB)', relationship: 'custodian for' },
      { targetId: 'sec', targetName: 'SEC', relationship: 'under investigation' },
      { targetId: 'btc-custody-concentration', targetName: 'BTC Custody Concentration', relationship: 'primary cause' },
    ],
  },
  {
    id: 'fidelity-digital',
    name: 'Fidelity Digital Assets',
    type: 'organization',
    description: 'Fidelity\'s crypto custody arm. Self-custodies FBTC holdings.',
    category: 'bitcoin',
    decentralizationScore: 20,
    connections: [
      { targetId: 'fidelity', targetName: 'Fidelity Investments', relationship: 'subsidiary of' },
      { targetId: 'fbtc', targetName: 'Fidelity Wise Origin (FBTC)', relationship: 'custodian for' },
    ],
  },
  {
    id: 'bitgo',
    name: 'BitGo',
    type: 'organization',
    description: 'Institutional crypto custody and security. Multi-sig pioneer.',
    category: 'bitcoin',
    decentralizationScore: 25,
    connections: [
      { targetId: 'mike-belshe', targetName: 'Mike Belshe', relationship: 'CEO' },
      { targetId: 'galaxy-digital', targetName: 'Galaxy Digital', relationship: 'acquisition target' },
    ],
  },
  {
    id: 'fireblocks',
    name: 'Fireblocks',
    type: 'organization',
    description: 'Enterprise crypto custody and transfer network.',
    category: 'bitcoin',
    decentralizationScore: 25,
    connections: [
      { targetId: 'michael-shaulov', targetName: 'Michael Shaulov', relationship: 'CEO' },
    ],
  },

  // BITCOIN-RELATED ORGANIZATIONS
  {
    id: 'fidelity',
    name: 'Fidelity Investments',
    type: 'organization',
    description: 'Major asset manager. Early Bitcoin adopter among TradFi.',
    category: 'bitcoin',
    decentralizationScore: 25,
    connections: [
      { targetId: 'fbtc', targetName: 'Fidelity Wise Origin (FBTC)', relationship: 'issues' },
      { targetId: 'fidelity-digital', targetName: 'Fidelity Digital Assets', relationship: 'owns' },
      { targetId: 'abigail-johnson', targetName: 'Abigail Johnson', relationship: 'CEO' },
    ],
  },
  {
    id: 'grayscale',
    name: 'Grayscale Investments',
    type: 'organization',
    description: 'Crypto asset manager. Sued SEC to force ETF conversion.',
    category: 'bitcoin',
    decentralizationScore: 25,
    connections: [
      { targetId: 'gbtc', targetName: 'Grayscale Bitcoin Trust (GBTC)', relationship: 'issues' },
      { targetId: 'dcg', targetName: 'Digital Currency Group', relationship: 'owned by' },
      { targetId: 'michael-sonnenshein', targetName: 'Michael Sonnenshein', relationship: 'former CEO' },
      { targetId: 'sec', targetName: 'SEC', relationship: 'sued and won' },
    ],
  },
  {
    id: 'dcg',
    name: 'Digital Currency Group',
    type: 'organization',
    description: 'Crypto conglomerate. Owns Grayscale, Genesis, CoinDesk.',
    category: 'bitcoin',
    decentralizationScore: 25,
    connections: [
      { targetId: 'barry-silbert', targetName: 'Barry Silbert', relationship: 'founder & CEO' },
      { targetId: 'grayscale', targetName: 'Grayscale Investments', relationship: 'owns' },
      { targetId: 'genesis-bankruptcy', targetName: 'Genesis Bankruptcy (2023)', relationship: 'subsidiary collapsed' },
    ],
  },
  {
    id: 'galaxy-digital',
    name: 'Galaxy Digital',
    type: 'organization',
    description: 'Crypto merchant bank and asset manager.',
    category: 'bitcoin',
    decentralizationScore: 30,
    connections: [
      { targetId: 'mike-novogratz', targetName: 'Mike Novogratz', relationship: 'founder & CEO' },
      { targetId: 'bitgo', targetName: 'BitGo', relationship: 'attempted acquisition' },
    ],
  },

  // CORPORATE BTC HOLDERS
  {
    id: 'tesla',
    name: 'Tesla',
    type: 'organization',
    description: 'Electric vehicle company. Holds ~9,720 BTC.',
    category: 'bitcoin',
    decentralizationScore: 30,
    connections: [
      { targetId: 'elon-musk', targetName: 'Elon Musk', relationship: 'CEO' },
      { targetId: 'coinbase-custody', targetName: 'Coinbase Custody', relationship: 'likely custodian' },
    ],
  },
  {
    id: 'block-inc',
    name: 'Block Inc',
    type: 'organization',
    description: 'Formerly Square. Holds ~8,027 BTC. Jack Dorsey\'s company.',
    category: 'bitcoin',
    decentralizationScore: 40,
    connections: [
      { targetId: 'jack-dorsey', targetName: 'Jack Dorsey', relationship: 'founder & CEO' },
      { targetId: 'cash-app', targetName: 'Cash App', relationship: 'owns' },
    ],
  },
  {
    id: 'marathon-digital',
    name: 'Marathon Digital',
    type: 'organization',
    description: 'Bitcoin mining company. Holds ~44,000 BTC.',
    category: 'bitcoin',
    decentralizationScore: 25,
    connections: [
      { targetId: 'fred-thiel', targetName: 'Fred Thiel', relationship: 'CEO' },
      { targetId: 'btc-mining-centralization', targetName: 'BTC Mining Centralization', relationship: 'contributes to' },
    ],
  },

  // GOVERNMENT
  {
    id: 'fbi',
    name: 'FBI',
    type: 'government',
    description: 'Federal Bureau of Investigation.',
    decentralizationScore: 5,
    connections: [
      { targetId: 'tether-limited', targetName: 'Tether Limited', relationship: 'direct system access' },
      { targetId: 'usdt', targetName: 'USDT (Tether)', relationship: 'can request freezes' },
      { targetId: 'chainalysis', targetName: 'Chainalysis', relationship: 'surveillance partner' },
    ],
  },
  {
    id: 'us-treasury',
    name: 'US Treasury',
    type: 'government',
    description: 'Issues US debt. Benefits from stablecoin demand.',
    decentralizationScore: 5,
    connections: [
      { targetId: 'circle', targetName: 'Circle', relationship: 'direct partnership' },
      { targetId: 'tether-limited', targetName: 'Tether Limited', relationship: 'major treasury buyer' },
      { targetId: 'blackrock', targetName: 'BlackRock', relationship: 'advisory role' },
      { targetId: 'fincen', targetName: 'FinCEN', relationship: 'bureau' },
    ],
  },
  {
    id: 'federal-reserve',
    name: 'Federal Reserve',
    type: 'government',
    description: 'US central bank. Not directly issuing CBDC.',
    decentralizationScore: 5,
    connections: [
      { targetId: 'us-treasury', targetName: 'US Treasury', relationship: 'coordinates policy' },
      { targetId: 'blackrock', targetName: 'BlackRock', relationship: 'crisis manager' },
      { targetId: 'jp-morgan', targetName: 'JP Morgan', relationship: 'primary dealer' },
    ],
  },
  {
    id: 'sec',
    name: 'SEC',
    type: 'government',
    description: 'Securities and Exchange Commission.',
    decentralizationScore: 5,
    connections: [
      { targetId: 'paxos', targetName: 'Paxos', relationship: 'Wells notice for BUSD' },
      { targetId: 'busd', targetName: 'BUSD', relationship: 'forced discontinuation' },
      { targetId: 'coinbase', targetName: 'Coinbase', relationship: 'lawsuit' },
    ],
  },
  {
    id: 'fincen',
    name: 'FinCEN',
    type: 'government',
    description: 'Financial Crimes Enforcement Network.',
    decentralizationScore: 5,
    connections: [
      { targetId: 'us-treasury', targetName: 'US Treasury', relationship: 'parent agency' },
      { targetId: 'circle', targetName: 'Circle', relationship: 'direct reporting pipeline' },
      { targetId: 'chainalysis', targetName: 'Chainalysis', relationship: 'partner' },
    ],
  },
  {
    id: 'occ',
    name: 'OCC',
    type: 'government',
    description: 'Office of the Comptroller of the Currency.',
    decentralizationScore: 5,
    connections: [
      { targetId: 'brian-brooks', targetName: 'Brian Brooks', relationship: 'Acting Comptroller under Trump' },
      { targetId: 'coinbase', targetName: 'Coinbase', relationship: 'Brooks came from there' },
    ],
  },

  // PEOPLE
  {
    id: 'howard-lutnick',
    name: 'Howard Lutnick',
    type: 'person',
    description: 'CEO of Cantor Fitzgerald. Commerce Secretary nominee.',
    decentralizationScore: 30,
    connections: [
      { targetId: 'cantor-fitzgerald', targetName: 'Cantor Fitzgerald', relationship: 'CEO' },
      { targetId: 'tether-limited', targetName: 'Tether Limited', relationship: 'custodies their treasury' },
      { targetId: 'donald-trump', targetName: 'Donald Trump', relationship: 'cabinet nominee' },
    ],
  },
  {
    id: 'paolo-ardoino',
    name: 'Paolo Ardoino',
    type: 'person',
    description: 'CTO of Tether and Bitfinex.',
    decentralizationScore: 30,
    connections: [
      { targetId: 'tether-limited', targetName: 'Tether Limited', relationship: 'CTO' },
      { targetId: 'giancarlo-devasini', targetName: 'Giancarlo Devasini', relationship: 'works with' },
      { targetId: 'fbi', targetName: 'FBI', relationship: 'implemented access' },
    ],
  },
  {
    id: 'giancarlo-devasini',
    name: 'Giancarlo Devasini',
    type: 'person',
    description: 'CFO and real power at Tether.',
    decentralizationScore: 30,
    connections: [
      { targetId: 'tether-limited', targetName: 'Tether Limited', relationship: 'CFO, major shareholder' },
      { targetId: 'paolo-ardoino', targetName: 'Paolo Ardoino', relationship: 'works with' },
    ],
  },
  {
    id: 'jeremy-allaire',
    name: 'Jeremy Allaire',
    type: 'person',
    description: 'CEO of Circle.',
    decentralizationScore: 35,
    connections: [
      { targetId: 'circle', targetName: 'Circle', relationship: 'CEO' },
      { targetId: 'usdc', targetName: 'USDC', relationship: 'creator' },
      { targetId: 'blackrock', targetName: 'BlackRock', relationship: 'investor relationship' },
    ],
  },
  {
    id: 'charles-cascarilla',
    name: 'Charles Cascarilla',
    type: 'person',
    description: 'CEO of Paxos.',
    decentralizationScore: 35,
    connections: [
      { targetId: 'paxos', targetName: 'Paxos', relationship: 'CEO' },
      { targetId: 'pyusd', targetName: 'PYUSD', relationship: 'issues for PayPal' },
      { targetId: 'congressional-hearing', targetName: 'Congressional Hearing (March 2025)', relationship: 'testified' },
    ],
  },
  {
    id: 'larry-fink',
    name: 'Larry Fink',
    type: 'person',
    description: 'CEO of BlackRock.',
    decentralizationScore: 25,
    connections: [
      { targetId: 'blackrock', targetName: 'BlackRock', relationship: 'CEO' },
      { targetId: 'circle', targetName: 'Circle', relationship: 'investor' },
      { targetId: 'financial-industrial-complex', targetName: 'Financial Industrial Complex', relationship: 'central figure' },
    ],
  },
  {
    id: 'donald-trump',
    name: 'Donald Trump',
    type: 'person',
    description: '45th and 47th US President.',
    decentralizationScore: 35,
    connections: [
      { targetId: 'howard-lutnick', targetName: 'Howard Lutnick', relationship: 'Commerce Secretary' },
      { targetId: 'david-sacks', targetName: 'David Sacks', relationship: 'Crypto Czar' },
      { targetId: 'brian-brooks', targetName: 'Brian Brooks', relationship: 'appointed to OCC' },
      { targetId: 'cbdc', targetName: 'CBDC', relationship: 'opposes publicly' },
    ],
  },
  {
    id: 'jared-kushner',
    name: 'Jared Kushner',
    type: 'person',
    description: 'Trump son-in-law. Discussed stablecoins with Treasury.',
    decentralizationScore: 30,
    connections: [
      { targetId: 'donald-trump', targetName: 'Donald Trump', relationship: 'father-in-law' },
      { targetId: 'steve-mnuchin', targetName: 'Steve Mnuchin', relationship: 'emailed about stablecoins' },
      { targetId: 'sam-altman', targetName: 'Sam Altman', relationship: 'forwarded his blog post' },
    ],
  },
  {
    id: 'steve-mnuchin',
    name: 'Steve Mnuchin',
    type: 'person',
    description: 'Treasury Secretary (Trump 1.0). Goldman Sachs background.',
    decentralizationScore: 25,
    connections: [
      { targetId: 'us-treasury', targetName: 'US Treasury', relationship: 'Secretary 2017-2021' },
      { targetId: 'jared-kushner', targetName: 'Jared Kushner', relationship: 'received stablecoin proposal' },
    ],
  },
  {
    id: 'david-sacks',
    name: 'David Sacks',
    type: 'person',
    description: 'Crypto and AI Czar (Trump 2.0). PayPal Mafia.',
    decentralizationScore: 40,
    connections: [
      { targetId: 'donald-trump', targetName: 'Donald Trump', relationship: 'appointed by' },
      { targetId: 'peter-thiel', targetName: 'Peter Thiel', relationship: 'PayPal Mafia colleague' },
      { targetId: 'cbdc', targetName: 'CBDC', relationship: 'opposes' },
    ],
  },
  {
    id: 'brian-brooks',
    name: 'Brian Brooks',
    type: 'person',
    description: 'Former OCC head. Ex-Coinbase.',
    decentralizationScore: 35,
    connections: [
      { targetId: 'occ', targetName: 'OCC', relationship: 'Acting Comptroller' },
      { targetId: 'coinbase', targetName: 'Coinbase', relationship: 'former Chief Legal' },
      { targetId: 'donald-trump', targetName: 'Donald Trump', relationship: 'appointed by' },
    ],
  },
  {
    id: 'sam-bankman-fried',
    name: 'Sam Bankman-Fried',
    type: 'person',
    description: 'Founder of FTX and Alameda. Convicted fraudster.',
    decentralizationScore: 15,
    connections: [
      { targetId: 'alameda-research', targetName: 'Alameda Research', relationship: 'founder' },
      { targetId: 'caroline-ellison', targetName: 'Caroline Ellison', relationship: 'associate' },
      { targetId: 'usdt', targetName: 'USDT (Tether)', relationship: 'used for manipulation' },
      { targetId: 'ftx-collapse', targetName: 'FTX Collapse (2022)', relationship: 'collapsed' },
    ],
  },
  {
    id: 'caroline-ellison',
    name: 'Caroline Ellison',
    type: 'person',
    description: 'CEO of Alameda Research. Key FTX witness.',
    decentralizationScore: 20,
    connections: [
      { targetId: 'alameda-research', targetName: 'Alameda Research', relationship: 'CEO' },
      { targetId: 'sam-bankman-fried', targetName: 'Sam Bankman-Fried', relationship: 'associate' },
      { targetId: 'ftx-collapse', targetName: 'FTX Collapse (2022)', relationship: 'testified' },
    ],
  },
  {
    id: 'michael-saylor',
    name: 'Michael Saylor',
    type: 'person',
    description: 'Founder of Strategy. Largest corporate Bitcoin holder.',
    decentralizationScore: 50,
    connections: [
      { targetId: 'strategy', targetName: 'Strategy (MicroStrategy)', relationship: 'founder' },
      { targetId: 'financial-industrial-complex', targetName: 'Financial Industrial Complex', relationship: 'subordinate to creditors' },
    ],
  },
  {
    id: 'peter-thiel',
    name: 'Peter Thiel',
    type: 'person',
    description: 'PayPal co-founder. Palantir founder.',
    decentralizationScore: 40,
    connections: [
      { targetId: 'palantir', targetName: 'Palantir', relationship: 'founder' },
      { targetId: 'paxos', targetName: 'Paxos', relationship: 'investor' },
      { targetId: 'david-sacks', targetName: 'David Sacks', relationship: 'PayPal Mafia colleague' },
    ],
  },
  {
    id: 'sam-altman',
    name: 'Sam Altman',
    type: 'person',
    description: 'CEO of OpenAI. Worldcoin founder.',
    decentralizationScore: 35,
    connections: [
      { targetId: 'jared-kushner', targetName: 'Jared Kushner', relationship: 'blog post forwarded' },
      { targetId: 'digital-id', targetName: 'Digital ID', relationship: 'Worldcoin builds this' },
    ],
  },
  {
    id: 'jamie-dimon',
    name: 'Jamie Dimon',
    type: 'person',
    description: 'CEO of JP Morgan.',
    decentralizationScore: 20,
    connections: [
      { targetId: 'jp-morgan', targetName: 'JP Morgan', relationship: 'CEO' },
      { targetId: 'financial-industrial-complex', targetName: 'Financial Industrial Complex', relationship: 'core member' },
    ],
  },

  // BITCOIN-RELATED PEOPLE
  {
    id: 'cathie-wood',
    name: 'Cathie Wood',
    type: 'person',
    description: 'CEO of ARK Invest. Early Bitcoin ETF advocate.',
    category: 'bitcoin',
    decentralizationScore: 45,
    connections: [
      { targetId: 'arkb', targetName: 'ARK 21Shares Bitcoin ETF (ARKB)', relationship: 'manages' },
      { targetId: 'btc-etf-approval', targetName: 'BTC ETF Approval (Jan 2024)', relationship: 'lobbied for' },
    ],
  },
  {
    id: 'jack-dorsey',
    name: 'Jack Dorsey',
    type: 'person',
    description: 'Founder of Twitter and Block Inc. Bitcoin maximalist.',
    category: 'bitcoin',
    decentralizationScore: 70,
    connections: [
      { targetId: 'block-inc', targetName: 'Block Inc', relationship: 'founder & CEO' },
      { targetId: 'cash-app', targetName: 'Cash App', relationship: 'owns via Block' },
    ],
  },
  {
    id: 'elon-musk',
    name: 'Elon Musk',
    type: 'person',
    description: 'CEO of Tesla and SpaceX. Owns X (Twitter). Crypto market mover.',
    category: 'both',
    decentralizationScore: 45,
    connections: [
      { targetId: 'tesla', targetName: 'Tesla', relationship: 'CEO' },
      { targetId: 'donald-trump', targetName: 'Donald Trump', relationship: 'DOGE advisor' },
    ],
  },
  {
    id: 'barry-silbert',
    name: 'Barry Silbert',
    type: 'person',
    description: 'Founder of Digital Currency Group. Major crypto investor.',
    category: 'bitcoin',
    decentralizationScore: 40,
    connections: [
      { targetId: 'dcg', targetName: 'Digital Currency Group', relationship: 'founder & CEO' },
      { targetId: 'grayscale', targetName: 'Grayscale Investments', relationship: 'owns via DCG' },
      { targetId: 'genesis-bankruptcy', targetName: 'Genesis Bankruptcy (2023)', relationship: 'subsidiary collapsed' },
    ],
  },
  {
    id: 'mike-novogratz',
    name: 'Mike Novogratz',
    type: 'person',
    description: 'CEO of Galaxy Digital. Former Goldman Sachs partner.',
    category: 'bitcoin',
    decentralizationScore: 45,
    connections: [
      { targetId: 'galaxy-digital', targetName: 'Galaxy Digital', relationship: 'founder & CEO' },
    ],
  },
  {
    id: 'abigail-johnson',
    name: 'Abigail Johnson',
    type: 'person',
    description: 'CEO of Fidelity. Championed early crypto adoption.',
    category: 'bitcoin',
    decentralizationScore: 40,
    connections: [
      { targetId: 'fidelity', targetName: 'Fidelity Investments', relationship: 'CEO' },
      { targetId: 'fidelity-digital', targetName: 'Fidelity Digital Assets', relationship: 'created' },
    ],
  },
  {
    id: 'michael-sonnenshein',
    name: 'Michael Sonnenshein',
    type: 'person',
    description: 'Former CEO of Grayscale. Led SEC lawsuit.',
    category: 'bitcoin',
    decentralizationScore: 40,
    connections: [
      { targetId: 'grayscale', targetName: 'Grayscale Investments', relationship: 'former CEO' },
      { targetId: 'gbtc', targetName: 'Grayscale Bitcoin Trust (GBTC)', relationship: 'led ETF conversion' },
    ],
  },
  {
    id: 'mike-belshe',
    name: 'Mike Belshe',
    type: 'person',
    description: 'CEO of BitGo. Crypto custody pioneer.',
    category: 'bitcoin',
    decentralizationScore: 50,
    connections: [
      { targetId: 'bitgo', targetName: 'BitGo', relationship: 'CEO' },
    ],
  },
  {
    id: 'michael-shaulov',
    name: 'Michael Shaulov',
    type: 'person',
    description: 'CEO of Fireblocks.',
    category: 'bitcoin',
    decentralizationScore: 45,
    connections: [
      { targetId: 'fireblocks', targetName: 'Fireblocks', relationship: 'CEO' },
    ],
  },
  {
    id: 'fred-thiel',
    name: 'Fred Thiel',
    type: 'person',
    description: 'CEO of Marathon Digital.',
    category: 'bitcoin',
    decentralizationScore: 45,
    connections: [
      { targetId: 'marathon-digital', targetName: 'Marathon Digital', relationship: 'CEO' },
    ],
  },

  // CONCEPTS
  {
    id: 'dollar-hegemony',
    name: 'Dollar Hegemony',
    type: 'concept',
    description: "US dollar's dominance as world reserve currency.",
    decentralizationScore: 10,
    connections: [
      { targetId: 'us-treasury', targetName: 'US Treasury', relationship: 'issues the debt' },
      { targetId: 'usdt', targetName: 'USDT (Tether)', relationship: 'extends dollar globally' },
      { targetId: 'usdc', targetName: 'USDC', relationship: 'extends dollar with compliance' },
    ],
  },
  {
    id: 'cbdc',
    name: 'CBDC',
    type: 'concept',
    description: 'Central Bank Digital Currency. Government-issued digital money.',
    decentralizationScore: 15,
    connections: [
      { targetId: 'usdt', targetName: 'USDT (Tether)', relationship: 'has same capabilities' },
      { targetId: 'usdc', targetName: 'USDC', relationship: 'has same capabilities' },
      { targetId: 'donald-trump', targetName: 'Donald Trump', relationship: 'opposes publicly' },
      { targetId: 'programmable-money', targetName: 'Programmable Money', relationship: 'feared feature' },
    ],
  },
  {
    id: 'programmable-money',
    name: 'Programmable Money',
    type: 'concept',
    description: 'Money with built-in rules and restrictions.',
    decentralizationScore: 20,
    connections: [
      { targetId: 'usdt', targetName: 'USDT (Tether)', relationship: 'can freeze/blacklist' },
      { targetId: 'usdc', targetName: 'USDC', relationship: 'can freeze/blacklist' },
      { targetId: 'cbdc', targetName: 'CBDC', relationship: 'shares same capabilities' },
    ],
  },
  {
    id: 'financial-surveillance',
    name: 'Financial Surveillance',
    type: 'concept',
    description: 'Monitoring all financial transactions.',
    decentralizationScore: 10,
    connections: [
      { targetId: 'chainalysis', targetName: 'Chainalysis', relationship: 'primary infrastructure' },
      { targetId: 'fbi', targetName: 'FBI', relationship: 'direct Tether access' },
      { targetId: 'fincen', targetName: 'FinCEN', relationship: 'Circle reporting' },
    ],
  },
  {
    id: 'financial-industrial-complex',
    name: 'Financial Industrial Complex',
    type: 'concept',
    description: 'Network of asset managers and banks controlling capital globally.',
    decentralizationScore: 10,
    connections: [
      { targetId: 'blackrock', targetName: 'BlackRock', relationship: 'central node' },
      { targetId: 'larry-fink', targetName: 'Larry Fink', relationship: 'key figure' },
      { targetId: 'jp-morgan', targetName: 'JP Morgan', relationship: 'core member' },
    ],
  },
  {
    id: 'digital-id',
    name: 'Digital ID',
    type: 'concept',
    description: 'Digital identity systems. Prerequisite for stablecoins and CBDCs.',
    decentralizationScore: 20,
    connections: [
      { targetId: 'sam-altman', targetName: 'Sam Altman', relationship: 'builds Worldcoin' },
      { targetId: 'palantir', targetName: 'Palantir', relationship: 'builds systems' },
    ],
  },

  // BITCOIN CONCEPTS
  {
    id: 'btc-custody-concentration',
    name: 'BTC Custody Concentration',
    type: 'concept',
    description: 'Coinbase custodies 8 of 11 Bitcoin ETFs, creating systemic risk.',
    category: 'bitcoin',
    decentralizationScore: 15,
    captureStory: 'The irony of Bitcoin ETFs is profound: a technology designed to eliminate trusted third parties now depends almost entirely on a single custodian. Coinbase Custody holds hundreds of billions in Bitcoin across multiple ETFs. This creates a honeypot for hackers, a single point for regulatory pressure, and concentrates counterparty risk in ways that contradict Bitcoin\'s founding principles.',
    connections: [
      { targetId: 'coinbase-custody', targetName: 'Coinbase Custody', relationship: 'primary cause' },
      { targetId: 'ibit', targetName: 'iShares Bitcoin Trust (IBIT)', relationship: 'example' },
      { targetId: 'gbtc', targetName: 'Grayscale Bitcoin Trust (GBTC)', relationship: 'example' },
    ],
  },
  {
    id: 'btc-mining-centralization',
    name: 'BTC Mining Centralization',
    type: 'concept',
    description: 'Bitcoin mining increasingly concentrated in large public companies.',
    category: 'bitcoin',
    decentralizationScore: 25,
    connections: [
      { targetId: 'marathon-digital', targetName: 'Marathon Digital', relationship: 'major miner' },
    ],
  },
  {
    id: 'self-custody',
    name: 'Self-Custody',
    type: 'concept',
    description: '"Not your keys, not your coins." Core Bitcoin ethos being eroded.',
    category: 'bitcoin',
    decentralizationScore: 95,
    captureStory: 'Self-custody was once the default for Bitcoin holders. Today, estimates suggest only ~30% of Bitcoin is self-custodied, down from ~90% in 2015. ETFs, exchanges, and institutional custody have made "not your keys, not your coins" a minority practice. This represents the quiet capture of Bitcoin by traditional finance.',
    connections: [
      { targetId: 'btc-custody-concentration', targetName: 'BTC Custody Concentration', relationship: 'threatened by' },
      { targetId: 'coinbase-custody', targetName: 'Coinbase Custody', relationship: 'alternative to' },
    ],
  },
  {
    id: 'cash-app',
    name: 'Cash App',
    type: 'concept',
    description: 'Block Inc payment app with Bitcoin buying feature.',
    category: 'bitcoin',
    decentralizationScore: 55,
    connections: [
      { targetId: 'block-inc', targetName: 'Block Inc', relationship: 'owned by' },
      { targetId: 'jack-dorsey', targetName: 'Jack Dorsey', relationship: 'created by' },
    ],
  },
  {
    id: 'bitcoin-protocol',
    name: 'Bitcoin Protocol',
    type: 'concept',
    description: 'The Bitcoin network itself - a decentralized, permissionless, censorship-resistant protocol. The benchmark for true decentralization.',
    category: 'bitcoin',
    decentralizationScore: 100,
    captureStory: 'Bitcoin was created as a peer-to-peer electronic cash system with no central authority. Its open-source protocol, distributed mining, and permissionless nature represent the gold standard of decentralization that all other entities are measured against. However, the growing concentration of Bitcoin in ETFs, custodians, and corporate treasuries threatens these founding principles.',
    connections: [
      { targetId: 'self-custody', targetName: 'Self-Custody', relationship: 'enables' },
      { targetId: 'btc-custody-concentration', targetName: 'BTC Custody Concentration', relationship: 'threatened by' },
      { targetId: 'btc-mining-centralization', targetName: 'BTC Mining Centralization', relationship: 'vulnerable to' },
    ],
  },

  // EVENTS
  {
    id: 'ftx-collapse',
    name: 'FTX Collapse (2022)',
    type: 'event',
    description: "Sam Bankman-Fried's exchange collapsed.",
    decentralizationScore: 50,
    connections: [
      { targetId: 'sam-bankman-fried', targetName: 'Sam Bankman-Fried', relationship: 'founder' },
      { targetId: 'alameda-research', targetName: 'Alameda Research', relationship: 'trading arm' },
      { targetId: 'caroline-ellison', targetName: 'Caroline Ellison', relationship: 'testified' },
      { targetId: 'usdt', targetName: 'USDT (Tether)', relationship: 'used for manipulation' },
    ],
    metadata: { date: '2022-11' },
  },
  {
    id: 'tornado-cash-sanctions',
    name: 'Tornado Cash Sanctions (2022)',
    type: 'event',
    description: 'US Treasury sanctioned Tornado Cash. USDC froze $65M+.',
    decentralizationScore: 50,
    connections: [
      { targetId: 'us-treasury', targetName: 'US Treasury', relationship: 'issued sanctions' },
      { targetId: 'usdc', targetName: 'USDC', relationship: 'froze funds instantly' },
      { targetId: 'circle', targetName: 'Circle', relationship: 'complied immediately' },
      { targetId: 'programmable-money', targetName: 'Programmable Money', relationship: 'demonstrated' },
    ],
    metadata: { date: '2022-08' },
  },
  {
    id: 'congressional-hearing',
    name: 'Congressional Hearing (March 2025)',
    type: 'event',
    description: 'US Congressional hearing on stablecoins.',
    decentralizationScore: 50,
    connections: [
      { targetId: 'charles-cascarilla', targetName: 'Charles Cascarilla', relationship: 'testified' },
      { targetId: 'paxos', targetName: 'Paxos', relationship: 'CEO testified' },
      { targetId: 'financial-surveillance', targetName: 'Financial Surveillance', relationship: 'admitted capabilities' },
    ],
    metadata: { date: '2025-03' },
  },

  // BITCOIN EVENTS
  {
    id: 'btc-etf-approval',
    name: 'BTC ETF Approval (Jan 2024)',
    type: 'event',
    description: 'SEC approves 11 spot Bitcoin ETFs. Watershed moment for institutional adoption.',
    category: 'bitcoin',
    decentralizationScore: 50,
    captureStory: 'January 10, 2024 marked Bitcoin\'s full embrace by Wall Street. The SEC approved 11 spot Bitcoin ETFs simultaneously, including products from BlackRock, Fidelity, and Grayscale. Within months, these ETFs accumulated over $100B in assets. But this "victory" came at a cost: Bitcoin holdings concentrated into custodial honeypots, with Coinbase alone securing ~90% of ETF Bitcoin.',
    connections: [
      { targetId: 'sec', targetName: 'SEC', relationship: 'approved' },
      { targetId: 'ibit', targetName: 'iShares Bitcoin Trust (IBIT)', relationship: 'approved' },
      { targetId: 'fbtc', targetName: 'Fidelity Wise Origin (FBTC)', relationship: 'approved' },
      { targetId: 'gbtc', targetName: 'Grayscale Bitcoin Trust (GBTC)', relationship: 'converted' },
      { targetId: 'coinbase-custody', targetName: 'Coinbase Custody', relationship: 'became dominant custodian' },
      { targetId: 'btc-custody-concentration', targetName: 'BTC Custody Concentration', relationship: 'created' },
    ],
    metadata: { date: '2024-01' },
  },
  {
    id: 'genesis-bankruptcy',
    name: 'Genesis Bankruptcy (2023)',
    type: 'event',
    description: 'Genesis Global filed for bankruptcy. DCG subsidiary collapse.',
    category: 'bitcoin',
    decentralizationScore: 50,
    connections: [
      { targetId: 'dcg', targetName: 'Digital Currency Group', relationship: 'parent company' },
      { targetId: 'barry-silbert', targetName: 'Barry Silbert', relationship: 'DCG founder' },
      { targetId: 'ftx-collapse', targetName: 'FTX Collapse (2022)', relationship: 'contagion from' },
    ],
    metadata: { date: '2023-01' },
  },
  {
    id: 'microstrategy-btc-buys',
    name: 'MicroStrategy BTC Accumulation (2020-)',
    type: 'event',
    description: 'MicroStrategy begins aggressive Bitcoin buying via debt.',
    category: 'bitcoin',
    decentralizationScore: 50,
    connections: [
      { targetId: 'strategy', targetName: 'Strategy (MicroStrategy)', relationship: 'buyer' },
      { targetId: 'michael-saylor', targetName: 'Michael Saylor', relationship: 'architect' },
      { targetId: 'financial-industrial-complex', targetName: 'Financial Industrial Complex', relationship: 'funded by' },
    ],
    metadata: { date: '2020-08' },
  },
];

export const timelineEvents: TimelineEvent[] = [
  {
    id: 'te-1',
    date: '2014-10-06',
    title: 'Tether (USDT) Launched',
    description: 'First major stablecoin launched, originally called "Realcoin".',
    entityIds: ['usdt', 'tether-limited'],
    type: 'event',
  },
  {
    id: 'te-2',
    date: '2018-09-26',
    title: 'USDC Launched',
    description: 'Circle and Coinbase launch USDC through Centre Consortium.',
    entityIds: ['usdc', 'circle', 'coinbase'],
    type: 'event',
  },
  {
    id: 'te-3',
    date: '2022-08-08',
    title: 'Tornado Cash Sanctioned',
    description: 'US Treasury sanctions Tornado Cash. Circle freezes $65M+ in USDC.',
    entityIds: ['tornado-cash-sanctions', 'usdc', 'circle', 'us-treasury'],
    type: 'event',
  },
  {
    id: 'te-4',
    date: '2022-11-11',
    title: 'FTX Collapse',
    description: 'FTX files for bankruptcy. Alameda exposed for using Tether for manipulation.',
    entityIds: ['ftx-collapse', 'sam-bankman-fried', 'alameda-research'],
    type: 'event',
  },
  {
    id: 'te-5',
    date: '2023-02-13',
    title: 'Paxos Ordered to Stop BUSD',
    description: 'NYDFS orders Paxos to stop minting BUSD. SEC issues Wells notice.',
    entityIds: ['busd', 'paxos', 'sec'],
    type: 'event',
  },
  {
    id: 'te-6',
    date: '2023-08-07',
    title: 'PayPal Launches PYUSD',
    description: 'PayPal launches PYUSD stablecoin, issued by Paxos.',
    entityIds: ['pyusd', 'paxos'],
    type: 'event',
  },
  {
    id: 'te-7',
    date: '2025-01-20',
    title: 'Trump Returns, Lutnick Nominated',
    description: 'Howard Lutnick nominated as Commerce Secretary. Direct Tether-government connection.',
    entityIds: ['donald-trump', 'howard-lutnick', 'cantor-fitzgerald'],
    type: 'event',
  },
  {
    id: 'te-8',
    date: '2025-03-15',
    title: 'Congressional Hearing on Stablecoins',
    description: 'Paxos CEO admits stablecoins can monitor, freeze, reverse transactions.',
    entityIds: ['congressional-hearing', 'charles-cascarilla', 'paxos'],
    type: 'event',
  },

  // BITCOIN TIMELINE EVENTS
  {
    id: 'te-btc-1',
    date: '2020-08-11',
    title: 'MicroStrategy Announces Bitcoin Strategy',
    description: 'MicroStrategy buys first $250M in Bitcoin, beginning corporate adoption trend.',
    entityIds: ['strategy', 'michael-saylor', 'microstrategy-btc-buys'],
    type: 'event',
  },
  {
    id: 'te-btc-2',
    date: '2021-02-08',
    title: 'Tesla Buys $1.5B in Bitcoin',
    description: 'Tesla reveals $1.5B Bitcoin purchase, later sold most holdings.',
    entityIds: ['tesla', 'elon-musk'],
    type: 'event',
  },
  {
    id: 'te-btc-3',
    date: '2023-01-19',
    title: 'Genesis Files for Bankruptcy',
    description: 'Genesis Global declares bankruptcy following FTX contagion.',
    entityIds: ['genesis-bankruptcy', 'dcg', 'barry-silbert'],
    type: 'event',
  },
  {
    id: 'te-btc-4',
    date: '2023-08-29',
    title: 'Grayscale Wins SEC Lawsuit',
    description: 'Court rules SEC wrong to deny GBTC ETF conversion. Forces approval.',
    entityIds: ['grayscale', 'gbtc', 'sec'],
    type: 'event',
  },
  {
    id: 'te-btc-5',
    date: '2024-01-10',
    title: 'SEC Approves Spot Bitcoin ETFs',
    description: '11 spot Bitcoin ETFs approved simultaneously. BlackRock, Fidelity, Grayscale lead.',
    entityIds: ['btc-etf-approval', 'ibit', 'fbtc', 'gbtc', 'sec'],
    type: 'event',
  },
  {
    id: 'te-btc-6',
    date: '2024-03-14',
    title: 'Bitcoin ETFs Hit $50B AUM',
    description: 'Combined Bitcoin ETF assets under management surpass $50 billion.',
    entityIds: ['ibit', 'fbtc', 'coinbase-custody'],
    type: 'event',
  },
  {
    id: 'te-btc-7',
    date: '2024-11-05',
    title: 'Trump Wins Election',
    description: 'Pro-crypto Trump wins presidency. Howard Lutnick nominated for Commerce.',
    entityIds: ['donald-trump', 'howard-lutnick', 'david-sacks'],
    type: 'event',
  },
];

// Helper function to convert entities to graph data
export function getGraphData(): GraphData {
  const nodes = entities.map(e => ({
    id: e.id,
    name: e.name,
    type: e.type,
    connections: e.connections.length,
  }));

  const links: GraphLink[] = [];
  const seenLinks = new Set<string>();

  entities.forEach(entity => {
    entity.connections.forEach(conn => {
      const linkKey = [entity.id, conn.targetId].sort().join('-');
      if (!seenLinks.has(linkKey)) {
        seenLinks.add(linkKey);
        links.push({
          source: entity.id,
          target: conn.targetId,
          relationship: conn.relationship,
          edgeType: classifyEdgeType(conn.relationship),
          strength: 0.5,
          verified: false,
        });
      }
    });
  });

  return { nodes, links };
}

// Helper function to get stats
export function getStats() {
  const byType: Record<string, number> = {};
  entities.forEach(e => {
    byType[e.type] = (byType[e.type] || 0) + 1;
  });

  let totalConnections = 0;
  entities.forEach(e => {
    totalConnections += e.connections.length;
  });

  return {
    totalEntities: entities.length,
    totalConnections: Math.floor(totalConnections / 2), // Divide by 2 for bidirectional
    byType,
    recentUpdates: timelineEvents.length,
  };
}
