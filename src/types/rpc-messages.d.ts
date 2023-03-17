import { PolicyMethods, BlockchainMethods, ConsensusMethods, MempoolMethods, NetworkMethods, ValidatorMethods, WalletMethods, ZkpComponentMethods, BlockchainStreams } from "./modules";

export type Methods = PolicyMethods & BlockchainMethods & ConsensusMethods & MempoolMethods & NetworkMethods & ValidatorMethods & WalletMethods & ZkpComponentMethods
export type MethodName = keyof Methods

export type Streams = BlockchainStreams
export type StreamName = keyof Streams

export type RpcRequest<M extends InteractionName> = {
    jsonrpc: string,
    method: M,
    params: Interactions[M]['params'],
    id: number
}

export type ResponsePayload<M extends Methods, Streams> = {
    data: M['result'];
    metadata: M['metadata'];
} & {}

export type MethodResponse<M extends MethodName> = {
    jsonrpc: string,
    result: ResponsePayload<Methods[M]>
    id: number
}

export type StreamResponse<M extends StreamName> = {
    jsonrpc: string,
    method: M,
    params: {
        subscription: number,
        result: ResponsePayload<Streams[M]>
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
