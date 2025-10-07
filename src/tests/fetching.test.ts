import { ChallengePairManager } from '../lib/challengePairs'
import type { Item, Level } from '../types'

const makeItem = (id: string, level: Exclude<Level, 'Progressive' | 'Custom'>, kind: 'truth' | 'dare'): Item => ({
  id,
  level,
  kind,
  text: id,
  gender_for: [],
  gender_target: [],
  tags: [],
  is_deleted: false,
  deleted_at: undefined,
  updated_at: undefined,
  is_time_based: false,
  duration: 0
})

describe('Challenge fetching', () => {
  let manager: ChallengePairManager
  const level: Exclude<Level, 'Progressive' | 'Custom'> = 'soft'

  beforeEach(() => {
    manager = new ChallengePairManager()
  })

  test('allows partial availability (only truth or only dare)', async () => {
    const items: Item[] = [
      makeItem('t1', level, 'truth'),
      makeItem('t2', level, 'truth')
    ]

    manager.initialize(items, level, {}, [])
    const pair = await manager.fetchPair(level)

    expect(pair.truth).not.toBeNull()
    expect(pair.dare).toBeNull()
    expect(manager.isExhausted()).toBe(false)
  })

  test('exhausted when both truth and dare empty', async () => {
    const items: Item[] = []

    manager.initialize(items, level, {}, [])
    const pair = await manager.fetchPair(level)

    expect(pair.truth).toBeNull()
    expect(pair.dare).toBeNull()
    expect(manager.isExhausted()).toBe(true)
  })

  test('per-level cache is used on changeLevel', async () => {
    const items: Item[] = [
      makeItem('t1', 'soft', 'truth'),
      makeItem('d1', 'soft', 'dare'),
      makeItem('t2', 'mild', 'truth'),
      makeItem('d2', 'mild', 'dare')
    ]

    manager.initialize(items, 'soft', {}, [])
    // First fetch in soft to populate cache implicitly
    await manager.fetchPair('soft')

    // Switch to mild - should fetch and cache
    const mildPair = await manager.changeLevel('mild')
    expect(mildPair.truth?.level).toBe('mild')

    // Switch back to soft - should use cached or fetch consistently
    const softPair = await manager.changeLevel('soft')
    expect(softPair.truth?.level === 'soft' || softPair.dare?.level === 'soft').toBe(true)
  })
})
