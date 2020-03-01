import {div, section, ul} from "./fnelements.js";

const toLocaleString = (date) => new Date(Date.parse(date) + new Date().getTimezoneOffset() * 60000).toLocaleDateString()

const today = new Date().toLocaleDateString("sv").split(" ")[0]

const plural = (n, unit) => n > 1 ? unit + 's' : unit
const humanTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes - hours * 60
    let str = ''
    if (hours > 0) str = `${hours} ${plural(hours, "Hour")} `
    return str + `${mins} Min`
}

const menuItem = (plan) => {
    let cookTime = plan.dishes.map(d => d.cookTime).reduce((a, b) => a + b, 0)
    return div({style: {}},
        div({
            style: {
                color: plan.date === today ? "#bae1ff" : "#a2a2a2",
            }
        }, toLocaleString(plan.date)),
        ...plan.dishes.map(dish =>
            div({
                style: {
                    color: plan.date === today ? "#ffa8d8" : "grey"
                }
            }, dish.name)
        ),
        cookTime > 0 ? div(
            {
                style: {
                    color: plan.date === today ? "#ffa8d8" : "grey"
                }
            },
            "Cook Time: ", humanTime(cookTime)
        ) : ""
    )
}

export default (dinnerPlans) => section(
    ul(
        dinnerPlans.map(menuItem)
    )
)