import { Account, Address, BatchIndex, Block, BlockNumber, Coin, EpochIndex, Hash, Inherent, MempoolInfo, MicroBlock, PolicyConstants, RawTransaction, Signature, SlashedSlots, Staker, Transaction, Validator, WalletAccount } from "./common"

// Metadatas
export type BlockchainState = { 
    blockNumber: BlockNumber;
    blockHash: Hash;
}

type RpcInteraction<Params extends any[], Result, Metadata = null> = {
    // In the request
    params: Params

    // In the response
    result: Result
    metadata: Metadata
}

type Maybe<T> = T | undefined

// TODO Review the metadatas types
export type BlockchainMethods = {
    'getBlockNumber': RpcInteraction<[], BlockNumber>,
    'getBatchNumber': RpcInteraction<[], BatchIndex>,
    'getEpochNumber': RpcInteraction<[], EpochIndex>,
    'getBlockByHash': RpcInteraction<[Hash, /* include_transactions */Maybe<Boolean>], Validator[]>,
    'getBlockByNumber': RpcInteraction<[BlockNumber, /* include_transactions */Maybe<Boolean>], Validator[]>,
    'getLatestBlock': RpcInteraction<[/* include_transactions */Maybe<Boolean>], MicroBlock[]>,
    'getSlotAt': RpcInteraction<[BlockNumber, /* offset_opt u32 */Maybe<number>], Slot, BlockchainState>,
    'getTransactionByHash': RpcInteraction<[Hash], Transaction>,
    'getTransactionsByBlockNumber': RpcInteraction<[BlockNumber], Transaction[]>,
    'getInherentsByBlockNumber': RpcInteraction<[BlockNumber], Inherent[]>,
    'getTransactionsByBatchNumber': RpcInteraction<[BatchIndex], Transaction[]>,
    'getInherentsByBatchNumber': RpcInteraction<[BatchIndex], Inherent[]>,
    'getTransactionHashesByAddress': RpcInteraction<[Address, /* max u16 */Maybe<number>], Hash[]>,
    'getTransactionsByAddress': RpcInteraction<[Address, /* max u16 */Maybe<number>], Transaction[]>,
    'getAccountByAddress': RpcInteraction<[Address], Account, BlockchainState>,
    'getActiveValidators': RpcInteraction<[], Validator[], BlockchainState>,
    'getCurrentSlashedSlots': RpcInteraction<[], SlashedSlots[], BlockchainState>,
    'getPreviousSlashedSlots': RpcInteraction<[], SlashedSlots[], BlockchainState>,
    'getParkedValidators': RpcInteraction<[], Validator[], BlockchainState>,
    'getValidatorByAddress': RpcInteraction<[Address, /* include_stakers */Maybe<Boolean>], Validator, BlockchainState>,
    'getStakerByAddress': RpcInteraction<[Address], Staker, BlockchainState>,
}

export type BlockchainStreams = {
    'subscribeForHeadBlock': RpcInteraction<[/* include_transactions */Maybe<Boolean>], MicroBlock[]>,
    'subscribeForHeadBlockHash': RpcInteraction<[], Hash>,
    'subscribeForValidatorElectionByAddress': RpcInteraction<[Address], Validator, BlockchainState>,
    'subscribeForLogsByAddressesAndTypes': RpcInteraction<[Address[], /*TODO*/any[]], /*TODO*/any, BlockchainState>,
}

