import { Validator, PolicyConstants, Validato } from "./common"
import { BlockchainMethods, PolicyMethods } from "./modules"

type MethodConfig<Params extends any[], Result, Metadata> = {
    // In the request
    params: Params

    // In the response
    result: Result
    metadata: Metadata
}

export type PolicyMethods = {
    'getPolicyConstants': MethodConfig<[], PolicyConstants, null>,
}

export type BlockchainMethods = {
    'getActiveValidators': MethodConfig<[], Validator[], BlockMetadatas>,
}