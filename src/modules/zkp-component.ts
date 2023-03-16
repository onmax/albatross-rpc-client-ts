import { RpcClient } from "./client";

export class ZkpComponentClient extends RpcClient {
    constructor(url: URL) {
        super(url);
    }

    public async getZKPState(): Promise<String> {
        return this.call("getZKPState", []);
    }
}