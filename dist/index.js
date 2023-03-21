var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/client/http.ts
import fetch from "node-fetch";
var _HttpClient = class {
  constructor(url) {
    this.url = url;
  }
  call(method, params, withMetadata) {
    return __async(this, null, function* () {
      params = params.map((param) => param === void 0 ? null : param);
      const context = {
        // @ts-ignore
        method,
        params,
        id: _HttpClient.id
      };
      const response = yield fetch(this.url.href, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method,
          params,
          id: _HttpClient.id++
        })
      });
      if (!response.ok) {
        return {
          error: {
            code: response.status,
            message: response.status === 401 ? "Server requires authorization." : `Response status code not OK: ${response.status} ${response.statusText}`
          },
          data: void 0,
          context
        };
      }
      const json = yield response.json();
      const typedData = json;
      if ("result" in typedData) {
        const data = !withMetadata || !typedData.result.metadata ? typedData.result.data : typedData.result;
        return {
          error: void 0,
          data,
          context
        };
      }
      if ("error" in typedData) {
        return {
          error: {
            code: typedData.error.code,
            message: `${typedData.error.message}: ${typedData.error.data}`
          },
          data: void 0,
          context
        };
      }
      return {
        error: {
          code: -1,
          message: `Unexpected format of data ${JSON.stringify(json)}`
        },
        data: void 0,
        context
      };
    });
  }
};
var HttpClient = _HttpClient;
HttpClient.id = 0;

// src/client/web-socket.ts
import { Blob } from "buffer";
import WebSocket from "ws";
var WebSocketClient = class {
  constructor(url) {
    this.id = 0;
    const wsUrl = new URL(url.href.replace(/^http/, "ws"));
    wsUrl.pathname = "/ws";
    this.url = wsUrl;
    this.textDecoder = new TextDecoder();
  }
  subscribe(event, params, withMetadata) {
    return __async(this, null, function* () {
      const ws = new WebSocket(this.url.href);
      let subscriptionId;
      const options = {
        next: (callback) => {
          ws.onmessage = (event2) => __async(this, null, function* () {
            const payload = yield this.parsePayload(event2);
            if ("result" in payload) {
              subscriptionId = payload.result;
              return;
            }
            const data = withMetadata ? payload.params.result : payload.params.result.data;
            callback(data);
          });
        },
        error: (callback) => {
          ws.onerror = (error) => {
            callback(error);
          };
        },
        close: () => {
          ws.close();
        },
        getSubscriptionId: () => subscriptionId
      };
      return new Promise((resolve) => {
        ws.onopen = () => {
          ws.send(JSON.stringify({
            jsonrpc: "2.0",
            method: event,
            params,
            id: this.id++
          }));
          resolve(options);
        };
      });
    });
  }
  parsePayload(event) {
    return __async(this, null, function* () {
      let payloadStr;
      if (event.data instanceof Blob) {
        payloadStr = this.textDecoder.decode(yield event.data.arrayBuffer());
      } else if (event.data instanceof ArrayBuffer || event.data instanceof Buffer) {
        payloadStr = this.textDecoder.decode(event.data);
      } else {
        throw new Error("Unexpected data type");
      }
      try {
        return JSON.parse(payloadStr);
      } catch (e) {
        throw new Error(`Unexpected payload: ${payloadStr}`);
      }
    });
  }
};

// src/client/client.ts
var Client = class {
  constructor(url) {
    this.httpClient = new HttpClient(url);
    this.webSocketClient = new WebSocketClient(url);
  }
  call(method, params, withMetadata = false) {
    return __async(this, null, function* () {
      return this.httpClient.call(method, params, withMetadata);
    });
  }
  subscribe(event, params, withMetadata = false) {
    return __async(this, null, function* () {
      return this.webSocketClient.subscribe(event, params, withMetadata);
    });
  }
};

