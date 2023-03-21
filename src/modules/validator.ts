import { Client } from "../client/client";
import { MaybeResponse } from "../types/rpc-messages";

type SetAutomaticReactivationParams = { automaticReactivation: boolean };

export class ValidatorClient extends Client {
    constructor(url: URL) {
        super(url);
    }

    /**
     * Returns our validator address.
     */
    public async getAddress(): Promise<MaybeResponse<String>> {
        return this.call("getAddress", []);
    }

    /**
     * Returns our validator signing key
     */
    public async getSigningKey(): Promise<MaybeResponse<String>> {
        return this.call("getSigningKey", []);
    }

    /**
     * Returns our validator voting key
     */
    public async getVotingKey(): Promise<MaybeResponse<String>> {
        return this.call("getVotingKey", []);
    }

    /**
     * Updates the configuration setting to automatically reactivate our validator
     */
    public async setAutomaticReactivation({ automaticReactivation }: SetAutomaticReactivationParams): Promise<MaybeResponse<null>> {
        return this.call("setAutomaticReactivation", [automaticReactivation]);
    }
}