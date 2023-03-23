import { Client } from "../client/client";
import { DEFAULT_OPTIONS } from "../client/http";
import { MaybeCallResponse } from "../types/rpc-messages";

type SetAutomaticReactivationParams = { automaticReactivation: boolean };

export class ValidatorClient extends Client {
    constructor(url: URL) {
        super(url);
    }

    /**
     * Returns our validator address.
     */
    public async getAddress(options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<String>> {
        return this.call("getAddress", [], options);
    }

    /**
     * Returns our validator signing key
     */
    public async getSigningKey(options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<String>> {
        return this.call("getSigningKey", [], options);
    }

    /**
     * Returns our validator voting key
     */
    public async getVotingKey(options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<String>> {
        return this.call("getVotingKey", [], options);
    }

    /**
     * Updates the configuration setting to automatically reactivate our validator
     */
    public async setAutomaticReactivation({ automaticReactivation }: SetAutomaticReactivationParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<null>> {
        return this.call("setAutomaticReactivation", [automaticReactivation], options);
    }
}