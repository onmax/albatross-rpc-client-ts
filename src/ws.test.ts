// import { http, ws } from 'msw'
// import { setupServer } from 'msw/node'
// import { NimiqRPCClient } from 'src'
// import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

// const client = new NimiqRPCClient('http://localhost:8648')
// client.ws.url.pathname = '/'

// const api = ws.link(client.ws.url.href)

// export const handlers = [
//   http.get('http://localhost:8648/', ({ request }) => {
//     console.log('Intercepted a request:', request.method, request.url)
//   }),
//   http.post('http://localhost:8648/', ({ request }) => {
//     console.log('Intercepted a request:', request.method, request.url)
//   }),
//   // http.all('*', (req, res) => {
//   //   console.log('Intercepted a request:', req.method, req.url)
//   //   return res(req.body)
//   // }),
//   api.addEventListener('connection', ({ client }) => {
//     console.log('Intercepted a WebSocket connection:', client.url)
//   }),
//   api.addEventListener('connection', ({ client }) => {
//     console.log('Intercepted a WebSocket connection:', client.url)
//   }),
// ]
// const server = setupServer(...handlers)

// beforeAll(() => server.listen())
// afterEach(() => server.resetHandlers())
// afterAll(() => server.close())

// describe('test for subscriptions with mock web socket', async () => {
//   it('subscribe to hash blocks', async () => {
//     const { data } = await client.policy.getPolicyConstants()
//     const { next, close } = await client.blockchainStreams.subscribeForBlockHashes()

//     next(({ data }) => {
//       expect(data).toBe('test-hash')
//       //   close()
//     })

//     // open-rpc message from server
//     // server.send({ data: 'test-hash' })
//   })
// })
