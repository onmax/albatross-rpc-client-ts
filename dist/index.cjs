"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  AccountType: () => AccountType,
  BlockType: () => BlockType,
  BlockchainClient: () => blockchain_exports,
  BlockchainStream: () => blockchain_streams_exports,
  ConsensusClient: () => consensus_exports,
  DEFAULT_OPTIONS: () => DEFAULT_OPTIONS,
  DEFAULT_OPTIONS_SEND_TX: () => DEFAULT_OPTIONS_SEND_TX,
  DEFAULT_TIMEOUT_CONFIRMATION: () => DEFAULT_TIMEOUT_CONFIRMATION,
  HttpClient: () => HttpClient,
  LogType: () => LogType,
  MempoolClient: () => mempool_exports,
  NetworkClient: () => network_exports,
  PolicyClient: () => policy_exports,
  ValidatorClient: () => validator_exports,
  WS_DEFAULT_OPTIONS: () => WS_DEFAULT_OPTIONS,
  WalletClient: () => wallet_exports,
  WebSocketClient: () => WebSocketClient,
  ZkpComponentClient: () => zkp_component_exports,
  default: () => Client
});
module.exports = __toCommonJS(src_exports);

// src/modules/blockchain.ts
var blockchain_exports = {};
__export(blockchain_exports, {
  BlockchainClient: () => BlockchainClient
});

// src/client/http.ts
var import_node_fetch = __toESM(require("node-fetch"), 1);
var DEFAULT_OPTIONS = {
  timeout: 1e4
};
var DEFAULT_TIMEOUT_CONFIRMATION = 1e4;
var DEFAULT_OPTIONS_SEND_TX = {
  timeout: DEFAULT_TIMEOUT_CONFIRMATION
};
var _HttpClient = class {
  constructor(url) {
    this.url = url;
  }
  async call(request, options) {
    const { method, params: requestParams, withMetadata } = request;
    const { timeout } = options;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const params = requestParams.map((param) => param === void 0 ? null : param);
    const context = {
      request: {
        method,
        params,
        id: _HttpClient.id
      },
      url: this.url.href,
      timestamp: Date.now()
    };
    const response = await (0, import_node_fetch.default)(this.url.href, {
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
        context,
        data: void 0,
        metadata: void 0,
        error: {
          code: response.status,
          message: response.status === 401 ? "Server requires authorization." : `Response status code not OK: ${response.status} ${response.statusText}`
        }
      };
    }
    const json = await response.json();
    if ("result" in json) {
      return {
        context,
        data: json.result.data,
        metadata: withMetadata ? json.result.metadata : void 0,
        error: void 0
      };
    }
    if ("error" in json) {
      return {
        context,
        data: void 0,
        metadata: void 0,
        error: {
          code: json.error.code,
          message: `${json.error.message}: ${json.error.data}`
        }
      };
    }
    return {
      context,
      data: void 0,
      metadata: void 0,
      error: {
        code: -1,
        message: `Unexpected format of data ${JSON.stringify(json)}`
      }
    };
  }
};
var HttpClient = _HttpClient;
HttpClient.id = 0;

// src/modules/blockchain.ts
var BlockchainClient = class extends HttpClient {
  constructor(url) {
    super(url);
  }
  /**
   * Returns the block number for the current head.
   */
  async getBlockNumber(options = DEFAULT_OPTIONS) {
    const req = { method: "getBlockNumber", params: [] };
    return super.call(req, options);
  }
  /**
   * Returns the batch number for the current head.
   */
  async getBatchNumber(options = DEFAULT_OPTIONS) {
    const req = { method: "getBatchNumber", params: [] };
    return super.call(req, options);
  }
  /**
   * Returns the epoch number for the current head.
   */
  async getEpochNumber(options = DEFAULT_OPTIONS) {
    const req = { method: "getEpochNumber", params: [] };
    return super.call(req, options);
  }
  /**
   * Tries to fetch a block given its hash or block number. It has an option to include the transactions in the block, which defaults to false.
   */
  async getBlockBy(p, options = DEFAULT_OPTIONS) {
    if ("hash" in p) {
      const req2 = { method: "getBlockByHash", params: [p.hash, p.includeTransactions] };
      return super.call(req2, options);
    }
    const req = { method: "getBlockByNumber", params: [p.blockNumber, p.includeTransactions] };
    return super.call(req, options);
  }
  /**
   * Returns the block at the head of the main chain. It has an option to include the
   * transactions in the block, which defaults to false.
   */
  async getLatestBlock(p = { includeTransactions: false }, options = DEFAULT_OPTIONS) {
    const req = { method: "getLatestBlock", params: [p.includeTransactions] };
    return super.call(req, options);
  }
  /**
   * Returns the information for the slot owner at the given block height and offset. The
   * offset is optional, it will default to getting the offset for the existing block
   * at the given height.
   */
  async getSlotAt({ blockNumber, offsetOpt, withMetadata }, options = DEFAULT_OPTIONS) {
    const req = { method: "getSlotAt", params: [blockNumber, offsetOpt], withMetadata };
    return super.call(req, options);
  }
  /**
   * Fetchs the transaction(s) given the parameters. The parameters can be a hash, a block number, a batch number or an address.
   * 
   * In case of address, it returns the latest transactions for a given address. All the transactions
   * where the given address is listed as a recipient or as a sender are considered. Reward
   * transactions are also returned. It has an option to specify the maximum number of transactions
   * to fetch, it defaults to 500.
   */
  async getTransactionBy(p, options = DEFAULT_OPTIONS) {
    if ("hash" in p) {
      const req = { method: "getTransactionByHash", params: [p.hash] };
      return super.call(req, options);
    } else if ("blockNumber" in p) {
      const req = { method: "getTransactionsByBlockNumber", params: [p.blockNumber] };
      return super.call(req, options);
    } else if ("batchNumber" in p) {
      const req = { method: "getTransactionsByBatchNumber", params: [p.batchNumber] };
      return super.call(req, options);
    } else if ("address" in p) {
      if (p.justHashes === true) {
        const req = { method: "getTransactionHashesByAddress", params: [p.address, p.max] };
        return super.call(req, options);
      } else {
        const req = { method: "getTransactionsByAddress", params: [p.address, p.max] };
        return super.call(req, options);
      }
    }
    throw new Error("Invalid parameters");
  }
  /**
   * Returns all the inherents (including reward inherents) for the parameter. Note
   * that this only considers blocks in the main chain.
   */
  async getInherentsBy(p, options = DEFAULT_OPTIONS) {
    if ("blockNumber" in p) {
      const req = { method: "getInherentsByBlockNumber", params: [p.blockNumber] };
      return super.call(req, options);
    } else if ("batchNumber" in p) {
      const req = { method: "getInherentsByBatchNumber", params: [p.batchNumber] };
      return super.call(req, options);
    }
    throw new Error("Invalid parameters");
  }
  /**
   * Tries to fetch the account at the given address.
   */
  async getAccountBy({ address, withMetadata }, options = DEFAULT_OPTIONS) {
    const req = { method: "getAccountByAddress", params: [address], withMetadata };
    return super.call(req, options);
  }
  /**
  * Returns a collection of the currently active validator's addresses and balances.
  */
  async getActiveValidators({ withMetadata } = { withMetadata: false }, options = DEFAULT_OPTIONS) {
    const req = { method: "getActiveValidators", params: [], withMetadata };
    return super.call(req, options);
  }
  /**
   * Returns information about the currently slashed slots. This includes slots that lost rewards
   * and that were disabled.
   */
  async getCurrentSlashedSlots({ withMetadata } = { withMetadata: false }, options = DEFAULT_OPTIONS) {
    const req = { method: "getCurrentSlashedSlots", params: [], withMetadata };
    return super.call(req, options);
  }
  /**
   * Returns information about the slashed slots of the previous batch. This includes slots that
   * lost rewards and that were disabled.
   */
  async getPreviousSlashedSlots({ withMetadata } = { withMetadata: false }, options = DEFAULT_OPTIONS) {
    const req = { method: "getPreviousSlashedSlots", params: [], withMetadata };
    return super.call(req, options);
  }
  /**
   * Returns information about the currently parked validators.
   */
  async getParkedValidators({ withMetadata } = { withMetadata: false }, options = DEFAULT_OPTIONS) {
    const req = { method: "getParkedValidators", params: [], withMetadata };
    return super.call(req, options);
  }
  /**
   * Tries to fetch a validator information given its address. It has an option to include a map
   * containing the addresses and stakes of all the stakers that are delegating to the validator.
   */
  async getValidatorBy({ address }, options = DEFAULT_OPTIONS) {
    const req = { method: "getValidatorByAddress", params: [address] };
    return super.call(req, options);
  }
  /**
   * Fetches all stakers for a given validator.
   * IMPORTANT: This operation iterates over all stakers of the staking contract
   * and thus is extremely computationally expensive.
   * This function requires the read lock acquisition prior to its execution.
   */
  async getStakersByAddress({ address }, options = DEFAULT_OPTIONS) {
    const req = { method: "getStakersByAddress", params: [address] };
    return super.call(req, options);
  }
  /**
   * Tries to fetch a staker information given its address.
   */
  async getStakerByAddress({ address }, options = DEFAULT_OPTIONS) {
    const req = { method: "getStakerByAddress", params: [address] };
    return super.call(req, options);
  }
};

