import { Client } from "../client/client";
import { Address, Coin, Hash, RawTransaction, Transaction, ValidityStartHeight } from "../types/common";
import { MaybeCallResponse } from "../types/rpc-messages";
import { DEFAULT_OPTIONS as defaults, DEFAULT_OPTIONS } from "../client/http";

export type RawTransactionInfoParams = { rawTransaction: string };
export type TransactionParams = { wallet: Address, recipient: Address, value: Coin, fee: Coin, data?: string, } & ValidityStartHeight;
export type VestingTxParams = { wallet: Address, owner: Address, startTime: number, timeStep: number, numSteps: number, value: Coin, fee: Coin } & ValidityStartHeight;
export type RedeemVestingTxParams = { wallet: Address, contractAddress: Address, recipient: Address, value: Coin, fee: Coin } & ValidityStartHeight;
export type HtlcTransactionParams = { wallet: Address, htlcSender: Address, htlcRecipient: Address, hashRoot: string, hashCount: number, hashAlgorithm: string, timeout: number, value: Coin, fee: Coin } & ValidityStartHeight;
export type RedeemRegularHtlcTxParams = { wallet: Address, contractAddress: Address, recipient: Address, preImage: string, hashRoot: string, hashCount: number, hashAlgorithm: string, value: Coin, fee: Coin } & ValidityStartHeight;
export type RedeemTimeoutHtlcTxParams = { wallet: Address, contractAddress: Address, recipient: Address, value: Coin, fee: Coin } & ValidityStartHeight;
export type RedeemEarlyHtlcTxParams = { wallet: Address, htlcAddress: Address, recipient: Address, htlcSenderSignature: string, htlcRecipientSignature: string, value: Coin, fee: Coin } & ValidityStartHeight;
export type SignRedeemEarlyHtlcParams = { wallet: Address, htlcAddress: Address, recipient: Address, value: Coin, fee: Coin } & ValidityStartHeight;
export type StakerTxParams = { senderWallet: Address, staker: Address, delegation: Address | undefined, value: Coin, fee: Coin } & ValidityStartHeight;
export type StakeTxParams = { senderWallet: Address, staker: Address, value: Coin, fee: Coin } & ValidityStartHeight;
export type UpdateStakerTxParams = { senderWallet: Address, staker: Address, newDelegation: Address, fee: Coin } & ValidityStartHeight;
export type UnstakeTxParams = { staker: Address, recipient: Address, value: Coin, fee: Coin } & ValidityStartHeight;
export type NewValidatorTxParams = { senderWallet: Address, validator: Address, signingSecretKey: string, votingSecretKey: string, rewardAddress: Address, signalData: string, fee: Coin } & ValidityStartHeight;
export type UpdateValidatorTxParams = { senderWallet: Address, validator: Address, newSigningSecretKey: string, newVotingSecretKey: string, newRewardAddress: Address, newSignalData: string, fee: Coin } & ValidityStartHeight;
export type InactiveValidatorTxParams = { senderWallet: Address, validator: Address, signingSecretKey: string, fee: Coin } & ValidityStartHeight;
export type ReactivateValidatorTxParams = { senderWallet: Address, validator: Address, signingSecretKey: string, fee: Coin } & ValidityStartHeight;
export type UnparkValidatorTxParams = { senderWallet: Address, validator: Address, signingSecretKey: string, fee: Coin } & ValidityStartHeight;
export type DeleteValidatorTxParams = { validator: Address, recipient: Address, fee: Coin, value: Coin } & ValidityStartHeight;

export class ConsensusClient extends Client {
    constructor(url: URL) {
        super(url);
    }

    private getValidityStartHeight(p: ValidityStartHeight, options = DEFAULT_OPTIONS): string {
        return 'relativeValidityStartHeight' in p ? `+${p.relativeValidityStartHeight}` : `${p.absoluteValidityStartHeight}`;
    }

