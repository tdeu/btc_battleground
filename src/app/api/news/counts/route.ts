import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface EntityMention {
  entity_id: string;
}

export async function GET() {
  try {
    // Get count of news mentions per entity
    const { data, error } = await supabase
      .from('news_entity_mentions')
      .select('entity_id');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ counts: {} });
    }

    // Count mentions per entity
    const counts: Record<string, number> = {};
    if (data) {
      for (const mention of data as EntityMention[]) {
        counts[mention.entity_id] = (counts[mention.entity_id] || 0) + 1;
      }
    }

    return NextResponse.json({ counts });
  } catch (error) {
    console.error('News counts API error:', error);
    return NextResponse.json({ counts: {} });
  }
}
