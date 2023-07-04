<script setup lang="ts">
import { Ref, onMounted, ref, watch} from 'vue';
import { ITimer, createEmptyTimer } from '../types/ITimer'
import { timerDatabase } from '../database';

const timer: Ref<ITimer> = ref(createEmptyTimer())
const pad: (number: number) => string = number => String(number).padStart(2, "0")
const props = defineProps<{ timerid: number }>()

watch(() => props.timerid, async () => {
    timer.value = await timerDatabase.timers.get(props.timerid) as ITimer
})

onMounted(async () => {
    let result = await timerDatabase.timers.get(props.timerid)
    if (result) {
        timer.value = result as ITimer
    }  
})
</script>

<template>
    <a class="list-group-item">
        <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{{ timer.title }}</h5>
            <small>#{{ timerid }}</small>
        </div>
        <div class="custom-font fs-3">{{ pad(timer.hour) }}:{{ pad(timer.minute) }}:{{ pad(timer.second) }}</div>
    </a>
</template>