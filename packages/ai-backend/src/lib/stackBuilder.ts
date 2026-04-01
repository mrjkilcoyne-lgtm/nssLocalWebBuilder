import { createClient } from '@supabase/supabase-js';
import type { StackItem, StackRecommendation, StackQuery } from '../types.js';
import { calculateNoobScore, analyzeLanguageComplexity, analyzeModalityBreadth } from './noobCalculator.js';

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required');
  }
  return createClient(url, key);
}

/**
 * Build a technology stack recommendation based on user requirements.
 *
 * Queries the Supabase catalog for matching products, filters by region,
 * modality, and price range, then ranks by review score weighted by
 * beginner-friendliness (adjusted for experience level).
 */
export async function buildStack(query: StackQuery): Promise<StackRecommendation> {
  const { intent, budget, region, modalities, experienceLevel } = query;
  const supabase = getSupabaseClient();

  // Query catalog for each modality
  const allItems: StackItem[] = [];

  for (const modality of modalities) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('modality', modality)
      .or(`region.eq.${region},region.eq.global`)
      .order('review_score', { ascending: false })
      .limit(10);

    if (error) {
      console.error(`Error querying products for modality ${modality}:`, error.message);
      continue;
    }

    if (data) {
      allItems.push(
        ...data.map((row: Record<string, unknown>) => ({
          product_id: String(row.id ?? ''),
          name: String(row.name ?? ''),
          category: String(row.category ?? ''),
          modality: String(row.modality ?? ''),
          price_monthly: Number(row.price_monthly ?? 0),
          review_score: Number(row.review_score ?? 0),
          beginner_friendly: Boolean(row.beginner_friendly),
          affiliate_link: String(row.affiliate_link ?? ''),
        })),
      );
    }
  }

  // Score and rank items
  const scored = allItems.map((item) => {
    const reviewWeight = item.review_score / 5; // normalize to 0-1
    // For lower experience levels, heavily weight beginner-friendliness
    const beginnerBonus = item.beginner_friendly ? (10 - experienceLevel) / 10 : 0;
    const score = reviewWeight * 0.6 + beginnerBonus * 0.4;
    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Select best item per modality, respecting budget
  const selected: StackItem[] = [];
  let totalCost = 0;
  const coveredModalities = new Set<string>();

  for (const { item } of scored) {
    if (coveredModalities.has(item.modality)) continue;
    if (totalCost + item.price_monthly > budget) continue;

    selected.push(item);
    totalCost += item.price_monthly;
    coveredModalities.add(item.modality);
  }

  // Calculate noob score
  const noobScore = calculateNoobScore({
    selfReportedExperience: experienceLevel,
    technicalLanguageComplexity: analyzeLanguageComplexity([intent]),
    modalityBreadth: analyzeModalityBreadth(modalities),
  });

  return {
    items: selected,
    total_monthly_cost: Math.round(totalCost * 100) / 100,
    noob_score: noobScore,
    reasoning: buildReasoning(intent, selected, experienceLevel, noobScore),
  };
}

function buildReasoning(
  intent: string,
  items: StackItem[],
  experienceLevel: number,
  noobScore: number,
): string {
  const level =
    noobScore <= 3 ? 'beginner' : noobScore <= 6 ? 'intermediate' : 'advanced';

  const lines = [
    `Based on your goal to build a ${intent} and your ${level}-level experience:`,
    '',
  ];

  for (const item of items) {
    lines.push(`- ${item.name} (${item.modality}): $${item.price_monthly}/mo — ${item.beginner_friendly ? 'beginner-friendly, ' : ''}rated ${item.review_score}/5`);
  }

  if (noobScore <= 3) {
    lines.push('', 'We prioritized managed, beginner-friendly services that minimize configuration.');
  } else if (noobScore <= 6) {
    lines.push('', 'We balanced ease of use with flexibility for your intermediate skill level.');
  } else {
    lines.push('', 'We selected powerful, flexible tools that give you full control.');
  }

  return lines.join('\n');
}