export type ConsensusMethods = {
    'isConsensusEstablished': RpcInteraction<[], Boolean>,
    'getRawTransactionInfo': RpcInteraction<[RawTransaction], Transaction>,
    'sendRawTransaction': RpcInteraction<[RawTransaction], Hash>,
    'createBasicTransaction': RpcInteraction<[/* wallet */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], RawTransaction>,
    'sendBasicTransaction': RpcInteraction<[/* wallet */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash>,
    'createBasicTransactionWithData': RpcInteraction<[/* wallet */Address, /* recipient */Address, /*data*/string, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], RawTransaction>,
    'sendBasicTransactionWithData': RpcInteraction<[/* wallet */Address, /* recipient */Address, /*data*/string, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash>,
    'createNewVestingTransaction': RpcInteraction<[/* wallet */Address, /* owner */Address, /* start_time */number, /* time_step */number, /* num_steps */number, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], RawTransaction>,
    'sendNewVestingTransaction': RpcInteraction<[/* wallet */Address, /* owner */Address, /* start_time */number, /* time_step */number, /* num_steps */number, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash>,
    'createRedeemVestingTransaction': RpcInteraction<[/* wallet */Address, /* contract_address */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], RawTransaction>,
   'sendRedeemVestingTransaction': RpcInteraction<[/* wallet */Address, /* contract_address */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash>,
    'createNewHtlcTransaction': RpcInteraction<[/* wallet */Address, /* htlc_sender */Address, /* htlc_recipient */Address, /* hash_root */AnyHash, /* hash_count */number, /* hash_algorithm */HashAlgorithm, /* timeout */number, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash>,
    'sendNewHtlcTransaction': RpcInteraction<[/* wallet */Address, /* htlc_sender */Address, /* htlc_recipient */Address, /* hash_root */AnyHash, /* hash_count */number, /* hash_algorithm */HashAlgorithm, /* timeout */number, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash>,
    'createRedeemRegularHtlcTransaction': RpcInteraction<[/* wallet */Address, /* contract_address */Address,  /* recipient */Address, /* pre_image */AnyHash, /* hash_root */AnyHash, /* hash_count */number, /* hash_algorithm */HashAlgorithm, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash>,
    'sendRedeemRegularHtlcTransaction': RpcInteraction<[/* wallet */Address, /* contract_address */Address,  /* recipient */Address, /* pre_image */AnyHash, /* hash_root */AnyHash, /* hash_count */number, /* hash_algorithm */HashAlgorithm, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash>,
    'createRedeemTimeoutHtlcTransaction': RpcInteraction<[/* wallet */Address, /* htlc_address */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash>,
    'sendRedeemTimeoutHtlcTransaction': RpcInteraction<[/* wallet */Address, /* htlc_address */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash>,
    'createRedeemEarlyHtlcTransaction': RpcInteraction<[/* wallet */Address, /* htlc_address */Address, /* recipient */Address, /* htlc_sender_signature */String, /* htlc_recipient_signature */String, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash>,
    'sendRedeemEarlyHtlcTransaction': RpcInteraction<[/* wallet */Address, /* htlc_address */Address, /* recipient */Address, /* htlc_sender_signature */String, /* htlc_recipient_signature */String, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash>,
    'signRedeemEarlyHtlcTransaction': RpcInteraction<[/* wallet */Address, /* htlc_address */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], String>,
    'createNewStakerTransaction': RpcInteraction<[/* sender_wallet */Address, /* staker */Address, /* delegation */Maybe<Address>, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], RawTransaction>,
    'sendNewStakerTransaction': RpcInteraction<[/* sender_wallet */Address, /* staker */Address, /* delegation */Maybe<Address>, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash>,
    'createStakeTransaction': RpcInteraction<[/* sender_wallet */Address, /* staker */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], RawTransaction>,
    'sendStakeTransaction': RpcInteraction<[/* sender_wallet */Address, /* staker */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash>,
    'createUpdateStakerTransaction': RpcInteraction<[/* sender_wallet */Address, /* staker */Address, /* new_delegation */Address, /* fee */Coin, /* validity_start_height */BlockNumber], RawTransaction>,
    'sendUpdateStakerTransaction': RpcInteraction<[/* sender_wallet */Address, /* staker */Address, /* new_delegation */Address, /* fee */Coin, /* validity_start_height */BlockNumber], Hash>,
    'createUnstakeTransaction': RpcInteraction<[/* sender_wallet */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], RawTransaction>,
    'sendUnstakeTransaction': RpcInteraction<[/* sender_wallet */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash>,
    'createNewValidatorTransaction': RpcInteraction<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* voting_secret_key */String, /* reward_address */Address, /* signal_data */String, /* fee */Coin, /* validity_start_height */BlockNumber], RawTransaction>,
    'sendNewValidatorTransaction': RpcInteraction<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* voting_secret_key */String, /* reward_address */Address, /* signal_data */String, /* fee */Coin, /* validity_start_height */BlockNumber], Hash>,
    'createUpdateValidatorTransaction': RpcInteraction<[/* sender_wallet */Address, /* validator */Address, /* new_signing_secret_key */String, /* new_voting_secret_key */String, /* new_reward_address */Address, /* new_signal_data */String, /* fee */Coin, /* validity_start_height */BlockNumber], RawTransaction>,
    'sendUpdateValidatorTransaction': RpcInteraction<[/* sender_wallet */Address, /* validator */Address, /* new_signing_secret_key */String, /* new_voting_secret_key */String, /* new_reward_address */Address, /* new_signal_data */String, /* fee */Coin, /* validity_start_height */BlockNumber], Hash>,
    'createInactivateValidatorTransaction': RpcInteraction<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* fee */Coin, /* validity_start_height */BlockNumber], RawTransaction>,
    'sendInactivateValidatorTransaction': RpcInteraction<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* fee */Coin, /* validity_start_height */BlockNumber], Hash>,
    'createReactivateValidatorTransaction': RpcInteraction<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* fee */Coin, /* validity_start_height */BlockNumber], RawTransaction>,
    'sendReactivateValidatorTransaction': RpcInteraction<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* fee */Coin, /* validity_start_height */BlockNumber], Hash>,
    'createUnparkValidatorTransaction': RpcInteraction<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* fee */Coin, /* validity_start_height */BlockNumber], RawTransaction>,
    'sendUnparkValidatorTransaction': RpcInteraction<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* fee */Coin, /* validity_start_height */BlockNumber], Hash>,
    'createDeleteValidatorTransaction': RpcInteraction<[/* sender_wallet */Address, /* recipient */Address, /* fee */Coin, /* value */Coin, /* validity_start_height */BlockNumber], RawTransaction>,
    'sendDeleteValidatorTransaction': RpcInteraction<[/* sender_wallet */Address, /* recipient */Address, /* fee */Coin, /* value */Coin, /* validity_start_height */BlockNumber], Hash>,
}

export type MempoolMethods = {
    'pushTransaction': RpcInteraction<[/* transaction */RawTransaction], Hash>,
    'pushHighPriorityTransaction': RpcInteraction<[/* transaction */RawTransaction], Hash>,
    'mempoolContent': RpcInteraction<[/* include_transactions */Boolean], (Hash | Transaction)[]>,
    'mempool': RpcInteraction<[], MempoolInfo>,
    'getMinFeePerByte': RpcInteraction<[], /* f64 */number>,
}

export type NetworkMethods = {
    'getPeerId': RpcInteraction<[], String>,
    'getPeerCount': RpcInteraction<[], number>,
    'getPeerList': RpcInteraction<[], string[]>,
}

export type PolicyMethods = {
    'getPolicyConstants': RpcInteraction<[], PolicyConstants>,
    'getEpochAt': RpcInteraction<[BlockNumber], EpochIndex>,
    'getEpochIndexAt': RpcInteraction<[BlockNumber], EpochIndex>,
    'getBatchAt': RpcInteraction<[BlockNumber], BatchIndex>,
    'getBatchIndexAt': RpcInteraction<[BlockNumber], BatchIndex>,
    'getElectionBlockAfter': RpcInteraction<[BlockNumber], BlockNumber>,
    'getElectionBlockBefore': RpcInteraction<[BlockNumber], BlockNumber>,
    'getLastElectionBlock': RpcInteraction<[BlockNumber], BlockNumber>,
    'getIsElectionBlockAt': RpcInteraction<[BlockNumber], Boolean>,
    'getMacroBlockAfter': RpcInteraction<[BlockNumber], BlockNumber>,
    'getMacroBlockBefore': RpcInteraction<[BlockNumber], BlockNumber>,
    'getLastMacroBlock': RpcInteraction<[BlockNumber], BlockNumber>,
    'getIsMacroBlockAt': RpcInteraction<[BlockNumber], Boolean>,
    'getIsMicroBlockAt': RpcInteraction<[BlockNumber], Boolean>,
    'getFirstBlockOf': RpcInteraction<[EpochIndex], BlockNumber>,
    'getFirstBlockOfBatch': RpcInteraction<[BatchIndex], BlockNumber>,
    'getElectionBlockOf': RpcInteraction<[EpochIndex], BlockNumber>,
    'getMacroBlockOf': RpcInteraction<[BatchIndex], BlockNumber>,
    'getFirstBatchOfEpoch': RpcInteraction<[BlockNumber], Boolean>,
    'getSupplyAt': RpcInteraction<[GenesisSupply, GenesisTime, CurrentTime], number>,
}

export type ValidatorMethods = {
    'getAddress': RpcInteraction<[], Address>,
    'getSigningKey': RpcInteraction<[], String>,
    'getVotingKey': RpcInteraction<[], String>,
    'setAutomaticReactivation': RpcInteraction<[/* automatic_reactivation */Boolean], null>,
}

export type WalletMethods = {
    'importRawKey': RpcInteraction<[/* key_data */String, /* passphrase */Maybe<String>], Address>,
    'isAccountImported': RpcInteraction<[/* address */Address], Boolean>,
    'listAccounts': RpcInteraction<[], Address[]>,
    'lockAccount': RpcInteraction<[/* address */Address], null>,
    'createAccount': RpcInteraction<[/* passphrase */Maybe<String>], WalletAccount>,
    'unlockAccount': RpcInteraction<[/* address */Address, /* passphrase */String, /* duration: u64 */Maybe<number>], Boolean>,
    'isAccountLocked': RpcInteraction<[/* address */Address], Boolean>,
    'sign': RpcInteraction<[/* message */String, /* address */Address, /* passphrase */Maybe<String>, /* is_hex */Boolean], Signature>,
    'verifySignature': RpcInteraction<[/* message */String, /* public_key */PublicKey, /* signature */Signature, /* is_hex */Boolean], Boolean>,
}

export type ZkpComponentMethods = {
    'getZKPState': RpcInteraction<[], ZKPState>,
}
