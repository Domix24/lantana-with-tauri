<script setup lang="ts">
import { Ref, onMounted, ref, computed, watch, ComputedRef } from 'vue';
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
  getIndexFromId: (id: number) => number,
  handleEdit: (group: IGroup) => void,
  handleDelete: (id: number) => void,
  getGroups: ComputedRef<IGroup[]>
  delete: Ref<boolean[]>,
  list: Ref<IGroup[]>,
  pushTo: (group: IGroup) => void,
  anotherlist: IGroup[],
  visible: Ref<boolean>,
  reloadTable: () => void,
  handleStart: (group: IGroup) => void,
  handleStop: (group: IGroup) => void,
  current: {
    group: IGroup | undefined
    index: number
  }
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
const modalWindow: Ref<Element> = ref({} as Element)
const modalContent: Ref<Element> = ref({} as Element)
const editIndex: Ref<number> = ref(-1)
const valueTrue: boolean = true
const firstInit: Ref<boolean> = ref(false)
const timerAction: Ref<number[]> = ref([])

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
  timerAction.value.push(0)
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
  group.visible.value = false
}

const handleTimerDeleted = (timer: ITimer) => {
  oTimerDeleted.value[getIndexFromId(timer.id)] = true
  timerDatabase.timers.delete(timer.id)
  groupDatabase.groups.toArray().then(dexieGroups => {
    groupDatabase.groups.bulkPut(dexieGroups.filter(x => x.timers.includes(timer.id)).filter(x => x.timers = x.timers.filter(y => y != timer.id))).then(_x => group.reloadTable())
  })
}

const handleModalClosed = (type: string) => {
  if (type === "timer") {
    oShowTimer[editIndex.value].value = true
    timerDatabase.timers.put(oTimers[editIndex.value])
    editIndex.value = -1
    group.visible.value = true
  } else if (type === "group") {
    groupDatabase.groups.put(group.anotherlist[group.index.value])
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

const sendAction = (type: "start" | "stop" | "reset-origin" | "reset-normal" | "reset-progressive" | "reset-normal-start" | "reset-origin-start" | "reset-progressive-start", index: number) => {
  if (type === "start") {
    timerAction.value[index] = timerAction.value[index] === 10 ? 11 : 10
  } else if (type === "stop") {
    timerAction.value[index] = timerAction.value[index] === 12 ? 13 : 12
  } else if (type === "reset-origin") {
    timerAction.value[index] = timerAction.value[index] === 14 ? 15 : 14
  } else if (type === "reset-normal") {
    timerAction.value[index] = timerAction.value[index] === 16 ? 17 : 16
  } else if (type === "reset-progressive") {
    timerAction.value[index] = timerAction.value[index] === 18 ? 19 : 18
  } else if (type === "reset-origin-start") {
    timerAction.value[index] = timerAction.value[index] === 20 ? 21 : 20
  } else if (type === "reset-normal-start") {
    timerAction.value[index] = timerAction.value[index] === 22 ? 23 : 22
  } else if (type === "reset-progressive-start") {
    timerAction.value[index] = timerAction.value[index] === 24 ? 25 : 24
  }
}

group = {
  handleCreate: () => {
    let newGroup = createEmptyDexieGroup()
    groupDatabase.groups.add(newGroup).then(id => {
      group.pushTo(newGroup as IGroup)
      group.index.value = group.getIndexFromId(id)
    })
  },
  getIndexFromId: id => { 
    return group.list.value.map((value, index) => ({ value, index })).filter(x => x.value.id === id).at(0)!.index
  },
  handleEdit: xgroup => {
    group.index.value = group.getIndexFromId(xgroup.id)
  },
  handleDelete: id => {
    const index = group.getIndexFromId(id)
    groupDatabase.groups.delete(group.list.value[index].id).then(_value => {
      group.delete.value[index] = true
      group.index.value = -1
    })
  },
  pushTo: xgroup => {
    group.list.value.push(xgroup)
    group.delete.value.push(false)
    group.anotherlist.push(xgroup)
  },
  getGroups: computed(() => {
    return group.list.value.map((value, index) => ({ value, index })).filter(x => !group.delete.value[x.index]).map(x => x.value)
  }),
  reloadTable: () => {
    group.list.value = []
    group.anotherlist = []
    group.delete.value = [] 
    groupDatabase.groups.orderBy("id").each(xgroup => {
      group.pushTo(xgroup as IGroup)
    })
  },
  handleStart: xgroup => {
    if (!group.current.group) {
      group.current.index = 0
      group.current.group = xgroup
    } 
    sendAction("start", getIndexFromId(xgroup.timers[group.current.index]))
  },
  handleStop: xgroup => {
    sendAction("stop", getIndexFromId(xgroup.timers[group.current.index]))
  },
  index: ref(-1),
  delete: ref([]),
  list: ref([]),
  anotherlist: [],
  visible: ref(true),
  current: {
    group: undefined,
    index: 0
  } 
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

  group.reloadTable()

  firstInit.value = false
})

//====================

onMounted(() => {
  if (modalWindow.value) {
    modalWindow.value.addEventListener("hide.bs.modal", () => {
      processResetTimers()

      if (group.current.group) {
        group.current.index = (group.current.index + 1) % group.current.group.timers.length
        sendAction("reset-origin-start", getIndexFromId(group.current.group.timers[group.current.index]))
      }
    })  

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
          <Timer :object="oTimers[index]" :disabled="oDisabled[index].value" :style-updated="oStyleUPD[index].value" :timer-disabled="oTimerDisabledA[index].value" :id-text="oIds[index]" :timer-status="timerAction[index]" @timer-started="handleTimerStarted" @timer-stopped="handleTimerStopped" @timer-edit-started="handleTimerEditStarted" @timer-deleted="handleTimerDeleted" v-if="oShowTimer[index].value" />
          <Timer :disabled="valueTrue" :timer-disabled="valueTrue" v-else />
        </div>
      </div>
    </div>
    <div class="px-4 py-4 my-5" v-if="group.visible.value">
      <h1 class="display-5 fw-bold text-body-emphasis">Groups</h1>
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div class="col" v-for="xgroup in group.getGroups.value">
          <Group :group="xgroup" @edit="group.handleEdit(xgroup)" @start="group.handleStart" @stop="group.handleStop" />
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
  <CreateGroup v-model:group="group.list.value[group.index.value]" v-if="showGroupModal" @closed="handleModalClosed('group')" @deleted="group.handleDelete" />
</template>
