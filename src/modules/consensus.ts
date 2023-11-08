import type { Context, HttpClient, SendTxCallOptions } from '../client/http'
import { DEFAULT_OPTIONS, DEFAULT_OPTIONS_SEND_TX, DEFAULT_TIMEOUT_CONFIRMATION } from '../client/http'
import type { Address, Coin, Hash, RawTransaction, Transaction, ValidityStartHeight } from '../types/common'
import { LogType } from '../types/enums'
import type { BlockLog, TransactionLog } from '../types/logs'
import type { BlockchainClient, SubscribeForLogsByAddressesAndTypesParams } from './blockchain'
import type { BlockchainStream } from './blockchain-streams'

export interface RawTransactionInfoParams { rawTransaction: string }
export type TransactionParams = { wallet: Address; recipient: Address; value: Coin; fee: Coin; data?: string } & ValidityStartHeight
export type VestingTxParams = { wallet: Address; owner: Address; startTime: number; timeStep: number; numSteps: number; value: Coin; fee: Coin } & ValidityStartHeight
export type RedeemVestingTxParams = { wallet: Address; contractAddress: Address; recipient: Address; value: Coin; fee: Coin } & ValidityStartHeight
export type HtlcTransactionParams = { wallet: Address; htlcSender: Address; htlcRecipient: Address; hashRoot: string; hashCount: number; timeout: number; value: Coin; fee: Coin } & ValidityStartHeight
export type RedeemRegularHtlcTxParams = { wallet: Address; contractAddress: Address; recipient: Address; preImage: string; hashRoot: string; hashCount: number; value: Coin; fee: Coin } & ValidityStartHeight
export type RedeemTimeoutHtlcTxParams = { wallet: Address; contractAddress: Address; recipient: Address; value: Coin; fee: Coin } & ValidityStartHeight
export type RedeemEarlyHtlcTxParams = { wallet: Address; htlcAddress: Address; recipient: Address; htlcSenderSignature: string; htlcRecipientSignature: string; value: Coin; fee: Coin } & ValidityStartHeight
export type SignRedeemEarlyHtlcParams = { wallet: Address; htlcAddress: Address; recipient: Address; value: Coin; fee: Coin } & ValidityStartHeight
export type StakerTxParams = { senderWallet: Address; stakerWallet: string; delegation: Address | undefined; value: Coin; fee: Coin } & ValidityStartHeight
export type StakeTxParams = { senderWallet: Address; stakerWallet: string; value: Coin; fee: Coin } & ValidityStartHeight
export type UpdateStakerTxParams = { senderWallet: Address; stakerWallet: string; newDelegation: Address; reactivateAllStake: boolean; fee: Coin } & ValidityStartHeight
export type SetInactiveStakeTxParams = { senderWallet: Address; stakerWallet: string; value: Coin; fee: Coin } & ValidityStartHeight
export type UnstakeTxParams = { stakerWallet: string; recipient: Address; value: Coin; fee: Coin } & ValidityStartHeight
export type NewValidatorTxParams = { senderWallet: Address; validator: Address; signingSecretKey: string; votingSecretKey: string; rewardAddress: Address; signalData: string; fee: Coin } & ValidityStartHeight
export type UpdateValidatorTxParams = { senderWallet: Address; validator: Address; newSigningSecretKey: string; newVotingSecretKey: string; newRewardAddress: Address; newSignalData: string; fee: Coin } & ValidityStartHeight
export type DeactiveValidatorTxParams = { senderWallet: Address; validator: Address; signingSecretKey: string; fee: Coin } & ValidityStartHeight
export type ReactivateValidatorTxParams = { senderWallet: Address; validator: Address; signingSecretKey: string; fee: Coin } & ValidityStartHeight
export type RetireValidatorTxParams = { senderWallet: Address; validator: Address; fee: Coin } & ValidityStartHeight
export type DeleteValidatorTxParams = { validator: Address; recipient: Address; fee: Coin; value: Coin } & ValidityStartHeight

export interface TxLog { tx: Transaction; log?: BlockLog; hash: Hash }

export class ConsensusClient {
  private client: HttpClient
  private blockchainClient: BlockchainClient
  private blockchainStream: BlockchainStream

