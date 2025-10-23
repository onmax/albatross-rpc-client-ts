import * as v from 'valibot'

// Common schemas
export const ValidityStartHeightSchema: v.UnionSchema<[
  v.ObjectSchema<{ relativeValidityStartHeight: v.NumberSchema<undefined> }, undefined>,
  v.ObjectSchema<{ absoluteValidityStartHeight: v.NumberSchema<undefined> }, undefined>,
], undefined> = v.union([
  v.object({
    relativeValidityStartHeight: v.number(),
  }),
  v.object({
    absoluteValidityStartHeight: v.number(),
  }),
])

export const HashAlgorithmSchema: v.PicklistSchema<[1, 3, 4], undefined> = v.picklist([1, 3, 4])

export const AccountTypeSchema: v.PicklistSchema<['basic', 'vesting', 'htlc', 'staking'], undefined> = v.picklist(['basic', 'vesting', 'htlc', 'staking'])

export const InherentTypeSchema: v.PicklistSchema<['reward', 'jail', 'penalize'], undefined> = v.picklist(['reward', 'jail', 'penalize'])

export const PolicyConstantsSchema: v.ObjectSchema<{
  stakingContractAddress: v.StringSchema<undefined>
  coinbaseAddress: v.StringSchema<undefined>
  transactionValidityWindow: v.NumberSchema<undefined>
  maxSizeMicroBody: v.NumberSchema<undefined>
  version: v.NumberSchema<undefined>
  slots: v.NumberSchema<undefined>
  blocksPerBatch: v.NumberSchema<undefined>
  batchesPerEpoch: v.NumberSchema<undefined>
  blocksPerEpoch: v.NumberSchema<undefined>
  validatorDeposit: v.NumberSchema<undefined>
  minimumStake: v.NumberSchema<undefined>
  totalSupply: v.NumberSchema<undefined>
  jailEpochs: v.NumberSchema<undefined>
  genesisBlockNumber: v.NumberSchema<undefined>
  blockSeparationTime: v.NumberSchema<undefined>
}, undefined> = v.object({
  stakingContractAddress: v.string(),
  coinbaseAddress: v.string(),
  transactionValidityWindow: v.number(),
  maxSizeMicroBody: v.number(),
  version: v.number(),
  slots: v.number(),
  blocksPerBatch: v.number(),
  batchesPerEpoch: v.number(),
  blocksPerEpoch: v.number(),
  validatorDeposit: v.number(),
  minimumStake: v.number(),
  totalSupply: v.number(),
  jailEpochs: v.number(),
  genesisBlockNumber: v.number(),
  blockSeparationTime: v.number(),
})

// Account schemas
export const BasicAccountSchema: v.ObjectSchema<{
  type: v.LiteralSchema<'basic', undefined>
  address: v.StringSchema<undefined>
  balance: v.NumberSchema<undefined>
}, undefined> = v.object({
  type: v.literal('basic'),
  address: v.string(),
  balance: v.number(),
})

export const VestingAccountSchema: v.ObjectSchema<{
  type: v.LiteralSchema<'vesting', undefined>
  address: v.StringSchema<undefined>
  balance: v.NumberSchema<undefined>
  owner: v.StringSchema<undefined>
  vestingStart: v.NumberSchema<undefined>
  vestingStepBlocks: v.NumberSchema<undefined>
  vestingStepAmount: v.NumberSchema<undefined>
  vestingTotalAmount: v.NumberSchema<undefined>
}, undefined> = v.object({
  type: v.literal('vesting'),
  address: v.string(),
  balance: v.number(),
  owner: v.string(),
  vestingStart: v.number(),
  vestingStepBlocks: v.number(),
  vestingStepAmount: v.number(),
  vestingTotalAmount: v.number(),
})

export const HtlcAccountSchema: v.ObjectSchema<{
  type: v.LiteralSchema<'htlc', undefined>
  address: v.StringSchema<undefined>
  balance: v.NumberSchema<undefined>
  sender: v.StringSchema<undefined>
  recipient: v.StringSchema<undefined>
  hashRoot: v.StringSchema<undefined>
  hashCount: v.NumberSchema<undefined>
  timeout: v.NumberSchema<undefined>
  totalAmount: v.NumberSchema<undefined>
}, undefined> = v.object({
  type: v.literal('htlc'),
  address: v.string(),
  balance: v.number(),
  sender: v.string(),
  recipient: v.string(),
  hashRoot: v.string(),
  hashCount: v.number(),
  timeout: v.number(),
  totalAmount: v.number(),
})

