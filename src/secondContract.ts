
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';

@Info({title: 'SecondContract', description: 'Smart contract for the first'})
export class SecondContract extends Contract {

    @Transaction()
    public async CreateSecond(ctx: Context, id: string, payload: string): Promise<void> {
        let payloadBytes = Buffer.from(payload);
        await ctx.stub.putState(id, payloadBytes)
        ctx.stub.setEvent("PayloadUpdated", payloadBytes)
    }

    @Transaction(false)
    public async ReadSecond(ctx: Context, id: string): Promise<String> {
        const state = await ctx.stub.getState(id)
        return state.toString()
    }
}