import { Address, Signature, WalletAccount } from "../types/common";
import { Client } from "../client/client";
import { MaybeResponse } from "../types/rpc-messages";

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

    public async importRawKey({ keyData, passphrase }: ImportKeyParams): Promise<MaybeResponse<Address>> {
        return this.call("importRawKey", [keyData, passphrase]);
    }

    public async isAccountImported({ address }: IsAccountImportedParams): Promise<MaybeResponse<Boolean>> {
        return this.call("isAccountImported", [address]);
    }

    public async listAccounts(): Promise<MaybeResponse<Address[]>> {
        return this.call("listAccounts", []);
    }

    public async lockAccount({ address }: LockAccountParams): Promise<MaybeResponse<null>> {
        return this.call("lockAccount", [address]);
    }

    public async createAccount({ passphrase }: CreateAccountParams): Promise<MaybeResponse<WalletAccount>> {
        return this.call("createAccount", [passphrase]);
    }

    public async unlockAccount({ address, passphrase, duration }: UnlockAccountParams): Promise<MaybeResponse<Boolean>> {
        return this.call("unlockAccount", [address, passphrase, duration]);
    }

    public async isAccountLocked({ address }: IsAccountLockedParams): Promise<MaybeResponse<Boolean>> {
        return this.call("isAccountLocked", [address]);
    }

    public async sign({ message, address, passphrase, isHex }: SignParams): Promise<MaybeResponse<Signature>> {
        return this.call("sign", [message, address, passphrase, isHex]);
    }

    public async verifySignature({ message, publicKey, signature, isHex }: VerifySignatureParams): Promise<MaybeResponse<Boolean>> {
        return this.call("verifySignature", [message, publicKey, signature, isHex]);
    }
}