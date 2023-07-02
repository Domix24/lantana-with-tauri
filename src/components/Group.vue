<script setup lang="ts">
import { IGroup } from '../types/IGroup'

defineProps<{ group: IGroup }>()
</script>

<template>
    <div class="card">
        <div class="card-header">{{ group.title }}</div>
        <div class="card-body">
            <div class="list-group my-2">
            </div>
            <div class="d-grid gap-2 d-md-flex flex-md-wrap">
                <a class="btn btn-success">Start</a>
                <a class="btn btn-danger">Stop</a>
            </div>
        </div>
    </div>
</template>