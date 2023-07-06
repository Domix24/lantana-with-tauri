import Dexie from "dexie"
import { IDexieGroup } from "../types/IGroup"

export class GroupDatabase extends Dexie {
    groups!: Dexie.Table<IDexieGroup, number>

    constructor () {
        super("group-database")

        this.version(1).stores({
            groups: "++id"
        })
    }
}

export const groupDatabase = new GroupDatabase()