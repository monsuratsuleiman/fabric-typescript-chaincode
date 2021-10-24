import * as child_process from 'child_process';
import * as waitOn from 'wait-on';
import {ChildProcess} from 'child_process';
import * as fs from 'fs';

export class FabricPeer {
    processes: BackgroundProcess[] = [];
    private artifactsDirectory = "chain-artifacts"

    async use(callback: (peer: FabricPeer) => void) {
        process.on("SIGINT", this.killAllChildProcess)
        process.on("SIGTERM", this.killAllChildProcess)

        try {
            fs.rmSync(this.artifactsDirectory, {recursive: true, force: true})
            await callback(this)
        } finally {
            this.killAllChildProcess()
        }
    }

    killAllChildProcess() {
        if(this.processes) {
            this.processes.forEach((childProcess) => {
                childProcess.kill()
            })

            this.processes.length = 0
        }
    }

    async startNode(): Promise<BackgroundProcess> {
        return this.runScript('./scripts/start-peer.sh', ['tcp:localhost:7051', 'tcp:localhost:7052', 'tcp:127.0.0.1:9445'])
    }

    installChainCode(): Promise<BackgroundProcess> {
        return this.runScript("./scripts/install-chaincode.sh", [])
    }

    invokeChaincode(): Promise<BackgroundProcess> {
        return this.runScript("./scripts/invoke-chaincode.sh", [])
    }

    createGenesisBlock(): Promise<string>  {
        return this.runScriptSync("./scripts/create-genesisblock.sh", [`${this.artifactsDirectory}/genesisblock`])
    }

    approveChaincode(): Promise<BackgroundProcess>  {
        return this.runScript("./scripts/approve-chaincode.sh", [])
    }

    createAndJoinChannel(): Promise<Boolean> {
        return this.runScriptSync("./scripts/create-and-join-channel.sh", [])
            .then((result) => {
                if(result.lastIndexOf("joined channel") >= 0) {
                    return Promise.resolve(true)
                } else {
                    throw new Error("Error occurred while creating a channel")
                }
            })
    }

    sleep(){
        child_process.spawnSync("sh", ['-c', 'sleep 300s'])
    }

    async startOrderer(): Promise<BackgroundProcess> {
        return await this.runScript("./scripts/start-orderer.sh", ["tcp:localhost:7050","tcp:localhost:9443"])
    }

    async runScript(scriptPath: string, waitFor: Array<string>): Promise<BackgroundProcess> {
        const backgroundProcess = new BackgroundProcess(scriptPath, waitFor);
        this.processes.push(backgroundProcess)
        return backgroundProcess.run()
    }

    async runScriptSync(scriptPath: string, waitFor: Array<string>): Promise<string> {
        const result = child_process.spawnSync(scriptPath, {shell:true})
        if(result.error) {
            console.log(`${scriptPath}:${result.error.message}`)
            return Promise.reject(result.error.toString())
        }

        if(result.stdout) {
            console.log(`${scriptPath}:${result.stdout.toString()}`)
            return Promise.resolve(result.stdout.toString())
        }

        if(result.stderr) {
            const strErrMessage = result.stderr.toString();
            if (strErrMessage.lastIndexOf("ERROR") >= 0) {
                console.error(`${scriptPath}:${strErrMessage}`)
                return Promise.reject(strErrMessage)
            } else {
                console.log(`${scriptPath}:${strErrMessage}`)
                return Promise.resolve(strErrMessage)
            }
        }

        if(waitFor.length > 0) {
            await waitOn({resources: waitFor, timeout: 10000})
        }

       return Promise.resolve("")
    }
}

class BackgroundProcess {
    private childProcess: ChildProcess
    private readonly errors: Array<Error> = []
    private readonly stderr: Array<string> = []
    private readonly outputs: Array<string> = []

    constructor(private readonly scriptPath: string,
                private readonly waitForResources: Array<string>){
    }

    async run(): Promise<BackgroundProcess> {
        this.childProcess = child_process.spawn(this.scriptPath, {shell: true, detached: true})

        this.childProcess.on("error", (error) => {
            console.error(`error: ${error.message}`)
            this.errors.push(error)
        });

        this.childProcess.on("close", (code) => {
            console.log(`${this.scriptPath}:Process Closed: ${this.scriptPath}`)
            if(code != 0) {
                this.errors.push(new Error(`Closed with error ${code}`))
            } else {
                console.log(`${this.scriptPath} completed`)
            }
        });

        this.childProcess.stderr.on("data", (data) => {
            const stringData = data.toString();
            this.stderr.push(stringData)
            if(stringData.lastIndexOf("ERROR") >= 0) {
                console.error(`${this.scriptPath}:${stringData}`)
            } else {
                console.log(`${this.scriptPath}:${stringData}`)
            }
        })

        this.childProcess.stdout.on("data", (data) => {
            this.outputs.push(data.toString())
            console.log(`${this.scriptPath}:${data.toString()}`)
        })

        try {
            if(this.waitForResources.length > 0) {
                await waitOn({resources: this.waitForResources, timeout: 60000})
                console.log(`****************************** found ${this.waitForResources} ******************`)
            }
            return Promise.resolve(this)
        } catch (e) {
            console.error(`${this.scriptPath}:Error ${e.message}`)
            return Promise.reject(new Error(`${this.scriptPath} Failed. ${e.message}`))
        }
    }

    kill() {
        if(this.childProcess) {
            this.childProcess.kill("SIGINT")
            this.childProcess.kill("SIGTERM")
        }
    }

    waitForStdErrMessage(message: string, occurrence: number = 1, timeout: number | null = null): Promise<BackgroundProcess> {
        const that = this
        return this.waitForMessage(() => that.stderr, message, occurrence, timeout)
    }

    waitForStdOutMessage(message: string, timeout: number | null = null): Promise<BackgroundProcess> {
        const that = this
        return this.waitForMessage(() => that.outputs, message, 1, timeout)
    }

    hasStdErr(message: string, minOccurrence: number = 1): Promise<Boolean> {
        return this.waitForStdErrMessage(message, minOccurrence)
            .then(() => true)
    }

    hasOutput(message: string): Promise<Boolean> {
        return this.waitForOutputMessage(message)
            .then(() => true)
    }

    waitForOutputMessage(message: string, timeout: number | null = null): Promise<BackgroundProcess> {
        const that = this
        return  this.waitForMessage(() => that.outputs, message, 1, timeout)
    }

    waitForMessage(messageProperty: () => Array<string>, message: string, minOccurrence: number, timeout: number | null = null): Promise<BackgroundProcess> {
        return new Promise((resolve, reject) => {
            let setTimeoutHandle: NodeJS.Timeout
            const messageChecker = setInterval(() => {
                let messages = messageProperty();
                let foundMessage = messages.filter((messageItem) => messageItem.lastIndexOf(message) >=0);
                if (foundMessage.length >= minOccurrence) {
                    if(setTimeoutHandle){
                        clearTimeout(setTimeoutHandle)
                        clearInterval(messageChecker)
                    }
                    resolve(this)
                }
            }, 1000)

            setTimeoutHandle = setTimeout(() => {
                clearInterval(messageChecker)
                reject()
            }, timeout || 20000)
        });
    }
}