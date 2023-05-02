import { Flags } from '@oclif/core'
import { RpcCommand } from 'commands/base'
import { BlockchainClient } from 'modules'

export default class BlockCurrent extends RpcCommand<typeof BlockCurrent> {
  static description = 'Get the current block number'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static commandFlags = {
    name: Flags.string({ char: 'n', description: 'Get the current block number' }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(BlockCurrent)
    const blockchain = new BlockchainClient(flags.url);
    const res = await blockchain.getBlockNumber({ timeout: flags.timeout })
    this.logJson(res.data)
  }
}
