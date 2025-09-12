import { describe, expect, it } from 'vitest'
import { initRpcClient } from '../src'
import { AccountTypeJSONSchema, BasicAccountJSONSchema, BlockTypeJSONSchema } from '../src/json-schemas-exported'

describe('validation System', () => {
  it('should have pre-converted JSON schemas', () => {
    expect(BasicAccountJSONSchema).toBeDefined()
    expect(BasicAccountJSONSchema.type).toBe('object')

    expect(AccountTypeJSONSchema).toBeDefined()

    expect(BlockTypeJSONSchema).toBeDefined()
  })

  it('should handle null schemas gracefully', () => {
    // This test now verifies that our JSON schemas are not null
    expect(BasicAccountJSONSchema).not.toBeNull()
    expect(AccountTypeJSONSchema).not.toBeNull()
    expect(BlockTypeJSONSchema).not.toBeNull()
  })

  it('should support direct JSON schema imports', async () => {
    // Test that we can import JSON schemas directly
    const { BasicAccountJSONSchema: ImportedJSONSchema } = await import('../src/json-schemas-exported')
    expect(ImportedJSONSchema).toBeDefined()
    expect(ImportedJSONSchema.type).toBe('object')
  })

  it('should initialize client with validation options', () => {
    // This should not throw
    expect(() => {
      initRpcClient({
        url: 'http://localhost:8080',
        validation: {
          validateBody: true,
          validationLevel: 'error',
        },
      })
    }).not.toThrow()

    expect(() => {
      initRpcClient({
        url: 'http://localhost:8080',
        validation: {
          validateBody: false,
          validationLevel: 'warning',
        },
      })
    }).not.toThrow()
  })
})
