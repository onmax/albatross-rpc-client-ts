import type {
  Account,
  Block,
  BlockchainState,
  Inherent,
  LogType,
  MempoolInfo,
  PartialBlock,
  PenalizedSlots,
  PolicyConstants,
  Slot,
  Staker,
  Transaction,
  Validator,
  ValidityStartHeight,
} from './types'
import type { Signature } from './types/'
import type { HttpOptions, HttpRequest, HttpRpcResult } from './types/http'

// #endregion

// #region Wallet

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

export async function rpcCall<D, M = undefined>(method: string, params: any[] = [], options: HttpOptions = {}): Promise<HttpRpcResult<D, M>> {
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
  const request: HttpRequest = { url: url.href, method: 'POST', headers, body, timestamp: Date.now(), abortController }

  let res: Response
  try {
    res = await fetch(request.url, { method: request.method, headers: request.headers, body: JSON.stringify(request.body), signal: request.abortController?.signal })
  }
  catch (e: any) {
    clearTimeout(timeoutId)
    return {
      request,
      error: {
        code: e.name === 'AbortError' ? 408 : 503,
        message: e.message,
      },
    }
  }
  clearTimeout(timeoutId)
  if (!res.ok) {
    return {
      request,
      error: {
        code: res.status,
        message: res.statusText,
      },
    }
  }
  const json = await res.json().catch(() => null)
  if (!json)
    return { request, error: { code: -1, message: 'Invalid JSON response' } }

  if ('error' in json)
    return { request, error: { code: json.error.code, message: json.error.message } }

  if ('result' in json)
    return { request, data: json.result.data, metadata: json.result.metadata } as HttpRpcResult<D, M>

  return { request, error: { code: -1, message: 'Unexpected RPC format' } }
}

// #region Blockchain

export type GetBlockNumberOpts = HttpOptions
export function getBlockNumber<R = number>(opts?: HttpOptions): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getBlockNumber', [], opts)
}

export type GetBatchNumberOpts = HttpOptions
export function getBatchNumber<R = number>(opts?: HttpOptions): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getBatchNumber', [], opts)
}

export type GetEpochNumberOpts = HttpOptions
export function getEpochNumber<R = number>(opts?: HttpOptions): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getEpochNumber', [], opts)
}

export type GetBlockByHashOpts<T> = HttpOptions & { includeBody?: T }
export function getBlockByHash<T extends boolean = false, R = T extends true ? Block : PartialBlock>(hash: string, { includeBody, ...opts }: GetBlockByHashOpts<T> = {}): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getBlockByHash', [hash, includeBody || false], opts)
}

export type GetBlockByNumberOpts<T> = HttpOptions & { includeBody?: T }
export function getBlockByNumber<T extends boolean = false, R = T extends true ? Block : PartialBlock>(blockNumber: number, { includeBody, ...opts }: GetBlockByNumberOpts<T> = {}): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getBlockByNumber', [blockNumber, includeBody || false], opts)
}

export type GetLatestBlockOpts<T> = HttpOptions & { includeBody?: T }
export function getLatestBlock<T extends boolean = false, R = T extends true ? Block : PartialBlock>({ includeBody, ...opts }: GetLatestBlockOpts<T> = {}): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getLatestBlock', [includeBody || false], opts)
}

export type GetSlotAtOpts = HttpOptions & { offsetOpt?: number }
export function getSlotAt<R = Slot>(blockNumber: number, { offsetOpt, ...opts }: GetSlotAtOpts = {}): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getSlotAt', [blockNumber, offsetOpt], opts)
}

export type GetTransactionByHashOpts = HttpOptions
export function getTransactionByHash<R = Transaction>(hash: string, opts?: GetTransactionByHashOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getTransactionByHash', [hash], opts)
}

export type GetTransactionsByBlockNumberOpts = HttpOptions
export function getTransactionsByBlockNumber<R = Transaction[]>(blockNumber: number, opts?: GetTransactionsByBlockNumberOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getTransactionsByBlockNumber', [blockNumber], opts)
}

export type GetTransactionsByBatchNumberOpts = HttpOptions
export function getTransactionsByBatchNumber<R = Transaction[]>(batchIndex: number, opts?: GetTransactionsByBatchNumberOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getTransactionsByBatchNumber', [batchIndex], opts)
}

export type GetTransactionsByAddressOpts = HttpOptions & { max: number, startAt: string }
export function getTransactionByAddress<R = Transaction[]>(address: string, { max, startAt, ...opts }: GetTransactionsByAddressOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getTransactionByAddress', [address, max, startAt], opts)
}