export const StakingAccountSchema: v.ObjectSchema<{
  type: v.LiteralSchema<'staking', undefined>
  address: v.StringSchema<undefined>
  balance: v.NumberSchema<undefined>
}, undefined> = v.object({
  type: v.literal('staking'),
  address: v.string(),
  balance: v.number(),
})

export const AccountSchema: v.VariantSchema<'type', [
  typeof BasicAccountSchema,
  typeof VestingAccountSchema,
  typeof HtlcAccountSchema,
  typeof StakingAccountSchema,
], undefined> = v.variant('type', [
  BasicAccountSchema,
  VestingAccountSchema,
  HtlcAccountSchema,
  StakingAccountSchema,
])

export const TransactionSchema: v.ObjectSchema<{
  hash: v.StringSchema<undefined>
  blockNumber: v.OptionalSchema<v.NumberSchema<undefined>, undefined>
  timestamp: v.OptionalSchema<v.BigintSchema<undefined>, undefined>
  confirmations: v.OptionalSchema<v.NumberSchema<undefined>, undefined>
  size: v.NumberSchema<undefined>
  relatedAddresses: v.SetSchema<v.StringSchema<undefined>, undefined>
  from: v.StringSchema<undefined>
  fromType: v.NumberSchema<undefined>
  to: v.StringSchema<undefined>
  toType: v.NumberSchema<undefined>
  value: v.NumberSchema<undefined>
  fee: v.NumberSchema<undefined>
  senderData: v.StringSchema<undefined>
  recipientData: v.StringSchema<undefined>
  flags: v.NumberSchema<undefined>
  validityStartHeight: v.NumberSchema<undefined>
  proof: v.StringSchema<undefined>
  networkId: v.NumberSchema<undefined>
}, undefined> = v.object({
  hash: v.string(),
  blockNumber: v.optional(v.number()),
  timestamp: v.optional(v.bigint()),
  confirmations: v.optional(v.number()),
  size: v.number(),
  relatedAddresses: v.set(v.string()),
  from: v.string(),
  fromType: v.number(),
  to: v.string(),
  toType: v.number(),
  value: v.number(),
  fee: v.number(),
  senderData: v.string(),
  recipientData: v.string(),
  flags: v.number(),
  validityStartHeight: v.number(),
  proof: v.string(),
  networkId: v.number(),
})

export const StakerSchema: v.ObjectSchema<{
  address: v.StringSchema<undefined>
  balance: v.NumberSchema<undefined>
  delegation: v.OptionalSchema<v.StringSchema<undefined>, undefined>
  inactiveBalance: v.NumberSchema<undefined>
  inactiveFrom: v.NullableSchema<v.NumberSchema<undefined>, undefined>
  retiredBalance: v.NumberSchema<undefined>
}, undefined> = v.object({
  address: v.string(),
  balance: v.number(),
  delegation: v.optional(v.string()),
  inactiveBalance: v.number(),
  inactiveFrom: v.nullable(v.number()),
  retiredBalance: v.number(),
})

export const ValidatorSchema: v.ObjectSchema<{
  address: v.StringSchema<undefined>
  signingKey: v.StringSchema<undefined>
  votingKey: v.StringSchema<undefined>
  rewardAddress: v.StringSchema<undefined>
  signalData: v.OptionalSchema<v.StringSchema<undefined>, undefined>
  balance: v.NumberSchema<undefined>
  numStakers: v.NumberSchema<undefined>
  retired: v.BooleanSchema<undefined>
  inactivityFlag: v.OptionalSchema<v.NumberSchema<undefined>, undefined>
  jailedFrom: v.OptionalSchema<v.NumberSchema<undefined>, undefined>
}, undefined> = v.object({
  address: v.string(),
  signingKey: v.string(),
  votingKey: v.string(),
  rewardAddress: v.string(),
  signalData: v.optional(v.string()),
  balance: v.number(),
  numStakers: v.number(),
  retired: v.boolean(),
  inactivityFlag: v.optional(v.number()),
  jailedFrom: v.optional(v.number()),
})

