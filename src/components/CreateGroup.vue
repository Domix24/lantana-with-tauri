<script setup lang="ts">
import { Modal } from 'bootstrap';
import { Ref, onMounted, ref } from 'vue';
import { timerDatabase } from '../database';
import { ITimer, ITimerIncrement } from '../types/ITimer'
import { IGroup } from '../types/IGroup';

type IReset = "Origin" | "Normal" | "Progressive" | "Only"

interface ITimerOption {
  timer: ITimer,
  reset: IReset,
} 

let modalWindowObject: Modal
const timers: Ref<ITimerOption[]> = ref([])
const modalWindow: Ref<HTMLDivElement> = ref({} as HTMLDivElement)
const formElement: Ref<HTMLFormElement> = ref({} as HTMLFormElement)
const submitElement: Ref<HTMLButtonElement> = ref({} as HTMLButtonElement)

const props = defineProps<{ group: IGroup }>()
const emits = defineEmits<{(event: 'update:group', group: IGroup): void, (event: 'closed'): void, (event: 'deleted', id: number): void}>()

//====================

const remove: (index: number) => void = index => {
  props.group.timers.splice(index, 1)
}

const handleAdd: () => void = () => {
  props.group.timers.push(timers.value[0].timer.id+"")
}

const handleDelete: () => void = () => {
  modalWindowObject.hide()
  emits("deleted", props.group.id)
}

//====================

const appendReset: (reset: IReset) => { label: (increment: ITimerIncrement) => string, value: string } = reset => ({
  label: increment => {
    if (reset === "Normal") return " - back to last"
    else if (reset === "Only") return ""
    else if (reset === "Origin") return ""
    else /* if (reset === "Progressive") */ return ` - +${increment.increment}%`
  },
  value: (() => {
    if (reset === "Normal") return "!"
    else if (reset === "Only") return ""
    else if (reset === "Origin") return "*"
    else /* if (reset === "Progressive") */ return "+"
  })()
})

//====================

interface IUpDown1 {
  up: boolean,
  down: boolean
}

const showArrow: (index: number) => IUpDown1 = index => ({
  down: index + 1 < props.group.timers.length,
  up: index > 0
})

//====================

interface IUpDown2 {
  up: () => void,
  down: () => void
}

const swap: (index: number) => IUpDown2 = index => {
  const theswap = (index0: number, index1: number) => {
    const oldvalue = props.group.timers[index0]

    props.group.timers[index0] = props.group.timers[index1]
    props.group.timers[index1] = oldvalue
  }

  return {
    down: () => {
      theswap(index, index + 1)
    },
    up: () => {
      theswap(index, index - 1)
    }
  }
}

//====================

onMounted(() => {
    modalWindow.value.addEventListener("hide.bs.modal", () => { emits("closed") })

    modalWindowObject = new Modal(modalWindow.value)
    modalWindowObject.show()

    formElement.value.onsubmit = event => {
      event.preventDefault()
      event.stopPropagation()

      if (formElement.value.checkValidity()) {
        modalWindowObject.hide()
      }

      formElement.value.classList.add('was-validated')
    }

    submitElement.value.onclick = () => {
      formElement.value.requestSubmit()
    }

    timerDatabase.timers.orderBy("id").each(timer => {
      if (timer.timerIncrement.active) {
        timers.value.push({ timer: timer as ITimer, reset: "Origin" }) // 1
        timers.value.push({ timer: timer as ITimer, reset: "Normal" }) // 2
        timers.value.push({ timer: timer as ITimer, reset: "Progressive" }) // 3
      } else {
        timers.value.push({ timer: timer as ITimer, reset: "Only" }) // 1
      } 
    })
})
</script>

<template>
    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true" ref="modalWindow">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="staticBackdropLabel">#{{ group.id }}: Create new Group</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form class="row g-3 needs-validation" novalidate ref="formElement">
              <div class="col-12 position-relative">
                <label for="validationCustom01" class="form-label">Title</label>
                <input type="text" class="form-control" id="validationCustom01" required v-model="group.title">
                <div class="invalid-tooltip">Looks not good!</div>
              </div>
              <div class="col-12 position-relative" v-if="timers.length > 0">
                <button type="button" class="btn btn-secondary" @click="handleAdd()">Add new <em>Timer</em></button>
              </div>
              <table class="table table-striped" v-if="group.timers.length">
                <thead>
                  <tr>
                    <th scope="col" class="col-9">Timer</th>
                    <th scope="col" class="col-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(_timer, index) in group.timers">
                    <td class="align-middle col-9">
                      <select class="form-select" required v-model="group.timers[index]">
                        <option v-for="timer in timers" :label="timer.timer.title + appendReset(timer.reset).label(timer.timer.timerIncrement)" :value="timer.timer.id + '' + appendReset(timer.reset).value"></option>
                      </select>
                    </td>
                    <td class="align-middle col-3">
                      <div style="justify-content: center;" class="d-flex gap-1">
                        <button type="button" class="btn btn-danger px-2" @click="remove(index)">-</button>
                        <button type="button" :class="'btn btn-primary px-2' + (showArrow(index).down ? '' : ' invisible')" @click="swap(index).down">↡</button>
                        <button type="button" :class="'btn btn-primary px-2' + (showArrow(index).up ? '' : ' invisible')" @click="swap(index).up">↟</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-danger" @click="handleDelete">Delete</button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" ref="submitElement">Save</button>
          </div>
        </div>
      </div>
    </div>
  </template>