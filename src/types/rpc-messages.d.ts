import { PolicyMethods, BlockchainMethods, ConsensusMethods, MempoolMethods, NetworkMethods, ValidatorMethods, WalletMethods, ZkpComponentMethods, BlockchainStreams } from "./modules";

export type Interactions = PolicyMethods & BlockchainMethods & BlockchainStreams & ConsensusMethods & MempoolMethods & NetworkMethods & ValidatorMethods & WalletMethods & ZkpComponentMethods
export type InteractionName = keyof Interactions

export type RpcRequest<M extends InteractionName> = {
    jsonrpc: string,
    method: M,
    params: Interactions[M]['params'],
    id: number
}

export type RpcResponseResult<M extends InteractionName> = {
    data: Interactions[M]['result'];
    metadata: Interactions[M]['metadata'];
} & {}

export type RpcResponse<M extends InteractionName> = {
    jsonrpc: string,
    result: RpcResponseResult<M>
    id: number
}

export type RpcResponseError = {
    jsonrpc: string,
    error: {
        code: number,
        message: string,
        data: string
    }
    id: number
}
