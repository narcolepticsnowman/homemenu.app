export const colors = {
    green: "#d9ffa8",
    red: "#ffa8a8",
    orange: "#ffd1a8",
    blue: "#bae1ff",
    yellow: '#faffba',
    offWhite: "#dedede",
    lightGrey: "#a2a2a2",
    darkGrey: '#808080',
    almostBlack: '#1b1b1b'
}
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const toDayName = (msDate) => {
    return days[new Date(msDate).getDay()]
}

export const today = ()=>{
    let tdy = new Date()
    tdy.setHours(0, 0, 0, 0)
    return tdy
}

export const datePlusDays = (date, days) => {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return d.getTime()
}

export const plural = (n, unit) => n > 1 ? unit + 's' : unit

export const humanTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes - hours * 60
    let str = ''
    if (hours > 0) str = `${hours} ${plural(hours, "Hour")} `
    return str + (mins > 0 ? `${mins} Min` : '')
}