// src/modules/blockchain-streams.ts
var blockchain_streams_exports = {};
__export(blockchain_streams_exports, {
  BlockchainStream: () => BlockchainStream
});

// src/client/web-socket.ts
var import_buffer = require("buffer");
var import_ws = __toESM(require("ws"), 1);
var WS_DEFAULT_OPTIONS = {
  once: false,
  filter: () => true
};
var WebSocketClient = class {
  constructor(url) {
    this.id = 0;
    const wsUrl = new URL(url.href.replace(/^http/, "ws"));
    wsUrl.pathname = "/ws";
    this.url = wsUrl;
    this.textDecoder = new TextDecoder();
  }
  async subscribe(request, userOptions) {
    const ws = new import_ws.default(this.url.href);
    let subscriptionId;
    const requestBody = {
      method: request.method,
      params: request.params,
      jsonrpc: "2.0",
      id: this.id++
    };
    const options = {
      ...WS_DEFAULT_OPTIONS,
      ...userOptions
    };
    const { once, filter } = options;
    const withMetadata = "withMetadata" in request ? request.withMetadata : false;
    const args = {
      next: (callback) => {
        ws.onerror = (error) => {
          callback({ data: void 0, metadata: void 0, error: { code: 1e3, message: error.message } });
        };
        ws.onmessage = async (event) => {
          let payloadStr;
          if (event.data instanceof import_buffer.Blob) {
            payloadStr = this.textDecoder.decode(await event.data.arrayBuffer());
          } else if (event.data instanceof ArrayBuffer || event.data instanceof Buffer) {
            payloadStr = this.textDecoder.decode(event.data);
          } else {
            return {
              code: 1001,
              message: "Unexpected data type"
            };
          }
          let payload;
          try {
            payload = JSON.parse(payloadStr);
          } catch (e) {
            return {
              code: 1002,
              message: `Unexpected payload: ${payloadStr}`
            };
          }
          if ("error" in payload) {
            callback({ data: void 0, metadata: void 0, error: payload });
            return;
          }
          if ("result" in payload) {
            subscriptionId = payload.result;
            return;
          }
          const data = withMetadata ? payload.params.result : payload.params.result.data;
          if (filter && !filter(data)) {
            return;
          }
          const metadata = withMetadata ? payload.params.result.metadata : void 0;
          callback({ data, metadata, error: void 0 });
          if (once) {
            ws.close();
          }
        };
      },
      close: () => {
        ws.close();
      },
      getSubscriptionId: () => subscriptionId,
      context: {
        request: requestBody,
        url: this.url.toString(),
        timestamp: Date.now()
      }
    };
    return new Promise((resolve) => {
      ws.onopen = () => {
        ws.send(JSON.stringify(requestBody));
        resolve(args);
      };
    });
  }
};

// src/modules/blockchain-streams.ts
var BlockchainStream = class extends WebSocketClient {
  constructor(url) {
    super(url);
  }
  /**
   * Subscribes to new block events.
   */
  async subscribeForBlocks(params, userOptions) {
    if (params.retrieve === "HASH") {
      const options = { ...WS_DEFAULT_OPTIONS, ...userOptions };
      return super.subscribe({ method: "subscribeForHeadBlockHash", params: [], withMetadata: false }, options);
    }
    let filter;
    switch (params.blockType) {
      case "MACRO":
        filter = (block) => "isElectionBlock" in block;
      case "ELECTION":
        filter = (block) => "isElectionBlock" in block;
      case "MICRO":
        filter = (block) => !("isElectionBlock" in block);
      default:
        filter = WS_DEFAULT_OPTIONS.filter;
    }
    const optionsMacro = { ...WS_DEFAULT_OPTIONS, ...userOptions, filter };
    return super.subscribe({ method: "subscribeForHeadBlock", params: [params.retrieve === "FULL"] }, optionsMacro);
  }
  /**
   * Subscribes to pre epoch validators events.
   */
  async subscribeForValidatorElectionByAddress(p, userOptions) {
    return super.subscribe({ method: "subscribeForValidatorElectionByAddress", params: [p.address], withMetadata: p == null ? void 0 : p.withMetadata }, { ...WS_DEFAULT_OPTIONS, ...userOptions });
  }
  /**
   * Subscribes to log events related to a given list of addresses and of any of the log types provided.
   * If addresses is empty it does not filter by address. If log_types is empty it won't filter by log types.
   * Thus the behavior is to assume all addresses or log_types are to be provided if the corresponding vec is empty.
   */
  async subscribeForLogsByAddressesAndTypes(p, userOptions) {
    return super.subscribe({ method: "subscribeForLogsByAddressesAndTypes", params: [(p == null ? void 0 : p.addresses) || [], (p == null ? void 0 : p.types) || []], withMetadata: p == null ? void 0 : p.withMetadata }, { ...WS_DEFAULT_OPTIONS, ...userOptions });
  }
};

