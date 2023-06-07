<script setup lang="ts">
import { computed, reactive, ref, watch, Ref, onMounted } from 'vue'
import { ITimer, createEmptyTimer } from '../types/ITimer'
import { Modal } from 'bootstrap'

let modalWindowObject: Modal
const modalWindow: Ref<HTMLDivElement> = ref({} as HTMLDivElement)
const formElement: Ref<HTMLFormElement> = ref({} as HTMLFormElement)
const submitElement: Ref<HTMLButtonElement> = ref({} as HTMLButtonElement)

onMounted(() => {
  if (modalWindow.value && formElement.value && submitElement.value) {
    modalWindow.value.addEventListener("hide.bs.modal", () => { })  

    modalWindowObject = new Modal(modalWindow.value)
    modalWindowObject.show()

    formElement.value.onsubmit = event => {
      event.preventDefault()
      event.stopPropagation()

      if (formElement.value.checkValidity()) {
        console.log("ok")
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
          <h1 class="modal-title fs-5" id="staticBackdropLabel">Create new Timer</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form class="row g-3 needs-validation" novalidate ref="formElement">
            <div class="col-12 position-relative">
              <label for="validationCustom01" class="form-label">Title</label>
              <input type="text" class="form-control" id="validationCustom01" required>
              <div class="invalid-tooltip">Looks not good!</div>
            </div>
            <div class="col-4 position-relative">
              <label for="validationCustom02" class="form-label">Hours</label>
              <input type="number" class="form-control" id="validationCustom02" required min="0" max="99">
              <div class="invalid-tooltip">Looks not good!</div>
            </div>
            <div class="col-4 position-relative">
              <label for="validationCustom03" class="form-label">Minutes</label>
              <input type="number" class="form-control" id="validationCustom03" required min="0" max="59">
              <div class="invalid-tooltip">Looks not good!</div>
            </div>
            <div class="col-4 position-relative">
              <label for="validationCustom04" class="form-label">Seconds</label>
              <input type="number" class="form-control" id="validationCustom04" required min="0" max="99">
              <div class="invalid-tooltip">Looks not good!</div>
            </div>
            <div class="col-12">
              <label for="validationCustom05" class="form-label">Increment</label>
              <div class="input-group has-validation">
                <div class="input-group-text">
                  <input class="form-check-input mt-0" type="checkbox" value="" aria-label="Radio button for following text input">
                </div>
                <input type="number" class="form-control" aria-label="Text input with radio button" id="validationCustom05" min="0" max="100">
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