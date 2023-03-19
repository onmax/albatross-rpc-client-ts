import { BlockchainClient, ConsensusClient, MempoolClient, NetworkClient, PolicyClient, ValidatorClient, WalletClient, ZkpComponentClient } from "./modules";
import * as Common from './types/common';
import { Address } from "./types/common";
import { BlockType, LogType } from "./types/enums";
import * as Logs from './types/logs';

type GetStakerByAddressParams = { address: Address };

class Client {
    public block;
    public batch;
    public epoch;
    public transaction;
    public inherent;
    public account;
    public validator;
    public slots;
    public mempool;
    public stakes;
    public staker;
    public peers;
    public constant;
    public htlc;
    public vesting;
    public zeroKnowledgeProof;
    public logs;
    public _modules;

    constructor(url: URL) {
        const blockchain = new BlockchainClient(url);
        const consensus = new ConsensusClient(url);
        const mempool = new MempoolClient(url);
        const network = new NetworkClient(url);
        const policy = new PolicyClient(url);
        const validator_ = new ValidatorClient(url);
        const wallet = new WalletClient(url);
        const zkpComponent = new ZkpComponentClient(url);

        this._modules = {
            blockchain,
            consensus,
            mempool,
            network,
            policy,
            validator: validator_,
            wallet,
            zkpComponent,
        }

        this.block = {
            current: blockchain.getBlockNumber.bind(blockchain),
            by: blockchain.getBlockBy.bind(blockchain),
            latest: blockchain.getLatestBlock.bind(blockchain),
            election: {
                after: policy.getElectionBlockAfter.bind(policy),
                before: policy.getElectionBlockBefore.bind(policy),
                last: policy.getLastElectionBlock.bind(policy),
                get: policy.getElectionBlockOf.bind(policy),
                subscribe: blockchain.subscribeForValidatorElectionByAddress.bind(blockchain),
            },
            isElection: policy.getIsElectionBlockAt.bind(policy),
            macro: {
                after: policy.getMacroBlockAfter.bind(policy),
                before: policy.getMacroBlockBefore.bind(policy),
                last: policy.getLastMacroBlock.bind(policy),
                get: policy.getMacroBlockOf.bind(policy),
            },
            isMacro: policy.getIsMacroBlockAt.bind(policy),
            isMicro: policy.getIsMicroBlockAt.bind(policy),
            subscribe: blockchain.subscribeForBlocks.bind(blockchain),
        };

        this.logs = {
            subscribe: blockchain.subscribeForLogsByAddressesAndTypes.bind(blockchain),
        }

        this.batch = {
            current: blockchain.getBatchNumber.bind(blockchain),
            at: policy.getBatchAt.bind(policy),
            firstBlock: policy.getFirstBlockOf.bind(policy),
        }

        this.epoch = {
            current: blockchain.getEpochNumber.bind(blockchain),
            at: policy.getEpochAt.bind(policy),
            firstBlock: policy.getFirstBlockOf.bind(policy),
            firstBatch: policy.getFirstBatchOfEpoch.bind(policy),
        }
        
        this.transaction = {
            by: blockchain.getTransactionBy.bind(blockchain),
            push: mempool.pushTransaction.bind(mempool),
            minFeePerByte: mempool.getMinFeePerByte.bind(mempool),
            create: consensus.createTransaction.bind(consensus),
            send: consensus.sendTransaction.bind(consensus),
        }

        this.vesting = {
            create: consensus.createNewVestingTransaction.bind(consensus),
                send: consensus.sendNewVestingTransaction.bind(consensus),
                redeem: {
                    create: consensus.createRedeemVestingTransaction.bind(consensus),
                    send: consensus.sendRedeemVestingTransaction.bind(consensus),
                }
        }

        this.htlc = {
            create: consensus.createNewHtlcTransaction.bind(consensus),
            send: consensus.sendNewHtlcTransaction.bind(consensus),
            redeem: {
                regular: {
                    create: consensus.createRedeemRegularHtlcTransaction.bind(consensus),
                    send: consensus.sendRedeemRegularHtlcTransaction.bind(consensus),
                },
                timeout: {
                    create: consensus.createRedeemTimeoutHtlcTransaction.bind(consensus),
                    send: consensus.sendRedeemTimeoutHtlcTransaction.bind(consensus),
                },
                early: {
                    create: consensus.createRedeemEarlyHtlcTransaction.bind(consensus),
                    send: consensus.sendRedeemEarlyHtlcTransaction.bind(consensus),
                }
            }
        }

        this.stakes = {
            new: {
                create: consensus.createStakeTransaction.bind(consensus),
                send: consensus.sendStakeTransaction.bind(consensus),
            }
        }

        this.staker = {
            byAddress: blockchain.getStakerByAddress.bind(blockchain),
            create: consensus.createNewStakerTransaction.bind(consensus),
            send: consensus.sendNewStakerTransaction.bind(consensus),
            update: {
                create: consensus.createUpdateStakerTransaction.bind(consensus),
                send: consensus.sendUpdateStakerTransaction.bind(consensus),
            }
        }

        this.inherent = {
            by: blockchain.getInherentsBy.bind(blockchain),
        }

        this.account = {
            byAddress: blockchain.getAccountBy.bind(blockchain),
            importRawKey: wallet.importRawKey.bind(wallet),
            create: wallet.createAccount.bind(wallet),
            isImported: wallet.isAccountImported.bind(wallet),
            list: wallet.listAccounts.bind(wallet),
            lock: wallet.lockAccount.bind(wallet),
            unlock: wallet.unlockAccount.bind(wallet),
            isLocked: wallet.isAccountLocked.bind(wallet),
            sign: wallet.sign.bind(wallet),
            verify: wallet.verifySignature.bind(wallet),
        }

        this.validator = {
            byAddress: blockchain.getValidatorBy.bind(blockchain),
            setAutomaticReactivation: validator_.setAutomaticReactivation.bind(validator_),
            selfNode: { // The node is a validator itself, which we have access to
                address: validator_.getAddress.bind(blockchain),
                signingKey: validator_.getSigningKey.bind(blockchain),
                votingKey: validator_.getVotingKey.bind(blockchain),
            },
            active: blockchain.getActiveValidators.bind(blockchain),
            parked: blockchain.getParkedValidators.bind(blockchain),
            action: {
                new: {
                    create: consensus.createNewValidatorTransaction.bind(consensus),
                    send: consensus.sendNewValidatorTransaction.bind(consensus),
                },
                update: {
                    create: consensus.createUpdateValidatorTransaction.bind(consensus),
                    send: consensus.sendUpdateValidatorTransaction.bind(consensus),
                },
                inactive: {
                    create: consensus.createInactivateValidatorTransaction.bind(consensus),
                    send: consensus.sendInactivateValidatorTransaction.bind(consensus),
                },
                reactivate: {
                    create: consensus.createReactivateValidatorTransaction.bind(consensus),
                    send: consensus.sendReactivateValidatorTransaction.bind(consensus),
                },
                unpark: {
                    create: consensus.createUnparkValidatorTransaction.bind(consensus),
                    send: consensus.sendUnparkValidatorTransaction.bind(consensus),
                },
                delete: {
                    create: consensus.createDeleteValidatorTransaction.bind(consensus),
                    send: consensus.sendDeleteValidatorTransaction.bind(consensus),
                }
            },
        }

        this.slots = {
            at: blockchain.getSlotAt.bind(blockchain),
            slashed: {
                current: blockchain.getCurrentSlashedSlots.bind(blockchain),
                previous: blockchain.getPreviousSlashedSlots.bind(blockchain),
            }
        }

        this.mempool = {
            info: mempool.mempool.bind(mempool),
            content: mempool.mempoolContent.bind(mempool),
        }

        this.peers = {
            id: network.getPeerId.bind(network),
            count: network.getPeerCount.bind(network),            
            peers: network.getPeerList.bind(network),
            consensusEstablished: consensus.isConsensusEstablished.bind(network),
        }

        this.constant = {
            params: policy.getPolicyConstants.bind(policy),
            supply: policy.getSupplyAt.bind(policy),
        }

        this.zeroKnowledgeProof = {
            state: zkpComponent.getZkpState.bind(zkpComponent),
        }
    }
}

export { Client, LogType, BlockType, type Common, type Logs };

