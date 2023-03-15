import { Address, Signature } from "../types/common";
import { RpcClient } from "./client";

export class WalletClient extends RpcClient {
    constructor(url: string) {
        super(url);
    }

    public async importRawKey(key_data: string, passphrase?: string) {
        return this.call("importRawKey", [key_data, passphrase]);
    }

    public async isAccountImported(address: Address) {
        return this.call("isAccountImported", [address]);
    }

    public async listAccounts() {
        return this.call("listAccounts", []);
    }

    public async lockAccount(address: Address) {
        return this.call("lockAccount", [address]);
    }

    public async createAccount(passphrase?: string) {
        return this.call("createAccount", [passphrase]);
    }

    public async unlockAccount(address: Address, passphrase: string, duration?: number) {
        return this.call("unlockAccount", [address, passphrase, duration]);
    }

    public async isAccountLocked(address: Address) {
        return this.call("isAccountLocked", [address]);
    }

    public async sign(message: string, address: Address, is_hex: boolean, passphrase?: string) {
        return this.call("sign", [message, address, passphrase, is_hex]);
    }

    public async verifySignature(message: string, public_key: string, signature: Signature, is_hex: boolean) {
        return this.call("verifySignature", [message, public_key, signature, is_hex]);
    }
}