'use strict';

const node_buffer = require('node:buffer');
const fetch = require('node-fetch');
const WebSocket = require('ws');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e.default : e; }

const fetch__default = /*#__PURE__*/_interopDefaultCompat(fetch);
const WebSocket__default = /*#__PURE__*/_interopDefaultCompat(WebSocket);

var __defProp$b = Object.defineProperty;
var __defNormalProp$b = (obj, key, value) => key in obj ? __defProp$b(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$b = (obj, key, value) => {
  __defNormalProp$b(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const DEFAULT_OPTIONS = {
  timeout: 1e4
};
const DEFAULT_TIMEOUT_CONFIRMATION = 1e4;
const DEFAULT_OPTIONS_SEND_TX = {
  timeout: DEFAULT_TIMEOUT_CONFIRMATION
};
const _HttpClient = class _HttpClient {
  constructor(url, auth) {
    __publicField$b(this, "url");
    __publicField$b(this, "headers", { "Content-Type": "application/json", "Authorization": "" });
    if (!url)
      throw new Error("URL is required");
    this.url = url;
    if (auth && "secret" in auth && auth.secret) {
      this.url = new URL(`${url.href}?secret=${auth.secret}`);
    } else if (auth && "username" in auth && auth.username && "password" in auth && auth.password) {
      const authorization = node_buffer.Buffer.from(`${auth.username}:${auth.password}`).toString("base64");
      Object.assign(this.headers, { Authorization: `Basic ${authorization}` });
    }
  }
  async call(request, options = DEFAULT_OPTIONS) {
    const { method, params: requestParams, withMetadata } = request;
    const { timeout } = options;
    let controller;
    let timeoutId;
    if (timeout !== false) {
      controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), timeout);
    }
    const params = requestParams?.map((item) => item === void 0 ? null : item) || [];
    const context = {
      body: {
        method,
        params,
        jsonrpc: "2.0",
        id: _HttpClient.id++
      },
      headers: this.headers,
      url: this.url.href,
      timestamp: Date.now()
    };
    const response = await fetch__default(context.url, {
      method: "POST",
      headers: context.headers,
      body: JSON.stringify(context.body),
      signal: controller?.signal
    }).catch((error) => {
      if (error.name === "AbortError")
        return { ok: false, status: 408, statusText: `AbortError: Service Unavailable: ${error.message}` };
      else if (error.name === "FetchError")
        return { ok: false, status: 503, statusText: `FetchError: Service Unavailable: ${error.message} ` };
      else
        return { ok: false, status: 503, statusText: `Service Unavailable: ${error.message} ` };
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      return {
        context,
        data: void 0,
        metadata: void 0,
        error: {
          code: response.status,
          message: response.status === 401 ? "Server requires authorization." : `Response status code not OK: ${response.status} ${response.statusText} `
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
          message: `${json.error.message}: ${json.error.data} `
        }
      };
    }
    return {
      context,
      data: void 0,
      metadata: void 0,
      error: {
        code: -1,
        message: `Unexpected format of data ${JSON.stringify(json)} `
      }
    };
  }
};
__publicField$b(_HttpClient, "id", 0);
let HttpClient = _HttpClient;

var __defProp$a = Object.defineProperty;
var __defNormalProp$a = (obj, key, value) => key in obj ? __defProp$a(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$a = (obj, key, value) => {
  __defNormalProp$a(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const WS_DEFAULT_OPTIONS = {
  once: false,
  filter: () => true
};
class WebSocketClient {
  constructor(url, auth) {
    __publicField$a(this, "url");
    __publicField$a(this, "id", 0);
    __publicField$a(this, "headers", { Authorization: "" });
    __publicField$a(this, "textDecoder");
    const wsUrl = new URL(url.href.replace(/^http/, "ws"));
    wsUrl.pathname = "/ws";
    this.url = wsUrl;
    this.textDecoder = new TextDecoder();
    if (auth && "secret" in auth && auth.secret) {
      this.url = new URL(`${url.href}?secret=${auth.secret}`);
    } else if (auth && "username" in auth && auth.username && "password" in auth && auth.password) {
      const authorization = node_buffer.Buffer.from(`${auth.username}:${auth.password}`).toString("base64");
      Object.assign(this.headers, { Authorization: `Basic ${authorization}` });
    }
  }
  async subscribe(request, userOptions) {
    const ws = new WebSocket__default(this.url.href, { headers: this.headers });
    let subscriptionId;
    const requestBody = {
      method: request.method,
      params: request.params || [],
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
          if (event.data instanceof node_buffer.Blob) {
            payloadStr = this.textDecoder.decode(await event.data.arrayBuffer());
          } else if (event.data instanceof ArrayBuffer || event.data instanceof node_buffer.Buffer) {
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
          if (filter && !filter(data))
            return;
          const metadata = withMetadata ? payload.params.result.metadata : void 0;
          callback({ data, metadata, error: void 0 });
          if (once)
            ws.close();
        };
      },
      close: () => {
        ws.close();
      },
      getSubscriptionId: () => subscriptionId,
      context: {
        headers: this.headers,
        body: requestBody,
        url: this.url.toString(),
        timestamp: Date.now()
      }
    };
    let hasOpened = false;
    return new Promise((resolve) => {
      ws.onerror = (error) => {
        if (hasOpened)
          return;
        resolve({
          ...args,
          next: (callback) => {
            callback({ data: void 0, metadata: void 0, error: { code: 1e3, message: error.message } });
          }
        });
      };
      ws.onopen = () => {
        ws.send(JSON.stringify(requestBody));
        resolve(args);
        hasOpened = true;
      };
    });
  }
}

var __defProp$9 = Object.defineProperty;
var __defNormalProp$9 = (obj, key, value) => key in obj ? __defProp$9(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$9 = (obj, key, value) => {
  __defNormalProp$9(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class BlockchainClient {
  constructor(http) {
    __publicField$9(this, "client");
    this.client = http;
  }
  /**
   * Returns the block number for the current head.
   */
  async getBlockNumber(options = DEFAULT_OPTIONS) {
    return this.client.call({ method: "getBlockNumber" }, options);
  }
  /**
   * Returns the batch number for the current head.
   */
  async getBatchNumber(options = DEFAULT_OPTIONS) {
    return this.client.call({ method: "getBatchNumber" }, options);
  }
  /**
   * Returns the epoch number for the current head.
   */
  async getEpochNumber(options = DEFAULT_OPTIONS) {
    return this.client.call({ method: "getEpochNumber" }, options);
  }
  /**
   * Tries to fetch a block given its hash. It has an option to include the transactions in the block, which defaults to false.
   */
  async getBlockByHash(hash, p, options = DEFAULT_OPTIONS) {
    return this.client.call(
      { method: "getBlockByHash", params: [hash, p?.includeTransactions] },
      options
    );
  }
  /**
   * Tries to fetch a block given its number. It has an option to include the transactions in the block, which defaults to false.
   */
  async getBlockByNumber(blockNumber, p, options = DEFAULT_OPTIONS) {
    return this.client.call(
      {
        method: "getBlockByNumber",
        params: [blockNumber, p?.includeTransactions]
      },
      options
    );
  }
  /**
   * Returns the block at the head of the main chain. It has an option to include the
   * transactions in the block, which defaults to false.
   */
  async getLatestBlock(p = { includeTransactions: false }, options = DEFAULT_OPTIONS) {
    const req = { method: "getLatestBlock", params: [p.includeTransactions] };
    return this.client.call(
      req,
      options
    );
  }
  /**
   * Returns the information for the slot owner at the given block height and offset. The
   * offset is optional, it will default to getting the offset for the existing block
   * at the given height.
   */
  async getSlotAt(blockNumber, p, options = DEFAULT_OPTIONS) {
    return this.client.call({
      method: "getSlotAt",
      params: [blockNumber, p?.offsetOpt],
      withMetadata: p?.withMetadata
    }, options);
  }
  /**
   * Fetches the transaction(s) given the hash.
   */
  async getTransactionByHash(hash, options = DEFAULT_OPTIONS) {
    return this.client.call({
      method: "getTransactionByHash",
      params: [hash]
    }, options);
  }
  /**
   * Fetches the transaction(s) given the block number.
   */
  async getTransactionsByBlockNumber(blockNumber, options = DEFAULT_OPTIONS) {
    return this.client.call({
      method: "getTransactionsByBlockNumber",
      params: [blockNumber]
    }, options);
  }
  /**
   * Fetches the transaction(s) given the batch number.
   */
  async getTransactionsByBatchNumber(batchIndex, options = DEFAULT_OPTIONS) {
    return this.client.call({
      method: "getTransactionsByBatchNumber",
      params: [batchIndex]
    }, options);
  }
  /**
   * Fetches the transaction(s) given the address.
   *
   * It returns the latest transactions for a given address. All the transactions
   * where the given address is listed as a recipient or as a sender are considered. Reward
   * transactions are also returned. It has an option to specify the maximum number of transactions
   * to fetch, it defaults to 500.
   */
  async getTransactionsByAddress(address, p, options = DEFAULT_OPTIONS) {
    const req = {
      method: p?.justHashes ? "getTransactionHashesByAddress" : "getTransactionsByAddress",
      params: [address, p?.max]
    };
    return this.client.call(
      req,
      options
    );
  }
  /**
   * Returns all the inherents (including reward inherents) give the block number. Note
   * that this only considers blocks in the main chain.
   */
  async getInherentsByBlockNumber(blockNumber, options = DEFAULT_OPTIONS) {
    return this.client.call({
      method: "getInherentsByBlockNumber",
      params: [blockNumber]
    }, options);
  }
  /**
   * Returns all the inherents (including reward inherents) give the batch number. Note
   * that this only considers blocks in the main chain.
   */
  async getInherentsByBatchNumber(batchIndex, options = DEFAULT_OPTIONS) {
    return this.client.call({
      method: "getInherentsByBatchNumber",
      params: [batchIndex]
    }, options);
  }
  /**
   * Tries to fetch the account at the given address.
   */
  async getAccountByAddress(address, { withMetadata }, options = DEFAULT_OPTIONS) {
    const req = {
      method: "getAccountByAddress",
      params: [address],
      withMetadata
    };
    return this.client.call(
      req,
      options
    );
  }
  /**
   * Fetches all accounts in the accounts tree.
   * IMPORTANT: This operation iterates over all accounts in the accounts tree
   * and thus is extremely computationally expensive.
   */
  async getAccounts(options = DEFAULT_OPTIONS) {
    return this.client.call({
      method: "getAccounts"
    }, options);
  }
  /**
   * Returns a collection of the currently active validator's addresses and balances.
   */
  async getActiveValidators({ withMetadata } = { withMetadata: false }, options = DEFAULT_OPTIONS) {
    const req = { method: "getActiveValidators", withMetadata };
    return this.client.call(
      req,
      options
    );
  }
  async getCurrentPenalizedSlots({ withMetadata } = { withMetadata: false }, options = DEFAULT_OPTIONS) {
    return this.client.call({
      method: "getCurrentPenalizedSlots",
      withMetadata
    }, options);
  }
  async getPreviousPenalizedSlots({ withMetadata } = { withMetadata: false }, options = DEFAULT_OPTIONS) {
    const req = { method: "getPreviousPenalizedSlots", withMetadata };
    return this.client.call(
      req,
      options
    );
  }
  /**
   * Tries to fetch a validator information given its address.
   */
  async getValidatorByAddress(address, options = DEFAULT_OPTIONS) {
    return this.client.call({
      method: "getValidatorByAddress",
      params: [address]
    }, options);
  }
  /**
   * Fetches all validators in the staking contract.
   * IMPORTANT: This operation iterates over all validators in the staking contract
   * and thus is extremely computationally expensive.
   */
  async getValidators(options = DEFAULT_OPTIONS) {
    return this.client.call({
      method: "getValidators"
    }, options);
  }
  /**
   * Fetches all stakers for a given validator.
   * IMPORTANT: This operation iterates over all stakers of the staking contract
   * and thus is extremely computationally expensive.
   */
  async getStakersByValidatorAddress(address, options = DEFAULT_OPTIONS) {
    return this.client.call({
      method: "getStakersByValidatorAddress",
      params: [address]
    }, options);
  }
  /**
   * Tries to fetch a staker information given its address.
   */
  async getStakerByAddress(address, options = DEFAULT_OPTIONS) {
    return this.client.call({
      method: "getStakerByAddress",
      params: [address]
    }, options);
  }
}

const blockchain = {
  __proto__: null,
  BlockchainClient: BlockchainClient
};

var __defProp$8 = Object.defineProperty;
var __defNormalProp$8 = (obj, key, value) => key in obj ? __defProp$8(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$8 = (obj, key, value) => {
  __defNormalProp$8(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var BlockSubscriptionType = /* @__PURE__ */ ((BlockSubscriptionType2) => {
  BlockSubscriptionType2["MACRO"] = "MACRO";
  BlockSubscriptionType2["MICRO"] = "MICRO";
  BlockSubscriptionType2["ELECTION"] = "ELECTION";
  return BlockSubscriptionType2;
})(BlockSubscriptionType || {});
var RetrieveBlock = /* @__PURE__ */ ((RetrieveBlock2) => {
  RetrieveBlock2["FULL"] = "FULL";
  RetrieveBlock2["PARTIAL"] = "PARTIAL";
  RetrieveBlock2["HASH"] = "HASH";
  return RetrieveBlock2;
})(RetrieveBlock || {});
class BlockchainStream {
  constructor(ws) {
    __publicField$8(this, "ws");
    this.ws = ws;
  }
  /**
   * Subscribes to new block events.
   */
  async subscribeForBlocks(params, userOptions) {
    if (params.retrieve === "HASH" /* HASH */) {
      const options = { ...WS_DEFAULT_OPTIONS, ...userOptions };
      return this.ws.subscribe({ method: "subscribeForHeadBlockHash" }, options);
    }
    let filter;
    if (params.blockType === "MACRO" /* MACRO */)
      filter = (block) => "isElectionBlock" in block;
    else if (params.blockType === "ELECTION" /* ELECTION */)
      filter = (block) => "isElectionBlock" in block;
    else if (params.blockType === "MICRO" /* MICRO */)
      filter = (block) => !("isElectionBlock" in block);
    else
      filter = WS_DEFAULT_OPTIONS.filter;
    const optionsMacro = { ...WS_DEFAULT_OPTIONS, ...userOptions, filter };
    return this.ws.subscribe({ method: "subscribeForHeadBlock", params: [params.retrieve === "FULL" /* FULL */] }, optionsMacro);
  }
  /**
   * Subscribes to pre epoch validators events.
   */
  async subscribeForValidatorElectionByAddress(p, userOptions) {
    return this.ws.subscribe({ method: "subscribeForValidatorElectionByAddress", params: [p.address], withMetadata: p?.withMetadata }, { ...WS_DEFAULT_OPTIONS, ...userOptions });
  }
  /**
   * Subscribes to log events related to a given list of addresses and of any of the log types provided.
   * If addresses is empty it does not filter by address. If log_types is empty it won't filter by log types.
   * Thus the behavior is to assume all addresses or log_types are to be provided if the corresponding vec is empty.
   */
  async subscribeForLogsByAddressesAndTypes(p, userOptions) {
    return this.ws.subscribe({ method: "subscribeForLogsByAddressesAndTypes", params: [p?.addresses || [], p?.types || []], withMetadata: p?.withMetadata }, { ...WS_DEFAULT_OPTIONS, ...userOptions });
  }
}

const blockchainStreams = {
  __proto__: null,
  BlockSubscriptionType: BlockSubscriptionType,
  BlockchainStream: BlockchainStream,
  RetrieveBlock: RetrieveBlock
};

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
  LogType2["SetInactiveStake"] = "set-inactive-stake";
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

var __defProp$7 = Object.defineProperty;
var __defNormalProp$7 = (obj, key, value) => key in obj ? __defProp$7(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$7 = (obj, key, value) => {
  __defNormalProp$7(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class ConsensusClient {
  constructor(client, blockchainClient, blockchainStream) {
    __publicField$7(this, "client");
    __publicField$7(this, "blockchainClient");
    __publicField$7(this, "blockchainStream");
    this.client = client;
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
        const tx = await this.blockchainClient.getTransactionByHash(hash);
        if (tx.error)
          resolve({ context, error: { code: -32300, message: `Timeout waiting for confirmation of transaction ${hash}` }, data: void 0 });
        else
          resolve({ context, error: void 0, data: { log: void 0, hash, tx: tx.data } });
      }, waitForConfirmationTimeout);
      next(async (log) => {
        if (log.error)
          return;
        if (log.data.transactions.some((tx) => tx.hash === hash)) {
          clearTimeout(timeoutFn);
          close();
          const tx = await this.blockchainClient.getTransactionByHash(hash);
          if (tx.error)
            resolve({ context, error: { code: -32300, message: `Error getting transaction ${hash}` }, data: void 0 });
          else
            resolve({ context, error: void 0, data: { log: void 0, hash, tx: tx.data } });
        }
      });
    });
  }
  /**
   * Returns a boolean specifying if we have established consensus with the network
   */
  isConsensusEstablished(options = DEFAULT_OPTIONS) {
    return this.client.call({ method: "isConsensusEstablished" }, options);
  }
  /**
   * Given a serialized transaction, it will return the corresponding transaction struct
   */
  getRawTransactionInfo({ rawTransaction }, options = DEFAULT_OPTIONS) {
    return this.client.call({ method: "getRawTransactionInfo", params: [rawTransaction] }, options);
  }
  /**
   * Creates a serialized transaction
   */
  createTransaction(p, options = DEFAULT_OPTIONS) {
    if (p.data) {
      const req = { method: "createBasicTransactionWithData", params: [p.wallet, p.recipient, p.data, p.value, p.fee, this.getValidityStartHeight(p)] };
      return this.client.call(req, options);
    } else {
      const req = { method: "createBasicTransaction", params: [p.wallet, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)] };
      return this.client.call(req, options);
    }
  }
  /**
   * Sends a transaction
   */
  sendTransaction(p, options = DEFAULT_OPTIONS) {
    const req = p.data ? { method: "sendBasicTransactionWithData", params: [p.wallet, p.recipient, p.data, p.value, p.fee, this.getValidityStartHeight(p)] } : { method: "sendBasicTransaction", params: [p.wallet, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
  }
  /**
   * Sends a transaction and waits for confirmation
   */
  async sendSyncTransaction(p, options) {
    const hash = await this.sendTransaction(p, options);
    if (hash.error)
      return hash;
    return await this.waitForConfirmation(hash.data, { addresses: [p.wallet, p.recipient], types: [LogType.Transfer] }, options.waitForConfirmationTimeout, hash.context);
  }
  /**
   * Returns a serialized transaction creating a new vesting contract
   */
  createNewVestingTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createNewVestingTransaction", params: [p.wallet, p.owner, p.startTime, p.timeStep, p.numSteps, p.value, p.fee, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
  }
  /**
   * Sends a transaction creating a new vesting contract to the network
   */
  sendNewVestingTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendNewVestingTransaction", params: [p.wallet, p.owner, p.startTime, p.timeStep, p.numSteps, p.value, p.fee, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
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
    return this.client.call(req, options);
  }
  /**
   * Sends a transaction redeeming a vesting contract
   */
  async sendRedeemVestingTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendRedeemVestingTransaction", params: [p.wallet, p.contractAddress, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
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
    const req = { method: "createNewHtlcTransaction", params: [p.wallet, p.htlcSender, p.htlcRecipient, p.hashRoot, p.hashCount, p.timeout, p.value, p.fee, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
  }
  /**
   * Sends a transaction creating a new HTLC contract
   */
  async sendNewHtlcTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendNewHtlcTransaction", params: [p.wallet, p.htlcSender, p.htlcRecipient, p.hashRoot, p.hashCount, p.timeout, p.value, p.fee, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
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
    const req = { method: "createRedeemRegularHtlcTransaction", params: [p.wallet, p.contractAddress, p.recipient, p.preImage, p.hashRoot, p.hashCount, p.value, p.fee, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
  }
  /**
   * Sends a transaction redeeming an HTLC contract
   */
  async sendRedeemRegularHtlcTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendRedeemRegularHtlcTransaction", params: [p.wallet, p.contractAddress, p.recipient, p.preImage, p.hashRoot, p.hashCount, p.value, p.fee, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
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
    return this.client.call(req, options);
  }
  /**
   * Sends a transaction redeeming a HTLC contract using the `TimeoutResolve`
   * method to network
   */
  async sendRedeemTimeoutHtlcTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendRedeemRegularHtlcTransaction", params: [p.wallet, p.contractAddress, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
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
    return this.client.call(req, options);
  }
  /**
   * Sends a transaction redeeming a HTLC contract using the `EarlyResolve`
   * method.
   */
  async sendRedeemEarlyHtlcTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendRedeemEarlyHtlcTransaction", params: [p.wallet, p.htlcAddress, p.recipient, p.htlcSenderSignature, p.htlcRecipientSignature, p.value, p.fee, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
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
    return this.client.call(req, options);
  }
  /**
   * Returns a serialized `new_staker` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  async createNewStakerTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createNewStakerTransaction", params: [p.senderWallet, p.stakerWallet, p.delegation, p.value, p.fee, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
  }
  /**
   * Sends a `new_staker` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  async sendNewStakerTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendNewStakerTransaction", params: [p.senderWallet, p.stakerWallet, p.delegation, p.value, p.fee, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
  }
  /**
   * Sends a `new_staker` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee and waits for confirmation.
   */
  async sendSyncNewStakerTransaction(p, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendNewStakerTransaction(p, options);
    if (hash.error)
      return hash;
    return await this.waitForConfirmation(hash.data, { addresses: [p.senderWallet], types: [LogType.CreateStaker] }, options.waitForConfirmationTimeout, hash.context);
  }
  /**
   * Returns a serialized `stake` transaction. The funds to be staked and the transaction fee will
   * be paid from the `sender_wallet`.
   */
  async createStakeTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createStakeTransaction", params: [p.senderWallet, p.stakerWallet, p.value, p.fee, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
  }
  /**
   * Sends a `stake` transaction. The funds to be staked and the transaction fee will
   * be paid from the `sender_wallet`.
   */
  async sendStakeTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendStakeTransaction", params: [p.senderWallet, p.stakerWallet, p.value, p.fee, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
  }
  /**
   * Sends a `stake` transaction. The funds to be staked and the transaction fee will
   * be paid from the `sender_wallet` and waits for confirmation.
   */
  async sendSyncStakeTransaction(p, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendStakeTransaction(p, options);
    if (hash.error)
      return hash;
    return await this.waitForConfirmation(hash.data, { addresses: [p.senderWallet], types: [LogType.Stake] }, options.waitForConfirmationTimeout, hash.context);
  }
  /**
   * Returns a serialized `update_staker` transaction. You can pay the transaction fee from a basic
   * account (by providing the sender wallet) or from the staker account's balance (by not
   * providing a sender wallet).
   */
  async createUpdateStakerTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createUpdateStakerTransaction", params: [p.senderWallet, p.stakerWallet, p.newDelegation, p.reactivateAllStake, p.fee, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
  }
  /**
   * Sends a `update_staker` transaction. You can pay the transaction fee from a basic
   * account (by providing the sender wallet) or from the staker account's balance (by not
   * providing a sender wallet).
   */
  async sendUpdateStakerTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendUpdateStakerTransaction", params: [p.senderWallet, p.stakerWallet, p.newDelegation, p.reactivateAllStake, p.fee, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
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
    return await this.waitForConfirmation(hash.data, { addresses: [p.senderWallet], types: [LogType.UpdateStaker] }, options.waitForConfirmationTimeout, hash.context);
  }
  /**
   * Returns a serialized `set_inactive_stake` transaction. You can pay the transaction fee from a basic
   * account (by providing the sender wallet) or from the staker account's balance (by not
   * providing a sender wallet).
   */
  async createSetInactiveStakeTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createSetInactiveStakeTransaction", params: [p.senderWallet, p.stakerWallet, p.value, p.fee, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
  }
  /**
   * Sends a `set_inactive_stake` transaction. You can pay the transaction fee from a basic
   * account (by providing the sender wallet) or from the staker account's balance (by not
   * providing a sender wallet).
   */
  async sendSetInactiveStakeTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendSetInactiveStakeTransaction", params: [p.senderWallet, p.stakerWallet, p.value, p.fee, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
  }
  /**
   * Sends a `set_inactive_stake` transaction. You can pay the transaction fee from a basic
   * account (by providing the sender wallet) or from the staker account's balance (by not
   * providing a sender wallet) and waits for confirmation.
   */
  async sendSyncSetInactiveStakeTransaction(p, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendSetInactiveStakeTransaction(p, options);
    if (hash.error)
      return hash;
    return await this.waitForConfirmation(hash.data, { addresses: [p.senderWallet], types: [LogType.SetInactiveStake] }, options.waitForConfirmationTimeout, hash.context);
  }
  /**
   * Returns a serialized `unstake` transaction. The transaction fee will be paid from the funds
   * being unstaked.
   */
  async createUnstakeTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createUnstakeTransaction", params: [p.stakerWallet, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
  }
  /**
   * Sends a `unstake` transaction. The transaction fee will be paid from the funds
   * being unstaked.
   */
  async sendUnstakeTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendUnstakeTransaction", params: [p.stakerWallet, p.recipient, p.value, p.fee, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
  }
  /**
   * Sends a `unstake` transaction. The transaction fee will be paid from the funds
   * being unstaked and waits for confirmation.
   */
  async sendSyncUnstakeTransaction(p, options = DEFAULT_OPTIONS_SEND_TX) {
    const hash = await this.sendUnstakeTransaction(p, options);
    if (hash.error)
      return hash;
    return await this.waitForConfirmation(hash.data, { addresses: [p.recipient], types: [LogType.Unstake] }, options.waitForConfirmationTimeout, hash.context);
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
    return this.client.call(req, options);
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
    return this.client.call(req, options);
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
    return await this.waitForConfirmation(hash.data, { addresses: [p.senderWallet], types: [LogType.CreateValidator] }, options.waitForConfirmationTimeout, hash.context);
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
    return this.client.call(req, options);
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
    return this.client.call(req, options);
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
    return await this.waitForConfirmation(hash.data, { addresses: [p.validator], types: [LogType.UpdateValidator] }, options.waitForConfirmationTimeout, hash.context);
  }
  /**
   * Returns a serialized `inactivate_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  async createDeactivateValidatorTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createDeactivateValidatorTransaction", params: [p.senderWallet, p.validator, p.signingSecretKey, p.fee, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
  }
  /**
   * Sends a `inactivate_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  async sendDeactivateValidatorTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendDeactivateValidatorTransaction", params: [p.senderWallet, p.validator, p.signingSecretKey, p.fee, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
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
    return await this.waitForConfirmation(hash.data, { addresses: [p.validator], types: [LogType.DeactivateValidator] }, options.waitForConfirmationTimeout, hash.context);
  }
  /**
   * Returns a serialized `reactivate_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  async createReactivateValidatorTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createReactivateValidatorTransaction", params: [p.senderWallet, p.validator, p.signingSecretKey, p.fee, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
  }
  /**
   * Sends a `reactivate_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  async sendReactivateValidatorTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendReactivateValidatorTransaction", params: [p.senderWallet, p.validator, p.signingSecretKey, p.fee, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
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
    return await this.waitForConfirmation(hash.data, { addresses: [p.validator], types: [LogType.ReactivateValidator] }, options.waitForConfirmationTimeout, hash.context);
  }
  /**
   * Returns a serialized `retire_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  async createRetireValidatorTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createRetireValidatorTransaction", params: [p.senderWallet, p.validator, p.fee, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
  }
  /**
   * Sends a `retire_validator` transaction. You need to provide the address of a basic
   * account (the sender wallet) to pay the transaction fee.
   */
  async sendRetireValidatorTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendRetireValidatorTransaction", params: [p.senderWallet, p.validator, p.fee, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
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
    return await this.waitForConfirmation(hash.data, { addresses: [p.validator], types: [LogType.RetireValidator] }, options.waitForConfirmationTimeout, hash.context);
  }
  /**
   * Returns a serialized `delete_validator` transaction. The transaction fee will be paid from the
   * validator deposit that is being returned.
   * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
   * Failed delete validator transactions can diminish the validator deposit
   */
  async createDeleteValidatorTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "createDeleteValidatorTransaction", params: [p.validator, p.recipient, p.fee, p.value, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
  }
  /**
   * Sends a `delete_validator` transaction. The transaction fee will be paid from the
   * validator deposit that is being returned.
   * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
   * Failed delete validator transactions can diminish the validator deposit
   */
  async sendDeleteValidatorTransaction(p, options = DEFAULT_OPTIONS) {
    const req = { method: "sendDeleteValidatorTransaction", params: [p.validator, p.recipient, p.fee, p.value, this.getValidityStartHeight(p)] };
    return this.client.call(req, options);
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
    return await this.waitForConfirmation(hash.data, { addresses: [p.validator], types: [LogType.DeleteValidator] }, options.waitForConfirmationTimeout, hash.context);
  }
}

