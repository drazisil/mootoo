import { cp } from "fs"
import { readFile, stat } from "fs/promises"

/**
 * 
 * @returns {string[]}
 */
function getArgs() {
    const rawArgs = process.argv

    if (rawArgs.length < 3) {
        return []
    }
    return rawArgs.slice(2)
}

/**
 * 
 * @param {number} x 
 * @returns {number}
 */
function alignOnK(x) {
    const r = x % 1024

    return r > 0 ? x + 1024 - r : x
}

/**
 * 
 * @param {number} size 
 * @returns 
 */
function alloc(size) {
    return Buffer.alloc(size)
}

class SystemBus {}

class CPU {
    #registers
    /** @type {SystemBus | null} */
    #bus
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
        this.#kPanic = (msg) => {
            const e = new Error()
            e.name = 'KernelPanic'
            e.message = msg
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
    }

    dumpRegisters() {
        console.dir(this.#registers)
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
    
    const bufferSize = alignOnK(fileSize+1)
    
    const fileMemory = alloc(bufferSize)
    
    console.log(`Allocated ${fileMemory.length / 1024}kb to hold file`)

    const tmp = await readFile(filePath)

    if (tmp === null) {
        throw new Error('Error reading file!')
    }

    console.log('Copying file to memory...')

    tmp.copy(fileMemory)

    const cpu = new CPU()

    cpu.dumpRegisters()

    cpu.run()

    process.exitCode = 0

}

await main()