// src/modules/blockchain.ts
var BlockchainClient = class extends Client {
  constructor(url) {
    super(url);
  }
  /**
   * Returns the block number for the current head.
   */
  getBlockNumber() {
    return __async(this, null, function* () {
      return this.call("getBlockNumber", []);
    });
  }
  /**
   * Returns the batch number for the current head.
   */
  getBatchNumber() {
    return __async(this, null, function* () {
      return this.call("getBatchNumber", []);
    });
  }
  /**
   * Returns the epoch number for the current head.
   */
  getEpochNumber() {
    return __async(this, null, function* () {
      return this.call("getEpochNumber", []);
    });
  }
  /**
   * Tries to fetch a block given its hash or block number. It has an option to include the transactions in the block, which defaults to false.
   */
  getBlockBy() {
    return __async(this, arguments, function* (p = { includeTransactions: false }) {
      if ("hash" in p) {
        return this.call("getBlockByHash", [p.hash, p.includeTransactions]);
      }
      return this.call("getBlockByNumber", [p.blockNumber, p.includeTransactions]);
    });
  }
  /**
   * Returns the block at the head of the main chain. It has an option to include the
   * transactions in the block, which defaults to false.
   */
  getLatestBlock() {
    return __async(this, arguments, function* (p = { includeTransactions: false }) {
      return this.call("getLatestBlock", [p.includeTransactions]);
    });
  }
  /**
   * Returns the information for the slot owner at the given block height and offset. The
   * offset is optional, it will default to getting the offset for the existing block
   * at the given height.
   */
  getSlotAt(_0) {
    return __async(this, arguments, function* ({ blockNumber, offsetOpt, withMetadata }) {
      return this.call("getSlotAt", [blockNumber, offsetOpt], withMetadata);
    });
  }
  /**
   * Fetchs the transaction(s) given the parameters. The parameters can be a hash, a block number, a batch number or an address.
   * 
   * In case of address, it returns the latest transactions for a given address. All the transactions
   * where the given address is listed as a recipient or as a sender are considered. Reward
   * transactions are also returned. It has an option to specify the maximum number of transactions
   * to fetch, it defaults to 500.
   */
  getTransactionBy(p) {
    return __async(this, null, function* () {
      if ("hash" in p) {
        return this.call("getTransactionByHash", [p.hash]);
      } else if ("blockNumber" in p) {
        return this.call("getTransactionsByBlockNumber", [p.blockNumber]);
      } else if ("batchNumber" in p) {
        return this.call("getTransactionsByBatchNumber", [p.batchNumber]);
      } else if ("address" in p) {
        if (p.justHashes === true) {
          return this.call("getTransactionHashesByAddress", [p.address, p.max]);
        } else {
          return this.call("getTransactionsByAddress", [p.address, p.max]);
        }
      }
      throw new Error("Invalid parameters");
    });
  }
  /**
   * Returns all the inherents (including reward inherents) for the parameter. Note
   * that this only considers blocks in the main chain.
   */
  getInherentsBy(p) {
    return __async(this, null, function* () {
      if ("blockNumber" in p) {
        return this.call("getInherentsByBlockNumber", [p.blockNumber]);
      } else if ("batchNumber" in p) {
        return this.call("getInherentsByBatchNumber", [p.batchNumber]);
      }
      throw new Error("Invalid parameters");
    });
  }
  /**
   * Tries to fetch the account at the given address.
   */
  getAccountBy(_0) {
    return __async(this, arguments, function* ({ address, withMetadata }) {
      return this.call("getAccountByAddress", [address], withMetadata);
    });
  }
  /**
  * Returns a collection of the currently active validator's addresses and balances.
  */
  getActiveValidators() {
    return __async(this, arguments, function* ({ withMetadata } = { withMetadata: false }) {
      return this.call("getActiveValidators", [], withMetadata);
    });
  }
  /**
   * Returns information about the currently slashed slots. This includes slots that lost rewards
   * and that were disabled.
   */
  getCurrentSlashedSlots() {
    return __async(this, arguments, function* ({ withMetadata } = { withMetadata: false }) {
      return this.call("getCurrentSlashedSlots", [], withMetadata);
    });
  }
  /**
   * Returns information about the slashed slots of the previous batch. This includes slots that
   * lost rewards and that were disabled.
   */
  getPreviousSlashedSlots() {
    return __async(this, arguments, function* ({ withMetadata } = { withMetadata: false }) {
      return this.call("getPreviousSlashedSlots", [], withMetadata);
    });
  }
  /**
   * Returns information about the currently parked validators.
   */
  getParkedValidators() {
    return __async(this, arguments, function* ({ withMetadata } = { withMetadata: false }) {
      return this.call("getParkedValidators", [], withMetadata);
    });
  }
  /**
   * Tries to fetch a validator information given its address. It has an option to include a map
   * containing the addresses and stakes of all the stakers that are delegating to the validator.
   */
  getValidatorBy() {
    return __async(this, arguments, function* (p = { includeStakers: false }) {
      return this.call("getValidatorByAddress", [p.address, p.includeStakers]);
    });
  }
  /**
   * Tries to fetch a staker information given its address.
   */
  getStakerByAddress(_0) {
    return __async(this, arguments, function* ({ address }) {
      return this.call("getStakerByAddress", [address]);
    });
  }
  /**
   * Subscribes to new block events.
   */
  subscribeForBlocks(_0) {
    return __async(this, arguments, function* ({ filter }) {
      switch (filter) {
        case "FULL":
          return this.subscribe("subscribeForHeadBlock", [
            /*includeTransactions*/
            true
          ]);
        case "PARTIAL":
          return this.subscribe("subscribeForHeadBlock", [
            /*includeTransactions*/
            false
          ]);
        case "HASH":
          return this.subscribe("subscribeForHeadBlockHash", []);
      }
    });
  }
  /**
   * Subscribes to pre epoch validators events.
   */
  subscribeForValidatorElectionByAddress() {
    return __async(this, arguments, function* (p = { withMetadata: false }) {
      return this.subscribe("subscribeForValidatorElectionByAddress", [p.address], p.withMetadata);
    });
  }
  /**
   * Subscribes to log events related to a given list of addresses and of any of the log types provided.
   * If addresses is empty it does not filter by address. If log_types is empty it won't filter by log types.
   * Thus the behavior is to assume all addresses or log_types are to be provided if the corresponding vec is empty.
   */
  subscribeForLogsByAddressesAndTypes() {
    return __async(this, arguments, function* (p = { withMetadata: false }) {
      return this.subscribe("subscribeForLogsByAddressesAndTypes", [(p == null ? void 0 : p.addresses) || [], (p == null ? void 0 : p.types) || []], p == null ? void 0 : p.withMetadata);
    });
  }
};