  constructor(client: HttpClient, blockchainClient: BlockchainClient, blockchainStream: BlockchainStream) {
    this.client = client
    this.blockchainClient = blockchainClient
    this.blockchainStream = blockchainStream
  }

  private getValidityStartHeight(p: ValidityStartHeight): string {
    return 'relativeValidityStartHeight' in p ? `+${p.relativeValidityStartHeight}` : `${p.absoluteValidityStartHeight}`
  }

  private async waitForConfirmation(hash: string, params: SubscribeForLogsByAddressesAndTypesParams, waitForConfirmationTimeout: number = DEFAULT_TIMEOUT_CONFIRMATION, context: Context) {
    const { next, close } = await this.blockchainStream.subscribeForLogsByAddressesAndTypes(params)

    return new Promise((resolve) => {
      const timeoutFn = setTimeout(async () => {
        close()
        const tx = await this.blockchainClient.getTransactionByHash(hash)
        if (tx.error)
          resolve({ context, error: { code: -32300, message: `Timeout waiting for confirmation of transaction ${hash}` }, data: undefined })
        else
          resolve({ context, error: undefined, data: { log: undefined, hash, tx: tx.data! } as TxLog })
      }, waitForConfirmationTimeout)

      next(async (log) => {
        if (log.error)
          return
        if (log.data.transactions.some((tx: TransactionLog) => tx.hash === hash)) {
          clearTimeout(timeoutFn)
          close()
          const tx = await this.blockchainClient.getTransactionByHash(hash)
          if (tx.error)
            resolve({ context, error: { code: -32300, message: `Error getting transaction ${hash}` }, data: undefined })
          else
            resolve({ context, error: undefined, data: { log: undefined, hash, tx: tx.data! } as TxLog })
        }
      })
    })
  }

  /**
   * Returns a boolean specifying if we have established consensus with the network
   */
  public isConsensusEstablished(options = DEFAULT_OPTIONS) {
    return this.client.call<boolean>({ method: 'isConsensusEstablished' }, options)
  }

  /**
   * Given a serialized transaction, it will return the corresponding transaction struct
   */
  public getRawTransactionInfo({ rawTransaction }: RawTransactionInfoParams, options = DEFAULT_OPTIONS) {
    return this.client.call<Transaction>({ method: 'getRawTransactionInfo', params: [rawTransaction] }, options)
  }

