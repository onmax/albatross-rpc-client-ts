import { Account, Address, BatchIndex, BlockNumber, Coin, EpochIndex, Hash, Inherent, MempoolInfo, MicroBlock, PolicyConstants, RawTransaction, Signature, SlashedSlots, Staker, Transaction, Validator, WalletAccount } from "./common"

type MethodConfig<Params extends any[], Result, Metadata> = {
    // In the request
    params: Params

    // In the response
    result: Result
    metadata: Metadata
}

type Maybe<T> = T | undefined

// TODO Review the metadatas types

export type BlockchainMethods = {
    'getBlockNumber': MethodConfig<[], BlockNumber, null>,
    'getBatchNumber': MethodConfig<[], BatchIndex, null>,
    'getEpochNumber': MethodConfig<[], EpochIndex, null>,
    'getBlockByHash': MethodConfig<[Hash, /* include_transactions */Maybe<Boolean>], Validator[], null>,
    'getBlockByNumber': MethodConfig<[BlockNumber, /* include_transactions */Maybe<Boolean>], Validator[], null>,
    'getLatestBlock': MethodConfig<[/* include_transactions */Maybe<Boolean>], MicroBlock[], null>,
    'getSlotAt': MethodConfig<[BlockNumber, /* offset_opt u32 */Maybe<number>], Slot, null>,
    'getTransactionByHash': MethodConfig<[Hash], Transaction, null>,
    'getTransactionsByBlockNumber': MethodConfig<[BlockNumber], Transaction[], null>,
    'getInherentsByBlockNumber': MethodConfig<[BlockNumber], Inherent[], null>,
    'getTransactionsByBatchNumber': MethodConfig<[BatchIndex], Transaction[], null>,
    'getInherentsByBatchNumber': MethodConfig<[BatchIndex], Inherent[], null>,
    'getTransactionHashesByAddress': MethodConfig<[Address, /* max u16 */Maybe<number>], Hash[], null>,
    'getTransactionsByAddress': MethodConfig<[Address, /* max u16 */Maybe<number>], Transaction[], null>,
    'getAccountByAddress': MethodConfig<[Address], Account, null>,
    'getActiveValidators': MethodConfig<[], Validator[], null>,
    'getCurrentSlashedSlots': MethodConfig<[], SlashedSlots[], null>,
    'getPreviousSlashedSlots': MethodConfig<[], SlashedSlots[], null>,
    'getParkedValidators': MethodConfig<[], Validator[], null>,
    'getValidatorByAddress': MethodConfig<[Address, /* include_stakers */Maybe<Boolean>], Validator, null>,
    'getStakerByAddress': MethodConfig<[Address], Staker, null>,

    // TODO implement streams
    /// Subscribes to new block events (retrieves the full block).
    // async fn subscribe_for_head_block(
    //     &mut self,
    //     include_transactions: Option<bool>,
    // ) -> Result<BoxStream<'static, RPCData<Block, ()>>, Self::Error> {

         /// Subscribes to new block events (only retrieves the block hash).
    // async fn subscribe_for_head_block_hash(
    //     &mut self,
    // ) -> Result<BoxStream<'static, RPCData<Blake2bHash, ()>>, Self::Error> {

    /// Subscribes to pre epoch validators events.
    // #[stream]
    // async fn subscribe_for_validator_election_by_address(
    //     &mut self,
    //     address: Address,
    // ) -> Result<BoxStream<'static, RPCData<Validator, BlockchainState>>, Self::Error> {

    /// Subscribes to log events related to a given list of addresses and of any of the log types provided.
    /// If addresses is empty it does not filter by address. If log_types is empty it won't filter by log types.
    /// Thus the behavior is to assume all addresses or log_types are to be provided if the corresponding vec is empty.
    // #[stream]
    // async fn subscribe_for_logs_by_addresses_and_types(
    //     &mut self,
    //     addresses: Vec<Address>,
    //     log_types: Vec<LogType>,
    // ) -> Result<BoxStream<'static, RPCData<BlockLog, BlockchainState>>, Self::Error> {
}

