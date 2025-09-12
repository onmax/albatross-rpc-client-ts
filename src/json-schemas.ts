import { toJsonSchema } from '@valibot/to-json-schema'

/**
 * Converts a Valibot schema to JSON Schema format
 * Handles unsupported types gracefully by returning null
 */
export function toJsonSchemaFromValibot(valibotSchema: any): any | null {
  try {
    return toJsonSchema(valibotSchema)
  }
  catch (error) {
    console.warn('Schema could not be converted to JSON Schema format:', error)
    return null
  }
}

/**
 * Get a JSON schema for a specific Valibot schema
 * Usage: getJsonSchemaFor(BasicAccountSchema)
 */
export function getJsonSchemaFor(valibotSchema: any): any | null {
  return toJsonSchemaFromValibot(valibotSchema)
}
