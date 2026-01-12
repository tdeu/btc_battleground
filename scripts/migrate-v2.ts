/**
 * Migration Script v2: Crypto Centralization Observatory
 * Run with: npx tsx scripts/migrate-v2.ts
 *
 * This script:
 * 1. Classifies existing connections into edge types
 * 2. Adds category (bitcoin/stablecoin/both) to entities
 * 3. Sets initial centralization scores
 *
 * Prerequisites:
 * - Run supabase-migration-v2.sql in Supabase first
 * - Make sure .env.local is configured
 */

import { createClient } from '@supabase/supabase-js';
import { entities, timelineEvents } from '../src/data/entities';
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
// EDGE TYPE CLASSIFICATION
// =============================================================================

const EDGE_TYPE_PATTERNS: Record<EdgeType, RegExp> = {
  ownership: /owns|owned|subsidiary|parent|acquir|controls|controlled|majority|issued|issues/i,
  partnership: /partner|co-creat|collaborat|joint venture|alliance|cooperat/i,
  regulatory: /regulat|sanction|lawsuit|sue|investigat|wells notice|enforcement|fine|audit|killed|forced|ordered/i,
  funding: /invest|funded|raised|backing|capital|venture|seed|series|major.*investor/i,
  boardSeat: /board|director|\bceo\b|\bcto\b|\bcfo\b|\bcoo\b|founder|co-founder|executive|chief|president|chairman|works with|associate/i,
  custody: /custod|holds|stores|safekeep|vault|reserve|treasury|backing/i,
  other: /.*/i, // Catch-all, never actually matched
};

function classifyEdgeType(relationship: string): EdgeType {
  const r = relationship.toLowerCase();

  // Check patterns in priority order
  if (EDGE_TYPE_PATTERNS.ownership.test(r)) return 'ownership';
  if (EDGE_TYPE_PATTERNS.regulatory.test(r)) return 'regulatory';
  if (EDGE_TYPE_PATTERNS.boardSeat.test(r)) return 'boardSeat';
  if (EDGE_TYPE_PATTERNS.funding.test(r)) return 'funding';
  if (EDGE_TYPE_PATTERNS.custody.test(r)) return 'custody';
  if (EDGE_TYPE_PATTERNS.partnership.test(r)) return 'partnership';

  return 'other';
}

// =============================================================================
// ENTITY CATEGORY CLASSIFICATION
// =============================================================================

const BITCOIN_ENTITY_IDS = new Set([
  'strategy', // MicroStrategy
  'michael-saylor',
  // Bitcoin ETF entities will be added later
]);

const STABLECOIN_ENTITY_IDS = new Set([
  'usdt', 'usdc', 'dai', 'busd', 'pyusd',
  'tether-limited', 'circle', 'paxos',
  'paolo-ardoino', 'giancarlo-devasini', 'jeremy-allaire', 'charles-cascarilla',
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
    'peter-thiel', 'sam-altman',
  ]);

  if (bothIds.has(entityId)) return 'both';

  // Default: stablecoin for now
  return 'stablecoin';
}

// =============================================================================
// INITIAL CENTRALIZATION SCORES
// =============================================================================

const INITIAL_SCORES: Record<string, number> = {
  // Stablecoins (0 = fully centralized, 1 = fully decentralized)
  'usdt': 0.15,     // Highly centralized - can freeze, single issuer, opaque
  'usdc': 0.20,     // Centralized but audited
  'dai': 0.55,      // More decentralized, but still relies on USDC collateral
  'busd': 0.10,     // Was centralized, now discontinued
  'pyusd': 0.15,    // PayPal controlled

  // Issuers
  'tether-limited': 0.10,
  'circle': 0.20,
  'paxos': 0.25,

  // Government (inherently centralized)
  'fbi': 0.05,
  'us-treasury': 0.05,
  'federal-reserve': 0.05,
  'sec': 0.05,
  'fincen': 0.05,
  'occ': 0.05,

  // Big asset managers
  'blackrock': 0.10,
  'jp-morgan': 0.10,

  // Exchanges
  'coinbase': 0.15,
  'binance': 0.20,

  // Surveillance companies
  'chainalysis': 0.10,
  'palantir': 0.10,

  // Bitcoin-related
  'strategy': 0.30, // MicroStrategy - centralized holder
};