// src/modules/consensus.ts
var consensus_exports = {};
__export(consensus_exports, {
  ConsensusClient: () => ConsensusClient
});

// src/types/enums.ts
var BlockType = /* @__PURE__ */ ((BlockType2) => {
  BlockType2["MICRO"] = "micro";
  BlockType2["MACRO"] = "macro";
  return BlockType2;
})(BlockType || {});
var LogType = /* @__PURE__ */ ((LogType2) => {
  LogType2["PayoutInherent"] = "payout-inherent";
  LogType2["ParkInherent"] = "park-inherent";
  LogType2["SlashInherent"] = "slash-inherent";
  LogType2["RevertContractInherent"] = "revert-contract-inherent";
  LogType2["PayFee"] = "pay-fee";
  LogType2["Transfer"] = "transfer";
  LogType2["HtlcCreate"] = "htlc-create";
  LogType2["HtlcTimeoutResolve"] = "htlc-timeout-resolve";
  LogType2["HtlcRegularTransfer"] = "htlc-regular-transfer";
  LogType2["HtlcEarlyResolve"] = "htlc-early-resolve";
  LogType2["VestingCreate"] = "vesting-create";
  LogType2["CreateValidator"] = "create-validator";
  LogType2["UpdateValidator"] = "update-validator";
  LogType2["DeactivateValidator"] = "deactivate-validator";
  LogType2["ReactivateValidator"] = "reactivate-validator";
  LogType2["UnparkValidator"] = "unpark-validator";
  LogType2["CreateStaker"] = "create-staker";
  LogType2["Stake"] = "stake";
  LogType2["StakerFeeDeduction"] = "staker-fee-deduction";
  LogType2["UpdateStaker"] = "update-staker";
  LogType2["RetireValidator"] = "retire-validator";
  LogType2["DeleteValidator"] = "delete-validator";
  LogType2["Unstake"] = "unstake";
  LogType2["PayoutReward"] = "payout-reward";
  LogType2["Park"] = "park";
  LogType2["Slash"] = "slash";
  LogType2["RevertContract"] = "revert-contract";
  LogType2["FailedTransaction"] = "failed-transaction";
  LogType2["ValidatorFeeDeduction"] = "validator-fee-deduction";
  return LogType2;
})(LogType || {});
var AccountType = /* @__PURE__ */ ((AccountType2) => {
  AccountType2["BASIC"] = "basic";
  AccountType2["VESTING"] = "vesting";
  AccountType2["HTLC"] = "htlc";
  return AccountType2;
})(AccountType || {});

