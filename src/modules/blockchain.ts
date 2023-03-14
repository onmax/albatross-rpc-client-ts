import { RpcClient } from "./client";

export class BlockchainClient extends RpcClient {
    constructor(url: string) {
        super(url);
    }

    public async getActiveValidators() {
        return this.call("getActiveValidators", []);
    }
}