export const SlotSchema: v.ObjectSchema<{
  slotNumber: v.NumberSchema<undefined>
  validator: v.StringSchema<undefined>
  publicKey: v.StringSchema<undefined>
}, undefined> = v.object({
  slotNumber: v.number(),
  validator: v.string(),
  publicKey: v.string(),
})

export const SlotsSchema: v.ObjectSchema<{
  firstSlotNumber: v.NumberSchema<undefined>
  numSlots: v.NumberSchema<undefined>
  validator: v.StringSchema<undefined>
  publicKey: v.StringSchema<undefined>
}, undefined> = v.object({
  firstSlotNumber: v.number(),
  numSlots: v.number(),
  validator: v.string(),
  publicKey: v.string(),
})

export const PenalizedSlotsSchema: v.ObjectSchema<{
  blockNumber: v.NumberSchema<undefined>
  disabled: v.ArraySchema<v.NumberSchema<undefined>, undefined>
}, undefined> = v.object({
  blockNumber: v.number(),
  disabled: v.array(v.number()),
})

// Inherent schemas
export const InherentRewardSchema: v.ObjectSchema<{
  type: v.LiteralSchema<'reward', undefined>
  blockNumber: v.NumberSchema<undefined>
  blockTime: v.NumberSchema<undefined>
  validatorAddress: v.StringSchema<undefined>
  target: v.StringSchema<undefined>
  value: v.NumberSchema<undefined>
  hash: v.StringSchema<undefined>
}, undefined> = v.object({
  type: v.literal('reward'),
  blockNumber: v.number(),
  blockTime: v.number(),
  validatorAddress: v.string(),
  target: v.string(),
  value: v.number(),
  hash: v.string(),
})

export const InherentPenalizeSchema: v.ObjectSchema<{
  type: v.LiteralSchema<'penalize', undefined>
  blockNumber: v.NumberSchema<undefined>
  blockTime: v.NumberSchema<undefined>
  validatorAddress: v.StringSchema<undefined>
  offenseEventBlock: v.NumberSchema<undefined>
}, undefined> = v.object({
  type: v.literal('penalize'),
  blockNumber: v.number(),
  blockTime: v.number(),
  validatorAddress: v.string(),
  offenseEventBlock: v.number(),
})

export const InherentJailSchema: v.ObjectSchema<{
  type: v.LiteralSchema<'jail', undefined>
  blockNumber: v.NumberSchema<undefined>
  blockTime: v.NumberSchema<undefined>
  validatorAddress: v.StringSchema<undefined>
  offenseEventBlock: v.NumberSchema<undefined>
}, undefined> = v.object({
  type: v.literal('jail'),
  blockNumber: v.number(),
  blockTime: v.number(),
  validatorAddress: v.string(),
  offenseEventBlock: v.number(),
})

export const InherentSchema: v.VariantSchema<'type', [
  typeof InherentRewardSchema,
  typeof InherentPenalizeSchema,
  typeof InherentJailSchema,
], undefined> = v.variant('type', [
  InherentRewardSchema,
  InherentPenalizeSchema,
  InherentJailSchema,
])

export const MempoolInfoSchema: v.ObjectSchema<{
  _0: v.OptionalSchema<v.NumberSchema<undefined>, undefined>
  _1: v.OptionalSchema<v.NumberSchema<undefined>, undefined>
  _2: v.OptionalSchema<v.NumberSchema<undefined>, undefined>
  _5: v.OptionalSchema<v.NumberSchema<undefined>, undefined>
  _10: v.OptionalSchema<v.NumberSchema<undefined>, undefined>
  _20: v.OptionalSchema<v.NumberSchema<undefined>, undefined>
  _50: v.OptionalSchema<v.NumberSchema<undefined>, undefined>
  _100: v.OptionalSchema<v.NumberSchema<undefined>, undefined>
  _200: v.OptionalSchema<v.NumberSchema<undefined>, undefined>
  _500: v.OptionalSchema<v.NumberSchema<undefined>, undefined>
  _1000: v.OptionalSchema<v.NumberSchema<undefined>, undefined>
  _2000: v.OptionalSchema<v.NumberSchema<undefined>, undefined>
  _5000: v.OptionalSchema<v.NumberSchema<undefined>, undefined>
  _10000: v.OptionalSchema<v.NumberSchema<undefined>, undefined>
  total: v.NumberSchema<undefined>
  buckets: v.ArraySchema<v.NumberSchema<undefined>, undefined>
}, undefined> = v.object({
  _0: v.optional(v.number()),
  _1: v.optional(v.number()),
  _2: v.optional(v.number()),
  _5: v.optional(v.number()),
  _10: v.optional(v.number()),
  _20: v.optional(v.number()),
  _50: v.optional(v.number()),
  _100: v.optional(v.number()),
  _200: v.optional(v.number()),
  _500: v.optional(v.number()),
  _1000: v.optional(v.number()),
  _2000: v.optional(v.number()),
  _5000: v.optional(v.number()),
  _10000: v.optional(v.number()),
  total: v.number(),
  buckets: v.array(v.number()),
})

