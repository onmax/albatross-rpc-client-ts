import { RpcClient } from "./client";

export class ZkpComponentClient extends RpcClient {
    constructor(url: URL) {
        super(url);
    }

    public async getZKPState() {
        return this.call("getZKPState", []);
    }
}