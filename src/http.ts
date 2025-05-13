import type {
  Account,
  Block,
  BlockchainState,
  HttpOptions,
  HttpRequest,
  HttpRpcResult,
  Inherent,
  MempoolInfo,
  PartialBlock,
  PenalizedSlots,
  PolicyConstants,
  Signature,
  Slot,
  Staker,
  Transaction,
  Validator,
  ValidityStartHeight,
} from './types'

import { __getAuth, __getBaseUrl } from './config'

export interface IncludeBody<T extends boolean> { includeBody?: T }

let _idCounter = 0

function base64Encode(input: string): string {
  // eslint-disable-next-line node/prefer-global/buffer
  if (globalThis.Buffer)
    // eslint-disable-next-line node/prefer-global/buffer
    return Buffer.from(input).toString('base64')
  return globalThis.btoa(input)
}

type Res<R> = Promise<HttpRpcResult<R>>

export async function rpcCall<D>(method: string, params: any[] = [], options: HttpOptions = {}): Promise<HttpRpcResult<D>> {
  const url = options.url ? new URL(options.url.toString()) : __getBaseUrl()
  const auth = options.auth ?? __getAuth()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (auth?.username && auth.password) {
    headers.Authorization = `Basic ${base64Encode(`${auth.username}:${auth.password}`)}`
  }

  const id = _idCounter++

  const abortController = options.abortController || new AbortController()
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  if (abortController && options.timeout) {
    timeoutId = setTimeout(() => abortController.abort(), options.timeout)
  }

  const body = { jsonrpc: '2.0', method, params: params.map(p => p ?? null), id }
  const request: HttpRequest = {
    url: url.href,
    method: 'POST',
    headers,
    body,
    timestamp: Date.now(),
    abortController,
    ...options.request,
  }

  let res: Response
  try {
    res = await fetch(request.url, { method: request.method, headers: request.headers, body: JSON.stringify(request.body), signal: request.abortController?.signal })
  }
  catch (e: any) {
    clearTimeout(timeoutId)
    const error = JSON.stringify(e)
    return [false, error, undefined, { request }]
  }
  clearTimeout(timeoutId)
  if (!res.ok) {
    const error = `HTTP error ${res.status}: ${res.statusText}`
    return [false, error, undefined, { request }]
  }
  const json = await res.json().catch(() => null)
  if (!json)
    return [false, 'Invalid JSON response', undefined, { request }]

  if ('error' in json)
    return [false, JSON.stringify(json.error), undefined, { request }]

  if ('result' in json)
    return [true, undefined, json.result.data, { request, metadata: json.result.metadata }]

  return [false, 'Unexpected RPC format', undefined, { request }]
}

// #region Blockchain

export function getBlockNumber<R = number>(opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getBlockNumber', [], opts)
}

export function getBatchNumber<R = number>(opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getBatchNumber', [], opts)
}

export function getEpochNumber<R = number>(opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getEpochNumber', [], opts)
}

export interface GetBlockByHashParams<T> { hash: string, includeBody?: T }
export function getBlockByHash<T extends boolean = false, R = T extends true ? Block : PartialBlock>({ hash, includeBody }: GetBlockByHashParams<T>, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getBlockByHash', [hash, includeBody || false], opts)
}

export interface GetBlockByNumberParams<T> { blockNumber: number, includeBody?: T }
export function getBlockByNumber<T extends boolean = false, R = T extends true ? Block : PartialBlock>({ blockNumber, includeBody }: GetBlockByNumberParams<T>, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getBlockByNumber', [blockNumber, includeBody || false], opts)
}

export interface GetLatestBlockParams<T> { includeBody?: T }
export function getLatestBlock<T extends boolean = false, R = T extends true ? Block : PartialBlock>({ includeBody }: GetLatestBlockParams<T> = {}, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getLatestBlock', [includeBody || false], opts)
}

export interface GetSlotAtParams { blockNumber: number, offsetOpt?: number }
export function getSlotAt<R = Slot>({ blockNumber, offsetOpt }: GetSlotAtParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getSlotAt', [blockNumber, offsetOpt], opts)
}

export interface GetTransactionByHashParams { hash: string }
export function getTransactionByHash<R = Transaction>({ hash }: GetTransactionByHashParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getTransactionByHash', [hash], opts)
}

