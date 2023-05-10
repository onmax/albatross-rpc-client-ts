import { DEFAULT_OPTIONS, HttpClient } from "../client/http";

export class NetworkClient {
    private client: HttpClient;

    constructor(http: HttpClient) {
        this.client = http;
    }

    /**
     * The peer ID for our local peer.
     */
    public async getPeerId(options = DEFAULT_OPTIONS) {
        return this.client.call<string>({ method: 'getPeerId' }, options)
    }

    /**
     * Returns the number of peers. 
     */
    public async getPeerCount(options = DEFAULT_OPTIONS) {
        return this.client.call<number>({ method: 'getPeerCount' }, options)
    }

    /**
     * Returns a list with the IDs of all our peers.
     */
    public async getPeerList(options = DEFAULT_OPTIONS) {
        return this.client.call<string[]>({ method: 'getPeerList' }, options)
    }
}
