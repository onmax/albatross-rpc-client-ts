import { describe, expect, it } from 'vitest';
import { Client } from '.';

function getClient() {
    const secret = process.env.NIMIQ_SECRET || '';
    const url = new URL(`https://seed1.v2.nimiq-testnet.com:8648/`);
    url.searchParams.append('secret', secret);
    return new Client(url)
}
// this.blocks = {
//     current: blockchain.getBlockNumber.bind(blockchain),
//     byHash: blockchain.getBlockByHash.bind(blockchain),
//     byNumber: blockchain.getBlockByNumber.bind(blockchain),
//     latest: blockchain.getLatestBlock.bind(blockchain),
//     election: {
//         after: policy.getElectionBlockAfter.bind(policy),
//         before: policy.getElectionBlockBefore.bind(policy),
//         last: policy.getLastElectionBlock.bind(policy),
//         get: policy.getElectionBlockOf.bind(policy),
//         subscribe: blockchain.subscribeForValidatorElectionByAddress.bind(blockchain),
//     },
//     isElection: policy.getIsElectionBlockAt.bind(policy),
//     macro: {
//         after: policy.getMacroBlockAfter.bind(policy),
//         before: policy.getMacroBlockBefore.bind(policy),
//         last: policy.getLastMacroBlock.bind(policy),
//         get: policy.getMacroBlockOf.bind(policy),
//     },
//     isMacro: policy.getIsMacroBlockAt.bind(policy),
//     isMicro: policy.getIsMicroBlockAt.bind(policy),
//     subscribe: blockchain.subscribeForBlocks.bind(blockchain),
// };
describe('Test for blocks module', async () => {
    const { blocks } = await getClient();
    const randomTxHash = await blocks.latest({ includeTransactions: true }).then((data) => data.transactions[0].hash);
    it('.current ok', async () => expect(await blocks.current()).toBeGreaterThanOrEqual(0));
    it('.byHash ok', async () => {

    });
    it('.byNumber ok', async () => expect(await blocks.byNumber({blockNumber: 1})).toContain('hash'));
    it('.byNumber ok with txs', async () => expect(await blocks.byNumber({ blockNumber: 1, includeTransactions: true })).toContain('transactions'));
    it('.latest ok', async () => expect(await blocks.latest({ includeTransactions: false })).toContain('hash'));
    it('.latest ok with txs', async () => expect(await blocks.latest({ includeTransactions: true })).toContain('transactions'));
});