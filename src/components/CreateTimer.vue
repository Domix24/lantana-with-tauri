<script setup lang="ts">
import { computed, reactive, ref, watch, Ref, onMounted } from 'vue'
import { ITimer, createEmptyTimer } from '../types/ITimer'
import { Modal } from 'bootstrap'

let modalWindowObject: Modal
const modalWindow: Ref<HTMLDivElement> = ref({} as HTMLDivElement)
const formElement: Ref<HTMLFormElement> = ref({} as HTMLFormElement)
const submitElement: Ref<HTMLButtonElement> = ref({} as HTMLButtonElement)

const active: ref<boolean> = ref(props.modelValue.timerIncrement.active)
const title: ref<string> = ref(props.modelValue.title)
const hours: ref<number> = ref(props.modelValue.hour)
const minutes: ref<number> = ref(props.modelValue.second)
const seconds: ref<number> = ref(props.modelValue.minute)

const inputTitle: ref<HTMLInputElement> = ref({} as HTMLInputElement)
const inputHours: ref<HTMLInputElement> = ref({} as HTMLInputElement)
const inputMinutes: ref<HTMLInputElement> = ref({} as HTMLInputElement)
const inputSeconds: ref<HTMLInputElement> = ref({} as HTMLInputElement)
const inputIncrement: ref<HTMLInputElement> = ref({} as HTMLInputElement)

const props = defineProps<{ modelValue: ITimer }>()
const emits = defineEmits<{(event: 'update:modelValue', timer: ITimer): void}>()

const handleChange = event => {
  active.value = !active.value
}

const checkedValue = computed(() => {
  return active.value ? "x" : undefined
})

const disabledValue = computed(() => {
  return active.value ? undefined : "x"
})

const timerHours = computed(() => {
  return parseInt(inputHours.value.value)
})

const timerMinutes = computed(() => {
  return parseInt(inputMinutes.value.value)
})

const timerSeconds = computed(() => {
  return parseInt(inputSeconds.value.value)
})

const timerIncrementActive = computed(() => {
  if (active.value) return true
  else if (isNaN(parseInt(inputIncrement.value.value))) return false
  else if (parseInt(inputIncrement.value.value)) return true
  else return false
})

const timerIncrementValue = computed(() => {
  console.log(parseInt(inputIncrement.value.value))
  if (isNaN(parseInt(inputIncrement.value.value))) return 0
  else return parseInt(inputIncrement.value.value)
})

onMounted(() => {
  if (modalWindow.value && formElement.value && submitElement.value) {
    modalWindow.value.addEventListener("hide.bs.modal", () => { })  

    modalWindowObject = new Modal(modalWindow.value)
    modalWindowObject.show()

    formElement.value.onsubmit = event => {
      event.preventDefault()
      event.stopPropagation()

      console.log(timerIncrementValue.value)
      console.log(inputIncrement.value.value)

      if (formElement.value.checkValidity()) {
        const updatedModel = createEmptyTimer()
        updatedModel.active = props.modelValue.active
        updatedModel.minute = timerMinutes.value
        updatedModel.hour = timerHours.value
        updatedModel.second = timerSeconds.value
        updatedModel.title = inputTitle.value.value
        updatedModel.id = props.modelValue.id
        updatedModel.timerIncrement.active = timerIncrementActive.value
        updatedModel.timerIncrement.increment = timerIncrementValue.value

        //console.log(props.modelValue)
        //console.log(updatedModel)

        //emits("update:modelValue", updatedModel)
      }

      formElement.value.classList.add('was-validated')
    }

    submitElement.value.onclick = () => {
      formElement.value.requestSubmit()
    }
  }
})
</script>

<template>
  <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true" ref="modalWindow">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="staticBackdropLabel">#{{ modelValue.id }}: Create new Timer</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form class="row g-3 needs-validation" novalidate ref="formElement">
            <div class="col-12 position-relative">
              <label for="validationCustom01" class="form-label">Title</label>
              <input type="text" class="form-control" id="validationCustom01" required :value="modelValue.title" ref="inputTitle">
              <div class="invalid-tooltip">Looks not good!</div>
            </div>
            <div class="col-4 position-relative">
              <label for="validationCustom02" class="form-label">Hours</label>
              <input type="number" class="form-control" id="validationCustom02" required min="0" max="99" :value="modelValue.hour" ref="inputHours">
              <div class="invalid-tooltip">Looks not good!</div>
            </div>
            <div class="col-4 position-relative">
              <label for="validationCustom03" class="form-label">Minutes</label>
              <input type="number" class="form-control" id="validationCustom03" required min="0" max="59" :value="modelValue.minute" ref="inputMinutes">
              <div class="invalid-tooltip">Looks not good!</div>
            </div>
            <div class="col-4 position-relative">
              <label for="validationCustom04" class="form-label">Seconds</label>
              <input type="number" class="form-control" id="validationCustom04" required min="0" max="99" :value="modelValue.second" ref="inputSeconds">
              <div class="invalid-tooltip">Looks not good!</div>
            </div>
            <div class="col-12">
              <label for="validationCustom05" class="form-label">Increment</label>
              <div class="input-group has-validation">
                <div class="input-group-text">
                  <input class="form-check-input mt-0" type="checkbox" aria-label="Radio button for following text input" :checked="checkedValue" @change="handleChange">
                </div>
                <input type="number" class="form-control" aria-label="Text input with radio button" id="validationCustom05" min="0" max="100" :value="modelValue.timerIncrement.increment" :disabled="disabledValue" ref="inputIncrement">
                <span class="input-group-text">%</span>
                <div class="invalid-tooltip">Looks not good!</div>
              </div>
            </div>
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