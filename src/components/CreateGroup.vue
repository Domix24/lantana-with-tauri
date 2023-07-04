<script setup lang="ts">
import { Modal } from 'bootstrap';
import { Ref, onMounted, ref } from 'vue';
import { timerDatabase } from '../database';
import { ITimer, createEmptyTimer } from '../types/ITimer'
import { IGroup } from '../types/IGroup';

let modalWindowObject: Modal
const timers: Ref<ITimer[]> = ref([])
const modalWindow: Ref<HTMLDivElement> = ref({} as HTMLDivElement)
const formElement: Ref<HTMLFormElement> = ref({} as HTMLFormElement)
const submitElement: Ref<HTMLButtonElement> = ref({} as HTMLButtonElement)

const props = defineProps<{ group: IGroup }>()
const emits = defineEmits<{(event: 'update:group', group: IGroup): void, (event: 'closed'): void, (event: 'deleted', id: number): void}>()

//====================

const add: () => void = () => {
  props.group.timers.push(createEmptyTimer())
}

const remove: (index: number) => void = index => {
  props.group.timers.splice(index, 1)
}

const handleDelete: () => void = () => {
  modalWindowObject.hide()
  emits("deleted", props.group.id)
}

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
        timers.value.push(timer as ITimer)
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
              <div class="col-12 position-relative" v-if="group.timers.length === 0">
                <button type="button" class="btn btn-secondary" @click="add()">Add new <em>Timer</em></button>
              </div>
              <table class="table table-striped" v-else>
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
                        <option v-for="timer in timers" :label="'#' + timer.id + ' (' + timer.title + ')'" :value="timer"></option>
                      </select>
                    </td>
                    <td class="align-middle col-3">
                      <div style="justify-content: center;" class="d-flex gap-1">
                        <button type="button" class="btn btn-secondary px-2" @click="add()">+</button>
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