// src/modules/consensus.ts
var ConsensusClient = class extends HttpClient {
  constructor(url, blockchainClient, blockchainStream) {
    super(url);
    this.blockchainClient = blockchainClient;
    this.blockchainStream = blockchainStream;
  }
  getValidityStartHeight(p) {
    return "relativeValidityStartHeight" in p ? `+${p.relativeValidityStartHeight}` : `${p.absoluteValidityStartHeight}`;
  }
  async waitForConfirmation(hash, params, waitForConfirmationTimeout = DEFAULT_TIMEOUT_CONFIRMATION, context) {
    const { next, close } = await this.blockchainStream.subscribeForLogsByAddressesAndTypes(params);
    return new Promise((resolve) => {
      const timeoutFn = setTimeout(async () => {
        close();
        const tx = await this.blockchainClient.getTransactionBy({ hash });
        if (tx.error) {
          resolve({ context, error: { code: -32300, message: `Timeout waiting for confirmation of transaction ${hash}` }, data: void 0 });
        } else {
          resolve({ context, error: void 0, data: { log: void 0, hash, tx: tx.data } });
        }
      }, waitForConfirmationTimeout);
      next(async (log) => {
        if (log.error)
          return;
        if (log.data.transactions.some((tx) => tx.hash === hash)) {
          clearTimeout(timeoutFn);
          close();
          const tx = await this.blockchainClient.getTransactionBy({ hash });
          if (tx.error) {
            resolve({ context, error: { code: -32300, message: `Error getting transaction ${hash}` }, data: void 0 });
          } else {
            resolve({ context, error: void 0, data: { log: void 0, hash, tx: tx.data } });
          }
        }
      });
    });
  }
  /**
  * Returns a boolean specifying if we have established consensus with the network
  */
  isConsensusEstablished(options = DEFAULT_OPTIONS) {
    const req = { method: "isConsensusEstablished", params: [] };
    return super.call(req, options);
  }
  /**
   * Given a serialized transaction, it will return the corresponding transaction struct
   */
  getRawTransactionInfo({ rawTransaction }, options = DEFAULT_OPTIONS) {
    const req = { method: "getRawTransactionInfo", params: [rawTransaction] };
    return super.call(req, options);
  }
  /**
   * Creates a serialized transaction
   */
  createTransaction(p, options = DEFAULT_OPTIONS) {
    if (p.data) {
      const req = { method: "createBasicTransactionWithData", params: [p.wallet, p.recipient, p.data, p.value, p.fee, this.getValidityStartHeight(p)] };
      return super.call(req, options);
    } else {
      const req = { method: "createBasicTransaction", params: [p.wallet, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)] };
      return super.call(req, options);
    }
  }
  /**
   * Sends a transaction
   */
  sendTransaction(p, options = DEFAULT_OPTIONS) {
    const req = p.data ? { method: "sendBasicTransactionWithData", params: [p.wallet, p.recipient, p.data, p.value, p.fee, this.getValidityStartHeight(p)] } : { method: "sendBasicTransaction", params: [p.wallet, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a transaction and waits for confirmation
   */
  async sendSyncTransaction(p, options) {
    const hash = await this.sendTransaction(p, options);
    if (hash.error)
      return hash;
    return await this.waitForConfirmation(hash.data, { addresses: [p.wallet, p.recipient], types: ["transfer" /* Transfer */] }, options.waitForConfirmationTimeout, hash.context);
  }
  /**
   * Returns a serialized transaction creating a new vesting contract
   */
  createNewVestingTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createNewVestingTransaction", params: [p.wallet, p.owner, p.startTime, p.timeStep, p.numSteps, p.value, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a transaction creating a new vesting contract to the network
   */
  sendNewVestingTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendNewVestingTransaction", params: [p.wallet, p.owner, p.startTime, p.timeStep, p.numSteps, p.value, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a transaction creating a new vesting contract to the network and waits for confirmation
   */
  async sendSyncNewVestingTransaction(p, options) {
    const hash = await this.sendNewVestingTransaction(p, options);
    if (hash.error)
      return hash;
    return await this.waitForConfirmation(hash.data, { addresses: [p.wallet] }, options.waitForConfirmationTimeout, hash.context);
  }
  /**
   * Returns a serialized transaction redeeming a vesting contract
   */
  async createRedeemVestingTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createRedeemVestingTransaction", params: [p.wallet, p.contractAddress, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a transaction redeeming a vesting contract
   */
  async sendRedeemVestingTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendRedeemVestingTransaction", params: [p.wallet, p.contractAddress, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a transaction redeeming a vesting contract and waits for confirmation
   */
  async sendSyncRedeemVestingTransaction(p, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendRedeemVestingTransaction(p, options);
    if (hash.error)
      return hash;
    return await this.waitForConfirmation(hash.data, { addresses: [p.wallet] }, options.waitForConfirmationTimeout, hash.context);
  }
  /**
   * Returns a serialized transaction creating a new HTLC contract
   */
  async createNewHtlcTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createNewHtlcTransaction", params: [p.wallet, p.htlcSender, p.htlcRecipient, p.hashRoot, p.hashCount, p.hashAlgorithm, p.timeout, p.value, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a transaction creating a new HTLC contract
   */
  async sendNewHtlcTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendNewHtlcTransaction", params: [p.wallet, p.htlcSender, p.htlcRecipient, p.hashRoot, p.hashCount, p.hashAlgorithm, p.timeout, p.value, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a transaction creating a new HTLC contract and waits for confirmation
   */
  async sendSyncNewHtlcTransaction(p, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendNewHtlcTransaction(p, options);
    if (hash.error)
      return hash;
    return await this.waitForConfirmation(hash.data, { addresses: [p.wallet] }, options.waitForConfirmationTimeout, hash.context);
  }
  /**
   * Returns a serialized transaction redeeming an HTLC contract
   */
  async createRedeemRegularHtlcTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createRedeemRegularHtlcTransaction", params: [p.wallet, p.contractAddress, p.recipient, p.preImage, p.hashRoot, p.hashCount, p.hashAlgorithm, p.value, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a transaction redeeming an HTLC contract
   */
  async sendRedeemRegularHtlcTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendRedeemRegularHtlcTransaction", params: [p.wallet, p.contractAddress, p.recipient, p.preImage, p.hashRoot, p.hashCount, p.hashAlgorithm, p.value, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a transaction redeeming a new HTLC contract and waits for confirmation
   */
  async sendSyncRedeemRegularHtlcTransaction(p, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendRedeemRegularHtlcTransaction(p, options);
    if (hash.error)
      return hash;
    return await this.waitForConfirmation(hash.data, { addresses: [p.wallet] }, options.waitForConfirmationTimeout, hash.context);
  }
  /**
   * Returns a serialized transaction redeeming a HTLC contract using the `TimeoutResolve`
   * method 
   */
  async createRedeemTimeoutHtlcTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createRedeemRegularHtlcTransaction", params: [p.wallet, p.contractAddress, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a transaction redeeming a HTLC contract using the `TimeoutResolve`
   * method to network
   */
  async sendRedeemTimeoutHtlcTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendRedeemRegularHtlcTransaction", params: [p.wallet, p.contractAddress, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a transaction redeeming a HTLC contract using the `TimeoutResolve`
   * method to network and waits for confirmation
   */
  async sendSyncRedeemTimeoutHtlcTransaction(p, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendRedeemTimeoutHtlcTransaction(p, options);
    if (hash.error)
      return hash;
    return await this.waitForConfirmation(hash.data, { addresses: [p.wallet] }, options.waitForConfirmationTimeout, hash.context);
  }
  /**
   * Returns a serialized transaction redeeming a HTLC contract using the `EarlyResolve`
   * method.
   */
  async createRedeemEarlyHtlcTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createRedeemEarlyHtlcTransaction", params: [p.wallet, p.htlcAddress, p.recipient, p.htlcSenderSignature, p.htlcRecipientSignature, p.value, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a transaction redeeming a HTLC contract using the `EarlyResolve`
   * method.
   */
  async sendRedeemEarlyHtlcTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendRedeemEarlyHtlcTransaction", params: [p.wallet, p.htlcAddress, p.recipient, p.htlcSenderSignature, p.htlcRecipientSignature, p.value, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a transaction redeeming a HTLC contract using the `EarlyResolve`
   * method and waits for confirmation
   */
  async sendSyncRedeemEarlyHtlcTransaction(p, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendRedeemEarlyHtlcTransaction(p, options);
    if (hash.error)
      return hash;
    return await this.waitForConfirmation(hash.data, { addresses: [p.wallet] }, options.waitForConfirmationTimeout, hash.context);
  }
  /**
   * Returns a serialized signature that can be used to redeem funds from a HTLC contract using
   * the `EarlyResolve` method.
   */
  async signRedeemEarlyHtlcTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "signRedeemEarlyHtlcTransaction", params: [p.wallet, p.htlcAddress, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Returns a serialized `new_staker` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  async createNewStakerTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createNewStakerTransaction", params: [p.senderWallet, p.staker, p.delegation, p.value, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a `new_staker` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  async sendNewStakerTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendNewStakerTransaction", params: [p.senderWallet, p.staker, p.delegation, p.value, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a `new_staker` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee and waits for confirmation.
   */
  async sendSyncNewStakerTransaction(p, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendNewStakerTransaction(p, options);
    if (hash.error)
      return hash;
    return await this.waitForConfirmation(hash.data, { addresses: [p.senderWallet], types: ["create-staker" /* CreateStaker */] }, options.waitForConfirmationTimeout, hash.context);
  }
  /**
   * Returns a serialized `stake` transaction. The funds to be staked and the transaction fee will
   * be paid from the `sender_wallet`.
   */
  async createStakeTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createStakeTransaction", params: [p.senderWallet, p.staker, p.value, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a `stake` transaction. The funds to be staked and the transaction fee will
   * be paid from the `sender_wallet`.
   */
  async sendStakeTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendStakeTransaction", params: [p.senderWallet, p.staker, p.value, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a `stake` transaction. The funds to be staked and the transaction fee will
   * be paid from the `sender_wallet` and waits for confirmation.
   */
  async sendSyncStakeTransaction(p, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendStakeTransaction(p, options);
    if (hash.error)
      return hash;
    return await this.waitForConfirmation(hash.data, { addresses: [p.senderWallet], types: ["stake" /* Stake */] }, options.waitForConfirmationTimeout, hash.context);
  }
  /**
   * Returns a serialized `update_staker` transaction. You can pay the transaction fee from a basic
   * account (by providing the sender wallet) or from the staker account's balance (by not
   * providing a sender wallet).
   */
  async createUpdateStakerTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createUpdateStakerTransaction", params: [p.senderWallet, p.staker, p.newDelegation, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a `update_staker` transaction. You can pay the transaction fee from a basic
   * account (by providing the sender wallet) or from the staker account's balance (by not
   * providing a sender wallet).
   */
  async sendUpdateStakerTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendUpdateStakerTransaction", params: [p.senderWallet, p.staker, p.newDelegation, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a `update_staker` transaction. You can pay the transaction fee from a basic
   * account (by providing the sender wallet) or from the staker account's balance (by not
   * providing a sender wallet) and waits for confirmation.
   */
  async sendSyncUpdateStakerTransaction(p, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendUpdateStakerTransaction(p, options);
    if (hash.error)
      return hash;
    return await this.waitForConfirmation(hash.data, { addresses: [p.senderWallet], types: ["update-staker" /* UpdateStaker */] }, options.waitForConfirmationTimeout, hash.context);
  }
  /**
   * Returns a serialized `unstake` transaction. The transaction fee will be paid from the funds
   * being unstaked.
   */
  async createUnstakeTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createUnstakeTransaction", params: [p.staker, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a `unstake` transaction. The transaction fee will be paid from the funds
   * being unstaked.
   */
  async sendUnstakeTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendUnstakeTransaction", params: [p.staker, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a `unstake` transaction. The transaction fee will be paid from the funds
   * being unstaked and waits for confirmation.
   */
  async sendSyncUnstakeTransaction(p, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendUnstakeTransaction(p, options);
    if (hash.error)
      return hash;
    return await this.waitForConfirmation(hash.data, { addresses: [p.recipient], types: ["unstake" /* Unstake */] }, options.waitForConfirmationTimeout, hash.context);
  }
  /**
   * Returns a serialized `new_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee and the validator deposit.
   * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
   * have a double Option. So we use the following work-around for the signal data:
   * "" = Set the signal data field to None.
   * "0x29a4b..." = Set the signal data field to Some(0x29a4b...).
   */
  async createNewValidatorTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createNewValidatorTransaction", params: [p.senderWallet, p.validator, p.signingSecretKey, p.votingSecretKey, p.rewardAddress, p.signalData, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a `new_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee and the validator deposit.
   * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
   * have a double Option. So we use the following work-around for the signal data:
   * "" = Set the signal data field to None.
   * "0x29a4b..." = Set the signal data field to Some(0x29a4b...).
   */
  async sendNewValidatorTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendNewValidatorTransaction", params: [p.senderWallet, p.validator, p.signingSecretKey, p.votingSecretKey, p.rewardAddress, p.signalData, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
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
  async sendSyncNewValidatorTransaction(p, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendNewValidatorTransaction(p, options);
    if (hash.error)
      return hash;
    return await this.waitForConfirmation(hash.data, { addresses: [p.senderWallet], types: ["create-validator" /* CreateValidator */] }, options.waitForConfirmationTimeout, hash.context);
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
  async createUpdateValidatorTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createUpdateValidatorTransaction", params: [p.senderWallet, p.validator, p.newSigningSecretKey, p.newVotingSecretKey, p.newRewardAddress, p.newSignalData, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
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
  async sendUpdateValidatorTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendUpdateValidatorTransaction", params: [p.senderWallet, p.validator, p.newSigningSecretKey, p.newVotingSecretKey, p.newRewardAddress, p.newSignalData, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
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
  async sendSyncUpdateValidatorTransaction(p, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendUpdateValidatorTransaction(p, options);
    if (hash.error)
      return hash;
    return await this.waitForConfirmation(hash.data, { addresses: [p.validator], types: ["update-validator" /* UpdateValidator */] }, options.waitForConfirmationTimeout, hash.context);
  }
  /**
   * Returns a serialized `inactivate_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  async createDeactivateValidatorTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createDeactivateValidatorTransaction", params: [p.senderWallet, p.validator, p.signingSecretKey, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a `inactivate_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  async sendDeactivateValidatorTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendDeactivateValidatorTransaction", params: [p.senderWallet, p.validator, p.signingSecretKey, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a `inactivate_validator` transaction and waits for confirmation.
   * You need to provide the address of a basic account (the sender wallet)
   * to pay the transaction fee.
   */
  async sendSyncDeactivateValidatorTransaction(p, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendDeactivateValidatorTransaction(p, options);
    if (hash.error)
      return hash;
    return await this.waitForConfirmation(hash.data, { addresses: [p.validator], types: ["deactivate-validator" /* DeactivateValidator */] }, options.waitForConfirmationTimeout, hash.context);
  }
  /**
   * Returns a serialized `reactivate_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  async createReactivateValidatorTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createReactivateValidatorTransaction", params: [p.senderWallet, p.validator, p.signingSecretKey, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a `reactivate_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  async sendReactivateValidatorTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendReactivateValidatorTransaction", params: [p.senderWallet, p.validator, p.signingSecretKey, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a `reactivate_validator` transaction and waits for confirmation.
   * You need to provide the address of a basic account (the sender wallet)
   * to pay the transaction fee.
   */
  async sendSyncReactivateValidatorTransaction(p, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendReactivateValidatorTransaction(p, options);
    if (hash.error)
      return hash;
    return await this.waitForConfirmation(hash.data, { addresses: [p.validator], types: ["reactivate-validator" /* ReactivateValidator */] }, options.waitForConfirmationTimeout, hash.context);
  }
  /**
   * Returns a serialized `unpark_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  async createUnparkValidatorTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createUnparkValidatorTransaction", params: [p.senderWallet, p.validator, p.signingSecretKey, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a `unpark_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  async sendUnparkValidatorTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendUnparkValidatorTransaction", params: [p.senderWallet, p.validator, p.signingSecretKey, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a `unpark_validator` transaction and waits for confirmation.
   * You need to provide the address of a basic account (the sender wallet)
   * to pay the transaction fee.
   */
  async sendSyncUnparkValidatorTransaction(p, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendUnparkValidatorTransaction(p, options);
    if (hash.error)
      return hash;
    return await this.waitForConfirmation(hash.data, { addresses: [p.validator], types: ["unpark-validator" /* UnparkValidator */] }, options.waitForConfirmationTimeout, hash.context);
  }
  /**
   * Returns a serialized `retire_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  async createRetireValidatorTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createRetireValidatorTransaction", params: [p.senderWallet, p.validator, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a `retire_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  async sendRetireValidatorTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendRetireValidatorTransaction", params: [p.senderWallet, p.validator, p.fee, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a `retire_validator` transaction and waits for confirmation.
   * You need to provide the address of a basic account (the sender wallet)
   * to pay the transaction fee.
   */
  async sendSyncRetireValidatorTransaction(p, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendRetireValidatorTransaction(p, options);
    if (hash.error)
      return hash;
    return await this.waitForConfirmation(hash.data, { addresses: [p.validator], types: ["retire-validator" /* RetireValidator */] }, options.waitForConfirmationTimeout, hash.context);
  }
  /**
   * Returns a serialized `delete_validator` transaction. The transaction fee will be paid from the
   * validator deposit that is being returned.
   * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
   * Failed delete validator transactions can diminish the validator deposit
   */
  async createDeleteValidatorTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createDeleteValidatorTransaction", params: [p.validator, p.recipient, p.fee, p.value, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
   * Sends a `delete_validator` transaction. The transaction fee will be paid from the
   * validator deposit that is being returned.
   * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
   * Failed delete validator transactions can diminish the validator deposit
   */
  async sendDeleteValidatorTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendDeleteValidatorTransaction", params: [p.validator, p.recipient, p.fee, p.value, this.getValidityStartHeight(p)] };
    return super.call(req, options);
  }
  /**
  * Sends a `delete_validator` transaction and waits for confirmation.
  * The transaction fee will be paid from the validator deposit that is being returned.
  * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
  * Failed delete validator transactions can diminish the validator deposit
  */
  async sendSyncDeleteValidatorTransaction(p, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendDeleteValidatorTransaction(p, options);
    if (hash.error)
      return hash;
    return await this.waitForConfirmation(hash.data, { addresses: [p.validator], types: ["delete-validator" /* DeleteValidator */] }, options.waitForConfirmationTimeout, hash.context);
  }
};

// src/modules/mempool.ts
var mempool_exports = {};
__export(mempool_exports, {
  MempoolClient: () => MempoolClient
});
var MempoolClient = class extends HttpClient {
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
      const req = { method: "pushHighPriorityTransaction", params: [transaction] };
      return super.call(req, options);
    } else {
      const req = { method: "pushTransaction", params: [transaction] };
      return super.call(req, options);
    }
  }
  /**
   * Content of the mempool
   * 
   * @param includeTransactions
   * @returns 
   */
  mempoolContent({ includeTransactions } = { includeTransactions: false }, options = DEFAULT_OPTIONS) {
    const req = { method: "mempoolContent", params: [includeTransactions] };
    return super.call(req, options);
  }
  /**
   * @returns 
   */
  mempool(options = DEFAULT_OPTIONS) {
    const req = { method: "mempool", params: [] };
    return super.call(req, options);
  }
  /**
   * 
   * @returns
   */
  getMinFeePerByte(options = DEFAULT_OPTIONS) {
    const req = { method: "getMinFeePerByte", params: [] };
    return super.call(req, options);
  }
};

