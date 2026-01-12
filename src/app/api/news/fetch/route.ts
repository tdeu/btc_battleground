import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchAllRSSFeeds } from '@/lib/news/rss-feeds';
import { fetchAllCurrentsNews } from '@/lib/news/currents-api';
import { matchEntities, calculateRelevanceScore } from '@/lib/news/entity-matcher';

// Use service role key for inserts (server-side only)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: Request) {
  // Simple auth check (use a secret token in production)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const results = {
      rss: { fetched: 0, inserted: 0, errors: 0 },
      currents: { fetched: 0, inserted: 0, errors: 0 },
    };

    // Fetch RSS feeds
    const rssItems = await fetchAllRSSFeeds();
    results.rss.fetched = rssItems.length;

    for (const item of rssItems) {
      try {
        // Check if already exists
        const { data: existing } = await supabase
          .from('news_items')
          .select('id')
          .eq('url', item.link)
          .single();

        if (existing) continue;

        // Match entities
        const text = `${item.title} ${item.description}`;
        const matches = matchEntities(text);
        const relevanceScore = calculateRelevanceScore(item.title, item.description, matches);

        // Insert news item
        const { data: newsItem, error } = await supabase
          .from('news_items')
          .insert({
            title: item.title,
            description: item.description,
            url: item.link,
            source: item.source,
            published_at: new Date(item.pubDate).toISOString(),
            relevance_score: relevanceScore,
          })
          .select()
          .single();

        if (error) {
          console.error('Insert error:', error);
          results.rss.errors++;
          continue;
        }

        results.rss.inserted++;

        // Insert entity mentions
        for (const match of matches) {
          await supabase.from('news_entity_mentions').insert({
            news_id: newsItem.id,
            entity_id: match.entityId,
            confidence: match.confidence,
          }).catch(() => {}); // Ignore if entity doesn't exist in DB yet
        }
      } catch (err) {
        results.rss.errors++;
      }
    }

    // Fetch Currents API (if configured)
    if (process.env.CURRENTS_API_KEY) {
      const currentsItems = await fetchAllCurrentsNews();
      results.currents.fetched = currentsItems.length;

      for (const item of currentsItems) {
        try {
          const { data: existing } = await supabase
            .from('news_items')
            .select('id')
            .eq('url', item.url)
            .single();

          if (existing) continue;

          const text = `${item.title} ${item.description}`;
          const matches = matchEntities(text);
          const relevanceScore = calculateRelevanceScore(item.title, item.description, matches);

          const { data: newsItem, error } = await supabase
            .from('news_items')
            .insert({
              title: item.title,
              description: item.description,
              url: item.url,
              source: 'Currents API',
              published_at: new Date(item.published).toISOString(),
              relevance_score: relevanceScore,
            })
            .select()
            .single();

          if (error) {
            results.currents.errors++;
            continue;
          }

          results.currents.inserted++;

          for (const match of matches) {
            await supabase.from('news_entity_mentions').insert({
              news_id: newsItem.id,
              entity_id: match.entityId,
              confidence: match.confidence,
            }).catch(() => {});
          }
        } catch (err) {
          results.currents.errors++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('News fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
