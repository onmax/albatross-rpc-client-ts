import { ZKPState } from "../types/common";
import { Client } from "../client/client";
import { MaybeResponse } from "../types/rpc-messages";

export class ZkpComponentClient extends Client {
    constructor(url: URL) {
        super(url);
    }

    public async getZkpState(): Promise<MaybeResponse<ZKPState>> {
        const { data, error } = await this.call("getZkpState", []);
        if (error) {
            return { error, data };
        } else {
            return { 
                error,
                data: {
                    latestHeaderHash: data['latest-header-number'],
                    latestBlockNumber: data['latest-block-number'],
                    latestProof: data['latest-proof'],
                } as ZKPState
            };
        }
    }
}