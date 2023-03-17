import { Client } from ".";

function getClient() {
    const secret = process.env.NIMIQ_SECRET || '';
    const url = new URL(`https://seed1.v2.nimiq-testnet.com:8648/`);
    url.searchParams.append('secret', secret);
    return new Client(url)
}

async function main() {
    const client = getClient();
    const stakingContract = (await client.constant.params()).stakingContractAddress;
    const { next, close } = await client.logs.subscribe({ addresses: [stakingContract] });
    next((data) => {
        console.log(data);
    });
    setTimeout(() => {
        close();
    }, 100000);
}