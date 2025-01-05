import type { HttpClient } from '../client/http'
import { DEFAULT_OPTIONS } from '../client/http'

interface ZKPStateKebab {
  'latest-header-number': string
  'latest-block-number': number
  'latest-proof'?: string
}

export class ZkpComponentClient {
  private client: HttpClient

  constructor(http: HttpClient) {
    this.client = http
  }

  /**
   * Returns the latest header number, block number and proof
   * @returns the latest header number, block number and proof
   */
  public async getZkpState(options = DEFAULT_OPTIONS) {
    const { data, error, context, metadata } = await this.client.call<ZKPStateKebab>({ method: 'getZkpState' }, options)
    if (error) {
      return { error, data, context }
    }
    else {
      return {
        error,
        data: {
          latestHeaderNumber: data!['latest-header-number'],
          latestBlockNumber: data!['latest-block-number'],
          latestProof: data!['latest-proof'],
        },
        context,
        metadata,
      }
    }
  }
}
