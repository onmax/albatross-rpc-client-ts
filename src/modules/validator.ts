import { Address } from "types/common";
import { DEFAULT_OPTIONS, HttpClient } from "../client/http";

type SetAutomaticReactivationParams = { automaticReactivation: boolean };

export class ValidatorClient extends HttpClient {
    /**
     * Returns our validator address.
     */
    public async getAddress(options = DEFAULT_OPTIONS) {
        const req = { method: 'getAddress', params: [] }
        return super.call<Address, typeof req>(req, options)
    }

    /**
     * Returns our validator signing key
     */
    public async getSigningKey(options = DEFAULT_OPTIONS) {
        const req = { method: 'getSigningKey', params: [] }
        return super.call<String, typeof req>(req, options)
    }

    /**
     * Returns our validator voting key
    */
    public async getVotingKey(options = DEFAULT_OPTIONS) {
        const req = { method: 'getVotingKey', params: [] }
        return super.call<String, typeof req>(req, options)
    }

    /**
     * Updates the configuration setting to automatically reactivate our validator
    */
    public async setAutomaticReactivation({ automaticReactivation }: SetAutomaticReactivationParams, options = DEFAULT_OPTIONS) {
        const req = { method: 'setAutomaticReactivation', params: [automaticReactivation] }
        return super.call<null, typeof req>(req, options)
    }
}
