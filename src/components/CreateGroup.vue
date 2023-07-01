<script setup lang="ts">
import { Modal } from 'bootstrap';
import { Ref, onMounted, ref } from 'vue';
import { timerDatabase } from '../database';
import { ITimer } from '../types/ITimer';
import { IGroup } from '../types/IGroup';

let modalWindowObject: Modal
const group: Ref<IGroup> = ref({ active: false, id: 10, timers: [], title: "a title" } as IGroup)
const timers: Ref<ITimer[]> = ref([])
const modalWindow: Ref<HTMLDivElement> = ref({} as HTMLDivElement)
const formElement: Ref<HTMLFormElement> = ref({} as HTMLFormElement)
const submitElement: Ref<HTMLButtonElement> = ref({} as HTMLButtonElement)

//const props = defineProps<{ modelValue: IGroup }>()
const emits = defineEmits<{(event: 'update:modelValue', group: IGroup): void, (event: 'closed'): void}>()

//====================

const add: (index: number) => void = index => {
  group.value.timers.push(index)
}

const remove: (index: number) => void = index => {
  group.value.timers.splice(index, 1)
}

//====================

onMounted(() => {
    modalWindow.value.addEventListener("hide.bs.modal", () => { emits("closed") })

    modalWindowObject = new Modal(modalWindow.value)
    modalWindowObject.show()

    formElement.value.onsubmit = event => {
      event.preventDefault()
      event.stopPropagation()

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
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col" class="col-9">Timer</th>
                            <th scope="col" class="col-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(_timer, index) in group.timers">
                            <td class="align-middle col-9">
                                <select class="form-select" aria-label="Default select example" required>
                                    <option v-for="timer in timers" :label="'#' + timer.id + ' (' + timer.title + ')'" :value="timer.id"></option>
                                </select>
                            </td>
                            <td class="align-middle col-3">
                                <div style="justify-content: center;" class="d-flex gap-1">
                                    <button type="button" class="btn btn-secondary px-2" @click="add(index)">+</button>
                                    <button type="button" class="btn btn-danger px-2" @click="remove(index)">-</button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="group.timers.length === 0">
                            <td colspan="2">
                                <button type="button" class="btn btn-secondary px-2" @click="add(0)">+</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" ref="submitElement">Save</button>
          </div>
        </div>
      </div>
    </div>
  </template>