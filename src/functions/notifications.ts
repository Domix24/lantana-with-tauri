import { Ref, ref } from 'vue'

export const notificationActivated: Ref<boolean> = ref(Notification.permission === "granted")
export const notificationDisabled: Ref<boolean> = ref(Notification.permission === "denied")

interface IVoidFunction {
    (): void
}

export const showNotification = (title: string, body: string, fn: IVoidFunction) => {
    if (!notificationDisabled.value && notificationActivated.value) {
        const theNotif = new Notification(title, { body: body })
        theNotif.onclick = _e => { fn() }
    }
}

export const toggleNotification = () => {
    notificationActivated.value = !notificationActivated.value
}

export const requestPermission = () => {
    if (!("Notification" in window)) {
        notificationDisabled.value = true
    } else {
        Notification.requestPermission().then(permission => {
            notificationActivated.value = permission === "granted"
            notificationDisabled.value = permission === "denied"
        })
    } 
}
