<script setup lang="ts">
import { computed, ref, Ref, onMounted } from 'vue'
import { ITimer, createEmptyTimer } from '../types/ITimer'
import { Modal } from 'bootstrap'

let modalWindowObject: Modal
const modalWindow: Ref<HTMLDivElement> = ref({} as HTMLDivElement)
const formElement: Ref<HTMLFormElement> = ref({} as HTMLFormElement)
const submitElement: Ref<HTMLButtonElement> = ref({} as HTMLButtonElement)

const inputTitle: Ref<HTMLInputElement> = ref({} as HTMLInputElement)
const inputHours: Ref<HTMLInputElement> = ref({} as HTMLInputElement)
const inputMinutes: Ref<HTMLInputElement> = ref({} as HTMLInputElement)
const inputSeconds: Ref<HTMLInputElement> = ref({} as HTMLInputElement)
const inputIncrement: Ref<HTMLInputElement> = ref({} as HTMLInputElement)

const props = defineProps<{ modelValue: ITimer }>()
const emits = defineEmits<{(event: 'update:modelValue', timer: ITimer): void, (event: 'closed'): void}>()

const title: Ref<string> = ref(props.modelValue.title)
const hours: Ref<number> = ref(props.modelValue.hour)
const minutes: Ref<number> = ref(props.modelValue.minute)
const seconds: Ref<number> = ref(props.modelValue.second)
const active: Ref<boolean> = ref(props.modelValue.timerIncrement.active)
const increment: Ref<number> = ref(props.modelValue.timerIncrement.increment)

const handleChange = () => {
  timerActive.value = !timerActive.value
}

const handleInput: (input: string) => void = input => {
  if (input === "hoursUpdate") { timerHours.value = parseZero(inputHours.value.value) }
  else if (input === "minutesUpdate") { timerMinutes.value = parseZero(inputMinutes.value.value) }
  else if (input === "secondsUpdate") { timerSeconds.value = parseZero(inputSeconds.value.value) }
  else if (input === "titleUpdate") { timerTitle.value = inputTitle.value.value }
  else if (input === "incrementUpdate") { timerIncrement.value = parseZero(inputIncrement.value.value) }
}

const parseZero: (string: string) => number = string => {
  let parsed = parseInt(string)
  if (isNaN(parsed)) return 0
  else return parsed
}

const parseTitle: (string: string) => string = string => {
  if (string.length) return string
  else return ""
}

const timerTitle = computed({
  get () { return title.value },
  set (x) { title.value = parseTitle(x) }
})

const timerHours = computed({
  get () { return hours.value },
  set (x) { hours.value = parseZero(x + "") }
})

const timerMinutes = computed({
  get () { return minutes.value },
  set (x) { minutes.value = parseZero(x + "") }
})

const timerSeconds = computed({
  get () { return seconds.value },
  set (x) { seconds.value = parseZero(x + "") }
})

const timerActive = computed({
  get () { return active.value },
  set (x) {
    active.value = x
    if (!x) increment.value = 0
    else increment.value = 1
  }
})

const timerIncrement = computed({
  get () { return increment.value },
  set (x) {
    increment.value = parseZero(x + "")
    active.value = !!increment.value
  }
})

const checkedValue = computed(() => {
  return active.value ? true : undefined
})

const disabledValue = computed(() => {
  return active.value ? undefined : true
})

onMounted(() => {
  if (modalWindow.value && formElement.value && submitElement.value) {
    modalWindow.value.addEventListener("hide.bs.modal", () => { emits("closed") })  

    modalWindowObject = new Modal(modalWindow.value)
    modalWindowObject.show()

    formElement.value.onsubmit = event => {
      event.preventDefault()
      event.stopPropagation()

      if (formElement.value.checkValidity()) {
        const updatedModel = createEmptyTimer()
        updatedModel.active = props.modelValue.active
        updatedModel.minute = timerMinutes.value
        updatedModel.hour = timerHours.value
        updatedModel.second = timerSeconds.value
        updatedModel.title = timerTitle.value
        updatedModel.timerIncrement.active = timerActive.value
        updatedModel.timerIncrement.increment = timerIncrement.value

        emits("update:modelValue", updatedModel)
        modalWindowObject.hide()
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
              <input type="text" class="form-control" id="validationCustom01" required :value="timerTitle" @input="handleInput('titleUpdate')" ref="inputTitle">
              <div class="invalid-tooltip">Looks not good!</div>
            </div>
            <div class="col-4 position-relative">
              <label for="validationCustom02" class="form-label">Hours</label>
              <input type="number" class="form-control" id="validationCustom02" required min="0" max="99" :value="timerHours" @input="handleInput('hoursUpdate')" ref="inputHours">
              <div class="invalid-tooltip">Looks not good!</div>
            </div>
            <div class="col-4 position-relative">
              <label for="validationCustom03" class="form-label">Minutes</label>
              <input type="number" class="form-control" id="validationCustom03" required min="0" max="59" :value="timerMinutes" @input="handleInput('minutesUpdate')" ref="inputMinutes">
              <div class="invalid-tooltip">Looks not good!</div>
            </div>
            <div class="col-4 position-relative">
              <label for="validationCustom04" class="form-label">Seconds</label>
              <input type="number" class="form-control" id="validationCustom04" required min="0" max="59" :value="timerSeconds" @input="handleInput('secondsUpdate')" ref="inputSeconds">
              <div class="invalid-tooltip">Looks not good!</div>
            </div>
            <div class="col-12">
              <label for="validationCustom05" class="form-label">Increment</label>
              <div class="input-group has-validation">
                <div class="input-group-text">
                  <input class="form-check-input mt-0" type="checkbox" aria-label="Radio button for following text input" :checked="checkedValue" @change="handleChange">
                </div>
                <input type="number" class="form-control" aria-label="Text input with radio button" id="validationCustom05" min="0" max="100" :value="timerIncrement" :disabled="disabledValue" @input="handleInput('incrementUpdate')" ref="inputIncrement">
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