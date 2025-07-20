import { readFile, stat } from "fs/promises"
import { alignOnK, alloc, getArgs } from "./src/util.js"
import { SystemBus } from "./src/SystemBus.js"

/**
 * 
 */
class CPU {
    #registers
    /** @type {SystemBus | null} */
    #bus
    #kPrint
    #kFetch
    #kPanic

    constructor() {
        this.#registers = {
            IP: 0x0000
        }
        this.#bus = null

        /**
         * 
         * @param {string} msg 
         */
        this.#kPrint = (msg) => {
            console.log(`${Date.now()} [INFO] ${msg}`)
        }

        this.#kFetch = () => {
            if (this.#bus === null) {
                this.#kPanic('System Bus not connected!')
            }

            const byte = this.#bus.read(this.#registers.IP)

            if (byte instanceof Error) {
                this.#kPanic(`Error fetching byte at ${this.#registers.IP}}`, byte)
            }

            return byte
        }

        /**
         * 
         * @param {string} msg 
         * @param {Error} [cause]
        */
        this.#kPanic = (msg, cause = undefined) => {
            const e = new Error()
            e.name = 'KernelPanic'
            e.message = msg
            if (typeof cause !== "undefined") {
                e.cause = cause
            }
            throw e
        }
    }

    /**
     * 
     * @param {SystemBus} bus 
    */
    connectBus(bus) {
        this.#bus = bus
    }

    run() {
        if (this.#bus === null) {
            this.#kPanic('System bus not connected!')
        }

        this.#kPrint('system START')

        let byte = this.#kFetch()

        this.#kPrint(byte.toString(16))

        this.#kPanic('System STOP')
    }

    dumpRegisters() {
        console.dir(this.#registers)
    }

    dumpState() {
        return {
            bus: this.#bus === null ? "NOT connected" : "Connected"
        }
    }

}

async function main() {
    process.exitCode = -1

    const args = getArgs()

    const filePath = args[0]

    console.log(filePath)

    const file = await stat(filePath)

    const fileSize = file.size

    console.dir(`File size: ${fileSize}`)

    console.log('Allocating memory to hold file...')

    const bufferSize = alignOnK(fileSize + 1)

    const fileMemory = alloc(bufferSize)

    console.log(`Allocated ${fileMemory.length / 1024}kb to hold file`)

    const tmp = await readFile(filePath)

    if (tmp === null) {
        throw new Error('Error reading file!')
    }

    console.log('Copying file to memory...')

    tmp.copy(fileMemory)

    const bus = new SystemBus()

    bus.connectMemory(fileMemory)

    const cpu = new CPU()
    cpu.connectBus(bus)

    cpu.dumpRegisters()

    try {
        cpu.run()
        process.exitCode = 0
    } catch (e) {
        console.log(e)
    }



}

await main()