export interface GetTransactionsByBlockNumberParams { blockNumber: number }
export function getTransactionsByBlockNumber<R = Transaction[]>({ blockNumber }: GetTransactionsByBlockNumberParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getTransactionsByBlockNumber', [blockNumber], opts)
}

export interface GetTransactionsByBatchNumberParams { batchIndex: number }
export function getTransactionsByBatchNumber<R = Transaction[]>({ batchIndex }: GetTransactionsByBatchNumberParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getTransactionsByBatchNumber', [batchIndex], opts)
}

export interface GetTransactionsByAddressParams { address: string, max?: number, startAt?: string }
export function getTransactionsByAddress<R = Transaction[]>({ address, max, startAt }: GetTransactionsByAddressParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getTransactionsByAddress', [address, max, startAt], opts)
}

export interface GetTransactionsHashesByAddressParams { address: string, max?: number, startAt?: string }
export function getTransactionHashesByAddress<R = string[]>({ address, max, startAt }: GetTransactionsHashesByAddressParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getTransactionHashesByAddress', [address, max, startAt], opts)
}

export interface GetInherentsByBlockNumberParams { blockNumber: number }
export function getInherentsByBlockNumber<R = Inherent[]>({ blockNumber }: GetInherentsByBlockNumberParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getInherentsByBlockNumber', [blockNumber], opts)
}

export interface GetInherentsByBatchNumberParams { batchIndex: number }
export function getInherentsByBatchNumber<R = Inherent[]>({ batchIndex }: GetInherentsByBatchNumberParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getInherentsByBatchNumber', [batchIndex], opts)
}

export interface GetAccountByAddressParams { address: string }
export function getAccountByAddress<R = Account>({ address }: GetAccountByAddressParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getAccountByAddress', [address], opts)
}

export function getAccounts<R = Account[]>(opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getAccounts', [], opts)
}

export function getActiveValidators<R = Validator[]>(opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getActiveValidators', [], opts)
}

export function getCurrentPenalizedSlots<R = PenalizedSlots[]>(opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getCurrentPenalizedSlots', [], opts)
}

export function getPreviousPenalizedSlots<R = PenalizedSlots[]>(opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getPreviousPenalizedSlots', [], opts)
}

export interface GetValidatorByAddressParams { address: string }
export function getValidatorByAddress<R = Validator>({ address }: GetValidatorByAddressParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getValidatorByAddress', [address], opts)
}

export type GetValidatorsOpts = HttpOptions
export function getValidators<R = Validator[]>(opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getValidators', [], opts)
}

export interface GetStakersByValidatorAddressParams { address: string }
export function getStakersByValidatorAddress<R = Staker[]>({ address }: GetStakersByValidatorAddressParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getStakersByValidatorAddress', [address], opts)
}

export interface GetStakerByAddressParams { address: string }
export function getStakerByAddress<R = Staker>({ address }: GetStakerByAddressParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getStakerByAddress', [address], opts)
}

// #endregion

// #region Transactions

function getValidityStartHeight(p: ValidityStartHeight): string {
  return 'relativeValidityStartHeight' in p
    ? `+${p.relativeValidityStartHeight}`
    : `${p.absoluteValidityStartHeight}`
}

export function isConsensusEstablished(opts?: HttpOptions): Promise<HttpRpcResult<boolean>> {
  return rpcCall<boolean>('isConsensusEstablished', [], opts)
}

export interface RawTransactionInfoParams { rawTransaction: string }
export function getRawTransactionInfo({ rawTransaction }: RawTransactionInfoParams, opts?: HttpOptions): Promise<HttpRpcResult<Transaction>> {
  return rpcCall<Transaction>('getRawTransactionInfo', [rawTransaction], opts)
}

export interface RawTransactionInfoParamsSend { rawTransaction: string }
export function sendRawTransaction<R = string>({ rawTransaction }: RawTransactionInfoParamsSend, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('sendRawTransaction', [rawTransaction], opts)
}

export type TransactionParams = { wallet: string, recipient: string, value: number, fee: number, data?: string } & ValidityStartHeight

export function createTransaction<R = string>(params: TransactionParams, opts?: HttpOptions): Res<R> {
  const { wallet, recipient, value, fee, data } = params
  const validity = getValidityStartHeight(params)
  const method = data ? 'createBasicTransactionWithData' : 'createBasicTransaction'
  const rpcParams = data
    ? [wallet, recipient, data, value, fee, validity]
    : [wallet, recipient, value, fee, validity]
  return rpcCall<R>(method, rpcParams, opts)
}

