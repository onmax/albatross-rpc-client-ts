import { RpcClient } from "./client";

export class PolicyClient extends RpcClient {
    constructor(url: string) {
        super(url);
    }

    public async getPolicyConstants() {
        return this.call("getPolicyConstants", []);
    }
}