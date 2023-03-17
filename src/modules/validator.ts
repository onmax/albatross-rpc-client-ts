import { Client } from "../client/client";

type SetAutomaticReactivationParams = { automaticReactivation: boolean };

export class ValidatorClient extends Client {
    constructor(url: URL) {
        super(url);
    }

    /**
     * Returns our validator address.
     */
    public async getAddress(): Promise<String> {
        return this.call("getAddress", []);
    }

    /**
     * Returns our validator signing key
     */
    public async getSigningKey(): Promise<String> {
        return this.call("getSigningKey", []);
    }

    /**
     * Returns our validator voting key
     */
    public async getVotingKey(): Promise<String> {
        return this.call("getVotingKey", []);
    }

    /**
     * Updates the configuration setting to automatically reactivate our validator
     */
    public async setAutomaticReactivation({ automaticReactivation }: SetAutomaticReactivationParams): Promise<null> {
        return this.call("setAutomaticReactivation", [automaticReactivation]);
    }
}