import {a, div, span, style} from "./fnelements.js";
import Modal from "./Modal.js";
import {colors, humanTime} from "./constants.js";

document.head.append(style(`
    .prep-steps > div {
        margin: 10px 0;
    }
    .prep-steps {
        margin-top: 20px;
        }
`
))

const prepSteps = (steps) => div(
    {
        class: 'prep-steps'
    },
    span({
        style: {
            'font-size': '5vh',
            color: colors.orange
        }
    }, "Prep Steps"),
    ...steps.map(step =>
        div(
            div({
                style: {
                    'font-size': '4vh',
                    color: colors.blue
                }
            }, step.description),
            div({
                    style: {
                        'font-size': '3vh'
                    }
                }, span({
                    style: {
                        'font-size': '3vh',
                        color: colors.yellow
                    }
                }, "Lead Time: "), span({style: {color: colors.green}}, humanTime(step.leadTime)),
                div({
                    style: {
                        'font-size': '3vh',
                        'margin-left': '15px'
                    }
                }, span({
                    style: {
                        'font-size': '3vh',
                        color: colors.yellow
                    }
                }, "Duration: "), span({style: {color: colors.green}}, humanTime(step.duration)))
            )
        )
    )
)


export default (dish) => Modal(
    div({
            style: {
                'font-size': '6vh',
                color: colors.orange
            }
        },
        dish.name,
    ),
    dish.cookTime > 0 ? div(
        {
            style: {
                'text-align': 'center',
                'font-size': '5vh'
            }
        },
        span({
            style: {
                color: colors.yellow
            }
        }, "Cook Time: "), span({
            style: {
                color: colors.green
            }
        }, humanTime(dish.cookTime))
    ) : "",
    dish.recipeUrl ?
        div({
                style: {
                    'font-size': '5vh',
                    color: colors.yellow
                }
            },
            "Recipe: ", a({
                target: '_blank',
                style: {
                    color: colors.green
                },
                href: dish.recipeUrl,
                title: dish.recipeUrl
            }, dish.recipeUrl.split("//")[1].substr(0, 20), "..."))
        : '',
    prepSteps(dish.prepSteps)
)