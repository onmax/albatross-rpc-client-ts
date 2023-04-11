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
var DEFAULT_OPTIONS = {
  timeout: 1e4
};
var _HttpClient = class {
  constructor(url) {
    this.url = url;
  }
  call(method, params, withMetadata, options) {
    return __async(this, null, function* () {
      const { timeout } = options;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      params = params.map((param) => param === void 0 ? null : param);
      const context = {
        method,
        params,
        id: _HttpClient.id,
        timestamp: Date.now()
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
        }),
        signal: controller.signal
      }).catch((error) => {
        if (error.name === "AbortError") {
          return { ok: false, status: 408, statusText: `AbortError: Service Unavailable: ${error.message}` };
        } else if (error.name === "FetchError") {
          return { ok: false, status: 503, statusText: `FetchError: Service Unavailable: ${error.message}` };
        } else {
          return { ok: false, status: 503, statusText: `Service Unavailable: ${error.message}` };
        }
      });
      clearTimeout(timeoutId);
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
var WS_DEFAULT_OPTIONS = {
  once: false
};
var WebSocketClient = class {
  constructor(url) {
    this.id = 0;
    const wsUrl = new URL(url.href.replace(/^http/, "ws"));
    wsUrl.pathname = "/ws";
    this.url = wsUrl;
    this.textDecoder = new TextDecoder();
  }
  subscribe(event, params, withMetadata, options) {
    return __async(this, null, function* () {
      const ws = new WebSocket(this.url.href);
      let subscriptionId;
      const requestBody = {
        jsonrpc: "2.0",
        method: event,
        params,
        id: this.id++,
        timestamp: Date.now()
      };
      const { once } = options;
      const args = {
        next: (callback) => {
          ws.onmessage = (event2) => __async(this, null, function* () {
            const payload = yield this.parsePayload(event2);
            if ("result" in payload) {
              subscriptionId = payload.result;
              return;
            }
            if ("error" in payload) {
              callback({ data: void 0, error: payload });
            } else {
              const data = withMetadata ? payload.params.result : payload.params.result.data;
              callback({ data, error: void 0 });
            }
            if (once) {
              ws.close();
            }
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
        getSubscriptionId: () => subscriptionId,
        context: requestBody
      };
      return new Promise((resolve) => {
        ws.onopen = () => {
          ws.send(JSON.stringify(requestBody));
          resolve(args);
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
        return {
          code: 1001,
          message: "Unexpected data type"
        };
      }
      try {
        return JSON.parse(payloadStr);
      } catch (e) {
        return {
          code: 1002,
          message: `Unexpected payload: ${payloadStr}`
        };
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
  call(method, params, options, withMetadata = false) {
    return __async(this, null, function* () {
      return this.httpClient.call(method, params, withMetadata, options);
    });
  }
  subscribe(event, params, options, withMetadata = false) {
    return __async(this, null, function* () {
      return this.webSocketClient.subscribe(event, params, withMetadata, options);
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
    return __async(this, arguments, function* (options = DEFAULT_OPTIONS) {
      return this.call("getBlockNumber", [], options);
    });
  }
  /**
   * Returns the batch number for the current head.
   */
  getBatchNumber() {
    return __async(this, arguments, function* (options = DEFAULT_OPTIONS) {
      return this.call("getBatchNumber", [], options);
    });
  }
  /**
   * Returns the epoch number for the current head.
   */
  getEpochNumber() {
    return __async(this, arguments, function* (options = DEFAULT_OPTIONS) {
      return this.call("getEpochNumber", [], options);
    });
  }
  /**
   * Tries to fetch a block given its hash or block number. It has an option to include the transactions in the block, which defaults to false.
   */
  getBlockBy() {
    return __async(this, arguments, function* (p = { includeTransactions: false }, options = DEFAULT_OPTIONS) {
      if ("hash" in p) {
        return this.call("getBlockByHash", [p.hash, p.includeTransactions], options);
      }
      return this.call("getBlockByNumber", [p.blockNumber, p.includeTransactions], options);
    });
  }
  /**
   * Returns the block at the head of the main chain. It has an option to include the
   * transactions in the block, which defaults to false.
   */
  getLatestBlock() {
    return __async(this, arguments, function* (p = { includeTransactions: false }, options = DEFAULT_OPTIONS) {
      return this.call("getLatestBlock", [p.includeTransactions], options);
    });
  }
  /**
   * Returns the information for the slot owner at the given block height and offset. The
   * offset is optional, it will default to getting the offset for the existing block
   * at the given height.
   */
  getSlotAt(_0) {
    return __async(this, arguments, function* ({ blockNumber, offsetOpt, withMetadata }, options = DEFAULT_OPTIONS) {
      return this.call("getSlotAt", [blockNumber, offsetOpt], options, withMetadata);
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
  getTransactionBy(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      if ("hash" in p) {
        return this.call("getTransactionByHash", [p.hash], options);
      } else if ("blockNumber" in p) {
        return this.call("getTransactionsByBlockNumber", [p.blockNumber], options);
      } else if ("batchNumber" in p) {
        return this.call("getTransactionsByBatchNumber", [p.batchNumber], options);
      } else if ("address" in p) {
        if (p.justHashes === true) {
          return this.call("getTransactionHashesByAddress", [p.address, p.max], options);
        } else {
          return this.call("getTransactionsByAddress", [p.address, p.max], options);
        }
      }
      throw new Error("Invalid parameters");
    });
  }
  /**
   * Returns all the inherents (including reward inherents) for the parameter. Note
   * that this only considers blocks in the main chain.
   */
  getInherentsBy(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      if ("blockNumber" in p) {
        return this.call("getInherentsByBlockNumber", [p.blockNumber], options);
      } else if ("batchNumber" in p) {
        return this.call("getInherentsByBatchNumber", [p.batchNumber], options);
      }
      throw new Error("Invalid parameters");
    });
  }
  /**
   * Tries to fetch the account at the given address.
   */
  getAccountBy(_0) {
    return __async(this, arguments, function* ({ address, withMetadata }, options = DEFAULT_OPTIONS) {
      return this.call("getAccountByAddress", [address], options, withMetadata);
    });
  }
  /**
  * Returns a collection of the currently active validator's addresses and balances.
  */
  getActiveValidators() {
    return __async(this, arguments, function* ({ withMetadata } = { withMetadata: false }, options = DEFAULT_OPTIONS) {
      return this.call("getActiveValidators", [], options, withMetadata);
    });
  }
  /**
   * Returns information about the currently slashed slots. This includes slots that lost rewards
   * and that were disabled.
   */
  getCurrentSlashedSlots() {
    return __async(this, arguments, function* ({ withMetadata } = { withMetadata: false }, options = DEFAULT_OPTIONS) {
      return this.call("getCurrentSlashedSlots", [], options, withMetadata);
    });
  }
  /**
   * Returns information about the slashed slots of the previous batch. This includes slots that
   * lost rewards and that were disabled.
   */
  getPreviousSlashedSlots() {
    return __async(this, arguments, function* ({ withMetadata } = { withMetadata: false }, options = DEFAULT_OPTIONS) {
      return this.call("getPreviousSlashedSlots", [], options, withMetadata);
    });
  }
  /**
   * Returns information about the currently parked validators.
   */
  getParkedValidators() {
    return __async(this, arguments, function* ({ withMetadata } = { withMetadata: false }, options = DEFAULT_OPTIONS) {
      return this.call("getParkedValidators", [], options, withMetadata);
    });
  }
  /**
   * Tries to fetch a validator information given its address. It has an option to include a map
   * containing the addresses and stakes of all the stakers that are delegating to the validator.
   */
  getValidatorBy() {
    return __async(this, arguments, function* (p = { includeStakers: false }, options = DEFAULT_OPTIONS) {
      return this.call("getValidatorByAddress", [p.address, p.includeStakers], options);
    });
  }
  /**
   * Tries to fetch a staker information given its address.
   */
  getStakerByAddress(_0) {
    return __async(this, arguments, function* ({ address }, options = DEFAULT_OPTIONS) {
      return this.call("getStakerByAddress", [address], options);
    });
  }
  /**
   * Subscribes to new block events.
   */
  subscribeForBlocks(_0) {
    return __async(this, arguments, function* ({ filter }, options = WS_DEFAULT_OPTIONS) {
      switch (filter) {
        case "FULL":
          return this.subscribe("subscribeForHeadBlock", [
            /*includeTransactions*/
            true
          ], options);
        case "PARTIAL":
          return this.subscribe("subscribeForHeadBlock", [
            /*includeTransactions*/
            false
          ], options);
        case "HASH":
          return this.subscribe("subscribeForHeadBlockHash", [], options);
      }
    });
  }
  /**
   * Subscribes to pre epoch validators events.
   */
  subscribeForValidatorElectionByAddress() {
    return __async(this, arguments, function* (p = { withMetadata: false }, options = WS_DEFAULT_OPTIONS) {
      return this.subscribe("subscribeForValidatorElectionByAddress", [p.address], options, p.withMetadata);
    });
  }
  /**
   * Subscribes to log events related to a given list of addresses and of any of the log types provided.
   * If addresses is empty it does not filter by address. If log_types is empty it won't filter by log types.
   * Thus the behavior is to assume all addresses or log_types are to be provided if the corresponding vec is empty.
   */
  subscribeForLogsByAddressesAndTypes() {
    return __async(this, arguments, function* (p = { withMetadata: false }, options = WS_DEFAULT_OPTIONS) {
      return this.subscribe("subscribeForLogsByAddressesAndTypes", [(p == null ? void 0 : p.addresses) || [], (p == null ? void 0 : p.types) || []], options, p == null ? void 0 : p.withMetadata);
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
    return __async(this, arguments, function* (options = DEFAULT_OPTIONS) {
      return this.call("isConsensusEstablished", [], options);
    });
  }
  /**
   * Given a serialized transaction, it will return the corresponding transaction struct
   */
  getRawTransactionInfo(_0) {
    return __async(this, arguments, function* ({ rawTransaction }, options = DEFAULT_OPTIONS) {
      return this.call("getRawTransactionInfo", [rawTransaction], options);
    });
  }
  /**
   * Creates a serialized transaction
   */
  createTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      if (p.data) {
        return this.call("createBasicTransactionWithData", [p.wallet, p.recipient, p.data, p.value, p.fee, this.getValidityStartHeight(p)], options);
      } else {
        return this.call("createBasicTransaction", [p.wallet, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)], options);
      }
    });
  }
  /**
   * Sends a transaction
   */
  sendTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      const h = this.getValidityStartHeight(p);
      if (p.data) {
        return this.call("sendBasicTransactionWithData", [p.wallet, p.recipient, p.data, p.value, p.fee, this.getValidityStartHeight(p)], options);
      } else {
        return this.call("sendBasicTransaction", [p.wallet, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)], options);
      }
    });
  }
  /**
   * Returns a serialized transaction creating a new vesting contract
   */
  createNewVestingTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("createNewVestingTransaction", [
        p.wallet,
        p.owner,
        p.startTime,
        p.timeStep,
        p.numSteps,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
    });
  }
  /**
   * Sends a transaction creating a new vesting contract to the network
   */
  sendNewVestingTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("sendNewVestingTransaction", [
        p.wallet,
        p.owner,
        p.startTime,
        p.timeStep,
        p.numSteps,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
    });
  }
  /**
   * Returns a serialized transaction redeeming a vesting contract
   */
  createRedeemVestingTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("createRedeemVestingTransaction", [
        p.wallet,
        p.contractAddress,
        p.recipient,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
    });
  }
  /**
   * Sends a transaction redeeming a vesting contract
   */
  sendRedeemVestingTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("sendRedeemVestingTransaction", [
        p.wallet,
        p.contractAddress,
        p.recipient,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
    });
  }
  /**
   * Returns a serialized transaction creating a new HTLC contract
   */
  createNewHtlcTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
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
      ], options);
    });
  }
  /**
   * Sends a transaction creating a new HTLC contract
   */
  sendNewHtlcTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
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
      ], options);
    });
  }
  /**
   * Returns a serialized transaction redeeming an HTLC contract
   */
  createRedeemRegularHtlcTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
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
      ], options);
    });
  }
  /**
   * Sends a transaction redeeming an HTLC contract
   */
  sendRedeemRegularHtlcTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
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
      ], options);
    });
  }
  /**
   * Returns a serialized transaction redeeming a HTLC contract using the `TimeoutResolve`
   * method 
   */
  createRedeemTimeoutHtlcTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("createRedeemTimeoutHtlcTransaction", [
        p.wallet,
        p.contractAddress,
        p.recipient,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
    });
  }
  /**
   * Sends a transaction redeeming a HTLC contract using the `TimeoutResolve`
   * method to network
   */
  sendRedeemTimeoutHtlcTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("sendRedeemTimeoutHtlcTransaction", [
        p.wallet,
        p.contractAddress,
        p.recipient,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
    });
  }
  /**
   * Returns a serialized transaction redeeming a HTLC contract using the `EarlyResolve`
   * method.
   */
  createRedeemEarlyHtlcTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("createRedeemEarlyHtlcTransaction", [
        p.wallet,
        p.htlcAddress,
        p.recipient,
        p.htlcSenderSignature,
        p.htlcRecipientSignature,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
    });
  }
  /**
   * Sends a transaction redeeming a HTLC contract using the `EarlyResolve`
   * method.
   */
  sendRedeemEarlyHtlcTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("sendRedeemEarlyHtlcTransaction", [
        p.wallet,
        p.htlcAddress,
        p.recipient,
        p.htlcSenderSignature,
        p.htlcRecipientSignature,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
    });
  }
  /**
   * Returns a serialized signature that can be used to redeem funds from a HTLC contract using
   * the `EarlyResolve` method.
   */
  signRedeemEarlyHtlcTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("signRedeemEarlyHtlcTransaction", [
        p.wallet,
        p.htlcAddress,
        p.recipient,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
    });
  }
  /**
   * Returns a serialized `new_staker` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  createNewStakerTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("createNewStakerTransaction", [
        p.senderWallet,
        p.staker,
        p.delegation,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
    });
  }
  /**
   * Sends a `new_staker` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  sendNewStakerTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("sendNewStakerTransaction", [
        p.senderWallet,
        p.staker,
        p.delegation,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
    });
  }
  /**
   * Returns a serialized `stake` transaction. The funds to be staked and the transaction fee will
   * be paid from the `sender_wallet`.
   */
  createStakeTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("createStakeTransaction", [
        p.senderWallet,
        p.staker,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
    });
  }
  /**
   * Sends a `stake` transaction. The funds to be staked and the transaction fee will
   * be paid from the `sender_wallet`.
   */
  sendStakeTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("sendStakeTransaction", [
        p.senderWallet,
        p.staker,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
    });
  }
  /**
   * Returns a serialized `update_staker` transaction. You can pay the transaction fee from a basic
   * account (by providing the sender wallet) or from the staker account's balance (by not
   * providing a sender wallet).
   */
  createUpdateStakerTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("createUpdateStakerTransaction", [
        p.senderWallet,
        p.staker,
        p.newDelegation,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
    });
  }
  /**
   * Sends a `update_staker` transaction. You can pay the transaction fee from a basic
   * account (by providing the sender wallet) or from the staker account's balance (by not
   * providing a sender wallet).
   */
  sendUpdateStakerTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("sendUpdateStakerTransaction", [
        p.senderWallet,
        p.staker,
        p.newDelegation,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
    });
  }
  /**
   * Returns a serialized `unstake` transaction. The transaction fee will be paid from the funds
   * being unstaked.
   */
  createUnstakeTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("createUnstakeTransaction", [
        p.staker,
        p.recipient,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
    });
  }
  /**
   * Sends a `unstake` transaction. The transaction fee will be paid from the funds
   * being unstaked.
   */
  sendUnstakeTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("sendUnstakeTransaction", [
        p.staker,
        p.recipient,
        p.value,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
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
  createNewValidatorTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("createNewValidatorTransaction", [
        p.senderWallet,
        p.validator,
        p.signingSecretKey,
        p.votingSecretKey,
        p.rewardAddress,
        p.signalData,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
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
  sendNewValidatorTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("sendNewValidatorTransaction", [
        p.senderWallet,
        p.validator,
        p.signingSecretKey,
        p.votingSecretKey,
        p.rewardAddress,
        p.signalData,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
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
  createUpdateValidatorTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("createUpdateValidatorTransaction", [
        p.senderWallet,
        p.validator,
        p.newSigningSecretKey,
        p.newVotingSecretKey,
        p.newRewardAddress,
        p.newSignalData,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
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
  sendUpdateValidatorTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("sendUpdateValidatorTransaction", [
        p.senderWallet,
        p.validator,
        p.newSigningSecretKey,
        p.newVotingSecretKey,
        p.newRewardAddress,
        p.newSignalData,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
    });
  }
  /**
   * Returns a serialized `inactivate_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  createDeactivateValidatorTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("createDeactivateValidatorTransaction", [
        p.senderWallet,
        p.validator,
        p.signingSecretKey,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
    });
  }
  /**
   * Sends a `inactivate_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  sendDeactivateValidatorTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("sendDeactivateValidatorTransaction", [
        p.senderWallet,
        p.validator,
        p.signingSecretKey,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
    });
  }
  /**
   * Returns a serialized `reactivate_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  createReactivateValidatorTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("createReactivateValidatorTransaction", [
        p.senderWallet,
        p.validator,
        p.signingSecretKey,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
    });
  }
  /**
   * Sends a `reactivate_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  sendReactivateValidatorTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("sendReactivateValidatorTransaction", [
        p.senderWallet,
        p.validator,
        p.signingSecretKey,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
    });
  }
  /**
   * Returns a serialized `unpark_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  createUnparkValidatorTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("createUnparkValidatorTransaction", [
        p.senderWallet,
        p.validator,
        p.signingSecretKey,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
    });
  }
  /**
   * Sends a `unpark_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  sendUnparkValidatorTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("sendUnparkValidatorTransaction", [
        p.senderWallet,
        p.validator,
        p.signingSecretKey,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
    });
  }
  /**
   * Returns a serialized `retire_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  createRetireValidatorTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("createRetireValidatorTransaction", [
        p.senderWallet,
        p.validator,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
    });
  }
  /**
   * Sends a `retire_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  sendRetireValidatorTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("sendRetireValidatorTransaction", [
        p.senderWallet,
        p.validator,
        p.fee,
        this.getValidityStartHeight(p)
      ], options);
    });
  }
  /**
   * Returns a serialized `delete_validator` transaction. The transaction fee will be paid from the
   * validator deposit that is being returned.
   * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
   * Failed delete validator transactions can diminish the validator deposit
   */
  createDeleteValidatorTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("createDeleteValidatorTransaction", [
        p.validator,
        p.recipient,
        p.fee,
        p.value,
        this.getValidityStartHeight(p)
      ], options);
    });
  }
  /**
   * Sends a `delete_validator` transaction. The transaction fee will be paid from the
   * validator deposit that is being returned.
   * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
   * Failed delete validator transactions can diminish the validator deposit
   */
  sendDeleteValidatorTransaction(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("sendDeleteValidatorTransaction", [
        p.validator,
        p.recipient,
        p.fee,
        p.value,
        this.getValidityStartHeight(p)
      ], options);
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
  pushTransaction({ transaction, withHighPriority }, options = DEFAULT_OPTIONS) {
    if (withHighPriority) {
      return super.call("pushHighPriorityTransaction", [transaction], options);
    } else {
      return super.call("pushTransaction", [transaction], options);
    }
  }
  /**
   * Content of the mempool
   * 
   * @param includeTransactions
   * @returns 
   */
  mempoolContent({ includeTransactions } = { includeTransactions: false }, options = DEFAULT_OPTIONS) {
    return super.call("mempoolContent", [includeTransactions], options);
  }
  /**
   * @returns 
   */
  mempool(options = DEFAULT_OPTIONS) {
    return super.call("mempool", [], options);
  }
  /**
   * 
   * @returns
   */
  getMinFeePerByte(options = DEFAULT_OPTIONS) {
    return super.call("getMinFeePerByte", [], options);
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
    return __async(this, arguments, function* (options = DEFAULT_OPTIONS) {
      return this.call("getPeerId", [], options);
    });
  }
  /**
   * Returns the number of peers. 
   */
  getPeerCount() {
    return __async(this, arguments, function* (options = DEFAULT_OPTIONS) {
      return this.call("getPeerCount", [], options);
    });
  }
  /**
   * Returns a list with the IDs of all our peers.
   */
  getPeerList() {
    return __async(this, arguments, function* (options = DEFAULT_OPTIONS) {
      return this.call("getPeerList", [], options);
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
    return __async(this, arguments, function* (options = DEFAULT_OPTIONS) {
      return this.call("getPolicyConstants", [], options);
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
    return __async(this, arguments, function* ({ blockNumber, justIndex }, options = DEFAULT_OPTIONS) {
      if (justIndex) {
        return this.call("getEpochIndexAt", [blockNumber], options);
      } else {
        return this.call("getEpochAt", [blockNumber], options);
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
    return __async(this, arguments, function* ({ blockNumber, justIndex }, options = DEFAULT_OPTIONS) {
      if (justIndex) {
        return this.call("getBatchIndexAt", [blockNumber], options);
      } else {
        return this.call("getBatchAt", [blockNumber], options);
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
    return __async(this, arguments, function* ({ blockNumber }, options = DEFAULT_OPTIONS) {
      return this.call("getElectionBlockAfter", [blockNumber], options);
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
    return __async(this, arguments, function* ({ blockNumber }, options = DEFAULT_OPTIONS) {
      return this.call("getElectionBlockBefore", [blockNumber], options);
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
    return __async(this, arguments, function* ({ blockNumber }, options = DEFAULT_OPTIONS) {
      return this.call("getLastElectionBlock", [blockNumber], options);
    });
  }
  /**
   * Gets a boolean expressing if the block at a given block number (height) is an election macro block.
   * 
   * @param blockNumber The block number (height) to query.
   * @returns A boolean expressing if the block at a given block number (height) is an election macro block.
   */
  getIsElectionBlockAt(_0) {
    return __async(this, arguments, function* ({ blockNumber }, options = DEFAULT_OPTIONS) {
      return this.call("getIsElectionBlockAt", [blockNumber], options);
    });
  }
  /**
   * Gets the block number (height) of the next macro block after a given block number (height).
   * 
   * @param blockNumber The block number (height) to query.
   * @returns The block number (height) of the next macro block after a given block number (height).
   */
  getMacroBlockAfter(_0) {
    return __async(this, arguments, function* ({ blockNumber }, options = DEFAULT_OPTIONS) {
      return this.call("getMacroBlockAfter", [blockNumber], options);
    });
  }
  /**
   * Gets the block number (height) of the preceding macro block before a given block number (height).
   * 
   * @param blockNumber The block number (height) to query.
   * @returns The block number (height) of the preceding macro block before a given block number (height).
   */
  getMacroBlockBefore(_0) {
    return __async(this, arguments, function* ({ blockNumber }, options = DEFAULT_OPTIONS) {
      return this.call("getMacroBlockBefore", [blockNumber], options);
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
    return __async(this, arguments, function* ({ blockNumber }, options = DEFAULT_OPTIONS) {
      return this.call("getLastMacroBlock", [blockNumber], options);
    });
  }
  /**
   * Gets a boolean expressing if the block at a given block number (height) is a macro block.
   * 
   * @param blockNumber The block number (height) to query.
   * @returns A boolean expressing if the block at a given block number (height) is a macro block.
   */
  getIsMacroBlockAt(_0) {
    return __async(this, arguments, function* ({ blockNumber }, options = DEFAULT_OPTIONS) {
      return this.call("getIsMacroBlockAt", [blockNumber], options);
    });
  }
  /**
   * Gets the block number (height) of the next micro block after a given block number (height).
   * 
   * @param blockNumber The block number (height) to query.
   * @returns The block number (height) of the next micro block after a given block number (height).
   */
  getIsMicroBlockAt(_0) {
    return __async(this, arguments, function* ({ blockNumber }, options = DEFAULT_OPTIONS) {
      return this.call("getIsMicroBlockAt", [blockNumber], options);
    });
  }
  /**
   * Gets the block number (height) of the first block of the given epoch (which is always a micro block).
   * 
   * @param epochIndex The epoch index to query.
   * @returns The block number (height) of the first block of the given epoch (which is always a micro block).
   */
  getFirstBlockOf(_0) {
    return __async(this, arguments, function* ({ epochIndex }, options = DEFAULT_OPTIONS) {
      return this.call("getFirstBlockOf", [epochIndex], options);
    });
  }
  /**
   * Gets the block number of the first block of the given batch (which is always a micro block).
   * 
   * @param batchIndex The batch index to query.
   * @returns The block number of the first block of the given batch (which is always a micro block).
   */
  getFirstBlockOfBatch(_0) {
    return __async(this, arguments, function* ({ batchIndex }, options = DEFAULT_OPTIONS) {
      return this.call("getFirstBlockOfBatch", [batchIndex], options);
    });
  }
  /**
   * Gets the block number of the election macro block of the given epoch (which is always the last block).
   * 
   * @param epochIndex The epoch index to query.
   * @returns The block number of the election macro block of the given epoch (which is always the last block).
   */
  getElectionBlockOf(_0) {
    return __async(this, arguments, function* ({ epochIndex }, options = DEFAULT_OPTIONS) {
      return this.call("getElectionBlockOf", [epochIndex], options);
    });
  }
  /**
   * Gets the block number of the macro block (checkpoint or election) of the given batch (which is always the last block).
   * 
   * @param batchIndex The batch index to query.
   * @returns The block number of the macro block (checkpoint or election) of the given batch (which is always the last block).
   */
  getMacroBlockOf(_0) {
    return __async(this, arguments, function* ({ batchIndex }, options = DEFAULT_OPTIONS) {
      return this.call("getMacroBlockOf", [batchIndex], options);
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
    return __async(this, arguments, function* ({ blockNumber }, options = DEFAULT_OPTIONS) {
      return this.call("getFirstBatchOfEpoch", [blockNumber], options);
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
    return __async(this, arguments, function* ({ genesisSupply, genesisTime, currentTime }, options = DEFAULT_OPTIONS) {
      return this.call("getSupplyAt", [genesisSupply, genesisTime, currentTime], options);
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
    return __async(this, arguments, function* (options = DEFAULT_OPTIONS) {
      return this.call("getAddress", [], options);
    });
  }
  /**
   * Returns our validator signing key
   */
  getSigningKey() {
    return __async(this, arguments, function* (options = DEFAULT_OPTIONS) {
      return this.call("getSigningKey", [], options);
    });
  }
  /**
   * Returns our validator voting key
   */
  getVotingKey() {
    return __async(this, arguments, function* (options = DEFAULT_OPTIONS) {
      return this.call("getVotingKey", [], options);
    });
  }
  /**
   * Updates the configuration setting to automatically reactivate our validator
   */
  setAutomaticReactivation(_0) {
    return __async(this, arguments, function* ({ automaticReactivation }, options = DEFAULT_OPTIONS) {
      return this.call("setAutomaticReactivation", [automaticReactivation], options);
    });
  }
};

// src/modules/wallet.ts
var WalletClient = class extends Client {
  constructor(url) {
    super(url);
  }
  importRawKey(_0) {
    return __async(this, arguments, function* ({ keyData, passphrase }, options = DEFAULT_OPTIONS) {
      return this.call("importRawKey", [keyData, passphrase], options);
    });
  }
  isAccountImported(_0) {
    return __async(this, arguments, function* ({ address }, options = DEFAULT_OPTIONS) {
      return this.call("isAccountImported", [address], options);
    });
  }
  listAccounts() {
    return __async(this, arguments, function* (options = DEFAULT_OPTIONS) {
      return this.call("listAccounts", [], options);
    });
  }
  lockAccount(_0) {
    return __async(this, arguments, function* ({ address }, options = DEFAULT_OPTIONS) {
      return this.call("lockAccount", [address], options);
    });
  }
  createAccount(_0) {
    return __async(this, arguments, function* (p, options = DEFAULT_OPTIONS) {
      return this.call("createAccount", [p == null ? void 0 : p.passphrase], options);
    });
  }
  unlockAccount(_0) {
    return __async(this, arguments, function* ({ address, passphrase, duration }, options = DEFAULT_OPTIONS) {
      return this.call("unlockAccount", [address, passphrase, duration], options);
    });
  }
  isAccountLocked(_0) {
    return __async(this, arguments, function* ({ address }, options = DEFAULT_OPTIONS) {
      return this.call("isAccountLocked", [address], options);
    });
  }
  sign(_0) {
    return __async(this, arguments, function* ({ message, address, passphrase, isHex }, options = DEFAULT_OPTIONS) {
      return this.call("sign", [message, address, passphrase, isHex], options);
    });
  }
  verifySignature(_0) {
    return __async(this, arguments, function* ({ message, publicKey, signature, isHex }, options = DEFAULT_OPTIONS) {
      return this.call("verifySignature", [message, publicKey, signature, isHex], options);
    });
  }
};

// src/modules/zkp-component.ts
var ZkpComponentClient = class extends Client {
  constructor(url) {
    super(url);
  }
  getZkpState() {
    return __async(this, arguments, function* (options = DEFAULT_OPTIONS) {
      const { data, error, context } = yield this.call("getZkpState", [], options);
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
      get: blockchain.getBlockBy.bind(blockchain),
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
      get: blockchain.getTransactionBy.bind(blockchain),
      push: mempool.pushTransaction.bind(mempool),
      minFeePerByte: mempool.getMinFeePerByte.bind(mempool),
      create: consensus.createTransaction.bind(consensus),
      send: consensus.sendTransaction.bind(consensus)
    };
    this.vesting = {
      new: {
        createTx: consensus.createNewVestingTransaction.bind(consensus),
        sendTx: consensus.sendNewVestingTransaction.bind(consensus)
      },
      redeem: {
        createTx: consensus.createRedeemVestingTransaction.bind(consensus),
        sendTx: consensus.sendRedeemVestingTransaction.bind(consensus)
      }
    };
    this.htlc = {
      new: {
        createTx: consensus.createNewHtlcTransaction.bind(consensus),
        sendTx: consensus.sendNewHtlcTransaction.bind(consensus)
      },
      redeem: {
        regular: {
          createTx: consensus.createRedeemRegularHtlcTransaction.bind(consensus),
          sendTx: consensus.sendRedeemRegularHtlcTransaction.bind(consensus)
        },
        timeoutTx: {
          createTx: consensus.createRedeemTimeoutHtlcTransaction.bind(consensus),
          sendTx: consensus.sendRedeemTimeoutHtlcTransaction.bind(consensus)
        },
        earlyTx: {
          createTx: consensus.createRedeemEarlyHtlcTransaction.bind(consensus),
          sendTx: consensus.sendRedeemEarlyHtlcTransaction.bind(consensus)
        }
      }
    };
    this.stakes = {
      new: {
        createTx: consensus.createStakeTransaction.bind(consensus),
        sendTx: consensus.sendStakeTransaction.bind(consensus)
      }
    };
    this.staker = {
      byAddress: blockchain.getStakerByAddress.bind(blockchain),
      new: {
        createTx: consensus.createNewStakerTransaction.bind(consensus),
        sendTx: consensus.sendNewStakerTransaction.bind(consensus)
      },
      update: {
        createTx: consensus.createUpdateStakerTransaction.bind(consensus),
        sendTx: consensus.sendUpdateStakerTransaction.bind(consensus)
      }
    };
    this.inherent = {
      get: blockchain.getInherentsBy.bind(blockchain)
    };
    this.account = {
      get: blockchain.getAccountBy.bind(blockchain),
      importRawKey: wallet.importRawKey.bind(wallet),
      new: wallet.createAccount.bind(wallet),
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
      activeList: blockchain.getActiveValidators.bind(blockchain),
      parked: blockchain.getParkedValidators.bind(blockchain),
      action: {
        new: {
          createTx: consensus.createNewValidatorTransaction.bind(consensus),
          sendTx: consensus.sendNewValidatorTransaction.bind(consensus)
        },
        update: {
          createTx: consensus.createUpdateValidatorTransaction.bind(consensus),
          sendTx: consensus.sendUpdateValidatorTransaction.bind(consensus)
        },
        deactive: {
          createTx: consensus.createDeactivateValidatorTransaction.bind(consensus),
          sendTx: consensus.sendDeactivateValidatorTransaction.bind(consensus)
        },
        reactivate: {
          createTx: consensus.createReactivateValidatorTransaction.bind(consensus),
          sendTx: consensus.sendReactivateValidatorTransaction.bind(consensus)
        },
        unpark: {
          createTx: consensus.createUnparkValidatorTransaction.bind(consensus),
          sendTx: consensus.sendUnparkValidatorTransaction.bind(consensus)
        },
        retire: {
          createTx: consensus.createRetireValidatorTransaction.bind(consensus),
          sendTx: consensus.sendRetireValidatorTransaction.bind(consensus)
        },
        delete: {
          createTx: consensus.createDeleteValidatorTransaction.bind(consensus),
          sendTx: consensus.sendDeleteValidatorTransaction.bind(consensus)
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
export {
  AccountType,
  BlockType,
  BlockchainClient,
  Client2 as Client,
  ConsensusClient,
  LogType,
  MempoolClient,
  NetworkClient,
  PolicyClient,
  ValidatorClient,
  WalletClient,
  ZkpComponentClient
};