export type ConsensusMethods = {
    'isConsensusEstablished': MethodConfig<[], Boolean, null>,
    'getRawTransactionInfo': MethodConfig<[RawTransaction], Transaction, null>,
    'sendRawTransaction': MethodConfig<[RawTransaction], Hash, null>,
    'createBasicTransaction': MethodConfig<[/* wallet */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], RawTransaction, null>,
    'sendBasicTransaction': MethodConfig<[/* wallet */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash, null>,
    'createBasicTransactionWithData': MethodConfig<[/* wallet */Address, /* recipient */Address, /*data*/string, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], RawTransaction, null>,
    'sendBasicTransactionWithData': MethodConfig<[/* wallet */Address, /* recipient */Address, /*data*/string, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash, null>,
    'createNewVestingTransaction': MethodConfig<[/* wallet */Address, /* owner */Address, /* start_time */number, /* time_step */number, /* num_steps */number, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], RawTransaction, null>,
    'sendNewVestingTransaction': MethodConfig<[/* wallet */Address, /* owner */Address, /* start_time */number, /* time_step */number, /* num_steps */number, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash, null>,
    'createRedeemVestingTransaction': MethodConfig<[/* wallet */Address, /* contract_address */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], RawTransaction, null>,
   'sendRedeemVestingTransaction': MethodConfig<[/* wallet */Address, /* contract_address */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash, null>,
    'createNewHtlcTransaction': MethodConfig<[/* wallet */Address, /* htlc_sender */Address, /* htlc_recipient */Address, /* hash_root */AnyHash, /* hash_count */number, /* hash_algorithm */HashAlgorithm, /* timeout */number, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash, null>,
    'sendNewHtlcTransaction': MethodConfig<[/* wallet */Address, /* htlc_sender */Address, /* htlc_recipient */Address, /* hash_root */AnyHash, /* hash_count */number, /* hash_algorithm */HashAlgorithm, /* timeout */number, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash, null>,
    'createRedeemRegularHtlcTransaction': MethodConfig<[/* wallet */Address, /* contract_address */Address,  /* recipient */Address, /* pre_image */AnyHash, /* hash_root */AnyHash, /* hash_count */number, /* hash_algorithm */HashAlgorithm, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash, null>,
    'sendRedeemRegularHtlcTransaction': MethodConfig<[/* wallet */Address, /* contract_address */Address,  /* recipient */Address, /* pre_image */AnyHash, /* hash_root */AnyHash, /* hash_count */number, /* hash_algorithm */HashAlgorithm, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash, null>,
    'createRedeemTimeoutHtlcTransaction': MethodConfig<[/* wallet */Address, /* htlc_address */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash, null>,
    'sendRedeemTimeoutHtlcTransaction': MethodConfig<[/* wallet */Address, /* htlc_address */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash, null>,
    'createRedeemEarlyHtlcTransaction': MethodConfig<[/* wallet */Address, /* htlc_address */Address, /* recipient */Address, /* htlc_sender_signature */String, /* htlc_recipient_signature */String, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash, null>,
    'sendRedeemEarlyHtlcTransaction': MethodConfig<[/* wallet */Address, /* htlc_address */Address, /* recipient */Address, /* htlc_sender_signature */String, /* htlc_recipient_signature */String, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash, null>,
    'signRedeemEarlyHtlcTransaction': MethodConfig<[/* wallet */Address, /* htlc_address */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], String, null>,
    'createNewStakerTransaction': MethodConfig<[/* sender_wallet */Address, /* staker */Address, /* delegation */Maybe<Address>, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], RawTransaction, null>,
    'sendNewStakerTransaction': MethodConfig<[/* sender_wallet */Address, /* staker */Address, /* delegation */Maybe<Address>, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash, null>,
    'createStakeTransaction': MethodConfig<[/* sender_wallet */Address, /* staker */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], RawTransaction, null>,
    'sendStakeTransaction': MethodConfig<[/* sender_wallet */Address, /* staker */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash, null>,
    'createUpdateStakerTransaction': MethodConfig<[/* sender_wallet */Address, /* staker */Address, /* new_delegation */Address, /* fee */Coin, /* validity_start_height */BlockNumber], RawTransaction, null>,
    'sendUpdateStakerTransaction': MethodConfig<[/* sender_wallet */Address, /* staker */Address, /* new_delegation */Address, /* fee */Coin, /* validity_start_height */BlockNumber], Hash, null>,
    'createUnstakeTransaction': MethodConfig<[/* sender_wallet */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], RawTransaction, null>,
    'sendUnstakeTransaction': MethodConfig<[/* sender_wallet */Address, /* recipient */Address, /* value */Coin, /* fee */Coin, /* validity_start_height */BlockNumber], Hash, null>,
    'createNewValidatorTransaction': MethodConfig<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* voting_secret_key */String, /* reward_address */Address, /* signal_data */String, /* fee */Coin, /* validity_start_height */BlockNumber], RawTransaction, null>,
    'sendNewValidatorTransaction': MethodConfig<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* voting_secret_key */String, /* reward_address */Address, /* signal_data */String, /* fee */Coin, /* validity_start_height */BlockNumber], Hash, null>,
    'createUpdateValidatorTransaction': MethodConfig<[/* sender_wallet */Address, /* validator */Address, /* new_signing_secret_key */String, /* new_voting_secret_key */String, /* new_reward_address */Address, /* new_signal_data */String, /* fee */Coin, /* validity_start_height */BlockNumber], RawTransaction, null>,
    'sendUpdateValidatorTransaction': MethodConfig<[/* sender_wallet */Address, /* validator */Address, /* new_signing_secret_key */String, /* new_voting_secret_key */String, /* new_reward_address */Address, /* new_signal_data */String, /* fee */Coin, /* validity_start_height */BlockNumber], Hash, null>,
    'createInactivateValidatorTransaction': MethodConfig<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* fee */Coin, /* validity_start_height */BlockNumber], RawTransaction, null>,
    'sendInactivateValidatorTransaction': MethodConfig<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* fee */Coin, /* validity_start_height */BlockNumber], Hash, null>,
    'createReactivateValidatorTransaction': MethodConfig<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* fee */Coin, /* validity_start_height */BlockNumber], RawTransaction, null>,
    'sendReactivateValidatorTransaction': MethodConfig<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* fee */Coin, /* validity_start_height */BlockNumber], Hash, null>,
    'createUnparkValidatorTransaction': MethodConfig<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* fee */Coin, /* validity_start_height */BlockNumber], RawTransaction, null>,
    'sendUnparkValidatorTransaction': MethodConfig<[/* sender_wallet */Address, /* validator */Address, /* signing_secret_key */String, /* fee */Coin, /* validity_start_height */BlockNumber], Hash, null>,
    'createDeleteValidatorTransaction': MethodConfig<[/* sender_wallet */Address, /* recipient */Address, /* fee */Coin, /* value */Coin, /* validity_start_height */BlockNumber], RawTransaction, null>,
    'sendDeleteValidatorTransaction': MethodConfig<[/* sender_wallet */Address, /* recipient */Address, /* fee */Coin, /* value */Coin, /* validity_start_height */BlockNumber], Hash, null>,
}

export type MempoolMethods = {
    'pushTransaction': MethodConfig<[/* transaction */RawTransaction], Hash, null>,
    'pushHighPriorityTransaction': MethodConfig<[/* transaction */RawTransaction], Hash, null>,
    'mempoolContent': MethodConfig<[/* include_transactions */Boolean], (Hash | Transaction)[], null>,
    'mempool': MethodConfig<[], MempoolInfo, null>,
    'getMinFeePerByte': MethodConfig<[], /* f64 */number, null>,
}

export type NetworkMethods = {
    'getPeerId': MethodConfig<[], String, null>,
    'getPeerCount': MethodConfig<[], number, null>,
    'getPeerList': MethodConfig<[], string[], null>,
}

export type PolicyMethods = {
    'getPolicyConstants': MethodConfig<[], PolicyConstants, null>,
    'getEpochAt': MethodConfig<[BlockNumber], EpochIndex, null>,
    'getEpochIndexAt': MethodConfig<[BlockNumber], EpochIndex, null>,
    'getBatchAt': MethodConfig<[BlockNumber], BatchIndex, null>,
    'getBatchIndexAt': MethodConfig<[BlockNumber], BatchIndex, null>,
    'getElectionBlockAfter': MethodConfig<[BlockNumber], BlockNumber, null>,
    'getElectionBlockBefore': MethodConfig<[BlockNumber], BlockNumber, null>,
    'getLastElectionBlock': MethodConfig<[BlockNumber], BlockNumber, null>,
    'getIsElectionBlockAt': MethodConfig<[BlockNumber], Boolean, null>,
    'getMacroBlockAfter': MethodConfig<[BlockNumber], BlockNumber, null>,
    'getMacroBlockBefore': MethodConfig<[BlockNumber], BlockNumber, null>,
    'getLastMacroBlock': MethodConfig<[BlockNumber], BlockNumber, null>,
    'getIsMacroBlockAt': MethodConfig<[BlockNumber], Boolean, null>,
    'getIsMicroBlockAt': MethodConfig<[BlockNumber], Boolean, null>,
    'getFirstBlockOf': MethodConfig<[EpochIndex], BlockNumber, null>,
    'getFirstBlockOfBatch': MethodConfig<[BatchIndex], BlockNumber, null>,
    'getElectionBlockOf': MethodConfig<[EpochIndex], BlockNumber, null>,
    'getMacroBlockOf': MethodConfig<[BatchIndex], BlockNumber, null>,
    'getFirstBatchOfEpoch': MethodConfig<[BlockNumber], Boolean, null>,
    'getSupplyAt': MethodConfig<[GenesisSupply, GenesisTime, CurrentTime], number, null>,
}

export type ValidatorMethods = {
    'getAddress': MethodConfig<[], Address, null>,
    'getSigningKey': MethodConfig<[], String, null>,
    'getVotingKey': MethodConfig<[], String, null>,
    'setAutomaticReactivation': MethodConfig<[/* automatic_reactivation */Boolean], null, null>,
}

export type WalletMethods = {
    'importRawKey': MethodConfig<[/* key_data */String, /* passphrase */Maybe<String>], Address, null>,
    'isAccountImported': MethodConfig<[/* address */Address], Boolean, null>,
    'listAccounts': MethodConfig<[], Address[], null>,
    'lockAccount': MethodConfig<[/* address */Address], null, null>,
    'createAccount': MethodConfig<[/* passphrase */Maybe<String>], WalletAccount, null>,
    'unlockAccount': MethodConfig<[/* address */Address, /* passphrase */String, /* duration: u64 */Maybe<number>], Boolean, null>,
    'isAccountLocked': MethodConfig<[/* address */Address], Boolean, null>,
    'sign': MethodConfig<[/* message */String, /* address */Address, /* passphrase */Maybe<String>, /* is_hex */Boolean], Signature, null>,
    'verifySignature': MethodConfig<[/* message */String, /* public_key */PublicKey, /* signature */Signature, /* is_hex */Boolean], Boolean, null>,
}

export type ZkpComponentMethods = {
    'getZKPState': MethodConfig<[], ZKPState, null>,
}
