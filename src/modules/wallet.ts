import { DEFAULT_OPTIONS, HttpClient } from "../client/http";
import { Address, Signature, WalletAccount } from "../types/common";

export type ImportKeyParams = { keyData: string; passphrase?: string };
export type UnlockAccountParams = { passphrase?: string; duration?: number };
export type CreateAccountParams = { passphrase?: string };
export type SignParams = { message: string, address: Address, passphrase: string, isHex: boolean };
export type VerifySignatureParams = { message: string, publicKey: string, signature: Signature, isHex: boolean };

export class WalletClient {
    private client: HttpClient;

    constructor(http: HttpClient) {
        this.client = http;
    }


    public async importRawKey({ keyData, passphrase }: ImportKeyParams, options = DEFAULT_OPTIONS) {
        return this.client.call<Address>({ method: 'importRawKey', params: [keyData, passphrase] }, options)
    }

    public async isAccountImported(address: Address, options = DEFAULT_OPTIONS) {
        return this.client.call<Boolean>({ method: 'isAccountImported', params: [address] }, options)
    }

    public async listAccounts(options = DEFAULT_OPTIONS) {
        return this.client.call<Boolean>({ method: 'listAccounts' }, options)
    }

    public async lockAccount(address: Address, options = DEFAULT_OPTIONS) {
        return this.client.call<null>({ method: 'lockAccount', params: [address] }, options)
    }

    public async createAccount(p?: CreateAccountParams, options = DEFAULT_OPTIONS) {
        return this.client.call<WalletAccount>({ method: 'createAccount', params: [p?.passphrase] }, options)
    }

    public async unlockAccount(address: Address, { passphrase, duration }: UnlockAccountParams, options = DEFAULT_OPTIONS) {
        return this.client.call<Boolean>({ method: 'unlockAccount', params: [address, passphrase, duration] }, options)
    }

    public async isAccountLocked(address: Address, options = DEFAULT_OPTIONS) {
        return this.client.call<Boolean>({ method: 'isAccountLocked', params: [address] }, options)
    }

    public async sign({ message, address, passphrase, isHex }: SignParams, options = DEFAULT_OPTIONS) {
        return this.client.call<Signature>({ method: 'sign', params: [message, address, passphrase, isHex] }, options)
    }

    public async verifySignature({ message, publicKey, signature, isHex }: VerifySignatureParams, options = DEFAULT_OPTIONS) {
        return this.client.call<Boolean>({ method: 'verifySignature', params: [message, publicKey, signature, isHex] }, options)
    }
}
