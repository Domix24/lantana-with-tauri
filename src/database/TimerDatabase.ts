import Dexie from "dexie"
import { IDexieTimer } from "../types/ITimer"

export class TimerDatabase extends Dexie {
    timers!: Dexie.Table<IDexieTimer, number>

    constructor () {
        super("timer-database")

        this.version(1).stores({
            timers: "++id"
        })
    }
}

export const timerDatabase = new TimerDatabase()