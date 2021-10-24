
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';

@Info({title: 'FirstContract', description: 'Smart contract for the first'})
export class FirstContract extends Contract {

    constructor() {
        super("com.contracts.FirstContract");
    }

    @Transaction()
    public async initLedger(ctx: Context): Promise<void> {
        await ctx.stub.putState('123' , Buffer.from('{"docType":"string", id:"123", "payload":"hello init"}'));
    }

    @Transaction()
    public async createFirst(ctx: Context, id: string, payload: string): Promise<void> {
        let payloadBytes = Buffer.from(payload);
        await ctx.stub.putState(id, payloadBytes)
        ctx.stub.setEvent("PayloadUpdated", payloadBytes)
    }

    @Transaction(false)

    @Returns('string')
    public async readFirst(ctx: Context, id: string): Promise<String> {
        const state = await ctx.stub.getState(id)
        return state.toString()
    }
}