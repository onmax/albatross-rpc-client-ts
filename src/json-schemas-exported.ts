import { toJsonSchema } from '@valibot/to-json-schema'
import {
  AccountSchema,
  AccountTypeSchema,
  AppliedBlockLogSchema,
  AuthSchema,
  BasicAccountSchema,
  BlockchainStateSchema,
  BlockLogSchema,
  BlockSchema,
  BlockSubscriptionTypeSchema,
  BlockTypeSchema,
  ElectionMacroBlockSchema,
  HashAlgorithmSchema,
  HtlcAccountSchema,
  InherentJailSchema,
  InherentPenalizeSchema,
  InherentRewardSchema,
  InherentSchema,
  InherentTypeSchema,
  LogSchema,
  MacroBlockSchema,
  MempoolInfoSchema,
  MicroBlockSchema,
  NetworkIdSchema,
  PartialBlockSchema,
  PartialMacroBlockSchema,
  PartialMicroBlockSchema,
  PolicyConstantsSchema,
  RetrieveTypeSchema,
  RevertedBlockLogSchema,
  SignatureSchema,
  StakerSchema,
  StakingAccountSchema,
  TransactionLogSchema,
  TransactionSchema,
  ValidatorSchema,
  ValidityStartHeightSchema,
  VestingAccountSchema,
  WalletAccountSchema,
} from './schemas'

function toJsonSchemaFromValibot(valibotSchema: any): any | null {
  if (valibotSchema === null || valibotSchema === undefined) {
    return null
  }
  try {
    return toJsonSchema(valibotSchema)
  }
  catch {
    return null
  }
}

// Account JSON Schemas
export const BasicAccountJSONSchema = toJsonSchemaFromValibot(BasicAccountSchema)
export const VestingAccountJSONSchema = toJsonSchemaFromValibot(VestingAccountSchema)
export const HtlcAccountJSONSchema = toJsonSchemaFromValibot(HtlcAccountSchema)
export const StakingAccountJSONSchema = toJsonSchemaFromValibot(StakingAccountSchema)
export const AccountJSONSchema = toJsonSchemaFromValibot(AccountSchema)
export const WalletAccountJSONSchema = toJsonSchemaFromValibot(WalletAccountSchema)

// Block JSON Schemas
export const BlockJSONSchema = toJsonSchemaFromValibot(BlockSchema)
export const MicroBlockJSONSchema = toJsonSchemaFromValibot(MicroBlockSchema)
export const MacroBlockJSONSchema = toJsonSchemaFromValibot(MacroBlockSchema)
export const ElectionMacroBlockJSONSchema = toJsonSchemaFromValibot(ElectionMacroBlockSchema)
export const PartialBlockJSONSchema = toJsonSchemaFromValibot(PartialBlockSchema)
export const PartialMicroBlockJSONSchema = toJsonSchemaFromValibot(PartialMicroBlockSchema)
export const PartialMacroBlockJSONSchema = toJsonSchemaFromValibot(PartialMacroBlockSchema)

// Transaction JSON Schemas
export const TransactionJSONSchema = toJsonSchemaFromValibot(TransactionSchema)

// Validator/Staker JSON Schemas
export const ValidatorJSONSchema = toJsonSchemaFromValibot(ValidatorSchema)
export const StakerJSONSchema = toJsonSchemaFromValibot(StakerSchema)

// Inherent JSON Schemas
export const InherentJSONSchema = toJsonSchemaFromValibot(InherentSchema)
export const InherentRewardJSONSchema = toJsonSchemaFromValibot(InherentRewardSchema)
export const InherentPenalizeJSONSchema = toJsonSchemaFromValibot(InherentPenalizeSchema)
export const InherentJailJSONSchema = toJsonSchemaFromValibot(InherentJailSchema)

// System JSON Schemas
export const PolicyConstantsJSONSchema = toJsonSchemaFromValibot(PolicyConstantsSchema)
export const MempoolInfoJSONSchema = toJsonSchemaFromValibot(MempoolInfoSchema)
export const SignatureJSONSchema = toJsonSchemaFromValibot(SignatureSchema)
export const BlockchainStateJSONSchema = toJsonSchemaFromValibot(BlockchainStateSchema)
export const AuthJSONSchema = toJsonSchemaFromValibot(AuthSchema)

// Log JSON Schemas
export const LogJSONSchema = toJsonSchemaFromValibot(LogSchema)
export const TransactionLogJSONSchema = toJsonSchemaFromValibot(TransactionLogSchema)
export const BlockLogJSONSchema = toJsonSchemaFromValibot(BlockLogSchema)
export const AppliedBlockLogJSONSchema = toJsonSchemaFromValibot(AppliedBlockLogSchema)
export const RevertedBlockLogJSONSchema = toJsonSchemaFromValibot(RevertedBlockLogSchema)

// Enum/Type JSON Schemas
export const AccountTypeJSONSchema = toJsonSchemaFromValibot(AccountTypeSchema)
export const BlockTypeJSONSchema = toJsonSchemaFromValibot(BlockTypeSchema)
export const InherentTypeJSONSchema = toJsonSchemaFromValibot(InherentTypeSchema)
export const NetworkIdJSONSchema = toJsonSchemaFromValibot(NetworkIdSchema)
export const BlockSubscriptionTypeJSONSchema = toJsonSchemaFromValibot(BlockSubscriptionTypeSchema)
export const RetrieveTypeJSONSchema = toJsonSchemaFromValibot(RetrieveTypeSchema)
export const HashAlgorithmJSONSchema = toJsonSchemaFromValibot(HashAlgorithmSchema)
export const ValidityStartHeightJSONSchema = toJsonSchemaFromValibot(ValidityStartHeightSchema)
