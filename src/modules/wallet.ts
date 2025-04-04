import type { HttpClient } from '../client/http'
import type { Signature, WalletAccount } from '../types/'
import { DEFAULT_OPTIONS } from '../client/http'

export interface ImportKeyParams { keyData: string, passphrase?: string }
export interface UnlockAccountParams { passphrase?: string, duration?: number }
export interface CreateAccountParams { passphrase?: string }
export interface SignParams { message: string, address: string, passphrase: string, isHex: boolean }
export interface VerifySignatureParams { message: string, publicKey: string, signature: Signature, isHex: boolean }

export class WalletClient {
  private client: HttpClient

  constructor(http: HttpClient) {
    this.client = http
  }

  public async importRawKey({ keyData, passphrase }: ImportKeyParams, options = DEFAULT_OPTIONS) {
    return this.client.call<string>({ method: 'importRawKey', params: [keyData, passphrase] }, options)
  }

  public async isAccountImported(address: string, options = DEFAULT_OPTIONS) {
    return this.client.call<boolean>({ method: 'isAccountImported', params: [address] }, options)
  }

  public async listAccounts(options = DEFAULT_OPTIONS) {
    return this.client.call<string[]>({ method: 'listAccounts' }, options)
  }

  public async lockAccount(address: string, options = DEFAULT_OPTIONS) {
    return this.client.call<null>({ method: 'lockAccount', params: [address] }, options)
  }

  public async createAccount(p?: CreateAccountParams, options = DEFAULT_OPTIONS) {
    return this.client.call<WalletAccount>({ method: 'createAccount', params: [p?.passphrase] }, options)
  }

  public async unlockAccount(address: string, { passphrase, duration }: UnlockAccountParams, options = DEFAULT_OPTIONS) {
    return this.client.call<boolean>({ method: 'unlockAccount', params: [address, passphrase, duration] }, options)
  }

  public async isAccountUnlocked(address: string, options = DEFAULT_OPTIONS) {
    return this.client.call<boolean>({ method: 'isAccountUnlocked', params: [address] }, options)
  }

  public async sign({ message, address, passphrase, isHex }: SignParams, options = DEFAULT_OPTIONS) {
    return this.client.call<Signature>({ method: 'sign', params: [message, address, passphrase, isHex] }, options)
  }

  public async verifySignature({ message, publicKey, signature, isHex }: VerifySignatureParams, options = DEFAULT_OPTIONS) {
    return this.client.call<boolean>({ method: 'verifySignature', params: [message, publicKey, signature, isHex] }, options)
  }

  public async removeAccount(address: string, options = DEFAULT_OPTIONS) {
    return this.client.call<boolean>({ method: 'removeAccount', params: [address] }, options)
  }
}