    /**
     * Returns a boolean specifying if we have established consensus with the network
     */
    public async isConsensusEstablished(options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Boolean>> {
        return this.call("isConsensusEstablished", [], options);
    }

    /**
     * Given a serialized transaction, it will return the corresponding transaction struct
     */
    public async getRawTransactionInfo({ rawTransaction }: RawTransactionInfoParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Transaction>> {
        return this.call("getRawTransactionInfo", [rawTransaction], options);
    }

    /**
     * Creates a serialized transaction
     */
    public async createTransaction(p: TransactionParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<RawTransaction>> {
        if (p.data) {
            return this.call("createBasicTransactionWithData", [p.wallet, p.recipient, p.data, p.value, p.fee, this.getValidityStartHeight(p)], options);
        } else {
            return this.call("createBasicTransaction", [p.wallet, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)], options);
        }
    }

    /**
     * Sends a transaction
     */
    public async sendTransaction(p: TransactionParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Hash>> {
        const h = this.getValidityStartHeight(p);
        if (p.data) {
            return this.call("sendBasicTransactionWithData", [p.wallet, p.recipient, p.data, p.value, p.fee, this.getValidityStartHeight(p)], options);
        } else {
            return this.call("sendBasicTransaction", [p.wallet, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)], options);
        }
    }

    /**
     * Returns a serialized transaction creating a new vesting contract
     */
    public async createNewVestingTransaction(p: VestingTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<RawTransaction>> {
        return this.call("createNewVestingTransaction", [
            p.wallet, p.owner, p.startTime, p.timeStep, p.numSteps, p.value, p.fee, this.getValidityStartHeight(p)], options);
    }

    /**
     * Sends a transaction creating a new vesting contract to the network
     */
    public async sendNewVestingTransaction(p: VestingTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Hash>> {
        return this.call("sendNewVestingTransaction", [
            p.wallet, p.owner, p.startTime, p.timeStep, p.numSteps, p.value, p.fee,  this.getValidityStartHeight(p)], options);
    }

    /**
     * Returns a serialized transaction redeeming a vesting contract
     */
    public async createRedeemVestingTransaction(p: RedeemVestingTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<RawTransaction>> {
        return this.call("createRedeemVestingTransaction", [
            p.wallet, p.contractAddress, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)], options);
    }

    /**
     * Sends a transaction redeeming a vesting contract
     */
    public async sendRedeemVestingTransaction(p: RedeemVestingTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Hash>> {
        return this.call("sendRedeemVestingTransaction", [
            p.wallet, p.contractAddress, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)], options);
    }

    /**
     * Returns a serialized transaction creating a new HTLC contract
     */
    public async createNewHtlcTransaction(p: HtlcTransactionParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<RawTransaction>> {
        return this.call("createNewHtlcTransaction", [
            p.wallet, p.htlcSender, p.htlcRecipient, p.hashRoot, p.hashCount, p.hashAlgorithm, p.timeout, p.value, p.fee,  this.getValidityStartHeight(p)], options);
    }
    
    /**
     * Sends a transaction creating a new HTLC contract
     */
    public async sendNewHtlcTransaction(p: HtlcTransactionParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Hash>> {
        return this.call("sendNewHtlcTransaction", [
            p.wallet, p.htlcSender, p.htlcRecipient, p.hashRoot, p.hashCount, p.hashAlgorithm, p.timeout, p.value, p.fee,  this.getValidityStartHeight(p)], options);
    }
        

    /**
     * Returns a serialized transaction redeeming an HTLC contract
     */
    public async createRedeemRegularHtlcTransaction(p: RedeemRegularHtlcTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<RawTransaction>> {
        return this.call("createRedeemRegularHtlcTransaction", [
            p.wallet, p.contractAddress, p.recipient, p.preImage, p.hashRoot, p.hashCount, p.hashAlgorithm, p.value, p.fee,  this.getValidityStartHeight(p)
        ], options);
    }

    /**
     * Sends a transaction redeeming an HTLC contract
     */
    public async sendRedeemRegularHtlcTransaction(p: RedeemRegularHtlcTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Hash>> {
        return this.call("sendRedeemRegularHtlcTransaction", [
            p.wallet, p.contractAddress, p.recipient, p.preImage, p.hashRoot, p.hashCount, p.hashAlgorithm, p.value, p.fee,  this.getValidityStartHeight(p)
        ], options);
    }

    /**
     * Returns a serialized transaction redeeming a HTLC contract using the `TimeoutResolve`
     * method 
     */
    public async createRedeemTimeoutHtlcTransaction(p: RedeemTimeoutHtlcTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<RawTransaction>> {
        return this.call("createRedeemTimeoutHtlcTransaction", [
            p.wallet, p.contractAddress, p.recipient, p.value, p.fee,  this.getValidityStartHeight(p)
        ], options);
    }
    

    /**
     * Sends a transaction redeeming a HTLC contract using the `TimeoutResolve`
     * method to network
     */
    public async sendRedeemTimeoutHtlcTransaction(p: RedeemTimeoutHtlcTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Hash>> {
        return this.call("sendRedeemTimeoutHtlcTransaction", [
            p.wallet, p.contractAddress, p.recipient, p.value, p.fee,  this.getValidityStartHeight(p)
        ], options);
    }

    /**
     * Returns a serialized transaction redeeming a HTLC contract using the `EarlyResolve`
     * method.
     */
    public async createRedeemEarlyHtlcTransaction(p: RedeemEarlyHtlcTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<RawTransaction>> {
        return this.call("createRedeemEarlyHtlcTransaction", [
            p.wallet, p.htlcAddress, p.recipient, p.htlcSenderSignature, p.htlcRecipientSignature, p.value, p.fee,  this.getValidityStartHeight(p)
        ], options);
    }

    /**
     * Sends a transaction redeeming a HTLC contract using the `EarlyResolve`
     * method.
     */
    public async sendRedeemEarlyHtlcTransaction(p: RedeemEarlyHtlcTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Hash>> {
        return this.call("sendRedeemEarlyHtlcTransaction", [
            p.wallet, p.htlcAddress, p.recipient, p.htlcSenderSignature, p.htlcRecipientSignature, p.value, p.fee,  this.getValidityStartHeight(p)
        ], options);
    }

    /**
     * Returns a serialized signature that can be used to redeem funds from a HTLC contract using
     * the `EarlyResolve` method.
     */
    public async signRedeemEarlyHtlcTransaction(p: SignRedeemEarlyHtlcParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<String>> {
        return this.call("signRedeemEarlyHtlcTransaction", [
            p.wallet, p.htlcAddress, p.recipient, p.value, p.fee,  this.getValidityStartHeight(p)
        ], options);
    }

    /**
     * Returns a serialized `new_staker` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    public async createNewStakerTransaction(p: StakerTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<RawTransaction>> {
        return this.call("createNewStakerTransaction", [
            p.senderWallet, p.staker, p.delegation, p.value, p.fee,  this.getValidityStartHeight(p)
        ], options);
    }

    /**
     * Sends a `new_staker` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    public async sendNewStakerTransaction(p: StakerTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Hash>> {
        return this.call("sendNewStakerTransaction", [
            p.senderWallet, p.staker, p.delegation, p.value, p.fee,  this.getValidityStartHeight(p)
        ], options);
    }

    /**
     * Returns a serialized `stake` transaction. The funds to be staked and the transaction fee will
     * be paid from the `sender_wallet`.
     */
    public async createStakeTransaction(p: StakeTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<RawTransaction>> {
        return this.call("createStakeTransaction", [
            p.senderWallet, p.staker, p.value, p.fee,  this.getValidityStartHeight(p)
        ], options);
    }

    /**
     * Sends a `stake` transaction. The funds to be staked and the transaction fee will
     * be paid from the `sender_wallet`.
     */
    public async sendStakeTransaction(p: StakeTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Hash>> {
        return this.call("sendStakeTransaction", [
            p.senderWallet, p.staker, p.value, p.fee,  this.getValidityStartHeight(p)
        ], options);
    }

    /**
     * Returns a serialized `update_staker` transaction. You can pay the transaction fee from a basic
     * account (by providing the sender wallet) or from the staker account's balance (by not
     * providing a sender wallet).
     */
    public async createUpdateStakerTransaction(p: UpdateStakerTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<RawTransaction>> {
        return this.call("createUpdateStakerTransaction", [
            p.senderWallet, p.staker, p.newDelegation, p.fee,  this.getValidityStartHeight(p)
        ], options);
    }
    
    /**
     * Sends a `update_staker` transaction. You can pay the transaction fee from a basic
     * account (by providing the sender wallet) or from the staker account's balance (by not
     * providing a sender wallet).
     */
    public async sendUpdateStakerTransaction(p: UpdateStakerTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Hash>> {
        return this.call("sendUpdateStakerTransaction", [
            p.senderWallet, p.staker, p.newDelegation, p.fee,  this.getValidityStartHeight(p)
        ], options);
    }

    /**
     * Returns a serialized `unstake` transaction. The transaction fee will be paid from the funds
     * being unstaked.
     */
    public async createUnstakeTransaction(p: UnstakeTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<RawTransaction>> {
        return this.call("createUnstakeTransaction", [
            p.staker, p.recipient, p.value, p.fee,  this.getValidityStartHeight(p)
        ], options);
    }

    /**
     * Sends a `unstake` transaction. The transaction fee will be paid from the funds
     * being unstaked.
     */
    public async sendUnstakeTransaction(p: UnstakeTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Hash>> {
        return this.call("sendUnstakeTransaction", [
            p.staker, p.recipient, p.value, p.fee,  this.getValidityStartHeight(p)
        ], options);
    }

    /**
     * Returns a serialized `new_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee and the validator deposit.
     * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
     * have a double Option. So we use the following work-around for the signal data:
     * "" = Set the signal data field to None.
     * "0x29a4b..." = Set the signal data field to Some(0x29a4b...).
     */
    public async createNewValidatorTransaction(p: NewValidatorTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<RawTransaction>> {
        return this.call("createNewValidatorTransaction", [
            p.senderWallet, p.validator, p.signingSecretKey, p.votingSecretKey, p.rewardAddress, p.signalData, p.fee,  this.getValidityStartHeight(p)
        ], options);
    }

    /**
     * Sends a `new_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee and the validator deposit.
     * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
     * have a double Option. So we use the following work-around for the signal data:
     * "" = Set the signal data field to None.
     * "0x29a4b..." = Set the signal data field to Some(0x29a4b...).
     */
    public async sendNewValidatorTransaction(p: NewValidatorTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Hash>> {
        return this.call("sendNewValidatorTransaction", [
            p.senderWallet, p.validator, p.signingSecretKey, p.votingSecretKey, p.rewardAddress, p.signalData, p.fee,  this.getValidityStartHeight(p)
        ], options);
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
    public async createUpdateValidatorTransaction(p: UpdateValidatorTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<RawTransaction>> {
        return this.call("createUpdateValidatorTransaction", [
            p.senderWallet, p.validator, p.newSigningSecretKey, p.newVotingSecretKey, p.newRewardAddress, p.newSignalData, p.fee,  this.getValidityStartHeight(p)
        ], options);
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
    public async sendUpdateValidatorTransaction(p: UpdateValidatorTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Hash>> {
        return this.call("sendUpdateValidatorTransaction", [
            p.senderWallet, p.validator, p.newSigningSecretKey, p.newVotingSecretKey, p.newRewardAddress, p.newSignalData, p.fee,  this.getValidityStartHeight(p)
        ], options);
    }

    /**
     * Returns a serialized `inactivate_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    public async createDeactivateValidatorTransaction(p: InactiveValidatorTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<RawTransaction>> {
        return this.call("createDeactivateValidatorTransaction", [
            p.senderWallet, p.validator, p.signingSecretKey, p.fee,  this.getValidityStartHeight(p)
        ], options);
    }

    /**
     * Sends a `inactivate_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    public async sendDeactivateValidatorTransaction(p: InactiveValidatorTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Hash>> {
        return this.call("sendDeactivateValidatorTransaction", [
            p.senderWallet, p.validator, p.signingSecretKey, p.fee,  this.getValidityStartHeight(p)
        ], options);
    }

    /**
     * Returns a serialized `reactivate_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    public async createReactivateValidatorTransaction(p: ReactivateValidatorTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<RawTransaction>> {
        return this.call("createReactivateValidatorTransaction", [
            p.senderWallet, p.validator, p.signingSecretKey, p.fee,  this.getValidityStartHeight(p)
        ], options);
    }

    /**
     * Sends a `reactivate_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    public async sendReactivateValidatorTransaction(p: ReactivateValidatorTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Hash>> {
        return this.call("sendReactivateValidatorTransaction", [
            p.senderWallet, p.validator, p.signingSecretKey, p.fee,  this.getValidityStartHeight(p)
        ], options);
    }

    /**
     * Returns a serialized `unpark_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    public async createUnparkValidatorTransaction(p: UnparkValidatorTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<RawTransaction>> {
        return this.call("createUnparkValidatorTransaction", [
            p.senderWallet, p.validator, p.signingSecretKey, p.fee,  this.getValidityStartHeight(p)
        ], options);
    }

    /**
     * Sends a `unpark_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    public async sendUnparkValidatorTransaction(p: UnparkValidatorTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Hash>> {
        return this.call("sendUnparkValidatorTransaction", [
            p.senderWallet, p.validator, p.signingSecretKey, p.fee,  this.getValidityStartHeight(p)
        ], options);
    }

    /**
     * Returns a serialized `delete_validator` transaction. The transaction fee will be paid from the
     * validator deposit that is being returned.
     * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
     * Failed delete validator transactions can diminish the validator deposit
     */
    public async createDeleteValidatorTransaction(p: DeleteValidatorTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<RawTransaction>> {
        return this.call("createDeleteValidatorTransaction", [
            p.validator, p.recipient, p.fee, p.value,  this.getValidityStartHeight(p)
        ], options);
    }

    /**
     * Sends a `delete_validator` transaction. The transaction fee will be paid from the
     * validator deposit that is being returned.
     * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
     * Failed delete validator transactions can diminish the validator deposit
     */
    public async sendDeleteValidatorTransaction(p: DeleteValidatorTxParams, options = DEFAULT_OPTIONS): Promise<MaybeCallResponse<Hash>> {
        return this.call("sendDeleteValidatorTransaction", [
            p.validator, p.recipient, p.fee, p.value,  this.getValidityStartHeight(p)
        ], options);
    }
}