import { Account, Address, BatchIndex, Block, BlockNumber, Coin, EpochIndex, Hash, Inherent, MempoolInfo, PartialBlock, PolicyConstants, RawTransaction, Signature, SlashedSlot, Slot, Staker, Transaction, Validator, WalletAccount } from "./common";
import { BlockLog } from "./logs";

// Metadatas
export type BlockchainState = { 
    blockNumber: BlockNumber;
    blockHash: Hash;
}

type Interaction<Params extends any[], Result, Metadata = null> = {
    // In the request
    params: Params

    // In the response
    result: Result
    metadata: Metadata
}

type Maybe<T> = T | undefined

// TODO Review the metadatas types
export type BlockchainMethods = {
    'getBlockNumber': Interaction<[], BlockNumber>,
    'getBatchNumber': Interaction<[], BatchIndex>,
    'getEpochNumber': Interaction<[], EpochIndex>,
    'getBlockByHash': Interaction<[Hash, /* include_transactions */Maybe<Boolean>], Block>,
    'getBlockByNumber': Interaction<[BlockNumber, /* include_transactions */Maybe<Boolean>], Block>,
    'getLatestBlock': Interaction<[/* include_transactions */Maybe<Boolean>], Block>,
    'getSlotAt': Interaction<[BlockNumber, /* offset_opt u32 */Maybe<number>], Slot, BlockchainState>,
    'getTransactionByHash': Interaction<[Hash], Transaction>,
    'getTransactionsByBlockNumber': Interaction<[BlockNumber], Transaction[]>,
    'getInherentsByBlockNumber': Interaction<[BlockNumber], Inherent[]>,
    'getTransactionsByBatchNumber': Interaction<[BatchIndex], Transaction[]>,
    'getInherentsByBatchNumber': Interaction<[BatchIndex], Inherent[]>,
    'getTransactionHashesByAddress': Interaction<[Address, /* max u16 */Maybe<number>], Hash[]>,
    'getTransactionsByAddress': Interaction<[Address, /* max u16 */Maybe<number>], Transaction[]>,
    'getAccountByAddress': Interaction<[Address], Account, BlockchainState>,
    'getActiveValidators': Interaction<[], Validator[], BlockchainState>,
    'getCurrentSlashedSlots': Interaction<[], SlashedSlot[], BlockchainState>,
    'getPreviousSlashedSlots': Interaction<[], SlashedSlot[], BlockchainState>,
    'getParkedValidators': Interaction<[], { blockNumber: BlockNumber, validators: Validator[]}, BlockchainState>,
    'getValidatorByAddress': Interaction<[Address, /* include_stakers */Maybe<Boolean>], Validator | PartialValidator, BlockchainState>,
    'getStakerByAddress': Interaction<[Address], Staker, BlockchainState>,
}

// When you open a stream, the server will return a subscription number
// which we will ignore for now
export type StreamOpened = {
    'streamOpened': Interaction<[], number>
}

export type BlockchainStreams = {
    'subscribeForHeadBlock': Interaction<[/* include_transactions */Maybe<Boolean>], Block | PartialBlock>,
    'subscribeForHeadBlockHash': Interaction<[], Hash>,
    'subscribeForValidatorElectionByAddress': Interaction<[Address], Validator, BlockchainState>,
    'subscribeForLogsByAddressesAndTypes': Interaction<[Address[], /*Check out logs-types.ts*/string[]], BlockLog, BlockchainState>,
}

