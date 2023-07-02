<script setup lang="ts">
import { Ref, onMounted, ref, computed, watch } from 'vue';
import Timer from './components/Timer.vue'
import CreateTimer from './components/CreateTimer.vue'
import { IDexieTimer, ITimer, createEmptyDexieTimer } from './types/ITimer'
import { Modal } from 'bootstrap'
import { groupDatabase, timerDatabase } from './database'
import CreateGroup from './components/CreateGroup.vue'
import { IGroup, createEmptyDexieGroup } from './types/IGroup';
import Group from './components/Group.vue'

//====================

interface IIndexId {
  value: number,
  index: number
}

interface IPredicate {
    (indexId: IIndexId): boolean
}

interface IGroupObject {
  handleCreate: () => void,
  index: Ref<number>,
  getIndexFromId: (id: number) => number
}

//====================

let oTimers: ITimer[] = []
let oDisabled: Ref<boolean>[] = []
let oStyleUPD: Ref<boolean>[] = []
let oTimerDisabledA: Ref<boolean>[] = []
let oShowTimer: Ref<boolean>[] = []
let oIndexes: Ref<number[]> = ref([])
let oIds: string[] = []
let interval: NodeJS.Timer
let modalWindowObject: Modal
let oTimerDeleted: Ref<boolean[]> = ref([])
let titleInterval: NodeJS.Timer
let group: IGroupObject
const groups: Ref<IGroup[]> = ref([])
const modalWindow: Ref<Element> = ref({} as Element)
const modalContent: Ref<Element> = ref({} as Element)
const editIndex: Ref<number> = ref(-1)
const valueTrue: boolean = true
const firstInit: Ref<boolean> = ref(false)

//====================

const pushTo: (timer: ITimer) => void = timer => {
  oTimers.push(timer)
  oIndexes.value.push(timer.id)
  oDisabled.push(ref(false))
  oStyleUPD.push(ref(false))
  oTimerDisabledA.push(ref(false))
  oShowTimer.push(ref(true))
  oIds.push("timerid" + timer.id)
  oTimerDeleted.value.push(false)
}

const getIndexFromId: (id: number) => number = id => {
  return getIndexesFromPredicate(x => x.value === id)[0]
}

const getIndexesFromPredicate: (predicate: IPredicate) => number[] = predicate => {
  return oIndexes.value.map((value, index) => ({value, index})).filter(predicate).map(x => x.index)
}

const startTitleLoop = () => {
  let x = 0
  titleInterval = setInterval(() => {
    updateTitle(x)
    x = ++x % 4
  }, 1000)
}

const stopTitleLoop = () => {
  clearInterval(titleInterval)
  resetTitle()
}

const updateTitle = (index: number) => {
  let begin = "🕛"
  if (false) {}
  else if (index === 1) { begin = "🕒" }
  else if (index === 2) { begin = "🕕" }
  else if (index === 3) { begin = "🕘" }

  document.title = begin + " Lantana 🌼"
}

const resetTitle = () => {
  document.title = "Lantana 🌼"
}

const toggleTimers: (active: boolean, timerId: number) => void = (active, timerId) => {
  getIndexesFromPredicate(x => x.value != timerId).forEach(x => {
    oTimerDisabledA[x].value = !active
    oDisabled[x].value = !active
  })
}

const handleTimerStarted = (timer: ITimer) => {
  oTimerDisabledA[getIndexFromId(timer.id)].value = false
  oDisabled[getIndexFromId(timer.id)].value = false
  toggleTimers(false, timer.id)
  startTitleLoop()
}

const handleTimerStopped = (timer: ITimer, finished: boolean) => {
  if (finished) {
    let elapsed = 0

    modalContent.value.innerHTML = document.getElementById(oIds[getIndexFromId(timer.id)])?.outerHTML + ""
    modalContent.value.firstElementChild?.classList.remove("d-none")
    modalWindowObject.show()

    interval = setInterval(() => {
      if (elapsed % 2 === 0) {
        document.title = "**** TIMER ENDED ****"
        oStyleUPD[getIndexFromId(timer.id)].value = true
      } else if (elapsed % 2 === 1) {
        document.title = "**** " + String(timer.hour).padStart(2, "0") + ":" + String(timer.minute).padStart(2, "0") + ":" + String(timer.second).padStart(2, "0") + " ****"
        oStyleUPD[getIndexFromId(timer.id)].value = false
      }

      elapsed = (elapsed + 1) % 2
    }, 1000)
  } else {
    toggleTimers(true, timer.id)
  }
  stopTitleLoop()
}