export function sendTransaction<R = string>(params: TransactionParams, opts?: HttpOptions): Res<R> {
  const { wallet, recipient, value, fee, data } = params
  const validity = getValidityStartHeight(params)
  const method = data ? 'sendBasicTransactionWithData' : 'sendBasicTransaction'
  const rpcParams = data
    ? [wallet, recipient, data, value, fee, validity]
    : [wallet, recipient, value, fee, validity]
  return rpcCall<R>(method, rpcParams, opts)
}

export type VestingTxParams = {
  wallet: string
  owner: string
  startTime: number
  timeStep: number
  numSteps: number
  value: number
  fee: number
} & ValidityStartHeight

export function createNewVestingTransaction<R = string>(params: VestingTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { wallet, owner, startTime, timeStep, numSteps, value, fee } = params
  return rpcCall<R>('createNewVestingTransaction', [wallet, owner, startTime, timeStep, numSteps, value, fee, validity], opts)
}

export function sendNewVestingTransaction<R = string>(params: VestingTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { wallet, owner, startTime, timeStep, numSteps, value, fee } = params
  return rpcCall<R>('sendNewVestingTransaction', [wallet, owner, startTime, timeStep, numSteps, value, fee, validity], opts)
}

export type RedeemVestingTxParams = {
  wallet: string
  contractAddress: string
  recipient: string
  value: number
  fee: number
} & ValidityStartHeight
export function createRedeemVestingTransaction<R = string>(params: RedeemVestingTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { wallet, contractAddress, recipient, value, fee } = params
  return rpcCall<R>('createRedeemVestingTransaction', [wallet, contractAddress, recipient, value, fee, validity], opts)
}

export function sendRedeemVestingTransaction<R = string>(params: RedeemVestingTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { wallet, contractAddress, recipient, value, fee } = params
  return rpcCall<R>('sendRedeemVestingTransaction', [wallet, contractAddress, recipient, value, fee, validity], opts)
}

export type HtlcTransactionParams = {
  wallet: string
  htlcSender: string
  htlcRecipient: string
  hashRoot: string
  hashCount: number
  timeout: number
  value: number
  fee: number
} & ValidityStartHeight

export function createNewHtlcTransaction<R = string>(params: HtlcTransactionParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { wallet, htlcSender, htlcRecipient, hashRoot, hashCount, timeout, value, fee } = params
  return rpcCall<R>('createNewHtlcTransaction', [wallet, htlcSender, htlcRecipient, hashRoot, hashCount, timeout, value, fee, validity], opts)
}

export function sendNewHtlcTransaction<R = string>(params: HtlcTransactionParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { wallet, htlcSender, htlcRecipient, hashRoot, hashCount, timeout, value, fee } = params
  return rpcCall<R>('sendNewHtlcTransaction', [wallet, htlcSender, htlcRecipient, hashRoot, hashCount, timeout, value, fee, validity], opts)
}

export type RedeemRegularHtlcTxParams = {
  wallet: string
  contractAddress: string
  recipient: string
  preImage: string
  hashRoot: string
  hashCount: number
  value: number
  fee: number
} & ValidityStartHeight

export function createRedeemRegularHtlcTransaction<R = string>(params: RedeemRegularHtlcTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { wallet, contractAddress, recipient, preImage, hashRoot, hashCount, value, fee } = params
  return rpcCall<R>('createRedeemRegularHtlcTransaction', [wallet, contractAddress, recipient, preImage, hashRoot, hashCount, value, fee, validity], opts)
}

export function sendRedeemRegularHtlcTransaction<R = string>(params: RedeemRegularHtlcTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { wallet, contractAddress, recipient, preImage, hashRoot, hashCount, value, fee } = params
  return rpcCall<R>('sendRedeemRegularHtlcTransaction', [wallet, contractAddress, recipient, preImage, hashRoot, hashCount, value, fee, validity], opts)
}

export type RedeemTimeoutHtlcTxParams = {
  wallet: string
  contractAddress: string
  recipient: string
  value: number
  fee: number
} & ValidityStartHeight

export function createRedeemTimeoutHtlcTransaction<R = string>(params: RedeemTimeoutHtlcTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { wallet, contractAddress, recipient, value, fee } = params
  return rpcCall<R>('createRedeemTimeoutHtlcTransaction', [wallet, contractAddress, recipient, value, fee, validity], opts)
}

