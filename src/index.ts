import type { CallResult, HttpOptions } from './client/http'
import { DEFAULT_OPTIONS, HttpClient } from './client/http'
import type {
  StreamOptions,
  Subscription,
} from './client/web-socket'
import {
  WebSocketClient,
} from './client/web-socket'
import * as Modules from './modules'
import type { Auth, PolicyConstants } from './types/common'

export class Client {
  public http: HttpClient
  public ws: WebSocketClient

  // public block
  // public batch
  // public epoch
  // public transaction
  // public inherent
  // public account
  // public validator
  // public slots
  // public mempool
  // public stakes
  // public staker
  // public peers
  // public supply_at
  // public htlc
  // public vesting
  // public zeroKnowledgeProof
  // public logs
  public blockchain
  public blockchainStreams
  public consensus
  public mempool
  public network
  public policy
  public validator
  public wallet
  public zkpComponent

  /**
   * Policy constants. Make sure to call `await client.init()` before using them.
   */
  public static policy: PolicyConstants

  /**
   * @param url Node URL [?secret=secret]
   * @param auth { username, password }
   */
  constructor(url: URL, auth?: Auth) {
    this.http = new HttpClient(url, auth)
    this.ws = new WebSocketClient(url, auth)

    this.blockchain = new Modules.BlockchainClient.BlockchainClient(this.http)
    this.blockchainStreams = new Modules.BlockchainStream.BlockchainStream(
      this.ws,
    )
    this.consensus = new Modules.ConsensusClient.ConsensusClient(
      this.http,
      this.blockchain,
      this.blockchainStreams,
    )
    this.mempool = new Modules.MempoolClient.MempoolClient(this.http)
    this.network = new Modules.NetworkClient.NetworkClient(this.http)
    this.policy = new Modules.PolicyClient.PolicyClient(this.http)
    this.validator = new Modules.ValidatorClient.ValidatorClient(this.http)
    this.wallet = new Modules.WalletClient.WalletClient(this.http)
    this.zkpComponent = new Modules.ZkpComponentClient.ZkpComponentClient(this.http)

    // this.block = {
    //   /**
    //    * Returns the block number for the current head.
    //    */
    //   current: blockchain.getBlockNumber.bind(blockchain),

    //   /**
    //    * Tries to fetch a block given its hash. It has an option to include the transactions in
    //    * the block, which defaults to false.
    //    */
    //   getByHash: blockchain.getBlockByHash.bind(blockchain),

    //   /**
    //    * Tries to fetch a block given its number. It has an option to include the transactions in
    //    * the block, which defaults to false.
    //    */
    //   getByNumber: blockchain.getBlockByNumber.bind(blockchain),

    //   /**
    //    * Returns the block at the head of the main chain. It has an option to include the
    //    * transactions in the block, which defaults to false.
    //    */
    //   latest: blockchain.getLatestBlock.bind(blockchain),

    //   /**
    //    * Returns the index of the block in its batch. Starting from 0.
    //    */
    //   batchIndex: policy.getBatchIndexAt.bind(policy),

    //   /**
    //    * Returns the index of the block in its epoch. Starting from 0.
    //    */
    //   epochIndex: policy.getEpochIndexAt.bind(policy),

    //   /**
    //    * Election blocks are the first blocks of each epoch
    //    */
    //   election: {
    //     /**
    //      * Gets the number (height) of the next election macro block after a given block
    //      * number (height).
    //      *
    //      * @param blockNumber The block number (height) to query.
    //      * @returns The number (height) of the next election macro block after a given
    //      * block number (height).
    //      */
    //     after: policy.getElectionBlockAfter.bind(policy),

    //     /**
    //      * Gets the block number (height) of the preceding election macro block before
    //      * a given block number (height). If the given block number is an election macro
    //      * block, it returns the election macro block before it.
    //      *
    //      * @param blockNumber The block number (height) to query.
    //      * @returns The block number (height) of the preceding election macro block before
    //      * a given block number (height).
    //      */
    //     before: policy.getElectionBlockBefore.bind(policy),

    //     /**
    //      * Gets the block number (height) of the last election macro block at a given block
    //      * number (height). If the given block number is an election macro block, then it
    //      * returns that block number.
    //      *
    //      * @param blockNumber The block number (height) to query.
    //      * @returns
    //      */
    //     last: policy.getLastElectionBlock.bind(policy),
    //     /**
    //      * Gets the block number of the election macro block of the given epoch (which is
    //      * always the last block).
    //      *
    //      * @param epochIndex The epoch index to query.
    //      * @returns The block number of the election macro block of the given epoch (which
    //      * is always the last block).
    //      */
    //     getByEpoch: policy.getElectionBlockOfEpoch.bind(policy),
    //     /**
    //      * Subscribes to pre epoch validators events.
    //      */
    //     subscribe: blockchainStreams.subscribeForValidatorElectionByAddress
    //       .bind(blockchainStreams),
    //   },

    //   /**
    //    * Gets a boolean expressing if the block at a given block number (height) is an election macro block.
    //    *
    //    * @param blockNumber The block number (height) to query.
    //    * @returns A boolean expressing if the block at a given block number (height) is an election macro block.
    //    */
    //   isElection: policy.getIsElectionBlockAt.bind(policy),

    //   /**
    //    * Macro blocks are the first blocks of each batch
    //    */
    //   macro: {
    //     /**
    //      * Gets the block number (height) of the next macro block after a given block number (height).
    //      *
    //      * @param blockNumber The block number (height) to query.
    //      * @returns The block number (height) of the next macro block after a given block number (height).
    //      */
    //     after: policy.getMacroBlockAfter.bind(policy),

    //     /**
    //      * Gets the block number (height) of the preceding macro block before a given block number
    //      * (height).
    //      *
    //      * @param blockNumber The block number (height) to query.
    //      * @returns The block number (height) of the preceding macro block before a given block
    //      * number (height).
    //      */
    //     before: policy.getMacroBlockBefore.bind(policy),

    //     /**
    //      * Gets the block number (height) of the last macro block at a given block number (height).
    //      * If the given block number is a macro block, then it returns that block number.
    //      *
    //      * @param blockNumber The block number (height) to query.
    //      * @returns The block number (height) of the last macro block at a given block number (height).
    //      */
    //     last: policy.getLastMacroBlock.bind(policy),

    //     /**
    //      * Gets the block number of the macro block (checkpoint or election) of the given batch
    //      * (which
    //      * is always the last block).
    //      *
    //      * @param batchIndex The batch index to query.
    //      * @returns The block number of the macro block (checkpoint or election) of the given
    //      * batch (which
    //      * is always the last block).
    //      */
    //     getByBatch: policy.getMacroBlockOfBatch.bind(policy),
    //   },

    //   /**
    //    * Gets a boolean expressing if the block at a given block number (height) is a macro block.
    //    *
    //    * @param blockNumber The block number (height) to query.
    //    * @returns A boolean expressing if the block at a given block number (height) is a macro block.
    //    */
    //   isMacro: policy.getIsMacroBlockAt.bind(policy),

    //   /**
    //    * Gets the block number (height) of the next micro block after a given block number (height).
    //    *
    //    * @param blockNumber The block number (height) to query.
    //    * @returns The block number (height) of the next micro block after a given block number (height).
    //    */
    //   isMicro: policy.getIsMicroBlockAt.bind(policy),

    //   /**
    //    * Subscribes to new block events.
    //    */
    //   subscribe: blockchainStreams.subscribeForBlocks.bind(blockchainStreams),
    // }

    // this.logs = {
    //   /**
    //    * Subscribes to log events related to a given list of addresses and of any of the log types
    //    * provided. If addresses is empty it does not filter by address. If log_types is empty it
    //    * won't filter by log types.
    //    *
    //    * Thus the behavior is to assume all addresses or log_types are to be provided if the
    //    * corresponding vec is empty.
    //    */
    //   subscribe: blockchainStreams.subscribeForLogsByAddressesAndTypes.bind(
    //     blockchainStreams,
    //   ),
    // }

    // this.batch = {
    //   /**
    //    * Returns the batch number for the current head.
    //    */
    //   current: blockchain.getBatchNumber.bind(blockchain),

    //   /**
    //    * Gets the batch number at a given `block_number` (height)
    //    *
    //    * @param blockNumber The block number (height) to query.
    //    * @param justIndex The batch index is the number of a block relative to the batch it is in.
    //    * For example, the first block of any batch always has an epoch index of 0.
    //    * @returns The epoch number at the given block number (height).
    //    */
    //   at: policy.getBatchAt.bind(policy),

    //   /**
    //    * Gets the block number (height) of the first block of the given epoch (which is always
    //    * a micro block).
    //    *
    //    * @param epochIndex The epoch index to query.
    //    * @returns The block number (height) of the first block of the given epoch (which is always
    //    * a micro block).
    //    */
    //   firstBlock: policy.getFirstBlockOfBatch.bind(policy),
    // }

    // this.epoch = {
    //   /**
    //    * Returns the epoch number for the current head.
    //    */
    //   current: blockchain.getEpochNumber.bind(blockchain),

    //   /**
    //    * Gets the epoch number at a given `block_number` (height)
    //    *
    //    * @param blockNumber The block number (height) to query.
    //    * @param justIndex The epoch index is the number of a block relative to the epoch it is in.
    //    * For example, the first block of any epoch always has an epoch index of 0.
    //    * @returns The epoch number at the given block number (height) or index
    //    */
    //   at: policy.getEpochAt.bind(policy),

    //   /**
    //    * Gets the block number (height) of the first block of the given epoch (which is always a micro block).
    //    *
    //    * @param epochIndex The epoch index to query.
    //    * @returns The block number (height) of the first block of the given epoch (which is always a micro block).
    //    */
    //   firstBlock: policy.getFirstBlockOfEpoch.bind(policy),

    //   /**
    //    * Gets a boolean expressing if the batch at a given block number (height) is the first batch
    //    * of the epoch.
    //    *
    //    * @param blockNumber The block number (height) to query.
    //    * @returns A boolean expressing if the batch at a given block number (height) is the first batch
    //    */
    //   firstBatch: policy.getFirstBatchOfEpoch.bind(policy),
    // }

    // this.slots = {
    //   /**
    //    * Returns the information for the slot owner at the given block height and offset. The
    //    * offset is optional, it will default to getting the offset for the existing block
    //    * at the given height.
    //    */
    //   at: blockchain.getSlotAt.bind(blockchain),

    //   penalized: {
    //     /**
    //      * Returns information about the currently penalized slots. This includes slots that lost rewards
    //      * and that were disabled.
    //      */
    //     current: blockchain.getCurrentPenalizedSlots.bind(blockchain),

    //     /**
    //      * Returns information about the penalized slots of the previous batch. This includes slots that
    //      * lost rewards and that were disabled.
    //      */
    //     previous: blockchain.getPreviousPenalizedSlots.bind(blockchain),
    //   },
    // }

    // this.transaction = {
    //   /**
    //    * Fetches the transactions given the address.
    //    *
    //    * It returns the latest transactions for a given address. All the transactions
    //    * where the given address is listed as a recipient or as a sender are considered. Reward
    //    * transactions are also returned. It has an option to specify the maximum number of transactions
    //    * to fetch, it defaults to 500.
    //    */
    //   getByAddress: blockchain.getTransactionsByAddress.bind(blockchain),

    //   /**
    //    * Fetches the transactions given the batch number.
    //    */
    //   getByBatch: blockchain.getTransactionsByBatchNumber.bind(blockchain),

    //   /**
    //    * Fetches the transactions given the block number.
    //    */
    //   getByBlockNumber: blockchain.getTransactionsByBlockNumber.bind(
    //     blockchain,
    //   ),

    //   /**
    //    * Fetches the transaction given the hash.
    //    */
    //   getByHash: blockchain.getTransactionByHash.bind(blockchain),

    //   /**
    //    * Pushes the given serialized transaction to the local mempool
    //    *
    //    * @param transaction Serialized transaction
    //    * @returns Transaction hash
    //    */
    //   push: mempool.pushTransaction.bind(mempool),

    //   /**
    //    * @returns
    //    */
    //   minFeePerByte: mempool.getMinFeePerByte.bind(mempool),

    //   /**
    //    * Creates a serialized transaction
    //    */
    //   create: consensus.createTransaction.bind(consensus),

    //   /**
    //    * Sends a transaction
    //    */
    //   send: consensus.sendTransaction.bind(consensus),

    //   /**
    //    * Sends a transaction and waits for confirmation
    //    */
    //   sendSync: consensus.sendSyncTransaction.bind(consensus),
    // }

    // this.vesting = {
    //   new: {
    //     /**
    //      * Returns a serialized transaction creating a new vesting contract
    //      */
    //     createTx: consensus.createNewVestingTransaction.bind(consensus),

    //     /**
    //      * Sends a transaction creating a new vesting contract to the network
    //      */
    //     sendTx: consensus.sendNewVestingTransaction.bind(consensus),

    //     /**
    //      * Sends a transaction creating a new vesting contract to the network and waits for confirmation
    //      */
    //     sendSyncTx: consensus.sendSyncNewVestingTransaction.bind(consensus),
    //   },
    //   redeem: {
    //     /**
    //      * Returns a serialized transaction redeeming a vesting contract
    //      */
    //     createTx: consensus.createRedeemVestingTransaction.bind(consensus),

    //     /**
    //      * Sends a transaction redeeming a vesting contract to the network
    //      */
    //     sendTx: consensus.sendRedeemVestingTransaction.bind(consensus),

    //     /**
    //      * Sends a transaction redeeming a vesting contract to the network and waits for confirmation
    //      */
    //     sendSyncTx: consensus.sendSyncRedeemVestingTransaction.bind(consensus),
    //   },
    // }

    // this.htlc = {
    //   new: {
    //     /**
    //      * Returns a serialized transaction creating a new HTLC contract
    //      */
    //     createTx: consensus.createNewHtlcTransaction.bind(consensus),

    //     /**
    //      * Creates a serialized transaction creating a new HTLC contract
    //      */
    //     sendTx: consensus.sendNewHtlcTransaction.bind(consensus),

    //     /**
    //      * Sends a transaction creating a new HTLC contract to the network and waits for confirmation
    //      */
    //     sendSyncTx: consensus.sendSyncNewHtlcTransaction.bind(consensus),
    //   },
    //   redeem: {
    //     regular: {
    //       /**
    //        * Returns a serialized transaction redeeming a regular HTLC contract
    //        */
    //       createTx: consensus.createRedeemRegularHtlcTransaction.bind(
    //         consensus,
    //       ),

    //       /**
    //        * Sends a transaction redeeming a regular HTLC contract to the network
    //        */
    //       sendTx: consensus.sendRedeemRegularHtlcTransaction.bind(consensus),

    //       /**
    //        * Sends a transaction redeeming a regular HTLC contract to the network and waits for confirmation
    //        */
    //       sendSyncTx: consensus.sendSyncRedeemRegularHtlcTransaction.bind(
    //         consensus,
    //       ),
    //     },
    //     timeoutTx: {
    //       /**
    //        * Returns a serialized transaction redeeming a timeout HTLC contract
    //        */
    //       createTx: consensus.createRedeemTimeoutHtlcTransaction.bind(
    //         consensus,
    //       ),

    //       /**
    //        * Sends a transaction redeeming a timeout HTLC contract to the network
    //        */
    //       sendTx: consensus.sendRedeemTimeoutHtlcTransaction.bind(consensus),

    //       /**
    //        * Sends a transaction redeeming a timeout HTLC contract to the network and waits for confirmation
    //        */
    //       sendSyncTx: consensus.sendSyncRedeemTimeoutHtlcTransaction.bind(
    //         consensus,
    //       ),
    //     },
    //     earlyTx: {
    //       /**
    //        * Returns a serialized transaction redeeming an early HTLC contract
    //        */
    //       createTx: consensus.createRedeemEarlyHtlcTransaction.bind(consensus),

    //       /**
    //        * Sends a transaction redeeming an early HTLC contract to the network
    //        */
    //       sendTx: consensus.sendRedeemEarlyHtlcTransaction.bind(consensus),

    //       /**
    //        * Sends a transaction redeeming an early HTLC contract to the network and waits for confirmation
    //        */
    //       sendSyncTx: consensus.sendSyncRedeemEarlyHtlcTransaction.bind(
    //         consensus,
    //       ),
    //     },
    //   },
    // }

    // this.stakes = {
    //   new: {
    //     /**
    //      * Returns a serialized transaction creating a new stake contract
    //      */
    //     createTx: consensus.createStakeTransaction.bind(consensus),

    //     /**
    //      * Sends a transaction creating a new stake contract to the network
    //      */
    //     sendTx: consensus.sendStakeTransaction.bind(consensus),

    //     /**
    //      * Sends a transaction creating a new stake contract to the network and waits for confirmation
    //      */
    //     sendSyncTx: consensus.sendSyncStakeTransaction.bind(consensus),
    //   },
    // }

    // this.staker = {
    //   /**
    //    * Fetches the stakers given the batch number.
    //    */
    //   fromValidator: blockchain.getValidatorByAddress.bind(blockchain),

    //   /**
    //    * Fetches the staker given the address.
    //    */
    //   getByAddress: blockchain.getStakerByAddress.bind(blockchain),
    //   new: {
    //     /**
    //      * Creates a new staker transaction
    //      */
    //     createTx: consensus.createNewStakerTransaction.bind(consensus),

    //     /**
    //      * Sends a new staker transaction
    //      */
    //     sendTx: consensus.sendNewStakerTransaction.bind(consensus),

    //     /**
    //      * Sends a new staker transaction and waits for confirmation
    //      */
    //     sendSyncTx: consensus.sendSyncNewStakerTransaction.bind(consensus),
    //   },
    //   update: {
    //     /**
    //      * Creates a new staker transaction
    //      */
    //     createTx: consensus.createUpdateStakerTransaction.bind(consensus),

    //     /**
    //      * Sends a new staker transaction
    //      */
    //     sendTx: consensus.sendUpdateStakerTransaction.bind(consensus),

    //     /**
    //      * Sends a new staker transaction and waits for confirmation
    //      */
    //     sendSyncTx: consensus.sendSyncUpdateStakerTransaction.bind(consensus),
    //   },
    // }

    // this.inherent = {
    //   /**
    //    * Fetches the inherents given the batch number.
    //    */
    //   getByBatch: blockchain.getInherentsByBatchNumber.bind(blockchain),

    //   /**
    //    * Fetches the inherents given the block number.
    //    */
    //   getByBlock: blockchain.getInherentsByBlockNumber.bind(blockchain),
    // }

    // this.account = {
    //   /**
    //    * Tries to fetch the account at the given address.
    //    */
    //   getByAddress: blockchain.getAccountByAddress.bind(blockchain),

    //   /**
    //    * Fetches the account given the address.
    //    */
    //   importRawKey: wallet.importRawKey.bind(wallet),

    //   /**
    //    * Fetches the account given the address.
    //    */
    //   new: wallet.createAccount.bind(wallet),

    //   /**
    //    * Returns a boolean indicating whether the account is imported or not.
    //    */
    //   isImported: wallet.isAccountImported.bind(wallet),

    //   /**
    //    * Returns a list of all accounts.
    //    */
    //   list: wallet.listAccounts.bind(wallet),

    //   /**
    //    * Locks the account at the given address.
    //    */
    //   lock: wallet.lockAccount.bind(wallet),

    //   /**
    //    * Unlocks the account at the given address.
    //    */
    //   unlock: wallet.unlockAccount.bind(wallet),

    //   /**
    //    * Returns a boolean indicating whether the account is locked or not.
    //    */
    //   isLocked: wallet.isAccountLocked.bind(wallet),

    //   /**
    //    * Signs the given data with the account at the given address.
    //    */
    //   sign: wallet.sign.bind(wallet),

    //   /**
    //    * Verifies the given signature with the account at the given address.
    //    */
    //   verify: wallet.verifySignature.bind(wallet),
    // }

    // this.validator = {
    //   /**
    //    * Tries to fetch a validator information given its address. It has an option to include a map
    //    * containing the addresses and stakes of all the stakers that are delegating to the validator.
    //    */
    //   byAddress: blockchain.getValidatorByAddress.bind(blockchain),

    //   /**
    //    * Updates the configuration setting to automatically reactivate our validator
    //    */
    //   setAutomaticReactivation: validator_.setAutomaticReactivation.bind(
    //     validator_,
    //   ),

    //   /**
    //    * Returns the information of the validator running on the node
    //    */
    //   selfNode: {
    //     /**
    //      * Returns our validator address.
    //      */
    //     address: validator_.getAddress.bind(blockchain),

    //     /**
    //      * Returns our validator signing key.
    //      */
    //     signingKey: validator_.getSigningKey.bind(blockchain),

    //     /**
    //      * Returns our validator voting key.
    //      */
    //     votingKey: validator_.getVotingKey.bind(blockchain),
    //   },

    //   /**
    //    * Returns a collection of the currently active validator's addresses and balances.
    //    */
    //   activeList: blockchain.getActiveValidators.bind(blockchain),

    //   action: {
    //     new: {
    //       /**
    //        * Returns a serialized `new_validator` transaction. You need to provide the address of a basic
    //        * account (the sender wallet) to pay the transaction fee and the validator deposit.
    //        * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
    //        * have a double Option. So we use the following work-around for the signal data:
    //        * "" = Set the signal data field to None.
    //        * "0x29a4b..." = Set the signal data field to Some(0x29a4b...).
    //        */
    //       createTx: consensus.createNewValidatorTransaction.bind(consensus),

    //       /**
    //        * Sends a `new_validator` transaction. You need to provide the address of a basic
    //        * account (the sender wallet) to pay the transaction fee and the validator deposit.
    //        * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
    //        * have a double Option. So we use the following work-around for the signal data:
    //        * "" = Set the signal data field to None.
    //        * "0x29a4b..." = Set the signal data field to Some(0x29a4b...).
    //        */
    //       sendTx: consensus.sendNewValidatorTransaction.bind(consensus),

    //       /**
    //        * Sends a `new_validator` transaction. You need to provide the address of a basic
    //        * account (the sender wallet) to pay the transaction fee and the validator deposit
    //        * and waits for confirmation.
    //        * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
    //        * have a double Option. So we use the following work-around for the signal data:
    //        * "" = Set the signal data field to None.
    //        * "0x29a4b..." = Set the signal data field to Some(0x29a4b...).
    //        */
    //       sendSyncTx: consensus.sendSyncNewValidatorTransaction.bind(consensus),
    //     },
    //     update: {
    //       /**
    //        * Returns a serialized `update_validator` transaction. You need to provide the address of a basic
    //        * account (the sender wallet) to pay the transaction fee.
    //        * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
    //        * have a double Option. So we use the following work-around for the signal data:
    //        * null = No change in the signal data field.
    //        * "" = Change the signal data field to None.
    //        * "0x29a4b..." = Change the signal data field to Some(0x29a4b...).
    //        */
    //       createTx: consensus.createUpdateValidatorTransaction.bind(consensus),

    //       /**
    //        * Sends a `update_validator` transaction. You need to provide the address of a basic
    //        * account (the sender wallet) to pay the transaction fee.
    //        * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
    //        * have a double Option. So we use the following work-around for the signal data:
    //        * null = No change in the signal data field.
    //        * "" = Change the signal data field to None.
    //        * "0x29a4b..." = Change the signal data field to Some(0x29a4b...).
    //        */
    //       sendTx: consensus.sendUpdateValidatorTransaction.bind(consensus),

    //       /**
    //        * Sends a `update_validator` transaction. You need to provide the address of a basic
    //        * account (the sender wallet) to pay the transaction fee and waits for confirmation.
    //        * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
    //        * have a double Option. So we use the following work-around for the signal data:
    //        * null = No change in the signal data field.
    //        * "" = Change the signal data field to None.
    //        * "0x29a4b..." = Change the signal data field to Some(0x29a4b...).
    //        */
    //       sendSyncTx: consensus.sendSyncUpdateValidatorTransaction.bind(
    //         consensus,
    //       ),
    //     },
    //     deactivate: {
    //       /**
    //        * Returns a serialized `inactivate_validator` transaction. You need to provide the address of a basic
    //        * account (the sender wallet) to pay the transaction fee.
    //        */
    //       createTx: consensus.createDeactivateValidatorTransaction.bind(
    //         consensus,
    //       ),

    //       /**
    //        * Sends a `inactivate_validator` transaction. You need to provide the address of a basic
    //        * account (the sender wallet) to pay the transaction fee.
    //        */
    //       sendTx: consensus.sendDeactivateValidatorTransaction.bind(consensus),

    //       /**
    //        * Sends a `inactivate_validator` transaction and waits for confirmation.
    //        * You need to provide the address of a basic account (the sender wallet)
    //        * to pay the transaction fee.
    //        */
    //       sendSyncTx: consensus.sendSyncDeactivateValidatorTransaction.bind(
    //         consensus,
    //       ),
    //     },
    //     reactivate: {
    //       /**
    //        * Returns a serialized `reactivate_validator` transaction. You need to provide the address of a basic
    //        * account (the sender wallet) to pay the transaction fee.
    //        */
    //       createTx: consensus.createReactivateValidatorTransaction.bind(
    //         consensus,
    //       ),

    //       /**
    //        * Sends a `reactivate_validator` transaction. You need to provide the address of a basic
    //        * account (the sender wallet) to pay the transaction fee.
    //        */
    //       sendTx: consensus.sendReactivateValidatorTransaction.bind(consensus),

    //       /**
    //        * Sends a `reactivate_validator` transaction and waits for confirmation.
    //        * You need to provide the address of a basic account (the sender wallet)
    //        * to pay the transaction fee.
    //        */
    //       sendSyncTx: consensus.sendSyncReactivateValidatorTransaction.bind(
    //         consensus,
    //       ),
    //     },
    //     unpark: {
    //       /**
    //        * Returns a serialized `set_inactive_stake` transaction. You can pay the transaction fee from a basic
    //        * account (by providing the sender wallet) or from the staker account's balance (by not
    //        * providing a sender wallet).
    //        */
    //       createTx: consensus.createSetInactiveStakeTransaction.bind(consensus),

    //       /**
    //        * Sends a `set_inactive_stake` transaction. You can pay the transaction fee from a basic
    //        * account (by providing the sender wallet) or from the staker account's balance (by not
    //        * providing a sender wallet).
    //        */
    //       sendTx: consensus.sendSetInactiveStakeTransaction.bind(consensus),

    //       /**
    //        *  Sends a `set_inactive_stake` transaction. You can pay the transaction fee from a basic
    //        * account (by providing the sender wallet) or from the staker account's balance (by not
    //        * providing a sender wallet) and waits for confirmation.
    //        */
    //       sendSyncTx: consensus.sendSyncSetInactiveStakeTransaction.bind(
    //         consensus,
    //       ),
    //     },
    //     retire: {
    //       /**
    //        * Returns a serialized `retire_validator` transaction. You need to provide the address of a basic
    //        * account (the sender wallet) to pay the transaction fee.
    //        */
    //       createTx: consensus.createRetireValidatorTransaction.bind(consensus),

    //       /**
    //        * Sends a `retire_validator` transaction. You need to provide the address of a basic
    //        * account (the sender wallet) to pay the transaction fee.
    //        */
    //       sendTx: consensus.sendRetireValidatorTransaction.bind(consensus),

    //       /**
    //        * Sends a `retire_validator` transaction and waits for confirmation.
    //        * You need to provide the address of a basic account (the sender wallet)
    //        * to pay the transaction fee.
    //        */
    //       sendSyncTx: consensus.sendSyncRetireValidatorTransaction.bind(
    //         consensus,
    //       ),
    //     },
    //     delete: {
    //       /**
    //        * Returns a serialized `delete_validator` transaction. The transaction fee will be paid from the
    //        * validator deposit that is being returned.
    //        * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
    //        * Failed delete validator transactions can diminish the validator deposit
    //        */
    //       createTx: consensus.createDeleteValidatorTransaction.bind(consensus),

    //       /**
    //        * Sends a `delete_validator` transaction. The transaction fee will be paid from the
    //        * validator deposit that is being returned.
    //        * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
    //        * Failed delete validator transactions can diminish the validator deposit
    //        */
    //       sendTx: consensus.sendDeleteValidatorTransaction.bind(consensus),

    //       /**
    //        * Sends a `delete_validator` transaction and waits for confirmation.
    //        * The transaction fee will be paid from the validator deposit that is being returned.
    //        * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
    //        * Failed delete validator transactions can diminish the validator deposit
    //        */
    //       sendSyncTx: consensus.sendSyncDeleteValidatorTransaction.bind(
    //         consensus,
    //       ),
    //     },
    //   },
    // }

    // this.mempool = {
    //   /**
    //    * @returns
    //    */
    //   info: mempool.mempool.bind(mempool),

    //   /**
    //    * Content of the mempool
    //    *
    //    * @param includeTransactions
    //    * @returns
    //    */
    //   content: mempool.mempoolContent.bind(mempool),
    // }

    // this.peers = {
    //   /**
    //    * The peer ID for our local peer.
    //    */
    //   id: network.getPeerId.bind(network),

    //   /**
    //    * Returns the number of peers.
    //    */
    //   count: network.getPeerCount.bind(network),

    //   /**
    //    * Returns a list with the IDs of all our peers.
    //    */
    //   peers: network.getPeerList.bind(network),

    //   /**
    //    * Returns a boolean specifying if we have established consensus with the network
    //    */
    //   consensusEstablished: consensus.isConsensusEstablished.bind(network),
    // }

    // /**
    //  * Gets the supply at a given time (as Unix time) in Lunas (1 NIM = 100,000 Lunas). It is
    //  * calculated using the following formula:
    //  * Supply (t) = Genesis_supply + Initial_supply_velocity / Supply_decay * (1 - e^(- Supply_decay * t))
    //  * Where e is the exponential function, t is the time in milliseconds since the genesis block and
    //  * Genesis_supply is the supply at the genesis of the Nimiq 2.0 chain.
    //  *
    //  * @param genesisSupply supply at genesis
    //  * @param genesisTime timestamp of genesis block
    //  * @param currentTime timestamp to calculate supply at
    //  * @returns The supply at a given time (as Unix time) in Lunas (1 NIM = 100,000 Lunas).
    //  */
    // this.supply_at = policy.getSupplyAt.bind(policy)

    // this.zeroKnowledgeProof = {
    //   /**
    //    * Returns the latest header number, block number and proof
    //    * @returns
    //    */
    //   state: zkpComponent.getZkpState.bind(zkpComponent),
    // }
  }

