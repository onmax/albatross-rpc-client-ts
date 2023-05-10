import { DEFAULT_OPTIONS, HttpClient } from "../client/http";
import { Address, Signature, WalletAccount } from "../types/common";

type ImportKeyParams = { keyData: string; passphrase?: string };
type IsAccountImportedParams = { address: Address };
type LockAccountParams = { address: Address };
type UnlockAccountParams = { address: Address; passphrase?: string; duration?: number };
type IsAccountLockedParams = { address: Address };
type CreateAccountParams = { passphrase?: string };
type SignParams = { message: string, address: Address, passphrase: string, isHex: boolean };
type VerifySignatureParams = { message: string, publicKey: string, signature: Signature, isHex: boolean };

export class WalletClient extends HttpClient {
    public async importRawKey({ keyData, passphrase }: ImportKeyParams, options = DEFAULT_OPTIONS) {
        const req = { method: 'importRawKey', params: [keyData, passphrase] }
        return super.call<Address, typeof req>(req, options)
    }

    public async isAccountImported({ address }: IsAccountImportedParams, options = DEFAULT_OPTIONS) {
        const req = { method: 'isAccountImported', params: [address] }
        return super.call<Boolean, typeof req>(req, options)
    }

    public async listAccounts(options = DEFAULT_OPTIONS) {
        const req = { method: 'listAccounts', params: [] }
        return super.call<Boolean, typeof req>(req, options)
    }

    public async lockAccount({ address }: LockAccountParams, options = DEFAULT_OPTIONS) {
        const req = { method: 'lockAccount', params: [address] }
        return super.call<null, typeof req>(req, options)
    }

    public async createAccount(p?: CreateAccountParams, options = DEFAULT_OPTIONS) {
        const req = { method: 'createAccount', params: [p?.passphrase] }
        return super.call<WalletAccount, typeof req>(req, options)
    }

    public async unlockAccount({ address, passphrase, duration }: UnlockAccountParams, options = DEFAULT_OPTIONS) {
        const req = { method: 'unlockAccount', params: [address, passphrase, duration] }
        return super.call<Boolean, typeof req>(req, options)
    }

    public async isAccountLocked({ address }: IsAccountLockedParams, options = DEFAULT_OPTIONS) {
        const req = { method: 'isAccountLocked', params: [address] }
        return super.call<Boolean, typeof req>(req, options)
    }

    public async sign({ message, address, passphrase, isHex }: SignParams, options = DEFAULT_OPTIONS) {
        const req = { method: 'sign', params: [message, address, passphrase, isHex] }
        return super.call<Signature, typeof req>(req, options)
    }

    public async verifySignature({ message, publicKey, signature, isHex }: VerifySignatureParams, options = DEFAULT_OPTIONS) {
        const req = { method: 'verifySignature', params: [message, publicKey, signature, isHex] }
        return super.call<Boolean, typeof req>(req, options)
    }
}