export function sendRedeemTimeoutHtlcTransaction<R = string>(params: RedeemTimeoutHtlcTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { wallet, contractAddress, recipient, value, fee } = params
  return rpcCall<R>('sendRedeemTimeoutHtlcTransaction', [wallet, contractAddress, recipient, value, fee, validity], opts)
}

export type RedeemEarlyHtlcTxParams = {
  contractAddress: string
  recipient: string
  htlcSenderSignature: string
  htlcRecipientSignature: string
  value: number
  fee: number
} & ValidityStartHeight

export function createRedeemEarlyHtlcTransaction<R = string>(params: RedeemEarlyHtlcTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { contractAddress, recipient, htlcSenderSignature, htlcRecipientSignature, value, fee } = params
  return rpcCall<R>('createRedeemEarlyHtlcTransaction', [contractAddress, recipient, htlcSenderSignature, htlcRecipientSignature, value, fee, validity], opts)
}

export function sendRedeemEarlyHtlcTransaction<R = string>(params: RedeemEarlyHtlcTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { contractAddress, recipient, htlcSenderSignature, htlcRecipientSignature, value, fee } = params
  return rpcCall<R>('sendRedeemEarlyHtlcTransaction', [contractAddress, recipient, htlcSenderSignature, htlcRecipientSignature, value, fee, validity], opts)
}

export function signRedeemEarlyHtlcTransaction<R = string>(params: RedeemEarlyHtlcTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { contractAddress, recipient, htlcSenderSignature, htlcRecipientSignature, value, fee } = params
  return rpcCall<R>('signRedeemEarlyHtlcTransaction', [contractAddress, recipient, htlcSenderSignature, htlcRecipientSignature, value, fee, validity], opts)
}

export type CreateStakeTxParams = {
  senderWallet: string
  stakerWallet: string
  delegation?: string
  value: number
  fee: number
} & ValidityStartHeight

export function createNewStakerTransaction<R = string>(params: CreateStakeTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, stakerWallet, delegation, value, fee } = params
  return rpcCall<R>('createNewStakerTransaction', [senderWallet, stakerWallet, delegation, value, fee, validity], opts)
}

export function sendNewStakerTransaction<R = string>(params: CreateStakeTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, stakerWallet, delegation, value, fee } = params
  return rpcCall<R>('sendNewStakerTransaction', [senderWallet, stakerWallet, delegation, value, fee, validity], opts)
}

export type StakeTxParams = {
  senderWallet: string
  stakerWallet: string
  value: number
  fee: number
} & ValidityStartHeight

export function createStakeTransaction<R = string>(params: StakeTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, stakerWallet, value, fee } = params
  return rpcCall<R>('createStakeTransaction', [senderWallet, stakerWallet, value, fee, validity], opts)
}

export function sendStakeTransaction<R = string>(params: StakeTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, stakerWallet, value, fee } = params
  return rpcCall<R>('sendStakeTransaction', [senderWallet, stakerWallet, value, fee, validity], opts)
}

export type UpdateStakeTxParams = {
  senderWallet: string
  stakerWallet: string
  newDelegation: string | null
  newInactiveBalance: number
  fee: number
} & ValidityStartHeight

export function createUpdateStakerTransaction<R = string>(params: UpdateStakeTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, stakerWallet, newDelegation, newInactiveBalance, fee } = params
  return rpcCall<R>('createUpdateStakerTransaction', [senderWallet, stakerWallet, newDelegation, newInactiveBalance, fee, validity], opts)
}

export function sendUpdateStakerTransaction<R = string>(params: UpdateStakeTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, stakerWallet, newDelegation, newInactiveBalance, fee } = params
  return rpcCall<R>('sendUpdateStakerTransaction', [senderWallet, stakerWallet, newDelegation, newInactiveBalance, fee, validity], opts)
}

export type SetActiveStakeTxParams = {
  senderWallet: string
  stakerWallet: string
  newActiveBalance: number
  fee: number
} & ValidityStartHeight

export function createSetActiveStakeTransaction<R = string>(params: SetActiveStakeTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, stakerWallet, newActiveBalance, fee } = params
  return rpcCall<R>('createSetActiveStakeTransaction', [senderWallet, stakerWallet, newActiveBalance, fee, validity], opts)
}