  /**
   * Make a raw call to the Albatross Node.
   *
   * @param request - The request object containing the following properties:
   * @param request.method - The name of the method to call.
   * @param request.params - The parameters to pass with the call, if any.
   * @param request.withMetadata - Flag indicating whether metadata should be included in the response.
   * @param options - The HTTP options for the call. Defaults to DEFAULT_OPTIONS if not provided.
   * @returns A promise that resolves with the result of the call, which includes data and optionally metadata.
   */
  async call<Data, Metadata = undefined>(
    request: { method: string; params?: any[]; withMetadata?: boolean },
    options: HttpOptions = DEFAULT_OPTIONS,
  ): Promise<CallResult<Data, Metadata>> {
    return this.http.call<Data, Metadata>(request, options)
  }

  /**
   * Make a raw streaming call to the Albatross Node.
   *
   * @param request
   * @param userOptions
   * @returns A promise that resolves with a Subscription object.
   */
  async subscribe<
    Data,
    Request extends { method: string; params?: any[]; withMetadata?: boolean },
  >(
    request: Request,
    userOptions: StreamOptions<Data>,
  ): Promise<Subscription<Data>> {
    return this.ws.subscribe<Data, Request>(request, userOptions)
  }
}
export * from './client/http'
export * from './client/web-socket'
export * from './modules'
export * from './types/common'
export * from './types/logs'
