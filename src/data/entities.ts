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
    scoreBreakdown: {
      custody: 10,        // Cantor Fitzgerald holds all reserves
      transparency: 30,   // Quarterly attestations, not full audits
      permissionless: 35, // Can freeze/blacklist addresses
    },
    connections: [
      { targetId: 'tether-limited', targetName: 'Tether Limited', relationship: 'issued by', explanation: 'Tether Limited is the sole issuer of USDT, giving it complete control over minting, burning, and blacklisting of tokens.' },
      { targetId: 'cantor-fitzgerald', targetName: 'Cantor Fitzgerald', relationship: 'treasury custodian', explanation: 'Cantor Fitzgerald holds Tether\'s treasury reserves, meaning a single traditional finance firm controls the backing for $100B+ in crypto assets.' },
      { targetId: 'fbi', targetName: 'FBI', relationship: 'direct system access', explanation: 'The FBI has been granted direct access to Tether\'s systems, allowing law enforcement to freeze funds without court orders.' },
      { targetId: 'chainalysis', targetName: 'Chainalysis', relationship: 'surveillance partner', explanation: 'Chainalysis monitors all USDT transactions for Tether, creating a comprehensive surveillance database of stablecoin usage.' },
      { targetId: 'binance', targetName: 'Binance', relationship: 'primary trading venue', explanation: 'Binance is the largest venue for USDT trading, concentrating liquidity and creating dependency on a single exchange.' },
    ],
  },
  {
    id: 'usdc',
    name: 'USDC',
    type: 'stablecoin',
    description: 'Second largest stablecoin. ~$25B+. US-regulated.',
    decentralizationScore: 30,
    scoreBreakdown: {
      custody: 15,        // BlackRock and banks hold reserves
      transparency: 60,   // Monthly attestations, reserve reports
      permissionless: 25, // Can freeze addresses instantly (did $65M+ during Tornado Cash)
    },
    connections: [
      { targetId: 'circle', targetName: 'Circle', relationship: 'issued by', explanation: 'Circle is the sole issuer of USDC, controlling all minting, redemption, and blacklist operations.' },
      { targetId: 'blackrock', targetName: 'BlackRock', relationship: 'major investor', explanation: 'BlackRock invested in Circle, giving the world\'s largest asset manager influence over the company that issues USDC.' },
      { targetId: 'coinbase', targetName: 'Coinbase', relationship: 'co-creator', explanation: 'Coinbase co-created USDC through the Centre consortium and receives revenue sharing, aligning their interests with USDC growth.' },
      { targetId: 'us-treasury', targetName: 'US Treasury', relationship: 'direct partnership', explanation: 'Circle holds USDC reserves in US Treasuries, directly financing US government debt with crypto user deposits.' },
      { targetId: 'fincen', targetName: 'FinCEN', relationship: 'reporting pipeline', explanation: 'Circle reports directly to FinCEN, providing the government with complete visibility into USDC flows.' },
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
      { targetId: 'programmable-money', targetName: 'Programmable Money', relationship: 'can freeze/blacklist' },
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
      { targetId: 'pyusd', targetName: 'PYUSD', relationship: 'issues for PayPal' },
      { targetId: 'busd', targetName: 'BUSD', relationship: 'issued (discontinued)' },
      { targetId: 'congressional-hearing', targetName: 'Congressional Hearing (March 2025)', relationship: 'testified at' },
    ],
  },
  {
    id: 'cantor-fitzgerald',
    name: 'Cantor Fitzgerald',
    type: 'organization',
    description: 'Financial services firm. Primary custodian for Tether reserves.',
    decentralizationScore: 15,
    connections: [
      { targetId: 'tether-limited', targetName: 'Tether Limited', relationship: 'holds their treasury' },
      { targetId: 'usdt', targetName: 'USDT (Tether)', relationship: 'custodies backing' },
      { targetId: 'us-treasury', targetName: 'US Treasury', relationship: 'government connections' },
    ],
  },
  {
    id: 'blackrock',
    name: 'BlackRock',
    type: 'organization',
    description: "World's largest asset manager. ~$12 trillion AUM.",
    category: 'both',
    decentralizationScore: 10,
    threatLevel: 5,
    scoreBreakdown: {
      custody: 5,         // Holds assets for others, ultimate centralization
      transparency: 40,   // Public company with disclosure requirements
      permissionless: 5,  // Requires approval, accreditation for most products
    },
    captureStory: 'BlackRock represents the apex of financial centralization. With ~$12 trillion AUM, they are the largest investor in most major corporations. Their IBIT Bitcoin ETF quickly became the largest, and their USDC investment ties them to stablecoins. When BlackRock speaks, markets move. Their embrace of crypto signals not decentralization, but the absorption of crypto into traditional finance.',
    metadata: {
      founded: '1988',
      headquarters: 'New York, USA',
      aum: '$11.5 trillion (2024)',
      keyPeople: [
        { name: 'Larry Fink', role: 'CEO & Chairman' },
        { name: 'Robert Kapito', role: 'President' },
      ],
      socials: {
        website: 'https://www.blackrock.com',
        twitter: 'https://twitter.com/BlackRock',
        linkedin: 'https://www.linkedin.com/company/blackrock',
      },
      regulatoryStatus: 'SEC registered investment advisor',
      fundingHistory: [
        { round: 'IPO', date: '1999', amount: '$126M' },
      ],
      recentNewsSummary: 'BlackRock\'s IBIT Bitcoin ETF has become the largest spot Bitcoin ETF with over $50B in AUM. The firm continues to push for crypto adoption among institutional investors.',
      lastUpdated: '2025-01',
    },
    connections: [
      { targetId: 'circle', targetName: 'Circle', relationship: 'major investor', context: 'Strategic investment ties BlackRock to USDC stablecoin ecosystem', explanation: 'BlackRock invested in Circle, giving the world\'s largest asset manager direct influence over the company that issues USDC.' },
      { targetId: 'us-treasury', targetName: 'US Treasury', relationship: 'advisory role', context: 'BlackRock advises Treasury on crisis management, giving it policy influence', explanation: 'BlackRock advises the US Treasury on crisis management, creating a revolving door between the largest asset manager and government financial policy.' },
      { targetId: 'federal-reserve', targetName: 'Federal Reserve', relationship: 'crisis manager', context: 'Managed Fed bond purchases during 2020 crisis - unprecedented private sector role', explanation: 'BlackRock managed Federal Reserve bond purchases during the 2020 crisis, giving a private company unprecedented control over monetary policy.' },
      { targetId: 'ibit', targetName: 'iShares Bitcoin Trust (IBIT)', relationship: 'issues', context: 'Largest Bitcoin ETF concentrates BTC ownership in traditional finance', explanation: 'BlackRock issues IBIT, the largest Bitcoin ETF, concentrating Bitcoin ownership in traditional finance under a single corporate entity.' },
      { targetId: 'coinbase-custody', targetName: 'Coinbase Custody', relationship: 'uses for IBIT custody', context: 'Single custodian creates concentration risk for $50B+ in BTC', explanation: 'BlackRock uses Coinbase Custody for IBIT, meaning a single company holds $50B+ worth of Bitcoin that BlackRock ETF investors nominally own.' },
      { targetId: 'financial-industrial-complex', targetName: 'Financial Industrial Complex', relationship: 'central node', explanation: 'BlackRock is the central node of the financial industrial complex, with ownership stakes in virtually every major corporation through its index funds.' },
      { targetId: 'state-street', targetName: 'State Street', relationship: 'co-controls markets', explanation: 'BlackRock and State Street, together with Vanguard, form the "Big Three" asset managers controlling most major US corporations.' },
      { targetId: 'vanguard', targetName: 'Vanguard', relationship: 'co-controls markets', explanation: 'BlackRock and Vanguard, together with State Street, control unprecedented economic power through passive index investing.' },
      { targetId: 'proof-of-weapons-network', targetName: 'Proof of Weapons Network', relationship: 'central node', explanation: 'BlackRock is a central node in the Proof of Weapons Network controlling global capital flows and corporate governance.' },
    ],
  },
  {
    id: 'state-street',
    name: 'State Street',
    type: 'organization',
    description: 'Major asset manager. ~$4.7 trillion AUM. Part of "Big Three" with BlackRock and Vanguard.',
    decentralizationScore: 10,
    threatLevel: 5,
    scoreBreakdown: {
      custody: 5,         // Custodian for trillions in assets
      transparency: 40,   // Public company disclosures
      permissionless: 5,  // Institutional access only
    },
    captureStory: 'State Street, alongside BlackRock and Vanguard, forms the "Proof of Weapons Network" - controlling corporate America through passive index fund ownership. These three asset managers are the largest shareholders in virtually every major US corporation, creating unprecedented concentration of voting power and economic control.',
    connections: [
      { targetId: 'blackrock', targetName: 'BlackRock', relationship: 'co-controls markets', explanation: 'State Street and BlackRock together with Vanguard control most major US corporations through index fund ownership.' },
      { targetId: 'proof-of-weapons-network', targetName: 'Proof of Weapons Network', relationship: 'central node', explanation: 'State Street is one of three central nodes in the Proof of Weapons Network controlling global capital flows.' },
      { targetId: 'financial-industrial-complex', targetName: 'Financial Industrial Complex', relationship: 'core member', explanation: 'State Street is a core member of the financial industrial complex, wielding enormous power through asset management.' },
    ],
  },
  {
    id: 'vanguard',
    name: 'Vanguard',
    type: 'organization',
    description: 'Largest mutual fund provider. ~$9 trillion AUM. Part of "Big Three" asset managers.',
    decentralizationScore: 10,
    threatLevel: 5,
    scoreBreakdown: {
      custody: 5,         // Holds trillions in assets
      transparency: 30,   // Privately held, less transparent than peers
      permissionless: 5,  // Retail and institutional access
    },
    captureStory: 'Vanguard completes the "Big Three" of asset managers that control corporate America. Described as holding "old Rothschild money," Vanguard\'s unique structure - owned by its funds which are owned by investors - creates a circular ownership pattern that obscures ultimate control while concentrating power.',
    connections: [
      { targetId: 'blackrock', targetName: 'BlackRock', relationship: 'co-controls markets', explanation: 'Vanguard and BlackRock together with State Street are the largest shareholders in most major corporations.' },
      { targetId: 'state-street', targetName: 'State Street', relationship: 'co-controls markets', explanation: 'The Big Three asset managers together control unprecedented economic power through passive investing.' },
      { targetId: 'proof-of-weapons-network', targetName: 'Proof of Weapons Network', relationship: 'central node', explanation: 'Vanguard is one of three central nodes in the Proof of Weapons Network controlling global capital.' },
      { targetId: 'financial-industrial-complex', targetName: 'Financial Industrial Complex', relationship: 'core member', explanation: 'Vanguard is a core member of the financial industrial complex with ~$9 trillion in AUM.' },
    ],
  },
  {
    id: 'jp-morgan',
    name: 'JP Morgan',
    type: 'organization',
    description: 'Largest US bank.',
    decentralizationScore: 10,
    connections: [
      { targetId: 'federal-reserve', targetName: 'Federal Reserve', relationship: 'primary dealer' },
      { targetId: 'blackrock', targetName: 'BlackRock', relationship: 'intertwined' },
      { targetId: 'financial-industrial-complex', targetName: 'Financial Industrial Complex', relationship: 'core member' },
    ],
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    type: 'organization',
    description: 'Largest US crypto exchange and primary custodian for Bitcoin ETFs.',
    decentralizationScore: 35,
    threatLevel: 4,
    captureStory: 'Coinbase has become the dominant custodian for institutional Bitcoin holdings. Their Coinbase Custody subsidiary holds BTC for most major ETFs including BlackRock\'s IBIT, creating a massive single point of failure. While they enabled millions to buy crypto, their deep regulatory ties and surveillance partnerships make them a key vector for government control of the space.',
    metadata: {
      founded: '2012',
      headquarters: 'San Francisco, USA (remote-first)',
      aum: '$280+ billion in assets on platform',
      keyPeople: [
        { name: 'Brian Armstrong', role: 'CEO & Co-founder' },
        { name: 'Emilie Choi', role: 'President & COO' },
      ],
      socials: {
        website: 'https://www.coinbase.com',
        twitter: 'https://twitter.com/coinbase',
        linkedin: 'https://www.linkedin.com/company/coinbase',
      },
      regulatoryStatus: 'Publicly traded (NASDAQ: COIN), Multiple state licenses',
      fundingHistory: [
        { round: 'Series E', date: '2018', amount: '$300M' },
        { round: 'IPO', date: 'April 2021', amount: 'Direct listing at $86B valuation' },
      ],
      recentNewsSummary: 'Coinbase continues to battle the SEC while expanding institutional custody services. Their Coinbase Custody now holds BTC for 8 of 11 spot Bitcoin ETFs.',
      lastUpdated: '2025-01',
    },
    connections: [
      { targetId: 'usdc', targetName: 'USDC', relationship: 'co-creator', context: 'Revenue sharing deal gives Coinbase direct stake in USDC growth' },
      { targetId: 'circle', targetName: 'Circle', relationship: 'partner', context: 'Joint venture created Centre consortium that governed USDC' },
      { targetId: 'chainalysis', targetName: 'Chainalysis', relationship: 'surveillance partner', context: 'Provides blockchain surveillance, shares data with law enforcement' },
      { targetId: 'sec', targetName: 'SEC', relationship: 'under investigation', context: 'Ongoing lawsuit threatens exchange operations and token listings' },
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
    description: 'Data analytics and surveillance company. Founded by Peter Thiel.',
    decentralizationScore: 10,
    captureStory: 'Palantir represents the transformation of the military-industrial complex into surveillance capitalism. Founded by Peter Thiel of the PayPal Mafia, it provides AI and data analytics to governments and corporations, creating the infrastructure for total information awareness. It\'s the bridge between the Technical Industrial Complex and state power.',
    connections: [
      { targetId: 'financial-surveillance', targetName: 'Financial Surveillance', relationship: 'builds infrastructure' },
      { targetId: 'digital-id', targetName: 'Digital ID', relationship: 'builds systems' },
      { targetId: 'fbi', targetName: 'FBI', relationship: 'government contracts' },
      { targetId: 'nsa', targetName: 'NSA', relationship: 'intelligence partnership', explanation: 'Palantir provides surveillance technology that integrates with NSA operations.' },
      { targetId: 'technical-industrial-complex', targetName: 'Technical Industrial Complex', relationship: 'core infrastructure', explanation: 'Palantir provides the surveillance and AI infrastructure for the Technical Industrial Complex.' },
      { targetId: 'paypal-mafia', targetName: 'PayPal Mafia', relationship: 'founded by Thiel', explanation: 'Peter Thiel, member of the PayPal Mafia, founded Palantir to transform military-industrial complex into cyber security and AI.' },
    ],
  },
  {
    id: 'alameda-research',
    name: 'Alameda Research',
    type: 'organization',
    description: 'Crypto trading firm. Collapsed with FTX.',
    decentralizationScore: 20,
    connections: [
      { targetId: 'usdt', targetName: 'USDT (Tether)', relationship: 'major user for manipulation' },
      { targetId: 'ftx-collapse', targetName: 'FTX Collapse (2022)', relationship: 'collapsed' },
      { targetId: 'binance', targetName: 'Binance', relationship: 'major counterparty' },
    ],
  },
  {
    id: 'strategy',
    name: 'Strategy (MicroStrategy)',
    type: 'organization',
    description: 'Largest corporate Bitcoin holder. ~500,000+ BTC via convertible debt strategy.',
    category: 'bitcoin',
    decentralizationScore: 25,
    threatLevel: 3,
    captureStory: 'MicroStrategy (now Strategy) pioneered the corporate Bitcoin treasury strategy. While this brought institutional legitimacy, their ~500K BTC is held in Coinbase Custody - creating a massive single point of failure. Their debt-funded accumulation also ties Bitcoin\'s fate to traditional credit markets. If they\'re forced to liquidate, it would cause major market disruption.',
    metadata: {
      founded: '1989 (Bitcoin strategy: 2020)',
      headquarters: 'Tysons Corner, Virginia, USA',
      aum: '~500,000+ BTC (~$50+ billion)',
      keyPeople: [
        { name: 'Michael Saylor', role: 'Executive Chairman' },
        { name: 'Phong Le', role: 'President & CEO' },
      ],
      socials: {
        website: 'https://www.strategy.com',
        twitter: 'https://twitter.com/saborstrategy',
      },
      regulatoryStatus: 'Publicly traded (NASDAQ: MSTR)',
      fundingHistory: [
        { round: 'Convertible Notes', date: '2020-2024', amount: '$7B+ raised for BTC purchases' },
        { round: 'At-the-Market Offerings', date: '2024-2025', amount: '$20B+ equity raises' },
      ],
      recentNewsSummary: 'Strategy continues aggressive BTC accumulation, now holding over 500,000 BTC. Recent rebrand from MicroStrategy signals full pivot to Bitcoin treasury company.',
      lastUpdated: '2025-01',
    },
    connections: [
      { targetId: 'financial-industrial-complex', targetName: 'Financial Industrial Complex', relationship: 'subordinate to creditors', context: 'Debt-funded strategy means creditors could force liquidation in crisis' },
      { targetId: 'coinbase-custody', targetName: 'Coinbase Custody', relationship: 'custodian for BTC holdings', context: '500K+ BTC in single custodian - massive concentration risk' },
      { targetId: 'btc-etf-approval', targetName: 'BTC ETF Approval (Jan 2024)', relationship: 'benefited from approval' },
      { targetId: 'microstrategy-btc-buys', targetName: 'MicroStrategy BTC Accumulation (2020-)', relationship: 'ongoing strategy' },
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
      { targetId: 'btc-etf-approval', targetName: 'BTC ETF Approval (Jan 2024)', relationship: 'approved' },
      { targetId: 'sec', targetName: 'SEC', relationship: 'regulated by' },
      { targetId: 'btc-custody-concentration', targetName: 'BTC Custody Concentration', relationship: 'contributes to' },
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
      { targetId: 'coinbase-custody', targetName: 'Coinbase Custody', relationship: 'custodian' },
      { targetId: 'btc-etf-approval', targetName: 'BTC ETF Approval (Jan 2024)', relationship: 'approved' },
      { targetId: 'sec', targetName: 'SEC', relationship: 'regulated by' },
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
      { targetId: 'galaxy-digital', targetName: 'Galaxy Digital', relationship: 'acquisition target' },
      { targetId: 'btc-custody-concentration', targetName: 'BTC Custody Concentration', relationship: 'alternative to Coinbase' },
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
      { targetId: 'btc-custody-concentration', targetName: 'BTC Custody Concentration', relationship: 'alternative custody' },
      { targetId: 'binance', targetName: 'Binance', relationship: 'custody client' },
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
      { targetId: 'btc-etf-approval', targetName: 'BTC ETF Approval (Jan 2024)', relationship: 'key player' },
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
      { targetId: 'sec', targetName: 'SEC', relationship: 'sued and won' },
      { targetId: 'btc-etf-approval', targetName: 'BTC ETF Approval (Jan 2024)', relationship: 'forced approval' },
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
      { targetId: 'grayscale', targetName: 'Grayscale Investments', relationship: 'owns' },
      { targetId: 'genesis-bankruptcy', targetName: 'Genesis Bankruptcy (2023)', relationship: 'subsidiary collapsed' },
      { targetId: 'ftx-collapse', targetName: 'FTX Collapse (2022)', relationship: 'contagion from' },
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
      { targetId: 'bitgo', targetName: 'BitGo', relationship: 'attempted acquisition' },
      { targetId: 'coinbase', targetName: 'Coinbase', relationship: 'trading partner' },
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
      { targetId: 'coinbase-custody', targetName: 'Coinbase Custody', relationship: 'likely custodian' },
      { targetId: 'btc-custody-concentration', targetName: 'BTC Custody Concentration', relationship: 'contributes to' },
    ],
  },
  {
    id: 'block-inc',
    name: 'Block Inc',
    type: 'organization',
    description: 'Formerly Square. Holds ~8,027 BTC.',
    category: 'bitcoin',
    decentralizationScore: 40,
    connections: [
      { targetId: 'cash-app', targetName: 'Cash App', relationship: 'owns' },
      { targetId: 'self-custody', targetName: 'Self-Custody', relationship: 'promotes Bitcoin adoption' },
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
      { targetId: 'btc-mining-centralization', targetName: 'BTC Mining Centralization', relationship: 'contributes to' },
      { targetId: 'coinbase-custody', targetName: 'Coinbase Custody', relationship: 'likely custodian' },
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
      { targetId: 'bis', targetName: 'BIS', relationship: 'main shareholder of', explanation: 'The Federal Reserve is the main shareholder in the BIS, giving it control over global central bank coordination.' },
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
      { targetId: 'us-treasury', targetName: 'US Treasury', relationship: 'bureau of' },
      { targetId: 'coinbase', targetName: 'Coinbase', relationship: 'regulates' },
      { targetId: 'circle', targetName: 'Circle', relationship: 'regulates' },
    ],
  },
  {
    id: 'nsa',
    name: 'NSA',
    type: 'government',
    description: 'National Security Agency. Speculated by some to be involved in Bitcoin\'s creation. Controls surveillance infrastructure.',
    decentralizationScore: 5,
    threatLevel: 10,
    captureStory: 'The NSA represents the ultimate surveillance state. Some theorize the NSA created Bitcoin as a honeypot or experiment. Whether or not this is true, the NSA has backdoor access to most technology infrastructure through the Proof of Weapons Network and works closely with companies like Palantir to maintain comprehensive surveillance capabilities.',
    connections: [
      { targetId: 'bitcoin-protocol', targetName: 'Bitcoin', relationship: 'speculated creator', explanation: 'Some theories suggest the NSA or related intelligence agencies created Bitcoin, though this remains unproven speculation.' },
      { targetId: 'palantir', targetName: 'Palantir', relationship: 'surveillance partnership', explanation: 'Palantir provides surveillance technology that integrates with NSA operations and intelligence gathering.' },
      { targetId: 'financial-surveillance', targetName: 'Financial Surveillance', relationship: 'conducts', explanation: 'The NSA conducts mass financial surveillance through access to global payment systems and blockchain monitoring.' },
      { targetId: 'technical-industrial-complex', targetName: 'Technical Industrial Complex', relationship: 'controls backdoors', explanation: 'The NSA controls backdoors in tech infrastructure through partnerships with the Technical Industrial Complex.' },
    ],
  },
  {
    id: 'cia',
    name: 'CIA',
    type: 'government',
    description: 'Central Intelligence Agency. Conducted Operation Mockingbird to control media. Connected to covert operations globally.',
    decentralizationScore: 5,
    threatLevel: 10,
    captureStory: 'The CIA\'s Operation Mockingbird embedded intelligence operatives in major media organizations, creating a narrative control apparatus that persists today through the Proof of Weapons Network. The agency\'s history of regime change operations, color revolutions, and market manipulation makes it a central threat to any truly decentralized system.',
    connections: [
      { targetId: 'dollar-hegemony', targetName: 'Dollar Hegemony', relationship: 'enforces globally', explanation: 'The CIA enforces dollar hegemony through covert operations, regime change, and support for US-aligned governments.' },
      { targetId: 'proof-of-weapons-network', targetName: 'Proof of Weapons Network', relationship: 'intelligence arm', explanation: 'The CIA functions as the covert intelligence arm of the Proof of Weapons Network.' },
      { targetId: 'nsa', targetName: 'NSA', relationship: 'intelligence partnership', explanation: 'The CIA and NSA coordinate on intelligence operations, surveillance, and maintaining US global power.' },
    ],
  },
  {
    id: 'bis',
    name: 'BIS',
    type: 'government',
    description: 'Bank for International Settlements. "Central bank of central banks." Coordinates global monetary policy.',
    decentralizationScore: 5,
    threatLevel: 10,
    captureStory: 'The BIS is the most powerful financial institution you\'ve never heard of. It coordinates central bank policy globally, facilitated Nazi gold transfers during WWII, and created the architecture for dollar hegemony. The Federal Reserve is its main shareholder, making it the command center for the debt-based monetary system.',
    connections: [
      { targetId: 'federal-reserve', targetName: 'Federal Reserve', relationship: 'main shareholder', explanation: 'The Federal Reserve is the main shareholder in the BIS, giving it control over global central bank coordination.' },
      { targetId: 'dollar-hegemony', targetName: 'Dollar Hegemony', relationship: 'coordinates enforcement', explanation: 'The BIS coordinates central banks globally to enforce dollar hegemony and the debt-based monetary system.' },
      { targetId: 'imf', targetName: 'IMF', relationship: 'coordinates with', explanation: 'The BIS coordinates with the IMF to maintain the global financial order and dollar dominance.' },
      { targetId: 'proof-of-weapons-network', targetName: 'Proof of Weapons Network', relationship: 'monetary control center', explanation: 'The BIS serves as the monetary control center for the Proof of Weapons Network.' },
    ],
  },
  {
    id: 'imf',
    name: 'IMF',
    type: 'government',
    description: 'International Monetary Fund. Provides dollar loans with austerity conditions. Weapon for neocolonial resource extraction.',
    decentralizationScore: 5,
    threatLevel: 10,
    captureStory: 'The IMF\'s playbook is simple: lend dollars to desperate nations, demand austerity and privatization, extract resources. Countries that resist face "color revolutions" or economic warfare. China\'s Belt and Road Initiative is reversing this model, which is why the US views it as an existential threat to dollar hegemony.',
    connections: [
      { targetId: 'dollar-hegemony', targetName: 'Dollar Hegemony', relationship: 'enforces globally', explanation: 'The IMF enforces dollar hegemony by providing loans denominated in dollars with conditions that ensure dependency.' },
      { targetId: 'bis', targetName: 'BIS', relationship: 'coordinates with', explanation: 'The IMF coordinates with the BIS to maintain the global dollar-based monetary system.' },
      { targetId: 'world-bank', targetName: 'World Bank', relationship: 'partner institution', explanation: 'The IMF and World Bank work in tandem to enforce economic policies that maintain dollar dominance.' },
      { targetId: 'proof-of-weapons-network', targetName: 'Proof of Weapons Network', relationship: 'financial weapon', explanation: 'The IMF functions as a financial weapon of the Proof of Weapons Network for economic control.' },
    ],
  },
  {
    id: 'world-bank',
    name: 'World Bank',
    type: 'government',
    description: 'International financial institution. Partners with IMF in development lending tied to privatization requirements.',
    decentralizationScore: 5,
    threatLevel: 10,
    captureStory: 'The World Bank presents itself as a development institution but functions as a mechanism for transferring wealth from developing nations to the Proof of Weapons Network. Its loans come with requirements to privatize national assets, opening them to purchase by Western asset managers at fire-sale prices.',
    connections: [
      { targetId: 'imf', targetName: 'IMF', relationship: 'partner institution', explanation: 'The World Bank and IMF coordinate lending and policy requirements to maintain dollar hegemony.' },
      { targetId: 'dollar-hegemony', targetName: 'Dollar Hegemony', relationship: 'enforces', explanation: 'The World Bank enforces dollar hegemony through development lending tied to US policy alignment.' },
      { targetId: 'proof-of-weapons-network', targetName: 'Proof of Weapons Network', relationship: 'financial weapon', explanation: 'The World Bank serves as a financial weapon for wealth extraction by the Proof of Weapons Network.' },
    ],
  },

  // CONCEPTS
  {
    id: 'dollar-hegemony',
    name: 'Dollar Hegemony',
    type: 'concept',
    description: "US dollar's dominance as world reserve currency.",
    decentralizationScore: 10,
    regionStyle: { color: '#3b82f6', opacity: 0.08 }, // Blue - monetary system
    connections: [
      { targetId: 'us-treasury', targetName: 'US Treasury', relationship: 'issues the debt', explanation: 'The US Treasury issues the debt that backs the dollar, making it the foundation of dollar hegemony.' },
      { targetId: 'usdt', targetName: 'USDT (Tether)', relationship: 'extends dollar globally', explanation: 'USDT extends dollar dominance to the crypto ecosystem, allowing USD-denominated transactions worldwide without traditional banking.' },
      { targetId: 'usdc', targetName: 'USDC', relationship: 'extends dollar with compliance', explanation: 'USDC extends dollar hegemony with full US regulatory compliance, bringing crypto users into the traditional financial surveillance system.' },
      { targetId: 'bis', targetName: 'BIS', relationship: 'coordinates globally', explanation: 'The BIS coordinates central banks globally to enforce and maintain dollar hegemony.' },
      { targetId: 'imf', targetName: 'IMF', relationship: 'enforces through loans', explanation: 'The IMF enforces dollar hegemony by providing loans in dollars with conditions that ensure dependency.' },
      { targetId: 'world-bank', targetName: 'World Bank', relationship: 'enforces through development', explanation: 'The World Bank enforces dollar hegemony through development lending tied to US policy alignment.' },
      { targetId: 'proof-of-weapons-network', targetName: 'Proof of Weapons Network', relationship: 'maintains through force', explanation: 'The Proof of Weapons Network maintains dollar hegemony through military power, covert operations, and economic coercion.' },
    ],
  },
  {
    id: 'cbdc',
    name: 'CBDC',
    type: 'concept',
    description: 'Central Bank Digital Currency. Government-issued digital money.',
    decentralizationScore: 15,
    regionStyle: { color: '#f97316', opacity: 0.08 }, // Orange - government control
    connections: [
      { targetId: 'usdt', targetName: 'USDT (Tether)', relationship: 'has same capabilities', explanation: 'USDT already has the same freeze and surveillance capabilities that people fear in CBDCs - the only difference is who controls them.' },
      { targetId: 'usdc', targetName: 'USDC', relationship: 'has same capabilities', explanation: 'USDC has demonstrated CBDC-like capabilities by freezing $65M+ during the Tornado Cash sanctions with no court order required.' },
      { targetId: 'programmable-money', targetName: 'Programmable Money', relationship: 'feared feature', explanation: 'Programmable money is the most feared feature of CBDCs - the ability to restrict what money can be spent on, when, and by whom.' },
      { targetId: 'federal-reserve', targetName: 'Federal Reserve', relationship: 'potential issuer', explanation: 'The Federal Reserve is the likely issuer of a US CBDC, which would give the government direct control over all digital dollar transactions.' },
    ],
  },
  {
    id: 'programmable-money',
    name: 'Programmable Money',
    type: 'concept',
    description: 'Money with built-in rules and restrictions.',
    decentralizationScore: 20,
    regionStyle: { color: '#a855f7', opacity: 0.08 }, // Purple - control mechanism
    connections: [
      { targetId: 'usdt', targetName: 'USDT (Tether)', relationship: 'can freeze/blacklist', explanation: 'USDT is programmable money - Tether can freeze any address at any time, making every USDT holder subject to potential asset seizure.' },
      { targetId: 'usdc', targetName: 'USDC', relationship: 'can freeze/blacklist', explanation: 'USDC is programmable money - Circle can freeze any address instantly, as demonstrated during the Tornado Cash sanctions.' },
      { targetId: 'cbdc', targetName: 'CBDC', relationship: 'shares same capabilities', explanation: 'CBDCs would have the same programmable money capabilities as stablecoins, but with government rather than corporate control.' },
    ],
  },
  {
    id: 'financial-surveillance',
    name: 'Financial Surveillance',
    type: 'concept',
    description: 'Monitoring all financial transactions.',
    decentralizationScore: 10,
    regionStyle: { color: '#ef4444', opacity: 0.1 }, // Red - surveillance threat
    connections: [
      { targetId: 'chainalysis', targetName: 'Chainalysis', relationship: 'primary infrastructure', explanation: 'Chainalysis provides the primary infrastructure for blockchain surveillance, tracking transactions across all major chains and sharing data with governments.' },
      { targetId: 'fbi', targetName: 'FBI', relationship: 'direct Tether access', explanation: 'The FBI has direct access to Tether\'s systems, allowing real-time surveillance of the largest stablecoin.' },
      { targetId: 'fincen', targetName: 'FinCEN', relationship: 'Circle reporting', explanation: 'FinCEN receives direct reports from Circle on USDC transactions, creating a government surveillance pipeline for stablecoin usage.' },
      { targetId: 'nsa', targetName: 'NSA', relationship: 'mass surveillance', explanation: 'The NSA conducts mass financial surveillance through access to global payment systems and blockchain monitoring.' },
      { targetId: 'cia', targetName: 'CIA', relationship: 'covert monitoring', explanation: 'The CIA uses financial surveillance for intelligence gathering and tracking of adversaries and dissidents.' },
    ],
  },
  {
    id: 'financial-industrial-complex',
    name: 'Financial Industrial Complex',
    type: 'concept',
    description: 'Network of asset managers and banks controlling capital globally.',
    decentralizationScore: 10,
    regionStyle: { color: '#ef4444', opacity: 0.1 }, // Red - major threat
    connections: [
      { targetId: 'blackrock', targetName: 'BlackRock', relationship: 'central node', explanation: 'BlackRock sits at the center of the financial industrial complex, with ~$12 trillion in assets and ownership stakes in most major corporations.' },
      { targetId: 'state-street', targetName: 'State Street', relationship: 'core member', explanation: 'State Street is a core member of the financial industrial complex as one of the Big Three asset managers.' },
      { targetId: 'vanguard', targetName: 'Vanguard', relationship: 'core member', explanation: 'Vanguard is a core member of the financial industrial complex with ~$9 trillion in assets under management.' },
      { targetId: 'jp-morgan', targetName: 'JP Morgan', relationship: 'core member', explanation: 'JP Morgan is a core member of the financial industrial complex, as the largest US bank with deep ties to the Federal Reserve and Treasury.' },
      { targetId: 'federal-reserve', targetName: 'Federal Reserve', relationship: 'monetary authority', explanation: 'The Federal Reserve provides the monetary policy framework that the financial industrial complex operates within, setting interest rates and controlling the money supply.' },
      { targetId: 'proof-of-weapons-network', targetName: 'Proof of Weapons Network', relationship: 'part of', explanation: 'The Financial Industrial Complex is the financial control arm of the broader Proof of Weapons Network.' },
      { targetId: 'technical-industrial-complex', targetName: 'Technical Industrial Complex', relationship: 'competing with', explanation: 'The Financial Industrial Complex is being challenged by the emerging Technical Industrial Complex for global control.' },
    ],
  },
  {
    id: 'proof-of-weapons-network',
    name: 'Proof of Weapons Network',
    type: 'concept',
    description: 'Network of asset managers, sovereign wealth funds, and military power controlling global capital. Not nation-based but wealth-based.',
    decentralizationScore: 5,
    regionStyle: { color: '#dc2626', opacity: 0.12 }, // Dark red - ultimate threat
    captureStory: 'The Proof of Weapons Network is the real power structure controlling the world - not governments, but a network of asset managers (BlackRock, State Street, Vanguard), sovereign wealth funds, military contractors, and intelligence agencies. They control corporate America through passive index funds, enforce compliance through weapons sales and covert operations, and maintain dollar hegemony through the BIS, IMF, and World Bank. Bitcoin represents the first viable alternative to their control.',
    connections: [
      { targetId: 'blackrock', targetName: 'BlackRock', relationship: 'central node', explanation: 'BlackRock is a central node in the Proof of Weapons Network, controlling ~$12 trillion in assets and holding ownership stakes in virtually every major corporation.' },
      { targetId: 'state-street', targetName: 'State Street', relationship: 'central node', explanation: 'State Street is one of the Big Three asset managers forming the core of the Proof of Weapons Network.' },
      { targetId: 'vanguard', targetName: 'Vanguard', relationship: 'central node', explanation: 'Vanguard completes the Big Three asset managers that control corporate America through the Proof of Weapons Network.' },
      { targetId: 'bis', targetName: 'BIS', relationship: 'monetary control', explanation: 'The BIS serves as the monetary control center coordinating central banks within the Proof of Weapons Network.' },
      { targetId: 'cia', targetName: 'CIA', relationship: 'covert operations', explanation: 'The CIA conducts covert operations and regime change to enforce the Proof of Weapons Network\'s global control.' },
      { targetId: 'financial-industrial-complex', targetName: 'Financial Industrial Complex', relationship: 'financial control arm', explanation: 'The Financial Industrial Complex is the financial control arm of the broader Proof of Weapons Network.' },
      { targetId: 'dollar-hegemony', targetName: 'Dollar Hegemony', relationship: 'monetary foundation', explanation: 'Dollar hegemony is the monetary foundation that the Proof of Weapons Network maintains through military and financial coercion.' },
    ],
  },
  {
    id: 'technical-industrial-complex',
    name: 'Technical Industrial Complex',
    type: 'concept',
    description: 'Emerging power structure centered on tech companies, AI, and surveillance. Competing with Financial Industrial Complex.',
    decentralizationScore: 15,
    regionStyle: { color: '#7c3aed', opacity: 0.1 }, // Purple - tech control
    captureStory: 'The Technical Industrial Complex, led by the PayPal Mafia (Elon Musk, Peter Thiel, David Sacks), represents an emerging power structure competing with traditional finance. They control AI (Palantir), social credit systems (X/Twitter), and surveillance infrastructure. The future they envision may not need money at all - only algorithmic control through data and social capital.',
    connections: [
      { targetId: 'paypal-mafia', targetName: 'PayPal Mafia', relationship: 'leadership group', explanation: 'The PayPal Mafia (Musk, Thiel, Sacks) leads the Technical Industrial Complex and builds alternative power structures to finance.' },
      { targetId: 'palantir', targetName: 'Palantir', relationship: 'surveillance infrastructure', explanation: 'Palantir provides the surveillance and AI infrastructure for the Technical Industrial Complex.' },
      { targetId: 'financial-industrial-complex', targetName: 'Financial Industrial Complex', relationship: 'competing with', explanation: 'The Technical Industrial Complex is competing with the Financial Industrial Complex for global control and influence.' },
      { targetId: 'nsa', targetName: 'NSA', relationship: 'provides backdoors', explanation: 'The Technical Industrial Complex provides intelligence backdoors to the NSA through tech infrastructure.' },
    ],
  },
  {
    id: 'paypal-mafia',
    name: 'PayPal Mafia',
    type: 'concept',
    description: 'Group of former PayPal executives (Elon Musk, Peter Thiel, David Sacks) now controlling tech and crypto policy.',
    decentralizationScore: 20,
    regionStyle: { color: '#8b5cf6', opacity: 0.1 }, // Lighter purple - tech elite
    captureStory: 'The PayPal Mafia - Elon Musk, Peter Thiel, David Sacks, and others - went from building online payments to controlling the levers of power. They funded Trump\'s campaign, designed stablecoin regulation (Genius Act), built surveillance tech (Palantir), and control social media (X). They represent a new form of centralized power: the Technical Industrial Complex competing with traditional finance.',
    metadata: {
      keyPeople: [
        { name: 'Elon Musk', role: 'X/Twitter owner, Tesla CEO, Technical Industrial Complex leader' },
        { name: 'Peter Thiel', role: 'Palantir founder, surveillance capitalism architect' },
        { name: 'David Sacks', role: 'Crypto policy advisor, Genius Act architect' },
      ],
    },
    connections: [
      { targetId: 'technical-industrial-complex', targetName: 'Technical Industrial Complex', relationship: 'represents', explanation: 'The PayPal Mafia represents and leads the emerging Technical Industrial Complex.' },
      { targetId: 'palantir', targetName: 'Palantir', relationship: 'founded by Thiel', explanation: 'Peter Thiel founded Palantir, the surveillance and data analytics company central to the Technical Industrial Complex.' },
      { targetId: 'financial-industrial-complex', targetName: 'Financial Industrial Complex', relationship: 'alternative to', explanation: 'The PayPal Mafia is building an alternative power structure to compete with the Financial Industrial Complex.' },
    ],
  },
  {
    id: 'digital-id',
    name: 'Digital ID',
    type: 'concept',
    description: 'Digital identity systems. Prerequisite for stablecoins and CBDCs.',
    decentralizationScore: 20,
    regionStyle: { color: '#f97316', opacity: 0.08 }, // Orange - identity control
    connections: [
      { targetId: 'palantir', targetName: 'Palantir', relationship: 'builds systems', explanation: 'Palantir builds the digital identity infrastructure that enables surveillance capitalism, linking financial activity to real identities.' },
      { targetId: 'financial-surveillance', targetName: 'Financial Surveillance', relationship: 'enables', explanation: 'Digital ID enables financial surveillance by tying every transaction to a verified identity, eliminating financial privacy.' },
      { targetId: 'cbdc', targetName: 'CBDC', relationship: 'prerequisite for', explanation: 'Digital ID is a prerequisite for CBDCs - you cannot have programmable government money without knowing exactly who holds it.' },
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
    regionStyle: { color: '#ef4444', opacity: 0.12 }, // Red - major centralization threat
    captureStory: 'The irony of Bitcoin ETFs is profound: a technology designed to eliminate trusted third parties now depends almost entirely on a single custodian. Coinbase Custody holds hundreds of billions in Bitcoin across multiple ETFs. This creates a honeypot for hackers, a single point for regulatory pressure, and concentrates counterparty risk in ways that contradict Bitcoin\'s founding principles.',
    connections: [
      { targetId: 'coinbase-custody', targetName: 'Coinbase Custody', relationship: 'primary cause', explanation: 'Coinbase Custody is the primary cause of BTC custody concentration, holding Bitcoin for 8 of 11 approved ETFs.' },
      { targetId: 'ibit', targetName: 'iShares Bitcoin Trust (IBIT)', relationship: 'example', explanation: 'BlackRock\'s IBIT is an example of custody concentration - the largest Bitcoin ETF uses Coinbase as sole custodian for $50B+ in BTC.' },
      { targetId: 'gbtc', targetName: 'Grayscale Bitcoin Trust (GBTC)', relationship: 'example', explanation: 'Grayscale\'s GBTC uses Coinbase Custody, contributing to the single point of failure for institutional Bitcoin.' },
    ],
  },
  {
    id: 'btc-mining-centralization',
    name: 'BTC Mining Centralization',
    type: 'concept',
    description: 'Bitcoin mining increasingly concentrated in large public companies.',
    category: 'bitcoin',
    decentralizationScore: 25,
    regionStyle: { color: '#f97316', opacity: 0.08 }, // Orange - growing threat
    connections: [
      { targetId: 'marathon-digital', targetName: 'Marathon Digital', relationship: 'major miner', explanation: 'Marathon Digital is one of the largest public Bitcoin mining companies, concentrating hashrate under a single corporate entity subject to regulatory pressure.' },
    ],
  },
  {
    id: 'self-custody',
    name: 'Self-Custody',
    type: 'concept',
    description: '"Not your keys, not your coins." Core Bitcoin ethos being eroded.',
    category: 'bitcoin',
    decentralizationScore: 95,
    regionStyle: { color: '#22c55e', opacity: 0.1 }, // Green - pro-decentralization
    captureStory: 'Self-custody was once the default for Bitcoin holders. Today, estimates suggest only ~30% of Bitcoin is self-custodied, down from ~90% in 2015. ETFs, exchanges, and institutional custody have made "not your keys, not your coins" a minority practice. This represents the quiet capture of Bitcoin by traditional finance.',
    connections: [
      { targetId: 'btc-custody-concentration', targetName: 'BTC Custody Concentration', relationship: 'threatened by', explanation: 'Self-custody is directly threatened by custody concentration - as more Bitcoin moves to institutional custodians, fewer individuals hold their own keys.' },
      { targetId: 'coinbase-custody', targetName: 'Coinbase Custody', relationship: 'alternative to', explanation: 'Coinbase Custody represents the alternative to self-custody - trusting a third party with your Bitcoin instead of holding your own keys.' },
    ],
  },
  {
    id: 'cash-app',
    name: 'Cash App',
    type: 'organization',
    description: 'Block Inc payment app with Bitcoin buying feature.',
    category: 'bitcoin',
    decentralizationScore: 55,
    connections: [
      { targetId: 'block-inc', targetName: 'Block Inc', relationship: 'owned by', explanation: 'Cash App is owned by Block Inc (formerly Square), which has been pro-Bitcoin but still custodies user funds.' },
      { targetId: 'self-custody', targetName: 'Self-Custody', relationship: 'promotes Bitcoin buying', explanation: 'Cash App promotes Bitcoin buying to mainstream users, though it custodies the Bitcoin unless users withdraw.' },
    ],
  },
  {
    id: 'bitcoin-protocol',
    name: 'Bitcoin',
    type: 'concept',
    description: 'The Bitcoin network itself - a decentralized, permissionless, censorship-resistant protocol. The benchmark for true decentralization.',
    category: 'bitcoin',
    decentralizationScore: 100,
    threatLevel: 1,
    scoreBreakdown: {
      custody: 100,       // Self-custody enabled by design
      transparency: 100,  // Fully open source, all transactions public
      permissionless: 100, // Anyone can use without permission
    },
    regionStyle: { color: '#22c55e', opacity: 0.15 }, // Bright green - the goal
    captureStory: 'Bitcoin was created as a peer-to-peer electronic cash system with no central authority. Its open-source protocol, distributed mining, and permissionless nature represent the gold standard of decentralization that all other entities are measured against. However, the growing concentration of Bitcoin in ETFs, custodians, and corporate treasuries threatens these founding principles.',
    metadata: {
      founded: '2009 (Genesis Block: January 3rd)',
      headquarters: 'Decentralized / Global',
      aum: '~21 million BTC max supply (~$2 trillion market cap)',
      socials: {
        website: 'https://bitcoin.org',
        github: 'https://github.com/bitcoin/bitcoin',
      },
      recentNewsSummary: 'Bitcoin continues to operate as designed with no downtime since 2013. Hashrate at all-time highs. Growing institutional adoption via ETFs represents both validation and potential capture vector.',
      lastUpdated: '2025-01',
    },
    connections: [
      { targetId: 'self-custody', targetName: 'Self-Custody', relationship: 'enables', context: 'Bitcoin\'s core value proposition - be your own bank', explanation: 'Bitcoin enables self-custody by design - anyone can hold their own private keys and transact without permission from any authority.' },
      { targetId: 'btc-custody-concentration', targetName: 'BTC Custody Concentration', relationship: 'threatened by', context: 'ETFs and corporate treasuries moving BTC to centralized custodians', explanation: 'Bitcoin\'s decentralization is threatened by custody concentration as ETFs and institutions move hundreds of billions of BTC to a handful of custodians.' },
      { targetId: 'btc-mining-centralization', targetName: 'BTC Mining Centralization', relationship: 'vulnerable to', context: 'Mining pools and ASIC manufacturers create concentration risk', explanation: 'Bitcoin is vulnerable to mining centralization as hashrate concentrates in large public companies subject to regulatory pressure.' },
    ],
  },

  // EVENTS
  {
    id: 'ftx-collapse',
    name: 'FTX Collapse (2022)',
    type: 'event',
    description: "Major crypto exchange collapsed, exposing fraud.",
    decentralizationScore: 50,
    connections: [
      { targetId: 'alameda-research', targetName: 'Alameda Research', relationship: 'trading arm' },
      { targetId: 'usdt', targetName: 'USDT (Tether)', relationship: 'used for manipulation' },
      { targetId: 'binance', targetName: 'Binance', relationship: 'triggered bank run' },
    ],
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
  },
  {
    id: 'congressional-hearing',
    name: 'Congressional Hearing (March 2025)',
    type: 'event',
    description: 'US Congressional hearing on stablecoins.',
    decentralizationScore: 50,
    connections: [
      { targetId: 'paxos', targetName: 'Paxos', relationship: 'testified' },
      { targetId: 'financial-surveillance', targetName: 'Financial Surveillance', relationship: 'admitted capabilities' },
      { targetId: 'programmable-money', targetName: 'Programmable Money', relationship: 'revealed freeze powers' },
    ],
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
      { targetId: 'ftx-collapse', targetName: 'FTX Collapse (2022)', relationship: 'contagion from' },
      { targetId: 'grayscale', targetName: 'Grayscale Investments', relationship: 'sister company' },
    ],
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
      { targetId: 'financial-industrial-complex', targetName: 'Financial Industrial Complex', relationship: 'funded by' },
      { targetId: 'coinbase-custody', targetName: 'Coinbase Custody', relationship: 'custodies their BTC' },
    ],
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
    entityIds: ['ftx-collapse', 'alameda-research'],
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
    title: 'Trump Returns, Pro-Crypto Cabinet',
    description: 'New administration brings pro-crypto policies. Tether-government connections strengthen.',
    entityIds: ['cantor-fitzgerald', 'us-treasury'],
    type: 'event',
  },
  {
    id: 'te-8',
    date: '2025-03-15',
    title: 'Congressional Hearing on Stablecoins',
    description: 'Stablecoin issuers admit they can monitor, freeze, reverse transactions.',
    entityIds: ['congressional-hearing', 'paxos'],
    type: 'event',
  },

  // BITCOIN TIMELINE EVENTS
  {
    id: 'te-btc-1',
    date: '2020-08-11',
    title: 'MicroStrategy Announces Bitcoin Strategy',
    description: 'MicroStrategy buys first $250M in Bitcoin, beginning corporate adoption trend.',
    entityIds: ['strategy', 'microstrategy-btc-buys'],
    type: 'event',
  },
  {
    id: 'te-btc-2',
    date: '2021-02-08',
    title: 'Tesla Buys $1.5B in Bitcoin',
    description: 'Tesla reveals $1.5B Bitcoin purchase, later sold most holdings.',
    entityIds: ['tesla'],
    type: 'event',
  },
  {
    id: 'te-btc-3',
    date: '2023-01-19',
    title: 'Genesis Files for Bankruptcy',
    description: 'Genesis Global declares bankruptcy following FTX contagion.',
    entityIds: ['genesis-bankruptcy', 'dcg'],
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
    title: 'Pro-Crypto Administration Elected',
    description: 'Pro-crypto administration wins presidency. Tether connections strengthened.',
    entityIds: ['cantor-fitzgerald', 'tether-limited'],
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
    threatLevel: e.threatLevel,
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
          explanation: conn.explanation,
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
