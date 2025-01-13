import { ws as _ws, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { NimiqRPCClient } from '../src'

const ws = _ws.link('ws://127.0.0.1:56789/')
const handlers = [
  http.all('*', ({ request, requestId }) => {
    console.log(`-> ${request.url}_______`)
    HttpResponse.json(requestId)
  }),
  ws.addEventListener('connection', ({ server }) => {
    console.log(`pepito ${server.socket.url}`)
  }),
]

const server = setupServer(...handlers)
const client = new NimiqRPCClient('http://127.0.0.1:56789/')
client.ws.url.pathname = '/'

beforeAll(() => {
  console.log('listening')
  server.listen()
})
afterEach(() => {
  client.ws.closeAll()
  server.resetHandlers()
})
afterAll(() => server.close())
describe('should subscribe and emit to each subscription method', () => {
  it('should subscribe to hashes', async () => {
    const hashes = ['hash-1', 'hash-2']
    console.log(`testing ${hashes}`)
    server.use(
      ws.addEventListener('connection', ({ client }) => {
        console.log('Connected!')
        hashes.forEach(h => client.send(h))
      }),
    )
    const { next, close } = await client.blockchainStreams.subscribeForBlockHashes()

    const receivedHashes: string[] = []
    next(({ data: hash }) => receivedHashes.push(hash!))

    // Wait for all expected hashes to be received
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (receivedHashes.length === hashes.length) {
          clearInterval(interval)
          resolve(undefined)
        }
      }, 50)
    })

    expect(receivedHashes).toEqual(hashes)
    close()
  })
})
