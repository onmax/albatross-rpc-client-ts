import { Address, Signature, WalletAccount } from "../types/common";
import { Client } from "../client/client";
import { MaybeCallResponse } from "../types/rpc-messages";
import { DEFAULT_OPTIONS } from "../client/http";

type ImportKeyParams = { keyData: string; passphrase?: string };
type IsAccountImportedParams = { address: Address };
type LockAccountParams = { address: Address };
type UnlockAccountParams = { address: Address; passphrase?: string; duration?: number };
type IsAccountLockedParams = { address: Address };
type CreateAccountParams = { passphrase?: string };
type SignParams = { message: string, address: Address, passphrase: string, isHex: boolean };
type VerifySignatureParams = { message: string, publicKey: string, signature: Signature, isHex: boolean };

export class WalletClient extends Client {
    constructor(url: URL) {
        super(url);
    }

    public async importRawKey({ keyData, passphrase }: ImportKeyParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Address>> {
        return this.call("importRawKey", [keyData, passphrase], options);
    }

    public async isAccountImported({ address }: IsAccountImportedParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Boolean>> {
        return this.call("isAccountImported", [address], options);
    }

    public async listAccounts(options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Address[]>> {
        return this.call("listAccounts", [], options);
    }

    public async lockAccount({ address }: LockAccountParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<null>> {
        return this.call("lockAccount", [address], options);
    }

    public async createAccount(p?: CreateAccountParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<WalletAccount>> {
        return this.call("createAccount", [p?.passphrase], options);
    }

    public async unlockAccount({ address, passphrase, duration }: UnlockAccountParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Boolean>> {
        return this.call("unlockAccount", [address, passphrase, duration], options);
    }

    public async isAccountLocked({ address }: IsAccountLockedParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Boolean>> {
        return this.call("isAccountLocked", [address], options);
    }

    public async sign({ message, address, passphrase, isHex }: SignParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Signature>> {
        return this.call("sign", [message, address, passphrase, isHex], options);
    }

    public async verifySignature({ message, publicKey, signature, isHex }: VerifySignatureParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Boolean>> {
        return this.call("verifySignature", [message, publicKey, signature, isHex], options);
    }
}