export type GetTransactionsHashesByAddressOpts = HttpOptions & { max: number, startAt: string }
export function getTransactionHashesByAddress<R = string[]>(address: string, { max, startAt, ...opts }: GetTransactionsHashesByAddressOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getTransactionHashesByAddress', [address, max, startAt], opts)
}

export type GetInherentsByBlockNumberOpts = HttpOptions
export function getInherentsByBlockNumber<R = Inherent[]>(blockNumber: number, opts?: GetInherentsByBlockNumberOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getInherentsByBlockNumber', [blockNumber], opts)
}

export type GetInherentsByBatchNumberOpts = HttpOptions
export function getInherentsByBatchNumber<R = Inherent[]>(batchIndex: number, opts?: GetInherentsByBatchNumberOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getInherentsByBatchNumber', [batchIndex], opts)
}

export type GetAccountByAddressOpts = HttpOptions
export function getAccountByAddress<R = Account>(address: string, opts: GetAccountByAddressOpts = {}): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getAccountByAddress', [address], opts)
}

export type GetAccountsOpts = HttpOptions
export function getAccounts<R = Account[]>(opts?: GetAccountsOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getAccounts', [], opts)
}

export type GetActiveValidatorsOpts = HttpOptions
export function getActiveValidators<R = Validator[]>(opts?: GetActiveValidatorsOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getActiveValidators', [], opts)
}

export type GetCurrentPenalizedSlotsOpts = HttpOptions
export function getCurrentPenalizedSlots<R = PenalizedSlots[]>(opts?: GetCurrentPenalizedSlotsOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getCurrentPenalizedSlots', [], opts)
}

export type GetPreviousPenalizedSlotsOpts = HttpOptions
export function getPreviousPenalizedSlots<R = PenalizedSlots[]>(opts?: GetPreviousPenalizedSlotsOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getPreviousPenalizedSlots', [], opts)
}

export type GetValidatorByAddressOpts = HttpOptions
export function getValidatorByAddress<R = Validator>(address: string, opts?: GetValidatorByAddressOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getValidatorByAddress', [address], opts)
}

export type GetValidatorsOpts = HttpOptions
export function getValidators<R = Validator[]>(opts?: GetValidatorsOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getValidators', [], opts)
}

export type GetStakersByValidatorAddressOpts = HttpOptions
export function getStakersByValidatorAddress<R = Staker[]>(address: string, opts?: GetStakersByValidatorAddressOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getStakersByValidatorAddress', [address], opts)
}

export type GetStakerByAddressOpts = HttpOptions
export function getStakerByAddress<R = Staker>(address: string, opts?: GetStakerByAddressOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getStakerByAddress', [address], opts)
}

// #endregion

// #region Transactions

function getValidityStartHeight(p: ValidityStartHeight): string {
  return 'relativeValidityStartHeight' in p
    ? `+${p.relativeValidityStartHeight}`
    : `${p.absoluteValidityStartHeight}`
}

export function isConsensusEstablished(opts: HttpOptions): Promise<HttpRpcResult<boolean>> {
  return rpcCall<boolean>('isConsensusEstablished', [], opts)
}

export interface RawTransactionInfoParams { rawTransaction: string }
export function getRawTransactionInfo({ rawTransaction }: RawTransactionInfoParams, opts: HttpOptions): Promise<HttpRpcResult<Transaction>> {
  return rpcCall<Transaction>('getRawTransactionInfo', [rawTransaction], opts)
}

export interface RawTransactionInfoParamsSend { rawTransaction: string }
export function sendRawTransaction<R = string>({ rawTransaction }: RawTransactionInfoParamsSend, opts: HttpOptions): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('sendRawTransaction', [rawTransaction], opts)
}

export type TransactionParams = { wallet: string, recipient: string, value: number, fee: number, data?: string } & ValidityStartHeight

export function createTransaction<R = string>(params: TransactionParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
  const { wallet, recipient, value, fee, data } = params
  const validity = getValidityStartHeight(params)
  const method = data ? 'createBasicTransactionWithData' : 'createBasicTransaction'
  const rpcParams = data
    ? [wallet, recipient, data, value, fee, validity]
    : [wallet, recipient, value, fee, validity]
  return rpcCall<R>(method, rpcParams, opts)
}