export const WalletAccountSchema: v.ObjectSchema<{
  address: v.StringSchema<undefined>
  publicKey: v.StringSchema<undefined>
  privateKey: v.StringSchema<undefined>
}, undefined> = v.object({
  address: v.string(),
  publicKey: v.string(),
  privateKey: v.string(),
})

export const SignatureSchema: v.ObjectSchema<{
  signature: v.StringSchema<undefined>
  publicKey: v.StringSchema<undefined>
}, undefined> = v.object({
  signature: v.string(),
  publicKey: v.string(),
})

export const BlockchainStateSchema: v.ObjectSchema<{
  blockNumber: v.NumberSchema<undefined>
  blockHash: v.StringSchema<undefined>
}, undefined> = v.object({
  blockNumber: v.number(),
  blockHash: v.string(),
})

export const AuthSchema: v.ObjectSchema<{
  username: v.StringSchema<undefined>
  password: v.StringSchema<undefined>
}, undefined> = v.object({
  username: v.string(),
  password: v.string(),
})

export const BlockTypeSchema: v.PicklistSchema<['micro', 'macro'], undefined> = v.picklist(['micro', 'macro'])

export const BlockSubscriptionTypeSchema: v.PicklistSchema<['macro', 'micro', 'election'], undefined> = v.picklist(['macro', 'micro', 'election'])

export const RetrieveTypeSchema: v.PicklistSchema<['full', 'partial', 'hash'], undefined> = v.picklist(['full', 'partial', 'hash'])

export const NetworkIdSchema: v.PicklistSchema<[1, 2, 3, 4, 5, 6, 7, 24, 42], undefined> = v.picklist([1, 2, 3, 4, 5, 6, 7, 24, 42])

// Equivocation proof schemas
export const ForkProofSchema: v.ObjectSchema<{
  blockNumber: v.NumberSchema<undefined>
  hashes: v.TupleSchema<[v.StringSchema<undefined>, v.StringSchema<undefined>], undefined>
}, undefined> = v.object({
  blockNumber: v.number(),
  hashes: v.tuple([v.string(), v.string()]),
})

export const DoubleProposalProofSchema: v.ObjectSchema<{
  blockNumber: v.NumberSchema<undefined>
  hashes: v.TupleSchema<[v.StringSchema<undefined>, v.StringSchema<undefined>], undefined>
}, undefined> = v.object({
  blockNumber: v.number(),
  hashes: v.tuple([v.string(), v.string()]),
})

export const DoubleVoteProofSchema: v.ObjectSchema<{
  blockNumber: v.NumberSchema<undefined>
}, undefined> = v.object({
  blockNumber: v.number(),
})

export const EquivocationProofSchema: v.VariantSchema<'type', [
  v.ObjectSchema<{
    type: v.LiteralSchema<'Fork', undefined>
    proof: typeof ForkProofSchema
  }, undefined>,
  v.ObjectSchema<{
    type: v.LiteralSchema<'DoubleProposal', undefined>
    proof: typeof DoubleProposalProofSchema
  }, undefined>,
  v.ObjectSchema<{
    type: v.LiteralSchema<'DoubleVote', undefined>
    proof: typeof DoubleVoteProofSchema
  }, undefined>,
], undefined> = v.variant('type', [
  v.object({
    type: v.literal('Fork'),
    proof: ForkProofSchema,
  }),
  v.object({
    type: v.literal('DoubleProposal'),
    proof: DoubleProposalProofSchema,
  }),
  v.object({
    type: v.literal('DoubleVote'),
    proof: DoubleVoteProofSchema,
  }),
])

