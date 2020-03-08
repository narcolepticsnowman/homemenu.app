import {a, button, div, hr, img, section, span} from "./fnelements.js";
import DishView from "./DishView.js";
import {colors, humanTime, isoDateToLocaleDate, today, toMonthDay} from "./constants.js";
import {getMenuPlans} from "./datastore.js";
import dishes from "./dishes.js";
import AddPlanModal from "./AddPlanModal.js";

const dishViewModal = (dish) => {
    let modal = DishView(dish)
    return a({
            onclick: (e) => {
                e.preventDefault()
                modal.open()
            }
        },
        dish.name
    )
}

const todayMenuItem = (plan) => {
    let cookTime = plan.dishIds.map(id => dishes[id] || {}).map(d => d.cookTime || 0).reduce((a, b) => a + b, 0)
    return div({style: {}},
        div({
            style: {
                color: colors.red,
                'text-align': 'center',
                'font-size': '8.5vh'
            }
        }, toMonthDay(plan.date)),
        img({src: "./border.svg", style: {width: '75%'}}),
        ...plan.dishIds.map(id => dishes[id] || {}).map((dish, i) =>
            div({
                    style: {
                        color: colors.orange,
                        cursor: 'pointer',
                        'font-size': '6.5vh',
                        'align-items': 'center',
                        'flex-direction': 'column',
                        'display': 'flex'
                    }
                },
                i > 0 ? hr({style: {color: colors.offWhite, margin: '4px', width: '60%'}}) : '',
                dishViewModal(dish)
            )
        ),
        cookTime > 0 ? div(
            {
                style: {
                    'text-align': 'center',
                    'font-size': '4vh'
                }
            },
            span({
                style: {
                    color: colors.blue
                }
            }, "Cook Time: "), span({
                style: {
                    color: colors.green
                }
            }, humanTime(cookTime))
        ) : "",
        img({src: "./border.svg", style: {width: '85%', transform: 'rotate(180deg);'}})
    )
}

const upcomingMenuItem = (plan) => {
    return div(
        div({
            style: {
                color: colors.lightGrey,
                'text-align': 'center',
                'font-size': '5.5vh'
            }
        }, toMonthDay(plan.date)),
        ...plan.dishIds.map(id => dishes[id]).map(dish =>
            div({
                    style: {
                        color: colors.darkGrey,
                        cursor: 'pointer',
                        'font-size': '4vh'
                    }
                },
                dishViewModal(dish)
            )
        )
    )
}

const menuItem = (plan) => {
    let planDate = isoDateToLocaleDate(plan.date)
    let isToday = planDate.getTime() === today().getTime();
    return isToday ? todayMenuItem(plan) : upcomingMenuItem(plan)

}

export default async () => section(
    {
        style: {
            width: '100%'
        }
    },
    await getMenuPlans().map(menuItem),
    button({onclick: () => AddPlanModal.open(), tooltip: "Add Meal Plan"}, '+')
)