export function sendTransaction<R = string>(params: TransactionParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
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

export function createNewVestingTransaction<R = string>(params: VestingTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
  const validity = getValidityStartHeight(params)
  const { wallet, owner, startTime, timeStep, numSteps, value, fee } = params
  return rpcCall<R>('createNewVestingTransaction', [wallet, owner, startTime, timeStep, numSteps, value, fee, validity], opts)
}

export function sendNewVestingTransaction<R = string>(params: VestingTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
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
export function createRedeemVestingTransaction<R = string>(params: RedeemVestingTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
  const validity = getValidityStartHeight(params)
  const { wallet, contractAddress, recipient, value, fee } = params
  return rpcCall<R>('createRedeemVestingTransaction', [wallet, contractAddress, recipient, value, fee, validity], opts)
}

export function sendRedeemVestingTransaction<R = string>(params: RedeemVestingTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
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

export function createNewHtlcTransaction<R = string>(params: HtlcTransactionParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
  const validity = getValidityStartHeight(params)
  const { wallet, htlcSender, htlcRecipient, hashRoot, hashCount, timeout, value, fee } = params
  return rpcCall<R>('createNewHtlcTransaction', [wallet, htlcSender, htlcRecipient, hashRoot, hashCount, timeout, value, fee, validity], opts)
}

export function sendNewHtlcTransaction<R = string>(params: HtlcTransactionParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
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

export function createRedeemRegularHtlcTransaction<R = string>(params: RedeemRegularHtlcTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
  const validity = getValidityStartHeight(params)
  const { wallet, contractAddress, recipient, preImage, hashRoot, hashCount, value, fee } = params
  return rpcCall<R>('createRedeemRegularHtlcTransaction', [wallet, contractAddress, recipient, preImage, hashRoot, hashCount, value, fee, validity], opts)
}

export function sendRedeemRegularHtlcTransaction<R = string>(params: RedeemRegularHtlcTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
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

export function createRedeemTimeoutHtlcTransaction<R = string>(params: RedeemTimeoutHtlcTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
  const validity = getValidityStartHeight(params)
  const { wallet, contractAddress, recipient, value, fee } = params
  return rpcCall<R>('createRedeemTimeoutHtlcTransaction', [wallet, contractAddress, recipient, value, fee, validity], opts)
}

export function sendRedeemTimeoutHtlcTransaction<R = string>(params: RedeemTimeoutHtlcTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
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

export function createRedeemEarlyHtlcTransaction<R = string>(params: RedeemEarlyHtlcTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
  const validity = getValidityStartHeight(params)
  const { contractAddress, recipient, htlcSenderSignature, htlcRecipientSignature, value, fee } = params
  return rpcCall<R>('createRedeemEarlyHtlcTransaction', [contractAddress, recipient, htlcSenderSignature, htlcRecipientSignature, value, fee, validity], opts)
}

export function sendRedeemEarlyHtlcTransaction<R = string>(params: RedeemEarlyHtlcTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
  const validity = getValidityStartHeight(params)
  const { contractAddress, recipient, htlcSenderSignature, htlcRecipientSignature, value, fee } = params
  return rpcCall<R>('sendRedeemEarlyHtlcTransaction', [contractAddress, recipient, htlcSenderSignature, htlcRecipientSignature, value, fee, validity], opts)
}

export function signRedeemEarlyHtlcTransaction<R = string>(params: RedeemEarlyHtlcTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
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

export function createNewStakerTransaction<R = string>(params: CreateStakeTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, stakerWallet, delegation, value, fee } = params
  return rpcCall<R>('createNewStakerTransaction', [senderWallet, stakerWallet, delegation, value, fee, validity], opts)
}

export function sendNewStakerTransaction<R = string>(params: CreateStakeTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
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

export function createStakeTransaction<R = string>(params: StakeTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, stakerWallet, value, fee } = params
  return rpcCall<R>('createStakeTransaction', [senderWallet, stakerWallet, value, fee, validity], opts)
}

export function sendStakeTransaction<R = string>(params: StakeTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
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

export function createUpdateStakerTransaction<R = string>(params: UpdateStakeTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, stakerWallet, newDelegation, newInactiveBalance, fee } = params
  return rpcCall<R>('createUpdateStakerTransaction', [senderWallet, stakerWallet, newDelegation, newInactiveBalance, fee, validity], opts)
}

export function sendUpdateStakerTransaction<R = string>(params: UpdateStakeTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
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

export function createSetActiveStakeTransaction<R = string>(params: SetActiveStakeTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, stakerWallet, newActiveBalance, fee } = params
  return rpcCall<R>('createSetActiveStakeTransaction', [senderWallet, stakerWallet, newActiveBalance, fee, validity], opts)
}

export function sendSetActiveStakeTransaction<R = string>(params: SetActiveStakeTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
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

export function createRetireStakeTransaction<R = string>(params: CreateRetireStakeTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, stakerWallet, retireStake, fee } = params
  return rpcCall<R>('createRetireStakeTransaction', [senderWallet, stakerWallet, retireStake, fee, validity], opts)
}

export function sendRetireStakeTransaction<R = string>(params: CreateRetireStakeTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
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

export function createRemoveStakeTransaction<R = string>(params: RemoveStakeTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
  const validity = getValidityStartHeight(params)
  const { stakerWallet, recipient, value, fee } = params
  return rpcCall<R>('createRemoveStakeTransaction', [stakerWallet, recipient, value, fee, validity], opts)
}

export function sendRemoveStakeTransaction<R = string>(params: RemoveStakeTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
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

export function createNewValidatorTransaction<R = string>(params: NewValidatorTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, validator, signingSecretKey, votingSecretKey, rewardAddress, signalData, fee } = params
  return rpcCall<R>('createNewValidatorTransaction', [senderWallet, validator, signingSecretKey, votingSecretKey, rewardAddress, signalData, fee, validity], opts)
}

export function sendNewValidatorTransaction<R = string>(params: NewValidatorTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
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

export function createUpdateValidatorTransaction<R = string>(params: UpdateValidatorTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, validator, newSigningSecretKey, newVotingSecretKey, newRewardAddress, newSignalData, fee } = params
  return rpcCall<R>('createUpdateValidatorTransaction', [senderWallet, validator, newSigningSecretKey, newVotingSecretKey, newRewardAddress, newSignalData, fee, validity], opts)
}

export function sendUpdateValidatorTransaction<R = string>(params: UpdateValidatorTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
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

export function createDeactivateValidatorTransaction<R = string>(params: DeactivateValidatorTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, validator, signingSecretKey, fee } = params
  return rpcCall<R>('createDeactivateValidatorTransaction', [senderWallet, validator, signingSecretKey, fee, validity], opts)
}

export function sendDeactivateValidatorTransaction<R = string>(params: DeactivateValidatorTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
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

export function createReactivateValidatorTransaction<R = string>(params: ReactivateValidatorTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, validator, signingSecretKey, fee } = params
  return rpcCall<R>('createReactivateValidatorTransaction', [senderWallet, validator, signingSecretKey, fee, validity], opts)
}

export function sendReactivateValidatorTransaction<R = string>(params: ReactivateValidatorTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, validator, signingSecretKey, fee } = params
  return rpcCall<R>('sendReactivateValidatorTransaction', [senderWallet, validator, signingSecretKey, fee, validity], opts)
}

export type RetireValidatorTxParams = {
  senderWallet: string
  validator: string
  fee: number
} & ValidityStartHeight

export function createRetireValidatorTransaction<R = string>(params: RetireValidatorTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
  const validity = getValidityStartHeight(params)
  const { senderWallet, validator, fee } = params
  return rpcCall<R>('createRetireValidatorTransaction', [senderWallet, validator, fee, validity], opts)
}

export function sendRetireValidatorTransaction<R = string>(params: RetireValidatorTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
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

export function createDeleteValidatorTransaction<R = string>(params: DeleteValidatorTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
  const validity = getValidityStartHeight(params)
  const { validator, recipient, fee, value } = params
  return rpcCall<R>('createDeleteValidatorTransaction', [validator, recipient, fee, value, validity], opts)
}

export function sendDeleteValidatorTransaction<R = string>(params: DeleteValidatorTxParams, opts: HttpOptions): Promise<HttpRpcResult<R>> {
  const validity = getValidityStartHeight(params)
  const { validator, recipient, fee, value } = params
  return rpcCall<R>('sendDeleteValidatorTransaction', [validator, recipient, fee, value, validity], opts)
}

// #endregion

// #region Mempool

export interface PushTransactionOptions extends HttpOptions { withHighPriority?: boolean }

export async function pushTransaction<R = string>(transaction: string, { withHighPriority, ...opts }: PushTransactionOptions = {}): Promise<HttpRpcResult<R>> {
  const method = (withHighPriority || false) ? 'pushHighPriorityTransaction' : 'pushTransaction'
  return rpcCall<R>(method, [transaction], opts)
}

export interface MempoolContentOptions<T extends boolean = false> extends HttpOptions { includeTransactions?: T }
export async function mempoolContent<T extends boolean = false, R = T extends true ? { tx: Transaction }[] : { hash: string }[]>(includeTransactions: T, options: MempoolContentOptions<T> = {}): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('mempoolContent', [includeTransactions || false], options)
}

export interface MempoolOptions extends HttpOptions { }
export async function mempool<R = MempoolInfo>(options: MempoolOptions = {}): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('mempool', [], options)
}

export interface GetMinFeePerByteOptions extends HttpOptions { }
export async function getMinFeePerByte<R = number>(options: GetMinFeePerByteOptions = {}): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getMinFeePerByte', [], options)
}

export interface GetTransactionFromMempoolOptions extends HttpOptions { }
export async function getTransactionFromMempool<R = Transaction>(hash: string, options: GetTransactionFromMempoolOptions = {}): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getTransactionFromMempool', [hash], options)
}

// #endregion

// #region Peers

export type GetPeerIdOpts = HttpOptions
export function getPeerId<R = string>(opts?: GetPeerIdOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getPeerId', [], opts)
}

export type GetPeerCountOpts = HttpOptions
export function getPeerCount<R = number>(opts?: GetPeerCountOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getPeerCount', [], opts)
}

export type GetPeerListOpts = HttpOptions
export function getPeerList<R = string[]>(opts?: GetPeerListOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getPeerList', [], opts)
}

// #endregion

// #region Policy

export type GetPolicyConstantsOpts = HttpOptions
export function getPolicyConstants<R = PolicyConstants>(opts?: GetPolicyConstantsOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getPolicyConstants', [], opts)
}

export type GetEpochAtOpts = HttpOptions
export function getEpochAt<R = number>(blockNumber: number, opts?: GetEpochAtOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getEpochAt', [blockNumber], opts)
}

export type GetEpochIndexAtOpts = HttpOptions
export function getEpochIndexAt<R = number>(blockNumber: number, opts?: GetEpochIndexAtOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getEpochIndexAt', [blockNumber], opts)
}

export type GetBatchAtOpts = HttpOptions
export function getBatchAt<R = number>(blockNumber: number, opts?: GetBatchAtOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getBatchAt', [blockNumber], opts)
}

export type GetBatchIndexAtOpts = HttpOptions
export function getBatchIndexAt<R = number>(blockNumber: number, opts?: GetBatchIndexAtOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getBatchIndexAt', [blockNumber], opts)
}

export type GetElectionBlockAfterOpts = HttpOptions
export function getElectionBlockAfter<R = number>(blockNumber: number, opts?: GetElectionBlockAfterOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getElectionBlockAfter', [blockNumber], opts)
}

export type GetElectionBlockBeforeOpts = HttpOptions
export function getElectionBlockBefore<R = number>(blockNumber: number, opts?: GetElectionBlockBeforeOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getElectionBlockBefore', [blockNumber], opts)
}

export type GetLastElectionBlockOpts = HttpOptions
export function getLastElectionBlock<R = number>(blockNumber: number, opts?: GetLastElectionBlockOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getLastElectionBlock', [blockNumber], opts)
}

export type IsElectionBlockAtOpts = HttpOptions
export function isElectionBlockAt<R = boolean>(blockNumber: number, opts?: IsElectionBlockAtOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('isElectionBlockAt', [blockNumber], opts)
}

export type GetMacroBlockAfterOpts = HttpOptions
export function getMacroBlockAfter<R = number>(blockNumber: number, opts?: GetMacroBlockAfterOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getMacroBlockAfter', [blockNumber], opts)
}

export type GetMacroBlockBeforeOpts = HttpOptions
export function getMacroBlockBefore<R = number>(blockNumber: number, opts?: GetMacroBlockBeforeOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getMacroBlockBefore', [blockNumber], opts)
}

export type GetLastMacroBlockOpts = HttpOptions
export function getLastMacroBlock<R = number>(blockNumber: number, opts?: GetLastMacroBlockOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getLastMacroBlock', [blockNumber], opts)
}

export type IsMacroBlockAtOpts = HttpOptions
export function isMacroBlockAt<R = boolean>(blockNumber: number, opts?: IsMacroBlockAtOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('isMacroBlockAt', [blockNumber], opts)
}

export type IsMicroBlockAtOpts = HttpOptions
export function isMicroBlockAt<R = boolean>(blockNumber: number, opts?: IsMicroBlockAtOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('isMicroBlockAt', [blockNumber], opts)
}

export type GetFirstBlockOfEpochOpts = HttpOptions
export function getFirstBlockOfEpoch<R = number>(epochIndex: number, opts?: GetFirstBlockOfEpochOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getFirstBlockOfEpoch', [epochIndex], opts)
}

export type GetBlockAfterReportingWindowOpts = HttpOptions
export function getBlockAfterReportingWindow<R = number>(blockNumber: number, opts?: GetBlockAfterReportingWindowOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getBlockAfterReportingWindow', [blockNumber], opts)
}

export type GetBlockAfterJailOpts = HttpOptions
export function getBlockAfterJail<R = number>(blockNumber: number, opts?: GetBlockAfterJailOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getBlockAfterJail', [blockNumber], opts)
}

export type GetFirstBlockOfBatchOpts = HttpOptions
export function getFirstBlockOfBatch<R = number>(batchIndex: number, opts?: GetFirstBlockOfBatchOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getFirstBlockOfBatch', [batchIndex], opts)
}

export type GetElectionBlockOfEpochOpts = HttpOptions
export function getElectionBlockOfEpoch<R = number>(epochIndex: number, opts?: GetElectionBlockOfEpochOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getElectionBlockOf', [epochIndex], opts)
}

export type GetMacroBlockOfBatchOpts = HttpOptions
export function getMacroBlockOfBatch<R = number>(batchIndex: number, opts?: GetMacroBlockOfBatchOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getMacroBlockOf', [batchIndex], opts)
}

export type GetFirstBatchOfEpochOpts = HttpOptions
export function getFirstBatchOfEpoch<R = number>(blockNumber: number, opts?: GetFirstBatchOfEpochOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getFirstBatchOfEpoch', [blockNumber], opts)
}

export type GetBlockchainStateOpts = HttpOptions
export function getBlockchainState<R = BlockchainState>(opts?: GetBlockchainStateOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getBlockchainState', [], opts)
}

export type GetSupplyAtOpts = HttpOptions
export function getSupplyAt<R = string>(blockNumber: number, opts?: GetSupplyAtOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getSupplyAt', [blockNumber], opts)
}

// #endregion

// #region Logs

export type GetLogOpts = HttpOptions
export function getLog<R = any[]>(fromBlock: number, toBlock: number, address?: string, types?: LogType[], opts?: GetLogOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getLog', [fromBlock, toBlock, address, types], opts)
}

export type GetLogByAddressOpts = HttpOptions
export function getLogByAddress<R = any[]>(address: string, fromBlock: number, toBlock: number, types?: LogType[], opts?: GetLogByAddressOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getLogByAddress', [address, fromBlock, toBlock, types], opts)
}

export type GetLogByTypesOpts = HttpOptions
export function getLogByTypes<R = any[]>(types: LogType[], fromBlock: number, toBlock: number, address?: string, opts?: GetLogByTypesOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('getLogByTypes', [types, fromBlock, toBlock, address], opts)
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

export type GetZkpStateOpts = HttpOptions
export async function getZkpState<R = ZKPState>(opts?: GetZkpStateOpts): Promise<HttpRpcResult<R>> {
  const result = await rpcCall<ZKPStateKebab>('getZkpState', [], opts)

  if (result.error) {
    return result as unknown as Promise<HttpRpcResult<R>>
  }
  else {
    return {
      ...result,
      data: {
        latestHeaderNumber: result.data!['latest-header-number'],
        latestBlockNumber: result.data!['latest-block-number'],
        latestProof: result.data!['latest-proof'],
      } as R,
    }
  }
}

export interface ImportKeyParams { keyData: string, passphrase?: string }
export interface UnlockAccountParams { passphrase?: string, duration?: number }
export interface CreateAccountParams { passphrase?: string }
export interface SignParams { message: string, address: string, passphrase: string, isHex: boolean }
export interface VerifySignatureParams { message: string, publicKey: string, signature: Signature, isHex: boolean }

export type ImportRawKeyOpts = HttpOptions
export function importRawKey<R = string>({ keyData, passphrase }: ImportKeyParams, opts?: ImportRawKeyOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('importRawKey', [keyData, passphrase], opts)
}

export type IsAccountImportedOpts = HttpOptions
export function isAccountImported<R = boolean>(address: string, opts?: IsAccountImportedOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('isAccountImported', [address], opts)
}

export type ListAccountsOpts = HttpOptions
export function listAccounts<R = string[]>(opts?: ListAccountsOpts): Promise<HttpRpcResult<R>> {
  return rpcCall<R>('listAccounts', [], opts)
}
