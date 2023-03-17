import { Client } from "../client/client";

export class NetworkClient extends Client {
    constructor(url: URL) {
        super(url);
    }

    /**
     * The peer ID for our local peer.
     */
    public async getPeerId(): Promise<String> {
        return this.call("getPeerId", []);
    }

    /**
     * Returns the number of peers. 
     */
    public async getPeerCount(): Promise<number> {
        return this.call("getPeerCount", []);
    }

    /**
     * Returns a list with the IDs of all our peers.
     */
    public async getPeerList(): Promise<String[]> {
        return this.call("getPeerList", []);
    }
}