import {
  conceptsDb,
  questionsDb,
  questionsDeDb,
  architectureData,
  normalizeDifficulty,
  architectureDiagrams,
  ArchitectureDiagramItem
} from '@/data';
import { GUIDED_TOPICS } from '@/data/guided-learning-topics';

// Unified item type for the learning journey
export interface LearningItem {
  id: string;
  type: 'concept' | 'qa' | 'architecture';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'ARCHITECT';
  title: string;          // concept term OR question text
  body: string;           // definition+explanation OR answer
  keyPoints?: string[];   // for concepts only
  category: string;
  niche?: string;         // for qa/arch
  sourceLabel: string;    // 'Key Concepts' | 'Q&A Prep' | 'Architecture Hub'
  sourceHref: string;     // deep-link with ?card= or ?term= query param
}

export interface TopicSummaryStats {
  concepts: number;
  qa: number;
  arch: number;
  total: number;
  easy: number;
  medium: number;
  hard: number;
  architect: number;
  estMinutes: number;
  diagram?: ArchitectureDiagramItem;
}

const difficultyOrder: Record<'EASY' | 'MEDIUM' | 'HARD' | 'ARCHITECT', number> = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
  ARCHITECT: 4,
};

const itemsCache = new Map<string, LearningItem[]>();
const countsCache = new Map<string, { concepts: number; qa: number; arch: number; total: number }>();
const summaryCache = new Map<string, TopicSummaryStats>();

export function getTopicItems(topicKey: string): LearningItem[] {
  if (itemsCache.has(topicKey)) {
    return itemsCache.get(topicKey)!;
  }

  const topic = GUIDED_TOPICS.find((t) => t.key === topicKey);
  if (!topic) return [];

  const items: LearningItem[] = [];
  const seenIds = new Set<string>();

  // 1. Filter conceptsDb where category matches conceptCategories (exact)
  conceptsDb.forEach((concept) => {
    if (topic.conceptCategories.includes(concept.category)) {
      if (!seenIds.has(concept.id)) {
        seenIds.add(concept.id);
        items.push({
          id: concept.id,
          type: 'concept',
          difficulty: normalizeDifficulty(concept.difficulty),
          title: concept.term,
          body: concept.definition + (concept.explanation ? `\n\n${concept.explanation}` : ''),
          keyPoints: concept.keyPoints,
          category: concept.category,
          sourceLabel: 'Key Concepts',
          sourceHref: `/concepts?tab=concepts&category=${encodeURIComponent(concept.category)}&term=${encodeURIComponent(concept.term)}`,
        });
      }
    }
  });

  // 2. Filter questionsDb
  questionsDb.forEach((q) => {
    const cat = (q.category || '').toUpperCase();
    if (topic.questionCategories.some((tc) => cat === tc || cat.includes(tc))) {
      if (!seenIds.has(q.id)) {
        seenIds.add(q.id);
        items.push({
          id: q.id,
          type: 'qa',
          difficulty: normalizeDifficulty(q.difficulty),
          title: q.question,
          body: q.answer,
          category: q.category,
          niche: q.niche,
          sourceLabel: 'Q&A Prep',
          sourceHref: `/qa-prep?category=${encodeURIComponent(q.category)}&card=${q.id}`,
        });
      }
    }
  });

  // 3. Filter questionsDeDb using deKeywords
  questionsDeDb.forEach((q) => {
    const cat = (q.category || '').toUpperCase();
    if (topic.deKeywords.length > 0 && topic.deKeywords.some((dk) => cat.includes(dk))) {
      if (!seenIds.has(q.id)) {
        seenIds.add(q.id);
        items.push({
          id: q.id,
          type: 'qa',
          difficulty: normalizeDifficulty(q.difficulty),
          title: q.question,
          body: q.answer,
          category: q.category,
          niche: q.niche,
          sourceLabel: 'Q&A Prep',
          sourceHref: `/qa-prep?category=${encodeURIComponent(q.category)}&card=${q.id}`,
        });
      }
    }
  });

  // 4. Filter architectureData using archKeywords
  architectureData.forEach((arch) => {
    const cat = (arch.category || '').toUpperCase();
    if (topic.archKeywords.some((ak) => cat.includes(ak))) {
      if (!seenIds.has(arch.id)) {
        seenIds.add(arch.id);
        items.push({
          id: arch.id,
          type: 'architecture',
          difficulty: normalizeDifficulty(arch.difficulty),
          title: arch.question,
          body: arch.answer,
          category: arch.category,
          niche: arch.niche,
          sourceLabel: 'Architecture Hub',
          sourceHref: `/architecture?category=${encodeURIComponent(arch.category)}&card=${arch.id}`,
        });
      }
    }
  });

  // 5. Sort: concepts first, then qa, then architecture. Within each, EASY→ARCHITECT.
  const sorted = items.sort((a, b) => {
    const typeOrder = { concept: 1, qa: 2, architecture: 3 };
    if (typeOrder[a.type] !== typeOrder[b.type]) {
      return typeOrder[a.type] - typeOrder[b.type];
    }
    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
  });

  itemsCache.set(topicKey, sorted);
  return sorted;
}

