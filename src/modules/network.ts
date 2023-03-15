import { RpcClient } from "./client";

export class NetworkClient extends RpcClient {
    constructor(url: string) {
        super(url);
    }

    /**
     * The peer ID for our local peer.
     */
    public async getPeerId() {
        return this.call("getPeerId", []);
    }

    /**
     * Returns the number of peers. 
     */
    public async getPeerCount() {
        return this.call("getPeerCount", []);
    }

    /**
     * Returns a list with the IDs of all our peers.
     */
    public async getPeerList() {
        return this.call("getPeerList", []);
    }
}