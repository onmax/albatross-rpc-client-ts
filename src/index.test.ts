import { describe, expect, it } from 'vitest';
import { Client } from '.';

describe('Should get Network policies', () => {
    it('should have data', async () => {
        const secret = process.env.NIMIQ_SECRET || '';
        const url = new URL(`https://seed1.v2.nimiq-testnet.com:8648/`);
        url.searchParams.append('secret', secret);
        const client = new Client(url)
        const validators = await client.validators.active();
        expect(validators).toHaveProperty(["data"])
    });
});