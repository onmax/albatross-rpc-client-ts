import { DEFAULT_OPTIONS, HttpClient } from "../client/http";
import { BlockNumber, Hash } from "../types/common";

type ZKPStateKebab = {
    'latest-header-number': Hash
    'latest-block-number': BlockNumber
    'latest-proof'?: string
}

export class ZkpComponentClient {
    private client: HttpClient;

    constructor(http: HttpClient) {
        this.client = http;
    }

    /**
     * Returns the latest header number, block number and proof
     * @returns 
     */
    public async getZkpState(options = DEFAULT_OPTIONS) {
        const { data, error, context, metadata } = await this.client.call<ZKPStateKebab>({ method: 'getZkpState' }, options)
        if (error) {
            return { error, data, context };
        } else {
            return {
                error,
                data: {
                    latestHeaderHash: data!['latest-header-number'],
                    latestBlockNumber: data!['latest-block-number'],
                    latestProof: data!['latest-proof'],
                },
                context,
                metadata,
            };
        }
    }
}
