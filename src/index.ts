import { BlockchainClient, ConsensusClient, MempoolClient, NetworkClient, PolicyClient, ValidatorClient, WalletClient, ZkpComponentClient } from "./modules";
import type { GetAccountByAddressParams, GetBlockByParams, GetInherentsByParams, GetLatestBlockParams, GetSlotAtParams, GetStakerByAddressParams, GetTransactionByParams, GetTransactionsByAddressParams, GetValidatorByAddressParams, SubscribeForHeadBlockParams, SubscribeForLogsByAddressesAndTypesParams, SubscribeForValidatorElectionByAddressParams } from "./modules/blockchain";
import type { DeleteValidatorTxParams, HtlcTransactionParams, InactiveValidatorTxParams, RawTransactionInfoParams, ReactivateValidatorTxParams, RedeemEarlyHtlcTxParams, RedeemRegularHtlcTxParams, RedeemTimeoutHtlcTxParams, RedeemVestingTxParams, SignRedeemEarlyHtlcParams, StakerTxParams, StakeTxParams, TransactionParams, UnparkValidatorTxParams, UnstakeTxParams, UpdateStakerTxParams, UpdateValidatorTxParams, ValidatorTxParams, VestingTxParams } from "./modules/consensus";
import type { Account, Address, BasicAccount, BatchIndex, Block, BlockNumber, Coin, CurrentTime, ElectionMacroBlock, EpochIndex, GenesisSupply, GenesisTime, Hash, HtlcAccount, Inherent, MacroBlock, MempoolInfo, MicroBlock, ParkedSet, PartialBlock, PartialMacroBlock, PartialMicroBlock, PartialValidator, PolicyConstants, RawTransaction, Signature, SlashedSlot, Slot, Staker, Transaction, Validator, VestingAccount, WalletAccount, ZKPState } from './types/common';
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

        this.slots = {
            at: blockchain.getSlotAt.bind(blockchain),
            slashed: {
                current: blockchain.getCurrentSlashedSlots.bind(blockchain),
                previous: blockchain.getPreviousSlashedSlots.bind(blockchain),
            }
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
export { Account, Address, BasicAccount, BatchIndex, Block, BlockNumber, Coin, CurrentTime, ElectionMacroBlock, EpochIndex, GenesisSupply, GenesisTime, Hash, HtlcAccount, Inherent, MacroBlock, MempoolInfo, MicroBlock, ParkedSet, PartialBlock, PartialMacroBlock, PartialMicroBlock, PartialValidator, PolicyConstants, RawTransaction, Signature, SlashedSlot, Slot, Staker, Transaction, Validator, VestingAccount, WalletAccount, ZKPState };
export { BlockType, LogType, AccountType };
export { BlockLog, LogsByAddressesAndTypes };
export { RawTransactionInfoParams, TransactionParams, VestingTxParams, RedeemVestingTxParams, HtlcTransactionParams, RedeemRegularHtlcTxParams, RedeemTimeoutHtlcTxParams, RedeemEarlyHtlcTxParams, SignRedeemEarlyHtlcParams, StakerTxParams, StakeTxParams, UpdateStakerTxParams, UnstakeTxParams, ValidatorTxParams, UpdateValidatorTxParams, InactiveValidatorTxParams, ReactivateValidatorTxParams, UnparkValidatorTxParams, DeleteValidatorTxParams };
export { GetBlockByParams, GetLatestBlockParams, GetSlotAtParams, GetTransactionsByAddressParams, GetTransactionByParams, GetInherentsByParams, GetAccountByAddressParams, GetValidatorByAddressParams, GetStakerByAddressParams, SubscribeForHeadBlockParams, SubscribeForValidatorElectionByAddressParams, SubscribeForLogsByAddressesAndTypesParams };


type ValidatorInfo = {address: Address, address_raw: string, public_key: string, private_key: string}

async function main(){ 
    const client = new Client(new URL("http://localhost:10300"));
    const validatorsRaw = `{'address': 'NQ82 709H BN21 XS8E 1CDV 097S S2HQ TEXA 4Q9Q', 'address_raw': '381315d841f690e0b1bd024fad0a38dbbca26138', 'public_key': 'c96d57fdb42a00c63fc9e52a20eb2b115d6b32339d9369a12e4faaf712582e47', 'private_key': '6768a5d95ca4d2feb28202e8a6f5419e1b39445eaf8f6ff645dcf7a0aec33dfd'}
    {'address': 'NQ47 26S2 EK9Q PS1Y NQ4N Q7RY RUX7 L0D5 851K', 'address_raw': '11b4274d38be83fb6096c1f3fcf3c7a01a541433', 'public_key': '5fb3341e6e5d15e9ccfea76ce90f5afa5a7ea9dcfa0e4e0c5f00deaa138e86b5', 'private_key': 'd3141735f162a155201e652875e5d9a11a62e789d0199522fd726632fc8682e1'}
    {'address': 'NQ36 0HNP 6VSN L3GQ LT3S 6PL8 SJ5C C93F RC7L', 'address_raw': '046d737756a0e18a6c7a35e88d48ac6246fcb0f4', 'public_key': '164f8ee11481fc8a6b1440eb3b497074c41519a3b1419e81630274bb7f61fff6', 'private_key': '660a182e59e07959dc2163011bb2f305ba17e9d295fca64cdc50eff4bf672bf8'}
    {'address': 'NQ20 9KVB 3PSU EU1P JS5Y S1CG 62MV 41D7 8N3V', 'address_raw': '4cfab1df5c77037968bfd059030abd205a74587d', 'public_key': 'd8a4670ab251e403244ccf69753fde376230d0a451150cf22323c493e449e117', 'private_key': 'b7f13d701c5df3ba041a579cfd909e434571461c36188b5cb123c79549db535d'}
    {'address': 'NQ50 DN39 3XHP UF8M SJMK AHXK PCJ4 70PY 423Q', 'address_raw': '6d8691fa37e3d15d4ab3547d3bb244382ff20878', 'public_key': '7a13010bcf3bf5f7508e61f159bbadf3a9a5fd28431c4d1df644f3d1137f0b11', 'private_key': 'b9e1514fd67a9897fbbe8182b8c5fefd930b4ebc65d8fd9ebcadfa2782ea61dd'}
    {'address': 'NQ61 51CX JL53 0MDX TGV5 MQQK 99TE Q4AT L3FU', 'address_raw': '2859e950a3055bedc3a5ae3134a76ec115ba0dfc', 'public_key': 'ab9627822c94598cfe160ddda8dd31a2986af835ee693c4f5dc47e0e4418f952', 'private_key': 'ce797d122a9209005bdfbfaf7c06cf18e1e1e2b6d3baa071d41f6a63e5fa83fe'}
    {'address': 'NQ73 LGQ0 1DMV U5AU JU9H 9Y22 JD3S YKLS MY5R', 'address_raw': 'a43000b6bde155c971314fc429347afce9aafcb9', 'public_key': 'a0305d6c6e6b978eb9692e5b1674b82bebb0bbcb5fb692af60b7852adeb651d7', 'private_key': '7f00ad766c9a38bd5bea6d9512800e1798b92caa01b87d791f088f3e9247397e'}
    {'address': 'NQ07 K2GF 7H18 Q6T0 AVCD K97Q UXJP 1US1 DFSV', 'address_raw': '98a0f3c428c1b605758d9a4f8e7a570f3416bf5d', 'public_key': 'fe90fe51dc5a81412546d8ec8de7c51e682dc24b95f898d60760dda12bc90ddf', 'private_key': 'ae8d9693ffe8668f634656e2c0820b3aa0a93ab34efe838a9c2a8a2d1e11b91e'}
    {'address': 'NQ26 VJCS Y30L SAMU C2BV US8S 87UD VRJH 364C', 'address_raw': 'ec99af8c14d2abc6097de691a41f8dee6511988c', 'public_key': '49789bf04f94b407f00a1c3ea6e5a608467d549965e98b2b4ff925e08c948ff4', 'private_key': '5fc84ac337805dd5a620d74124a8d59072fe5cbafa79dcc44c18359788b9514f'}
    {'address': 'NQ10 ARQ6 KKAU 8DY7 EJPJ C1FQ LT6D 5G60 JME8', 'address_raw': '567069cd5c437e774af2605f8a6ccd2c0c0955c8', 'public_key': '96e342cb36fc4280e3302708c7b124f9a73fb8d01d4f69380cdac5a857f37871', 'private_key': '94e32559af3e21c48b9d9e81487ff742f4ec2de8a907b291b139f414381497bd'}
    {'address': 'NQ42 VHT8 M32B E6CH JNK1 PF4F J01S Q8HK RKYU', 'address_raw': 'ec768a8c4b7199195a61bbc8f9003ac2233ccffc', 'public_key': 'c14b8c88813fef4d0749ffb0f877dc36709eea88485e31a76ba7d7cfc4f72d63', 'private_key': '0bc79138f6fd633218277044675c02b42f48a3ab20d8889db2a051e3eef7ff45'}
    {'address': 'NQ95 XXJL VE7K 0JVB 92YN R4QX 4Q2Y 2MCN 10YG', 'address_raw': 'f7a54eb8f304bab48bf6c931e2605f15596083f0', 'public_key': 'ced9e6199a50773b673e820bdc4a0c8af5d85460b5b352632a92b0c3de6b38ff', 'private_key': 'a575f785f48fe5a74738a9ab4a5e882be8808698786c8386d15cecfac5fa5b80'}`

    const validators = validatorsRaw.split('\n')
        .map(v => v.replace(/'/g, '"'))
        .map(v => JSON.parse(v)) as ValidatorInfo[];

    const {address, private_key} = validators[1];

    const {data} = await client.constant.params()
    if (!data) {
        throw new Error('No data')
    }
    const { stakingContractAddress } = data;

    const accounts = await client.account.list();
    console.log('Accounts', accounts)
    console.log('')
    console.log('')

    const unlocked = await client.account.unlock({address});
    console.log('Unlocked', unlocked)
    console.log('')
    console.log('')

    const { next } = await client.logs.subscribe({addresses: [address, stakingContractAddress]});
    next(data => {
        console.log('New TX')
        console.log(data);
        console.log('')
        console.log('')
        console.log('')

    })
    const params: InactiveValidatorTxParams = {
        fee: 0,
        senderWallet: address,
        signingSecretKey: private_key,
        validator: address,
        relativeValidityStartHeight: 4
    }

    console.log({params})

    const tx = await client.validator.action.inactive.send(params).catch(e => console.error(e))
    console.log('inactive TX')
    console.log(tx);
}

main();