// src/modules/network.ts
var network_exports = {};
__export(network_exports, {
  NetworkClient: () => NetworkClient
});
var NetworkClient = class extends HttpClient {
  /**
   * The peer ID for our local peer.
   */
  async getPeerId(options = DEFAULT_OPTIONS) {
    const req = { method: "getPeerId", params: [] };
    return super.call(req, options);
  }
  /**
   * Returns the number of peers. 
   */
  async getPeerCount(options = DEFAULT_OPTIONS) {
    const req = { method: "getPeerCount", params: [] };
    return super.call(req, options);
  }
  /**
   * Returns a list with the IDs of all our peers.
   */
  async getPeerList(options = DEFAULT_OPTIONS) {
    const req = { method: "getPeerList", params: [] };
    return super.call(req, options);
  }
};

// src/modules/policy.ts
var policy_exports = {};
__export(policy_exports, {
  PolicyClient: () => PolicyClient
});
var PolicyClient = class extends HttpClient {
  /**
   * Gets a bundle of policy constants
   */
  async getPolicyConstants(options = DEFAULT_OPTIONS) {
    const req = { method: "getPolicyConstants", params: [] };
    return super.call(req, options);
  }
  /**
   * Gets the epoch number at a given `block_number` (height)
   * 
   * @param blockNumber The block number (height) to query.
   * @param justIndex The epoch index is the number of a block relative to the epoch it is in.
   * For example, the first block of any epoch always has an epoch index of 0.
   * @returns The epoch number at the given block number (height) or index
   */
  async getEpochAt({ blockNumber, justIndex }, options = DEFAULT_OPTIONS) {
    if (justIndex) {
      const req = { method: "getEpochIndexAt", params: [blockNumber] };
      return super.call(req, options);
    } else {
      const req = { method: "getEpochAt", params: [blockNumber] };
      return super.call(req, options);
    }
  }
  /**
   * Gets the batch number at a given `block_number` (height)
   * 
   * @param blockNumber The block number (height) to query.
   * @param justIndex The batch index is the number of a block relative to the batch it is in.
   * For example, the first block of any batch always has an epoch index of 0.
   * @returns The epoch number at the given block number (height).
   */
  async getBatchAt({ blockNumber, justIndex }, options = DEFAULT_OPTIONS) {
    if (justIndex) {
      const req = { method: "getBatchIndexAt", params: [blockNumber] };
      return super.call(req, options);
    } else {
      const req = { method: "getBatchAt", params: [blockNumber] };
      return super.call(req, options);
    }
  }
  /**
   * Gets the number (height) of the next election macro block after a given block number (height).
   * 
   * @param blockNumber The block number (height) to query.
   * @returns The number (height) of the next election macro block after a given block number (height).
   */
  async getElectionBlockAfter({ blockNumber }, options = DEFAULT_OPTIONS) {
    const req = { method: "getElectionBlockAfter", params: [blockNumber] };
    return super.call(req, options);
  }
  /**
   * Gets the block number (height) of the preceding election macro block before a given block number (height).
   * If the given block number is an election macro block, it returns the election macro block before it.
   * 
   * @param blockNumber The block number (height) to query.
   * @returns The block number (height) of the preceding election macro block before a given block number (height).
   */
  async getElectionBlockBefore({ blockNumber }, options = DEFAULT_OPTIONS) {
    const req = { method: "getElectionBlockBefore", params: [blockNumber] };
    return super.call(req, options);
  }
  /**
   * Gets the block number (height) of the last election macro block at a given block number (height).
   * If the given block number is an election macro block, then it returns that block number.
   * 
   * @param blockNumber The block number (height) to query.
   * @returns 
   */
  async getLastElectionBlock({ blockNumber }, options = DEFAULT_OPTIONS) {
    const req = { method: "getLastElectionBlock", params: [blockNumber] };
    return super.call(req, options);
  }
  /**
   * Gets a boolean expressing if the block at a given block number (height) is an election macro block.
   * 
   * @param blockNumber The block number (height) to query.
   * @returns A boolean expressing if the block at a given block number (height) is an election macro block.
   */
  async getIsElectionBlockAt({ blockNumber }, options = DEFAULT_OPTIONS) {
    const req = { method: "getIsElectionBlockAt", params: [blockNumber] };
    return super.call(req, options);
  }
  /**
   * Gets the block number (height) of the next macro block after a given block number (height).
   * 
   * @param blockNumber The block number (height) to query.
   * @returns The block number (height) of the next macro block after a given block number (height).
   */
  async getMacroBlockAfter({ blockNumber }, options = DEFAULT_OPTIONS) {
    const req = { method: "getMacroBlockAfter", params: [blockNumber] };
    return super.call(req, options);
  }
  /**
   * Gets the block number (height) of the preceding macro block before a given block number (height).
   * 
   * @param blockNumber The block number (height) to query.
   * @returns The block number (height) of the preceding macro block before a given block number (height).
   */
  async getMacroBlockBefore({ blockNumber }, options = DEFAULT_OPTIONS) {
    const req = { method: "getMacroBlockBefore", params: [blockNumber] };
    return super.call(req, options);
  }
  /**
   * Gets the block number (height) of the last macro block at a given block number (height).
   * If the given block number is a macro block, then it returns that block number.
   * 
   * @param blockNumber The block number (height) to query.
   * @returns The block number (height) of the last macro block at a given block number (height).
   */
  async getLastMacroBlock({ blockNumber }, options = DEFAULT_OPTIONS) {
    const req = { method: "getLastMacroBlock", params: [blockNumber] };
    return super.call(req, options);
  }
  /**
   * Gets a boolean expressing if the block at a given block number (height) is a macro block.
   * 
   * @param blockNumber The block number (height) to query.
   * @returns A boolean expressing if the block at a given block number (height) is a macro block.
   */
  async getIsMacroBlockAt({ blockNumber }, options = DEFAULT_OPTIONS) {
    const req = { method: "getIsMacroBlockAt", params: [blockNumber] };
    return super.call(req, options);
  }
  /**
   * Gets the block number (height) of the next micro block after a given block number (height).
   * 
   * @param blockNumber The block number (height) to query.
   * @returns The block number (height) of the next micro block after a given block number (height).
   */
  async getIsMicroBlockAt({ blockNumber }, options = DEFAULT_OPTIONS) {
    const req = { method: "getIsMicroBlockAt", params: [blockNumber] };
    return super.call(req, options);
  }
  /**
   * Gets the block number (height) of the first block of the given epoch (which is always a micro block).
   * 
   * @param epochIndex The epoch index to query.
   * @returns The block number (height) of the first block of the given epoch (which is always a micro block).
   */
  async getFirstBlockOf({ epochIndex }, options = DEFAULT_OPTIONS) {
    const req = { method: "getFirstBlockOf", params: [epochIndex] };
    return super.call(req, options);
  }
  /**
   * Gets the block number of the first block of the given batch (which is always a micro block).
   * 
   * @param batchIndex The batch index to query.
   * @returns The block number of the first block of the given batch (which is always a micro block).
   */
  async getFirstBlockOfBatch({ batchIndex }, options = DEFAULT_OPTIONS) {
    const req = { method: "getFirstBlockOfBatch", params: [batchIndex] };
    return super.call(req, options);
  }
  /**
   * Gets the block number of the election macro block of the given epoch (which is always the last block).
   * 
   * @param epochIndex The epoch index to query.
   * @returns The block number of the election macro block of the given epoch (which is always the last block).
   */
  async getElectionBlockOf({ epochIndex }, options = DEFAULT_OPTIONS) {
    const req = { method: "getElectionBlockOf", params: [epochIndex] };
    return super.call(req, options);
  }
  /**
   * Gets the block number of the macro block (checkpoint or election) of the given batch (which is always the last block).
   * 
   * @param batchIndex The batch index to query.
   * @returns The block number of the macro block (checkpoint or election) of the given batch (which is always the last block).
   */
  async getMacroBlockOf({ batchIndex }, options = DEFAULT_OPTIONS) {
    const req = { method: "getMacroBlockOf", params: [batchIndex] };
    return super.call(req, options);
  }
  /**
   * Gets a boolean expressing if the batch at a given block number (height) is the first batch
   * of the epoch.
   * 
   * @param blockNumber The block number (height) to query.
   * @returns A boolean expressing if the batch at a given block number (height) is the first batch
   */
  async getFirstBatchOfEpoch({ blockNumber }, options = DEFAULT_OPTIONS) {
    const req = { method: "getFirstBatchOfEpoch", params: [blockNumber] };
    return super.call(req, options);
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
  async getSupplyAt({ genesisSupply, genesisTime, currentTime }, options = DEFAULT_OPTIONS) {
    const req = { method: "getSupplyAt", params: [genesisSupply, genesisTime, currentTime] };
    return super.call(req, options);
  }
};

// src/modules/validator.ts
var validator_exports = {};
__export(validator_exports, {
  ValidatorClient: () => ValidatorClient
});
var ValidatorClient = class extends HttpClient {
  /**
   * Returns our validator address.
   */
  async getAddress(options = DEFAULT_OPTIONS) {
    const req = { method: "getAddress", params: [] };
    return super.call(req, options);
  }
  /**
   * Returns our validator signing key
   */
  async getSigningKey(options = DEFAULT_OPTIONS) {
    const req = { method: "getSigningKey", params: [] };
    return super.call(req, options);
  }
  /**
   * Returns our validator voting key
  */
  async getVotingKey(options = DEFAULT_OPTIONS) {
    const req = { method: "getVotingKey", params: [] };
    return super.call(req, options);
  }
  /**
   * Updates the configuration setting to automatically reactivate our validator
  */
  async setAutomaticReactivation({ automaticReactivation }, options = DEFAULT_OPTIONS) {
    const req = { method: "setAutomaticReactivation", params: [automaticReactivation] };
    return super.call(req, options);
  }
};

// src/modules/wallet.ts
var wallet_exports = {};
__export(wallet_exports, {
  WalletClient: () => WalletClient
});
var WalletClient = class extends HttpClient {
  async importRawKey({ keyData, passphrase }, options = DEFAULT_OPTIONS) {
    const req = { method: "importRawKey", params: [keyData, passphrase] };
    return super.call(req, options);
  }
  async isAccountImported({ address }, options = DEFAULT_OPTIONS) {
    const req = { method: "isAccountImported", params: [address] };
    return super.call(req, options);
  }
  async listAccounts(options = DEFAULT_OPTIONS) {
    const req = { method: "listAccounts", params: [] };
    return super.call(req, options);
  }
  async lockAccount({ address }, options = DEFAULT_OPTIONS) {
    const req = { method: "lockAccount", params: [address] };
    return super.call(req, options);
  }
  async createAccount(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createAccount", params: [p == null ? void 0 : p.passphrase] };
    return super.call(req, options);
  }
  async unlockAccount({ address, passphrase, duration }, options = DEFAULT_OPTIONS) {
    const req = { method: "unlockAccount", params: [address, passphrase, duration] };
    return super.call(req, options);
  }
  async isAccountLocked({ address }, options = DEFAULT_OPTIONS) {
    const req = { method: "isAccountLocked", params: [address] };
    return super.call(req, options);
  }
  async sign({ message, address, passphrase, isHex }, options = DEFAULT_OPTIONS) {
    const req = { method: "sign", params: [message, address, passphrase, isHex] };
    return super.call(req, options);
  }
  async verifySignature({ message, publicKey, signature, isHex }, options = DEFAULT_OPTIONS) {
    const req = { method: "verifySignature", params: [message, publicKey, signature, isHex] };
    return super.call(req, options);
  }
};

// src/modules/zkp-component.ts
var zkp_component_exports = {};
__export(zkp_component_exports, {
  ZkpComponentClient: () => ZkpComponentClient
});
var ZkpComponentClient = class extends HttpClient {
  async getZkpState(options = DEFAULT_OPTIONS) {
    const req = { method: "getZkpState", params: [] };
    const { data, error, context, metadata } = await super.call(req, options);
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
        context,
        metadata
      };
    }
  }
};