const handleTimerEditStarted = (timer: ITimer) => {
  editIndex.value = getIndexFromId(timer.id)
  oShowTimer[editIndex.value].value = false
}

const handleTimerDeleted = (timer: ITimer) => {
  oTimerDeleted.value[getIndexFromId(timer.id)] = true
  timerDatabase.timers.delete(timer.id)
}

const handleModalClosed = (type: string) => {
  if (type === "timer") {
    oShowTimer[editIndex.value].value = true
    timerDatabase.timers.put(oTimers[editIndex.value])
    editIndex.value = -1
  } else if (type === "group") {
    group.index.value = -1
  }
}

const handleCreateTimer = () => {
  let newTimer = createEmptyDexieTimer()

  timerDatabase.timers.add(newTimer).then((_x: number) => {
    pushTo(newTimer as ITimer)
    handleTimerEditStarted(newTimer as ITimer)
  }).catch(console.error)
}

const processResetTimers = () => {
    clearInterval(interval)
    resetTitle()
    toggleTimers(true, -1)
    getIndexesFromPredicate(_x => true).forEach(x => {
      oStyleUPD[x].value = false
    })
}

group = {
  handleCreate: () => {
    let newGroup = createEmptyDexieGroup()
    groupDatabase.groups.add(newGroup).then(id => {
      groups.value.push(newGroup as IGroup)
      group.index.value = group.getIndexFromId(id)
    }).catch(console.error)
  },
  getIndexFromId: id => { 
    return groups.value.map((value, index) => ({ value, index })).filter(value => value.value.id === id).at(0)!.index
  },
  index: ref(-1)
}

//====================

const showEditModal = computed(() => {
  return editIndex.value > -1
})

const showGroupModal = computed(() => {
  return group.index.value > -1
})

const getIndexList = computed(() => {
  return getIndexesFromPredicate(x => !oTimerDeleted.value[x.index])
})

//====================

watch(firstInit, async () => {
  if (!firstInit.value) return
  
  await timerDatabase.timers.orderBy("id").each((x: IDexieTimer) => {
    pushTo(x as ITimer)
  })

  await groupDatabase.groups.orderBy("id").each(group => {
    groups.value.push(group as IGroup)
  })

  firstInit.value = false
})

//====================

onMounted(() => {
  if (modalWindow.value) {
    modalWindow.value.addEventListener("hide.bs.modal", () => { processResetTimers() })  

    modalWindowObject = new Modal(modalWindow.value)

    firstInit.value = true
  }
})
</script>

<template>
  <main>
    <div class="px-4 py-5 my-5 text-center">
      <img class="d-block mx-auto mb-4" src="/logo.svg" width="72" height="74">
      <h1 class="display-5 fw-bold text-body-emphasis">Lantana 🌼</h1>
      <div class="col-lg-6 mx-auto">
        <p class="lead mb-4">List of <em>Timers</em></p>
        <div class="gap-2 justify-content-sm-center d-grid d-sm-flex">
          <button type="button" class="btn btn-primary btn-lg px-4 gap-3" @click="handleCreateTimer">Add new <em>Timer</em></button>
          <button type="button" class="btn btn-primary btn-lg px-4 gap-3" @click="group.handleCreate">Add new <em>Group</em></button>
        </div>
      </div>
    </div>
    <div class="px-4 py-4 my-5">
      <h1 class="display-5 fw-bold text-body-emphasis">Timers</h1>
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div class="col" v-for="index in getIndexList">
          <Timer :object="oTimers[index]" :disabled="oDisabled[index].value" :style-updated="oStyleUPD[index].value" :timer-disabled="oTimerDisabledA[index].value" :id-text="oIds[index]" @timer-started="handleTimerStarted" @timer-stopped="handleTimerStopped" @timer-edit-started="handleTimerEditStarted" @timer-deleted="handleTimerDeleted" v-if="oShowTimer[index].value" />
          <Timer :disabled="valueTrue" :timer-disabled="valueTrue" v-else />
        </div>
      </div>
    </div>
    <div class="px-4 py-4 my-5">
      <h1 class="display-5 fw-bold text-body-emphasis">Groups</h1>
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div class="col" v-for="group in groups">
          <Group :group="group" />
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
  <CreateTimer v-model="oTimers[editIndex]" v-if="showEditModal" @closed="handleModalClosed('timer')" />
  <CreateGroup v-model:group="groups[group.index.value]" v-if="showGroupModal" @closed="handleModalClosed('group')" />
</template>
