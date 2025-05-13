import type { Block, CreateStakerLog, CreateValidatorLog, DeactivateValidatorLog, DeleteStakerLog, DeleteValidatorLog, FailedTransactionLog, HtlcCreateLog, HtlcEarlyResolveLog, HtlcRegularTransferLog, HtlcTimeoutResolveLog, JailValidatorLog, Log, LogType, PayFeeLog, PayoutRewardLog, PenalizeLog, ReactivateValidatorLog, RemoveStakeLog, RetireStakeLog, RetireValidatorLog, RevertContractLog, SetActiveStakeLog, StakeLog, StakerFeeDeductionLog, TransferLog, UpdateStakerLog, UpdateValidatorLog, Validator, ValidatorFeeDeductionLog, VestingCreateLog } from './types'
import WebSocket from 'isomorphic-ws'
import { __getBaseUrl } from './config'

/**
 * Stream options and defaults
 */
export interface StreamOptions<T = unknown> {
  once?: boolean
  filter?: (data: T) => boolean
  timeout?: number | false
  autoReconnect?: boolean | {
    retries?: number | (() => boolean)
    delay?: number
    onFailed?: () => void
  }
  onError?: (error: Error) => void
  withMetadata?: boolean
}

/**
 * Events emitted by WSSubscription
 */
export interface WSEvents<T> {
  open: Event
  data: CustomEvent<{ data: T, metadata?: unknown }>
  error: CustomEvent<Error>
  close: CustomEvent<{ code: number, reason: string }> | Event
}

/**
 * A WebSocket subscription as an EventTarget
 */
export interface WSSubscription<T> extends EventTarget {
  /** Returns the JSON-RPC subscription ID */
  getId: () => number
  /** Whether the socket is currently open */
  isOpen: () => boolean
  /** RPC method & params used */
  context: {
    method: string
    params: any[]
    url: string
    timestamp: number
  }

  // Override EventTarget methods with typed versions
  addEventListener: <K extends keyof WSEvents<T>>(
    type: K,
    listener: (ev: WSEvents<T>[K]) => void,
    options?: boolean | AddEventListenerOptions
  ) => void
  removeEventListener: <K extends keyof WSEvents<T>>(
    type: K,
    listener: (ev: WSEvents<T>[K]) => void,
    options?: boolean | EventListenerOptions
  ) => void
}

const DEFAULT_TIMEOUT = 30_000
const DEFAULT_RECONNECT = { retries: 3, delay: 1_000, onFailed: () => { } }

