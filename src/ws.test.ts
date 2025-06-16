import { describe, expect, it, vi } from 'vitest';
import { NimiqRPCClient, RetrieveType } from './index';

class MockWebSocket {
  public onmessage: ((this: MockWebSocket, ev: MessageEvent) => any) | null = null;
  public onopen: ((this: MockWebSocket, ev: Event) => any) | null = null;
  public onclose: ((this: MockWebSocket, ev: CloseEvent) => any) | null = null;
  public onerror: ((this: MockWebSocket, ev: Event) => any) | null = null;

  private readyState: number = MockWebSocket.CONNECTING;
  private messages: any[] = [];

  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  constructor() {
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) this.onopen(new Event('open'));
    }, 100);
  }

  send(data: any) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    this.messages.push(data);
    setTimeout(() => {
      if (this.onmessage) this.onmessage(new MessageEvent('message', { data }));
    }, 100);
  }

  close() {
    this.readyState = MockWebSocket.CLOSING;
    setTimeout(() => {
      this.readyState = MockWebSocket.CLOSED;
      if (this.onclose) this.onclose(new CloseEvent('close'));
    }, 100);
  }
}

class MockWebSocketServer {
  private clients: MockWebSocket[] = [];

  addClient(client: MockWebSocket) {
    this.clients.push(client);
  }

  broadcast(data: any) {
    this.clients.forEach(client => {
      if (client.readyState === MockWebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  closeAll() {
    this.clients.forEach(client => client.close());
  }
}

let client: NimiqRPCClient;
async function getClient() {
  if (client) return client;
  const url = new URL('ws://localhost:8648');
  client = new NimiqRPCClient(url);
  return client;
}

describe('test for subscriptions with mock web socket', async () => {
  const client = await getClient();
  const mockServer = new MockWebSocketServer();

  it('subscribe to new full blocks', async () => {
    const { next, close } = await client.blockchainStreams.subscribeForBlocks({ retrieve: RetrieveType.Full });
    let block: any;
    next(({ data }) => block = data);
    mockServer.broadcast({ transactions: [] });
    await vi.waitUntil(() => block !== undefined, { timeout: 10000 });
    expect(block).toHaveProperty('transactions');
    close();
  });

  it('subscribe to new partial blocks', async () => {
    const { next, close } = await client.blockchainStreams.subscribeForBlocks({ retrieve: RetrieveType.Partial });
    let block: any;
    next(({ data }) => block = data);
    mockServer.broadcast({ hash: 'test-hash' });
    await vi.waitUntil(() => block !== undefined, { timeout: 10000 });
    expect(block).toHaveProperty('hash');
    close();
  });

  it('subscribe to new hashes blocks', async () => {
    const { next, close } = await client.blockchainStreams.subscribeForBlockHashes();
    let hash: string | undefined;
    next(({ data }) => hash = data);
    mockServer.broadcast('test-hash');
    await vi.waitUntil(() => hash !== undefined, { timeout: 10000 });
    expect(hash).toBeTypeOf('string');
    close();
  });

  it('subscribe to new micro blocks', async () => {
    const { next, close } = await client.blockchainStreams.subscribeForMicroBlocks();
    let block: any;
    next(({ data }) => block = data);
    mockServer.broadcast({ hash: 'test-hash' });
    await vi.waitUntil(() => block !== undefined, { timeout: 10000 });
    expect(block).toHaveProperty('hash');
    close();
  });

  it('subscribe to new macro blocks', async () => {
    const { next, close } = await client.blockchainStreams.subscribeForMacroBlocks();
    let block: any;
    next(({ data }) => block = data);
    mockServer.broadcast({ hash: 'test-hash' });
    await vi.waitUntil(() => block !== undefined, { timeout: 65000 });
    expect(block).toHaveProperty('hash');
    close();
  }, 70000);

  it('subscribe to logs', async () => {
    const { next, close } = await client.blockchainStreams.subscribeForLogsByAddressesAndTypes();
    let log: any;
    next(({ data }) => log = data);
    mockServer.broadcast({ type: 'test-log' });
    await vi.waitUntil(() => log !== undefined, { timeout: 10000 });
    expect(log).toHaveProperty('type');
    close();
  });

  it('test autoConnect functionality', async () => {
    const { next, close } = await client.blockchainStreams.subscribeForBlocks({ retrieve: RetrieveType.Full, autoReconnect: true });
    let block: any;
    next(({ data }) => block = data);
    mockServer.broadcast({ transactions: [] });
    await vi.waitUntil(() => block !== undefined, { timeout: 10000 });
    expect(block).toHaveProperty('transactions');
    close();
  });
});
