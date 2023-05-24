export interface ITimer {
  active: boolean,
  minute: number,
  hour: number,
  second: number,
  title: string,
  id: number
}

export const createTimer: (id: number, hour: number, minute: number, second: number, title: string, active?: boolean) => ITimer = (id, hour, minute, second, title, active) => ({
  active: active === undefined ? false : active,
  hour: hour,
  id: id,
  minute: minute,
  second: second,
  title: title,
})

export const createEmptyTimer: () => ITimer = () => createTimer(0, 0, 0, 0, "Empty")