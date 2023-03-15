import { BlockchainClient, ConsensusClient, MempoolClient, NetworkClient, PolicyClient, ValidatorClient, WalletClient, ZkpComponentClient} from "./modules";

export class Client {
    public blockchain: BlockchainClient;
    public consensus: ConsensusClient;
    public mempool: MempoolClient;
    public network: NetworkClient;
    public policy: PolicyClient;
    public validator: ValidatorClient;
    public wallet: WalletClient;
    public zkpComponent: ZkpComponentClient;

    constructor(url: string) {
        this.blockchain = new BlockchainClient(url);
        this.consensus = new ConsensusClient(url);
        this.mempool = new MempoolClient(url);
        this.network = new NetworkClient(url);
        this.policy = new PolicyClient(url);
        this.validator = new ValidatorClient(url);
        this.wallet = new WalletClient(url);
        this.zkpComponent = new ZkpComponentClient(url);
    }
}