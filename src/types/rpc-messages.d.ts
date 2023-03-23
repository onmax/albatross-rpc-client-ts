import { PolicyMethods, BlockchainMethods, ConsensusMethods, MempoolMethods, NetworkMethods, ValidatorMethods, WalletMethods, ZkpComponentMethods, BlockchainStreams } from "./modules";

export type Methods = PolicyMethods & BlockchainMethods & ConsensusMethods & MempoolMethods & NetworkMethods & ValidatorMethods & WalletMethods & ZkpComponentMethods & StreamOpened
export type MethodName = keyof Methods

export type Streams = BlockchainStreams
export type StreamName = keyof Streams

export type RpcRequest<M extends InteractionName> = {
    jsonrpc: string,
    method: M,
    params: Interactions[M]['params'],
    id: number
}

export type MethodResponsePayload<M extends Methods> = {
    data: M['result'];
    metadata: M['metadata'];
} & {}

export type MethodResponse<M extends MethodName> = {
    jsonrpc: string,
    result: M extends 'streamOpened' ? number : MethodResponsePayload<Methods[M]>,
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
    params: (string | number | boolean | null)[],
    id: number,
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
    timeout: number
}

export type ErrorStreamReturn = {
    code: number,
    message: string,
}

export type MaybeStreamResponse<T extends StreamName, ShowMetadata extends boolean | undefined = false, IncludeBody extends boolean = false> = {
    error: ErrorStreamReturn,
    data: undefined
} | {
    error: undefined,
    data: CallbackParam<T, ShowMetadata, IncludeBody>,
}

export type CallbackParam<T extends StreamName, ShowMetadata extends boolean | undefined = false, IncludeBody extends boolean = false> =
    T extends 'subscribeForHeadBlock'
        ? IncludeBody extends true
            ? Block
            : PartialBlock
        : ShowMetadata extends true
            ? StreamResponse<T>['params']['result']
            : StreamResponse<T>['params']['result']['data']


export type StreamOptions = {
    once: boolean,
    // timeout: number, TODO
}