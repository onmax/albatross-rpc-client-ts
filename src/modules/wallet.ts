import { Address, Signature } from "../types/common";
import { RpcClient } from "./client";

type ImportKeyParams = { keyData: string; passphrase?: string };
type IsAccountImportedParams = { address: Address };
type LockAccountParams = { address: Address };
type UnlockAccountParams = { address: Address; passphrase: string; duration?: number };
type IsAccountLockedParams = { address: Address };
type CreateAccountParams = { passphrase?: string };
type SignParams = { message: string, address: Address, passphrase: string, isHex: boolean };
type VerifySignatureParams = { message: string, publicKey: string, signature: Signature, isHex: boolean };

export class WalletClient extends RpcClient {
    constructor(url: URL) {
        super(url);
    }

    public async importRawKey({ keyData, passphrase }: ImportKeyParams) {
        return this.call("importRawKey", [keyData, passphrase]);
    }

    public async isAccountImported({ address }: IsAccountImportedParams) {
        return this.call("isAccountImported", [address]);
    }

    public async listAccounts() {
        return this.call("listAccounts", []);
    }

    public async lockAccount({ address }: LockAccountParams) {
        return this.call("lockAccount", [address]);
    }

    public async createAccount({ passphrase }: CreateAccountParams) {
        return this.call("createAccount", [passphrase]);
    }

    public async unlockAccount({ address, passphrase, duration }: UnlockAccountParams) {
        return this.call("unlockAccount", [address, passphrase, duration]);
    }

    public async isAccountLocked({ address }: IsAccountLockedParams) {
        return this.call("isAccountLocked", [address]);
    }

    public async sign({ message, address, passphrase, isHex }: SignParams) {
        return this.call("sign", [message, address, passphrase, isHex]);
    }

    public async verifySignature({ message, publicKey, signature, isHex }: VerifySignatureParams) {
        return this.call("verifySignature", [message, publicKey, signature, isHex]);
    }
}