import { describe, expect, it } from 'vitest'
import { getPolicyConstants } from '../src/http'

describe('simple', () => {
  it('should have policy', async () => {
    const { data } = await getPolicyConstants({ url: 'https://rpc.nimiqwatch.com/' })
    expect(data).toBeTypeOf('object')
    expect(data?.batchesPerEpoch).toBeTypeOf('number')
  })
})
