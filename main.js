import { readFile, stat } from "fs/promises"
import { alignOnK, alloc, getArgs } from "./src/util.js"
import { SystemBus } from "./src/SystemBus.js"
import { CPU } from "./src/CPU.js"

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