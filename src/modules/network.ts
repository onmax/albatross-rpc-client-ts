import { DEFAULT_OPTIONS, HttpClient } from "../client/http";

export class NetworkClient extends HttpClient {
    /**
     * The peer ID for our local peer.
     */
    public async getPeerId(options = DEFAULT_OPTIONS) {
        const req = { method: 'getPeerId', params: [] }
        return super.call<string, typeof req>(req, options)
    }

    /**
     * Returns the number of peers. 
     */
    public async getPeerCount(options = DEFAULT_OPTIONS) {
        const req = { method: 'getPeerCount', params: [] }
        return super.call<number, typeof req>(req, options)
    }

    /**
     * Returns a list with the IDs of all our peers.
     */
    public async getPeerList(options = DEFAULT_OPTIONS) {
        const req = { method: 'getPeerList', params: [] }
        return super.call<string[], typeof req>(req, options)
    }
}