export function sendSetActiveStakeTransaction<R = string>(params: SetActiveStakeTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, stakerWallet, newActiveBalance, fee } = params
  return rpcCall<R>('sendSetActiveStakeTransaction', [senderWallet, stakerWallet, newActiveBalance, fee, validity], opts)
}

export type CreateRetireStakeTxParams = {
  senderWallet: string
  stakerWallet: string
  retireStake: boolean
  fee: number
} & ValidityStartHeight

export function createRetireStakeTransaction<R = string>(params: CreateRetireStakeTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, stakerWallet, retireStake, fee } = params
  return rpcCall<R>('createRetireStakeTransaction', [senderWallet, stakerWallet, retireStake, fee, validity], opts)
}

export function sendRetireStakeTransaction<R = string>(params: CreateRetireStakeTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, stakerWallet, retireStake, fee } = params
  return rpcCall<R>('sendRetireStakeTransaction', [senderWallet, stakerWallet, retireStake, fee, validity], opts)
}

export type RemoveStakeTxParams = {
  stakerWallet: string
  recipient: string
  value: number
  fee: number
} & ValidityStartHeight

export function createRemoveStakeTransaction<R = string>(params: RemoveStakeTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { stakerWallet, recipient, value, fee } = params
  return rpcCall<R>('createRemoveStakeTransaction', [stakerWallet, recipient, value, fee, validity], opts)
}

export function sendRemoveStakeTransaction<R = string>(params: RemoveStakeTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { stakerWallet, recipient, value, fee } = params
  return rpcCall<R>('sendRemoveStakeTransaction', [stakerWallet, recipient, value, fee, validity], opts)
}

export type NewValidatorTxParams = {
  senderWallet: string
  validator: string
  signingSecretKey: string
  votingSecretKey: string
  rewardAddress: string
  signalData: string
  fee: number
} & ValidityStartHeight

export function createNewValidatorTransaction<R = string>(params: NewValidatorTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, validator, signingSecretKey, votingSecretKey, rewardAddress, signalData, fee } = params
  return rpcCall<R>('createNewValidatorTransaction', [senderWallet, validator, signingSecretKey, votingSecretKey, rewardAddress, signalData, fee, validity], opts)
}

export function sendNewValidatorTransaction<R = string>(params: NewValidatorTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, validator, signingSecretKey, votingSecretKey, rewardAddress, signalData, fee } = params
  return rpcCall<R>('sendNewValidatorTransaction', [senderWallet, validator, signingSecretKey, votingSecretKey, rewardAddress, signalData, fee, validity], opts)
}

export type UpdateValidatorTxParams = {
  senderWallet: string
  validator: string
  newSigningSecretKey: string | null
  newVotingSecretKey: string | null
  newRewardAddress: string | null
  newSignalData: string | null
  fee: number
} & ValidityStartHeight

export function createUpdateValidatorTransaction<R = string>(params: UpdateValidatorTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, validator, newSigningSecretKey, newVotingSecretKey, newRewardAddress, newSignalData, fee } = params
  return rpcCall<R>('createUpdateValidatorTransaction', [senderWallet, validator, newSigningSecretKey, newVotingSecretKey, newRewardAddress, newSignalData, fee, validity], opts)
}

export function sendUpdateValidatorTransaction<R = string>(params: UpdateValidatorTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, validator, newSigningSecretKey, newVotingSecretKey, newRewardAddress, newSignalData, fee } = params
  return rpcCall<R>('sendUpdateValidatorTransaction', [senderWallet, validator, newSigningSecretKey, newVotingSecretKey, newRewardAddress, newSignalData, fee, validity], opts)
}

export type DeactivateValidatorTxParams = {
  senderWallet: string
  validator: string
  signingSecretKey: string
  fee: number
} & ValidityStartHeight

export function createDeactivateValidatorTransaction<R = string>(params: DeactivateValidatorTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, validator, signingSecretKey, fee } = params
  return rpcCall<R>('createDeactivateValidatorTransaction', [senderWallet, validator, signingSecretKey, fee, validity], opts)
}

export function sendDeactivateValidatorTransaction<R = string>(params: DeactivateValidatorTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, validator, signingSecretKey, fee } = params
  return rpcCall<R>('sendDeactivateValidatorTransaction', [senderWallet, validator, signingSecretKey, fee, validity], opts)
}

