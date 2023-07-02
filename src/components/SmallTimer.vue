<script setup lang="ts">
import { ITimer } from '../types/ITimer'

const pad: (number: number) => string = number => String(number).padStart(2, "0")

defineProps<{ timer: ITimer }>()
</script>

<template>
    <a class="list-group-item">
        <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{{ timer.title }}</h5>
            <small>#{{ timer.id }}</small>
        </div>
        <div class="custom-font fs-3">{{ pad(timer.hour) }}:{{ pad(timer.minute) }}:{{ pad(timer.second) }}</div>
    </a>
</template>