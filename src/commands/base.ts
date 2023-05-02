import { Command, Flags, Interfaces } from '@oclif/core';
import { DEFAULT_OPTIONS } from 'client/http';
import { URL } from 'url';
import { DEFAULT_RPC_SERVER_URL } from '../index';


export type Flags<T extends typeof Command> = Interfaces.InferredFlags<typeof RpcCommand['baseFlags'] & T['flags']>
export type Args<T extends typeof Command> = Interfaces.InferredArgs<T['args']>

export abstract class RpcCommand<T extends typeof Command> extends Command {
    // define flags that can be inherited by any command that extends BaseCommand
    static baseFlags = {
        url: Flags.url({ char: 'u', description: 'RPC Server URL', default: new URL(DEFAULT_RPC_SERVER_URL), helpGroup: 'global' }),
        timeout: Flags.integer({ char: 't', description: 'Timeout in milliseconds', default: DEFAULT_OPTIONS.timeout, helpGroup: 'global' }),
    };

    protected flags!: Flags<T>
    protected args!: Args<T>

    public async init(): Promise<void> {
        await super.init()
        const { args, flags } = await this.parse({
            flags: this.ctor.flags,
            baseFlags: (super.ctor as typeof RpcCommand).baseFlags,
            args: this.ctor.args,
            strict: this.ctor.strict,
        })
        this.flags = flags as Flags<T>
        this.args = args as Args<T>
    }

    protected async catch(err: Error & { exitCode?: number }): Promise<any> {
        // add any custom logic to handle errors from the command
        // or simply return the parent class error handling
        return super.catch(err)
    }

    protected async finally(_: Error | undefined): Promise<any> {
        // called after run and catch regardless of whether or not the command errored
        return super.finally(_)
    }
}