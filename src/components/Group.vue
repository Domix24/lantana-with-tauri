<script setup lang="ts">
import { ref } from 'vue'
import { IGroup } from '../types/IGroup'

interface IProps {
    group: IGroup,
    activetimerid: number,
    active: number
}

type IEvents = "edit" | "stop" | "start" | "reset"

interface IEmits {
    (event: IEvents, group: IGroup): void,
}

defineProps<IProps>()
const emits = defineEmits<IEmits>()

const state = ref("stopped" as ("stopped" | "started"))

const showEditButton = ref(true)
const showResetButton = ref(true)
const showStartButton = ref(true)
const showStopButton = ref(false)

const sendEvent = (event: IEvents, group: IGroup) => {
    if (event === "edit") {

    } else if (event === "start") {
        showEditButton.value = false
        showResetButton.value = false
        showStartButton.value = false
        showStopButton.value = true
        state.value = "started"
    } else if (event === "stop") {
        showEditButton.value = true
        showResetButton.value = true
        showStartButton.value = true
        showStopButton.value = false
        state.value = "stopped"
    } else if (event === "reset") {

    } 

    emits(event, group)
}
</script>

<template>
    <div class="card">
        <div class="card-header">{{ group.title }}</div>
        <div class="card-body">
            <div class="list-group my-2">
                <slot name="timers"></slot>
            </div>
            <div class="d-grid gap-2 d-md-flex flex-md-wrap">
                <a :class="'btn btn-success' + (active === 0 ? '' : ' disabled')" @click="sendEvent('start', group)" v-if="showStartButton">Start</a>
                <a :class="'btn btn-danger' + (active === 0 ? '' : ' disabled')" @click="sendEvent('stop', group)" v-if="showStopButton">Stop</a>
                <a :class="'btn btn-primary' + (active === 0 ? '' : ' disabled')" @click="sendEvent('reset', group)" v-if="showResetButton">Reset</a>
                <a :class="'btn btn-warning' + (active === 0 ? '' : ' disabled')" @click="sendEvent('edit', group)" v-if="showEditButton">Edit</a>
            </div>
        </div>
    </div>
</template>