/* eslint-env jest */
import ObliviousSet from '../../MessageChannel/ObliviousSet'
import { sleep } from '../../utils'

describe('ObliviousSet', () => {
  it('create, add, has, get, clear', () => {
    const set = new ObliviousSet(100)
    set.add('foobar')
    const has = set.has('foobar')
    expect(has).toBe(true)

    set.clear()
    const hasAfter = set.has('foobar')
    expect(hasAfter).toBe(false)
  })

  it('.removeTooOldValues() should clear the old values when a new one is given', async () => {
    const set = new ObliviousSet(100)
    set.add('foobar')
    expect(set.has('foobar')).toBe(true)

    await sleep(200)
    set.add('foobar2')

    const has = set.has('foobar')
    expect(has).toBe(false)
  })

  it('.removeTooOldValues() should NOT clear to young values when a new one is given', async () => {
    const set = new ObliviousSet(500)
    set.add('foobar')
    expect(set.has('foobar')).toBe(true)
    
    await sleep(50)

    set.add('foobar2')
    expect(set.has('foobar')).toBe(true)
  })

  it('should clear the value after its ttl', async () => {
    const set = new ObliviousSet(100)
    set.add('foobar')

    await sleep(200)

    set.add('foobar2')
    const has = set.has('foobar')

    expect(has).toBe(false)
  })
})