export type ReactivateValidatorTxParams = {
  senderWallet: string
  validator: string
  signingSecretKey: string
  fee: number
} & ValidityStartHeight

export function createReactivateValidatorTransaction<R = string>(params: ReactivateValidatorTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, validator, signingSecretKey, fee } = params
  return rpcCall<R>('createReactivateValidatorTransaction', [senderWallet, validator, signingSecretKey, fee, validity], opts)
}

export function sendReactivateValidatorTransaction<R = string>(params: ReactivateValidatorTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, validator, signingSecretKey, fee } = params
  return rpcCall<R>('sendReactivateValidatorTransaction', [senderWallet, validator, signingSecretKey, fee, validity], opts)
}

export type RetireValidatorTxParams = {
  senderWallet: string
  validator: string
  fee: number
} & ValidityStartHeight

export function createRetireValidatorTransaction<R = string>(params: RetireValidatorTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, validator, fee } = params
  return rpcCall<R>('createRetireValidatorTransaction', [senderWallet, validator, fee, validity], opts)
}

export function sendRetireValidatorTransaction<R = string>(params: RetireValidatorTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, validator, fee } = params
  return rpcCall<R>('sendRetireValidatorTransaction', [senderWallet, validator, fee, validity], opts)
}

export type DeleteValidatorTxParams = {
  validator: string
  recipient: string
  fee: number
  value: number
} & ValidityStartHeight

export function createDeleteValidatorTransaction<R = string>(params: DeleteValidatorTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { validator, recipient, fee, value } = params
  return rpcCall<R>('createDeleteValidatorTransaction', [validator, recipient, fee, value, validity], opts)
}

export function sendDeleteValidatorTransaction<R = string>(params: DeleteValidatorTxParams, opts?: HttpOptions): Res<R> {
  const validity = getValidityStartHeight(params)
  const { validator, recipient, fee, value } = params
  return rpcCall<R>('sendDeleteValidatorTransaction', [validator, recipient, fee, value, validity], opts)
}

// #endregion

// #region Mempool

export interface PushTransactionParams { transaction: string, withHighPriority?: boolean }
export async function pushTransaction<R = string>({ transaction, withHighPriority }: PushTransactionParams, opts?: HttpOptions): Res<R> {
  const method = (withHighPriority || false) ? 'pushHighPriorityTransaction' : 'pushTransaction'
  return rpcCall<R>(method, [transaction], opts)
}

export interface MempoolContentParams<T extends boolean = false> { includeTransactions?: T }
export async function mempoolContent<T extends boolean = false, R = T extends true ? { tx: Transaction }[] : { hash: string }[]>({ includeTransactions }: MempoolContentParams<T>, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('mempoolContent', [includeTransactions || false], opts)
}

export async function mempool<R = MempoolInfo>(opts?: HttpOptions): Res<R> {
  return rpcCall<R>('mempool', [], opts)
}

export async function getMinFeePerByte<R = number>(opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getMinFeePerByte', [], opts)
}

export interface GetTransactionFromMempoolParams { hash: string }
export async function getTransactionFromMempool<R = Transaction>({ hash }: GetTransactionFromMempoolParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getTransactionFromMempool', [hash], opts)
}

// #endregion

// #region Peers

export function getPeerId<R = string>(opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getPeerId', [], opts)
}

export function getPeerCount<R = number>(opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getPeerCount', [], opts)
}

export function getPeerList<R = string[]>(opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getPeerList', [], opts)
}

// #endregion

// #region Policy

export function getPolicyConstants<R = PolicyConstants>(opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getPolicyConstants', [], opts)
}

export interface GetEpochAtParams { blockNumber: number }
export function getEpochAt<R = number>({ blockNumber }: GetEpochAtParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getEpochAt', [blockNumber], opts)
}

export interface GetEpochIndexAtParams { blockNumber: number }
export function getEpochIndexAt<R = number>({ blockNumber }: GetEpochIndexAtParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getEpochIndexAt', [blockNumber], opts)
}

export interface GetBatchAtParams { blockNumber: number }
export function getBatchAt<R = number>({ blockNumber }: GetBatchAtParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getBatchAt', [blockNumber], opts)
}

export interface GetBatchIndexAtParams { blockNumber: number }
export function getBatchIndexAt<R = number>({ blockNumber }: GetBatchIndexAtParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getBatchIndexAt', [blockNumber], opts)
}

