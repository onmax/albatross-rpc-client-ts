import { type } from "os";
import { Address, BlockNumber, Coin } from "../types/common";
import { RpcClient } from "./client";

type RawTransactionInfoParams = { rawTransaction: string };
type Action = 'create' | 'send';
type TransactionParams = { wallet: Address, recipient: Address, value: Coin, fee: Coin, validityStartHeight: BlockNumber, data?: string, };
type VestingTxParams = { wallet: Address, owner: Address, startTime: number, timeStep: number, numSteps: number, value: Coin, fee: Coin, validityStartHeight: BlockNumber };
type RedeemVestingTxParams = { wallet: Address, contractAddress: Address, recipient: Address, value: Coin, fee: Coin, validityStartHeight: BlockNumber };
type HtlcTransactionParams = { wallet: Address, htlcSender: Address, htlcRecipient: Address, hashRoot: string, hashCount: number, hashAlgorithm: string, timeout: number, value: Coin, fee: Coin, validityStartHeight: BlockNumber };
type RedeemRegularHtlcTxParams = { wallet: Address, contractAddress: Address, recipient: Address, preImage: string, hashRoot: string, hashCount: number, hashAlgorithm: string, value: Coin, fee: Coin, validityStartHeight: BlockNumber };
type RedeemTimeoutHtlcTxParams = { wallet: Address, contractAddress: Address, recipient: Address, value: Coin, fee: Coin, validityStartHeight: BlockNumber };
type RedeemEarlyHtlcTxParams = { wallet: Address, htlcAddress: Address, recipient: Address, htlcSenderSignature: string, htlcRecipientSignature: string, value: Coin, fee: Coin, validityStartHeight: BlockNumber };
type StakerTxParams = { senderWallet: Address, staker: Address, delegation: Address | undefined, value: Coin, fee: Coin, validityStartHeight: BlockNumber };
type StakeTxParams = { senderWallet: Address, staker: Address, value: Coin, fee: Coin, validityStartHeight: BlockNumber };
type UpdateStakerTxParams = { senderWallet: Address, staker: Address, newDelegation: Address, fee: Coin, validityStartHeight: BlockNumber };
type UnstakeTxParams = { staker: Address, recipient: Address, value: Coin, fee: Coin, validityStartHeight: BlockNumber };
type ValidatorTxParams = { senderWallet: Address, validator: Address, signingSecretKey: string, votingSecretKey: string, rewardAddress: Address, signalData: string, fee: Coin, validityStartHeight: BlockNumber };
type UpdateValidatorTxParams = { senderWallet: Address, validator: Address, newSigningSecretKey: string, newVotingSecretKey: string, newRewardAddress: Address, newSignalData: string, fee: Coin, validityStartHeight: BlockNumber };
type InactiveValidatorTxParams = { senderWallet: Address, validator: Address, signingSecretKey: string, fee: Coin, validityStartHeight: BlockNumber };
type ReactivateValidatorTxParams = { senderWallet: Address, validator: Address, signingSecretKey: string, fee: Coin, validityStartHeight: BlockNumber };
type UnparkValidatorTxParams = { senderWallet: Address, validator: Address, signingSecretKey: string, fee: Coin, validityStartHeight: BlockNumber };
type DeleteValidatorTxParams = { senderWallet: Address, validator: Address, fee: Coin, value: Coin, validityStartHeight: BlockNumber };

export class ConsensusClient extends RpcClient {
    constructor(url: URL) {
        super(url);
    }

    /**
     * Returns a boolean specifying if we have established consensus with the network
     */
    public async isConsensusEstablished() {
        return this.call("isConsensusEstablished", []);
    }

    /**
     * Given a serialized transaction, it will return the corresponding transaction struct
     */
    public async getRawTransactionInfo({ rawTransaction }: RawTransactionInfoParams) {
        return this.call("getRawTransactionInfo", [rawTransaction]);
    }

    /**
     * Creates a serialized transaction
     */
    public async createTransaction(p: TransactionParams) {
        const { wallet: w, recipient: r, value: v, fee: f, validityStartHeight: h, data: d } = p;
        if (d) {
            return this.call("createBasicTransactionWithData", [w, r, d, v, f, h]);
        } else {
            return this.call("createBasicTransaction", [w, r, v, f, h]);
        }
    }

