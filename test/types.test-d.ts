import type { HttpRpcResult } from '../src/types'
import { describe, expectTypeOf, it } from 'vitest'

describe('HttpRpcResult types', () => {
  it('supports array destructuring', () => {
    const result = {} as HttpRpcResult<number>
    const [ok, err, data, meta] = result
    expectTypeOf(ok).toEqualTypeOf<boolean>()
    expectTypeOf(err).toEqualTypeOf<string | undefined>()
    expectTypeOf(data).toEqualTypeOf<number | undefined>()
    expectTypeOf(meta).toMatchTypeOf<{ request: unknown }>()
  })

  it('supports object destructuring', () => {
    const result = {} as HttpRpcResult<number>
    const { success, error, data, metadata } = result
    expectTypeOf(success).toEqualTypeOf<boolean>()
    expectTypeOf(error).toEqualTypeOf<string | undefined>()
    expectTypeOf(data).toEqualTypeOf<number | undefined>()
    expectTypeOf(metadata).toMatchTypeOf<{ request: unknown }>()
  })

  it('narrows success type with array destructuring', () => {
    const result = {} as HttpRpcResult<string>
    const [ok, , data] = result
    if (ok) {
      expectTypeOf(data).toEqualTypeOf<string>()
    }
    else {
      expectTypeOf(data).toEqualTypeOf<undefined>()
    }
  })

  it('narrows success type with object destructuring', () => {
    const result = {} as HttpRpcResult<string>
    const { success, data } = result
    if (success) {
      expectTypeOf(data).toEqualTypeOf<string>()
    }
    else {
      expectTypeOf(data).toEqualTypeOf<undefined>()
    }
  })
})