export async function rpcSubscribe<T>(method: string, params: any[] = [], options: StreamOptions<T> = {}): Promise<WSSubscription<T>> {
  const baseUrl = __getBaseUrl()
  const wsUrl = new URL(baseUrl.toString())
  wsUrl.protocol = wsUrl.protocol.replace(/^http/, 'ws')
  wsUrl.pathname = '/ws'

  const { once, filter, timeout = DEFAULT_TIMEOUT, autoReconnect = DEFAULT_RECONNECT, onError } = options

  let ws: WebSocket | null = null
  let open = false
  let closed = false
  let idCounter = 1
  let reconnects = 0
  let subscriptionId = 0
  const pending = new Map<number, { resolve: (val: any) => void, reject: (err: any) => void }>()

  // Create our EventTarget
  const emitter = new EventTarget() as WSSubscription<T>

  emitter.getId = () => subscriptionId
  emitter.isOpen = () => open
  emitter.context = { method, params, url: wsUrl.href.split('?')[0], timestamp: Date.now() }

  function scheduleReconnect(): void {
    const settings = typeof autoReconnect === 'boolean' ? DEFAULT_RECONNECT : { ...DEFAULT_RECONNECT, ...autoReconnect }
    const { retries, delay, onFailed: failCb } = settings
    const canRetry = typeof retries === 'number' ? retries < 0 || reconnects < retries : retries()
    if (canRetry) {
      reconnects++
      ws = null
      setTimeout(() => {
        rpcSubscribe<T>(method, params, options)
          .then((newSub) => {
            // proxy events from new subscription
            newSub.addEventListener('open', e => emitter.dispatchEvent(e))
            newSub.addEventListener('data', e => emitter.dispatchEvent(e))
            newSub.addEventListener('error', e => emitter.dispatchEvent(e))
            newSub.addEventListener('close', e => emitter.dispatchEvent(e))
          })
          .catch(err => onError?.(err))
      }, delay)
    }
    else {
      failCb?.()
    }
  }

  function handleError(err: Error): void {
    onError?.(err)
    emitter.dispatchEvent(new CustomEvent('error', { detail: err }))
  }

  async function handleMessage(raw: any): Promise<void> {
    try {
      // eslint-disable-next-line node/prefer-global/buffer
      const Buffer = typeof window === 'undefined' ? (await import('node:buffer')).Buffer : globalThis.Buffer

      if (raw instanceof Blob)
        raw = await raw.arrayBuffer().then(buffer => new TextDecoder().decode(buffer))
      else if (raw instanceof ArrayBuffer)
        raw = new TextDecoder().decode(raw)
      else if (raw instanceof Buffer)
        raw = raw.toString()

      if (raw instanceof ArrayBuffer) {
        if (typeof TextDecoder !== 'undefined') {
          raw = new TextDecoder().decode(raw)
        }
        else {
          const { Buffer } = await import('node:buffer')
          raw = Buffer.from(raw as ArrayBuffer).toString()
        }
      }

      const msg = JSON.parse(raw)

      // Handle subscription notifications
      // The format is: { jsonrpc: "2.0", method: "subscribeForX", params: { subscription: id, result: { data, metadata } } }
      if (msg.method && msg.params && msg.params.subscription && msg.params.result) {
        const { data: payload, metadata: meta } = msg.params.result

        // Format the payload based on the subscription method
        let formattedPayload = payload

        // If this is a subscribeForHeadBlockHash response, ensure it's an array
        if (msg.method === 'subscribeForHeadBlockHash' && typeof payload === 'string') {
          formattedPayload = [payload]
        }

        if (!filter || filter(formattedPayload)) {
          emitter.dispatchEvent(new CustomEvent('data', { detail: { data: formattedPayload, metadata: meta } }))
          if (once)
            close()
        }
        return
      }

      // response to subscribe call - format: { jsonrpc: "2.0", id: X, result: Y }
      if ('id' in msg && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id)!
        if (msg.error) {
          reject(msg.error)
        }
        else {
          resolve(msg.result)
        }
        pending.delete(msg.id)
      }
    }
    catch (e) {
      handleError(e as Error)
    }
  }

  function connect(): Promise<void> {
    return new Promise((resolve) => {
      if (!ws) {
        ws = new WebSocket(wsUrl.href)
        ws.onopen = () => {
          open = true
          reconnects = 0
          emitter.dispatchEvent(new Event('open'))
          resolve()
        }
        ws.onmessage = ({ data }) => handleMessage(data)
        ws.onerror = e => handleError(new Error(String(e)))
        ws.onclose = (ev) => {
          open = false
          emitter.dispatchEvent(new CustomEvent('close', { detail: { code: ev.code, reason: ev.reason } }))
          if (!closed && autoReconnect)
            scheduleReconnect()
        }
      }
      else if (open) {
        resolve()
      }
    })
  }

  async function sendRequest(): Promise<number> {
    await connect()
    return new Promise<number>((res, rej) => {
      const id = idCounter++
      const payload = { jsonrpc: '2.0', id, method, params }
      let timer: ReturnType<typeof setTimeout>
      if (timeout !== false) {
        timer = setTimeout(() => {
          pending.delete(id)
          rej(new Error(`Timeout after ${timeout}ms`))
        }, timeout)
      }

      pending.set(id, {
        resolve: (val) => {
          clearTimeout(timer)
          res(val)
        },
        reject: (err) => {
          clearTimeout(timer)
          rej(err)
        },
      })
      ws?.send(JSON.stringify(payload))
    })
  }

  function close(): void {
    closed = true
    ws?.close()
    pending.clear()
    emitter.dispatchEvent(new Event('close'))
  }

  // initiate subscription
  await connect()
  subscriptionId = await sendRequest()

  return emitter
}

