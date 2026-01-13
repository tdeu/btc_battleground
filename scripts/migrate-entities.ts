/**
 * Migration Script: Decentralization Score Migration
 * Run with: npx tsx scripts/migrate-entities.ts
 *
 * This script:
 * 1. Reads all entities from src/data/entities.ts
 * 2. Assigns decentralization_score (0-100) based on type and specific rules
 * 3. Inserts/updates entities in Supabase
 * 4. Inserts all connections into connections table
 *
 * Prerequisites:
 * - Run scripts/migration-decentralization-score.sql in Supabase first
 * - Make sure .env.local is configured
 */

import { createClient } from '@supabase/supabase-js';
import { entities, timelineEvents, classifyEdgeType } from '../src/data/entities';
import type { EdgeType, EntityCategory } from '../src/types';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables!');
  console.error('Make sure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// =============================================================================
// DECENTRALIZATION SCORE OVERRIDES (0-100, 100 = fully decentralized)
// =============================================================================

/**
 * Specific entity score overrides.
 * These take precedence over type-based defaults.
 */
const SCORE_OVERRIDES: Record<string, number> = {
  // =========================================================================
  // HIGHLY CENTRALIZED (0-15) - Government, regulators, large finance
  // =========================================================================

  // Government entities (5)
  'fbi': 5,
  'us-treasury': 5,
  'federal-reserve': 5,
  'sec': 5,
  'fincen': 5,
  'occ': 5,

  // Large asset managers and traditional finance (10-15)
  'blackrock': 10,
  'jp-morgan': 10,
  'palantir': 10,
  'chainalysis': 10,
  'cantor-fitzgerald': 15,

  // Centralized custodians (15)
  'coinbase-custody': 15,
  'fidelity-digital': 20,
  'bitgo': 25,
  'fireblocks': 25,

  // Bitcoin ETFs (15-20) - centralized investment products
  'ibit': 15,
  'fbtc': 20,
  'gbtc': 20,
  'arkb': 20,

  // =========================================================================
  // MODERATELY CENTRALIZED (20-40) - Stablecoin issuers, exchanges
  // =========================================================================

  // Stablecoin issuers (20-25)
  'tether-limited': 20,
  'circle': 25,
  'paxos': 25,

  // Stablecoins (25-45)
  'usdt': 25,
  'usdc': 30,
  'busd': 25,
  'pyusd': 25,
  'dai': 45, // More decentralized due to crypto collateral

  // Exchanges (30-35)
  'coinbase': 35,
  'binance': 30,

  // Large organizations (25-35)
  'strategy': 25, // MicroStrategy - centralized holder but Bitcoin-focused
  'fidelity': 25,
  'grayscale': 25,
  'dcg': 25,
  'galaxy-digital': 30,
  'alameda-research': 20,

  // Corporate BTC holders (30-35)
  'tesla': 30,
  'marathon-digital': 25,
  'block-inc': 40, // Jack Dorsey's company, more decentralization-focused

  // =========================================================================
  // CENTRALIZATION-ALIGNED PEOPLE (25-40)
  // =========================================================================

  // Finance/government aligned
  'larry-fink': 25,
  'jamie-dimon': 20,
  'howard-lutnick': 30,
  'jeremy-allaire': 35,
  'charles-cascarilla': 35,
  'paolo-ardoino': 30,
  'giancarlo-devasini': 30,
  'steve-mnuchin': 25,
  'brian-brooks': 35,
  'sam-bankman-fried': 15,
  'caroline-ellison': 20,

  // Political figures
  'donald-trump': 35,
  'jared-kushner': 30,
  'david-sacks': 40,

  // =========================================================================
  // MIXED (40-60) - People with mixed positions
  // =========================================================================

  'michael-saylor': 50, // Bitcoin advocate but uses leverage/custody
  'cathie-wood': 45,
  'elon-musk': 45,
  'peter-thiel': 40,
  'sam-altman': 35,
  'barry-silbert': 40,
  'mike-novogratz': 45,
  'abigail-johnson': 40,
  'michael-sonnenshein': 40,
  'mike-belshe': 50,
  'michael-shaulov': 45,
  'fred-thiel': 45,

  // =========================================================================
  // DECENTRALIZATION-ALIGNED (60-80)
  // =========================================================================

  'jack-dorsey': 70, // Strong self-custody advocate, nostr developer

  // =========================================================================
  // CENTRALIZATION CONCEPTS (10-30)
  // =========================================================================

  'dollar-hegemony': 10,
  'cbdc': 15,
  'programmable-money': 20,
  'financial-surveillance': 10,
  'financial-industrial-complex': 10,
  'digital-id': 20,
  'btc-custody-concentration': 15,
  'btc-mining-centralization': 25,

  // =========================================================================
  // DECENTRALIZATION CONCEPTS (70-100)
  // =========================================================================

  'self-custody': 95,
  'cash-app': 55, // Enables Bitcoin access but custodial
  'bitcoin-protocol': 100, // The benchmark

  // =========================================================================
  // EVENTS (50 - neutral)
  // =========================================================================

  'ftx-collapse': 50,
  'tornado-cash-sanctions': 50,
  'congressional-hearing': 50,
  'btc-etf-approval': 50,
  'genesis-bankruptcy': 50,
  'microstrategy-btc-buys': 50,
};

/**
 * Default scores by entity type (used when no specific override exists)
 */
const DEFAULT_SCORES_BY_TYPE: Record<string, number> = {
  government: 5,
  organization: 30,
  stablecoin: 30,
  person: 40,
  concept: 50,
  event: 50,
};

/**
 * Get decentralization score for an entity
 */
function getDecentralizationScore(entityId: string, entityType: string): number {
  // Check for specific override first
  if (entityId in SCORE_OVERRIDES) {
    return SCORE_OVERRIDES[entityId];
  }

  // Fall back to type-based default
  return DEFAULT_SCORES_BY_TYPE[entityType] ?? 50;
}

// =============================================================================
// ENTITY CATEGORY CLASSIFICATION
// =============================================================================

const BITCOIN_ENTITY_IDS = new Set([
  'strategy', 'ibit', 'fbtc', 'gbtc', 'arkb',
  'coinbase-custody', 'fidelity-digital', 'bitgo', 'fireblocks',
  'fidelity', 'grayscale', 'dcg', 'galaxy-digital',
  'tesla', 'block-inc', 'marathon-digital',
  'btc-custody-concentration', 'btc-mining-centralization', 'self-custody', 'cash-app',
  'btc-etf-approval', 'genesis-bankruptcy', 'microstrategy-btc-buys',
  'michael-saylor', 'cathie-wood', 'jack-dorsey', 'barry-silbert',
  'mike-novogratz', 'abigail-johnson', 'michael-sonnenshein',
  'mike-belshe', 'michael-shaulov', 'fred-thiel',
  'bitcoin-protocol',
]);

const STABLECOIN_ENTITY_IDS = new Set([
  'usdt', 'usdc', 'dai', 'busd', 'pyusd',
  'tether-limited', 'circle', 'paxos',
  'paolo-ardoino', 'giancarlo-devasini', 'jeremy-allaire', 'charles-cascarilla',
  'dollar-hegemony', 'cbdc', 'programmable-money',
  'tornado-cash-sanctions', 'congressional-hearing',
]);

function classifyEntityCategory(entityId: string, entityType: string): EntityCategory {
  if (BITCOIN_ENTITY_IDS.has(entityId)) return 'bitcoin';
  if (STABLECOIN_ENTITY_IDS.has(entityId)) return 'stablecoin';

  // Organizations/people connected to both
  const bothIds = new Set([
    'blackrock', 'coinbase', 'binance', 'chainalysis',
    'larry-fink', 'brian-brooks',
    'us-treasury', 'sec', 'federal-reserve', 'fincen', 'occ', 'fbi',
    'donald-trump', 'david-sacks', 'howard-lutnick',
    'peter-thiel', 'sam-altman', 'elon-musk',
    'financial-surveillance', 'financial-industrial-complex', 'digital-id',
  ]);

  if (bothIds.has(entityId)) return 'both';

  // Default: stablecoin
  return 'stablecoin';
}

// =============================================================================
// BITCOIN PROTOCOL ENTITY (NEW)
// =============================================================================

const BITCOIN_PROTOCOL_ENTITY = {
  id: 'bitcoin-protocol',
  name: 'Bitcoin Protocol',
  type: 'concept' as const,
  description: 'The Bitcoin network itself - a decentralized, permissionless, censorship-resistant protocol. The benchmark for true decentralization.',
  category: 'bitcoin' as EntityCategory,
  captureStory: 'Bitcoin was created as a peer-to-peer electronic cash system with no central authority. Its open-source protocol, distributed mining, and permissionless nature represent the gold standard of decentralization that all other entities are measured against. However, the growing concentration of Bitcoin in ETFs, custodians, and corporate treasuries threatens these founding principles.',
  connections: [
    { targetId: 'self-custody', targetName: 'Self-Custody', relationship: 'enables' },
    { targetId: 'btc-custody-concentration', targetName: 'BTC Custody Concentration', relationship: 'threatened by' },
    { targetId: 'btc-mining-centralization', targetName: 'BTC Mining Centralization', relationship: 'vulnerable to' },
  ],
};

// =============================================================================
// MIGRATION FUNCTIONS
// =============================================================================

async function migrateEntities() {
  console.log('\n📦 Migrating entities with decentralization scores...\n');
  let successCount = 0;
  let errorCount = 0;

  // Combine hardcoded entities with the new bitcoin-protocol entity
  const allEntities = [...entities, BITCOIN_PROTOCOL_ENTITY];

  for (const entity of allEntities) {
    const category = entity.category || classifyEntityCategory(entity.id, entity.type);
    const score = getDecentralizationScore(entity.id, entity.type);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entityAny = entity as any;
    const { error } = await supabase.from('entities').upsert({
      id: entity.id,
      name: entity.name,
      type: entity.type,
      description: entity.description,
      category: category,
      decentralization_score: score,
      capture_story: entityAny.captureStory || null,
      metadata: entityAny.metadata || {},
    });

    if (error) {
      console.error(`  ❌ ${entity.name}: ${error.message}`);
      errorCount++;
    } else {
      const scoreLabel = getScoreLabel(score);
      console.log(`  ✓ ${entity.name.padEnd(40)} Score: ${String(score).padStart(3)} (${scoreLabel})`);
      successCount++;
    }
  }

  console.log(`\n  ✅ Migrated ${successCount} entities, ${errorCount} errors\n`);
  return successCount;
}

async function migrateConnections() {
  console.log('\n🔗 Migrating connections with edge types...\n');

  let count = 0;
  let byType: Record<EdgeType, number> = {
    ownership: 0,
    partnership: 0,
    regulatory: 0,
    funding: 0,
    boardSeat: 0,
    custody: 0,
    other: 0,
  };

  // Combine hardcoded entities with the new bitcoin-protocol entity
  const allEntities = [...entities, BITCOIN_PROTOCOL_ENTITY];

  for (const entity of allEntities) {
    for (const conn of entity.connections) {
      const edgeType = classifyEdgeType(conn.relationship);
      byType[edgeType]++;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const connAny = conn as any;
      const { error } = await supabase.from('connections').upsert({
        source_id: entity.id,
        target_id: conn.targetId,
        relationship: conn.relationship,
        edge_type: edgeType,
        strength: connAny.strength ?? 0.5,
        verified: connAny.verified ?? false,
      }, {
        onConflict: 'source_id,target_id,relationship',
      });

      if (error) {
        // Might fail if target entity doesn't exist, that's OK
        if (!error.message.includes('foreign key')) {
          console.error(`  ❌ ${entity.id} -> ${conn.targetId}: ${error.message}`);
        }
      } else {
        count++;
      }
    }
  }

  console.log('\n  Edge type breakdown:');
  for (const [type, cnt] of Object.entries(byType)) {
    console.log(`    ${type.padEnd(12)}: ${cnt}`);
  }
  console.log(`\n  ✅ Migrated ${count} connections\n`);
  return count;
}

async function migrateTimelineEvents() {
  console.log('\n📅 Migrating timeline events...\n');
  let count = 0;

  for (const event of timelineEvents) {
    const { error: eventError } = await supabase
      .from('timeline_events')
      .upsert({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        source_url: event.sourceUrl || null,
      });

    if (eventError) {
      console.error(`  ❌ ${event.title}: ${eventError.message}`);
      continue;
    }

    console.log(`  ✓ ${event.title}`);
    count++;

    // Insert event-entity relationships
    for (const entityId of event.entityIds) {
      await supabase.from('event_entities').upsert({
        event_id: event.id,
        entity_id: entityId,
      }, {
        onConflict: 'event_id,entity_id',
      });
    }
  }

  console.log(`\n  ✅ Migrated ${count} timeline events\n`);
  return count;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Decentralized';
  if (score >= 60) return 'Mostly Decentralized';
  if (score >= 40) return 'Mixed';
  if (score >= 20) return 'Mostly Centralized';
  return 'Centralized';
}

function generateSampleReport() {
  console.log('\n📊 Sample Entities with Decentralization Scores\n');
  console.log('─'.repeat(80));
  console.log('Entity'.padEnd(35) + 'Type'.padEnd(15) + 'Score'.padStart(6) + '  Label');
  console.log('─'.repeat(80));

  const sampleEntities = [
    { id: 'sec', type: 'government', name: 'SEC' },
    { id: 'blackrock', type: 'organization', name: 'BlackRock' },
    { id: 'coinbase-custody', type: 'organization', name: 'Coinbase Custody' },
    { id: 'usdt', type: 'stablecoin', name: 'USDT (Tether)' },
    { id: 'usdc', type: 'stablecoin', name: 'USDC' },
    { id: 'dai', type: 'stablecoin', name: 'DAI' },
    { id: 'michael-saylor', type: 'person', name: 'Michael Saylor' },
    { id: 'jack-dorsey', type: 'person', name: 'Jack Dorsey' },
    { id: 'self-custody', type: 'concept', name: 'Self-Custody' },
    { id: 'bitcoin-protocol', type: 'concept', name: 'Bitcoin Protocol' },
  ];

  for (const e of sampleEntities) {
    const score = getDecentralizationScore(e.id, e.type);
    const label = getScoreLabel(score);
    console.log(`${e.name.padEnd(35)}${e.type.padEnd(15)}${String(score).padStart(6)}  ${label}`);
  }

  console.log('─'.repeat(80));
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const reportOnly = args.includes('--report');

  console.log('═'.repeat(60));
  console.log('  Crypto Centralization Observatory');
  console.log('  Decentralization Score Migration');
  console.log('═'.repeat(60));
  console.log(`\n  Supabase URL: ${supabaseUrl}`);
  console.log(`  Mode: ${dryRun ? 'DRY RUN' : reportOnly ? 'REPORT ONLY' : 'LIVE MIGRATION'}`);
  console.log(`\n  Entities to migrate: ${entities.length + 1} (including bitcoin-protocol)`);
  console.log(`  Timeline events: ${timelineEvents.length}`);

  if (reportOnly) {
    generateSampleReport();
    return;
  }

  if (dryRun) {
    console.log('\n  [DRY RUN] Would migrate the following:\n');

    const allEntities = [...entities, BITCOIN_PROTOCOL_ENTITY];

    let connCount = 0;
    const edgeTypeCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const scoreBuckets: Record<string, number> = {
      'Centralized (0-19)': 0,
      'Mostly Centralized (20-39)': 0,
      'Mixed (40-59)': 0,
      'Mostly Decentralized (60-79)': 0,
      'Decentralized (80-100)': 0,
    };

    for (const entity of allEntities) {
      const category = entity.category || classifyEntityCategory(entity.id, entity.type);
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;

      const score = getDecentralizationScore(entity.id, entity.type);
      if (score < 20) scoreBuckets['Centralized (0-19)']++;
      else if (score < 40) scoreBuckets['Mostly Centralized (20-39)']++;
      else if (score < 60) scoreBuckets['Mixed (40-59)']++;
      else if (score < 80) scoreBuckets['Mostly Decentralized (60-79)']++;
      else scoreBuckets['Decentralized (80-100)']++;

      for (const conn of entity.connections) {
        const edgeType = classifyEdgeType(conn.relationship);
        edgeTypeCounts[edgeType] = (edgeTypeCounts[edgeType] || 0) + 1;
        connCount++;
      }
    }

    console.log('  Entity categories:');
    for (const [cat, count] of Object.entries(categoryCounts)) {
      console.log(`    ${cat}: ${count}`);
    }

    console.log('\n  Decentralization score distribution:');
    for (const [bucket, count] of Object.entries(scoreBuckets)) {
      console.log(`    ${bucket}: ${count}`);
    }

    console.log('\n  Connection edge types:');
    for (const [type, count] of Object.entries(edgeTypeCounts)) {
      console.log(`    ${type}: ${count}`);
    }

    console.log(`\n  Total connections: ${connCount}`);

    generateSampleReport();
    return;
  }

  // Live migration
  try {
    const entityCount = await migrateEntities();
    const connectionCount = await migrateConnections();
    const eventCount = await migrateTimelineEvents();

    console.log('\n═'.repeat(60));
    console.log('  ✅ Migration complete!');
    console.log(`     - ${entityCount} entities`);
    console.log(`     - ${connectionCount} connections`);
    console.log(`     - ${eventCount} timeline events`);
    console.log('═'.repeat(60));

    generateSampleReport();
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
