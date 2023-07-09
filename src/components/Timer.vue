<script setup lang="ts">
import { Ref, computed, ref, watch } from 'vue';
import { ITimer, createEmptyTimer } from '../types/ITimer';
import { parseTimerId } from '../functions';

interface ICountdownElapsedFunction {
    (): number
}

interface IDisplay {
    hours: number,
    minutes: number,
    seconds: number
}

let timerHandle: NodeJS.Timeout | undefined = undefined

const littleTest = withDefaults(defineProps<{ timer?: ITimer, disabled?: boolean, styleUpdated?: boolean, timerDisabled?: boolean, idText?: string, timerStatus?: number, activateButton?: boolean, mode?: "normal" | "small", timerid?: string, timeractive?: boolean }>(), {
    timer: () => createEmptyTimer(),
    disabled: false,
    styleUpdated: false,
    timerDisabled: false,
    idText: "-",
    timerStatus: 0,
    activateButton: true,
    mode: "normal",
    timerid: "",
    timeractive: false,
})
const emits = defineEmits<{(event: 'timerStarted', timer: ITimer): void, (event: 'timerStopped', timer: ITimer, finished: boolean): void, (event: 'timerEditStarted', timer: ITimer): void, (event: 'timerDeleted', timer: ITimer): void}>()
const theTimer: Ref<ITimer> = ref(littleTest.timer!)

const pad: (x: number) => string = (x: number) => String(x).padStart(2, '0')
const show: (x: number) => string = (x: number) => pad(Math.floor(x / 3600)) + ":" + pad(Math.floor((x - Math.floor(x / 3600) * 3600) / 60)) + ":" + pad((x - Math.floor(x / 60) * 60))
const format: (x: Date) => string = (x: Date) => x.toLocaleTimeString([], { timeStyle: 'medium' })
const coutdowntotimer: (x: number) => IDisplay = (x) => ({ hours: Math.floor(x / 3600), minutes: Math.floor((x - Math.floor(x / 3600) * 3600) / 60), seconds: (x - Math.floor(x / 60) * 60) })

const theDropdown = ref()

const originElapsed: number = theTimer.value.countdown.elapsed
let updatedElapsed = ref(originElapsed)

const startTimer = function () {
    const baseDate = Date.now()
    const nbSeconds = theTimer.value.countdown.elapsed

    theTimer.value.countdown.active = true
    theTimer.value.scheduled.update(baseDate, coutdowntotimer(nbSeconds))
    emits('timerStarted', theTimer.value)

    timerHandle = setInterval(function () {
        let delta = Math.floor((Date.now() - baseDate) / 1000)
        let elapsed = nbSeconds - delta

        theTimer.value.countdown.elapsed = elapsed < 0 ? 0 : elapsed

        if (!theTimer.value.countdown.elapsed) finishTimer()
    }, 225)
}

const finishTimer = function () {
    clearInterval(timerHandle)
    theTimer.value.countdown.active = false
    emits('timerStopped', theTimer.value, true)    
}

const stopTimer = function () {
    clearInterval(timerHandle)
    theTimer.value.countdown.active = false
    emits('timerStopped', theTimer.value, false)
}

const editTimer = function () {
    emits('timerEditStarted', theTimer.value)
}

const deleteTimer = function () {
    emits('timerDeleted', theTimer.value)
}

const _resetTimer = function (func: ICountdownElapsedFunction) {
    const baseDate = Date.now()
    
    theTimer.value.countdown.elapsed = func()
    theTimer.value.scheduled.update(baseDate, coutdowntotimer(theTimer.value.countdown.elapsed))
}

const resetTimerOriginal = function () {
    _resetTimer(() => {
        updatedElapsed.value = originElapsed

        return updatedElapsed.value
    })
}

