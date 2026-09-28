import { conceptsDb, questionsDb, questionsDeDb, architectureData, normalizeDifficulty } from '@/data';
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

const difficultyOrder = {
  'EASY': 1,
  'MEDIUM': 2,
  'HARD': 3,
  'ARCHITECT': 4
};

const itemsCache = new Map<string, LearningItem[]>();
const countsCache = new Map<string, { concepts: number; qa: number; arch: number; total: number }>();

export function getTopicItems(topicKey: string): LearningItem[] {
  if (itemsCache.has(topicKey)) {
    return itemsCache.get(topicKey)!;
  }

  const topic = GUIDED_TOPICS.find((t) => t.key === topicKey);
  if (!topic) return [];

  const items: LearningItem[] = [];

  // 2. Filter conceptsDb where category matches conceptCategories (exact)
  conceptsDb.forEach((concept) => {
    if (topic.conceptCategories.includes(concept.category)) {
      items.push({
        id: concept.id,
        type: 'concept',
        difficulty: normalizeDifficulty(concept.difficulty),
        title: concept.term,
        body: concept.definition,
        keyPoints: concept.keyPoints,
        category: concept.category,
        sourceLabel: 'Key Concepts',
        sourceHref: `/concepts?tab=concepts&category=${encodeURIComponent(concept.category)}&term=${encodeURIComponent(concept.term)}`,
      });
    }
  });

  // 3. Filter questionsDb
  questionsDb.forEach((q) => {
    const cat = (q.category || '').toUpperCase();
    if (topic.questionCategories.some((tc) => cat === tc || cat.includes(tc))) {
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
  });

  // Filter questionsDeDb using deKeywords
  questionsDeDb.forEach((q) => {
    const cat = (q.category || '').toUpperCase();
    if (topic.deKeywords.some((dk) => cat.includes(dk))) {
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
  });

  // 4. Filter architectureData
  architectureData.forEach((arch) => {
    const cat = (arch.category || '').toUpperCase();
    if (topic.archKeywords.some((ak) => cat.includes(ak))) {
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
  });

  // 6. Sort: concepts first, then qa, then arch. Within each, EASY→ARCHITECT.
  const sorted = items.sort((a, b) => {
    const typeOrder = { 'concept': 1, 'qa': 2, 'architecture': 3 };
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
    concepts: items.filter(i => i.type === 'concept').length,
    qa: items.filter(i => i.type === 'qa').length,
    arch: items.filter(i => i.type === 'architecture').length,
    total: items.length,
  };

  countsCache.set(topicKey, result);
  return result;
}
