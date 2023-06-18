import Dexie from "dexie"

const db = new Dexie("timer-database");

db.version(1).stores({
  timers: "++id"
})

export default db