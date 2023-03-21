import { ZKPState } from "../types/common";
import { Client } from "../client/client";
import { ContextCall, MaybeResponse } from "../types/rpc-messages";

export class ZkpComponentClient extends Client {
    constructor(url: URL) {
        super(url);
    }

    public async getZkpState(): Promise<MaybeResponse<ZKPState>> {
        const { data, error, context } = await this.call("getZkpState", []);
        if (error) {
            return { error, data, context };
        } else {
            return { 
                error,
                data: {
                    latestHeaderHash: data['latest-header-number'],
                    latestBlockNumber: data['latest-block-number'],
                    latestProof: data['latest-proof'],
                } as ZKPState,
                context
            };
        }
    }
}