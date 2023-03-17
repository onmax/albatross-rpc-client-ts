import { ZKPState } from "../types/common";
import { RpcClient } from "./client";

export class ZkpComponentClient extends RpcClient {
    constructor(url: URL) {
        super(url);
    }

    public async getZkpState(): Promise<ZKPState> {
        return this.call("getZkpState", []).then(d => ({
                latestHeaderHash: d['latest-header-number'],
                latestBlockNumber: d['latest-block-number'],
                latestProof: d['latest-proof'],
            })
        );
    }
}