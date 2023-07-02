<script setup lang="ts">
import { IGroup } from '../types/IGroup'
import SmallTimer from './SmallTimer.vue';

defineProps<{ group: IGroup }>()
defineEmits<{(event: 'edit', group: IGroup): void}>()
</script>

<template>
    <div class="card">
        <div class="card-header">{{ group.title }}</div>
        <div class="card-body">
            <div class="list-group my-2">
                <SmallTimer v-for="timer in group.timers" :timer="timer" />
            </div>
            <div class="d-grid gap-2 d-md-flex flex-md-wrap">
                <a class="btn btn-success">Start</a>
                <a class="btn btn-danger">Stop</a>
                <a class="btn btn-warning" @click="$emit('edit', group)" >Edit</a>
            </div>
        </div>
    </div>
</template>