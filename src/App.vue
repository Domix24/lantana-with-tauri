<script setup lang="ts">
import { ref } from 'vue';
import Timer from './components/Timer.vue'
import { ITimer, createTimer } from './types/ITimer'

let timerIndex: number = 0
let oTimers: ITimer[] = []
oTimers.push(createTimer(timerIndex++, 0, 0, 10, "First Title", true))
oTimers.push(createTimer(timerIndex++, 1, 2, 3, "Second Title", true))
oTimers.push(createTimer(timerIndex++, 10, 20, 30, "Third Title", true))

let oReactivity = [ref(0), ref(0), ref(0)]

let isFocused: boolean = true

const toggleTimers: (active: boolean, timer: ITimer) => void = (active, timer) => {
  oTimers.filter(x => x.id != timer.id).forEach(x => {
    x.active = active
    oReactivity[x.id].value = oReactivity[x.id].value + 1 % 2
  })
}

const handleTimerStarted = (timer: ITimer) => {
  timer.active = true
  toggleTimers(false, timer)
}

const handleTimerStopped = (timer: ITimer, finished: boolean) => {
  if (finished) {
    let elapsed = 0
    let interval = setInterval(() => {
      if (isFocused) {
        document.title = "Timer App"
        clearInterval(interval)
      } else if (elapsed % 2 === 0)
        document.title = "**** TIMER ENDED ****"
      else if (elapsed % 2 === 1)
        document.title = "**** " + String(timer.hour).padStart(2, "0") + ":" + String(timer.minute).padStart(2, "0") + ":" + String(timer.second).padStart(2, "0") + " ****"

      elapsed = (elapsed + 1) % 2
    }, 1000)
  } else {
    toggleTimers(true, timer)
  }
}

window.addEventListener("focus", function() {
  isFocused = true
})

window.addEventListener("blur", function() {
  isFocused = false
})

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
    <div class="px-4 py-4 my-5">
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div class="col" v-for="(timer, index) in oTimers">
          <Timer :object="timer" :key="oReactivity[index].value" @timer-started="handleTimerStarted" @timer-stopped="handleTimerStopped" />
        </div>
      </div>
    </div>
  </main>
</template>
