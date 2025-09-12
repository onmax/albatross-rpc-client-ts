import { describe, expect, it } from 'vitest'
import { getJsonSchemaFor, initRpcClient } from '../src'
import { AccountTypeSchema, BasicAccountSchema, BlockTypeSchema } from '../src/schemas'

describe('validation System', () => {
  it('should convert Valibot schemas to JSON Schema', () => {
    const basicAccountJsonSchema = getJsonSchemaFor(BasicAccountSchema)
    expect(basicAccountJsonSchema).toBeDefined()
    expect(basicAccountJsonSchema.type).toBe('object')

    const accountTypeJsonSchema = getJsonSchemaFor(AccountTypeSchema)
    expect(accountTypeJsonSchema).toBeDefined()

    const blockTypeJsonSchema = getJsonSchemaFor(BlockTypeSchema)
    expect(blockTypeJsonSchema).toBeDefined()
  })

  it('should handle schemas that cannot be converted', () => {
    // Test with an invalid schema
    const invalidSchema = null
    const result = getJsonSchemaFor(invalidSchema)
    expect(result).toBeNull()
  })

  it('should support direct schema imports', async () => {
    // Test that we can import schemas directly
    const { BasicAccountSchema: ImportedSchema } = await import('../src/schemas')
    expect(ImportedSchema).toBeDefined()

    const jsonSchema = getJsonSchemaFor(ImportedSchema)
    expect(jsonSchema).toBeDefined()
    expect(jsonSchema.type).toBe('object')
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
