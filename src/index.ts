import { BlockchainClient, ConsensusClient, MempoolClient, NetworkClient, PolicyClient, ValidatorClient, WalletClient, ZkpComponentClient } from "./modules";
import type { BlockSubscription, GetAccountByAddressParams, GetBlockByParams, GetInherentsByParams, GetLatestBlockParams, GetSlotAtParams, GetStakerByAddressParams, GetTransactionByParams, GetTransactionsByAddressParams, GetValidatorByAddressParams, SubscribeForHeadBlockParams, SubscribeForLogsByAddressesAndTypesParams, SubscribeForValidatorElectionByAddressParams } from "./modules/blockchain";
import type { DeleteValidatorTxParams, HtlcTransactionParams, InactiveValidatorTxParams, RawTransactionInfoParams, ReactivateValidatorTxParams, RedeemEarlyHtlcTxParams, RedeemRegularHtlcTxParams, RedeemTimeoutHtlcTxParams, RedeemVestingTxParams, RetireValidatorTxParams, SignRedeemEarlyHtlcParams, StakerTxParams, StakeTxParams, TransactionParams, UnparkValidatorTxParams, UnstakeTxParams, UpdateStakerTxParams, UpdateValidatorTxParams, NewValidatorTxParams, VestingTxParams } from "./modules/consensus";
import type { Account, Address, BasicAccount, BatchIndex, Block, BlockNumber, Coin, CurrentTime, ElectionMacroBlock, EpochIndex, GenesisSupply, GenesisTime, Hash, HtlcAccount, Inherent, MacroBlock, MempoolInfo, MicroBlock, ParkedSet, PartialBlock, PartialMacroBlock, PartialMicroBlock, PartialValidator, PolicyConstants, RawTransaction, Signature, SlashedSlot, Slot, Staker, Transaction, Validator, VestingAccount, WalletAccount, ZKPState } from './types/common';
import type { CallOptions, CallbackParam, ContextRequest, ErrorCallReturn, ErrorStreamReturn, MaybeCallResponse, MaybeStreamResponse, MethodName, MethodResponse, MethodResponseError, MethodResponsePayload, Methods, RpcRequest, StreamName, StreamOptions, StreamResponse, StreamResponsePayload, Streams } from './types/rpc-messages';
import { AccountType, BlockType, LogType } from "./types/enums";
import type { BlockLog, LogsByAddressesAndTypes } from './types/logs';

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
            get: blockchain.getBlockBy.bind(blockchain),
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

        this.slots = {
            at: blockchain.getSlotAt.bind(blockchain),
            slashed: {
                current: blockchain.getCurrentSlashedSlots.bind(blockchain),
                previous: blockchain.getPreviousSlashedSlots.bind(blockchain),
            }
        }
        
        this.transaction = {
            get: blockchain.getTransactionBy.bind(blockchain),
            push: mempool.pushTransaction.bind(mempool),
            minFeePerByte: mempool.getMinFeePerByte.bind(mempool),
            create: consensus.createTransaction.bind(consensus),
            send: consensus.sendTransaction.bind(consensus),
        }

        this.vesting = {
            new: {
                createTx: consensus.createNewVestingTransaction.bind(consensus),
                sendTx: consensus.sendNewVestingTransaction.bind(consensus),
            },
            redeem: {
                createTx: consensus.createRedeemVestingTransaction.bind(consensus),
                sendTx: consensus.sendRedeemVestingTransaction.bind(consensus),
            }
        }

        this.htlc = {
            new: {
                createTx: consensus.createNewHtlcTransaction.bind(consensus),
                sendTx: consensus.sendNewHtlcTransaction.bind(consensus),
            },
            redeem: {
                regular: {
                    createTx: consensus.createRedeemRegularHtlcTransaction.bind(consensus),
                    sendTx: consensus.sendRedeemRegularHtlcTransaction.bind(consensus),
                },
                timeoutTx: {
                    createTx: consensus.createRedeemTimeoutHtlcTransaction.bind(consensus),
                    sendTx: consensus.sendRedeemTimeoutHtlcTransaction.bind(consensus),
                },
                earlyTx: {
                    createTx: consensus.createRedeemEarlyHtlcTransaction.bind(consensus),
                    sendTx: consensus.sendRedeemEarlyHtlcTransaction.bind(consensus),
                }
            }
        }

        this.stakes = {
            new: {
                createTx: consensus.createStakeTransaction.bind(consensus),
                sendTx: consensus.sendStakeTransaction.bind(consensus),
            }
        }

        this.staker = {
            byAddress: blockchain.getStakerByAddress.bind(blockchain),
            new: {
                createTx: consensus.createNewStakerTransaction.bind(consensus),
                sendTx: consensus.sendNewStakerTransaction.bind(consensus),
            },
            update: {
                createTx: consensus.createUpdateStakerTransaction.bind(consensus),
                sendTx: consensus.sendUpdateStakerTransaction.bind(consensus),
            }
        }

        this.inherent = {
            get: blockchain.getInherentsBy.bind(blockchain),
        }

        this.account = {
            get: blockchain.getAccountBy.bind(blockchain),
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
                deactive: {
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

export { Client };
export { BlockchainClient, ConsensusClient, MempoolClient, NetworkClient, PolicyClient, ValidatorClient, WalletClient, ZkpComponentClient };
export type { BlockSubscription, GetAccountByAddressParams, GetBlockByParams, GetInherentsByParams, GetLatestBlockParams, GetSlotAtParams, GetStakerByAddressParams, GetTransactionByParams, GetTransactionsByAddressParams, GetValidatorByAddressParams, SubscribeForHeadBlockParams, SubscribeForLogsByAddressesAndTypesParams, SubscribeForValidatorElectionByAddressParams };
export type { DeleteValidatorTxParams, HtlcTransactionParams, InactiveValidatorTxParams, RawTransactionInfoParams, ReactivateValidatorTxParams, RedeemEarlyHtlcTxParams, RedeemRegularHtlcTxParams, RedeemTimeoutHtlcTxParams, RedeemVestingTxParams, RetireValidatorTxParams, SignRedeemEarlyHtlcParams, StakerTxParams, StakeTxParams, TransactionParams, UnparkValidatorTxParams, UnstakeTxParams, UpdateStakerTxParams, UpdateValidatorTxParams, NewValidatorTxParams, VestingTxParams };
export type { Account, Address, BasicAccount, BatchIndex, Block, BlockNumber, Coin, CurrentTime, ElectionMacroBlock, EpochIndex, GenesisSupply, GenesisTime, Hash, HtlcAccount, Inherent, MacroBlock, MempoolInfo, MicroBlock, ParkedSet, PartialBlock, PartialMacroBlock, PartialMicroBlock, PartialValidator, PolicyConstants, RawTransaction, Signature, SlashedSlot, Slot, Staker, Transaction, Validator, VestingAccount, WalletAccount, ZKPState };
export type { CallOptions, CallbackParam, ContextRequest, ErrorCallReturn, ErrorStreamReturn, MaybeCallResponse, MaybeStreamResponse, MethodName, MethodResponse, MethodResponseError, MethodResponsePayload, Methods, RpcRequest, StreamName, StreamOptions, StreamResponse, StreamResponsePayload, Streams };
export { AccountType, BlockType, LogType };
export type { BlockLog, LogsByAddressesAndTypes };

