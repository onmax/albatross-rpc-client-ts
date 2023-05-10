import { DEFAULT_OPTIONS, HttpClient } from "../client/http";
import { Address } from "../types/common";

type SetAutomaticReactivationParams = { automaticReactivation: boolean };

export class ValidatorClient {
    private client: HttpClient;

    constructor(http: HttpClient) {
        this.client = http;
    }

    /**
     * Returns our validator address.
     */
    public async getAddress(options = DEFAULT_OPTIONS) {
        return this.client.call<Address>({ method: 'getAddress' }, options)
    }

    /**
     * Returns our validator signing key
     */
    public async getSigningKey(options = DEFAULT_OPTIONS) {
        return this.client.call<String>({ method: 'getSigningKey' }, options)
    }

    /**
     * Returns our validator voting key
    */
    public async getVotingKey(options = DEFAULT_OPTIONS) {
        return this.client.call<String>({ method: 'getVotingKey' }, options)
    }

    /**
     * Updates the configuration setting to automatically reactivate our validator
    */
    public async setAutomaticReactivation({ automaticReactivation }: SetAutomaticReactivationParams, options = DEFAULT_OPTIONS) {
        return this.client.call<null>({ method: 'setAutomaticReactivation', params: [automaticReactivation] }, options)
    }
}