export interface GetElectionBlockAfterParams { blockNumber: number }
export function getElectionBlockAfter<R = number>({ blockNumber }: GetElectionBlockAfterParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getElectionBlockAfter', [blockNumber], opts)
}

export interface GetElectionBlockBeforeParams { blockNumber: number }
export function getElectionBlockBefore<R = number>({ blockNumber }: GetElectionBlockBeforeParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getElectionBlockBefore', [blockNumber], opts)
}

export interface GetLastElectionBlockParams { blockNumber: number }
export function getLastElectionBlock<R = number>({ blockNumber }: GetLastElectionBlockParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getLastElectionBlock', [blockNumber], opts)
}

export interface IsElectionBlockAtParams { blockNumber: number }
export function isElectionBlockAt<R = boolean>({ blockNumber }: IsElectionBlockAtParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('isElectionBlockAt', [blockNumber], opts)
}

export interface GetMacroBlockAfterParams { blockNumber: number }
export function getMacroBlockAfter<R = number>({ blockNumber }: GetMacroBlockAfterParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getMacroBlockAfter', [blockNumber], opts)
}

export interface GetMacroBlockBeforeParams { blockNumber: number }
export function getMacroBlockBefore<R = number>({ blockNumber }: GetMacroBlockBeforeParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getMacroBlockBefore', [blockNumber], opts)
}

export interface GetLastMacroBlockParams { blockNumber: number }
export function getLastMacroBlock<R = number>({ blockNumber }: GetLastMacroBlockParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getLastMacroBlock', [blockNumber], opts)
}

export interface IsMacroBlockAtParams { blockNumber: number }
export function isMacroBlockAt<R = boolean>({ blockNumber }: IsMacroBlockAtParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('isMacroBlockAt', [blockNumber], opts)
}

export interface IsMicroBlockAtParams { blockNumber: number }
export function isMicroBlockAt<R = boolean>({ blockNumber }: IsMicroBlockAtParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('isMicroBlockAt', [blockNumber], opts)
}

export interface GetFirstBlockOfEpochParams { epochIndex: number }
export function getFirstBlockOfEpoch<R = number>({ epochIndex }: GetFirstBlockOfEpochParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getFirstBlockOfEpoch', [epochIndex], opts)
}

export interface GetBlockAfterReportingWindowParams { blockNumber: number }
export function getBlockAfterReportingWindow<R = number>({ blockNumber }: GetBlockAfterReportingWindowParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getBlockAfterReportingWindow', [blockNumber], opts)
}

export interface GetBlockAfterJailParams { blockNumber: number }
export function getBlockAfterJail<R = number>({ blockNumber }: GetBlockAfterJailParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getBlockAfterJail', [blockNumber], opts)
}

export interface GetFirstBlockOfBatchParams { batchIndex: number }
export function getFirstBlockOfBatch<R = number>({ batchIndex }: GetFirstBlockOfBatchParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getFirstBlockOfBatch', [batchIndex], opts)
}

export interface GetElectionBlockOfEpochParams { epochIndex: number }
export function getElectionBlockOfEpoch<R = number>({ epochIndex }: GetElectionBlockOfEpochParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getElectionBlockOf', [epochIndex], opts)
}

export interface GetMacroBlockOfBatchParams { batchIndex: number }
export function getMacroBlockOfBatch<R = number>({ batchIndex }: GetMacroBlockOfBatchParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getMacroBlockOf', [batchIndex], opts)
}

export interface GetFirstBatchOfEpochParams { epochIndex: number }
export function getFirstBatchOfEpoch<R = number>({ epochIndex }: GetFirstBatchOfEpochParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getFirstBatchOfEpoch', [epochIndex], opts)
}

export function getBlockchainState<R = BlockchainState>(opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getBlockchainState', [], opts)
}

export interface GetSupplyAtParams { blockNumber: number }
export function getSupplyAt<R = string>({ blockNumber }: GetSupplyAtParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getSupplyAt', [blockNumber], opts)
}

// #endregion

// #region ZKP

interface ZKPStateKebab {
  'latest-header-number': number
  'latest-block-number': number
  'latest-proof': string
}

interface ZKPState {
  latestHeaderNumber: number
  latestBlockNumber: number
  latestProof: string
}

