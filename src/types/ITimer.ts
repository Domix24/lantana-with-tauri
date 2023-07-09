export interface IDisplay {
  hours: number,
  minutes: number,
  seconds: number
}

export interface IUpdateFunction {
  (newTime: number, display: IDisplay): void
}

export interface IScheduled {
  start: Date,
  end: Date,
  update: IUpdateFunction,
}

export interface ICountdown {
  elapsed: number,
  active: boolean
}

export interface ITimerIncrement {
  active: boolean,
  increment: number,
}

export interface IDexieTimer {
  active: boolean,
  minute: number,
  hour: number,
  second: number,
  title: string,
  timerIncrement: ITimerIncrement,
}

export interface IDexieTimerWithId extends IDexieTimer {
  id: number
}

export interface ITimer extends IDexieTimerWithId {
  scheduled: IScheduled,
  countdown: ICountdown
}

interface IChoice {
  DexieTimer: IDexieTimer,
  Timer: ITimer
} 

const _hiddenCreateTimer: (active: boolean, hour: number, id: number, minute: number, second: number, timerIncrement: ITimerIncrement, title: string) => IChoice = (active, hour, id, minute, second, timerIncrement, title) => ({
  DexieTimer: {
    active,
    hour,
    minute,
    second,
    timerIncrement,
    title
  },
  Timer: {
    active,
    countdown: {
      active,
      elapsed: hour * 3600 + minute * 60 + second
    },
    hour,
    id,
    minute,
    scheduled: {
      end: new Date(),
      start: new Date(),
      update: function(newTime, display) {
        this.end.setTime(newTime)

        this.end.setHours(this.end.getHours() + display.hours)
        this.end.setMinutes(this.end.getMinutes() + display.minutes)
        this.end.setSeconds(this.end.getSeconds() + display.seconds)

        this.start = new Date(newTime)
      }
    },
    second,
    timerIncrement,
    title
  }  
})

export const createTimer: (active: boolean, hour: number, id: number, minute: number, second: number, timerIncrement: ITimerIncrement, title: string) => IChoice = (active, hour, id, minute, second, timerIncrement, title) => _hiddenCreateTimer(active, hour, id, minute, second, timerIncrement, title)

export const createEmptyTimer: () => ITimer = () => _hiddenCreateTimer(false, 0, 0, 0, 0, { active: false, increment: 0 }, "Empty").Timer

export const createEmptyDexieTimer: () => IDexieTimer = () => _hiddenCreateTimer(false, 0, 0, 0, 0, { active: false, increment: 0 }, "Empty").DexieTimer

export const timerToDB: (timer: ITimer) => IDexieTimerWithId = timer => ({
  active: timer.active,
  hour: timer.hour,
  id: timer.id,
  minute: timer.minute,
  second: timer.second,
  timerIncrement: timer.timerIncrement,
  title: timer.title,
})