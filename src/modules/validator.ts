import { Address, Auth } from "../types/common";
import { DEFAULT_OPTIONS, HttpClient } from "../client/http";

type SetAutomaticReactivationParams = { automaticReactivation: boolean };

export class ValidatorClient extends HttpClient {
    constructor(url: URL, auth?: Auth) {
        super(url, auth)
    }

    /**
     * Returns our validator address.
     */
    public async getAddress(options = DEFAULT_OPTIONS) {
        return super.call<Address>({ method: 'getAddress' }, options)
    }

    /**
     * Returns our validator signing key
     */
    public async getSigningKey(options = DEFAULT_OPTIONS) {
        return super.call<String>({ method: 'getSigningKey' }, options)
    }

    /**
     * Returns our validator voting key
    */
    public async getVotingKey(options = DEFAULT_OPTIONS) {
        return super.call<String>({ method: 'getVotingKey' }, options)
    }

    /**
     * Updates the configuration setting to automatically reactivate our validator
    */
    public async setAutomaticReactivation({ automaticReactivation }: SetAutomaticReactivationParams, options = DEFAULT_OPTIONS) {
        return super.call<null>({ method: 'setAutomaticReactivation', params: [automaticReactivation] }, options)
    }
}
