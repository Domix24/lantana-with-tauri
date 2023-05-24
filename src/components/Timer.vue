<script setup lang="ts">
import { computed, reactive } from 'vue';
import { ITimer, createEmptyTimer } from '../types/ITimer';

interface IDisplay {
    hours: number,
    minutes: number,
    seconds: number
}

interface ICountdown {
    elapsed: number,
    active: boolean
}

interface IUpdateFunction {
    (newTime: number, display: IDisplay): void
}

interface IScheduled {
    start: Date,
    end: Date,
    update: IUpdateFunction,
}

let timerHandle: NodeJS.Timeout | undefined = undefined

const littleTest = withDefaults(defineProps<{ object?: ITimer }>(), {
    object: () => createEmptyTimer()
})
const emits = defineEmits<{(event: 'timerStarted', timer: ITimer): void, (event: 'timerStopped', timer: ITimer, finished: boolean): void}>()

const countdown: ICountdown = reactive({
    active: false,
    elapsed: littleTest.object.hour * 3600 + littleTest.object.minute * 60 + littleTest.object.second
})

const scheduled: IScheduled = reactive({
    start: new Date(),
    end: new Date(),
    update: function(newTime, display) {
        this.end.setTime(newTime)

        this.end.setHours(this.end.getHours() + display.hours)
        this.end.setMinutes(this.end.getMinutes() + display.minutes)
        this.end.setSeconds(this.end.getSeconds() + display.seconds)

        this.start = new Date(newTime)
    }
})

const pad: (x: number) => string = (x: number) => String(x).padStart(2, '0')
const show: (x: number) => string = (x: number) => pad(Math.floor(x / 3600)) + ":" + pad(Math.floor((x - Math.floor(x / 3600) * 3600) / 60)) + ":" + pad((x - Math.floor(x / 60) * 60))
const format: (x: Date) => string = (x: Date) => x.toLocaleTimeString([], { timeStyle: 'medium' })
const coutdowntotimer: (x: number) => IDisplay = (x) => ({ hours: Math.floor(x / 3600), minutes: Math.floor((x - Math.floor(x / 3600) * 3600) / 60), seconds: (x - Math.floor(x / 60) * 60) })

const originDisplay : IDisplay = coutdowntotimer(countdown.elapsed)
const originElapsed : number = countdown.elapsed

const startTimer = function () {
    const baseDate = Date.now()
    const nbSeconds = countdown.elapsed

    countdown.active = true
    scheduled.update(baseDate, coutdowntotimer(nbSeconds))
    emits('timerStarted', littleTest.object)

    timerHandle = setInterval(function () {
        let delta = Math.floor((Date.now() - baseDate) / 1000)
        let elapsed = nbSeconds - delta

        countdown.elapsed = elapsed < 0 ? 0 : elapsed

        if (!countdown.elapsed) finishTimer()
    }, 225)
}

const finishTimer = function () {
    clearInterval(timerHandle)
    countdown.active = false
    emits('timerStopped', littleTest.object, true)    
}

const stopTimer = function () {
    clearInterval(timerHandle)
    countdown.active = false
    emits('timerStopped', littleTest.object, false)
}

const resetTimer = function () {
    const baseDate = Date.now()
    countdown.elapsed = originElapsed
    scheduled.update(baseDate, originDisplay)
}

const cardBorder = computed(() => {
    if (littleTest.object.active) {
        return "card border-success"
    } else {
        return "card border-danger"
    }
})
</script>

<template>
    <div :class="cardBorder">
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