import { BlockchainClient, PolicyClient } from "./modules";

export class Client {
    public policy: PolicyClient;
    public blockchain: BlockchainClient;

    constructor(url: string) {
        this.policy = new PolicyClient(url);
        this.blockchain = new BlockchainClient(url);
    }
}