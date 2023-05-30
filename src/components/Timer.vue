<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { ITimer, createEmptyTimer } from '../types/ITimer';

interface ICountdownElapsedFunction {
    (): number
}

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

const littleTest = withDefaults(defineProps<{ object?: ITimer, disabled: boolean, styleUpdated: boolean, timerDisabled: boolean, idText: string }>(), {
    object: () => createEmptyTimer(),
    disabled: false,
    styleUpdated: false,
    timerDisabled: false,
    idText: "-"
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

const theDropdown = ref()

const originElapsed: number = countdown.elapsed
let updatedElapsed = ref(originElapsed)

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

const _resetTimer = function (func: ICountdownElapsedFunction) {
    const baseDate = Date.now()

    countdown.elapsed = func()
    scheduled.update(baseDate, coutdowntotimer(countdown.elapsed))
}

const resetTimerOriginal = function () {
    _resetTimer(() => {
        updatedElapsed.value = originElapsed

        return updatedElapsed.value
    })
}

const resetTimerIncrement = function () {
    _resetTimer(() => {
        updatedElapsed.value = Math.ceil(Math.ceil(updatedElapsed.value * ((littleTest.object.timerIncrement.increment + 100) / 100)) / 10) * 10

        return updatedElapsed.value
    })
}

const resetTimerBack = function () {
    _resetTimer(() => updatedElapsed.value)
}

const cardBorder = computed(() => {
    if (littleTest.styleUpdated) {
        return "card border-warning"
    } else if (littleTest.timerDisabled) {
        return "card border-danger"
    } else {
        return "card border-success"
    }
})

const appendDisabled = computed(() => {
    if (littleTest.disabled) return "disabled"
    else return ""
})

const showStartButton = computed(() => {
    if (countdown.elapsed === 0) return false
    else return !countdown.active
})

const resetButtonText = computed(() => {
    if (littleTest.object.timerIncrement.active) return Math.ceil(Math.ceil(updatedElapsed.value * ((littleTest.object.timerIncrement.increment + 100) / 100)) / 10) * 10
    else return 0
})

const showResetButton = computed(() => {
    if (littleTest.object.timerIncrement.active) return false
    else return !countdown.active
})

const showResetDropdownButton = computed(() => {
    if (littleTest.object.timerIncrement.active) return !countdown.active
    else return false
})

const showResetDropdown = computed(() => {
    if (littleTest.disabled) return false
    else return !countdown.active
})

const showUpdatedReset = computed(() => {
    if (updatedElapsed.value === originElapsed) return false
    else return true
})

watch(showResetDropdown, (val) => {
    if (theDropdown.value && !val && theDropdown.value["classList"].contains("show")) {
        theDropdown.value["classList"].toggle("show")
    }
})
</script>

<template>
    <div :class="cardBorder">
        <div class="card-header">{{object.title}}</div>
        <div class="card-body">
            <h5 class="card-title">{{format(scheduled.start)}} &Rarr; {{format(scheduled.end)}}</h5>
            <p class="card-text custom-font">{{show(countdown.elapsed)}}</p>
            <div class="d-grid gap-2 d-md-flex">
                <a class="btn btn-success" :class="appendDisabled" v-on:click="startTimer" v-if="showStartButton">Start</a>
                <a class="btn btn-danger" :class="appendDisabled" v-on:click="stopTimer" v-if="countdown.active">Stop</a>
                <a class="btn btn-primary" :class="appendDisabled" v-on:click="resetTimerOriginal" v-if="showResetButton">Reset</a>
                <button class="btn btn-primary dropdown-toggle" :class="appendDisabled" type="button" data-bs-toggle="dropdown" aria-expanded="false" v-if="showResetDropdownButton">Reset</button>
                <ul class="dropdown-menu" ref="theDropdown">
                    <li><a class="dropdown-item" v-on:click="resetTimerOriginal">To {{show(originElapsed)}}</a></li>
                    <li><a class="dropdown-item" v-on:click="resetTimerBack" v-if="showUpdatedReset">To {{show(updatedElapsed)}}</a></li>
                    <li><a class="dropdown-item" v-on:click="resetTimerIncrement">To {{show(resetButtonText)}}</a></li>
                </ul>
            </div>
        </div>
    </div>
    <div :id="idText" class="card border-success d-none">
        <div class="card-header">{{object.title}}</div>
        <div class="card-body">
            <h5 class="card-title">{{format(scheduled.start)}} &Rarr; {{format(scheduled.end)}}</h5>
            <p class="card-text custom-font">{{show(0)}}</p>
        </div>
    </div>
</template>