import type { HttpClient } from '../client/http'
import { DEFAULT_OPTIONS } from '../client/http'
import type { Address } from '../types/'

export interface SetAutomaticReactivationParams { automaticReactivation: boolean }

export class ValidatorClient {
  private client: HttpClient

  constructor(http: HttpClient) {
    this.client = http
  }

  /**
   * Returns our validator address.
   */
  public async getAddress(options = DEFAULT_OPTIONS) {
    return this.client.call<Address>({ method: 'getAddress' }, options)
  }

  /**
   * Returns our validator signing key
   */
  public async getSigningKey(options = DEFAULT_OPTIONS) {
    return this.client.call<string>({ method: 'getSigningKey' }, options)
  }

  /**
   * Returns our validator voting key
   */
  public async getVotingKey(options = DEFAULT_OPTIONS) {
    return this.client.call<string>({ method: 'getVotingKey' }, options)
  }

  /**
   * Updates the configuration setting to automatically reactivate our validator
   */
  public async setAutomaticReactivation({ automaticReactivation }: SetAutomaticReactivationParams, options = DEFAULT_OPTIONS) {
    return this.client.call<null>({ method: 'setAutomaticReactivation', params: [automaticReactivation] }, options)
  }

  /**
   * Returns whether our validator is elected
   */
  public async isElected(options = DEFAULT_OPTIONS) {
    return this.client.call<boolean>({ method: 'isValidatorElected' }, options)
  }

  /**
   * Returns whether our validator is synced
   */
  public async isSynced(options = DEFAULT_OPTIONS) {
    return this.client.call<boolean>({ method: 'isValidatorSynced' }, options)
  }
}
