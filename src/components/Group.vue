<script setup lang="ts">
import { IGroup } from '../types/IGroup'
import SmallTimer from './SmallTimer.vue';

interface IProps {
    group: IGroup,
}

interface IEmits {
    (event: "edit", group: IGroup): void,
    (event: "stop", group: IGroup): void,
    (event: "start", group: IGroup): void,
}

defineProps<IProps>()
defineEmits<IEmits>()
</script>

<template>
    <div class="card">
        <div class="card-header">{{ group.title }}</div>
        <div class="card-body">
            <div class="list-group my-2">
                <SmallTimer v-for="timer in group.timers" :timerid="timer" />
            </div>
            <div class="d-grid gap-2 d-md-flex flex-md-wrap">
                <a class="btn btn-success" @click="$emit('start', group)" >Start</a>
                <a class="btn btn-danger" @click="$emit('stop', group)" >Stop</a>
                <a class="btn btn-warning" @click="$emit('edit', group)" >Edit</a>
            </div>
        </div>
    </div>
</template>