const consensus = {
  __proto__: null,
  ConsensusClient: ConsensusClient
};

var __defProp$6 = Object.defineProperty;
var __defNormalProp$6 = (obj, key, value) => key in obj ? __defProp$6(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$6 = (obj, key, value) => {
  __defNormalProp$6(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class MempoolClient {
  constructor(http) {
    __publicField$6(this, "client");
    this.client = http;
  }
  /**
   * Pushes the given serialized transaction to the local mempool
   *
   * @param params
   * @param params.transaction Serialized transaction
   * @param params.withHighPriority Whether to push the transaction with high priority
   * @returns Transaction hash
   */
  pushTransaction({ transaction, withHighPriority }, options = DEFAULT_OPTIONS) {
    return this.client.call({
      method: withHighPriority ? "pushHighPriorityTransaction" : "pushTransaction",
      params: [transaction]
    }, options);
  }
  /**
   * Content of the mempool
   *
   * @param params
   * @param params.includeTransactions
   * @returns includeTransactions ? Transaction[] : Hash[]
   */
  mempoolContent({ includeTransactions } = {
    includeTransactions: false
  }, options = DEFAULT_OPTIONS) {
    return this.client.call({
      method: "mempoolContent",
      params: [includeTransactions]
    }, options);
  }
  /**
   * Obtains the mempool content in fee per byte buckets
   *
   * @params options
   * @returns Mempool content in fee per byte buckets
   */
  mempool(options = DEFAULT_OPTIONS) {
    return this.client.call({ method: "mempool" }, options);
  }
  /**
   * Obtains the minimum fee per byte as per mempool configuration
   *
   * @params options
   * @returns Minimum fee per byte
   */
  getMinFeePerByte(options = DEFAULT_OPTIONS) {
    return this.client.call(
      { method: "getMinFeePerByte" },
      options
    );
  }
  /**
   * @param hash Transaction hash
   * @returns Transaction
   */
  getTransactionFromMempool(hash, options = DEFAULT_OPTIONS) {
    return this.client.call({
      method: "getTransactionFromMempool",
      params: [hash]
    }, options);
  }
}

const mempool = {
  __proto__: null,
  MempoolClient: MempoolClient
};

var __defProp$5 = Object.defineProperty;
var __defNormalProp$5 = (obj, key, value) => key in obj ? __defProp$5(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$5 = (obj, key, value) => {
  __defNormalProp$5(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class NetworkClient {
  constructor(http) {
    __publicField$5(this, "client");
    this.client = http;
  }
  /**
   * The peer ID for our local peer.
   */
  async getPeerId(options = DEFAULT_OPTIONS) {
    return this.client.call({ method: "getPeerId" }, options);
  }
  /**
   * Returns the number of peers.
   */
  async getPeerCount(options = DEFAULT_OPTIONS) {
    return this.client.call({ method: "getPeerCount" }, options);
  }
  /**
   * Returns a list with the IDs of all our peers.
   */
  async getPeerList(options = DEFAULT_OPTIONS) {
    return this.client.call({ method: "getPeerList" }, options);
  }
}

const network = {
  __proto__: null,
  NetworkClient: NetworkClient
};

var __defProp$4 = Object.defineProperty;
var __defNormalProp$4 = (obj, key, value) => key in obj ? __defProp$4(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$4 = (obj, key, value) => {
  __defNormalProp$4(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class PolicyClient {
  constructor(http) {
    __publicField$4(this, "client");
    this.client = http;
  }
  /**
   * Gets a bundle of policy constants
   *
   * RPC method name: "getPolicyConstants"
   *
   * @param options
   */
  async getPolicyConstants(options = DEFAULT_OPTIONS) {
    return this.client.call(
      { method: "getPolicyConstants" },
      options
    );
  }
  /**
   * Returns the epoch number at a given block number (height).
   *
   * RPC method name: "getEpochAt"
   *
   * @param blockNumber
   * @param options
   */
  async getEpochAt(blockNumber, options = DEFAULT_OPTIONS) {
    return this.client.call({
      method: "getEpochAt",
      params: [blockNumber]
    }, options);
  }
  /**
   *  Returns the epoch index at a given block number. The epoch index is the number of a block relative
   * to the epoch it is in. For example, the first block of any epoch always has an epoch index of 0.
   *
   * RPC method name: "getEpochIndexAt"
   *
   * @param blockNumber
   * @param options
   * @returns The epoch index at a given block number.
   */
  async getEpochIndexAt(blockNumber, options = DEFAULT_OPTIONS) {
    return this.client.call({
      method: "getEpochIndexAt",
      params: [blockNumber]
    }, options);
  }
  /**
   * Returns the batch number at a given `block_number` (height)
   *
   * RPC method name: "getBatchAt"
   *
   * @param blockNumber
   * @param options
   * @returns The batch number at a given `block_number` (height)
   */
  async getBatchAt(blockNumber, options = DEFAULT_OPTIONS) {
    return this.client.call({
      method: "getBatchAt",
      params: [blockNumber]
    }, options);
  }
  /**
   * Returns the batch index at a given block number. The batch index is the number of a block relative
   * to the batch it is in. For example, the first block of any batch always has an batch index of 0.
   *
   * RPC method name: "getBatchIndexAt"
   *
   * @param blockNumber
   * @param options
   * @returns The batch index at a given block number.
   */
  async getBatchIndexAt(blockNumber, options = DEFAULT_OPTIONS) {
    return this.client.call({
      method: "getBatchIndexAt",
      params: [blockNumber]
    }, options);
  }
  /**
   * Gets the number (height) of the next election macro block after a given block number (height).
   *
   * RPC method name: "getElectionBlockAfter"
   *
   * @param blockNumber
   * @returns The number (height) of the next election macro block after a given block number (height).
   */
  async getElectionBlockAfter(blockNumber, options = DEFAULT_OPTIONS) {
    return this.client.call({
      method: "getElectionBlockAfter",
      params: [blockNumber]
    }, options);
  }
  /**
   * Gets the block number (height) of the preceding election macro block before a given block number (height).
   * If the given block number is an election macro block, it returns the election macro block before it.
   *
   * RPC method name: "getElectionBlockBefore"
   *
   * @param blockNumber
   * @param options
   * @returns The block number (height) of the preceding election macro block before a given block number (height).
   */
  async getElectionBlockBefore(blockNumber, options = DEFAULT_OPTIONS) {
    return this.client.call({
      method: "getElectionBlockBefore",
      params: [blockNumber]
    }, options);
  }
  /**
   * Gets the block number (height) of the last election macro block at a given block number (height).
   * If the given block number is an election macro block, then it returns that block number.
   *
   * RPC method name: "getLastElectionBlock"
   *
   * @param blockNumber
   * @param options
   * @returns The block number (height) of the last election macro block at a given block number (height).
   */
  async getLastElectionBlock(blockNumber, options = DEFAULT_OPTIONS) {
    return this.client.call({
      method: "getLastElectionBlock",
      params: [blockNumber]
    }, options);
  }
  /**
   * Gets a boolean expressing if the block at a given block number (height) is an election macro block.
   *
   * RPC method name: "getIsElectionBlockAt"
   *
   * @param blockNumber The block number (height) to query.
   * @parm options
   * @returns A boolean expressing if the block at a given block number (height) is an election macro block.
   */
  async getIsElectionBlockAt(blockNumber, options = DEFAULT_OPTIONS) {
    return this.client.call({
      method: "getIsElectionBlockAt",
      params: [blockNumber]
    }, options);
  }
  /**
   * Gets the block number (height) of the next macro block after a given block number (height).
   *
   * RPC method name: "getMacroBlockAfter"
   *
   * @param blockNumber The block number (height) to query.
   * @returns The block number (height) of the next macro block after a given block number (height).
   */
  async getMacroBlockAfter(blockNumber, options = DEFAULT_OPTIONS) {
    return this.client.call({
      method: "getMacroBlockAfter",
      params: [blockNumber]
    }, options);
  }
  /**
   * Gets the block number (height) of the preceding macro block before a given block number (height).
   *
   * RPC method name: "getMacroBlockBefore"
   *
   * @param blockNumber The block number (height) to query.
   * @returns The block number (height) of the preceding macro block before a given block number (height).
   */
  async getMacroBlockBefore(blockNumber, options = DEFAULT_OPTIONS) {
    return this.client.call({
      method: "getMacroBlockBefore",
      params: [blockNumber]
    }, options);
  }
  /**
   * Gets the block number (height) of the last macro block at a given block number (height).
   * If the given block number is a macro block, then it returns that block number.
   *
   * RPC method name: "getLastMacroBlock"
   *
   * @param blockNumber The block number (height) to query.
   * @returns The block number (height) of the last macro block at a given block number (height).
   */
  async getLastMacroBlock(blockNumber, options = DEFAULT_OPTIONS) {
    return this.client.call({
      method: "getLastMacroBlock",
      params: [blockNumber]
    }, options);
  }
  /**
   * Gets a boolean expressing if the block at a given block number (height) is a macro block.
   *
   * RPC method name: "getIsMacroBlockAt"
   *
   * @param blockNumber The block number (height) to query.
   * @returns A boolean expressing if the block at a given block number (height) is a macro block.
   */
  async getIsMacroBlockAt(blockNumber, options = DEFAULT_OPTIONS) {
    return this.client.call({
      method: "getIsMacroBlockAt",
      params: [blockNumber]
    }, options);
  }
  /**
   * Gets the block number (height) of the next micro block after a given block number (height).
   *
   * RPC method name: "getMicroBlockAfter"
   *
   * @param blockNumber
   * @param options
   * @returns The block number (height) of the next micro block after a given block number (height).
   */
  async getIsMicroBlockAt(blockNumber, options = DEFAULT_OPTIONS) {
    const req = { method: "getIsMicroBlockAt", params: [blockNumber] };
    return this.client.call(req, options);
  }
  /**
   * Gets the block number (height) of the first block of the given epoch (which is always a micro block).
   *
   * RPC method name: "getFirstBlockOf"
   *
   * @param epochIndex
   * @param options
   * @returns The block number (height) of the first block of the given epoch (which is always a micro block).
   */
  async getFirstBlockOfEpoch(epochIndex, options = DEFAULT_OPTIONS) {
    const req = { method: "getFirstBlockOf", params: [epochIndex] };
    return this.client.call(req, options);
  }
  /**
   * Gets the block number of the first block of the given batch (which is always a micro block).
   *
   * RPC method name: "getFirstBlockOfBatch"
   *
   * @param batchIndex
   * @param options
   * @returns The block number of the first block of the given batch (which is always a micro block).
   */
  async getFirstBlockOfBatch(batchIndex, options = DEFAULT_OPTIONS) {
    const req = { method: "getFirstBlockOfBatch", params: [batchIndex] };
    return this.client.call(req, options);
  }
  /**
   * Gets the block number of the election macro block of the given epoch (which is always the last block).
   *
   * RPC method name: "getElectionBlockOf"
   *
   * @param epochIndex
   * @param options
   * @returns The block number of the election macro block of the given epoch (which is always the last block).
   */
  async getElectionBlockOfEpoch(epochIndex, options = DEFAULT_OPTIONS) {
    const req = { method: "getElectionBlockOf", params: [epochIndex] };
    return this.client.call(req, options);
  }
  /**
   * Gets the block number of the macro block (checkpoint or election) of the given batch (which is always the last block).
   *
   * RPC method name: "getMacroBlockOf"
   *
   * @param batchIndex
   * @param options
   * @returns The block number of the macro block (checkpoint or election) of the given batch (which is always the last block).
   */
  async getMacroBlockOfBatch(batchIndex, options = DEFAULT_OPTIONS) {
    const req = { method: "getMacroBlockOf", params: [batchIndex] };
    return this.client.call(req, options);
  }
  /**
   * Gets a boolean expressing if the batch at a given block number (height) is the first batch
   * of the epoch.
   *
   * RPC method name: "getFirstBatchOfEpoch"
   *
   * @param blockNumber
   * @param options
   * @returns A boolean expressing if the batch at a given block number (height) is the first batch
   */
  async getFirstBatchOfEpoch(blockNumber, options = DEFAULT_OPTIONS) {
    const req = { method: "getFirstBatchOfEpoch", params: [blockNumber] };
    return this.client.call(req, options);
  }
  /**
   * Gets the supply at a given time (as Unix time) in Lunas (1 NIM = 100,000 Lunas). It is
   * calculated using the following formula:
   * Supply (t) = Genesis_supply + Initial_supply_velocity / Supply_decay * (1 - e^(- Supply_decay * t))
   * Where e is the exponential function, t is the time in milliseconds since the genesis block and
   * Genesis_supply is the supply at the genesis of the Nimiq 2.0 chain.
   *
   * RPC method name: "getSupplyAt"
   *
   * @param params
   * @param params.genesisSupply supply at genesis
   * @param params.genesisTime timestamp of genesis block
   * @param params.currentTime timestamp to calculate supply at
   * @returns The supply at a given time (as Unix time) in Lunas (1 NIM = 100,000 Lunas).
   */
  async getSupplyAt({ genesisSupply, genesisTime, currentTime }, options = DEFAULT_OPTIONS) {
    const req = {
      method: "getSupplyAt",
      params: [genesisSupply, genesisTime, currentTime]
    };
    return this.client.call(req, options);
  }
}

const policy = {
  __proto__: null,
  PolicyClient: PolicyClient
};

var __defProp$3 = Object.defineProperty;
var __defNormalProp$3 = (obj, key, value) => key in obj ? __defProp$3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$3 = (obj, key, value) => {
  __defNormalProp$3(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class ValidatorClient {
  constructor(http) {
    __publicField$3(this, "client");
    this.client = http;
  }
  /**
   * Returns our validator address.
   */
  async getAddress(options = DEFAULT_OPTIONS) {
    return this.client.call({ method: "getAddress" }, options);
  }
  /**
   * Returns our validator signing key
   */
  async getSigningKey(options = DEFAULT_OPTIONS) {
    return this.client.call({ method: "getSigningKey" }, options);
  }
  /**
   * Returns our validator voting key
   */
  async getVotingKey(options = DEFAULT_OPTIONS) {
    return this.client.call({ method: "getVotingKey" }, options);
  }
  /**
   * Updates the configuration setting to automatically reactivate our validator
   */
  async setAutomaticReactivation({ automaticReactivation }, options = DEFAULT_OPTIONS) {
    return this.client.call({ method: "setAutomaticReactivation", params: [automaticReactivation] }, options);
  }
}

const validator = {
  __proto__: null,
  ValidatorClient: ValidatorClient
};

var __defProp$2 = Object.defineProperty;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$2 = (obj, key, value) => {
  __defNormalProp$2(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class WalletClient {
  constructor(http) {
    __publicField$2(this, "client");
    this.client = http;
  }
  async importRawKey({ keyData, passphrase }, options = DEFAULT_OPTIONS) {
    return this.client.call({ method: "importRawKey", params: [keyData, passphrase] }, options);
  }
  async isAccountImported(address, options = DEFAULT_OPTIONS) {
    return this.client.call({ method: "isAccountImported", params: [address] }, options);
  }
  async listAccounts(options = DEFAULT_OPTIONS) {
    return this.client.call({ method: "listAccounts" }, options);
  }
  async lockAccount(address, options = DEFAULT_OPTIONS) {
    return this.client.call({ method: "lockAccount", params: [address] }, options);
  }
  async createAccount(p, options = DEFAULT_OPTIONS) {
    return this.client.call({ method: "createAccount", params: [p?.passphrase] }, options);
  }
  async unlockAccount(address, { passphrase, duration }, options = DEFAULT_OPTIONS) {
    return this.client.call({ method: "unlockAccount", params: [address, passphrase, duration] }, options);
  }
  async isAccountLocked(address, options = DEFAULT_OPTIONS) {
    return this.client.call({ method: "isAccountLocked", params: [address] }, options);
  }
  async sign({ message, address, passphrase, isHex }, options = DEFAULT_OPTIONS) {
    return this.client.call({ method: "sign", params: [message, address, passphrase, isHex] }, options);
  }
  async verifySignature({ message, publicKey, signature, isHex }, options = DEFAULT_OPTIONS) {
    return this.client.call({ method: "verifySignature", params: [message, publicKey, signature, isHex] }, options);
  }
}

const wallet = {
  __proto__: null,
  WalletClient: WalletClient
};

var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => {
  __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class ZkpComponentClient {
  constructor(http) {
    __publicField$1(this, "client");
    this.client = http;
  }
  /**
   * Returns the latest header number, block number and proof
   * @returns the latest header number, block number and proof
   */
  async getZkpState(options = DEFAULT_OPTIONS) {
    const { data, error, context, metadata } = await this.client.call({ method: "getZkpState" }, options);
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
}

const zkpComponent = {
  __proto__: null,
  ZkpComponentClient: ZkpComponentClient
};

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _Client = class _Client {
  /**
   * @param url Node URL [?secret=secret]
   * @param auth { username, password }
   */
  constructor(url, auth) {
    __publicField(this, "http");
    __publicField(this, "ws");
    __publicField(this, "block");
    __publicField(this, "batch");
    __publicField(this, "epoch");
    __publicField(this, "transaction");
    __publicField(this, "inherent");
    __publicField(this, "account");
    __publicField(this, "validator");
    __publicField(this, "slots");
    __publicField(this, "mempool");
    __publicField(this, "stakes");
    __publicField(this, "staker");
    __publicField(this, "peers");
    __publicField(this, "supply_at");
    __publicField(this, "htlc");
    __publicField(this, "vesting");
    __publicField(this, "zeroKnowledgeProof");
    __publicField(this, "logs");
    __publicField(this, "modules");
    this.http = new HttpClient(url, auth);
    this.ws = new WebSocketClient(url, auth);
    const blockchain = new BlockchainClient(this.http);
    const blockchainStreams = new BlockchainStream(
      this.ws
    );
    const consensus = new ConsensusClient(
      this.http,
      blockchain,
      blockchainStreams
    );
    const mempool = new MempoolClient(this.http);
    const network = new NetworkClient(this.http);
    const policy = new PolicyClient(this.http);
    const validator_ = new ValidatorClient(this.http);
    const wallet = new WalletClient(this.http);
    const zkpComponent = new ZkpComponentClient(
      this.http
    );
    this.modules = {
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
      /**
       * Returns the block number for the current head.
       */
      current: blockchain.getBlockNumber.bind(blockchain),
      /**
       * Tries to fetch a block given its hash. It has an option to include the transactions in
       * the block, which defaults to false.
       */
      getByHash: blockchain.getBlockByHash.bind(blockchain),
      /**
       * Tries to fetch a block given its number. It has an option to include the transactions in
       * the block, which defaults to false.
       */
      getByNumber: blockchain.getBlockByNumber.bind(blockchain),
      /**
       * Returns the block at the head of the main chain. It has an option to include the
       * transactions in the block, which defaults to false.
       */
      latest: blockchain.getLatestBlock.bind(blockchain),
      /**
       * Returns the index of the block in its batch. Starting from 0.
       */
      batchIndex: policy.getBatchIndexAt.bind(policy),
      /**
       * Returns the index of the block in its epoch. Starting from 0.
       */
      epochIndex: policy.getEpochIndexAt.bind(policy),
      /**
       * Election blocks are the first blocks of each epoch
       */
      election: {
        /**
         * Gets the number (height) of the next election macro block after a given block
         * number (height).
         *
         * @param blockNumber The block number (height) to query.
         * @returns The number (height) of the next election macro block after a given
         * block number (height).
         */
        after: policy.getElectionBlockAfter.bind(policy),
        /**
         * Gets the block number (height) of the preceding election macro block before
         * a given block number (height). If the given block number is an election macro
         * block, it returns the election macro block before it.
         *
         * @param blockNumber The block number (height) to query.
         * @returns The block number (height) of the preceding election macro block before
         * a given block number (height).
         */
        before: policy.getElectionBlockBefore.bind(policy),
        /**
         * Gets the block number (height) of the last election macro block at a given block
         * number (height). If the given block number is an election macro block, then it
         * returns that block number.
         *
         * @param blockNumber The block number (height) to query.
         * @returns
         */
        last: policy.getLastElectionBlock.bind(policy),
        /**
         * Gets the block number of the election macro block of the given epoch (which is
         * always the last block).
         *
         * @param epochIndex The epoch index to query.
         * @returns The block number of the election macro block of the given epoch (which
         * is always the last block).
         */
        getByEpoch: policy.getElectionBlockOfEpoch.bind(policy),
        /**
         * Subscribes to pre epoch validators events.
         */
        subscribe: blockchainStreams.subscribeForValidatorElectionByAddress.bind(blockchainStreams)
      },
      /**
       * Gets a boolean expressing if the block at a given block number (height) is an election macro block.
       *
       * @param blockNumber The block number (height) to query.
       * @returns A boolean expressing if the block at a given block number (height) is an election macro block.
       */
      isElection: policy.getIsElectionBlockAt.bind(policy),
      /**
       * Macro blocks are the first blocks of each batch
       */
      macro: {
        /**
         * Gets the block number (height) of the next macro block after a given block number (height).
         *
         * @param blockNumber The block number (height) to query.
         * @returns The block number (height) of the next macro block after a given block number (height).
         */
        after: policy.getMacroBlockAfter.bind(policy),
        /**
         * Gets the block number (height) of the preceding macro block before a given block number
         * (height).
         *
         * @param blockNumber The block number (height) to query.
         * @returns The block number (height) of the preceding macro block before a given block
         * number (height).
         */
        before: policy.getMacroBlockBefore.bind(policy),
        /**
         * Gets the block number (height) of the last macro block at a given block number (height).
         * If the given block number is a macro block, then it returns that block number.
         *
         * @param blockNumber The block number (height) to query.
         * @returns The block number (height) of the last macro block at a given block number (height).
         */
        last: policy.getLastMacroBlock.bind(policy),
        /**
         * Gets the block number of the macro block (checkpoint or election) of the given batch
         * (which
         * is always the last block).
         *
         * @param batchIndex The batch index to query.
         * @returns The block number of the macro block (checkpoint or election) of the given
         * batch (which
         * is always the last block).
         */
        getByBatch: policy.getMacroBlockOfBatch.bind(policy)
      },
      /**
       * Gets a boolean expressing if the block at a given block number (height) is a macro block.
       *
       * @param blockNumber The block number (height) to query.
       * @returns A boolean expressing if the block at a given block number (height) is a macro block.
       */
      isMacro: policy.getIsMacroBlockAt.bind(policy),
      /**
       * Gets the block number (height) of the next micro block after a given block number (height).
       *
       * @param blockNumber The block number (height) to query.
       * @returns The block number (height) of the next micro block after a given block number (height).
       */
      isMicro: policy.getIsMicroBlockAt.bind(policy),
      /**
       * Subscribes to new block events.
       */
      subscribe: blockchainStreams.subscribeForBlocks.bind(blockchainStreams)
    };
    this.logs = {
      /**
       * Subscribes to log events related to a given list of addresses and of any of the log types
       * provided. If addresses is empty it does not filter by address. If log_types is empty it
       * won't filter by log types.
       *
       * Thus the behavior is to assume all addresses or log_types are to be provided if the
       * corresponding vec is empty.
       */
      subscribe: blockchainStreams.subscribeForLogsByAddressesAndTypes.bind(
        blockchainStreams
      )
    };
    this.batch = {
      /**
       * Returns the batch number for the current head.
       */
      current: blockchain.getBatchNumber.bind(blockchain),
      /**
       * Gets the batch number at a given `block_number` (height)
       *
       * @param blockNumber The block number (height) to query.
       * @param justIndex The batch index is the number of a block relative to the batch it is in.
       * For example, the first block of any batch always has an epoch index of 0.
       * @returns The epoch number at the given block number (height).
       */
      at: policy.getBatchAt.bind(policy),
      /**
       * Gets the block number (height) of the first block of the given epoch (which is always
       * a micro block).
       *
       * @param epochIndex The epoch index to query.
       * @returns The block number (height) of the first block of the given epoch (which is always
       * a micro block).
       */
      firstBlock: policy.getFirstBlockOfBatch.bind(policy)
    };
    this.epoch = {
      /**
       * Returns the epoch number for the current head.
       */
      current: blockchain.getEpochNumber.bind(blockchain),
      /**
       * Gets the epoch number at a given `block_number` (height)
       *
       * @param blockNumber The block number (height) to query.
       * @param justIndex The epoch index is the number of a block relative to the epoch it is in.
       * For example, the first block of any epoch always has an epoch index of 0.
       * @returns The epoch number at the given block number (height) or index
       */
      at: policy.getEpochAt.bind(policy),
      /**
       * Gets the block number (height) of the first block of the given epoch (which is always a micro block).
       *
       * @param epochIndex The epoch index to query.
       * @returns The block number (height) of the first block of the given epoch (which is always a micro block).
       */
      firstBlock: policy.getFirstBlockOfEpoch.bind(policy),
      /**
       * Gets a boolean expressing if the batch at a given block number (height) is the first batch
       * of the epoch.
       *
       * @param blockNumber The block number (height) to query.
       * @returns A boolean expressing if the batch at a given block number (height) is the first batch
       */
      firstBatch: policy.getFirstBatchOfEpoch.bind(policy)
    };
    this.slots = {
      /**
       * Returns the information for the slot owner at the given block height and offset. The
       * offset is optional, it will default to getting the offset for the existing block
       * at the given height.
       */
      at: blockchain.getSlotAt.bind(blockchain),
      penalized: {
        /**
         * Returns information about the currently penalized slots. This includes slots that lost rewards
         * and that were disabled.
         */
        current: blockchain.getCurrentPenalizedSlots.bind(blockchain),
        /**
         * Returns information about the penalized slots of the previous batch. This includes slots that
         * lost rewards and that were disabled.
         */
        previous: blockchain.getPreviousPenalizedSlots.bind(blockchain)
      }
    };
    this.transaction = {
      /**
       * Fetches the transactions given the address.
       *
       * It returns the latest transactions for a given address. All the transactions
       * where the given address is listed as a recipient or as a sender are considered. Reward
       * transactions are also returned. It has an option to specify the maximum number of transactions
       * to fetch, it defaults to 500.
       */
      getByAddress: blockchain.getTransactionsByAddress.bind(blockchain),
      /**
       * Fetches the transactions given the batch number.
       */
      getByBatch: blockchain.getTransactionsByBatchNumber.bind(blockchain),
      /**
       * Fetches the transactions given the block number.
       */
      getByBlockNumber: blockchain.getTransactionsByBlockNumber.bind(
        blockchain
      ),
      /**
       * Fetches the transaction given the hash.
       */
      getByHash: blockchain.getTransactionByHash.bind(blockchain),
      /**
       * Pushes the given serialized transaction to the local mempool
       *
       * @param transaction Serialized transaction
       * @returns Transaction hash
       */
      push: mempool.pushTransaction.bind(mempool),
      /**
       * @returns
       */
      minFeePerByte: mempool.getMinFeePerByte.bind(mempool),
      /**
       * Creates a serialized transaction
       */
      create: consensus.createTransaction.bind(consensus),
      /**
       * Sends a transaction
       */
      send: consensus.sendTransaction.bind(consensus),
      /**
       * Sends a transaction and waits for confirmation
       */
      sendSync: consensus.sendSyncTransaction.bind(consensus)
    };
    this.vesting = {
      new: {
        /**
         * Returns a serialized transaction creating a new vesting contract
         */
        createTx: consensus.createNewVestingTransaction.bind(consensus),
        /**
         * Sends a transaction creating a new vesting contract to the network
         */
        sendTx: consensus.sendNewVestingTransaction.bind(consensus),
        /**
         * Sends a transaction creating a new vesting contract to the network and waits for confirmation
         */
        sendSyncTx: consensus.sendSyncNewVestingTransaction.bind(consensus)
      },
      redeem: {
        /**
         * Returns a serialized transaction redeeming a vesting contract
         */
        createTx: consensus.createRedeemVestingTransaction.bind(consensus),
        /**
         * Sends a transaction redeeming a vesting contract to the network
         */
        sendTx: consensus.sendRedeemVestingTransaction.bind(consensus),
        /**
         * Sends a transaction redeeming a vesting contract to the network and waits for confirmation
         */
        sendSyncTx: consensus.sendSyncRedeemVestingTransaction.bind(consensus)
      }
    };
    this.htlc = {
      new: {
        /**
         * Returns a serialized transaction creating a new HTLC contract
         */
        createTx: consensus.createNewHtlcTransaction.bind(consensus),
        /**
         * Creates a serialized transaction creating a new HTLC contract
         */
        sendTx: consensus.sendNewHtlcTransaction.bind(consensus),
        /**
         * Sends a transaction creating a new HTLC contract to the network and waits for confirmation
         */
        sendSyncTx: consensus.sendSyncNewHtlcTransaction.bind(consensus)
      },
      redeem: {
        regular: {
          /**
           * Returns a serialized transaction redeeming a regular HTLC contract
           */
          createTx: consensus.createRedeemRegularHtlcTransaction.bind(
            consensus
          ),
          /**
           * Sends a transaction redeeming a regular HTLC contract to the network
           */
          sendTx: consensus.sendRedeemRegularHtlcTransaction.bind(consensus),
          /**
           * Sends a transaction redeeming a regular HTLC contract to the network and waits for confirmation
           */
          sendSyncTx: consensus.sendSyncRedeemRegularHtlcTransaction.bind(
            consensus
          )
        },
        timeoutTx: {
          /**
           * Returns a serialized transaction redeeming a timeout HTLC contract
           */
          createTx: consensus.createRedeemTimeoutHtlcTransaction.bind(
            consensus
          ),
          /**
           * Sends a transaction redeeming a timeout HTLC contract to the network
           */
          sendTx: consensus.sendRedeemTimeoutHtlcTransaction.bind(consensus),
          /**
           * Sends a transaction redeeming a timeout HTLC contract to the network and waits for confirmation
           */
          sendSyncTx: consensus.sendSyncRedeemTimeoutHtlcTransaction.bind(
            consensus
          )
        },
        earlyTx: {
          /**
           * Returns a serialized transaction redeeming an early HTLC contract
           */
          createTx: consensus.createRedeemEarlyHtlcTransaction.bind(consensus),
          /**
           * Sends a transaction redeeming an early HTLC contract to the network
           */
          sendTx: consensus.sendRedeemEarlyHtlcTransaction.bind(consensus),
          /**
           * Sends a transaction redeeming an early HTLC contract to the network and waits for confirmation
           */
          sendSyncTx: consensus.sendSyncRedeemEarlyHtlcTransaction.bind(
            consensus
          )
        }
      }
    };
    this.stakes = {
      new: {
        /**
         * Returns a serialized transaction creating a new stake contract
         */
        createTx: consensus.createStakeTransaction.bind(consensus),
        /**
         * Sends a transaction creating a new stake contract to the network
         */
        sendTx: consensus.sendStakeTransaction.bind(consensus),
        /**
         * Sends a transaction creating a new stake contract to the network and waits for confirmation
         */
        sendSyncTx: consensus.sendSyncStakeTransaction.bind(consensus)
      }
    };
    this.staker = {
      /**
       * Fetches the stakers given the batch number.
       */
      fromValidator: blockchain.getValidatorByAddress.bind(blockchain),
      /**
       * Fetches the staker given the address.
       */
      getByAddress: blockchain.getStakerByAddress.bind(blockchain),
      new: {
        /**
         * Creates a new staker transaction
         */
        createTx: consensus.createNewStakerTransaction.bind(consensus),
        /**
         * Sends a new staker transaction
         */
        sendTx: consensus.sendNewStakerTransaction.bind(consensus),
        /**
         * Sends a new staker transaction and waits for confirmation
         */
        sendSyncTx: consensus.sendSyncNewStakerTransaction.bind(consensus)
      },
      update: {
        /**
         * Creates a new staker transaction
         */
        createTx: consensus.createUpdateStakerTransaction.bind(consensus),
        /**
         * Sends a new staker transaction
         */
        sendTx: consensus.sendUpdateStakerTransaction.bind(consensus),
        /**
         * Sends a new staker transaction and waits for confirmation
         */
        sendSyncTx: consensus.sendSyncUpdateStakerTransaction.bind(consensus)
      }
    };
    this.inherent = {
      /**
       * Fetches the inherents given the batch number.
       */
      getByBatch: blockchain.getInherentsByBatchNumber.bind(blockchain),
      /**
       * Fetches the inherents given the block number.
       */
      getByBlock: blockchain.getInherentsByBlockNumber.bind(blockchain)
    };
    this.account = {
      /**
       * Tries to fetch the account at the given address.
       */
      getByAddress: blockchain.getAccountByAddress.bind(blockchain),
      /**
       * Fetches the account given the address.
       */
      importRawKey: wallet.importRawKey.bind(wallet),
      /**
       * Fetches the account given the address.
       */
      new: wallet.createAccount.bind(wallet),
      /**
       * Returns a boolean indicating whether the account is imported or not.
       */
      isImported: wallet.isAccountImported.bind(wallet),
      /**
       * Returns a list of all accounts.
       */
      list: wallet.listAccounts.bind(wallet),
      /**
       * Locks the account at the given address.
       */
      lock: wallet.lockAccount.bind(wallet),
      /**
       * Unlocks the account at the given address.
       */
      unlock: wallet.unlockAccount.bind(wallet),
      /**
       * Returns a boolean indicating whether the account is locked or not.
       */
      isLocked: wallet.isAccountLocked.bind(wallet),
      /**
       * Signs the given data with the account at the given address.
       */
      sign: wallet.sign.bind(wallet),
      /**
       * Verifies the given signature with the account at the given address.
       */
      verify: wallet.verifySignature.bind(wallet)
    };
    this.validator = {
      /**
       * Tries to fetch a validator information given its address. It has an option to include a map
       * containing the addresses and stakes of all the stakers that are delegating to the validator.
       */
      byAddress: blockchain.getValidatorByAddress.bind(blockchain),
      /**
       * Updates the configuration setting to automatically reactivate our validator
       */
      setAutomaticReactivation: validator_.setAutomaticReactivation.bind(
        validator_
      ),
      /**
       * Returns the information of the validator running on the node
       */
      selfNode: {
        /**
         * Returns our validator address.
         */
        address: validator_.getAddress.bind(blockchain),
        /**
         * Returns our validator signing key.
         */
        signingKey: validator_.getSigningKey.bind(blockchain),
        /**
         * Returns our validator voting key.
         */
        votingKey: validator_.getVotingKey.bind(blockchain)
      },
      /**
       * Returns a collection of the currently active validator's addresses and balances.
       */
      activeList: blockchain.getActiveValidators.bind(blockchain),
      action: {
        new: {
          /**
           * Returns a serialized `new_validator` transaction. You need to provide the address of a basic
           * account (the sender wallet) to pay the transaction fee and the validator deposit.
           * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
           * have a double Option. So we use the following work-around for the signal data:
           * "" = Set the signal data field to None.
           * "0x29a4b..." = Set the signal data field to Some(0x29a4b...).
           */
          createTx: consensus.createNewValidatorTransaction.bind(consensus),
          /**
           * Sends a `new_validator` transaction. You need to provide the address of a basic
           * account (the sender wallet) to pay the transaction fee and the validator deposit.
           * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
           * have a double Option. So we use the following work-around for the signal data:
           * "" = Set the signal data field to None.
           * "0x29a4b..." = Set the signal data field to Some(0x29a4b...).
           */
          sendTx: consensus.sendNewValidatorTransaction.bind(consensus),
          /**
           * Sends a `new_validator` transaction. You need to provide the address of a basic
           * account (the sender wallet) to pay the transaction fee and the validator deposit
           * and waits for confirmation.
           * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
           * have a double Option. So we use the following work-around for the signal data:
           * "" = Set the signal data field to None.
           * "0x29a4b..." = Set the signal data field to Some(0x29a4b...).
           */
          sendSyncTx: consensus.sendSyncNewValidatorTransaction.bind(consensus)
        },
        update: {
          /**
           * Returns a serialized `update_validator` transaction. You need to provide the address of a basic
           * account (the sender wallet) to pay the transaction fee.
           * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
           * have a double Option. So we use the following work-around for the signal data:
           * null = No change in the signal data field.
           * "" = Change the signal data field to None.
           * "0x29a4b..." = Change the signal data field to Some(0x29a4b...).
           */
          createTx: consensus.createUpdateValidatorTransaction.bind(consensus),
          /**
           * Sends a `update_validator` transaction. You need to provide the address of a basic
           * account (the sender wallet) to pay the transaction fee.
           * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
           * have a double Option. So we use the following work-around for the signal data:
           * null = No change in the signal data field.
           * "" = Change the signal data field to None.
           * "0x29a4b..." = Change the signal data field to Some(0x29a4b...).
           */
          sendTx: consensus.sendUpdateValidatorTransaction.bind(consensus),
          /**
           * Sends a `update_validator` transaction. You need to provide the address of a basic
           * account (the sender wallet) to pay the transaction fee and waits for confirmation.
           * Since JSON doesn't have a primitive for Option (it just has the null primitive), we can't
           * have a double Option. So we use the following work-around for the signal data:
           * null = No change in the signal data field.
           * "" = Change the signal data field to None.
           * "0x29a4b..." = Change the signal data field to Some(0x29a4b...).
           */
          sendSyncTx: consensus.sendSyncUpdateValidatorTransaction.bind(
            consensus
          )
        },
        deactivate: {
          /**
           * Returns a serialized `inactivate_validator` transaction. You need to provide the address of a basic
           * account (the sender wallet) to pay the transaction fee.
           */
          createTx: consensus.createDeactivateValidatorTransaction.bind(
            consensus
          ),
          /**
           * Sends a `inactivate_validator` transaction. You need to provide the address of a basic
           * account (the sender wallet) to pay the transaction fee.
           */
          sendTx: consensus.sendDeactivateValidatorTransaction.bind(consensus),
          /**
           * Sends a `inactivate_validator` transaction and waits for confirmation.
           * You need to provide the address of a basic account (the sender wallet)
           * to pay the transaction fee.
           */
          sendSyncTx: consensus.sendSyncDeactivateValidatorTransaction.bind(
            consensus
          )
        },
        reactivate: {
          /**
           * Returns a serialized `reactivate_validator` transaction. You need to provide the address of a basic
           * account (the sender wallet) to pay the transaction fee.
           */
          createTx: consensus.createReactivateValidatorTransaction.bind(
            consensus
          ),
          /**
           * Sends a `reactivate_validator` transaction. You need to provide the address of a basic
           * account (the sender wallet) to pay the transaction fee.
           */
          sendTx: consensus.sendReactivateValidatorTransaction.bind(consensus),
          /**
           * Sends a `reactivate_validator` transaction and waits for confirmation.
           * You need to provide the address of a basic account (the sender wallet)
           * to pay the transaction fee.
           */
          sendSyncTx: consensus.sendSyncReactivateValidatorTransaction.bind(
            consensus
          )
        },
        unpark: {
          /**
           * Returns a serialized `set_inactive_stake` transaction. You can pay the transaction fee from a basic
           * account (by providing the sender wallet) or from the staker account's balance (by not
           * providing a sender wallet).
           */
          createTx: consensus.createSetInactiveStakeTransaction.bind(consensus),
          /**
           * Sends a `set_inactive_stake` transaction. You can pay the transaction fee from a basic
           * account (by providing the sender wallet) or from the staker account's balance (by not
           * providing a sender wallet).
           */
          sendTx: consensus.sendSetInactiveStakeTransaction.bind(consensus),
          /**
           *  Sends a `set_inactive_stake` transaction. You can pay the transaction fee from a basic
           * account (by providing the sender wallet) or from the staker account's balance (by not
           * providing a sender wallet) and waits for confirmation.
           */
          sendSyncTx: consensus.sendSyncSetInactiveStakeTransaction.bind(
            consensus
          )
        },
        retire: {
          /**
           * Returns a serialized `retire_validator` transaction. You need to provide the address of a basic
           * account (the sender wallet) to pay the transaction fee.
           */
          createTx: consensus.createRetireValidatorTransaction.bind(consensus),
          /**
           * Sends a `retire_validator` transaction. You need to provide the address of a basic
           * account (the sender wallet) to pay the transaction fee.
           */
          sendTx: consensus.sendRetireValidatorTransaction.bind(consensus),
          /**
           * Sends a `retire_validator` transaction and waits for confirmation.
           * You need to provide the address of a basic account (the sender wallet)
           * to pay the transaction fee.
           */
          sendSyncTx: consensus.sendSyncRetireValidatorTransaction.bind(
            consensus
          )
        },
        delete: {
          /**
           * Returns a serialized `delete_validator` transaction. The transaction fee will be paid from the
           * validator deposit that is being returned.
           * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
           * Failed delete validator transactions can diminish the validator deposit
           */
          createTx: consensus.createDeleteValidatorTransaction.bind(consensus),
          /**
           * Sends a `delete_validator` transaction. The transaction fee will be paid from the
           * validator deposit that is being returned.
           * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
           * Failed delete validator transactions can diminish the validator deposit
           */
          sendTx: consensus.sendDeleteValidatorTransaction.bind(consensus),
          /**
           * Sends a `delete_validator` transaction and waits for confirmation.
           * The transaction fee will be paid from the validator deposit that is being returned.
           * Note in order for this transaction to be accepted fee + value should be equal to the validator deposit, which is not a fixed value:
           * Failed delete validator transactions can diminish the validator deposit
           */
          sendSyncTx: consensus.sendSyncDeleteValidatorTransaction.bind(
            consensus
          )
        }
      }
    };
    this.mempool = {
      /**
       * @returns
       */
      info: mempool.mempool.bind(mempool),
      /**
       * Content of the mempool
       *
       * @param includeTransactions
       * @returns
       */
      content: mempool.mempoolContent.bind(mempool)
    };
    this.peers = {
      /**
       * The peer ID for our local peer.
       */
      id: network.getPeerId.bind(network),
      /**
       * Returns the number of peers.
       */
      count: network.getPeerCount.bind(network),
      /**
       * Returns a list with the IDs of all our peers.
       */
      peers: network.getPeerList.bind(network),
      /**
       * Returns a boolean specifying if we have established consensus with the network
       */
      consensusEstablished: consensus.isConsensusEstablished.bind(network)
    };
    this.supply_at = policy.getSupplyAt.bind(policy);
    this.zeroKnowledgeProof = {
      /**
       * Returns the latest header number, block number and proof
       * @returns
       */
      state: zkpComponent.getZkpState.bind(zkpComponent)
    };
  }
  async init() {
    const result = await this.modules.policy.getPolicyConstants();
    if (result.error)
      return result.error;
    _Client.policy = result.data;
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
  async call(request, options = DEFAULT_OPTIONS) {
    return this.http.call(request, options);
  }
  /**
   * Make a raw streaming call to the Albatross Node.
   *
   * @param request
   * @param userOptions
   * @returns A promise that resolves with a Subscription object.
   */
  async subscribe(request, userOptions) {
    return this.ws.subscribe(request, userOptions);
  }
};
/**
 * Policy constants. Make sure to call `await client.init()` before using them.
 */
__publicField(_Client, "policy");
let Client = _Client;

exports.AccountType = AccountType;
exports.BlockType = BlockType;
exports.BlockchainClient = blockchain;
exports.BlockchainStream = blockchainStreams;
exports.Client = Client;
exports.ConsensusClient = consensus;
exports.DEFAULT_OPTIONS = DEFAULT_OPTIONS;
exports.DEFAULT_OPTIONS_SEND_TX = DEFAULT_OPTIONS_SEND_TX;
exports.DEFAULT_TIMEOUT_CONFIRMATION = DEFAULT_TIMEOUT_CONFIRMATION;
exports.HttpClient = HttpClient;
exports.LogType = LogType;
exports.MempoolClient = mempool;
exports.NetworkClient = network;
exports.PolicyClient = policy;
exports.ValidatorClient = validator;
exports.WS_DEFAULT_OPTIONS = WS_DEFAULT_OPTIONS;
exports.WalletClient = wallet;
exports.WebSocketClient = WebSocketClient;
exports.ZkpComponentClient = zkpComponent;
