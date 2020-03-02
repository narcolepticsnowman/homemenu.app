export const colors = {
    green: "#d9ffa8",
    red: "#ffa8a8",
    orange: "#ffd1a8",
    blue: "#bae1ff",
    yellow: '#faffba',
    offWhite: "#dedede",
    lightGrey: "#a2a2a2",
    darkGrey: '#808080'
}

export const toMonthDay = (isoDate) => [isoDateToLocaleDate(isoDate)]
    .map(date =>
        `${(date.getMonth() + 1)}/${date.getDate().toString().padStart(2, "0")
        }`)[0]

export const isoDateToLocaleDate = (date) => new Date(Date.parse(date) + new Date().getTimezoneOffset() * 60000)



export const today = ()=>{
    let tdy = new Date()
    tdy.setHours(0, 0, 0, 0)
    return tdy
}


export const plural = (n, unit) => n > 1 ? unit + 's' : unit

export const humanTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes - hours * 60
    let str = ''
    if (hours > 0) str = `${hours} ${plural(hours, "Hour")} `
    return str + `${mins} Min`
}