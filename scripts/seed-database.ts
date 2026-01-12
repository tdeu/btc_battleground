/**
 * Database Seeding Script
 * Run with: npx tsx scripts/seed-database.ts
 *
 * This migrates the static entities data to Supabase.
 * Make sure your .env.local file is configured first.
 */

import { createClient } from '@supabase/supabase-js';
import { entities, timelineEvents } from '../src/data/entities';

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

async function seedEntities() {
  console.log('Seeding entities...');

  for (const entity of entities) {
    const { error } = await supabase.from('entities').upsert({
      id: entity.id,
      name: entity.name,
      type: entity.type,
      description: entity.description,
    });

    if (error) {
      console.error(`Failed to insert entity ${entity.id}:`, error.message);
    } else {
      console.log(`  + ${entity.name}`);
    }
  }

  console.log(`Inserted ${entities.length} entities\n`);
}

async function seedConnections() {
  console.log('Seeding connections...');
  let count = 0;

  for (const entity of entities) {
    for (const conn of entity.connections) {
      const { error } = await supabase.from('connections').upsert({
        source_id: entity.id,
        target_id: conn.targetId,
        relationship: conn.relationship,
      }, {
        onConflict: 'source_id,target_id,relationship',
      });

      if (error) {
        // Might fail if target entity doesn't exist
        console.error(`  Failed: ${entity.id} -> ${conn.targetId}: ${error.message}`);
      } else {
        count++;
      }
    }
  }

  console.log(`Inserted ${count} connections\n`);
}

async function seedTimelineEvents() {
  console.log('Seeding timeline events...');

  for (const event of timelineEvents) {
    const { error: eventError, data: eventData } = await supabase
      .from('timeline_events')
      .upsert({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        source_url: event.sourceUrl || null,
      })
      .select()
      .single();

    if (eventError) {
      console.error(`Failed to insert event ${event.id}:`, eventError.message);
      continue;
    }

    console.log(`  + ${event.title}`);

    // Insert event-entity relationships
    for (const entityId of event.entityIds) {
      const { error } = await supabase.from('event_entities').upsert({
        event_id: event.id,
        entity_id: entityId,
      }, {
        onConflict: 'event_id,entity_id',
      });

      if (error) {
        // Entity might not exist in DB
      }
    }
  }

  console.log(`Inserted ${timelineEvents.length} timeline events\n`);
}

async function main() {
  console.log('Starting database seed...\n');
  console.log(`Supabase URL: ${supabaseUrl}\n`);

  try {
    await seedEntities();
    await seedConnections();
    await seedTimelineEvents();

    console.log('Database seeding complete!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

main();
