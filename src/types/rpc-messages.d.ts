import { PolicyMethods, BlockchainMethods } from "./modules";

export type Methods = PolicyMethods & BlockchainMethods
export type MethodName = keyof Methods

export type RpcRequest<M extends MethodName> = {
    jsonrpc: string,
    method: M,
    params: Methods[M]['params'],
    id: number
}

export type RpcResponseResult<M extends MethodName> = {
    data: Methods[M]['result'];
    metadata: Methods[M]['metadata'];
} & {}

export type RpcResponse<M extends MethodName> = {
    jsonrpc: string,
    result: RpcResponseResult<M>
    id: number
}
