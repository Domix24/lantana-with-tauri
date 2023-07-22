import { Ref, ref } from 'vue'

export const notificationActivated: Ref<boolean> = ref(Notification.permission === "granted")
export const notificationDisabled: Ref<boolean> = ref(Notification.permission === "denied")

export const showNotification = (title: string, body: string) => {
    if (!notificationDisabled.value && notificationActivated.value) {
        new Notification(title, { body: body })
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