// =============================================================================
// MIGRATION FUNCTIONS
// =============================================================================

async function migrateEntities() {
  console.log('\n📦 Migrating entities with new fields...\n');
  let successCount = 0;
  let errorCount = 0;

  for (const entity of entities) {
    const category = classifyEntityCategory(entity.id, entity.type);
    const score = INITIAL_SCORES[entity.id] ?? null;

    const { error } = await supabase.from('entities').upsert({
      id: entity.id,
      name: entity.name,
      type: entity.type,
      description: entity.description,
      category: category,
      centralization_score: score,
      capture_story: null, // Will be added later
    });

    if (error) {
      console.error(`  ❌ ${entity.name}: ${error.message}`);
      errorCount++;
    } else {
      const scoreStr = score !== null ? ` (score: ${score})` : '';
      console.log(`  ✓ ${entity.name} [${category}]${scoreStr}`);
      successCount++;
    }
  }

  console.log(`\n  ✅ Migrated ${successCount} entities, ${errorCount} errors\n`);
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

  for (const entity of entities) {
    for (const conn of entity.connections) {
      const edgeType = classifyEdgeType(conn.relationship);
      byType[edgeType]++;

      const { error } = await supabase.from('connections').upsert({
        source_id: entity.id,
        target_id: conn.targetId,
        relationship: conn.relationship,
        edge_type: edgeType,
        strength: 0.5, // Default strength
        verified: false,
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
    console.log(`    ${type}: ${cnt}`);
  }
  console.log(`\n  ✅ Migrated ${count} connections\n`);
}

async function migrateTimelineEvents() {
  console.log('\n📅 Migrating timeline events...\n');

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

  console.log(`\n  ✅ Migrated ${timelineEvents.length} timeline events\n`);
}

// =============================================================================
// REPORT GENERATION
// =============================================================================

function generateEdgeTypeReport() {
  console.log('\n📊 Edge Type Classification Report\n');
  console.log('─'.repeat(80));

  for (const entity of entities) {
    for (const conn of entity.connections) {
      const edgeType = classifyEdgeType(conn.relationship);
      const paddedType = edgeType.padEnd(12);
      console.log(`  ${paddedType} │ ${entity.name} → ${conn.targetName}`);
      console.log(`             │ "${conn.relationship}"`);
    }
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
  console.log('  Crypto Centralization Observatory - Migration v2');
  console.log('═'.repeat(60));
  console.log(`\n  Supabase URL: ${supabaseUrl}`);
  console.log(`  Mode: ${dryRun ? 'DRY RUN' : reportOnly ? 'REPORT ONLY' : 'LIVE MIGRATION'}`);
  console.log(`\n  Entities to migrate: ${entities.length}`);
  console.log(`  Timeline events: ${timelineEvents.length}`);

  if (reportOnly) {
    generateEdgeTypeReport();
    return;
  }

  if (dryRun) {
    console.log('\n  [DRY RUN] Would migrate the following:\n');

    let connCount = 0;
    const edgeTypeCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};

    for (const entity of entities) {
      const category = classifyEntityCategory(entity.id, entity.type);
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;

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

    console.log('\n  Connection edge types:');
    for (const [type, count] of Object.entries(edgeTypeCounts)) {
      console.log(`    ${type}: ${count}`);
    }

    console.log(`\n  Total connections: ${connCount}`);
    return;
  }

  // Live migration
  try {
    await migrateEntities();
    await migrateConnections();
    await migrateTimelineEvents();

    console.log('\n═'.repeat(60));
    console.log('  ✅ Migration complete!');
    console.log('═'.repeat(60));
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