export async function getZkpState<R = ZKPState>(opts?: HttpOptions): Res<R> {
  const result = await rpcCall<ZKPStateKebab>('getZkpState', [], opts)

  if (!result[0])
    return result as unknown as Res<R>

  return [true, undefined, {
    latestHeaderNumber: result[2]!['latest-header-number'],
    latestBlockNumber: result[2]!['latest-block-number'],
    latestProof: result[2]!['latest-proof'],
  } as R, result[3]]
}

// #endregion

// #region Wallet

export interface ImportKeyParams { keyData: string, passphrase?: string }
export function importRawKey<R = string>({ keyData, passphrase }: ImportKeyParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('importRawKey', [keyData, passphrase], opts)
}

export interface IsAccountImportedParams { address: string }
export function isAccountImported<R = boolean>({ address }: IsAccountImportedParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('isAccountImported', [address], opts)
}

export function listAccounts<R = string[]>(opts?: HttpOptions): Res<R> {
  return rpcCall<R>('listAccounts', [], opts)
}

export interface AddVotingKeyParams { secretKey: string }
export function addVotingKey<R = null>({ secretKey }: AddVotingKeyParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('addVotingKey', [secretKey], opts)
}

export interface CreateAccountParams { passphrase?: string }
export function createAccount<R = Account>({ passphrase }: CreateAccountParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('createAccount', [passphrase], opts)
}

export function getAddress<R = string>(opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getAddress', [], opts)
}

export function getSigningKey<R = string>(opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getSigningKey', [], opts)
}

export function getVotingKey<R = string>(opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getVotingKey', [], opts)
}

export function getVotingKeys<R = string[]>(opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getVotingKeys', [], opts)
}

export interface IsAccountUnlockedParams { address: string }
export function isAccountUnlocked<R = boolean>({ address }: IsAccountUnlockedParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('isAccountUnlocked', [address], opts)
}

export interface LockAccountParams { address: string }
export function lockAccount<R = null>({ address }: LockAccountParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('lockAccount', [address], opts)
}

export interface RemoveAccountParams { address: string }
export function removeAccount<R = boolean>({ address }: RemoveAccountParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('removeAccount', [address], opts)
}

export function isValidatorElected<R = boolean>(opts?: HttpOptions): Res<R> {
  return rpcCall<R>('isValidatorElected', [], opts)
}

export function isValidatorSynced<R = boolean>(opts?: HttpOptions): Res<R> {
  return rpcCall<R>('isValidatorSynced', [], opts)
}

export interface PushHighPriorityTransactionOpts { rawTx: string }
export function pushHighPriorityTransaction<R = string>(rawTx: string, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('pushHighPriorityTransaction', [rawTx], opts)
}

export interface SetAutomaticReactivationParams { automaticReactivate: boolean }
export function setAutomaticReactivation<R = null>({ automaticReactivate }: SetAutomaticReactivationParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('setAutomaticReactivation', [automaticReactivate], opts)
}

export interface SignParams {
  message: string
  address: string
  passphrase: string
  isHex: boolean
}
export function sign<R = Signature>({
  message,
  address,
  passphrase,
  isHex,
}: SignParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('sign', [message, address, passphrase, isHex], opts)
}

export interface VerifySignatureParams {
  message: string
  publicKey: string
  signature: Signature
  isHex: boolean
}
export function verifySignature<R = boolean>({
  message,
  publicKey,
  signature,
  isHex,
}: VerifySignatureParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('verifySignature', [message, publicKey, signature, isHex], opts)
}

export interface UnlockAccountParams {
  address: string
  passphrase?: string
  duration?: number
}
export function unlockAccount<R = boolean>({ address, passphrase, duration }: UnlockAccountParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('unlockAccount', [address, passphrase, duration], opts)
}

// Epoch & Block Queries
export interface GetElectionBlockOfParams { epochIndex: number }
export function getElectionBlockOf<R = number>({ epochIndex }: GetElectionBlockOfParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getElectionBlockOf', [epochIndex], opts)
}

export interface GetFirstBlockOfParams { epochIndex: number }
export function getFirstBlockOf<R = number>({ epochIndex }: GetFirstBlockOfParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getFirstBlockOf', [epochIndex], opts)
}

export interface GetMacroBlockOfParams { batchNumber: number }
export function getMacroBlockOf<R = number>({ batchNumber }: GetMacroBlockOfParams, opts?: HttpOptions): Res<R> {
  return rpcCall<R>('getMacroBlockOf', [batchNumber], opts)
}
