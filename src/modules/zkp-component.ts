import { Hash } from "crypto";
import { DEFAULT_OPTIONS, HttpClient } from "../client/http";
import { BlockNumber, ZKPState } from "../types/common";

type ZKPStateKebab = {
    'latest-header-number': Hash
    'latest-block-number': BlockNumber
    'latest-proof'?: string
}

export class ZkpComponentClient extends HttpClient {
    public async getZkpState(options = DEFAULT_OPTIONS) {
        const req = { method: 'getZkpState', params: [] }
        const { data, error, context, metadata } = await super.call<ZKPStateKebab, typeof req>(req, options)
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
