import { describe, expect, it } from 'vitest';
import { Client } from '.';

describe('Should get Network policies', () => {
    it('should have data', async () => {
        const secret = process.env.NIMIQ_SECRET;
        const client = new Client(`https://seed1.v2.nimiq-testnet.com:8648/?secret=${secret}`)
        const validators = await client.blockchain.getActiveValidators();
        expect(validators).toHaveProperty(["data"])
    });
});