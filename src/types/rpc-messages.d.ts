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
