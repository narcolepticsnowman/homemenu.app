import Modal from "./Modal.js";
import {button, div, form, input} from "./fnelements.js";
import {fnbind, fnstate} from "./fntags.js";
import {datePlusDays, today} from "./constants.js";
import {getDishes, getMenuPlans, saveDish, saveMenuPlan} from './datastore.js'
import dishes from "./dishes.js";
import autocomplete from "./autocomplete.js";

function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

const fixRange = (target, min, max) => {
    if (target.value > max) target.value = max
    if (target.value < min) target.value = min
}

const monthDayPicker = (onChange) => {
    let maxPlanDate = getMenuPlans().map(plan => plan.date).reduce((last, curr) => last > curr ? last : curr, 0);
    const nextPlanDate = maxPlanDate === 0 ? today() : new Date(datePlusDays(maxPlanDate, 1))
    let day = {selected: nextPlanDate.getDate()}
    const monthState = fnstate({month: nextPlanDate.getMonth() + 1})
    if (onChange && typeof onChange === 'function') {
        onChange(nextPlanDate)
    }
    return div(
        input({
            type: 'number',
            min: '1',
            max: '12',
            value: monthState.month,
            onchange: (e) => {
                fixRange(e.target, 1, 12)
                monthState.month = e.target.value
                nextPlanDate.setMonth(monthState.month - 1)
                onChange(nextPlanDate)
            }
        }),
        fnbind(monthState, () => {
            const maxDay = daysInMonth(monthState.month, nextPlanDate.getFullYear())
            if (day.selected > maxDay) {
                day.selected = maxDay
            }
            return input({
                type: 'number',
                min: '1',
                max: maxDay.toString(),
                value: day.selected,
                onchange: (e) => {
                    fixRange(e.target, 1, maxDay)
                    day.selected = e.target.value
                    if (onChange && typeof onChange === 'function') {
                        nextPlanDate.setDate(day.selected)
                        onChange(nextPlanDate)
                    }
                }
            })
        })
    )
}

const emptyPlan = () => ({
    date: 0,
    dishIds: []
})

let currentPlan = emptyPlan()

const newDishes = fnstate({list: []})


/*
{
        id: 1,
        name: "Marinated Flank Steak",
        recipe: null,
        recipeUrl: "http://allrecipes.com",
        imageUrl: null,
        cookTime: 20
 */

const dishInput = (placeholder, newDish, prop, type = 'text') =>
    input({
        value: newDish[prop] || '',
        onchange: (e) => {
            newDish[prop] = e.target.value
        },
        placeholder
    })

const dishForm = (newDish, onsaved, onsavederror = console.error) =>
    form({
            onsubmit: (e) => {
                e.preventDefault()
                saveDish(newDish).then(onsaved).catch(onsavederror)
            }
        },
        autocomplete({
            data: Array.from(Object.values(getDishes())),
            displayProperty: "name",
            stringMappers: [(dish) => dish.name, (dish) => dish.recipeUrl],
            placeholder: "Name",
            onchange: (e) => newDish.name = e.target.value
        }),
        dishInput("Link", newDish, "recipeUrl"),
        dishInput("Cook Time", newDish, "cookTime", "number")
    )

const AddPlanModal = Modal({
        onClosed: () => currentPlan = emptyPlan(),
        onmounted: () => {

        },
        content: () => div(
            form(
                {
                    onsubmit: (e) => {
                        e.preventDefault()
                        saveMenuPlan(currentPlan).then(AddPlanModal.close)
                    }
                },
                div(
                    monthDayPicker((selectedDate) => currentPlan.date = selectedDate.getTime()),
                    div(
                        div(
                            input({
                                type: 'button',
                                value: 'Add Dish',
                                onclick: () => {
                                    newDishes.list = newDishes.list.concat({})
                                }
                            })
                        ),
                        fnbind(newDishes, () => div(newDishes.list.map((newDish, i) => {
                                return dishForm(newDish, (savedDish) => {
                                    currentPlan.dishIds.push(savedDish.id)
                                    newDishes.list = newDishes.splice(i, 1)
                                },)
                            })
                        ))
                    ),
                    button({type: 'submit'}, 'Save'),
                )
            )
        )

    }
)

export default AddPlanModal