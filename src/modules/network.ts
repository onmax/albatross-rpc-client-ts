import { Auth } from "src/types/common";
import { DEFAULT_OPTIONS, HttpClient } from "../client/http";

export class NetworkClient extends HttpClient {
    constructor(url: URL, auth?: Auth) {
        super(url, auth)
    }

    /**
     * The peer ID for our local peer.
     */
    public async getPeerId(options = DEFAULT_OPTIONS) {
        return super.call<string>({ method: 'getPeerId' }, options)
    }

    /**
     * Returns the number of peers. 
     */
    public async getPeerCount(options = DEFAULT_OPTIONS) {
        return super.call<number>({ method: 'getPeerCount' }, options)
    }

    /**
     * Returns a list with the IDs of all our peers.
     */
    public async getPeerList(options = DEFAULT_OPTIONS) {
        return super.call<string[]>({ method: 'getPeerList' }, options)
    }
}
