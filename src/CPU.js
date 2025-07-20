import { SystemBus } from "./SystemBus.js";

/**
 *
 */
export class CPU {
    #registers;
    /** @type {SystemBus | null} */
    #bus;
    #kPrint;
    #kFetch;
    #kPanic;
    #clockSpeed
    #kClockCycle
    #clock
    #halted = true

    constructor() {
        this.#registers = {
            IP: 0x0000
        };
        this.#bus = null;
        this.#clock = 0
        this.#clockSpeed = 1000
        this.#halted = false

        this.#kClockCycle = () => {
            if (this.#halted) {
                return
            }
            this.#kPrint(`clock cycle: ${this.#clock}`)

            let byte = this.#kFetch();

            this.#kPrint(byte.toString(16));

            this.#registers.IP++


            this.#clock++

            const clockTick = this.#kClockCycle.bind(this)

            setTimeout(clockTick, this.#clockSpeed)
        }

        /**
         *
         * @param {string} msg
         */
        this.#kPrint = (msg) => {
            console.log(`${Date.now()} [INFO] ${msg}`);
        };

        this.kHalt = () => {
            this.#halted = true
            this.#kPrint('System STOP');
        }

        this.#kFetch = () => {
            if (this.#bus === null) {
                this.#kPanic('System Bus not connected!');
            }

            const byte = this.#bus.read(this.#registers.IP);

            if (byte instanceof Error) {
                this.#kPanic(`Error fetching byte at ${this.#registers.IP}}`, byte);
            }

            return byte;
        };

        /**
         *
         * @param {string} msg
         * @param {Error} [cause]
        */
        this.#kPanic = (msg, cause = undefined) => {
            const e = new Error();
            e.name = 'KernelPanic';
            e.message = msg;
            if (typeof cause !== "undefined") {
                e.cause = cause;
            }
            throw e;
        };
    }

    /**
     *
     * @param {SystemBus} bus
    */
    connectBus(bus) {
        this.#bus = bus;
    }

    run() {
        if (this.#bus === null) {
            this.#kPanic('System bus not connected!');
        }

        this.#kPrint('system START');


        // this.kHalt()

        this.#kClockCycle()

    }

    halt() {
        this.kHalt()
    }

    dumpRegisters() {
        console.dir(this.#registers);
    }

    dumpState() {
        return {
            bus: this.#bus === null ? "NOT connected" : "Connected"
        };
    }
}
