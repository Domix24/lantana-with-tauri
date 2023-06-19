export interface ITimerIncrement {
  active: boolean,
  increment: number,
}

export interface ITimer {
  active: boolean,
  minute: number,
  hour: number,
  second: number,
  title: string,
  id: number,
  timerIncrement: ITimerIncrement,
}

export interface IDexieTimer {
  active: boolean,
  minute: number,
  hour: number,
  second: number,
  title: string,
  timerIncrement: ITimerIncrement,
}

const _hiddenCreateTimer: (id: number, hour: number, minute: number, second: number, title: string, isDexie: boolean, active?: boolean, timerIncrement?: number) => IDexieTimer | ITimer = (id, hour, minute, second, title, isDexie, active, timerIncrement) => {
  interface IScoped {
    active: boolean,
    minute: number,
    hour: number,
    second: number,
    title: string,
    id?: number
    timerIncrement: ITimerIncrement,
  }  
  
  let returnObj: IScoped = {
    active: active === undefined ? false : active,
    hour: hour,
    minute: minute,
    second: second,
    title: title,
    timerIncrement: {
      active: !(timerIncrement === undefined),
      increment: timerIncrement === undefined ? 0 : timerIncrement
    }
  }
  
  if (isDexie) {
    return returnObj as IDexieTimer
  } else {
    returnObj.id = id
    return returnObj as ITimer
  }
}

export const createTimer: (id: number, hour: number, minute: number, second: number, title: string, active?: boolean, timerIncrement?: number) => ITimer = (id, hour, minute, second, title, active, timerIncrement) => _hiddenCreateTimer(id, hour, minute, second, title, false, active, timerIncrement) as ITimer

export const createEmptyTimer: () => ITimer = () => _hiddenCreateTimer(0, 0, 0, 0, "Empty", false) as ITimer

export const createEmptyDexieTimer: () => IDexieTimer = () => _hiddenCreateTimer(0, 0, 0, 0, "Empty", true) as IDexieTimer