const resetTimerIncrement = function () {
    _resetTimer(() => {
        updatedElapsed.value = Math.ceil(Math.ceil(updatedElapsed.value * ((theTimer.value.timerIncrement.increment + 100) / 100)) / 10) * 10

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
    if (littleTest.disabled) return " disabled"
    else return ""
})

const showStartButton = computed(() => {
    if (theTimer.value.countdown.elapsed === 0) return false
    else return !theTimer.value.countdown.active
})

const resetButtonText = computed(() => {
    if (theTimer.value!.timerIncrement.active) return Math.ceil(Math.ceil(updatedElapsed.value * ((theTimer.value!.timerIncrement.increment + 100) / 100)) / 10) * 10
    else return 0
})

const showResetButton = computed(() => {
    if (theTimer.value.timerIncrement.active) return false
    else return !theTimer.value.countdown.active
})

const showResetDropdownButton = computed(() => {
    if (theTimer.value.timerIncrement.active) return !theTimer.value.countdown.active
    else return false
})

const showResetDropdown = computed(() => {
    if (littleTest.disabled) return false
    else return !theTimer.value.countdown.active
})

const showUpdatedReset = computed(() => {
    if (updatedElapsed.value === originElapsed) return false
    else return true
})

const showEditButton = computed(() => {
    if (!theTimer.value.countdown.elapsed) return true
    else return !theTimer.value.countdown.active
})

const showDeleteButton = computed(() => {
    if (!theTimer.value.countdown.elapsed) return true
    else return !theTimer.value.countdown.active
})

const resetText = computed(() => {
    const parsedId = parseTimerId(littleTest.timerid)

    if (parsedId.resetNormal) return `Reset <em>to ${show(originElapsed)}</em>`
    else if (parsedId.resetOnly) return ``
    else if (parsedId.resetOrigin) return `Reset <em>to ${show(updatedElapsed.value)}</em>`
    else /* if (parsedId.resetProgressive) */ return `Reset <em>to ${show(resetButtonText.value)}</em>`
})

watch(showResetDropdown, (val) => {
    if (theDropdown.value && !val && theDropdown.value["classList"].contains("show")) {
        theDropdown.value["classList"].toggle("show")
    }
})

watch(() => littleTest.timerStatus, (value) => {
    const valueFunction = {
        "reset-origin(-start)": () => (showResetButton.value || showResetDropdownButton.value) && !appendDisabled.value.length,
        "reset-normal(-start)": () => showResetDropdownButton.value && showUpdatedReset.value && !appendDisabled.value.length,
        "reset-normal-reset-origin(-start)": () => valueFunction['reset-normal(-start)']() || valueFunction['reset-origin(-start)'](),
    } 

    if ((value === 10 || value === 11) && showStartButton.value && !appendDisabled.value.length) { // "start"
        startTimer()
    } else if ((value === 12 || value === 13) && theTimer.value.countdown.active && !appendDisabled.value.length) { // "stop"
        stopTimer()
    } else if ((value === 14 || value === 15 || value === 20 || value === 21) && valueFunction['reset-origin(-start)']()) { // "reset-origin(-start)"
        resetTimerOriginal()
        if (value === 20 || value === 21)
            startTimer()
    } else if ((value === 16 || value === 17 || value === 22 || value === 23) && valueFunction['reset-normal(-start)']()) { // "reset-normal(-start)"
        resetTimerBack()
        if (value === 22 || value === 23)
            startTimer()
    } else if ((value === 18 || value === 19 || value === 24 || value === 25) && showResetDropdownButton.value && !appendDisabled.value.length) { // "reset-progressive(-start)"
        resetTimerIncrement()
        if (value === 24 || value === 25)
            startTimer()
    } else if ((value === 26 || value === 27 || value === 28 || value === 29) && valueFunction['reset-normal-reset-origin(-start)']()) { // "reset-normal-reset-origin(-start)"
        if (valueFunction['reset-normal(-start)']())
            resetTimerBack()
        else
            resetTimerOriginal()
        if (value === 28 || value === 29)
            startTimer()
    } else {
        
    }
})
</script>

<template>
    <div :class="cardBorder" v-if="mode === 'normal'">
        <div class="card-header">{{theTimer.title}}</div>
        <div class="card-body">
            <h5 class="card-title">{{format(theTimer.scheduled.start)}} &Rarr; {{format(theTimer.scheduled.end)}}</h5>
            <p class="card-text custom-font fs-2">{{show(theTimer.countdown.elapsed)}}</p>
            <div class="d-grid gap-2 d-md-flex flex-md-wrap">
                <a :class="'btn btn-success' + ((appendDisabled.length === 0 && activateButton) ? '' : ' disabled')" v-on:click="startTimer" v-if="showStartButton">Start</a>
                <a :class="'btn btn-danger' + ((appendDisabled.length === 0 && activateButton) ? '' : ' disabled')" v-on:click="stopTimer" v-if="theTimer.countdown.active">Stop</a>
                <a :class="'btn btn-primary' + ((appendDisabled.length === 0 && activateButton) ? '' : ' disabled')" v-on:click="resetTimerOriginal" v-if="showResetButton">Reset</a>
                <button :class="'btn btn-primary dropdown-toggle' + ((appendDisabled.length === 0 && activateButton) ? '' : ' disabled')" type="button" data-bs-toggle="dropdown" aria-expanded="false" v-if="showResetDropdownButton">Reset</button>
                <ul class="dropdown-menu" ref="theDropdown">
                    <li><a class="dropdown-item" v-on:click="resetTimerOriginal">To {{show(originElapsed)}}</a></li>
                    <li><a class="dropdown-item" v-on:click="resetTimerBack" v-if="showUpdatedReset">To {{show(updatedElapsed)}}</a></li>
                    <li><a class="dropdown-item" v-on:click="resetTimerIncrement">To {{show(resetButtonText)}}</a></li>
                </ul>
                <a :class="'btn btn-warning' + ((appendDisabled.length === 0 && activateButton) ? '' : ' disabled')" v-on:click="editTimer" v-if="showEditButton">Edit</a>
                <a :class="'btn btn-danger' + ((appendDisabled.length === 0 && activateButton) ? '' : ' disabled')" v-on:click="deleteTimer" v-if="showDeleteButton">Delete</a>
            </div>
        </div>
    </div>
    <a :class="'list-group-item' + (timeractive ? ' active': '')" v-if="mode === 'small'">
        <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{{theTimer.title}}</h5>
            <div>{{littleTest.timerid}}</div>
        </div>
        <div class="d-flex justify-content-between align-items-center">
            <div class="custom-font fs-3">{{show(theTimer.countdown.elapsed)}}</div>
            <div class="fs-6" v-html="resetText"></div>
        </div>
    </a>
    <div :id="idText" class="card border-success d-none" v-if="mode === 'normal'">
        <div class="card-header">{{theTimer.title}}</div>
        <div class="card-body">
            <h5 class="card-title">{{format(theTimer.scheduled.start)}} &Rarr; {{format(theTimer.scheduled.end)}}</h5>
            <p class="card-text custom-font fs-2">{{show(0)}}</p>
        </div>
    </div>
</template>