  /**
   * Creates a serialized transaction
   */
  public createTransaction(p: TransactionParams, options = DEFAULT_OPTIONS) {
    if (p.data) {
      const req = { method: 'createBasicTransactionWithData', params: [p.wallet, p.recipient, p.data, p.value, p.fee, this.getValidityStartHeight(p)] }
      return this.client.call<RawTransaction>(req, options)
    }
    else {
      const req = { method: 'createBasicTransaction', params: [p.wallet, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)] }
      return this.client.call<RawTransaction>(req, options)
    }
  }

  /**
   * Sends a transaction
   */
  public sendTransaction(p: TransactionParams, options = DEFAULT_OPTIONS) {
    const req = p.data
      ? { method: 'sendBasicTransactionWithData', params: [p.wallet, p.recipient, p.data, p.value, p.fee, this.getValidityStartHeight(p)] }
      : { method: 'sendBasicTransaction', params: [p.wallet, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<Hash>(req, options)
  }

  /**
   * Sends a transaction and waits for confirmation
   */
  public async sendSyncTransaction(p: TransactionParams, options: SendTxCallOptions) {
    const hash = await this.sendTransaction(p, options)
    if (hash.error)
      return hash
    return await this.waitForConfirmation(hash.data!, { addresses: [p.wallet, p.recipient], types: [LogType.Transfer] }, options.waitForConfirmationTimeout, hash.context)
  }

  /**
   * Returns a serialized transaction creating a new vesting contract
   */
  public createNewVestingTransaction(p: VestingTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'createNewVestingTransaction', params: [p.wallet, p.owner, p.startTime, p.timeStep, p.numSteps, p.value, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<RawTransaction>(req, options)
  }

  /**
   * Sends a transaction creating a new vesting contract to the network
   */
  public sendNewVestingTransaction(p: VestingTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'sendNewVestingTransaction', params: [p.wallet, p.owner, p.startTime, p.timeStep, p.numSteps, p.value, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<Hash>(req, options)
  }

  /**
   * Sends a transaction creating a new vesting contract to the network and waits for confirmation
   */
  public async sendSyncNewVestingTransaction(p: VestingTxParams, options: SendTxCallOptions) {
    const hash = await this.sendNewVestingTransaction(p, options)
    if (hash.error)
      return hash
    return await this.waitForConfirmation(hash.data!, { addresses: [p.wallet] }, options.waitForConfirmationTimeout, hash.context)
  }

  /**
   * Returns a serialized transaction redeeming a vesting contract
   */
  public async createRedeemVestingTransaction(p: RedeemVestingTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'createRedeemVestingTransaction', params: [p.wallet, p.contractAddress, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<RawTransaction>(req, options)
  }

  /**
   * Sends a transaction redeeming a vesting contract
   */
  public async sendRedeemVestingTransaction(p: RedeemVestingTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'sendRedeemVestingTransaction', params: [p.wallet, p.contractAddress, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<Hash>(req, options)
  }

  /**
   * Sends a transaction redeeming a vesting contract and waits for confirmation
   */
  public async sendSyncRedeemVestingTransaction(p: RedeemVestingTxParams, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendRedeemVestingTransaction(p, options)
    if (hash.error)
      return hash
    return await this.waitForConfirmation(hash.data!, { addresses: [p.wallet] }, options.waitForConfirmationTimeout, hash.context)
  }

  /**
   * Returns a serialized transaction creating a new HTLC contract
   */
  public async createNewHtlcTransaction(p: HtlcTransactionParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'createNewHtlcTransaction', params: [p.wallet, p.htlcSender, p.htlcRecipient, p.hashRoot, p.hashCount, p.timeout, p.value, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<RawTransaction>(req, options)
  }

  /**
   * Sends a transaction creating a new HTLC contract
   */
  public async sendNewHtlcTransaction(p: HtlcTransactionParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'sendNewHtlcTransaction', params: [p.wallet, p.htlcSender, p.htlcRecipient, p.hashRoot, p.hashCount, p.timeout, p.value, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<Hash>(req, options)
  }

  /**
   * Sends a transaction creating a new HTLC contract and waits for confirmation
   */
  public async sendSyncNewHtlcTransaction(p: HtlcTransactionParams, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendNewHtlcTransaction(p, options)
    if (hash.error)
      return hash
    return await this.waitForConfirmation(hash.data!, { addresses: [p.wallet] }, options.waitForConfirmationTimeout, hash.context)
  }

  /**
   * Returns a serialized transaction redeeming an HTLC contract
   */
  public async createRedeemRegularHtlcTransaction(p: RedeemRegularHtlcTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'createRedeemRegularHtlcTransaction', params: [p.wallet, p.contractAddress, p.recipient, p.preImage, p.hashRoot, p.hashCount, p.value, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<RawTransaction>(req, options)
  }

  /**
   * Sends a transaction redeeming an HTLC contract
   */
  public async sendRedeemRegularHtlcTransaction(p: RedeemRegularHtlcTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'sendRedeemRegularHtlcTransaction', params: [p.wallet, p.contractAddress, p.recipient, p.preImage, p.hashRoot, p.hashCount, p.value, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<Hash>(req, options)
  }

  /**
   * Sends a transaction redeeming a new HTLC contract and waits for confirmation
   */
  public async sendSyncRedeemRegularHtlcTransaction(p: RedeemRegularHtlcTxParams, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendRedeemRegularHtlcTransaction(p, options)
    if (hash.error)
      return hash
    return await this.waitForConfirmation(hash.data!, { addresses: [p.wallet] }, options.waitForConfirmationTimeout, hash.context)
  }

  /**
   * Returns a serialized transaction redeeming a HTLC contract using the `TimeoutResolve`
   * method
   */
  public async createRedeemTimeoutHtlcTransaction(p: RedeemTimeoutHtlcTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'createRedeemRegularHtlcTransaction', params: [p.wallet, p.contractAddress, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<RawTransaction>(req, options)
  }

  /**
   * Sends a transaction redeeming a HTLC contract using the `TimeoutResolve`
   * method to network
   */
  public async sendRedeemTimeoutHtlcTransaction(p: RedeemTimeoutHtlcTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'sendRedeemRegularHtlcTransaction', params: [p.wallet, p.contractAddress, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<Hash>(req, options)
  }

  /**
   * Sends a transaction redeeming a HTLC contract using the `TimeoutResolve`
   * method to network and waits for confirmation
   */
  public async sendSyncRedeemTimeoutHtlcTransaction(p: RedeemTimeoutHtlcTxParams, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendRedeemTimeoutHtlcTransaction(p, options)
    if (hash.error)
      return hash
    return await this.waitForConfirmation(hash.data!, { addresses: [p.wallet] }, options.waitForConfirmationTimeout, hash.context)
  }

  /**
   * Returns a serialized transaction redeeming a HTLC contract using the `EarlyResolve`
   * method.
   */
  public async createRedeemEarlyHtlcTransaction(p: RedeemEarlyHtlcTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'createRedeemEarlyHtlcTransaction', params: [p.wallet, p.htlcAddress, p.recipient, p.htlcSenderSignature, p.htlcRecipientSignature, p.value, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<RawTransaction>(req, options)
  }

  /**
   * Sends a transaction redeeming a HTLC contract using the `EarlyResolve`
   * method.
   */
  public async sendRedeemEarlyHtlcTransaction(p: RedeemEarlyHtlcTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'sendRedeemEarlyHtlcTransaction', params: [p.wallet, p.htlcAddress, p.recipient, p.htlcSenderSignature, p.htlcRecipientSignature, p.value, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<Hash>(req, options)
  }

  /**
   * Sends a transaction redeeming a HTLC contract using the `EarlyResolve`
   * method and waits for confirmation
   */
  public async sendSyncRedeemEarlyHtlcTransaction(p: RedeemEarlyHtlcTxParams, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendRedeemEarlyHtlcTransaction(p, options)
    if (hash.error)
      return hash
    return await this.waitForConfirmation(hash.data!, { addresses: [p.wallet] }, options.waitForConfirmationTimeout, hash.context)
  }

  /**
   * Returns a serialized signature that can be used to redeem funds from a HTLC contract using
   * the `EarlyResolve` method.
   */
  public async signRedeemEarlyHtlcTransaction(p: SignRedeemEarlyHtlcParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'signRedeemEarlyHtlcTransaction', params: [p.wallet, p.htlcAddress, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<string>(req, options)
  }

  /**
   * Returns a serialized `new_staker` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  public async createNewStakerTransaction(p: StakerTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'createNewStakerTransaction', params: [p.senderWallet, p.stakerWallet, p.delegation, p.value, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<RawTransaction>(req, options)
  }

  /**
   * Sends a `new_staker` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  public async sendNewStakerTransaction(p: StakerTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'sendNewStakerTransaction', params: [p.senderWallet, p.stakerWallet, p.delegation, p.value, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<Hash>(req, options)
  }

  /**
   * Sends a `new_staker` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee and waits for confirmation.
   */
  public async sendSyncNewStakerTransaction(p: StakerTxParams, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendNewStakerTransaction(p, options)
    if (hash.error)
      return hash
    return await this.waitForConfirmation(hash.data!, { addresses: [p.senderWallet], types: [LogType.CreateStaker] }, options.waitForConfirmationTimeout, hash.context)
  }

  /**
   * Returns a serialized `stake` transaction. The funds to be staked and the transaction fee will
   * be paid from the `sender_wallet`.
   */
  public async createStakeTransaction(p: StakeTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'createStakeTransaction', params: [p.senderWallet, p.stakerWallet, p.value, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<RawTransaction>(req, options)
  }

  /**
   * Sends a `stake` transaction. The funds to be staked and the transaction fee will
   * be paid from the `sender_wallet`.
   */
  public async sendStakeTransaction(p: StakeTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'sendStakeTransaction', params: [p.senderWallet, p.stakerWallet, p.value, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<Hash>(req, options)
  }

  /**
   * Sends a `stake` transaction. The funds to be staked and the transaction fee will
   * be paid from the `sender_wallet` and waits for confirmation.
   */
  public async sendSyncStakeTransaction(p: StakeTxParams, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendStakeTransaction(p, options)
    if (hash.error)
      return hash
    return await this.waitForConfirmation(hash.data!, { addresses: [p.senderWallet], types: [LogType.Stake] }, options.waitForConfirmationTimeout, hash.context)
  }

  /**
   * Returns a serialized `update_staker` transaction. You can pay the transaction fee from a basic
   * account (by providing the sender wallet) or from the staker account's balance (by not
   * providing a sender wallet).
   */
  public async createUpdateStakerTransaction(p: UpdateStakerTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'createUpdateStakerTransaction', params: [p.senderWallet, p.stakerWallet, p.newDelegation, p.reactivateAllStake, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<RawTransaction>(req, options)
  }

  /**
   * Sends a `update_staker` transaction. You can pay the transaction fee from a basic
   * account (by providing the sender wallet) or from the staker account's balance (by not
   * providing a sender wallet).
   */
  public async sendUpdateStakerTransaction(p: UpdateStakerTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'sendUpdateStakerTransaction', params: [p.senderWallet, p.stakerWallet, p.newDelegation, p.reactivateAllStake, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<Hash>(req, options)
  }

  /**
   * Sends a `update_staker` transaction. You can pay the transaction fee from a basic
   * account (by providing the sender wallet) or from the staker account's balance (by not
   * providing a sender wallet) and waits for confirmation.
   */
  public async sendSyncUpdateStakerTransaction(p: UpdateStakerTxParams, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendUpdateStakerTransaction(p, options)
    if (hash.error)
      return hash
    return await this.waitForConfirmation(hash.data!, { addresses: [p.senderWallet], types: [LogType.UpdateStaker] }, options.waitForConfirmationTimeout, hash.context)
  }

  /**
   * Returns a serialized `set_inactive_stake` transaction. You can pay the transaction fee from a basic
   * account (by providing the sender wallet) or from the staker account's balance (by not
   * providing a sender wallet).
   */
  public async createSetInactiveStakeTransaction(p: SetInactiveStakeTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'createSetInactiveStakeTransaction', params: [p.senderWallet, p.stakerWallet, p.value, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<RawTransaction>(req, options)
  }

  /**
   * Sends a `set_inactive_stake` transaction. You can pay the transaction fee from a basic
   * account (by providing the sender wallet) or from the staker account's balance (by not
   * providing a sender wallet).
   */
  public async sendSetInactiveStakeTransaction(p: SetInactiveStakeTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'sendSetInactiveStakeTransaction', params: [p.senderWallet, p.stakerWallet, p.value, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<Hash>(req, options)
  }

  /**
   * Sends a `set_inactive_stake` transaction. You can pay the transaction fee from a basic
   * account (by providing the sender wallet) or from the staker account's balance (by not
   * providing a sender wallet) and waits for confirmation.
   */
  public async sendSyncSetInactiveStakeTransaction(p: SetInactiveStakeTxParams, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendSetInactiveStakeTransaction(p, options)
    if (hash.error)
      return hash
    return await this.waitForConfirmation(hash.data!, { addresses: [p.senderWallet], types: [LogType.SetInactiveStake] }, options.waitForConfirmationTimeout, hash.context)
  }

  /**
   * Returns a serialized `unstake` transaction. The transaction fee will be paid from the funds
   * being unstaked.
   */
  public async createUnstakeTransaction(p: UnstakeTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'createUnstakeTransaction', params: [p.stakerWallet, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<RawTransaction>(req, options)
  }

  /**
   * Sends a `unstake` transaction. The transaction fee will be paid from the funds
   * being unstaked.
   */
  public async sendUnstakeTransaction(p: UnstakeTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'sendUnstakeTransaction', params: [p.stakerWallet, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<Hash>(req, options)
  }

  /**
   * Sends a `unstake` transaction. The transaction fee will be paid from the funds
   * being unstaked and waits for confirmation.
   */
  public async sendSyncUnstakeTransaction(p: UnstakeTxParams, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendUnstakeTransaction(p, options)
    if (hash.error)
      return hash
    return await this.waitForConfirmation(hash.data!, { addresses: [p.recipient], types: [LogType.Unstake] }, options.waitForConfirmationTimeout, hash.context)
  }

  /**
   * Returns a serialized `new_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee and the validator deposit.
   * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
   * have a double Option. So we use the following work-around for the signal data:
   * "" = Set the signal data field to None.
   * "0x29a4b..." = Set the signal data field to Some(0x29a4b...).
   */
  public async createNewValidatorTransaction(p: NewValidatorTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'createNewValidatorTransaction', params: [p.senderWallet, p.validator, p.signingSecretKey, p.votingSecretKey, p.rewardAddress, p.signalData, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<RawTransaction>(req, options)
  }

  /**
   * Sends a `new_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee and the validator deposit.
   * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
   * have a double Option. So we use the following work-around for the signal data:
   * "" = Set the signal data field to None.
   * "0x29a4b..." = Set the signal data field to Some(0x29a4b...).
   */
  public async sendNewValidatorTransaction(p: NewValidatorTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'sendNewValidatorTransaction', params: [p.senderWallet, p.validator, p.signingSecretKey, p.votingSecretKey, p.rewardAddress, p.signalData, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<Hash>(req, options)
  }

  /**
   * Sends a `new_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee and the validator deposit
   * and waits for confirmation.
   * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
   * have a double Option. So we use the following work-around for the signal data:
   * "" = Set the signal data field to None.
   * "0x29a4b..." = Set the signal data field to Some(0x29a4b...).
   */
  public async sendSyncNewValidatorTransaction(p: NewValidatorTxParams, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendNewValidatorTransaction(p, options)
    if (hash.error)
      return hash
    return await this.waitForConfirmation(hash.data!, { addresses: [p.senderWallet], types: [LogType.CreateValidator] }, options.waitForConfirmationTimeout, hash.context)
  }

  /**
   * Returns a serialized `update_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
   * have a double Option. So we use the following work-around for the signal data:
   * null = No change in the signal data field.
   * "" = Change the signal data field to None.
   * "0x29a4b..." = Change the signal data field to Some(0x29a4b...).
   */
  public async createUpdateValidatorTransaction(p: UpdateValidatorTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'createUpdateValidatorTransaction', params: [p.senderWallet, p.validator, p.newSigningSecretKey, p.newVotingSecretKey, p.newRewardAddress, p.newSignalData, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<RawTransaction>(req, options)
  }

  /**
   * Sends a `update_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
   * have a double Option. So we use the following work-around for the signal data:
   * null = No change in the signal data field.
   * "" = Change the signal data field to None.
   * "0x29a4b..." = Change the signal data field to Some(0x29a4b...).
   */
  public async sendUpdateValidatorTransaction(p: UpdateValidatorTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'sendUpdateValidatorTransaction', params: [p.senderWallet, p.validator, p.newSigningSecretKey, p.newVotingSecretKey, p.newRewardAddress, p.newSignalData, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<Hash>(req, options)
  }

  /**
   * Sends a `update_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee and waits for confirmation.
   * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
   * have a double Option. So we use the following work-around for the signal data:
   * null = No change in the signal data field.
   * "" = Change the signal data field to None.
   * "0x29a4b..." = Change the signal data field to Some(0x29a4b...).
   */
  public async sendSyncUpdateValidatorTransaction(p: UpdateValidatorTxParams, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendUpdateValidatorTransaction(p, options)
    if (hash.error)
      return hash
    return await this.waitForConfirmation(hash.data!, { addresses: [p.validator], types: [LogType.UpdateValidator] }, options.waitForConfirmationTimeout, hash.context)
  }

  /**
   * Returns a serialized `inactivate_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  public async createDeactivateValidatorTransaction(p: DeactiveValidatorTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'createDeactivateValidatorTransaction', params: [p.senderWallet, p.validator, p.signingSecretKey, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<RawTransaction>(req, options)
  }

  /**
   * Sends a `inactivate_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  public async sendDeactivateValidatorTransaction(p: DeactiveValidatorTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'sendDeactivateValidatorTransaction', params: [p.senderWallet, p.validator, p.signingSecretKey, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<Hash>(req, options)
  }

  /**
   * Sends a `inactivate_validator` transaction and waits for confirmation.
   * You need to provide the address of a basic account (the sender wallet)
   * to pay the transaction fee.
   */
  public async sendSyncDeactivateValidatorTransaction(p: DeactiveValidatorTxParams, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendDeactivateValidatorTransaction(p, options)
    if (hash.error)
      return hash
    return await this.waitForConfirmation(hash.data!, { addresses: [p.validator], types: [LogType.DeactivateValidator] }, options.waitForConfirmationTimeout, hash.context)
  }

  /**
   * Returns a serialized `reactivate_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  public async createReactivateValidatorTransaction(p: ReactivateValidatorTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'createReactivateValidatorTransaction', params: [p.senderWallet, p.validator, p.signingSecretKey, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<RawTransaction>(req, options)
  }

  /**
   * Sends a `reactivate_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  public async sendReactivateValidatorTransaction(p: ReactivateValidatorTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'sendReactivateValidatorTransaction', params: [p.senderWallet, p.validator, p.signingSecretKey, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<Hash>(req, options)
  }

  /**
   * Sends a `reactivate_validator` transaction and waits for confirmation.
   * You need to provide the address of a basic account (the sender wallet)
   * to pay the transaction fee.
   */
  public async sendSyncReactivateValidatorTransaction(p: ReactivateValidatorTxParams, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendReactivateValidatorTransaction(p, options)
    if (hash.error)
      return hash
    return await this.waitForConfirmation(hash.data!, { addresses: [p.validator], types: [LogType.ReactivateValidator] }, options.waitForConfirmationTimeout, hash.context)
  }

  /**
   * Returns a serialized `retire_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  public async createRetireValidatorTransaction(p: RetireValidatorTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'createRetireValidatorTransaction', params: [p.senderWallet, p.validator, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<RawTransaction>(req, options)
  }

  /**
   * Sends a `retire_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  public async sendRetireValidatorTransaction(p: RetireValidatorTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'sendRetireValidatorTransaction', params: [p.senderWallet, p.validator, p.fee, this.getValidityStartHeight(p)] }
    return this.client.call<Hash>(req, options)
  }

  /**
   * Sends a `retire_validator` transaction and waits for confirmation.
   * You need to provide the address of a basic account (the sender wallet)
   * to pay the transaction fee.
   */
  public async sendSyncRetireValidatorTransaction(p: RetireValidatorTxParams, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendRetireValidatorTransaction(p, options)
    if (hash.error)
      return hash
    return await this.waitForConfirmation(hash.data!, { addresses: [p.validator], types: [LogType.RetireValidator] }, options.waitForConfirmationTimeout, hash.context)
  }

  /**
   * Returns a serialized `delete_validator` transaction. The transaction fee will be paid from the
   * validator deposit that is being returned.
   * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
   * Failed delete validator transactions can diminish the validator deposit
   */
  public async createDeleteValidatorTransaction(p: DeleteValidatorTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'createDeleteValidatorTransaction', params: [p.validator, p.recipient, p.fee, p.value, this.getValidityStartHeight(p)] }
    return this.client.call<RawTransaction>(req, options)
  }

  /**
   * Sends a `delete_validator` transaction. The transaction fee will be paid from the
   * validator deposit that is being returned.
   * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
   * Failed delete validator transactions can diminish the validator deposit
   */
  public async sendDeleteValidatorTransaction(p: DeleteValidatorTxParams, options = DEFAULT_OPTIONS) {
    const req = { method: 'sendDeleteValidatorTransaction', params: [p.validator, p.recipient, p.fee, p.value, this.getValidityStartHeight(p)] }
    return this.client.call<Hash>(req, options)
  }

  /**
   * Sends a `delete_validator` transaction and waits for confirmation.
   * The transaction fee will be paid from the validator deposit that is being returned.
   * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
   * Failed delete validator transactions can diminish the validator deposit
   */
  public async sendSyncDeleteValidatorTransaction(p: DeleteValidatorTxParams, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendDeleteValidatorTransaction(p, options)
    if (hash.error)
      return hash
    return await this.waitForConfirmation(hash.data!, { addresses: [p.validator], types: [LogType.DeleteValidator] }, options.waitForConfirmationTimeout, hash.context)
  }
}