// Block schemas
export const PartialBlockSchema: v.ObjectSchema<{
  hash: v.StringSchema<undefined>
  size: v.NumberSchema<undefined>
  batch: v.NumberSchema<undefined>
  version: v.NumberSchema<undefined>
  number: v.NumberSchema<undefined>
  timestamp: v.NumberSchema<undefined>
  parentHash: v.StringSchema<undefined>
  seed: v.StringSchema<undefined>
  extraData: v.StringSchema<undefined>
  stateHash: v.StringSchema<undefined>
  bodyHash: v.OptionalSchema<v.StringSchema<undefined>, undefined>
  historyHash: v.StringSchema<undefined>
  network: typeof NetworkIdSchema
  transactions: v.OptionalSchema<v.ArraySchema<typeof TransactionSchema, undefined>, undefined>
}, undefined> = v.object({
  hash: v.string(),
  size: v.number(),
  batch: v.number(),
  version: v.number(),
  number: v.number(),
  timestamp: v.number(),
  parentHash: v.string(),
  seed: v.string(),
  extraData: v.string(),
  stateHash: v.string(),
  bodyHash: v.optional(v.string()),
  historyHash: v.string(),
  network: NetworkIdSchema,
  transactions: v.optional(v.array(TransactionSchema)),
})

export const PartialMicroBlockSchema: v.IntersectSchema<[
  typeof PartialBlockSchema,
  v.ObjectSchema<any, undefined>,
], undefined> = v.intersect([
  PartialBlockSchema,
  v.object({
    type: v.literal('micro'),
    producer: v.object({
      slotNumber: v.number(),
      validator: v.string(),
      publicKey: v.string(),
    }),
    justification: v.union([
      v.object({
        micro: v.string(),
      }),
      v.object({
        skip: v.object({
          sig: v.object({
            signature: v.object({ signature: v.string() }),
            signers: v.array(v.number()),
          }),
        }),
      }),
    ]),
    equivocationProofs: v.optional(v.array(EquivocationProofSchema)),
    epoch: v.number(),
    parentElectionHash: v.undefined(),
  }),
])

export const MicroBlockSchema: v.IntersectSchema<[
  typeof PartialMicroBlockSchema,
  v.ObjectSchema<any, undefined>,
], undefined> = v.intersect([
  PartialMicroBlockSchema,
  v.object({
    transactions: v.array(TransactionSchema),
    isElectionBlock: v.undefined(),
    lostRewardSet: v.optional(v.array(v.number())),
    disabledSet: v.optional(v.array(v.number())),
    interlink: v.undefined(),
    slots: v.undefined(),
    nextBatchInitialPunishedSet: v.undefined(),
  }),
])

export const PartialMacroBlockSchema: v.IntersectSchema<[
  typeof PartialBlockSchema,
  v.ObjectSchema<any, undefined>,
], undefined> = v.intersect([
  PartialBlockSchema,
  v.object({
    type: v.literal('macro'),
    epoch: v.number(),
    parentElectionHash: v.string(),
    producer: v.undefined(),
    equivocationProofs: v.undefined(),
  }),
])

export const MacroBlockSchema: v.IntersectSchema<[
  typeof PartialMacroBlockSchema,
  v.ObjectSchema<any, undefined>,
], undefined> = v.intersect([
  PartialMacroBlockSchema,
  v.object({
    isElectionBlock: v.literal(false),
    transactions: v.array(TransactionSchema),
    lostRewardSet: v.array(v.number()),
    disabledSet: v.array(v.number()),
    justification: v.optional(v.object({
      round: v.number(),
      sig: v.object({
        signature: v.object({ signature: v.string() }),
        signers: v.array(v.number()),
      }),
    })),
    interlink: v.undefined(),
    slots: v.undefined(),
    nextBatchInitialPunishedSet: v.undefined(),
  }),
])

export const ElectionMacroBlockSchema: v.IntersectSchema<[
  typeof PartialMacroBlockSchema,
  v.ObjectSchema<any, undefined>,
], undefined> = v.intersect([
  PartialMacroBlockSchema,
  v.object({
    isElectionBlock: v.literal(true),
    transactions: v.array(TransactionSchema),
    interlink: v.array(v.string()),
    slots: v.array(SlotsSchema),
    nextBatchInitialPunishedSet: v.array(v.number()),
  }),
])

