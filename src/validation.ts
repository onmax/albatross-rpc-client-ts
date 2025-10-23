import type { ValidationOptions } from './types/http'
import * as v from 'valibot'

export interface ValidationResult {
  isValid: boolean
  data?: any
  errors?: string[]
}

let schemasCache: Record<string, v.BaseSchema<any, any, any>> | null = null

async function loadSchemas(): Promise<Record<string, v.BaseSchema<any, any, any>>> {
  if (schemasCache)
    return schemasCache

  const schemas = await import('./schemas')
  schemasCache = {
    // Common schemas
    PolicyConstants: schemas.PolicyConstantsSchema,
    Account: schemas.AccountSchema,
    Transaction: schemas.TransactionSchema,
    Staker: schemas.StakerSchema,
    Validator: schemas.ValidatorSchema,
    Slot: schemas.SlotSchema,
    PenalizedSlots: schemas.PenalizedSlotsSchema,
    Inherent: schemas.InherentSchema,
    MempoolInfo: schemas.MempoolInfoSchema,
    WalletAccount: schemas.WalletAccountSchema,
    Signature: schemas.SignatureSchema,
    BlockchainState: schemas.BlockchainStateSchema,
    Auth: schemas.AuthSchema,

    // Block schemas
    Block: schemas.BlockSchema,
    MicroBlock: schemas.MicroBlockSchema,
    MacroBlock: schemas.MacroBlockSchema,
    ElectionMacroBlock: schemas.ElectionMacroBlockSchema,
    PartialBlock: schemas.PartialBlockSchema,

    // Log schemas
    Log: schemas.LogSchema,
    TransactionLog: schemas.TransactionLogSchema,
    BlockLog: schemas.BlockLogSchema,
    BlockLogType: schemas.BlockLogTypeSchema,
    BlockLogResponse: schemas.BlockLogResponseSchema,

    // HTTP schemas
    HttpOptions: schemas.HttpOptionsSchema,
    SendTxOptions: schemas.SendTxOptionsSchema,
    HttpRequest: schemas.HttpRequestSchema,

    // ZKP schemas
    ZKPState: schemas.ZKPStateSchema,
  }

  return schemasCache
}

function getSchemaForMethod(method: string): string | null {
  // Map RPC methods to their expected response schemas
  const methodSchemaMap: Record<string, string> = {
    getBlockNumber: 'number',
    getBatchNumber: 'number',
    getEpochNumber: 'number',
    getBlockByHash: 'Block',
    getBlockByNumber: 'Block',
    getLatestBlock: 'Block',
    getSlotAt: 'Slot',
    getTransactionByHash: 'Transaction',
    getTransactionsByBlockNumber: 'Transaction[]',
    getTransactionsByBatchNumber: 'Transaction[]',
    getTransactionsByAddress: 'Transaction[]',
    getTransactionHashesByAddress: 'string[]',
    getInherentsByBlockNumber: 'Inherent[]',
    getInherentsByBatchNumber: 'Inherent[]',
    getAccountByAddress: 'Account',
    getAccounts: 'Account[]',
    getActiveValidators: 'Validator[]',
    getCurrentPenalizedSlots: 'PenalizedSlots[]',
    getPreviousPenalizedSlots: 'PenalizedSlots[]',
    getValidatorByAddress: 'Validator',
    getValidators: 'Validator[]',
    getStakersByValidatorAddress: 'Staker[]',
    getStakerByAddress: 'Staker',
    getPolicyConstants: 'PolicyConstants',
    mempool: 'MempoolInfo',
    getZkpState: 'ZKPState',
    sign: 'Signature',
    createAccount: 'Account',
  }

  return methodSchemaMap[method] || null
}

function createArraySchema(baseSchemaName: string, schemas: Record<string, v.BaseSchema<any, any, any>>): v.BaseSchema<any, any, any> | null {
  const baseSchema = schemas[baseSchemaName]
  if (!baseSchema)
    return null
  return v.array(baseSchema)
}

export async function validateResponse(
  data: any,
  method: string,
  options: ValidationOptions,
): Promise<ValidationResult> {
  if (!options.validateBody) {
    return { isValid: true, data }
  }

  try {
    const schemas = await loadSchemas()
    const schemaName = getSchemaForMethod(method)

    if (!schemaName) {
      // No schema defined for this method, skip validation
      return { isValid: true, data }
    }

    let schema: v.BaseSchema<any, any, any> | null = null

    // Handle array types
    if (schemaName.endsWith('[]')) {
      const baseSchemaName = schemaName.slice(0, -2)
      if (baseSchemaName === 'string') {
        schema = v.array(v.string())
      }
      else {
        schema = createArraySchema(baseSchemaName, schemas)
      }
    }
    else if (schemaName === 'number') {
      schema = v.number()
    }
    else if (schemaName === 'string') {
      schema = v.string()
    }
    else if (schemaName === 'boolean') {
      schema = v.boolean()
    }
    else {
      schema = schemas[schemaName]
    }

    if (!schema) {
      // Schema not found, skip validation
      return { isValid: true, data }
    }

    const result = v.safeParse(schema, data)

    if (result.success) {
      return { isValid: true, data: result.output }
    }
    else {
      const errors = result.issues.map(issue => `${issue.path?.join('.') || 'root'}: ${issue.message}`)
      return { isValid: false, errors }
    }
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { isValid: false, errors: [`Validation error: ${errorMessage}`] }
  }
}

export function handleValidationResult(
  validationResult: ValidationResult,
  options: ValidationOptions,
  method: string,
): any {
  if (validationResult.isValid) {
    return validationResult.data
  }

  const errorMessage = `Response validation failed for ${method}: ${validationResult.errors?.join(', ')}`

  if (options.validationLevel === 'error') {
    throw new Error(errorMessage)
  }
  else {
    console.warn(errorMessage)
    return validationResult.data // Return original data on warning
  }
}
