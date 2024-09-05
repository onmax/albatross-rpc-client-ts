export type PlainTransactionFormat = 'basic' | 'extended'
export type PlainAccountType = 'basic' | 'vesting' | 'htlc' | 'staking'
export type TransactionState = 'new' | 'pending' | 'included' | 'confirmed' | 'invalidated' | 'expired'

export interface PlainRawData {
  raw: string
}

export interface PlainVestingData extends PlainRawData {
  owner: string
  startTime: number
  timeStep: number
  stepAmount: number
}

export interface PlainHtlcData extends PlainRawData {
  sender: string
  recipient: string
  hashAlgorithm: string
  hashRoot: string
  hashCount: number
  timeout: number
}

export type PlainTransactionSenderData =
  | { type: 'raw', raw: string }
  | { type: 'delete-validator', raw: string }
  | { type: 'remove-stake', raw: string }

export type PlainTransactionRecipientData =
  | { type: 'raw', raw: string }
  | { type: 'vesting' } & PlainVestingData
  | { type: 'htlc' } & PlainHtlcData
  | { type: 'create-validator', raw: string, signingKey: string, votingKey: string, rewardAddress: string, signalData?: string, proofOfKnowledge: string }
  | { type: 'update-validator', raw: string, newSigningKey?: string, newVotingKey?: string, newRewardAddress?: string, newSignalData?: string | null, newProofOfKnowledge?: string }
  | { type: 'deactivate-validator', raw: string, validator: string }
  | { type: 'reactivate-validator', raw: string, validator: string }
  | { type: 'retire-validator', raw: string }
  | { type: 'create-staker', raw: string, delegation?: string }
  | { type: 'add-stake', raw: string, staker: string }
  | { type: 'update-staker', raw: string, newDelegation?: string, reactivateAllStake: boolean }
  | { type: 'set-active-stake', raw: string, newActiveBalance: number }
  | { type: 'retire-stake', raw: string, retireStake: number }

export type PlainTransactionProof =
  | { type: 'empty', raw: string }
  | { type: 'standard', raw: string, signature: string, publicKey: string, signer: string, pathLength: number }
  | { type: 'regular-transfer', raw: string, hashAlgorithm: string, hashDepth: number, hashRoot: string, preImage: string, signer: string, signature: string, publicKey: string, pathLength: number }
  | { type: 'timeout-resolve', raw: string, creator: string, creatorSignature: string, creatorPublicKey: string, creatorPathLength: number }
  | { type: 'early-resolve', raw: string, signer: string, signature: string, publicKey: string, pathLength: number, creator: string, creatorSignature: string, creatorPublicKey: string, creatorPathLength: number }

export interface Transaction {
  transactionHash: string
  format: PlainTransactionFormat
  sender: string
  senderType: PlainAccountType
  recipient: string
  recipientType: PlainAccountType
  value: number
  fee: number
  feePerByte: number
  validityStartHeight: number
  network: string
  flags: number
  senderData: PlainTransactionSenderData
  data: PlainTransactionRecipientData
  proof: PlainTransactionProof
  size: number
  valid: boolean
}

export interface TransactionDetails extends Transaction {
  state: TransactionState
  executionResult?: boolean
  blockHeight?: number
  confirmations?: number
  timestamp?: number
}
