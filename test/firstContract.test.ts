import {FirstContract} from '../src';


import {Context} from 'fabric-contract-api';
import {ChaincodeStub} from 'fabric-shim-api';
import {anyOfClass, anyString, anything, deepEqual, instance, match, mock, verify, when} from 'ts-mockito';
import * as assert from 'assert';
import {FabricPeer} from './PeerProcess';
import {expect} from 'chai';


describe("Integration", () => {
    it("should install chain code successfully", async () => {
        await new FabricPeer().use(async (fabricPeer) => {

            await fabricPeer.createGenesisBlock()
            await fabricPeer.startOrderer()
            await fabricPeer.startNode()
            await fabricPeer.createAndJoinChannel()
            const chainCodeProcess = await fabricPeer.installChainCode()

            const installCompleted: Boolean = await chainCodeProcess
                .hasOutput('Successfully established communication with peer node. State transferred to "ready"')

            expect(installCompleted).to.eq(true)
        })
    }).timeout(30000)

    it("should invoke chaincode successfully", async () => {
        await new FabricPeer().use(async (fabricPeer) => {

            await fabricPeer.createGenesisBlock()
            await fabricPeer.startOrderer()
            await fabricPeer.startNode()
            await fabricPeer.createAndJoinChannel()
            const chainCodeProcess = await fabricPeer.installChainCode()
            await chainCodeProcess.waitForOutputMessage('Successfully established communication with peer node. State transferred to "ready"')
            const approved = await fabricPeer.approveChaincode()
            await approved.waitForStdErrMessage("committed with status (VALID)", 1, 60000)
            await approved.waitForStdErrMessage("approved & committed", 1, 60000)

            const invokeResult = await fabricPeer.invokeChaincode()
            const invokedSuccessfully = await invokeResult.hasStdErr("Chaincode invoke successful. result: status:200", 2)

            expect(invokedSuccessfully).to.be.true

        })
    }).timeout(60000)
})

describe("This is my test", () => {

    it('should create first successfully',async () => {
        const firstContract = new FirstContract()
        const mockContext = mock(Context)
        let mockedChaincodeStub: ChaincodeStub = mock<ChaincodeStub>();

        when(mockContext.stub).thenReturn(instance(mockedChaincodeStub))
        when(mockedChaincodeStub.putState(anyString(), anyOfClass(Buffer)))
            .thenResolve();

        const payload = "this is my first payload";
        await firstContract.createFirst(instance(mockContext), "1", payload)

        verify(mockedChaincodeStub.setEvent("PayloadUpdated", deepEqual(Buffer.from(payload))))
            .once()

        verify(mockedChaincodeStub.putState("1", deepEqual(Buffer.from(payload))))
            .once()
    })

    it('should read existing first successfully',async () => {
        const firstContract = new FirstContract()
        const mockContext = mock(Context)
        let mockedChaincodeStub: ChaincodeStub = mock<ChaincodeStub>();

        when(mockContext.stub).thenReturn(instance(mockedChaincodeStub))
        when(mockedChaincodeStub.getState("1"))
            .thenReturn(Promise.resolve(Buffer.from("this is the payload")))

        const result = await firstContract.readFirst(instance(mockContext), "1")
        assert.equal(result, "this is the payload");
    });
});