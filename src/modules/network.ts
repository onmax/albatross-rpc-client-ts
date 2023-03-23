import { Client } from "../client/client";
import { DEFAULT_OPTIONS } from "../client/http";
import { MaybeCallResponse } from "../types/rpc-messages";

export class NetworkClient extends Client {
    constructor(url: URL) {
        super(url);
    }

    /**
     * The peer ID for our local peer.
     */
    public async getPeerId(options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<String>> {
        return this.call("getPeerId", [], options);
    }

    /**
     * Returns the number of peers. 
     */
    public async getPeerCount(options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<number>> {
        return this.call("getPeerCount", [], options);
    }

    /**
     * Returns a list with the IDs of all our peers.
     */
    public async getPeerList(options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<String[]>> {
        return this.call("getPeerList", [], options);
    }
}