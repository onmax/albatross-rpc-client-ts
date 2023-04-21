import { Transaction } from "./common";
import { PolicyMethods, BlockchainMethods, ConsensusMethods, MempoolMethods, NetworkMethods, ValidatorMethods, StreamOpened, WalletMethods, ZkpComponentMethods, BlockchainStreams } from "./modules";

// export type Methods = PolicyMethods & BlockchainMethods & ConsensusMethods & MempoolMethods & NetworkMethods & ValidatorMethods & WalletMethods & ZkpComponentMethods & StreamOpened
export type Methods = PolicyMethods & BlockchainMethods & ConsensusMethods & MempoolMethods & NetworkMethods & ValidatorMethods & WalletMethods & ZkpComponentMethods & StreamOpened
export type MethodName = keyof Methods

export type Streams = BlockchainStreams
export type StreamName = keyof Streams

type Interaction = Methods & Streams
type InteractionName = keyof Interaction

export type RpcRequest<M extends InteractionName> = {
    jsonrpc: string,
    method: M,
    params: Interaction[M]['params'],
    id: number
}

export type MethodResponsePayload<M extends Methods> = {
    data: M['result'];
    metadata: M['metadata'];
} & {}

export type MethodResponseContent<M extends MethodName, WithMetadata extends boolean> = 
    M extends 'streamOpened'
        ? number :
        WithMetadata extends true
            ? MethodResponsePayload<Methods[M]>
            : MethodResponsePayload<Methods[M]>["data"]

export type MethodResponse<M extends MethodName> = {
    jsonrpc: string,
    result: MethodResponseContent<M>,
    id: number
}

export type StreamResponsePayload<S extends Streams> = {
    data: S['result'];
    metadata: S['metadata'];
} & {}

export type StreamResponse<S extends StreamName> = {
    jsonrpc: string,
    method: S,
    params: {
        subscription: number,
        result: StreamResponsePayload<Streams[S]>
    }
}

export type MethodResponseError = {
    jsonrpc: string,
    error: {
        code: number,
        message: string,
        data: string
    }
    id: number
}

export type ErrorCallReturn = {
    code: number,
    message: string,
}

export type ContextRequest = {
    method: string,
    params: RpcRequest<T>['params'],
    id: number,
    timestamp: number
}

export type MaybeCallResponse<T> = {
    error: ErrorCallReturn,
    data: undefined
    context: ContextRequest
} | {
    error: undefined,
    data: T,
    context: ContextRequest
}

export type CallOptions = {
    timeout?: number // in ms
}

export type SendTxCallOptions = CallOptions & ({
    waitForConfirmationTimeout?: number, // in ms
})

export type ErrorStreamReturn = {
    code: number,
    message: string,
}

// export type MaybeStreamResponse<T extends StreamName, ShowMetadata extends boolean | undefined = false, IncludeBody extends boolean = false> = {
export type MaybeStreamResponse<T extends CallbackParam> = {
    error: ErrorStreamReturn,
    data: undefined
} | {
    error: undefined,
    data: T,
}

export type CallbackParam<T extends StreamName, ShowMetadata extends boolean | undefined = false, IncludeBody extends boolean = false> =
    T extends 'subscribeForHeadBlock'
        ? IncludeBody extends true
            ? Block
            : PartialBlock
        : ShowMetadata extends true
            ? StreamResponse<T>['params']['result']
            : StreamResponse<T>['params']['result']['data']

export type FilterStreamFn<T extends StreamName> = (data: Streams[T]["result"]) => boolean;

// Only withMetadata if T extends subscribeForValidatorElectionByAddress or subscribeForLogsByAddressesAndTypes

export type StreamOptions<T extends StreamName = any> = {
    once: boolean,
    filter?: FilterStreamFn<T>,
    // timeout: number, TODO
} & (
    T extends 'subscribeForValidatorElectionByAddress' | 'subscribeForLogsByAddressesAndTypes'
        ? { withMetadata: boolean }
        : {}
);

export type TxLog = { tx: Transaction, log?: BlockLog, hash: Hash }