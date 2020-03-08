import Modal from "./Modal.js";
import {button, div, form, input} from "./fnelements.js";
import {fnbind, fnstate} from "./fntags.js";
import {datePlusDays} from "./constants.js";
import {getMenuPlans} from './datastore.js'
import dishes from "./dishes.js";
import autocomplete from "./autocomplete.js";

function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

const monthDayPicker = (onChange) => {
    let maxPlanDate = getMenuPlans().map(plan => plan.date).reduce((last, curr) => last > curr ? last : curr, 0);
    const nextPlanDate = new Date(datePlusDays(maxPlanDate, 1))
    let day = nextPlanDate.getDate()
    const monthState = fnstate({month: nextPlanDate.getMonth() + 1})
    if (onChange && typeof onChange === 'function') {
        onChange(nextPlanDate)
    }
    return div(
        input({
            type: 'number',
            min: 1,
            max: 12,
            value: monthState.month,
            onchange: (e) => {
                monthState.month = e.target.value
                nextPlanDate.setMonth(monthState.month - 1)
                onChange(nextPlanDate)
            }
        }),
        fnbind(monthState, () => input({
            type: 'number',
            min: 1,
            max: daysInMonth(monthState.month, nextPlanDate.getFullYear()),
            value: day,
            onchange: (e) => {
                day = e.target.value
                if (onChange && typeof onChange === 'function') {
                    nextPlanDate.setDate(day)
                    onChange(nextPlanDate)
                }
            }
        }))
    )
}

const emptyPlan = () => ({
    date: 0,
    dishIds: []
})

let currentPlan = emptyPlan()

export default Modal({
        onClosed: () => currentPlan = emptyPlan(),
        onmounted: () => {

        },
        content: () => div(
            form(
                {
                    onsubmit: () => {

                    }
                },
                div(
                    monthDayPicker((selectedDate) => currentPlan.date = selectedDate.getTime()),
                    div("Add Dish: ", input({
                            id: 'dishNameInput',
                            type: 'text'
                        })
                    ),
                    button({type: 'submit'}, 'Save'),
                    autocomplete({
                        data: dishes,
                        displayProperty: "name",
                        stringMappers: [(dish) => dish.name, (dish) => dish.recipeUrl]
                    }),
                )
            )
        )

    }
)