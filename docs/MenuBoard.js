import {a, div, hr, img, section, span} from "./fnelements.js";
import DishView from "./DishView.js";
import {colors, humanTime, isoDateToLocaleDate, today, toMonthDay} from "./constants.js";

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
    let cookTime = plan.dishes.map(d => d.cookTime).reduce((a, b) => a + b, 0)
    return div({style: {}},
        div({
            style: {
                color: colors.red,
                'text-align': 'center',
                'font-size': '8.5vh'
            }
        }, toMonthDay(plan.date)),
        img({src: "./border.svg", style: {width: '75%'}}),
        ...plan.dishes.map((dish, i) =>
            div({
                    style: {
                        color: colors.orange,
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
        ...plan.dishes.map(dish =>
            div({
                    style: {
                        color: colors.darkGrey,
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

export default (dinnerPlans) => section(
    {
        style: {
            width: '100%'
        }
    },
    dinnerPlans.map(menuItem)
)