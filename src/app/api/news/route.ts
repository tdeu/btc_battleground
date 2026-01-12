import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const entityId = searchParams.get('entity');

  try {
    let query = supabase
      .from('news_items')
      .select(`
        *,
        news_entity_mentions (
          entity_id,
          confidence
        )
      `)
      .order('published_at', { ascending: false })
      .limit(limit);

    // Filter by entity if specified
    if (entityId) {
      const { data: mentionIds } = await supabase
        .from('news_entity_mentions')
        .select('news_id')
        .eq('entity_id', entityId);

      if (mentionIds && mentionIds.length > 0) {
        const newsIds = mentionIds.map(m => m.news_id);
        query = query.in('id', newsIds);
      } else {
        return NextResponse.json({ news: [] });
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }

    return NextResponse.json({ news: data || [] });
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