export const BlockSchema: v.UnionSchema<[
  typeof MicroBlockSchema,
  typeof MacroBlockSchema,
  typeof ElectionMacroBlockSchema,
], undefined> = v.union([
  MicroBlockSchema,
  MacroBlockSchema,
  ElectionMacroBlockSchema,
])

export const ZKPStateSchema: v.ObjectSchema<{
  latestBlock: typeof BlockSchema
  latestProof: v.OptionalSchema<v.StringSchema<undefined>, undefined>
}, undefined> = v.object({
  latestBlock: BlockSchema,
  latestProof: v.optional(v.string()),
})

// Log schemas
export const LogTypeSchema: v.PicklistSchema<[
  'pay-fee',
  'transfer',
  'htlc-create',
  'htlc-timeout-resolve',
  'htlc-regular-transfer',
  'htlc-early-resolve',
  'vesting-create',
  'create-validator',
  'update-validator',
  'validator-fee-deduction',
  'deactivate-validator',
  'reactivate-validator',
  'retire-validator',
  'delete-validator',
  'create-staker',
  'stake',
  'update-staker',
  'set-active-stake',
  'retire-stake',
  'remove-stake',
  'delete-staker',
  'staker-fee-deduction',
  'payout-reward',
  'penalize',
  'jail-validator',
  'revert-contract',
  'failed-transaction',
], undefined> = v.picklist([
  'pay-fee',
  'transfer',
  'htlc-create',
  'htlc-timeout-resolve',
  'htlc-regular-transfer',
  'htlc-early-resolve',
  'vesting-create',
  'create-validator',
  'update-validator',
  'validator-fee-deduction',
  'deactivate-validator',
  'reactivate-validator',
  'retire-validator',
  'delete-validator',
  'create-staker',
  'stake',
  'update-staker',
  'set-active-stake',
  'retire-stake',
  'remove-stake',
  'delete-staker',
  'staker-fee-deduction',
  'payout-reward',
  'penalize',
  'jail-validator',
  'revert-contract',
  'failed-transaction',
])

export const PayFeeLogSchema = v.object({
  type: v.literal('pay-fee'),
  from: v.string(),
  fee: v.number(),
})

export const TransferLogSchema = v.object({
  type: v.literal('transfer'),
  from: v.string(),
  to: v.string(),
  amount: v.number(),
  data: v.optional(v.instance(Uint8Array)),
})

export const HtlcCreateLogSchema = v.object({
  type: v.literal('htlc-create'),
  contractAddress: v.string(),
  sender: v.string(),
  recipient: v.string(),
  hashRoot: v.string(),
  hashCount: v.number(),
  timeout: v.bigint(),
  totalAmount: v.number(),
})

export const HtlcTimeoutResolveLogSchema = v.object({
  type: v.literal('htlc-timeout-resolve'),
  contractAddress: v.string(),
})

export const HtlcRegularTransferLogSchema = v.object({
  type: v.literal('htlc-regular-transfer'),
  contractAddress: v.string(),
  preImage: v.string(),
  hashDepth: v.number(),
})

export const HtlcEarlyResolveLogSchema = v.object({
  type: v.literal('htlc-early-resolve'),
  contractAddress: v.string(),
})

export const VestingCreateLogSchema = v.object({
  type: v.literal('vesting-create'),
  contractAddress: v.string(),
  owner: v.string(),
  vestingStartTime: v.bigint(),
  vestingTimeStep: v.bigint(),
  vestingStepAmount: v.number(),
  vestingTotalAmount: v.number(),
})

export const CreateValidatorLogSchema = v.object({
  type: v.literal('create-validator'),
  validatorAddress: v.string(),
  rewardAddress: v.string(),
})

export const UpdateValidatorLogSchema = v.object({
  type: v.literal('update-validator'),
  validatorAddress: v.string(),
  oldRewardAddress: v.string(),
  newRewardAddress: v.nullable(v.string()),
})

export const ValidatorFeeDeductionLogSchema = v.object({
  type: v.literal('validator-fee-deduction'),
  validatorAddress: v.string(),
  fee: v.number(),
})

export const DeactivateValidatorLogSchema = v.object({
  type: v.literal('deactivate-validator'),
  validatorAddress: v.string(),
  inactiveFrom: v.number(),
})

export const ReactivateValidatorLogSchema = v.object({
  type: v.literal('reactivate-validator'),
  validatorAddress: v.string(),
})

