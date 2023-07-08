<script setup lang="ts">
import { Ref, computed, onMounted, ref, watch} from 'vue';
import { ITimer, createEmptyTimer } from '../types/ITimer'
import { timerDatabase } from '../database';
import { parseTimerId } from '../functions';

const timer: Ref<ITimer> = ref(createEmptyTimer())
const pad: (number: number) => string = number => String(number).padStart(2, "0")
const props = defineProps<{ timerid: string, active: boolean }>()

const resetText = computed(() => {
    const parsedId = parseTimerId(props.timerid)

    if (parsedId.resetNormal) {
        return `Reset <em>to last</em>`
    } else if (parsedId.resetOrigin) {
        return ``
    } else { // if (parsedId.resetProgressive) {
        return `Reset <em>+${timer.value.timerIncrement.increment}%</em>`
    }
})

watch(() => props.timerid, async () => {
    timer.value = await timerDatabase.timers.get(parseTimerId(props.timerid).timerid) as ITimer
})

onMounted(async () => {
    let result = await timerDatabase.timers.get(parseTimerId(props.timerid).timerid)
    if (result) {
        timer.value = result as ITimer
    }
})
</script>

<template>
    <a :class="'list-group-item' + (active ? ' active' : '')">
        <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{{ timer.title }}</h5>
        </div>
        <div class="d-flex justify-content-between align-items-center">
            <div class="custom-font fs-3">{{ pad(timer.hour) }}:{{ pad(timer.minute) }}:{{ pad(timer.second) }}</div>
            <div class="fs-6" v-html="resetText"></div>
        </div>
    </a>
</template>