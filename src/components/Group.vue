<script setup lang="ts">
import { ref } from 'vue'
import { IGroup } from '../types/IGroup'
import SmallTimer from './SmallTimer.vue';

interface IProps {
    group: IGroup,
}

type IEvents = "edit" | "stop" | "start"

interface IEmits {
    (event: IEvents, group: IGroup): void,
}

defineProps<IProps>()
const emits = defineEmits<IEmits>()

const state = ref("stopped" as ("stopped" | "started"))

const sendEvent = (event: IEvents, group: IGroup) => {
    if (event === "edit") {

    } else if (event === "start") {
        state.value = "started"
    } else if (event === "stop") {
        state.value = "stopped"
    }

    emits(event, group)
}
</script>

<template>
    <div class="card">
        <div class="card-header">{{ group.title }}</div>
        <div class="card-body">
            <div class="list-group my-2">
                <SmallTimer v-for="timer in group.timers" :timerid="timer" />
            </div>
            <div class="d-grid gap-2 d-md-flex flex-md-wrap">
                <a class="btn btn-success" @click="sendEvent('start', group)" v-if="state === 'stopped'" >Start</a>
                <a class="btn btn-danger" @click="sendEvent('stop', group)" v-if="state === 'started'" >Stop</a>
                <a class="btn btn-warning" @click="sendEvent('edit', group)" v-if="state === 'stopped'" >Edit</a>
            </div>
        </div>
    </div>
</template>