export const RetireValidatorLogSchema = v.object({
  type: v.literal('retire-validator'),
  validatorAddress: v.string(),
})

export const DeleteValidatorLogSchema = v.object({
  type: v.literal('delete-validator'),
  validatorAddress: v.string(),
  rewardAddress: v.string(),
})

export const CreateStakerLogSchema = v.object({
  type: v.literal('create-staker'),
  stakerAddress: v.string(),
  validatorAddress: v.nullable(v.string()),
  value: v.number(),
})

export const StakeLogSchema = v.object({
  type: v.literal('stake'),
  stakerAddress: v.string(),
  validatorAddress: v.nullable(v.string()),
  value: v.number(),
})

export const UpdateStakerLogSchema = v.object({
  type: v.literal('update-staker'),
  stakerAddress: v.string(),
  oldValidatorAddress: v.nullable(v.string()),
  newValidatorAddress: v.nullable(v.string()),
  activeBalance: v.number(),
  inactiveFrom: v.nullable(v.number()),
})

export const SetActiveStakeLogSchema = v.object({
  type: v.literal('set-active-stake'),
  stakerAddress: v.string(),
  validatorAddress: v.nullable(v.string()),
  activeBalance: v.number(),
  inactiveBalance: v.number(),
  inactiveFrom: v.nullable(v.number()),
})

export const RetireStakeLogSchema = v.object({
  type: v.literal('retire-stake'),
  stakerAddress: v.string(),
  validatorAddress: v.nullable(v.string()),
  inactiveBalance: v.number(),
  inactiveFrom: v.nullable(v.number()),
  retiredBalance: v.number(),
})

export const RemoveStakeLogSchema = v.object({
  type: v.literal('remove-stake'),
  stakerAddress: v.string(),
  validatorAddress: v.nullable(v.string()),
  value: v.number(),
})

export const DeleteStakerLogSchema = v.object({
  type: v.literal('delete-staker'),
  stakerAddress: v.string(),
  validatorAddress: v.nullable(v.string()),
})

export const StakerFeeDeductionLogSchema = v.object({
  type: v.literal('staker-fee-deduction'),
  stakerAddress: v.string(),
  fee: v.number(),
})

export const PayoutRewardLogSchema = v.object({
  type: v.literal('payout-reward'),
  to: v.string(),
  value: v.number(),
})

export const PenalizeLogSchema = v.object({
  type: v.literal('penalize'),
  validatorAddress: v.string(),
  offenseEventBlock: v.number(),
  slot: v.number(),
  newlyDeactivated: v.boolean(),
})

export const JailValidatorLogSchema = v.object({
  type: v.literal('jail-validator'),
  validatorAddress: v.string(),
  jailedFrom: v.number(),
})

export const RevertContractLogSchema = v.object({
  type: v.literal('revert-contract'),
  contractAddress: v.string(),
})

export const FailedTransactionLogSchema = v.object({
  type: v.literal('failed-transaction'),
  from: v.string(),
  to: v.string(),
  failureReason: v.string(),
})

export const LogSchema: v.VariantSchema<'type', any[], undefined> = v.variant('type', [
  PayFeeLogSchema,
  TransferLogSchema,
  HtlcCreateLogSchema,
  HtlcTimeoutResolveLogSchema,
  HtlcRegularTransferLogSchema,
  HtlcEarlyResolveLogSchema,
  VestingCreateLogSchema,
  CreateValidatorLogSchema,
  UpdateValidatorLogSchema,
  ValidatorFeeDeductionLogSchema,
  DeactivateValidatorLogSchema,
  ReactivateValidatorLogSchema,
  RetireValidatorLogSchema,
  DeleteValidatorLogSchema,
  CreateStakerLogSchema,
  StakeLogSchema,
  UpdateStakerLogSchema,
  SetActiveStakeLogSchema,
  RetireStakeLogSchema,
  RemoveStakeLogSchema,
  DeleteStakerLogSchema,
  StakerFeeDeductionLogSchema,
  PayoutRewardLogSchema,
  PenalizeLogSchema,
  JailValidatorLogSchema,
  RevertContractLogSchema,
  FailedTransactionLogSchema,
])

