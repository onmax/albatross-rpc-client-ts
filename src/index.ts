import * as Modules from "./modules";

class Client {
    public url: URL;

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
        this.url = url;
        const blockchain = new Modules.BlockchainClient.BlockchainClient(url);
        const blockchainStreams = new Modules.BlockchainStream.BlockchainStream(url);
        const consensus = new Modules.ConsensusClient.ConsensusClient(url, blockchain, blockchainStreams);
        const mempool = new Modules.MempoolClient.MempoolClient(url);
        const network = new Modules.NetworkClient.NetworkClient(url);
        const policy = new Modules.PolicyClient.PolicyClient(url);
        const validator_ = new Modules.ValidatorClient.ValidatorClient(url);
        const wallet = new Modules.WalletClient.WalletClient(url);
        const zkpComponent = new Modules.ZkpComponentClient.ZkpComponentClient(url);

        this._modules = {
            blockchain,
            blockchainStreams,
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
            getBy: blockchain.getBlockBy.bind(blockchain),
            latest: blockchain.getLatestBlock.bind(blockchain),
            election: {
                after: policy.getElectionBlockAfter.bind(policy),
                before: policy.getElectionBlockBefore.bind(policy),
                last: policy.getLastElectionBlock.bind(policy),
                getBy: policy.getElectionBlockOf.bind(policy),
                subscribe: blockchainStreams.subscribeForValidatorElectionByAddress.bind(blockchainStreams),
            },
            isElection: policy.getIsElectionBlockAt.bind(policy),
            macro: {
                after: policy.getMacroBlockAfter.bind(policy),
                before: policy.getMacroBlockBefore.bind(policy),
                last: policy.getLastMacroBlock.bind(policy),
                getBy: policy.getMacroBlockOf.bind(policy),
            },
            isMacro: policy.getIsMacroBlockAt.bind(policy),
            isMicro: policy.getIsMicroBlockAt.bind(policy),
            subscribe: blockchainStreams.subscribeForBlocks.bind(blockchainStreams),
        };

        this.logs = {
            subscribe: blockchainStreams.subscribeForLogsByAddressesAndTypes.bind(blockchainStreams),
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

        this.slots = {
            at: blockchain.getSlotAt.bind(blockchain),
            slashed: {
                current: blockchain.getCurrentSlashedSlots.bind(blockchain),
                previous: blockchain.getPreviousSlashedSlots.bind(blockchain),
            }
        }

        this.transaction = {
            getBy: blockchain.getTransactionBy.bind(blockchain),
            push: mempool.pushTransaction.bind(mempool),
            minFeePerByte: mempool.getMinFeePerByte.bind(mempool),
            create: consensus.createTransaction.bind(consensus),
            send: consensus.sendTransaction.bind(consensus),
            sendSync: consensus.sendSyncTransaction.bind(consensus),
        }

        this.vesting = {
            new: {
                createTx: consensus.createNewVestingTransaction.bind(consensus),
                sendTx: consensus.sendNewVestingTransaction.bind(consensus),
                sendSyncTx: consensus.sendSyncNewVestingTransaction.bind(consensus),
            },
            redeem: {
                createTx: consensus.createRedeemVestingTransaction.bind(consensus),
                sendTx: consensus.sendRedeemVestingTransaction.bind(consensus),
                sendSyncTx: consensus.sendSyncRedeemVestingTransaction.bind(consensus),
            }
        }

        this.htlc = {
            new: {
                createTx: consensus.createNewHtlcTransaction.bind(consensus),
                sendTx: consensus.sendNewHtlcTransaction.bind(consensus),
                sendSyncTx: consensus.sendSyncNewHtlcTransaction.bind(consensus),
            },
            redeem: {
                regular: {
                    createTx: consensus.createRedeemRegularHtlcTransaction.bind(consensus),
                    sendTx: consensus.sendRedeemRegularHtlcTransaction.bind(consensus),
                    sendSyncTx: consensus.sendSyncRedeemRegularHtlcTransaction.bind(consensus),
                },
                timeoutTx: {
                    createTx: consensus.createRedeemTimeoutHtlcTransaction.bind(consensus),
                    sendTx: consensus.sendRedeemTimeoutHtlcTransaction.bind(consensus),
                    sendSyncTx: consensus.sendSyncRedeemTimeoutHtlcTransaction.bind(consensus),
                },
                earlyTx: {
                    createTx: consensus.createRedeemEarlyHtlcTransaction.bind(consensus),
                    sendTx: consensus.sendRedeemEarlyHtlcTransaction.bind(consensus),
                    sendSyncTx: consensus.sendSyncRedeemEarlyHtlcTransaction.bind(consensus),
                }
            }
        }

        this.stakes = {
            new: {
                createTx: consensus.createStakeTransaction.bind(consensus),
                sendTx: consensus.sendStakeTransaction.bind(consensus),
                sendSyncTx: consensus.sendSyncStakeTransaction.bind(consensus),
            }
        }

        this.staker = {
            fromValidator: blockchain.getStakersByAddress.bind(blockchain),
            getBy: blockchain.getStakerByAddress.bind(blockchain),
            new: {
                createTx: consensus.createNewStakerTransaction.bind(consensus),
                sendTx: consensus.sendNewStakerTransaction.bind(consensus),
                sendSyncTx: consensus.sendSyncNewStakerTransaction.bind(consensus),
            },
            update: {
                createTx: consensus.createUpdateStakerTransaction.bind(consensus),
                sendTx: consensus.sendUpdateStakerTransaction.bind(consensus),
                sendSyncTx: consensus.sendSyncUpdateStakerTransaction.bind(consensus),
            }
        }

        this.inherent = {
            getBy: blockchain.getInherentsBy.bind(blockchain),
        }

        this.account = {
            getBy: blockchain.getAccountBy.bind(blockchain),
            importRawKey: wallet.importRawKey.bind(wallet),
            new: wallet.createAccount.bind(wallet),
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
            activeList: blockchain.getActiveValidators.bind(blockchain),
            parked: blockchain.getParkedValidators.bind(blockchain),
            action: {
                new: {
                    createTx: consensus.createNewValidatorTransaction.bind(consensus),
                    sendTx: consensus.sendNewValidatorTransaction.bind(consensus),
                },
                update: {
                    createTx: consensus.createUpdateValidatorTransaction.bind(consensus),
                    sendTx: consensus.sendUpdateValidatorTransaction.bind(consensus),
                },
                deactivate: {
                    createTx: consensus.createDeactivateValidatorTransaction.bind(consensus),
                    sendTx: consensus.sendDeactivateValidatorTransaction.bind(consensus),
                },
                reactivate: {
                    createTx: consensus.createReactivateValidatorTransaction.bind(consensus),
                    sendTx: consensus.sendReactivateValidatorTransaction.bind(consensus),
                },
                unpark: {
                    createTx: consensus.createUnparkValidatorTransaction.bind(consensus),
                    sendTx: consensus.sendUnparkValidatorTransaction.bind(consensus),
                },
                retire: {
                    createTx: consensus.createRetireValidatorTransaction.bind(consensus),
                    sendTx: consensus.sendRetireValidatorTransaction.bind(consensus),
                },
                delete: {
                    createTx: consensus.createDeleteValidatorTransaction.bind(consensus),
                    sendTx: consensus.sendDeleteValidatorTransaction.bind(consensus),
                }
            },
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

export * from "./modules";
export type * from "./types/common.d.ts";
export * from "./types/enums";
export type * from "./types/logs.d.ts";
export { Client };

