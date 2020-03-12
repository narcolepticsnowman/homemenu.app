import {a, button, div, hr, img, section, span} from "./fnelements.js";
import DishView from "./DishView.js";
import {colors, humanTime, isoDateToLocaleDate, today, toMonthDay} from "./constants.js";
import {getMenuPlans} from "./datastore.js";
import dishes from "./dishes.js";
import EditMenu from "./EditMenu.js";

const dishView = DishView
const editMenu = EditMenu
const dishModalLink = (dish) => {
    return a({
            onclick: (e) => {
                e.preventDefault()
                dishView.open(dish)
            }
        },
        dish.name
    )
}

const editButton = (planDate) => {
    return button({
        onclick: (e) => {
            editMenu.open(planDate)
        }
    })
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
            }, toMonthDay(plan.date),
            editButton(plan.date)
        ),
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
                dishModalLink(dish)
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

const upcomingMenuItem = (plan) =>
    div(
        div({
                style: {
                    color: colors.lightGrey,
                    'text-align': 'center',
                    'font-size': '5.5vh'
                }
            }, toMonthDay(plan.date),
            editButton(plan.date)
        ),
        ...plan.dishIds.map(id => dishes[id]).map(dish =>
            div({
                    style: {
                        color: colors.darkGrey,
                        cursor: 'pointer',
                        'font-size': '4vh'
                    }
                },
                dishModalLink(dish)
            )
        )
    )


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
    div({
        style: {
            'font-size': '9vh',
            'height': '6vh',
            'width': '6vh',
            'line-height': '6vh',
            cursor: 'pointer',
            background: colors.lightGrey,
            'border-radius': '5px',
            display: 'flex',
            color: colors.almostBlack,
            margin: '15px auto',
            'flex-direction': 'column',
            'box-shadow': '0 0 3px 1px ' + colors.almostBlack,
            'align-items': 'center',
            padding: 0
        },
        onclick: () => EditMenu.open(),
        tooltip: "Add Meal Plan"
    }, '+')
)