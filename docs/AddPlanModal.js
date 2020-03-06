import Modal from "./Modal.js";
import {button, div, form, input} from "./fnelements.js";
import {fnbind, fnstate} from "./fntags.js";
import {datePlusDays} from "./constants.js";
import {dinnerPlans} from "./dinnerPlans.js";
import dishes from "./dishes.js";

function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

const monthDayPicker = (onChange) => {
    let maxPlanDate = dinnerPlans.list.map(plan => plan.date).reduce((last, curr) => last > curr ? last : curr, 0);
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


export default Modal({
        onmounted: () => {
            new autoComplete({
                data: {
                    src: Object.values(dishes),
                    key: ["name"],
                    cache: false
                },
                sort: (a, b) => {
                    if (a.match < b.match) return -1;
                    if (a.match > b.match) return 1;
                    return 0;
                },
                placeHolder: "Search Dishes",
                selector: "#dishNameInput",
                maxResults: 5,
            });
        },
        content: () => {
            const dinnerPlan = {
                date: 0,
                dishIds: []
            }


            return div(
                form(
                    {
                        onsubmit: () => {

                        }
                    },
                    div(
                        monthDayPicker((selectedDate) => dinnerPlan.date = selectedDate.getTime()),
                        div("Add Dish: ", input({
                                id: 'dishNameInput',
                                type: 'text'
                            })
                        ),
                        button({type: 'submit'}, 'Save')
                    )
                )
            )
        }
    }
)