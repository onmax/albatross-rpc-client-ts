import * as v from 'valibot'

// Common schemas
export const ValidityStartHeightSchema = v.union([
  v.object({
    relativeValidityStartHeight: v.number(),
  }),
  v.object({
    absoluteValidityStartHeight: v.number(),
  }),
])

export const HashAlgorithmSchema = v.picklist([1, 3, 4])

export const AccountTypeSchema = v.picklist(['basic', 'vesting', 'htlc', 'staking'])

export const InherentTypeSchema = v.picklist(['reward', 'jail', 'penalize'])

export const PolicyConstantsSchema = v.object({
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
export const BasicAccountSchema = v.object({
  type: v.literal('basic'),
  address: v.string(),
  balance: v.number(),
})

export const VestingAccountSchema = v.object({
  type: v.literal('vesting'),
  address: v.string(),
  balance: v.number(),
  owner: v.string(),
  vestingStart: v.number(),
  vestingStepBlocks: v.number(),
  vestingStepAmount: v.number(),
  vestingTotalAmount: v.number(),
})

export const HtlcAccountSchema = v.object({
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

export const StakingAccountSchema = v.object({
  type: v.literal('staking'),
  address: v.string(),
  balance: v.number(),
})

export const AccountSchema = v.variant('type', [
  BasicAccountSchema,
  VestingAccountSchema,
  HtlcAccountSchema,
  StakingAccountSchema,
])

export const TransactionSchema = v.object({
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

export const StakerSchema = v.object({
  address: v.string(),
  balance: v.number(),
  delegation: v.optional(v.string()),
  inactiveBalance: v.number(),
  inactiveFrom: v.nullable(v.number()),
  retiredBalance: v.number(),
})

export const ValidatorSchema = v.object({
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

export const SlotSchema = v.object({
  firstSlotNumber: v.number(),
  numSlots: v.number(),
  validator: v.string(),
  publicKey: v.string(),
})

export const PenalizedSlotsSchema = v.object({
  blockNumber: v.number(),
  disabled: v.array(v.number()),
})

// Inherent schemas
export const InherentRewardSchema = v.object({
  type: v.literal('reward'),
  blockNumber: v.number(),
  blockTime: v.number(),
  validatorAddress: v.string(),
  target: v.string(),
  value: v.number(),
  hash: v.string(),
})

export const InherentPenalizeSchema = v.object({
  type: v.literal('penalize'),
  blockNumber: v.number(),
  blockTime: v.number(),
  validatorAddress: v.string(),
  offenseEventBlock: v.number(),
})

export const InherentJailSchema = v.object({
  type: v.literal('jail'),
  blockNumber: v.number(),
  blockTime: v.number(),
  validatorAddress: v.string(),
  offenseEventBlock: v.number(),
})

export const InherentSchema = v.variant('type', [
  InherentRewardSchema,
  InherentPenalizeSchema,
  InherentJailSchema,
])

export const MempoolInfoSchema = v.object({
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

export const WalletAccountSchema = v.object({
  address: v.string(),
  publicKey: v.string(),
  privateKey: v.string(),
})

export const SignatureSchema = v.object({
  signature: v.string(),
  publicKey: v.string(),
})

export const BlockchainStateSchema = v.object({
  blockNumber: v.number(),
  blockHash: v.string(),
})

export const AuthSchema = v.object({
  username: v.string(),
  password: v.string(),
})

export const BlockTypeSchema = v.picklist(['micro', 'macro'])

export const BlockSubscriptionTypeSchema = v.picklist(['macro', 'micro', 'election'])

export const RetrieveTypeSchema = v.picklist(['full', 'partial', 'hash'])

export const NetworkIdSchema = v.picklist([1, 2, 3, 4, 5, 6, 7, 24, 42])

// Equivocation proof schemas
export const ForkProofSchema = v.object({
  blockNumber: v.number(),
  hashes: v.tuple([v.string(), v.string()]),
})

export const DoubleProposalProofSchema = v.object({
  blockNumber: v.number(),
  hashes: v.tuple([v.string(), v.string()]),
})

export const DoubleVoteProofSchema = v.object({
  blockNumber: v.number(),
})

export const EquivocationProofSchema = v.variant('type', [
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
export const PartialBlockSchema = v.object({
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

export const PartialMicroBlockSchema = v.intersect([
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

export const MicroBlockSchema = v.intersect([
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

export const PartialMacroBlockSchema = v.intersect([
  PartialBlockSchema,
  v.object({
    type: v.literal('macro'),
    epoch: v.number(),
    parentElectionHash: v.string(),
    producer: v.undefined(),
    equivocationProofs: v.undefined(),
  }),
])

export const MacroBlockSchema = v.intersect([
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

export const ElectionMacroBlockSchema = v.intersect([
  PartialMacroBlockSchema,
  v.object({
    isElectionBlock: v.literal(true),
    transactions: v.array(TransactionSchema),
    interlink: v.array(v.string()),
    slots: v.array(SlotSchema),
    nextBatchInitialPunishedSet: v.array(v.number()),
  }),
])

export const BlockSchema = v.union([
  MicroBlockSchema,
  MacroBlockSchema,
  ElectionMacroBlockSchema,
])

export const ZKPStateSchema = v.object({
  latestBlock: BlockSchema,
  latestProof: v.optional(v.string()),
})

// Log schemas
export const LogTypeSchema = v.picklist([
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

export const LogSchema = v.variant('type', [
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

export const TransactionLogSchema = v.object({
  hash: v.string(),
  logs: v.array(LogSchema),
  failed: v.boolean(),
})

export const BlockLogSchema = v.object({
  inherents: v.array(LogSchema),
  transactions: v.array(TransactionLogSchema),
})

export const AppliedBlockLogSchema = v.intersect([
  BlockLogSchema,
  v.object({
    type: v.literal('applied-block'),
    timestamp: v.bigint(),
  }),
])

export const RevertedBlockLogSchema = v.intersect([
  BlockLogSchema,
  v.object({
    type: v.literal('reverted-block'),
  }),
])

export const BlockLogTypeSchema = v.union([
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
export const HttpOptionsSchema = v.object({
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

export const SendTxOptionsSchema = v.intersect([
  HttpOptionsSchema,
  v.object({
    waitForConfirmationTimeout: v.optional(v.number()),
  }),
])

export const HttpRequestSchema = v.object({
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

export const HttpRpcResultErrorSchema = v.tuple([
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