export const TransactionLogSchema: v.ObjectSchema<{
  hash: v.StringSchema<undefined>
  logs: v.ArraySchema<typeof LogSchema, undefined>
  failed: v.BooleanSchema<undefined>
}, undefined> = v.object({
  hash: v.string(),
  logs: v.array(LogSchema),
  failed: v.boolean(),
})

export const BlockLogSchema: v.ObjectSchema<{
  inherents: v.ArraySchema<typeof LogSchema, undefined>
  transactions: v.ArraySchema<typeof TransactionLogSchema, undefined>
}, undefined> = v.object({
  inherents: v.array(LogSchema),
  transactions: v.array(TransactionLogSchema),
})

export const AppliedBlockLogSchema: v.IntersectSchema<[
  typeof BlockLogSchema,
  v.ObjectSchema<any, undefined>,
], undefined> = v.intersect([
  BlockLogSchema,
  v.object({
    type: v.literal('applied-block'),
    timestamp: v.bigint(),
  }),
])

export const RevertedBlockLogSchema: v.IntersectSchema<[
  typeof BlockLogSchema,
  v.ObjectSchema<any, undefined>,
], undefined> = v.intersect([
  BlockLogSchema,
  v.object({
    type: v.literal('reverted-block'),
  }),
])

export const BlockLogTypeSchema: v.UnionSchema<[
  typeof AppliedBlockLogSchema,
  typeof RevertedBlockLogSchema,
], undefined> = v.union([
  AppliedBlockLogSchema,
  RevertedBlockLogSchema,
])

export function RPCDataSchema<T extends v.BaseSchema<any, any, any>, M extends v.BaseSchema<any, any, any>>(dataSchema: T, metadataSchema: M): v.ObjectSchema<{ data: T, metadata: M }, undefined> {
  return v.object({
    data: dataSchema,
    metadata: metadataSchema,
  })
}

export const BlockLogResponseSchema = RPCDataSchema(BlockLogTypeSchema, BlockchainStateSchema)

// HTTP-specific schemas
export const HttpOptionsSchema: v.ObjectSchema<any, undefined> = v.object({
  timeout: v.optional(v.union([v.number(), v.literal(false)])),
  url: v.optional(v.union([v.string(), v.instance(URL)])),
  auth: v.optional(AuthSchema),
  abortController: v.optional(v.instance(AbortController)),
  request: v.optional(v.object({
    method: v.literal('POST'),
    headers: v.any(),
    body: v.object({
      method: v.string(),
      params: v.array(v.any()),
      id: v.number(),
      jsonrpc: v.string(),
    }),
    timestamp: v.number(),
    url: v.string(),
    abortController: v.instance(AbortController),
  })),
})

export const SendTxOptionsSchema: v.IntersectSchema<[
  typeof HttpOptionsSchema,
  v.ObjectSchema<any, undefined>,
], undefined> = v.intersect([
  HttpOptionsSchema,
  v.object({
    waitForConfirmationTimeout: v.optional(v.number()),
  }),
])

export const HttpRequestSchema: v.ObjectSchema<any, undefined> = v.object({
  method: v.literal('POST'),
  headers: v.any(),
  body: v.object({
    method: v.string(),
    params: v.array(v.any()),
    id: v.number(),
    jsonrpc: v.string(),
  }),
  timestamp: v.number(),
  url: v.string(),
  abortController: v.instance(AbortController),
})

export function HttpRpcResultSuccessSchema<T extends v.BaseSchema<any, any, any>>(dataSchema: T): v.TupleSchema<any, undefined> {
  return v.tuple([
    v.literal(true),
    v.undefined(),
    dataSchema,
    v.object({
      request: HttpRequestSchema,
      metadata: v.optional(v.any()),
    }),
  ])
}

export const HttpRpcResultErrorSchema: v.TupleSchema<[
  v.LiteralSchema<false, undefined>,
  v.StringSchema<undefined>,
  v.UndefinedSchema<undefined>,
  v.ObjectSchema<any, undefined>,
], undefined> = v.tuple([
  v.literal(false),
  v.string(),
  v.undefined(),
  v.object({
    request: HttpRequestSchema,
    metadata: v.optional(v.any()),
  }),
])

export function HttpRpcResultSchema<T extends v.BaseSchema<any, any, any>>(dataSchema: T): v.UnionSchema<any, undefined> {
  return v.union([
    HttpRpcResultSuccessSchema(dataSchema),
    HttpRpcResultErrorSchema,
  ])
}
