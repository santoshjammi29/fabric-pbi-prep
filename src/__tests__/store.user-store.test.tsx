import { describe, it, expect, beforeEach } from 'vitest'
import { useUserStore } from '@/store/useUserStore'

describe('useUserStore Zustand Store', () => {
  beforeEach(() => {
    useUserStore.getState().resetProgress()
  })

  it('toggles bookmarks correctly without duplicates', () => {
    expect(useUserStore.getState().bookmarks).toEqual([])
    const added = useUserStore.getState().toggleBookmark('topic-1')
    expect(added).toBe(true)
    expect(useUserStore.getState().bookmarks).toEqual(['topic-1'])
    expect(useUserStore.getState().isBookmarked('topic-1')).toBe(true)

    const removed = useUserStore.getState().toggleBookmark('topic-1')
    expect(removed).toBe(false)
    expect(useUserStore.getState().bookmarks).toEqual([])
    expect(useUserStore.getState().isBookmarked('topic-1')).toBe(false)
  })

  it('sets and updates experience tier', () => {
    useUserStore.getState().setExperienceTier('staff_architect')
    expect(useUserStore.getState().experienceTier).toBe('staff_architect')
  })

  it('sets diagnostic score and updates tier', () => {
    useUserStore.getState().setDiagnosticScore(9, 'staff_architect')
    expect(useUserStore.getState().diagnosticScore).toBe(9)
    expect(useUserStore.getState().experienceTier).toBe('staff_architect')
  })

  it('records architecture decisions in ledger', () => {
    useUserStore.getState().recordDecision('adr-001', 'opt-iceberg')
    expect(useUserStore.getState().decisionLedger['adr-001']).toBe('opt-iceberg')
  })

  it('records reviewed card and increments XP and count', () => {
    const initialXp = useUserStore.getState().userData.xp
    useUserStore.getState().recordReviewedCard(25)
    expect(useUserStore.getState().userData.xp).toBe(initialXp + 25)
    expect(useUserStore.getState().userData.reviewedCount).toBe(1)
  })

  it('records last visited topic', () => {
    useUserStore.getState().recordLastTopic({
      title: 'Direct Lake Storage Engine',
      href: '/concepts?term=Direct+Lake',
      category: 'Power BI / Fabric',
      progress: 50,
    })
    expect(useUserStore.getState().lastTopic.title).toBe('Direct Lake Storage Engine')
  })
})