/**
 * Subscribe to new block events (retrieves the full block)
 */
export function subscribeForHeadBlock(fullBlock: boolean = false, opts?: StreamOptions<Block>): Promise<WSSubscription<Block>> {
  return rpcSubscribe<Block>('subscribeForHeadBlock', [fullBlock], opts)
}

/**
 * Subscribe to new block events (only retrieves the block hash)
 */
export function subscribeForHeadBlockHash(opts?: StreamOptions<string[]>): Promise<WSSubscription<string[]>> {
  return rpcSubscribe<string[]>('subscribeForHeadBlockHash', [], opts)
}

/**
 * Maps LogType to corresponding log interface
 */
export interface LogTypeMap {
  [LogType.PayFee]: PayFeeLog
  [LogType.Transfer]: TransferLog
  [LogType.HtlcCreate]: HtlcCreateLog
  [LogType.HtlcTimeoutResolve]: HtlcTimeoutResolveLog
  [LogType.HtlcRegularTransfer]: HtlcRegularTransferLog
  [LogType.HtlcEarlyResolve]: HtlcEarlyResolveLog
  [LogType.VestingCreate]: VestingCreateLog
  [LogType.CreateValidator]: CreateValidatorLog
  [LogType.UpdateValidator]: UpdateValidatorLog
  [LogType.ValidatorFeeDeduction]: ValidatorFeeDeductionLog
  [LogType.DeactivateValidator]: DeactivateValidatorLog
  [LogType.ReactivateValidator]: ReactivateValidatorLog
  [LogType.RetireValidator]: RetireValidatorLog
  [LogType.DeleteValidator]: DeleteValidatorLog
  [LogType.CreateStaker]: CreateStakerLog
  [LogType.Stake]: StakeLog
  [LogType.UpdateStaker]: UpdateStakerLog
  [LogType.SetActiveStake]: SetActiveStakeLog
  [LogType.RetireStake]: RetireStakeLog
  [LogType.RemoveStake]: RemoveStakeLog
  [LogType.DeleteStaker]: DeleteStakerLog
  [LogType.StakerFeeDeduction]: StakerFeeDeductionLog
  [LogType.PayoutReward]: PayoutRewardLog
  [LogType.Penalize]: PenalizeLog
  [LogType.JailValidator]: JailValidatorLog
  [LogType.RevertContract]: RevertContractLog
  [LogType.FailedTransaction]: FailedTransactionLog
}

/**
 * Helper type to extract log type from LogType array
 */
export type LogTypeToInterface<T extends LogType[]> = T extends (infer U)[]
  ? U extends LogType
    ? LogTypeMap[U]
    : never
  : never

/**
 * Subscribe to log events related to given addresses and log types
 */
export function subscribeForLogsByAddressesAndTypes<T extends LogType[] = []>(
  addresses: string[] = [],
  logTypes: T = [] as unknown as T,
  opts?: StreamOptions<T extends [] ? Log : LogTypeToInterface<T>>,
): Promise<WSSubscription<T extends [] ? Log : LogTypeToInterface<T>>> {
  return rpcSubscribe<T extends [] ? Log : LogTypeToInterface<T>>(
    'subscribeForLogsByAddressesAndTypes',
    [addresses, logTypes],
    opts,
  )
}

/**
 * Subscribe to validator election events by address
 */
export function subscribeForValidatorElectionByAddress(
  address: string,
  opts?: StreamOptions<Validator[]>,
): Promise<WSSubscription<Validator[]>> {
  return rpcSubscribe<Validator[]>('subscribeForValidatorElectionByAddress', [address], opts)
}