export type ConsensusMethods = {
    'isConsensusEstablished': Interaction<[], Boolean>,
    'getRawTransactionInfo': Interaction<[RawTransaction], Transaction>,
    'sendRawTransaction': Interaction<[RawTransaction], Hash>,
    'createBasicTransaction': Interaction<[/* wallet */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */string], RawTransaction>,
    'sendBasicTransaction': Interaction<[/* wallet */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'createBasicTransactionWithData': Interaction<[/* wallet */Address, /* recipient */Address, /*data*/string, /* value */Coin, /* fee */Coin, /* validity_start_height */string], RawTransaction>,
    'sendBasicTransactionWithData': Interaction<[/* wallet */Address, /* recipient */Address, /*data*/string, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'createNewVestingTransaction': Interaction<[/* wallet */Address, /* owner */Address, /* start_time */number, /* time_step */number, /* num_steps */number, /* value */Coin, /* fee */Coin, /* validity_start_height */string], RawTransaction>,
    'sendNewVestingTransaction': Interaction<[/* wallet */Address, /* owner */Address, /* start_time */number, /* time_step */number, /* num_steps */number, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'createRedeemVestingTransaction': Interaction<[/* wallet */Address, /* contract_address */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */string], RawTransaction>,
   'sendRedeemVestingTransaction': Interaction<[/* wallet */Address, /* contract_address */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'createNewHtlcTransaction': Interaction<[/* wallet */Address, /* htlc_sender */Address, /* htlc_recipient */Address, /* hash_root */AnyHash, /* hash_count */number, /* hash_algorithm */HashAlgorithm, /* timeout */number, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'sendNewHtlcTransaction': Interaction<[/* wallet */Address, /* htlc_sender */Address, /* htlc_recipient */Address, /* hash_root */AnyHash, /* hash_count */number, /* hash_algorithm */HashAlgorithm, /* timeout */number, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'createRedeemRegularHtlcTransaction': Interaction<[/* wallet */Address, /* contract_address */Address,  /* recipient */Address, /* pre_image */AnyHash, /* hash_root */AnyHash, /* hash_count */number, /* hash_algorithm */HashAlgorithm, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'sendRedeemRegularHtlcTransaction': Interaction<[/* wallet */Address, /* contract_address */Address,  /* recipient */Address, /* pre_image */AnyHash, /* hash_root */AnyHash, /* hash_count */number, /* hash_algorithm */HashAlgorithm, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'createRedeemTimeoutHtlcTransaction': Interaction<[/* wallet */Address, /* htlc_address */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'sendRedeemTimeoutHtlcTransaction': Interaction<[/* wallet */Address, /* htlc_address */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'createRedeemEarlyHtlcTransaction': Interaction<[/* wallet */Address, /* htlc_address */Address, /* recipient */Address, /* htlc_sender_signature */String, /* htlc_recipient_signature */String, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'sendRedeemEarlyHtlcTransaction': Interaction<[/* wallet */Address, /* htlc_address */Address, /* recipient */Address, /* htlc_sender_signature */String, /* htlc_recipient_signature */String, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'signRedeemEarlyHtlcTransaction': Interaction<[/* wallet */Address, /* htlc_address */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */string], String>,
    'createNewStakerTransaction': Interaction<[/* sender_wallet */Address, /* staker */Address, /* delegation */Maybe<Address>, /* value */Coin, /* fee */Coin, /* validity_start_height */string], RawTransaction>,
    'sendNewStakerTransaction': Interaction<[/* sender_wallet */Address, /* staker */Address, /* delegation */Maybe<Address>, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'createStakeTransaction': Interaction<[/* sender_wallet */Address, /* staker */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */string], RawTransaction>,
    'sendStakeTransaction': Interaction<[/* sender_wallet */Address, /* staker */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'createUpdateStakerTransaction': Interaction<[/* sender_wallet */Address, /* staker */Address, /* new_delegation */Address, /* fee */Coin, /* validity_start_height */string], RawTransaction>,
    'sendUpdateStakerTransaction': Interaction<[/* sender_wallet */Address, /* staker */Address, /* new_delegation */Address, /* fee */Coin, /* validity_start_height */string], Hash>,
    'createUnstakeTransaction': Interaction<[/* sender_wallet */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */string], RawTransaction>,
    'sendUnstakeTransaction': Interaction<[/* sender_wallet */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */string], Hash>,
    'createNewValidatorTransaction': Interaction<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* voting_secret_key */String, /* reward_address */Address, /* signal_data */String, /* fee */Coin, /* validity_start_height */string], RawTransaction>,
    'sendNewValidatorTransaction': Interaction<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* voting_secret_key */String, /* reward_address */Address, /* signal_data */String, /* fee */Coin, /* validity_start_height */string], Hash>,
    'createUpdateValidatorTransaction': Interaction<[/* sender_wallet */Address, /* validator */Address, /* new_signing_secret_key */String, /* new_voting_secret_key */String, /* new_reward_address */Address, /* new_signal_data */String, /* fee */Coin, /* validity_start_height */string], RawTransaction>,
    'sendUpdateValidatorTransaction': Interaction<[/* sender_wallet */Address, /* validator */Address, /* new_signing_secret_key */String, /* new_voting_secret_key */String, /* new_reward_address */Address, /* new_signal_data */String, /* fee */Coin, /* validity_start_height */string], Hash>,
    'createInactivateValidatorTransaction': Interaction<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* fee */Coin, /* validity_start_height */string], RawTransaction>,
    'sendInactivateValidatorTransaction': Interaction<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* fee */Coin, /* validity_start_height */ValidityStartHeight], Hash>,
    'createReactivateValidatorTransaction': Interaction<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* fee */Coin, /* validity_start_height */ValidityStartHeight], RawTransaction>,
    'sendReactivateValidatorTransaction': Interaction<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* fee */Coin, /* validity_start_height */ValidityStartHeight], Hash>,
    'createUnparkValidatorTransaction': Interaction<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* fee */Coin, /* validity_start_height */ValidityStartHeight], RawTransaction>,
    'sendUnparkValidatorTransaction': Interaction<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* fee */Coin, /* validity_start_height */ValidityStartHeight], Hash>,
    'createDeleteValidatorTransaction': Interaction<[/* sender_wallet */Address, /* recipient */Address, /* fee */Coin, /* value */Coin, /* validity_start_height */ValidityStartHeight], RawTransaction>,
    'sendDeleteValidatorTransaction': Interaction<[/* sender_wallet */Address, /* recipient */Address, /* fee */Coin, /* value */Coin, /* validity_start_height */ValidityStartHeight], Hash>,
}

export type MempoolMethods = {
    'pushTransaction': Interaction<[/* transaction */RawTransaction], Hash>,
    'pushHighPriorityTransaction': Interaction<[/* transaction */RawTransaction], Hash>,
    'mempoolContent': Interaction<[/* include_transactions */Boolean], (Hash | Transaction)[]>,
    'mempool': Interaction<[], MempoolInfo>,
    'getMinFeePerByte': Interaction<[], /* f64 */number>,
}

export type NetworkMethods = {
    'getPeerId': Interaction<[], String>,
    'getPeerCount': Interaction<[], number>,
    'getPeerList': Interaction<[], string[]>,
}

export type PolicyMethods = {
    'getPolicyConstants': Interaction<[], PolicyConstants>,
    'getEpochAt': Interaction<[BlockNumber], EpochIndex>,
    'getEpochIndexAt': Interaction<[BlockNumber], EpochIndex>,
    'getBatchAt': Interaction<[BlockNumber], BatchIndex>,
    'getBatchIndexAt': Interaction<[BlockNumber], BatchIndex>,
    'getElectionBlockAfter': Interaction<[BlockNumber], BlockNumber>,
    'getElectionBlockBefore': Interaction<[BlockNumber], BlockNumber>,
    'getLastElectionBlock': Interaction<[BlockNumber], BlockNumber>,
    'getIsElectionBlockAt': Interaction<[BlockNumber], Boolean>,
    'getMacroBlockAfter': Interaction<[BlockNumber], BlockNumber>,
    'getMacroBlockBefore': Interaction<[BlockNumber], BlockNumber>,
    'getLastMacroBlock': Interaction<[BlockNumber], BlockNumber>,
    'getIsMacroBlockAt': Interaction<[BlockNumber], Boolean>,
    'getIsMicroBlockAt': Interaction<[BlockNumber], Boolean>,
    'getFirstBlockOf': Interaction<[EpochIndex], BlockNumber>,
    'getFirstBlockOfBatch': Interaction<[BatchIndex], BlockNumber>,
    'getElectionBlockOf': Interaction<[EpochIndex], BlockNumber>,
    'getMacroBlockOf': Interaction<[BatchIndex], BlockNumber>,
    'getFirstBatchOfEpoch': Interaction<[BlockNumber], Boolean>,
    'getSupplyAt': Interaction<[GenesisSupply, GenesisTime, CurrentTime], number>,
}

export type ValidatorMethods = {
    'getAddress': Interaction<[], Address>,
    'getSigningKey': Interaction<[], String>,
    'getVotingKey': Interaction<[], String>,
    'setAutomaticReactivation': Interaction<[/* automatic_reactivation */Boolean], null>,
}

export type WalletMethods = {
    'importRawKey': Interaction<[/* key_data */String, /* passphrase */Maybe<String>], Address>,
    'isAccountImported': Interaction<[/* address */Address], Boolean>,
    'listAccounts': Interaction<[], Address[]>,
    'lockAccount': Interaction<[/* address */Address], null>,
    'createAccount': Interaction<[/* passphrase */Maybe<String>], WalletAccount>,
    'unlockAccount': Interaction<[/* address */Address, /* passphrase */String, /* duration: u64 */Maybe<number>], Boolean>,
    'isAccountLocked': Interaction<[/* address */Address], Boolean>,
    'sign': Interaction<[/* message */String, /* address */Address, /* passphrase */Maybe<String>, /* is_hex */Boolean], Signature>,
    'verifySignature': Interaction<[/* message */String, /* public_key */PublicKey, /* signature */Signature, /* is_hex */Boolean], Boolean>,
}

export type ZKPStateKebab = {
    'latest-header-number': Hash
    'latest-block-number': BlockNumber
    'latest-proof'?: string
}

export type ZkpComponentMethods = {
    'getZkpState': Interaction<[], ZKPStateKebab>,
}
