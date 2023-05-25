<script setup lang="ts">
import { Ref, ref } from 'vue';
import Timer from './components/Timer.vue'
import { ITimer, createTimer } from './types/ITimer'

let isFocused: boolean = true
let oTimers: ITimer[] = []
let oDisabled: Ref<boolean>[] = [ref(false), ref(false), ref(false)]
let oStyleUPD: Ref<boolean>[] = [ref(false), ref(false), ref(false)]
let oTimerDisabledA: Ref<boolean>[] = [ref(false), ref(false), ref(false)]
let oIndexes: number[] = []

//====================

const pushTo: (timer: ITimer) => void = timer => {
  oTimers.push(timer)
  oIndexes.push(timer.id)
}

const toggleTimers: (active: boolean, timer: ITimer) => void = (active, timer) => {
  oIndexes.filter(x => x != timer.id).forEach(x => {
    oTimerDisabledA[x].value = !active
    oDisabled[x].value = !active
  })
}

const handleTimerStarted = (timer: ITimer) => {
  oTimerDisabledA[timer.id].value = false
  oDisabled[timer.id].value = false
  toggleTimers(false, timer)
}

const handleTimerStopped = (timer: ITimer, finished: boolean) => {
  if (finished) {
    let elapsed = 0

    let interval = setInterval(() => {
      if (isFocused) {
        document.title = "Timer App"
        clearInterval(interval)
        oStyleUPD[timer.id].value = false
        toggleTimers(true, timer)
      } else if (elapsed % 2 === 0) {
        document.title = "**** TIMER ENDED ****"
        oStyleUPD[timer.id].value = true
      } else if (elapsed % 2 === 1) {
        document.title = "**** " + String(timer.hour).padStart(2, "0") + ":" + String(timer.minute).padStart(2, "0") + ":" + String(timer.second).padStart(2, "0") + " ****"
        oStyleUPD[timer.id].value = false
      }

      elapsed = (elapsed + 1) % 2
    }, 1000)
  } else {
    toggleTimers(true, timer)
  }
}

//====================

pushTo(createTimer(0, 0, 0, 10, "First Title", true))
pushTo(createTimer(1, 1, 2, 3, "Second Title", true))
pushTo(createTimer(2, 10, 20, 30, "Third Title", true))

//====================

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
        <div class="col" v-for="index in oIndexes">
          <Timer :object="oTimers[index]" :disabled="oDisabled[index].value" :style-updated="oStyleUPD[index].value" :timer-disabled="oTimerDisabledA[index].value" @timer-started="handleTimerStarted" @timer-stopped="handleTimerStopped" />
        </div>
      </div>
    </div>
  </main>
</template>
