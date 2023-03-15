import { RpcClient } from "./client";

export class ValidatorClient extends RpcClient {
    constructor(url: string) {
        super(url);
    }

    // 'getAddress': MethodConfig<[], Address, null>,
    // 'getSigningKey': MethodConfig<[], String, null>,
    // 'getVotingKey': MethodConfig<[], String, null>,
    // 'setAutomaticReactivation': MethodConfig<[/* automatic_reactivation */Boolean], null, null>,

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
    public async setAutomaticReactivation(automatic_reactivation: boolean) {
        return this.call("setAutomaticReactivation", [automatic_reactivation]);
    }
}