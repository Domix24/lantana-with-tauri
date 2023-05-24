<script setup lang="ts">
import { computed } from 'vue';
import Timer from './components/Timer.vue'
import { ITimer } from './types/ITimer'

let oTimers: ITimer[] = []
oTimers.push({
  title: "First Title",
  active: true,
  hour: 0,
  minute: 0,
  second: 10,
  id: 0
})
oTimers.push({
  title: "Second Title",
  active: true,
  hour: 1,
  minute: 2,
  second: 3,
  id: 1
})
oTimers.push({
  title: "Third Title",
  active: true,
  hour: 10,
  minute: 20,
  second: 30,
  id: 2
})

const theTimers = computed(() => {
  let xTimers: ITimer[][] = []
  oTimers.map((value, index) => {
    if (index % 2 - 1) xTimers.push([value])
    else xTimers[Math.floor(index / 2)].push(value)
  })
  return xTimers
})

const handleTimerStarted = (timer: ITimer) => {
  console.log("timer-started", timer)
}

const handleTimerStopped = (timer: ITimer, finished: boolean) => {
  if (finished) {
    let elapsed = 30
    let interval = setInterval(() => {
      if (elapsed === 0) {
        document.title = "Timer App"
        clearInterval(interval)
      } else if (elapsed % 2 === 0)
        document.title = "**** TIMER ENDED ****"
      else if (elapsed % 2 === 1)
        document.title = "**** " + String(timer.hour).padStart(2, "0") + ":" + String(timer.minute).padStart(2, "0") + ":" + String(timer.second).padStart(2, "0") + " ****"
      elapsed--
    }, 500)
  }
  console.log("timer-stopped", timer, finished)
}
</script>

<template>
  <main>
    <div class="px-4 py-5 my-5 text-center">
      <img class="d-block mx-auto mb-4" src="/logo.svg" width="72" height="74">
      <h1 class="display-5 fw-bold text-body-emphasis">@domix24</h1>
      <div class="col-lg-6 mx-auto">
        <p class="lead mb-4">List of <em>Timers</em></p>
        <div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
          <button type="button" class="btn btn-primary btn-lg px-4 gap-3">Add new</button>
        </div>
      </div>
    </div>
    <div class="px-4 py-4 my-5" v-for="values in theTimers">
      <div class="row">
        <div class="col-6" v-for="timer in values">
          <Timer :object="timer" @timer-started="handleTimerStarted" @timer-stopped="handleTimerStopped" />
        </div>
      </div>
    </div>
  </main>
</template>
