import { Address, BlockNumber, Coin } from "../types/common";
import { RpcClient } from "./client";

export class ConsensusClient extends RpcClient {
    constructor(url: string) {
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
    public async getRawTransactionInfo(raw_transaction: string) {
        return this.call("getRawTransactionInfo", [raw_transaction]);
    }

    /**
     * Sends the given serialized transaction to the network
     */
    public async sendRawTransaction(raw_transaction: string) {
        return this.call("sendRawTransaction", [raw_transaction]);
    }

    /**
     * Returns a serialized basic transaction
     */
    public async createBasicTransaction(
        wallet: Address,
        recipient: Address,
        value: Coin,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("createBasicTransaction", [
            wallet,
            recipient,
            value,
            fee,
            validityStartHeight
        ]);
    }

    /**
     * Sends a basic transaction to the network
     */
    public async sendBasicTransaction(
        wallet: Address,
        recipient: Address,
        value: Coin,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("sendBasicTransaction", [
            wallet,
            recipient,
            value,
            fee,
            validityStartHeight
        ]);
    }

    /**
     * Returns a serialized basic transaction with an arbitrary data field
     */
    public async createBasicTransactionWithData(
        wallet: Address,
        recipient: Address,
        data: string,
        value: Coin,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("createBasicTransactionWithData", [
            wallet,
            recipient,
            data,
            value,
            fee,
            validityStartHeight
        ]);
    }

    /**
     * Sends a basic transaction, with an arbitrary data field, to the network
     */
    public async sendBasicTransactionWithData(
        wallet: Address,
        recipient: Address,
        data: string,
        value: Coin,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("sendBasicTransactionWithData", [
            wallet,
            recipient,
            data,
            value,
            fee,
            validityStartHeight
        ]);
    }

    /**
     * Returns a serialized transaction creating a new vesting contract
     */
    public async createNewVestingTransaction(
        wallet: Address,
        owner: Address,
        startTime: number,
        timeStep: number,
        numSteps: number,
        value: Coin,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("createNewVestingTransaction", [
            wallet,
            owner,
            startTime,
            timeStep,
            numSteps,
            value,
            fee,
            validityStartHeight
        ]);
    }
    
    /**
     * Sends a transaction creating a new vesting contract to the network
     */
    public async sendNewVestingTransaction(
        wallet: Address,
        owner: Address,
        startTime: number,
        timeStep: number,
        numSteps: number,
        value: Coin,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("sendNewVestingTransaction", [
            wallet,
            owner,
            startTime,
            timeStep,
            numSteps,
            value,
            fee,
            validityStartHeight
        ]);
    }

    /**
     * Returns a serialized transaction redeeming a vesting contract
     */
    public async createRedeemVestingTransaction(
        wallet: Address,
        contractAddress: Address,
        recipient: Address,
        value: Coin,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("createRedeemVestingTransaction", [
            wallet,
            contractAddress,
            recipient,
            value,
            fee,
            validityStartHeight
        ]);
    }

    /**
     * Sends a transaction redeeming a vesting contract
     */
    public async sendRedeemVestingTransaction(
        wallet: Address,
        contractAddress: Address,
        recipient: Address,
        value: Coin,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("sendRedeemVestingTransaction", [
            wallet,
            contractAddress,
            recipient,
            value,
            fee,
            validityStartHeight
        ]);
    }

    /**
     * Returns a serialized transaction creating a new HTLC contract
     */
    public async createNewHtlcTransaction(
        wallet: Address,
        htlcSender: Address,
        htlcRecipient: Address,
        hashRoot: string,
        hashCount: number,
        hashAlgorithm: string,
        timeout: number,
        value: Coin,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("createNewHtlcTransaction", [
            wallet,
            htlcSender,
            htlcRecipient,
            hashRoot,
            hashCount,
            hashAlgorithm,
            timeout,
            value,
            fee,
            validityStartHeight
        ]);
    }
    
    /**
     * Sends a transaction creating a new HTLC contract
     */
    public async sendNewHtlcTransaction(
        wallet: Address,
        htlcSender: Address,
        htlcRecipient: Address,
        hashRoot: string,
        hashCount: number,
        hashAlgorithm: string,
        timeout: number,
        value: Coin,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("sendNewHtlcTransaction", [
            wallet,
            htlcSender,
            htlcRecipient,
            hashRoot,
            hashCount,
            hashAlgorithm,
            timeout,
            value,
            fee,
            validityStartHeight
        ]);
    }

    /**
     * Returns a serialized transaction redeeming an HTLC contract
     */
    public async createRedeemRegularHtlcTransaction(
        wallet: Address,
        contractAddress: Address,
        recipient: Address,
        preImage: string,
        hashRoot: string,
        hashCount: number,
        hashAlgorithm: string,
        value: Coin,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("createRedeemRegularHtlcTransaction", [
            wallet,
            contractAddress,
            recipient,
            preImage,
            hashRoot,
            hashCount,
            hashAlgorithm,
            value,
            fee,
            validityStartHeight
        ]);
    }

    /**
     * Sends a transaction redeeming an HTLC contract
     */
    public async sendRedeemRegularHtlcTransaction(
        wallet: Address,
        contractAddress: Address,
        recipient: Address,
        preImage: string,
        hashRoot: string,
        hashCount: number,
        hashAlgorithm: string,
        value: Coin,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("sendRedeemRegularHtlcTransaction", [
            wallet,
            contractAddress,
            recipient,
            preImage,
            hashRoot,
            hashCount,
            hashAlgorithm,
            value,
            fee,
            validityStartHeight
        ]);
    }

    /**
     * Returns a serialized transaction redeeming a HTLC contract using the `TimeoutResolve`
     * method 
     */
    public async createRedeemTimeoutHtlcTransaction(
        wallet: Address,
        contractAddress: Address,
        recipient: Address,
        value: Coin,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("createRedeemTimeoutHtlcTransaction", [
            wallet,
            contractAddress,
            recipient,
            value,
            fee,
            validityStartHeight
        ]);
    }
    

    /**
     * Sends a transaction redeeming a HTLC contract using the `TimeoutResolve`
     * method to network
     */
    public async sendRedeemTimeoutHtlcTransaction(
        wallet: Address,
        contractAddress: Address,
        recipient: Address,
        value: Coin,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("sendRedeemTimeoutHtlcTransaction", [
            wallet,
            contractAddress,
            recipient,
            value,
            fee,
            validityStartHeight
        ]);
    }

    /**
     * Returns a serialized transaction redeeming a HTLC contract using the `EarlyResolve`
     * method.
     */
    public async createRedeemEarlyHtlcTransaction(
        wallet: Address,
        htlcAddress: Address,
        recipient: Address,
        htlcSenderSignature: string,
        htlcRecipientSignature: string,
        value: Coin,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("createRedeemEarlyHtlcTransaction", [
            wallet,
            htlcAddress,
            recipient,
            htlcSenderSignature,
            htlcRecipientSignature,
            value,
            fee,
            validityStartHeight
        ]);
    }

    /**
     * Sends a transaction redeeming a HTLC contract using the `EarlyResolve`
     * method.
     */
    public async sendRedeemEarlyHtlcTransaction(
        wallet: Address,
        htlcAddress: Address,
        recipient: Address,
        htlcSenderSignature: string,
        htlcRecipientSignature: string,
        value: Coin,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("sendRedeemEarlyHtlcTransaction", [
            wallet,
            htlcAddress,
            recipient,
            htlcSenderSignature,
            htlcRecipientSignature,
            value,
            fee,
            validityStartHeight
        ]);
    }

    /**
     * Returns a serialized signature that can be used to redeem funds from a HTLC contract using
     * the `EarlyResolve` method.
     */
    public async signRedeemEarlyHtlcTransaction(
        wallet: Address,
        htlcAddress: Address,
        recipient: Address,
        value: Coin,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("signRedeemEarlyHtlcTransaction", [
            wallet,
            htlcAddress, 
            recipient,
            value,
            fee,
            validityStartHeight
        ]);
    }   

    /**
     * Returns a serialized `new_staker` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    public async createNewStakerTransaction(
        senderWallet: Address,
        staker: Address,
        delegation: Address | undefined,
        value: Coin,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("createNewStakerTransaction", [
            senderWallet,
            staker,
            delegation,
            value,
            fee,
            validityStartHeight
        ]);
    }

    /**
     * Sends a `new_staker` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    public async sendNewStakerTransaction(
        senderWallet: Address,
        staker: Address,
        delegation: Address | undefined,
        value: Coin,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("sendNewStakerTransaction", [
            senderWallet,
            staker,
            delegation,
            value,
            fee,
            validityStartHeight
        ]);
    }

    /**
     * Returns a serialized `stake` transaction. The funds to be staked and the transaction fee will
     * be paid from the `sender_wallet`.
     */
    public async createStakeTransaction(
        senderWallet: Address,
        staker: Address,
        value: Coin,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("createStakeTransaction", [
            senderWallet,
            staker,
            value,
            fee,
            validityStartHeight
        ]);
    }

    /**
     * Sends a `stake` transaction. The funds to be staked and the transaction fee will
     * be paid from the `sender_wallet`.
     */
    public async sendStakeTransaction(
        senderWallet: Address,
        staker: Address,
        value: Coin,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("sendStakeTransaction", [
            senderWallet,
            staker,
            value,
            fee,
            validityStartHeight
        ]);
    }

    /**
     * Returns a serialized `update_staker` transaction. You can pay the transaction fee from a basic
     * account (by providing the sender wallet) or from the staker account's balance (by not
     * providing a sender wallet).
     */
    public async createUpdateStakerTransaction(
        senderWallet: Address,
        staker: Address,
        newDelegation: Address,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("createUpdateStakerTransaction", [
            senderWallet,
            staker,
            newDelegation,
            fee,
            validityStartHeight
        ]);
    }
    
    /**
     * Sends a `update_staker` transaction. You can pay the transaction fee from a basic
     * account (by providing the sender wallet) or from the staker account's balance (by not
     * providing a sender wallet).
     */
    public async sendUpdateStakerTransaction(
        senderWallet: Address,
        staker: Address,
        newDelegation: Address,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("sendUpdateStakerTransaction", [
            senderWallet,
            staker,
            newDelegation,
            fee,
            validityStartHeight
        ]);
    }

    /**
     * Returns a serialized `unstake` transaction. The transaction fee will be paid from the funds
     * being unstaked.
     */
    public async createUnstakeTransaction(
        staker: Address,
        recipient: Address,
        value: Coin,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("createUnstakeTransaction", [
            staker,
            recipient,
            value,
            fee,
            validityStartHeight
        ]);
    }

    /**
     * Sends a `unstake` transaction. The transaction fee will be paid from the funds
     * being unstaked.
     */
    public async sendUnstakeTransaction(
        staker: Address,
        recipient: Address,
        value: Coin,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("sendUnstakeTransaction", [
            staker,
            recipient,
            value,
            fee,
            validityStartHeight
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
    public async createNewValidatorTransaction(
        senderWallet: Address,
        validator: Address,
        signingSecretKey: String,
        votingSecretKey: String,
        rewardAddress: Address,
        signalData: String,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("createNewValidatorTransaction", [
            senderWallet,
            validator,
            signingSecretKey,
            votingSecretKey,
            rewardAddress,
            signalData,
            fee,
            validityStartHeight
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
    public async sendNewValidatorTransaction(
        senderWallet: Address,
        validator: Address,
        signingSecretKey: String,
        votingSecretKey: String,
        rewardAddress: Address,
        signalData: String,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("sendNewValidatorTransaction", [
            senderWallet,
            validator,
            signingSecretKey,
            votingSecretKey,
            rewardAddress,
            signalData,
            fee,
            validityStartHeight
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
    public async createUpdateValidatorTransaction(
        senderWallet: Address,
        validator: Address,
        newSigningSecretKey: String,
        newVotingSecretKey: String,
        newRewardAddress: Address,
        newSignalData: String,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("createUpdateValidatorTransaction", [
            senderWallet,
            validator,
            newSigningSecretKey,
            newVotingSecretKey,
            newRewardAddress,
            newSignalData,
            fee,
            validityStartHeight
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
    public async sendUpdateValidatorTransaction(
        senderWallet: Address,
        validator: Address,
        newSigningSecretKey: String,
        newVotingSecretKey: String,
        newRewardAddress: Address,
        newSignalData: String,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("sendUpdateValidatorTransaction", [
            senderWallet,
            validator,
            newSigningSecretKey,
            newVotingSecretKey,
            newRewardAddress,
            newSignalData,
            fee,
            validityStartHeight
        ]);
    }

    /**
     * Returns a serialized `inactivate_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    public async createInactivateValidatorTransaction(
        senderWallet: Address,
        validator: Address,
        signingSecretKey: string,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("createInactivateValidatorTransaction", [
            senderWallet,
            validator,
            signingSecretKey,
            fee,
            validityStartHeight
        ]);
    }

    /**
     * Sends a `inactivate_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    public async sendInactivateValidatorTransaction(
        senderWallet: Address,
        validator: Address,
        signingSecretKey: string,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("sendInactivateValidatorTransaction", [
            senderWallet,
            validator,
            signingSecretKey,
            fee,
            validityStartHeight
        ]);
    }

    /**
     * Returns a serialized `reactivate_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    public async createReactivateValidatorTransaction(
        senderWallet: Address,
        validator: Address,
        signingSecretKey: string,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("createReactivateValidatorTransaction", [
            senderWallet,
            validator,
            signingSecretKey,
            fee,
            validityStartHeight
        ]);
    }

    /**
     * Sends a `reactivate_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    public async sendReactivateValidatorTransaction(
        senderWallet: Address,
        validator: Address,
        signingSecretKey: string,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("sendReactivateValidatorTransaction", [
            senderWallet,
            validator,
            signingSecretKey,
            fee,
            validityStartHeight
        ]);
    }

    /**
     * Returns a serialized `unpark_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    public async createUnparkValidatorTransaction(
        senderWallet: Address,
        validator: Address,
        signingSecretKey: string,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("createUnparkValidatorTransaction", [
            senderWallet,
            validator,
            signingSecretKey,
            fee,
            validityStartHeight
        ]);
    }

    /**
     * Sends a `unpark_validator` transaction. You need to provide the address of a basic
     * account (the sender wallet) to pay the transaction fee.
     */
    public async sendUnparkValidatorTransaction(
        senderWallet: Address,
        validator: Address,
        signingSecretKey: string,
        fee: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("sendUnparkValidatorTransaction", [
            senderWallet,
            validator,
            signingSecretKey,
            fee,
            validityStartHeight
        ]);
    }

    /**
     * Returns a serialized `delete_validator` transaction. The transaction fee will be paid from the
     * validator deposit that is being returned.
     * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
     * Failed delete validator transactions can diminish the validator deposit
     */
    public async createDeleteValidatorTransaction(
        senderWallet: Address,
        validator: Address,
        fee: Coin,
        value: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("createDeleteValidatorTransaction", [
            senderWallet,
            validator,
            fee,
            value,
            validityStartHeight
        ]);
    }

    /**
     * Sends a `delete_validator` transaction. The transaction fee will be paid from the
     * validator deposit that is being returned.
     * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
     * Failed delete validator transactions can diminish the validator deposit
     */
    public async sendDeleteValidatorTransaction(
        senderWallet: Address,
        validator: Address,
        fee: Coin,
        value: Coin,
        validityStartHeight: BlockNumber
    ) {
        return this.call("sendDeleteValidatorTransaction", [
            senderWallet,
            validator,
            fee,
            value,
            validityStartHeight
        ]);
    }
}