    /**
     * Sends a transaction
     */
    public async sendTransaction(p: TransactionParams) {
        const { wallet: w, recipient: r, value: v, fee: f, validityStartHeight: h, data: d } = p;
        if (d) {
            return this.call("sendBasicTransactionWithData", [w, r, d, v, f, h]);
        } else {
            return this.call("sendBasicTransaction", [w, r, v, f, h]);
        }
    }

    /**
     * Returns a serialized transaction creating a new vesting contract
     */
    public async createNewVestingTransaction(p: VestingTxParams) {
        return this.call("createNewVestingTransaction", [
            p.wallet, p.owner, p.startTime, p.timeStep, p.numSteps, p.value, p.fee, p.validityStartHeight]);
    }

    /**
     * Sends a transaction creating a new vesting contract to the network
     */
    public async sendNewVestingTransaction(p: VestingTxParams) {
        return this.call("sendNewVestingTransaction", [
            p.wallet, p.owner, p.startTime, p.timeStep, p.numSteps, p.value, p.fee, p.validityStartHeight]);
    }

    /**
     * Returns a serialized transaction redeeming a vesting contract
     */
    public async createRedeemVestingTransaction(p: RedeemVestingTxParams) {
        return this.call("createRedeemVestingTransaction", [
            p.wallet, p.contractAddress, p.recipient, p.value, p.fee,p.validityStartHeight]);
    }

    /**
     * Sends a transaction redeeming a vesting contract
     */
    public async sendRedeemVestingTransaction(p: RedeemVestingTxParams) {
        return this.call("sendRedeemVestingTransaction", [
            p.wallet, p.contractAddress, p.recipient, p.value, p.fee,p.validityStartHeight]);
    }

    /**
     * Returns a serialized transaction creating a new HTLC contract
     */
    public async createNewHtlcTransaction(p: HtlcTransactionParams) {
        return this.call("createNewHtlcTransaction", [
            p.wallet, p.htlcSender, p.htlcRecipient, p.hashRoot, p.hashCount, p.hashAlgorithm, p.timeout, p.value, p.fee, p.validityStartHeight]);
    }
    
    /**
     * Sends a transaction creating a new HTLC contract
     */
    public async sendNewHtlcTransaction(p: HtlcTransactionParams) {
        return this.call("sendNewHtlcTransaction", [
            p.wallet, p.htlcSender, p.htlcRecipient, p.hashRoot, p.hashCount, p.hashAlgorithm, p.timeout, p.value, p.fee, p.validityStartHeight]);
    }
        

    /**
     * Returns a serialized transaction redeeming an HTLC contract
     */
    public async createRedeemRegularHtlcTransaction(p: RedeemRegularHtlcTxParams) {
        return this.call("createRedeemRegularHtlcTransaction", [
            p.wallet, p.contractAddress, p.recipient, p.preImage, p.hashRoot, p.hashCount, p.hashAlgorithm, p.value, p.fee, p.validityStartHeight
        ]);
    }

    /**
     * Sends a transaction redeeming an HTLC contract
     */
    public async sendRedeemRegularHtlcTransaction(p: RedeemRegularHtlcTxParams) {
        return this.call("sendRedeemRegularHtlcTransaction", [
            p.wallet, p.contractAddress, p.recipient, p.preImage, p.hashRoot, p.hashCount, p.hashAlgorithm, p.value, p.fee, p.validityStartHeight
        ]);
    }

    /**
     * Returns a serialized transaction redeeming a HTLC contract using the `TimeoutResolve`
     * method 
     */
    public async createRedeemTimeoutHtlcTransaction(p: RedeemTimeoutHtlcTxParams) {
        return this.call("createRedeemTimeoutHtlcTransaction", [
            p.wallet, p.contractAddress, p.recipient, p.value, p.fee, p.validityStartHeight
        ]);
    }
    

    /**
     * Sends a transaction redeeming a HTLC contract using the `TimeoutResolve`
     * method to network
     */
    public async sendRedeemTimeoutHtlcTransaction(p: RedeemTimeoutHtlcTxParams) {
        return this.call("sendRedeemTimeoutHtlcTransaction", [
            p.wallet, p.contractAddress, p.recipient, p.value, p.fee, p.validityStartHeight
        ]);
    }

