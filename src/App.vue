<script setup lang="ts">
import { Ref, onMounted, ref, watch } from 'vue';
import Timer from './components/Timer.vue'
import { ITimer, createTimer } from './types/ITimer'
import { Modal } from 'bootstrap'

let oTimers: ITimer[] = []
let oDisabled: Ref<boolean>[] = []
let oStyleUPD: Ref<boolean>[] = []
let oTimerDisabledA: Ref<boolean>[] = []
let oIndexes: number[] = []
let oIds: string[] = []
let interval: NodeJS.Timer
let modalWindowObject: Modal
const isFocused: Ref<boolean> = ref(true)
const modalWindow: Ref<Element> = ref({} as Element)
const modalContent: Ref<Element> = ref({} as Element)

//====================

const pushTo: (timer: ITimer) => void = timer => {
  oTimers.push(timer)
  oIndexes.push(timer.id)
  oDisabled.push(ref(false))
  oStyleUPD.push(ref(false))
  oTimerDisabledA.push(ref(false))
  oIds.push("timerid" + timer.id)
}

const toggleTimers: (active: boolean, timerId: number) => void = (active, timerId) => {
  oIndexes.filter(x => x != timerId).forEach(x => {
    oTimerDisabledA[x].value = !active
    oDisabled[x].value = !active
  })
}

const handleTimerStarted = (timer: ITimer) => {
  oTimerDisabledA[timer.id].value = false
  oDisabled[timer.id].value = false
  toggleTimers(false, timer.id)
}

const handleTimerStopped = (timer: ITimer, finished: boolean) => {
  if (finished) {
    let elapsed = 0

    modalContent.value.innerHTML = document.getElementById(oIds[timer.id])?.outerHTML + ""
    modalContent.value.firstElementChild?.classList.remove("d-none")
    modalWindowObject.show()

    interval = setInterval(() => {
      if (elapsed % 2 === 0) {
        document.title = "**** TIMER ENDED ****"
        oStyleUPD[timer.id].value = true
      } else if (elapsed % 2 === 1) {
        document.title = "**** " + String(timer.hour).padStart(2, "0") + ":" + String(timer.minute).padStart(2, "0") + ":" + String(timer.second).padStart(2, "0") + " ****"
        oStyleUPD[timer.id].value = false
      }

      elapsed = (elapsed + 1) % 2
    }, 1000)
  } else {
    toggleTimers(true, timer.id)
  }
}

const processResetTimers = () => {
    clearInterval(interval)
    document.title = "Timer App"
    toggleTimers(true, -1)
    oIndexes.forEach(x => {
      oStyleUPD[x].value = false
    })
}

//====================

pushTo(createTimer(0, 0, 10, 0, "First Title", true, 50))
pushTo(createTimer(1, 0, 45, 0, "Second Title", true))
pushTo(createTimer(2, 0, 30, 0, "Third Title", true, 10))

//====================

window.addEventListener("focus", function() {
  isFocused.value = true
})

window.addEventListener("blur", function() {
  isFocused.value = false
})

//====================

watch(isFocused, (val) => {
  if (val) {
    processResetTimers()
  } else {

  }
})

//====================

onMounted(() => {
  if (modalWindow.value) {
    modalWindow.value.addEventListener("hide.bs.modal", () => { processResetTimers() })  

    modalWindowObject = new Modal(modalWindow.value)
  }
})
</script>

<template>
  <main>
    <div class="px-4 py-5 my-5 text-center">
      <img class="d-block mx-auto mb-4" src="/logo.svg" width="72" height="74">
      <h1 class="display-5 fw-bold text-body-emphasis">@domix24</h1>
      <div class="col-lg-6 mx-auto">
        <p class="lead mb-4">List of <em>Timers</em></p>
        <div class="gap-2 justify-content-sm-center d-none"> <!-- d-grid d-sm-flex -->
          <button type="button" class="btn btn-primary btn-lg px-4 gap-3">Add new</button>
        </div>
      </div>
    </div>
    <div class="px-4 py-4 my-5">
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div class="col" v-for="index in oIndexes">
          <Timer :object="oTimers[index]" :disabled="oDisabled[index].value" :style-updated="oStyleUPD[index].value" :timer-disabled="oTimerDisabledA[index].value" :id-text="oIds[index]" @timer-started="handleTimerStarted" @timer-stopped="handleTimerStopped" />
        </div>
      </div>
    </div>
  </main>
  <div class="modal fade" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" ref="modalWindow">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="exampleModalLabel">Timer Finished</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body" ref="modalContent">
        </div>
      </div>
    </div>
  </div>
</template>