// src/index.ts
var Client = class {
  constructor(url) {
    this.url = url;
    const blockchain = new blockchain_exports.BlockchainClient(url);
    const blockchainStreams = new blockchain_streams_exports.BlockchainStream(url);
    const consensus = new consensus_exports.ConsensusClient(url, blockchain, blockchainStreams);
    const mempool = new mempool_exports.MempoolClient(url);
    const network = new network_exports.NetworkClient(url);
    const policy = new policy_exports.PolicyClient(url);
    const validator_ = new validator_exports.ValidatorClient(url);
    const wallet = new wallet_exports.WalletClient(url);
    const zkpComponent = new zkp_component_exports.ZkpComponentClient(url);
    this._modules = {
      blockchain,
      blockchainStreams,
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
      getBy: blockchain.getBlockBy.bind(blockchain),
      latest: blockchain.getLatestBlock.bind(blockchain),
      election: {
        after: policy.getElectionBlockAfter.bind(policy),
        before: policy.getElectionBlockBefore.bind(policy),
        last: policy.getLastElectionBlock.bind(policy),
        getBy: policy.getElectionBlockOf.bind(policy),
        subscribe: blockchainStreams.subscribeForValidatorElectionByAddress.bind(blockchainStreams)
      },
      isElection: policy.getIsElectionBlockAt.bind(policy),
      macro: {
        after: policy.getMacroBlockAfter.bind(policy),
        before: policy.getMacroBlockBefore.bind(policy),
        last: policy.getLastMacroBlock.bind(policy),
        getBy: policy.getMacroBlockOf.bind(policy)
      },
      isMacro: policy.getIsMacroBlockAt.bind(policy),
      isMicro: policy.getIsMicroBlockAt.bind(policy),
      subscribe: blockchainStreams.subscribeForBlocks.bind(blockchainStreams)
    };
    this.logs = {
      subscribe: blockchainStreams.subscribeForLogsByAddressesAndTypes.bind(blockchainStreams)
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
      getBy: blockchain.getTransactionBy.bind(blockchain),
      push: mempool.pushTransaction.bind(mempool),
      minFeePerByte: mempool.getMinFeePerByte.bind(mempool),
      create: consensus.createTransaction.bind(consensus),
      send: consensus.sendTransaction.bind(consensus),
      sendSync: consensus.sendSyncTransaction.bind(consensus)
    };
    this.vesting = {
      new: {
        createTx: consensus.createNewVestingTransaction.bind(consensus),
        sendTx: consensus.sendNewVestingTransaction.bind(consensus),
        sendSyncTx: consensus.sendSyncNewVestingTransaction.bind(consensus)
      },
      redeem: {
        createTx: consensus.createRedeemVestingTransaction.bind(consensus),
        sendTx: consensus.sendRedeemVestingTransaction.bind(consensus),
        sendSyncTx: consensus.sendSyncRedeemVestingTransaction.bind(consensus)
      }
    };
    this.htlc = {
      new: {
        createTx: consensus.createNewHtlcTransaction.bind(consensus),
        sendTx: consensus.sendNewHtlcTransaction.bind(consensus),
        sendSyncTx: consensus.sendSyncNewHtlcTransaction.bind(consensus)
      },
      redeem: {
        regular: {
          createTx: consensus.createRedeemRegularHtlcTransaction.bind(consensus),
          sendTx: consensus.sendRedeemRegularHtlcTransaction.bind(consensus),
          sendSyncTx: consensus.sendSyncRedeemRegularHtlcTransaction.bind(consensus)
        },
        timeoutTx: {
          createTx: consensus.createRedeemTimeoutHtlcTransaction.bind(consensus),
          sendTx: consensus.sendRedeemTimeoutHtlcTransaction.bind(consensus),
          sendSyncTx: consensus.sendSyncRedeemTimeoutHtlcTransaction.bind(consensus)
        },
        earlyTx: {
          createTx: consensus.createRedeemEarlyHtlcTransaction.bind(consensus),
          sendTx: consensus.sendRedeemEarlyHtlcTransaction.bind(consensus),
          sendSyncTx: consensus.sendSyncRedeemEarlyHtlcTransaction.bind(consensus)
        }
      }
    };
    this.stakes = {
      new: {
        createTx: consensus.createStakeTransaction.bind(consensus),
        sendTx: consensus.sendStakeTransaction.bind(consensus),
        sendSyncTx: consensus.sendSyncStakeTransaction.bind(consensus)
      }
    };
    this.staker = {
      fromValidator: blockchain.getStakersByAddress.bind(blockchain),
      getBy: blockchain.getStakerByAddress.bind(blockchain),
      new: {
        createTx: consensus.createNewStakerTransaction.bind(consensus),
        sendTx: consensus.sendNewStakerTransaction.bind(consensus),
        sendSyncTx: consensus.sendSyncNewStakerTransaction.bind(consensus)
      },
      update: {
        createTx: consensus.createUpdateStakerTransaction.bind(consensus),
        sendTx: consensus.sendUpdateStakerTransaction.bind(consensus),
        sendSyncTx: consensus.sendSyncUpdateStakerTransaction.bind(consensus)
      }
    };
    this.inherent = {
      getBy: blockchain.getInherentsBy.bind(blockchain)
    };
    this.account = {
      getBy: blockchain.getAccountBy.bind(blockchain),
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
        deactivate: {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AccountType,
  BlockType,
  BlockchainClient,
  BlockchainStream,
  ConsensusClient,
  DEFAULT_OPTIONS,
  DEFAULT_OPTIONS_SEND_TX,
  DEFAULT_TIMEOUT_CONFIRMATION,
  HttpClient,
  LogType,
  MempoolClient,
  NetworkClient,
  PolicyClient,
  ValidatorClient,
  WS_DEFAULT_OPTIONS,
  WalletClient,
  WebSocketClient,
  ZkpComponentClient
});