// src/modules/consensus.ts
var ConsensusClient = class extends Client {
  constructor(url) {
    super(url);
  }
  getValidityStartHeight(p) {
    return "relativeValidityStartHeight" in p ? `+${p.relativeValidityStartHeight}` : `${p.absoluteValidityStartHeight}`;
  }
  /**
   * Returns a boolean specifying if we have established consensus with the network
   */
  isConsensusEstablished() {
    return __async(this, null, function* () {
      return this.call("isConsensusEstablished", []);
    });
  }
  /**
   * Given a serialized transaction, it will return the corresponding transaction struct
   */
  getRawTransactionInfo(_0) {
    return __async(this, arguments, function* ({ rawTransaction }) {
      return this.call("getRawTransactionInfo", [rawTransaction]);
    });
  }
  /**
   * Creates a serialized transaction
   */
  createTransaction(p) {
    return __async(this, null, function* () {
      if (p.data) {
        return this.call("createBasicTransactionWithData", [p.wallet, p.recipient, p.data, p.value, p.fee, this.getValidityStartHeight(p)]);
      } else {
        return this.call("createBasicTransaction", [p.wallet, p.recipient, p.data, p.value, p.fee, this.getValidityStartHeight(p)]);
      }
    });
  }
  /**
   * Sends a transaction
   */
  sendTransaction(p) {
    return __async(this, null, function* () {
      const h = this.getValidityStartHeight(p);
      if (p.data) {
        return this.call("sendBasicTransactionWithData", [p.wallet, p.recipient, p.data, p.value, p.fee, this.getValidityStartHeight(p)]);
      } else {
        return this.call("sendBasicTransaction", [p.wallet, p.recipient, p.data, p.value, p.fee, this.getValidityStartHeight(p)]);
      }
    });
  }
  /**
   * Returns a serialized transaction creating a new vesting contract
   */
  createNewVestingTransaction(p) {
    return __async(this, null, function* () {
      return this.call("createNewVestingTransaction", [
        p.wallet,
        p.owner,
        p.startTime,
        p.timeStep,
        p.numSteps,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Sends a transaction creating a new vesting contract to the network
   */
  sendNewVestingTransaction(p) {
    return __async(this, null, function* () {
      return this.call("sendNewVestingTransaction", [
        p.wallet,
        p.owner,
        p.startTime,
        p.timeStep,
        p.numSteps,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Returns a serialized transaction redeeming a vesting contract
   */
  createRedeemVestingTransaction(p) {
    return __async(this, null, function* () {
      return this.call("createRedeemVestingTransaction", [
        p.wallet,
        p.contractAddress,
        p.recipient,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Sends a transaction redeeming a vesting contract
   */
  sendRedeemVestingTransaction(p) {
    return __async(this, null, function* () {
      return this.call("sendRedeemVestingTransaction", [
        p.wallet,
        p.contractAddress,
        p.recipient,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Returns a serialized transaction creating a new HTLC contract
   */
  createNewHtlcTransaction(p) {
    return __async(this, null, function* () {
      return this.call("createNewHtlcTransaction", [
        p.wallet,
        p.htlcSender,
        p.htlcRecipient,
        p.hashRoot,
        p.hashCount,
        p.hashAlgorithm,
        p.timeout,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Sends a transaction creating a new HTLC contract
   */
  sendNewHtlcTransaction(p) {
    return __async(this, null, function* () {
      return this.call("sendNewHtlcTransaction", [
        p.wallet,
        p.htlcSender,
        p.htlcRecipient,
        p.hashRoot,
        p.hashCount,
        p.hashAlgorithm,
        p.timeout,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Returns a serialized transaction redeeming an HTLC contract
   */
  createRedeemRegularHtlcTransaction(p) {
    return __async(this, null, function* () {
      return this.call("createRedeemRegularHtlcTransaction", [
        p.wallet,
        p.contractAddress,
        p.recipient,
        p.preImage,
        p.hashRoot,
        p.hashCount,
        p.hashAlgorithm,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Sends a transaction redeeming an HTLC contract
   */
  sendRedeemRegularHtlcTransaction(p) {
    return __async(this, null, function* () {
      return this.call("sendRedeemRegularHtlcTransaction", [
        p.wallet,
        p.contractAddress,
        p.recipient,
        p.preImage,
        p.hashRoot,
        p.hashCount,
        p.hashAlgorithm,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Returns a serialized transaction redeeming a HTLC contract using the `TimeoutResolve`
   * method 
   */
  createRedeemTimeoutHtlcTransaction(p) {
    return __async(this, null, function* () {
      return this.call("createRedeemTimeoutHtlcTransaction", [
        p.wallet,
        p.contractAddress,
        p.recipient,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Sends a transaction redeeming a HTLC contract using the `TimeoutResolve`
   * method to network
   */
  sendRedeemTimeoutHtlcTransaction(p) {
    return __async(this, null, function* () {
      return this.call("sendRedeemTimeoutHtlcTransaction", [
        p.wallet,
        p.contractAddress,
        p.recipient,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Returns a serialized transaction redeeming a HTLC contract using the `EarlyResolve`
   * method.
   */
  createRedeemEarlyHtlcTransaction(p) {
    return __async(this, null, function* () {
      return this.call("createRedeemEarlyHtlcTransaction", [
        p.wallet,
        p.htlcAddress,
        p.recipient,
        p.htlcSenderSignature,
        p.htlcRecipientSignature,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Sends a transaction redeeming a HTLC contract using the `EarlyResolve`
   * method.
   */
  sendRedeemEarlyHtlcTransaction(p) {
    return __async(this, null, function* () {
      return this.call("sendRedeemEarlyHtlcTransaction", [
        p.wallet,
        p.htlcAddress,
        p.recipient,
        p.htlcSenderSignature,
        p.htlcRecipientSignature,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Returns a serialized signature that can be used to redeem funds from a HTLC contract using
   * the `EarlyResolve` method.
   */
  signRedeemEarlyHtlcTransaction(p) {
    return __async(this, null, function* () {
      return this.call("signRedeemEarlyHtlcTransaction", [
        p.wallet,
        p.htlcAddress,
        p.recipient,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Returns a serialized `new_staker` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  createNewStakerTransaction(p) {
    return __async(this, null, function* () {
      return this.call("createNewStakerTransaction", [
        p.senderWallet,
        p.staker,
        p.delegation,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Sends a `new_staker` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  sendNewStakerTransaction(p) {
    return __async(this, null, function* () {
      return this.call("sendNewStakerTransaction", [
        p.senderWallet,
        p.staker,
        p.delegation,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Returns a serialized `stake` transaction. The funds to be staked and the transaction fee will
   * be paid from the `sender_wallet`.
   */
  createStakeTransaction(p) {
    return __async(this, null, function* () {
      return this.call("createStakeTransaction", [
        p.senderWallet,
        p.staker,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Sends a `stake` transaction. The funds to be staked and the transaction fee will
   * be paid from the `sender_wallet`.
   */
  sendStakeTransaction(p) {
    return __async(this, null, function* () {
      return this.call("sendStakeTransaction", [
        p.senderWallet,
        p.staker,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Returns a serialized `update_staker` transaction. You can pay the transaction fee from a basic
   * account (by providing the sender wallet) or from the staker account's balance (by not
   * providing a sender wallet).
   */
  createUpdateStakerTransaction(p) {
    return __async(this, null, function* () {
      return this.call("createUpdateStakerTransaction", [
        p.senderWallet,
        p.staker,
        p.newDelegation,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Sends a `update_staker` transaction. You can pay the transaction fee from a basic
   * account (by providing the sender wallet) or from the staker account's balance (by not
   * providing a sender wallet).
   */
  sendUpdateStakerTransaction(p) {
    return __async(this, null, function* () {
      return this.call("sendUpdateStakerTransaction", [
        p.senderWallet,
        p.staker,
        p.newDelegation,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Returns a serialized `unstake` transaction. The transaction fee will be paid from the funds
   * being unstaked.
   */
  createUnstakeTransaction(p) {
    return __async(this, null, function* () {
      return this.call("createUnstakeTransaction", [
        p.staker,
        p.recipient,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Sends a `unstake` transaction. The transaction fee will be paid from the funds
   * being unstaked.
   */
  sendUnstakeTransaction(p) {
    return __async(this, null, function* () {
      return this.call("sendUnstakeTransaction", [
        p.staker,
        p.recipient,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Returns a serialized `new_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee and the validator deposit.
   * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
   * have a double Option. So we use the following work-around for the signal data:
   * "" = Set the signal data field to None.
   * "0x29a4b..." = Set the signal data field to Some(0x29a4b...).
   */
  createNewValidatorTransaction(p) {
    return __async(this, null, function* () {
      return this.call("createNewValidatorTransaction", [
        p.senderWallet,
        p.validator,
        p.signingSecretKey,
        p.votingSecretKey,
        p.rewardAddress,
        p.signalData,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Sends a `new_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee and the validator deposit.
   * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
   * have a double Option. So we use the following work-around for the signal data:
   * "" = Set the signal data field to None.
   * "0x29a4b..." = Set the signal data field to Some(0x29a4b...).
   */
  sendNewValidatorTransaction(p) {
    return __async(this, null, function* () {
      return this.call("sendNewValidatorTransaction", [
        p.senderWallet,
        p.validator,
        p.signingSecretKey,
        p.votingSecretKey,
        p.rewardAddress,
        p.signalData,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
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
  createUpdateValidatorTransaction(p) {
    return __async(this, null, function* () {
      return this.call("createUpdateValidatorTransaction", [
        p.senderWallet,
        p.validator,
        p.newSigningSecretKey,
        p.newVotingSecretKey,
        p.newRewardAddress,
        p.newSignalData,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
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
  sendUpdateValidatorTransaction(p) {
    return __async(this, null, function* () {
      return this.call("sendUpdateValidatorTransaction", [
        p.senderWallet,
        p.validator,
        p.newSigningSecretKey,
        p.newVotingSecretKey,
        p.newRewardAddress,
        p.newSignalData,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Returns a serialized `inactivate_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  createInactivateValidatorTransaction(p) {
    return __async(this, null, function* () {
      return this.call("createInactivateValidatorTransaction", [
        p.senderWallet,
        p.validator,
        p.signingSecretKey,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Sends a `inactivate_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  sendInactivateValidatorTransaction(p) {
    return __async(this, null, function* () {
      return this.call("sendInactivateValidatorTransaction", [
        p.senderWallet,
        p.validator,
        p.signingSecretKey,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Returns a serialized `reactivate_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  createReactivateValidatorTransaction(p) {
    return __async(this, null, function* () {
      return this.call("createReactivateValidatorTransaction", [
        p.senderWallet,
        p.validator,
        p.signingSecretKey,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Sends a `reactivate_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  sendReactivateValidatorTransaction(p) {
    return __async(this, null, function* () {
      return this.call("sendReactivateValidatorTransaction", [
        p.senderWallet,
        p.validator,
        p.signingSecretKey,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Returns a serialized `unpark_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  createUnparkValidatorTransaction(p) {
    return __async(this, null, function* () {
      return this.call("createUnparkValidatorTransaction", [
        p.senderWallet,
        p.validator,
        p.signingSecretKey,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Sends a `unpark_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  sendUnparkValidatorTransaction(p) {
    return __async(this, null, function* () {
      return this.call("sendUnparkValidatorTransaction", [
        p.senderWallet,
        p.validator,
        p.signingSecretKey,
        p.fee,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Returns a serialized `delete_validator` transaction. The transaction fee will be paid from the
   * validator deposit that is being returned.
   * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
   * Failed delete validator transactions can diminish the validator deposit
   */
  createDeleteValidatorTransaction(p) {
    return __async(this, null, function* () {
      return this.call("createDeleteValidatorTransaction", [
        p.senderWallet,
        p.validator,
        p.fee,
        p.value,
        this.getValidityStartHeight(p)
      ]);
    });
  }
  /**
   * Sends a `delete_validator` transaction. The transaction fee will be paid from the
   * validator deposit that is being returned.
   * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
   * Failed delete validator transactions can diminish the validator deposit
   */
  sendDeleteValidatorTransaction(p) {
    return __async(this, null, function* () {
      return this.call("sendDeleteValidatorTransaction", [
        p.senderWallet,
        p.validator,
        p.fee,
        p.value,
        this.getValidityStartHeight(p)
      ]);
    });
  }
};

// src/modules/mempool.ts
var MempoolClient = class extends Client {
  constructor(url) {
    super(url);
  }
  /**
   * Pushes the given serialized transaction to the local mempool
   * 
   * @param transaction Serialized transaction
   * @returns Transaction hash
   */
  pushTransaction({ transaction, withHighPriority }) {
    if (withHighPriority) {
      return super.call("pushHighPriorityTransaction", [transaction]);
    } else {
      return super.call("pushTransaction", [transaction]);
    }
  }
  /**
   * Content of the mempool
   * 
   * @param includeTransactions
   * @returns 
   */
  mempoolContent({ includeTransactions } = { includeTransactions: false }) {
    return super.call("mempoolContent", [includeTransactions]);
  }
  /**
   * @returns 
   */
  mempool() {
    return super.call("mempool", []);
  }
  /**
   * 
   * @returns
   */
  getMinFeePerByte() {
    return super.call("getMinFeePerByte", []);
  }
};

// src/modules/network.ts
var NetworkClient = class extends Client {
  constructor(url) {
    super(url);
  }
  /**
   * The peer ID for our local peer.
   */
  getPeerId() {
    return __async(this, null, function* () {
      return this.call("getPeerId", []);
    });
  }
  /**
   * Returns the number of peers. 
   */
  getPeerCount() {
    return __async(this, null, function* () {
      return this.call("getPeerCount", []);
    });
  }
  /**
   * Returns a list with the IDs of all our peers.
   */
  getPeerList() {
    return __async(this, null, function* () {
      return this.call("getPeerList", []);
    });
  }
};

// src/modules/policy.ts
var PolicyClient = class extends Client {
  constructor(url) {
    super(url);
  }
  /**
   * Gets a bundle of policy constants
   */
  getPolicyConstants() {
    return __async(this, null, function* () {
      return this.call("getPolicyConstants", []);
    });
  }
  /**
   * Gets the epoch number at a given `block_number` (height)
   * 
   * @param blockNumber The block number (height) to query.
   * @param justIndex The epoch index is the number of a block relative to the epoch it is in.
   * For example, the first block of any epoch always has an epoch index of 0.
   * @returns The epoch number at the given block number (height) or index
   */
  getEpochAt(_0) {
    return __async(this, arguments, function* ({ blockNumber, justIndex }) {
      if (justIndex) {
        return this.call("getEpochIndexAt", [blockNumber]);
      } else {
        return this.call("getEpochAt", [blockNumber]);
      }
    });
  }
  /**
   * Gets the batch number at a given `block_number` (height)
   * 
   * @param blockNumber The block number (height) to query.
   * @param justIndex The batch index is the number of a block relative to the batch it is in.
   * For example, the first block of any batch always has an epoch index of 0.
   * @returns The epoch number at the given block number (height).
   */
  getBatchAt(_0) {
    return __async(this, arguments, function* ({ blockNumber, justIndex }) {
      if (justIndex) {
        return this.call("getBatchIndexAt", [blockNumber]);
      } else {
        return this.call("getBatchAt", [blockNumber]);
      }
    });
  }
  /**
   * Gets the number (height) of the next election macro block after a given block number (height).
   * 
   * @param blockNumber The block number (height) to query.
   * @returns The number (height) of the next election macro block after a given block number (height).
   */
  getElectionBlockAfter(_0) {
    return __async(this, arguments, function* ({ blockNumber }) {
      return this.call("getElectionBlockAfter", [blockNumber]);
    });
  }
  /**
   * Gets the block number (height) of the preceding election macro block before a given block number (height).
   * If the given block number is an election macro block, it returns the election macro block before it.
   * 
   * @param blockNumber The block number (height) to query.
   * @returns The block number (height) of the preceding election macro block before a given block number (height).
   */
  getElectionBlockBefore(_0) {
    return __async(this, arguments, function* ({ blockNumber }) {
      return this.call("getElectionBlockBefore", [blockNumber]);
    });
  }
  /**
   * Gets the block number (height) of the last election macro block at a given block number (height).
   * If the given block number is an election macro block, then it returns that block number.
   * 
   * @param blockNumber The block number (height) to query.
   * @returns 
   */
  getLastElectionBlock(_0) {
    return __async(this, arguments, function* ({ blockNumber }) {
      return this.call("getLastElectionBlock", [blockNumber]);
    });
  }
  /**
   * Gets a boolean expressing if the block at a given block number (height) is an election macro block.
   * 
   * @param blockNumber The block number (height) to query.
   * @returns A boolean expressing if the block at a given block number (height) is an election macro block.
   */
  getIsElectionBlockAt(_0) {
    return __async(this, arguments, function* ({ blockNumber }) {
      return this.call("getIsElectionBlockAt", [blockNumber]);
    });
  }
  /**
   * Gets the block number (height) of the next macro block after a given block number (height).
   * 
   * @param blockNumber The block number (height) to query.
   * @returns The block number (height) of the next macro block after a given block number (height).
   */
  getMacroBlockAfter(_0) {
    return __async(this, arguments, function* ({ blockNumber }) {
      return this.call("getMacroBlockAfter", [blockNumber]);
    });
  }
  /**
   * Gets the block number (height) of the preceding macro block before a given block number (height).
   * 
   * @param blockNumber The block number (height) to query.
   * @returns The block number (height) of the preceding macro block before a given block number (height).
   */
  getMacroBlockBefore(_0) {
    return __async(this, arguments, function* ({ blockNumber }) {
      return this.call("getMacroBlockBefore", [blockNumber]);
    });
  }
  /**
   * Gets the block number (height) of the last macro block at a given block number (height).
   * If the given block number is a macro block, then it returns that block number.
   * 
   * @param blockNumber The block number (height) to query.
   * @returns The block number (height) of the last macro block at a given block number (height).
   */
  getLastMacroBlock(_0) {
    return __async(this, arguments, function* ({ blockNumber }) {
      return this.call("getLastMacroBlock", [blockNumber]);
    });
  }
  /**
   * Gets a boolean expressing if the block at a given block number (height) is a macro block.
   * 
   * @param blockNumber The block number (height) to query.
   * @returns A boolean expressing if the block at a given block number (height) is a macro block.
   */
  getIsMacroBlockAt(_0) {
    return __async(this, arguments, function* ({ blockNumber }) {
      return this.call("getIsMacroBlockAt", [blockNumber]);
    });
  }
  /**
   * Gets the block number (height) of the next micro block after a given block number (height).
   * 
   * @param blockNumber The block number (height) to query.
   * @returns The block number (height) of the next micro block after a given block number (height).
   */
  getIsMicroBlockAt(_0) {
    return __async(this, arguments, function* ({ blockNumber }) {
      return this.call("getIsMicroBlockAt", [blockNumber]);
    });
  }
  /**
   * Gets the block number (height) of the first block of the given epoch (which is always a micro block).
   * 
   * @param epochIndex The epoch index to query.
   * @returns The block number (height) of the first block of the given epoch (which is always a micro block).
   */
  getFirstBlockOf(_0) {
    return __async(this, arguments, function* ({ epochIndex }) {
      return this.call("getFirstBlockOf", [epochIndex]);
    });
  }
  /**
   * Gets the block number of the first block of the given batch (which is always a micro block).
   * 
   * @param batchIndex The batch index to query.
   * @returns The block number of the first block of the given batch (which is always a micro block).
   */
  getFirstBlockOfBatch(_0) {
    return __async(this, arguments, function* ({ batchIndex }) {
      return this.call("getFirstBlockOfBatch", [batchIndex]);
    });
  }
  /**
   * Gets the block number of the election macro block of the given epoch (which is always the last block).
   * 
   * @param epochIndex The epoch index to query.
   * @returns The block number of the election macro block of the given epoch (which is always the last block).
   */
  getElectionBlockOf(_0) {
    return __async(this, arguments, function* ({ epochIndex }) {
      return this.call("getElectionBlockOf", [epochIndex]);
    });
  }
  /**
   * Gets the block number of the macro block (checkpoint or election) of the given batch (which is always the last block).
   * 
   * @param batchIndex The batch index to query.
   * @returns The block number of the macro block (checkpoint or election) of the given batch (which is always the last block).
   */
  getMacroBlockOf(_0) {
    return __async(this, arguments, function* ({ batchIndex }) {
      return this.call("getMacroBlockOf", [batchIndex]);
    });
  }
  /**
   * Gets a boolean expressing if the batch at a given block number (height) is the first batch
   * of the epoch.
   * 
   * @param blockNumber The block number (height) to query.
   * @returns A boolean expressing if the batch at a given block number (height) is the first batch
   */
  getFirstBatchOfEpoch(_0) {
    return __async(this, arguments, function* ({ blockNumber }) {
      return this.call("getFirstBatchOfEpoch", [blockNumber]);
    });
  }
  /**
   * Gets the supply at a given time (as Unix time) in Lunas (1 NIM = 100,000 Lunas). It is
   * calculated using the following formula:
   * Supply (t) = Genesis_supply + Initial_supply_velocity / Supply_decay * (1 - e^(- Supply_decay * t))
   * Where e is the exponential function, t is the time in milliseconds since the genesis block and
   * Genesis_supply is the supply at the genesis of the Nimiq 2.0 chain.
   * 
   * @param genesisSupply supply at genesis
   * @param genesisTime timestamp of genesis block
   * @param currentTime timestamp to calculate supply at
   * @returns The supply at a given time (as Unix time) in Lunas (1 NIM = 100,000 Lunas).
   */
  getSupplyAt(_0) {
    return __async(this, arguments, function* ({ genesisSupply, genesisTime, currentTime }) {
      return this.call("getSupplyAt", [genesisSupply, genesisTime, currentTime]);
    });
  }
};

// src/modules/validator.ts
var ValidatorClient = class extends Client {
  constructor(url) {
    super(url);
  }
  /**
   * Returns our validator address.
   */
  getAddress() {
    return __async(this, null, function* () {
      return this.call("getAddress", []);
    });
  }
  /**
   * Returns our validator signing key
   */
  getSigningKey() {
    return __async(this, null, function* () {
      return this.call("getSigningKey", []);
    });
  }
  /**
   * Returns our validator voting key
   */
  getVotingKey() {
    return __async(this, null, function* () {
      return this.call("getVotingKey", []);
    });
  }
  /**
   * Updates the configuration setting to automatically reactivate our validator
   */
  setAutomaticReactivation(_0) {
    return __async(this, arguments, function* ({ automaticReactivation }) {
      return this.call("setAutomaticReactivation", [automaticReactivation]);
    });
  }
};

// src/modules/wallet.ts
var WalletClient = class extends Client {
  constructor(url) {
    super(url);
  }
  importRawKey(_0) {
    return __async(this, arguments, function* ({ keyData, passphrase }) {
      return this.call("importRawKey", [keyData, passphrase]);
    });
  }
  isAccountImported(_0) {
    return __async(this, arguments, function* ({ address }) {
      return this.call("isAccountImported", [address]);
    });
  }
  listAccounts() {
    return __async(this, null, function* () {
      return this.call("listAccounts", []);
    });
  }
  lockAccount(_0) {
    return __async(this, arguments, function* ({ address }) {
      return this.call("lockAccount", [address]);
    });
  }
  createAccount(_0) {
    return __async(this, arguments, function* ({ passphrase }) {
      return this.call("createAccount", [passphrase]);
    });
  }
  unlockAccount(_0) {
    return __async(this, arguments, function* ({ address, passphrase, duration }) {
      return this.call("unlockAccount", [address, passphrase, duration]);
    });
  }
  isAccountLocked(_0) {
    return __async(this, arguments, function* ({ address }) {
      return this.call("isAccountLocked", [address]);
    });
  }
  sign(_0) {
    return __async(this, arguments, function* ({ message, address, passphrase, isHex }) {
      return this.call("sign", [message, address, passphrase, isHex]);
    });
  }
  verifySignature(_0) {
    return __async(this, arguments, function* ({ message, publicKey, signature, isHex }) {
      return this.call("verifySignature", [message, publicKey, signature, isHex]);
    });
  }
};

// src/modules/zkp-component.ts
var ZkpComponentClient = class extends Client {
  constructor(url) {
    super(url);
  }
  getZkpState() {
    return __async(this, null, function* () {
      const { data, error, context } = yield this.call("getZkpState", []);
      if (error) {
        return { error, data, context };
      } else {
        return {
          error,
          data: {
            latestHeaderHash: data["latest-header-number"],
            latestBlockNumber: data["latest-block-number"],
            latestProof: data["latest-proof"]
          },
          context
        };
      }
    });
  }
};

// src/types/enums.ts
var BlockType = /* @__PURE__ */ ((BlockType2) => {
  BlockType2["MICRO"] = "micro";
  BlockType2["MACRO"] = "macro";
  return BlockType2;
})(BlockType || {});
var LogType = /* @__PURE__ */ ((LogType2) => {
  LogType2["PayFee"] = "pay-fee";
  LogType2["Transfer"] = "transfer";
  LogType2["HtlcCreate"] = "htlc-create";
  LogType2["HtlcTimeoutResolve"] = "htlc-timeout-resolve";
  LogType2["HtlcRegularTransfer"] = "htlc-regular-transfer";
  LogType2["HtlcEarlyResolve"] = "htlc-early-resolve";
  LogType2["VestingCreate"] = "vesting-create";
  LogType2["CreateValidator"] = "create-validator";
  LogType2["UpdateValidator"] = "update-validator";
  LogType2["InactivateValidator"] = "inactivate-validator";
  LogType2["ReactivateValidator"] = "reactivate-validator";
  LogType2["UnparkValidator"] = "unpark-validator";
  LogType2["CreateStaker"] = "create-staker";
  LogType2["Stake"] = "stake";
  LogType2["UpdateStaker"] = "update-staker";
  LogType2["DeleteValidator"] = "delete-validator";
  LogType2["Unstake"] = "unstake";
  LogType2["PayoutReward"] = "payout-reward";
  LogType2["Park"] = "park";
  LogType2["Slash"] = "slash";
  LogType2["RevertContract"] = "revert-contract";
  LogType2["FailedTransaction"] = "failed-transaction";
  return LogType2;
})(LogType || {});
var AccountType = /* @__PURE__ */ ((AccountType2) => {
  AccountType2["BASIC"] = "basic";
  AccountType2["VESTING"] = "vesting";
  AccountType2["HTLC"] = "htlc";
  return AccountType2;
})(AccountType || {});

// src/index.ts
var Client2 = class {
  constructor(url) {
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
      zkpComponent
    };
    this.block = {
      current: blockchain.getBlockNumber.bind(blockchain),
      by: blockchain.getBlockBy.bind(blockchain),
      latest: blockchain.getLatestBlock.bind(blockchain),
      election: {
        after: policy.getElectionBlockAfter.bind(policy),
        before: policy.getElectionBlockBefore.bind(policy),
        last: policy.getLastElectionBlock.bind(policy),
        get: policy.getElectionBlockOf.bind(policy),
        subscribe: blockchain.subscribeForValidatorElectionByAddress.bind(blockchain)
      },
      isElection: policy.getIsElectionBlockAt.bind(policy),
      macro: {
        after: policy.getMacroBlockAfter.bind(policy),
        before: policy.getMacroBlockBefore.bind(policy),
        last: policy.getLastMacroBlock.bind(policy),
        get: policy.getMacroBlockOf.bind(policy)
      },
      isMacro: policy.getIsMacroBlockAt.bind(policy),
      isMicro: policy.getIsMicroBlockAt.bind(policy),
      subscribe: blockchain.subscribeForBlocks.bind(blockchain)
    };
    this.logs = {
      subscribe: blockchain.subscribeForLogsByAddressesAndTypes.bind(blockchain)
    };
    this.batch = {
      current: blockchain.getBatchNumber.bind(blockchain),
      at: policy.getBatchAt.bind(policy),
      firstBlock: policy.getFirstBlockOf.bind(policy)
    };
    this.epoch = {
      current: blockchain.getEpochNumber.bind(blockchain),
      at: policy.getEpochAt.bind(policy),
      firstBlock: policy.getFirstBlockOf.bind(policy),
      firstBatch: policy.getFirstBatchOfEpoch.bind(policy)
    };
    this.slots = {
      at: blockchain.getSlotAt.bind(blockchain),
      slashed: {
        current: blockchain.getCurrentSlashedSlots.bind(blockchain),
        previous: blockchain.getPreviousSlashedSlots.bind(blockchain)
      }
    };
    this.transaction = {
      by: blockchain.getTransactionBy.bind(blockchain),
      push: mempool.pushTransaction.bind(mempool),
      minFeePerByte: mempool.getMinFeePerByte.bind(mempool),
      create: consensus.createTransaction.bind(consensus),
      send: consensus.sendTransaction.bind(consensus)
    };
    this.vesting = {
      create: consensus.createNewVestingTransaction.bind(consensus),
      send: consensus.sendNewVestingTransaction.bind(consensus),
      redeem: {
        create: consensus.createRedeemVestingTransaction.bind(consensus),
        send: consensus.sendRedeemVestingTransaction.bind(consensus)
      }
    };
    this.htlc = {
      create: consensus.createNewHtlcTransaction.bind(consensus),
      send: consensus.sendNewHtlcTransaction.bind(consensus),
      redeem: {
        regular: {
          create: consensus.createRedeemRegularHtlcTransaction.bind(consensus),
          send: consensus.sendRedeemRegularHtlcTransaction.bind(consensus)
        },
        timeout: {
          create: consensus.createRedeemTimeoutHtlcTransaction.bind(consensus),
          send: consensus.sendRedeemTimeoutHtlcTransaction.bind(consensus)
        },
        early: {
          create: consensus.createRedeemEarlyHtlcTransaction.bind(consensus),
          send: consensus.sendRedeemEarlyHtlcTransaction.bind(consensus)
        }
      }
    };
    this.stakes = {
      new: {
        create: consensus.createStakeTransaction.bind(consensus),
        send: consensus.sendStakeTransaction.bind(consensus)
      }
    };
    this.staker = {
      byAddress: blockchain.getStakerByAddress.bind(blockchain),
      create: consensus.createNewStakerTransaction.bind(consensus),
      send: consensus.sendNewStakerTransaction.bind(consensus),
      update: {
        create: consensus.createUpdateStakerTransaction.bind(consensus),
        send: consensus.sendUpdateStakerTransaction.bind(consensus)
      }
    };
    this.inherent = {
      by: blockchain.getInherentsBy.bind(blockchain)
    };
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
      verify: wallet.verifySignature.bind(wallet)
    };
    this.validator = {
      byAddress: blockchain.getValidatorBy.bind(blockchain),
      setAutomaticReactivation: validator_.setAutomaticReactivation.bind(validator_),
      selfNode: {
        // The node is a validator itself, which we have access to
        address: validator_.getAddress.bind(blockchain),
        signingKey: validator_.getSigningKey.bind(blockchain),
        votingKey: validator_.getVotingKey.bind(blockchain)
      },
      active: blockchain.getActiveValidators.bind(blockchain),
      parked: blockchain.getParkedValidators.bind(blockchain),
      action: {
        new: {
          create: consensus.createNewValidatorTransaction.bind(consensus),
          send: consensus.sendNewValidatorTransaction.bind(consensus)
        },
        update: {
          create: consensus.createUpdateValidatorTransaction.bind(consensus),
          send: consensus.sendUpdateValidatorTransaction.bind(consensus)
        },
        inactive: {
          create: consensus.createInactivateValidatorTransaction.bind(consensus),
          send: consensus.sendInactivateValidatorTransaction.bind(consensus)
        },
        reactivate: {
          create: consensus.createReactivateValidatorTransaction.bind(consensus),
          send: consensus.sendReactivateValidatorTransaction.bind(consensus)
        },
        unpark: {
          create: consensus.createUnparkValidatorTransaction.bind(consensus),
          send: consensus.sendUnparkValidatorTransaction.bind(consensus)
        },
        delete: {
          create: consensus.createDeleteValidatorTransaction.bind(consensus),
          send: consensus.sendDeleteValidatorTransaction.bind(consensus)
        }
      }
    };
    this.mempool = {
      info: mempool.mempool.bind(mempool),
      content: mempool.mempoolContent.bind(mempool)
    };
    this.peers = {
      id: network.getPeerId.bind(network),
      count: network.getPeerCount.bind(network),
      peers: network.getPeerList.bind(network),
      consensusEstablished: consensus.isConsensusEstablished.bind(network)
    };
    this.constant = {
      params: policy.getPolicyConstants.bind(policy),
      supply: policy.getSupplyAt.bind(policy)
    };
    this.zeroKnowledgeProof = {
      state: zkpComponent.getZkpState.bind(zkpComponent)
    };
  }
};
function main() {
  return __async(this, null, function* () {
    const client = new Client2(new URL("http://localhost:10300"));
    const validatorsRaw = `{'address': 'NQ64 6F27 0LU6 GTNV LCRM XE1A T2XP DKUK JAMD', 'address_raw': '33c470538686edda3335f382ad8bd76cf9392aad', 'public_key': 'a5a8882d08f752ef700eb642c543baa56e872bf22c964cc49049283b3094b454', 'private_key': '7dfd93efc164d034ac54cde2b03d241414a74bf213fdb2c8934b369eac98ec2f'}
    {'address': 'NQ48 K1YC 8DEK XFU8 82XX BP54 5GPH GXDS ADMJ', 'address_raw': '987ec435d3f3f8840bde5dca42c2f1879ba536b2', 'public_key': '5fb57a489d53ff1e5f39b4954c69969c788cfa4f30048d90c34c1e5b4c9bb187', 'private_key': 'fc8a910648234d22ffb56d3e68ba4ee2457b28418763a76971bf1121830b152d'}
    {'address': 'NQ62 C10Q S3SG 9SB6 YJY5 DCT4 XMXV 8KQB CXEN', 'address_raw': '60418d0f504e966fcbe56b364f57dd44f0b679d6', 'public_key': 'da9b436844cd17f6d0038cc4c6885e9ab016a684aabc1fef6d23909bf62475c5', 'private_key': '8ae4a48d8e0e9a0cefadc95c4917607e46d47d4aa92791d6a6e9c9847e496e54'}
    {'address': 'NQ09 GYXG 6TNL KKMB AHV2 CB4M 7SF5 NQDL 32EE', 'address_raw': '87fd036ed49ceab547a262c953e9e5b61b4189ce', 'public_key': '604e244d40920f5f0e3c68ff9bd9119b993d87bee6057ed9691206c1ed93f51f', 'private_key': 'dbb3bec2ec5993252cbd8ecc6194f8c64af62ca84076f7130ac83e34ca1ad937'}
    {'address': 'NQ97 26E4 68BH 1F7V AED4 JDRJ NKR5 S9QE AX1M', 'address_raw': '119c4321710bcfd539a493732b4f25d270e57835', 'public_key': '4da4388e46df86da8b5fa7f43ab65ebd2d9561930ada7aad0b971b423f6b52cb', 'private_key': 'fdfce7f5a9b76436bd6da33d4956ad974805cca063574ff163c06aaa21296658'}
    {'address': 'NQ43 63RJ AB2L EYF1 FCUB BQ67 YEVF KA8N L7XL', 'address_raw': '30f3252c5477de17b38b5e0c7fbbaf9a916a1fd4', 'public_key': 'fc957f38b0da3ceac253b005fc5e1ea54a6086c7fba3a1d10871b3a2d6503773', 'private_key': '9e26a6a1820528a231230800c8fbe32b4fe4f483d3a6a48a6db2182dac7bf38d'}
    {'address': 'NQ51 L8TJ NAGH QVLR ETEN KAE6 XJR0 MB2X 99CJ', 'address_raw': 'a2372b2a11c769976dd69a9c6f4b20aac5e4a592', 'public_key': '532ebd252672f355e87af9a699dc02ca45176c7d7c8cc5238b473b6ed2c5c86b', 'private_key': '0ab378c0017126353db083bed2f9a2968e0e02bb445472eae417276b274b21fb'}
    {'address': 'NQ30 TF6U G9UT SF8G BKS7 GC3F D9QN 1NTA GKVK', 'address_raw': 'dbcdc8279bd3d105cf478306f6a7160db6a84fb3', 'public_key': '0f5ead14cb835c45b48cab64959299dc72a6c5598dfa01d7d8b5ec96257bd4e5', 'private_key': '131980f2dc7f6f00ec07c07db4502edb808da41ee76697ad021d75b867828b02'}
    {'address': 'NQ69 Q6E9 ALKF 7ARF U1S5 U5FR 9C7U UURT K4J5', 'address_raw': 'c19c95526f3ab2fe0745e15f94b0fce733b99245', 'public_key': '9a5c45d99778ebb9120f7e2875c838e1524deae24f6927b64a040248d70a87bd', 'private_key': '7c166dc874ab55603c1928c93978967c184815925fc6957e13bc17ed99dcd3bc'}
    {'address': 'NQ29 CFXH 6GH1 PA9N 85M5 JYSQ J85F N99G 9XV2', 'address_raw': '63fd134221ba936416a597f58920afb25304fba2', 'public_key': '9e152274efd76925a06ddb11ae953a92741dbdc50fe4115917c5a13727b61d21', 'private_key': '92da53db8bbff08082c138bc5747e4c5fa7342ec129715dba8f2e1c0a0a828bc'}
    {'address': 'NQ25 98UV EC6M DJG7 HGL9 4GH5 8XYS 4ACS USQ1', 'address_raw': '4a39d730d56ca078c2892422547bfa2299ae6b01', 'public_key': '12ff2fdc183b354921ecf855a0f098ec75a44c06d6cf6967a21eb1ca84fc5e6b', 'private_key': '7ae36bc5efaa47e24aa134b68595aca8a03535a913be5fee4a3f8da27d800d52'}
    {'address': 'NQ26 LA75 7D1H EJER A0KF 405P PL6K 0SCN 1YA4', 'address_raw': 'a28e53b431749d95026f200b7bd0d3069960fd44', 'public_key': '1a107f09d9bbb3f03b6aaa55e7f14eded418d8dbf80c8aa4176e20be6515e900', 'private_key': '04e0055270be4f2b252a617c433db06e3b5ef209bc0ad0325279bbd275263c5f'}`;
    const validators = validatorsRaw.split("\n").map((v) => v.replace(/'/g, '"')).map((v) => JSON.parse(v));
    const { address, private_key } = validators[1];
    const { data } = yield client.constant.params();
    if (!data) {
      throw new Error("No data");
    }
    const { stakingContractAddress } = data;
    const importKey = yield client.account.importRawKey({ keyData: private_key });
    console.log("Imported", importKey);
    const accounts = yield client.account.list();
    console.log("Accounts", accounts);
    console.log("");
    console.log("");
    const unlocked = yield client.account.unlock({ address });
    console.log("Unlocked", unlocked);
    console.log("");
    console.log("");
    const { next } = yield client.logs.subscribe({ addresses: [address, stakingContractAddress] });
    next((data2) => __async(this, null, function* () {
      console.log("New TX");
      console.log(data2);
      console.log("");
      console.log("");
      console.log("");
      if (data2.transactions.length === 0) {
        return;
      }
      const txData = yield client.transaction.by({ hash: data2.transactions[0].hash });
      console.log("TX Data for deactivation");
      console.log(txData);
      console.log("");
    }));
    const params = {
      fee: 0,
      senderWallet: address,
      signingSecretKey: private_key,
      validator: address,
      relativeValidityStartHeight: 4
    };
    console.log({ params });
    const tx = yield client.validator.action.inactive.send(params).catch((e) => console.error(e));
    console.log("inactive TX");
    console.log(tx);
  });
}
main();
export {
  AccountType,
  BlockType,
  Client2 as Client,
  LogType
};
