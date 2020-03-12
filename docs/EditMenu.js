import Modal from "./Modal.js";
import {button, div, form, input, span} from "./fnelements.js";
import {fnbind, fnstate} from "./fntags.js";
import {colors} from "./constants.js";
import {getMenuPlanByDate, saveDish, saveMenuPlan} from './datastore.js'
import autocomplete from "./autocomplete.js";
import dishes from "./dishes.js";

function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

const fixRange = (target, min, max) => {
    if (target.value > max) target.value = max
    if (target.value < min) target.value = min
}

const monthDayPicker = (date, onChange) => {

    let day = {selected: date.getDate()}
    const monthState = fnstate({month: date.getMonth() + 1})
    if (onChange && typeof onChange === 'function') {
        onChange(date)
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
                date.setMonth(monthState.month - 1)
                onChange(date)
            }
        }),
        fnbind(monthState, () => {
            const maxDay = daysInMonth(monthState.month, date.getFullYear())
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
                        date.setDate(day.selected)
                        onChange(date)
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

let menuPlan = fnstate({current: emptyPlan()})

const menuDishes = fnstate({list: []})


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

const dishForm = (dish) => {
    let dishForm = form({
            onsubmit: (e) => {
                e.preventDefault()
                saveDish(dish).then((saved) => {
                    menuPlan.current.dishIds.push(saved.id)
                    dishForm.replaceWith(existingDish(saved))
                }).catch(console.error)
            }
        },
        dishInput("Link", dish, "recipeUrl"),
        dishInput("Cook Time", dish, "cookTime", "number")
    )

    return dishForm
}

const existingDish = (dish) => div(
    span({style: {color: colors.orange, 'font-size': '3vh'}}, dish.name),
    input({
        type: 'button',
        value: 'X',
        onclick: () => {
            menuPlan.current = Object.assign(menuPlan.current, {
                dishIds: menuPlan.current.dishIds.filter(id => id !== dish.id)
            })
            menuDishes.list = menuDishes.list.filter(d => d.id !== dish.id)
        }
    })
)

const EditMenu = Modal({
        content: (planDate) => {
            if (planDate) getMenuPlanByDate(planDate).then(plan => {
                menuPlan.current = plan
                menuDishes.list = []
            })
            return fnbind(menuPlan, () => div(
                form(
                    {
                        onsubmit: (e) => {
                            e.preventDefault()
                            if (menuDishes.list.length > 0) {
                                let dishIds = menuDishes.list
                                    .map(dish => dish.id ? dish : saveDish(dish))
                                    .map(dish => dish.id)
                                menuPlan.current.dishIds = menuPlan.current.dishIds.concat(dishIds)
                            }

                            saveMenuPlan(menuPlan.current).then(() => {

                                menuDishes.list = []
                                menuPlan.current = emptyPlan()
                            })
                        }
                    },
                    div(
                        monthDayPicker(new Date(menuPlan.current.date), (selectedDate) => menuPlan.current.date = selectedDate.getTime()),
                        div(
                            div(
                                autocomplete({
                                    data: async () => {
                                        return dishes
                                    },
                                    displayProperty: "name",
                                    stringMappers: [(dish) => dish.name, (dish) => dish.recipeUrl],
                                    placeholder: "Search",
                                    resultClickHandler: (e, dish) => {
                                        menuDishes.list = menuDishes.list.concat(dish)
                                    }
                                }),
                                input({
                                    type: 'button',
                                    value: '+',
                                    onclick: () => {
                                        menuDishes.list = menuDishes.list.concat({})
                                    }
                                })
                            ),
                            fnbind(menuDishes, () => div(
                                menuDishes.list.map((dish) =>
                                    dish.id
                                        ? existingDish(dish)
                                        : dishForm(dish)
                                )
                            ))
                        ),
                        button({type: 'submit'}, 'Save'),
                    )
                )
                )
            )
        }

    }
)

export default EditMenu