import { RpcClient } from "./client";

type SetAutomaticReactivationParams = { automaticReactivation: boolean };

export class ValidatorClient extends RpcClient {
    constructor(url: URL) {
        super(url);
    }

    /**
     * Returns our validator address.
     */
    public async getAddress() {
        return this.call("getAddress", []);
    }

    /**
     * Returns our validator signing key
     */
    public async getSigningKey() {
        return this.call("getSigningKey", []);
    }

    /**
     * Returns our validator voting key
     */
    public async getVotingKey() {
        return this.call("getVotingKey", []);
    }

    /**
     * Updates the configuration setting to automatically reactivate our validator
     */
    public async setAutomaticReactivation({ automaticReactivation }: SetAutomaticReactivationParams) {
        return this.call("setAutomaticReactivation", [automaticReactivation]);
    }
}