    /**
     * Returns a serialized transaction redeeming a HTLC contract using the `EarlyResolve`
     * method.
     */
    public async createRedeemEarlyHtlcTransaction(p: RedeemEarlyHtlcTxParams) {
        return this.call("createRedeemEarlyHtlcTransaction", [
            p.wallet, p.htlcAddress, p.recipient, p.htlcSenderSignature, p.htlcRecipientSignature, p.value, p.fee, p.validityStartHeight
        ]);
    }

    /**
     * Sends a transaction redeeming a HTLC contract using the `EarlyResolve`
     * method.
     */
    public async sendRedeemEarlyHtlcTransaction(p: RedeemEarlyHtlcTxParams) {
        return this.call("sendRedeemEarlyHtlcTransaction", [
            p.wallet, p.htlcAddress, p.recipient, p.htlcSenderSignature, p.htlcRecipientSignature, p.value, p.fee, p.validityStartHeight
        ]);
    }

    /**
     * Returns a serialized signature that can be used to redeem funds from a HTLC contract using
     * the `EarlyResolve` method.
     */
    public async signRedeemEarlyHtlcTransaction(p: Omit<RedeemEarlyHtlcTxParams, 'htlcSenderSignature' | 'htlcRecipientSignature'>) {
        return this.call("signRedeemEarlyHtlcTransaction", [
            p.wallet, p.htlcAddress, p.recipient, p.value, p.fee, p.validityStartHeight
        ]);
    }

    /**
     * Returns a serialized `new_staker` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    public async createNewStakerTransaction(p: StakerTxParams) {
        return this.call("createNewStakerTransaction", [
            p.senderWallet, p.staker, p.delegation, p.value, p.fee, p.validityStartHeight
        ]);
    }

    /**
     * Sends a `new_staker` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    public async sendNewStakerTransaction(p: StakerTxParams) {
        return this.call("sendNewStakerTransaction", [
            p.senderWallet, p.staker, p.delegation, p.value, p.fee, p.validityStartHeight
        ]);
    }

    /**
     * Returns a serialized `stake` transaction. The funds to be staked and the transaction fee will
     * be paid from the `sender_wallet`.
     */
    public async createStakeTransaction(p: StakeTxParams) {
        return this.call("createStakeTransaction", [
            p.senderWallet, p.staker, p.value, p.fee, p.validityStartHeight
        ]);
    }

    /**
     * Sends a `stake` transaction. The funds to be staked and the transaction fee will
     * be paid from the `sender_wallet`.
     */
    public async sendStakeTransaction(p: StakeTxParams) {
        return this.call("sendStakeTransaction", [
            p.senderWallet, p.staker, p.value, p.fee, p.validityStartHeight
        ]);
    }

    /**
     * Returns a serialized `update_staker` transaction. You can pay the transaction fee from a basic
     * account (by providing the sender wallet) or from the staker account's balance (by not
     * providing a sender wallet).
     */
    public async createUpdateStakerTransaction(p: UpdateStakerTxParams) {
        return this.call("createUpdateStakerTransaction", [
            p.senderWallet, p.staker, p.newDelegation, p.fee, p.validityStartHeight
        ]);
    }
    
    /**
     * Sends a `update_staker` transaction. You can pay the transaction fee from a basic
     * account (by providing the sender wallet) or from the staker account's balance (by not
     * providing a sender wallet).
     */
    public async sendUpdateStakerTransaction(p: UpdateStakerTxParams) {
        return this.call("sendUpdateStakerTransaction", [
            p.senderWallet, p.staker, p.newDelegation, p.fee, p.validityStartHeight
        ]);
    }

    /**
     * Returns a serialized `unstake` transaction. The transaction fee will be paid from the funds
     * being unstaked.
     */
    public async createUnstakeTransaction(p: UnstakeTxParams) {
        return this.call("createUnstakeTransaction", [
            p.staker, p.recipient, p.value, p.fee, p.validityStartHeight
        ]);
    }

    /**
     * Sends a `unstake` transaction. The transaction fee will be paid from the funds
     * being unstaked.
     */
    public async sendUnstakeTransaction(p: UnstakeTxParams) {
        return this.call("sendUnstakeTransaction", [
            p.staker, p.recipient, p.value, p.fee, p.validityStartHeight
        ]);
    }

