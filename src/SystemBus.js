export class SystemBus {
    /** @type {Buffer | null} */
    #memory;
    #mRead
    #mWrite

    constructor() {
        this.#memory = null;

        /**
         * Read a single byte
         * @param {number} address 
         * @returns 
         */
        this.#mRead = (address) => {
            if (this.#memory === null || this.#memory[address] === undefined) {
                return new Error(`Error reading address at ${address}`);
            }
            return this.#memory.readUInt8(address);
        }

        /**
         * Write a single byte
         * @param {number} address 
         * @param {number} src 
         */
        this.#mWrite = (address, src) => {
            if (this.#memory === null || this.#memory[address] === undefined) {
                return new Error(`Error writting address at ${address}`);
            }

            this.#memory.writeUInt8(src, address)

        }

    }

    
    /**
     *
     * @param {Buffer} memory
    */
   connectMemory(memory) {
       this.#memory = memory;
    }
    
    /**
     *
     * @param {number} address
     * @returns {Error | number}
    */
   read(address) {
       return this.#mRead(address)
    }

    /**
     * 
     * @param {number} destAddress 
     * @param {Buffer | number[]} src 
     * @param {number} [len] 
     */
    write(destAddress, src, len=1) {
        let inBuf;

        if (src instanceof Array) {
            inBuf = Buffer.from(src)
        } else {
            inBuf = src
        }

        for (let counter = 0; counter < len; counter++) {
            this.#mWrite(destAddress + counter, inBuf.readUInt8(counter))
        }
    }
}
