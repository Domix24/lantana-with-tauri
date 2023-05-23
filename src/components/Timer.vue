<script setup lang="ts">
import { reactive } from 'vue';
import { ITimer } from '../types/ITimer';

export interface ICountdown {
    hour: number,
    minute: number,
    second: number,
    elapsed: number,
    active: boolean
}

interface IUpdateFunction {
    (newTime: number, timer: ITimer): void
}

interface IScheduled {
    start: Date,
    end: Date,
    update: IUpdateFunction,
}

let timerHandle: NodeJS.Timeout | undefined = undefined

const littleTest = withDefaults(defineProps<{ object?: ITimer }>(), {
    object: () => <ITimer>({
        title: "Title",
        active: false,
        hour: 0,
        minute: 0,
        second: 0
    })
})

const countdown: ICountdown = reactive({
    active: false,
    hour: littleTest.object.hour,
    minute: littleTest.object.minute,
    second: littleTest.object.second,
    elapsed: littleTest.object.hour * 3600 + littleTest.object.minute * 60 + littleTest.object.second
})

const scheduled: IScheduled = reactive({
    start: new Date(),
    end: new Date(),
    update: function(newTime, timer) {
        this.start.setTime(newTime)
        this.end.setTime(newTime)

        this.end.setHours(this.end.getHours() + timer.hour)
        this.end.setMinutes(this.end.getMinutes() + timer.minute)
        this.end.setSeconds(this.end.getSeconds() + timer.second)
    }
})

const pad = (x: number) => String(x).padStart(2, '0')
const show = (x: number) => pad(Math.floor(x / 3600)) + ":" + pad(Math.floor((x - Math.floor(x / 3600) * 3600) / 60)) + ":" + pad((x - Math.floor(x / 60) * 60))
const format = (x: Date) => x.toLocaleTimeString([], { timeStyle: 'medium' })

const startTimer = function () {
    const baseDate = Date.now()
    const nbSeconds = littleTest.object.hour * 3600 + littleTest.object.minute * 60 + littleTest.object.second

    countdown.active = true

    scheduled.update(baseDate, littleTest.object)

    timerHandle = setInterval(function () {
        let delta = Math.floor((Date.now() - baseDate) / 1000)
        let elapsed = nbSeconds - delta

        countdown.elapsed = elapsed < 0 ? 0 : elapsed

        if (!countdown.elapsed) clearInterval(timerHandle)
    }, 225)
}

const stopTimer = function () {
    clearInterval(timerHandle)
    countdown.active = false
}

const resetTimer = function () {
    const baseDate = Date.now()

    countdown.elapsed = littleTest.object.hour * 3600 + littleTest.object.minute * 60 + littleTest.object.second

    scheduled.update(baseDate, littleTest.object)
}
</script>

<template>
    <div class="card">
        <div class="card-header">{{object.title}}</div>
        <div class="card-body">
            <h5 class="card-title">{{format(scheduled.start)}} &Rarr; {{format(scheduled.end)}}</h5>
            <p class="card-text">{{show(countdown.elapsed)}}</p>
            <div class="d-grid gap-2 d-md-flex">
                <a class="btn btn-success" v-on:click="startTimer" v-if="!countdown.active">Start</a>
                <a class="btn btn-danger" v-on:click="stopTimer" v-if="countdown.active">Stop</a>
                <a class="btn btn-primary" v-on:click="resetTimer" v-if="!countdown.active">Reset</a>
            </div>
        </div>
        <div class="card-footer text-body-secondary">Something</div>
    </div>
</template>