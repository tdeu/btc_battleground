import { Entity, TimelineEvent } from '@/types';

export const entities: Entity[] = [
  // STABLECOINS
  {
    id: 'usdt',
    name: 'USDT (Tether)',
    type: 'stablecoin',
    description: 'Largest stablecoin. ~$100B+ in circulation.',
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
    connections: [
      { targetId: 'larry-fink', targetName: 'Larry Fink', relationship: 'CEO' },
      { targetId: 'circle', targetName: 'Circle', relationship: 'major investor' },
      { targetId: 'us-treasury', targetName: 'US Treasury', relationship: 'advisory role' },
      { targetId: 'federal-reserve', targetName: 'Federal Reserve', relationship: 'crisis manager' },
    ],
  },
  {
    id: 'jp-morgan',
    name: 'JP Morgan',
    type: 'organization',
    description: 'Largest US bank.',
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
    description: 'Largest corporate Bitcoin holder.',
    connections: [
      { targetId: 'michael-saylor', targetName: 'Michael Saylor', relationship: 'founder' },
      { targetId: 'financial-industrial-complex', targetName: 'Financial Industrial Complex', relationship: 'subordinate to creditors' },
    ],
  },

  // GOVERNMENT
  {
    id: 'fbi',
    name: 'FBI',
    type: 'government',
    description: 'Federal Bureau of Investigation.',
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
    connections: [
      { targetId: 'jp-morgan', targetName: 'JP Morgan', relationship: 'CEO' },
      { targetId: 'financial-industrial-complex', targetName: 'Financial Industrial Complex', relationship: 'core member' },
    ],
  },

  // CONCEPTS
  {
    id: 'dollar-hegemony',
    name: 'Dollar Hegemony',
    type: 'concept',
    description: "US dollar's dominance as world reserve currency.",
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
    connections: [
      { targetId: 'sam-altman', targetName: 'Sam Altman', relationship: 'builds Worldcoin' },
      { targetId: 'palantir', targetName: 'Palantir', relationship: 'builds systems' },
    ],
  },

  // EVENTS
  {
    id: 'ftx-collapse',
    name: 'FTX Collapse (2022)',
    type: 'event',
    description: "Sam Bankman-Fried's exchange collapsed.",
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
    connections: [
      { targetId: 'charles-cascarilla', targetName: 'Charles Cascarilla', relationship: 'testified' },
      { targetId: 'paxos', targetName: 'Paxos', relationship: 'CEO testified' },
      { targetId: 'financial-surveillance', targetName: 'Financial Surveillance', relationship: 'admitted capabilities' },
    ],
    metadata: { date: '2025-03' },
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
];

// Helper function to convert entities to graph data
export function getGraphData() {
  const nodes = entities.map(e => ({
    id: e.id,
    name: e.name,
    type: e.type,
    connections: e.connections.length,
  }));

  const links: { source: string; target: string; relationship: string }[] = [];
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
