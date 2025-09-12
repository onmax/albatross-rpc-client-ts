import type * as v from 'valibot'
import type {
  AccountSchema,
  AccountTypeSchema,
  AuthSchema,
  // Account schemas
  BasicAccountSchema,
  BlockchainStateSchema,
  // Block schemas
  BlockSchema,
  BlockSubscriptionTypeSchema,
  BlockTypeSchema,
  ElectionMacroBlockSchema,

  HashAlgorithmSchema,
  HtlcAccountSchema,
  InherentJailSchema,
  InherentPenalizeSchema,
  InherentRewardSchema,
  // Other common schemas
  InherentSchema,

  InherentTypeSchema,
  MacroBlockSchema,
  MempoolInfoSchema,
  MicroBlockSchema,
  NetworkIdSchema,
  PartialBlockSchema,
  PartialMacroBlockSchema,

  PartialMicroBlockSchema,

  PenalizedSlotsSchema,
  PolicyConstantsSchema,
  RetrieveTypeSchema,
  SignatureSchema,
  SlotSchema,
  StakerSchema,
  StakingAccountSchema,
  // Transaction schemas
  TransactionSchema,
  ValidatorSchema,
  // Basic schemas
  ValidityStartHeightSchema,
  VestingAccountSchema,
  WalletAccountSchema,
  ZKPStateSchema,

} from '../schemas'

// Infer types from schemas
export type ValidityStartHeight = v.InferOutput<typeof ValidityStartHeightSchema>
export type HashAlgorithm = v.InferOutput<typeof HashAlgorithmSchema>
export type AccountType = v.InferOutput<typeof AccountTypeSchema>
export type InherentType = v.InferOutput<typeof InherentTypeSchema>
export type PolicyConstants = v.InferOutput<typeof PolicyConstantsSchema>
export type BlockType = v.InferOutput<typeof BlockTypeSchema>
export type BlockSubscriptionType = v.InferOutput<typeof BlockSubscriptionTypeSchema>
export type RetrieveType = v.InferOutput<typeof RetrieveTypeSchema>
export type NetworkId = v.InferOutput<typeof NetworkIdSchema>

// Account types
export type BasicAccount = v.InferOutput<typeof BasicAccountSchema>
export type VestingAccount = v.InferOutput<typeof VestingAccountSchema>
export type HtlcAccount = v.InferOutput<typeof HtlcAccountSchema>
export type StakingAccount = v.InferOutput<typeof StakingAccountSchema>
export type Account = v.InferOutput<typeof AccountSchema>
export type WalletAccount = v.InferOutput<typeof WalletAccountSchema>

// Block types
export type Block = v.InferOutput<typeof BlockSchema>
export type PartialBlock = v.InferOutput<typeof PartialBlockSchema>
export type MacroBlock = v.InferOutput<typeof MacroBlockSchema>
export type PartialMacroBlock = v.InferOutput<typeof PartialMacroBlockSchema>
export type MicroBlock = v.InferOutput<typeof MicroBlockSchema>
export type PartialMicroBlock = v.InferOutput<typeof PartialMicroBlockSchema>
export type ElectionMacroBlock = v.InferOutput<typeof ElectionMacroBlockSchema>

// Transaction types
export type Transaction = v.InferOutput<typeof TransactionSchema>

// Other types
export type Inherent = v.InferOutput<typeof InherentSchema>
export type InherentReward = v.InferOutput<typeof InherentRewardSchema>
export type InherentPenalize = v.InferOutput<typeof InherentPenalizeSchema>
export type InherentJail = v.InferOutput<typeof InherentJailSchema>
export type Slot = v.InferOutput<typeof SlotSchema>
export type PenalizedSlots = v.InferOutput<typeof PenalizedSlotsSchema>
export type MempoolInfo = v.InferOutput<typeof MempoolInfoSchema>
export type Validator = v.InferOutput<typeof ValidatorSchema>
export type Staker = v.InferOutput<typeof StakerSchema>
export type ZKPState = v.InferOutput<typeof ZKPStateSchema>
export type BlockchainState = v.InferOutput<typeof BlockchainStateSchema>
export type Signature = v.InferOutput<typeof SignatureSchema>
export type Auth = v.InferOutput<typeof AuthSchema>

// Export enums for runtime values alongside inferred types
export { HashAlgorithm as HashAlgorithmEnum } from '../types/common'
export { AccountType as AccountTypeEnum } from '../types/common'
export { InherentType as InherentTypeEnum } from '../types/common'
export { BlockType as BlockTypeEnum } from '../types/common'
export { RetrieveType as RetrieveTypeEnum } from '../types/common'
export { BlockSubscriptionType as BlockSubscriptionTypeEnum } from '../types/common'
export { LogType as LogTypeEnum } from '../types/logs'
