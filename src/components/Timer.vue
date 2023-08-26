<script setup lang="ts">
import { computed, ref, watch } from 'vue';
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
const scheduled = ref(littleTest.timer!.scheduled)
const countdown = ref(littleTest.timer!.countdown)
const theTimer = ref(littleTest.timer!)

const emits = defineEmits<{(event: 'timerStarted', timer: ITimer): void, (event: 'timerStopped', timer: ITimer, finished: boolean): void, (event: 'timerEditStarted', timer: ITimer): void, (event: 'timerDeleted', timer: ITimer): void}>()

const pad: (x: number) => string = (x: number) => String(x).padStart(2, '0')
const show: (x: number) => string = (x: number) => pad(Math.floor(x / 3600)) + ":" + pad(Math.floor((x - Math.floor(x / 3600) * 3600) / 60)) + ":" + pad((x - Math.floor(x / 60) * 60))
const format: (x: Date) => string = (x: Date) => x.toLocaleTimeString([], { timeStyle: 'medium' })
const coutdowntotimer: (x: number) => IDisplay = (x) => ({ hours: Math.floor(x / 3600), minutes: Math.floor((x - Math.floor(x / 3600) * 3600) / 60), seconds: (x - Math.floor(x / 60) * 60) })

const theDropdown = ref()

const originElapsed: number = countdown.value.elapsed

const startTimer = function () {
    const baseDate = Date.now()
    const nbSeconds = countdown.value.elapsed

    countdown.value.active = true
    scheduled.value.update(baseDate, coutdowntotimer(nbSeconds))
    emits('timerStarted', littleTest.timer!)

    timerHandle = setInterval(function () {
        let delta = Math.floor((Date.now() - baseDate) / 1000)
        let elapsed = nbSeconds - delta

        countdown.value.elapsed = elapsed < 0 ? 0 : elapsed

        if (!countdown.value.elapsed) finishTimer()
    }, 225)
}

const finishTimer = function () {
    clearInterval(timerHandle)
    countdown.value.active = false
    emits('timerStopped', littleTest.timer!, true)    
}

const stopTimer = function () {
    clearInterval(timerHandle)
    countdown.value.active = false
    emits('timerStopped', littleTest.timer!, false)
}

const editTimer = function () {
    emits('timerEditStarted', littleTest.timer!)
}

const deleteTimer = function () {
    emits('timerDeleted', littleTest.timer!)
}

const _resetTimer = function (func: ICountdownElapsedFunction) {
    const baseDate = Date.now()
    
    countdown.value.elapsed = func()
    scheduled.value.update(baseDate, coutdowntotimer(countdown.value.elapsed))
}

const resetTimerOriginal = function () {
    _resetTimer(() => {
        theTimer.value.updatedElapsed = originElapsed

        return theTimer.value.updatedElapsed
    })
}

const resetTimerIncrement = function () {
    _resetTimer(() => {
        theTimer.value.updatedElapsed = Math.ceil(Math.ceil(theTimer.value.updatedElapsed * ((littleTest.timer!.timerIncrement.increment + 100) / 100)) / 10) * 10

        return theTimer.value.updatedElapsed
    })
}

const resetTimerBack = function () {
    _resetTimer(() => theTimer.value.updatedElapsed)
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
    if (countdown.value.elapsed === 0) return false
    else return !countdown.value.active
})

const resetButtonText = computed(() => {
    if (littleTest.timer!.timerIncrement.active) return Math.ceil(Math.ceil(theTimer.value.updatedElapsed * ((littleTest.timer!.timerIncrement.increment + 100) / 100)) / 10) * 10
    else return 0
})

const showResetButton = computed(() => {
    if (littleTest.timer!.timerIncrement.active) return false
    else return !countdown.value.active
})

const showResetDropdownButton = computed(() => {
    if (littleTest.timer!.timerIncrement.active) return !countdown.value.active
    else return false
})

const showResetDropdown = computed(() => {
    if (littleTest.disabled) return false
    else return !countdown.value.active
})

const showUpdatedReset = computed(() => {
    if (theTimer.value.updatedElapsed === originElapsed) return false
    else return true
})