export function getTopicCounts(topicKey: string): { concepts: number; qa: number; arch: number; total: number } {
  if (countsCache.has(topicKey)) {
    return countsCache.get(topicKey)!;
  }

  const items = getTopicItems(topicKey);
  const result = {
    concepts: items.filter((i) => i.type === 'concept').length,
    qa: items.filter((i) => i.type === 'qa').length,
    arch: items.filter((i) => i.type === 'architecture').length,
    total: items.length,
  };

  countsCache.set(topicKey, result);
  return result;
}

export function getTopicDiagram(topicKey: string): ArchitectureDiagramItem | undefined {
  const topic = GUIDED_TOPICS.find((t) => t.key === topicKey);
  if (!topic) return undefined;

  if (topic.diagramId) {
    const directMatch = architectureDiagrams.find((d) => d.id === topic.diagramId);
    if (directMatch) return directMatch;
  }

  // Fallback match based on label/keywords
  const keyword = topic.label.toLowerCase();
  return architectureDiagrams.find(
    (d) =>
      d.title.toLowerCase().includes(keyword) ||
      d.tags.some((tag) => tag.toLowerCase().includes(keyword))
  );
}

export function getTopicSummaryStats(topicKey: string): TopicSummaryStats {
  if (summaryCache.has(topicKey)) {
    return summaryCache.get(topicKey)!;
  }

  const items = getTopicItems(topicKey);
  const diagram = getTopicDiagram(topicKey);

  const stats: TopicSummaryStats = {
    concepts: 0,
    qa: 0,
    arch: 0,
    total: items.length,
    easy: 0,
    medium: 0,
    hard: 0,
    architect: 0,
    estMinutes: items.length * 2, // ~2 mins average per item
    diagram,
  };

  items.forEach((item) => {
    if (item.type === 'concept') stats.concepts++;
    else if (item.type === 'qa') stats.qa++;
    else if (item.type === 'architecture') stats.arch++;

    if (item.difficulty === 'EASY') stats.easy++;
    else if (item.difficulty === 'MEDIUM') stats.medium++;
    else if (item.difficulty === 'HARD') stats.hard++;
    else if (item.difficulty === 'ARCHITECT') stats.architect++;
  });

  summaryCache.set(topicKey, stats);
  return stats;
}

export function getPlatformOverviewStats(): {
  totalTopics: number;
  totalUniqueItems: number;
  totalWhiteboards: number;
  domainsCount: number;
} {
  const allIds = new Set<string>();
  GUIDED_TOPICS.forEach((topic) => {
    const items = getTopicItems(topic.key);
    items.forEach((i) => allIds.add(i.id));
  });

  return {
    totalTopics: GUIDED_TOPICS.length,
    totalUniqueItems: allIds.size,
    totalWhiteboards: architectureDiagrams.length,
    domainsCount: new Set(GUIDED_TOPICS.map((t) => t.domain)).size,
  };
}
