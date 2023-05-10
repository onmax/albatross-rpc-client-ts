import { DEFAULT_OPTIONS, HttpClient } from "../client/http";
import { Auth, BlockNumber, Hash } from "../types/common";

type ZKPStateKebab = {
    'latest-header-number': Hash
    'latest-block-number': BlockNumber
    'latest-proof'?: string
}

export class ZkpComponentClient extends HttpClient {
    constructor(url: URL, auth?: Auth) {
        super(url, auth)
    }

    public async getZkpState(options = DEFAULT_OPTIONS) {
        const { data, error, context, metadata } = await super.call<ZKPStateKebab>({ method: 'getZkpState' }, options)
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
