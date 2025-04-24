import { describe, expect, it } from 'vitest'
import { getPolicyConstants } from '../src/http'

describe('simple', () => {
  it('should have policy', async () => {
    const [isOk, error, data] = await getPolicyConstants({ url: 'https://rpc.nimiqwatch.com/' })
    expect(isOk).toBe(true)
    expect(error).toBeUndefined()
    expect(data).toBeTypeOf('object')
    expect(data?.batchesPerEpoch).toBeTypeOf('number')
  })
})
