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

export const createTimer: (id: number, hour: number, minute: number, second: number, title: string, active?: boolean, timerIncrement?: number) => ITimer = (id, hour, minute, second, title, active, timerIncrement) => ({
  active: active === undefined ? false : active,
  hour: hour,
  id: id,
  minute: minute,
  second: second,
  title: title,
  timerIncrement: {
    active: !(timerIncrement === undefined),
    increment: timerIncrement === undefined ? 0 : timerIncrement
  }
})

export const createEmptyTimer: () => ITimer = () => createTimer(0, 0, 0, 0, "Empty")