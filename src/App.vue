<script setup lang="ts">
import Timer from './components/Timer.vue'
import { ITimer } from './types/ITimer'

interface ITimers {
  one: ITimer,
  two?: ITimer
}

let oTimers: ITimers[] = []

oTimers.push({
  one: {
    title: "First Title",
    active: true,
    hour: 0,
    minute: 0,
    second: 10
  },
  two: {
    title: "Second Title",
    active: true,
    hour: 1,
    minute: 2,
    second: 3
  },
})

oTimers.push({
  one: {
    title: "Third Title",
    active: true,
    hour: 10,
    minute: 20,
    second: 30
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
        <div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
          <button type="button" class="btn btn-primary btn-lg px-4 gap-3">Add new</button>
        </div>
      </div>
    </div>
    <div v-for="value in oTimers">
      <div class="px-4 py-4 my-5">
        <div class="row">
          <div class="col-6"><Timer :object="value.one" /></div>
          <div class="col-6" v-if="value.two"><Timer :object="value.two" /></div>
        </div>
      </div>    
    </div>
  </main>
</template>