    /**
     * Returns a serialized `new_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee and the validator deposit.
     * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
     * have a double Option. So we use the following work-around for the signal data:
     * "" = Set the signal data field to None.
     * "0x29a4b..." = Set the signal data field to Some(0x29a4b...).
     */
    public async createNewValidatorTransaction(p: ValidatorTxParams) {
        return this.call("createNewValidatorTransaction", [
            p.senderWallet, p.validator, p.signingSecretKey, p.votingSecretKey, p.rewardAddress, p.signalData, p.fee, p.validityStartHeight
        ]);
    }

    /**
     * Sends a `new_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee and the validator deposit.
     * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
     * have a double Option. So we use the following work-around for the signal data:
     * "" = Set the signal data field to None.
     * "0x29a4b..." = Set the signal data field to Some(0x29a4b...).
     */
    public async sendNewValidatorTransaction(p: ValidatorTxParams) {
        return this.call("sendNewValidatorTransaction", [
            p.senderWallet, p.validator, p.signingSecretKey, p.votingSecretKey, p.rewardAddress, p.signalData, p.fee, p.validityStartHeight
        ]);
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
    public async createUpdateValidatorTransaction(p: UpdateValidatorTxParams) {
        return this.call("createUpdateValidatorTransaction", [
            p.senderWallet, p.validator, p.newSigningSecretKey, p.newVotingSecretKey, p.newRewardAddress, p.newSignalData, p.fee, p.validityStartHeight
        ]);
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
    public async sendUpdateValidatorTransaction(p: UpdateValidatorTxParams) {
        return this.call("sendUpdateValidatorTransaction", [
            p.senderWallet, p.validator, p.newSigningSecretKey, p.newVotingSecretKey, p.newRewardAddress, p.newSignalData, p.fee, p.validityStartHeight
        ]);
    }

    /**
     * Returns a serialized `inactivate_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    public async createInactivateValidatorTransaction(p: InactiveValidatorTxParams) {
        return this.call("createInactivateValidatorTransaction", [
            p.senderWallet, p.validator, p.signingSecretKey, p.fee, p.validityStartHeight
        ]);
    }

    /**
     * Sends a `inactivate_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    public async sendInactivateValidatorTransaction(p: InactiveValidatorTxParams) {
        return this.call("sendInactivateValidatorTransaction", [
            p.senderWallet, p.validator, p.signingSecretKey, p.fee, p.validityStartHeight
        ]);
    }

    /**
     * Returns a serialized `reactivate_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    public async createReactivateValidatorTransaction(p: ReactivateValidatorTxParams) {
        return this.call("createReactivateValidatorTransaction", [
            p.senderWallet, p.validator, p.signingSecretKey, p.fee, p.validityStartHeight
        ]);
    }

    /**
     * Sends a `reactivate_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    public async sendReactivateValidatorTransaction(p: ReactivateValidatorTxParams) {
        return this.call("sendReactivateValidatorTransaction", [
            p.senderWallet, p.validator, p.signingSecretKey, p.fee, p.validityStartHeight
        ]);
    }

    /**
     * Returns a serialized `unpark_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    public async createUnparkValidatorTransaction(p: UnparkValidatorTxParams) {
        return this.call("createUnparkValidatorTransaction", [
            p.senderWallet, p.validator, p.signingSecretKey, p.fee, p.validityStartHeight
        ]);
    }

    /**
     * Sends a `unpark_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    public async sendUnparkValidatorTransaction(p: UnparkValidatorTxParams) {
        return this.call("sendUnparkValidatorTransaction", [
            p.senderWallet, p.validator, p.signingSecretKey, p.fee, p.validityStartHeight
        ]);
    }

    /**
     * Returns a serialized `delete_validator` transaction. The transaction fee will be paid from the
     * validator deposit that is being returned.
     * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
     * Failed delete validator transactions can diminish the validator deposit
     */
    public async createDeleteValidatorTransaction(p: DeleteValidatorTxParams) {
        return this.call("createDeleteValidatorTransaction", [
            p.senderWallet, p.validator, p.fee, p.value, p.validityStartHeight
        ]);
    }

    /**
     * Sends a `delete_validator` transaction. The transaction fee will be paid from the
     * validator deposit that is being returned.
     * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
     * Failed delete validator transactions can diminish the validator deposit
     */
    public async sendDeleteValidatorTransaction(p: DeleteValidatorTxParams) {
        return this.call("sendDeleteValidatorTransaction", [
            p.senderWallet, p.validator, p.fee, p.value, p.validityStartHeight
        ]);
    }
}