const showEditButton = computed(() => {
    if (!countdown.value.elapsed) return true
    else return !countdown.value.active
})

const showDeleteButton = computed(() => {
    if (!countdown.value.elapsed) return true
    else return !countdown.value.active
})

const resetText = computed(() => {
    const parsedId = parseTimerId(littleTest.timerid)

    let returnText = ""
    const textFormat = "Reset <em>to $0</em>"
    
    if (parsedId.resetNormal) returnText = textFormat.replace("$0", show(theTimer.value.updatedElapsed))
    else if (parsedId.resetOnly) {} 
    else if (parsedId.resetOrigin) returnText = textFormat.replace("$0", show(originElapsed))
    else /* if (parsedId.resetProgressive) */ returnText = textFormat.replace("$0", show(resetButtonText.value))

    return returnText
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
    } else if ((value === 12 || value === 13) && countdown.value.active && !appendDisabled.value.length) { // "stop"
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
        <div class="card-header">{{timer!.title}}</div>
        <div class="card-body">
            <h5 class="card-title">{{format(scheduled.start)}} &Rarr; {{format(scheduled.end)}}</h5>
            <p class="card-text custom-font fs-2">{{show(countdown.elapsed)}}</p>
            <div class="d-grid gap-2 d-md-flex flex-md-wrap">
                <a :class="'btn btn-success' + ((appendDisabled.length === 0 && activateButton) ? '' : ' disabled')" v-on:click="startTimer" v-if="showStartButton">Start</a>
                <a :class="'btn btn-danger' + ((appendDisabled.length === 0 && activateButton) ? '' : ' disabled')" v-on:click="stopTimer" v-if="countdown.active">Stop</a>
                <a :class="'btn btn-primary' + ((appendDisabled.length === 0 && activateButton) ? '' : ' disabled')" v-on:click="resetTimerOriginal" v-if="showResetButton">Reset</a>
                <button :class="'btn btn-primary dropdown-toggle' + ((appendDisabled.length === 0 && activateButton) ? '' : ' disabled')" type="button" data-bs-toggle="dropdown" aria-expanded="false" v-if="showResetDropdownButton">Reset</button>
                <ul class="dropdown-menu" ref="theDropdown">
                    <li><a class="dropdown-item" v-on:click="resetTimerOriginal">To {{show(originElapsed)}}</a></li>
                    <li><a class="dropdown-item" v-on:click="resetTimerBack" v-if="showUpdatedReset">To {{show(theTimer.updatedElapsed)}}</a></li>
                    <li><a class="dropdown-item" v-on:click="resetTimerIncrement">To {{show(resetButtonText)}}</a></li>
                </ul>
                <a :class="'btn btn-warning' + ((appendDisabled.length === 0 && activateButton) ? '' : ' disabled')" v-on:click="editTimer" v-if="showEditButton">Edit</a>
                <a :class="'btn btn-danger' + ((appendDisabled.length === 0 && activateButton) ? '' : ' disabled')" v-on:click="deleteTimer" v-if="showDeleteButton">Delete</a>
            </div>
        </div>
    </div>
    <a :class="'list-group-item' + (timeractive ? ' active': '')" v-if="mode === 'small'">
        <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{{timer!.title}}</h5>
        </div>
        <div class="d-flex w-100 justify-content-between" v-if="timeractive">
            <h5 class="text-muted mb-1" style="font-size: 0.8rem">{{format(scheduled.end)}}</h5>
        </div>
        <div class="d-flex justify-content-between align-items-center">
            <div class="custom-font fs-3">{{show(countdown.elapsed)}}</div>
            <div class="fs-6" v-html="resetText"></div>
        </div>
    </a>
    <div :id="idText" class="card border-success d-none" v-if="mode === 'normal'">
        <div class="card-header">{{timer!.title}}</div>
        <div class="card-body">
            <h5 class="card-title">{{format(scheduled.start)}} &Rarr; {{format(scheduled.end)}}</h5>
            <p class="card-text custom-font fs-2">{{show(0)}}</p>
        </div>
    </div>
</template>