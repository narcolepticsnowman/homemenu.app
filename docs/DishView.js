import {a, div, hr, span, style} from "./fnelements.js";
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
    ...steps.map((step, i) =>
        div(
            {
                style: {
                    display: 'flex',
                    'flex-direction': 'column',
                    'align-items': 'center'
                }
            },
            i > 0 ? hr({style: {color: colors.offWhite, width: '60%'}}) : '',
            div({
                style: {
                    'font-size': '4vh',
                    color: colors.yellow
                }
            }, step.description),
            div({
                    style: {
                        'font-size': '3vh'
                    }
                }, span({
                    style: {
                        'font-size': '3vh',
                        color: colors.blue
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
                        color: colors.blue
                    }
                }, "Duration: "), span({style: {color: colors.green}}, humanTime(step.duration)))
            )
        )
    )
)


export default (dish) => Modal(
    {
        content: [ div({
                style: {
                    'font-size': '6vh',
                    color: colors.orange,
                    'margin-bottom': '5px'
                }
            },
            dish.name,
        ),
            dish.cookTime > 0 ? div(
                {
                    style: {
                        'text-align': 'center',
                        'font-size': '3vh',
                        'margin-bottom': '5px'
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
                }, humanTime(dish.cookTime))
            ) : "",
            dish.recipeUrl ?
                div({
                        style: {
                            'font-size': '4vh',
                            color: colors.blue,
                            'margin-bottom': '20px'
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
            hr({style: {color: colors.offWhite, margin: '8px'}}),
            dish.prepSteps && dish.prepSteps.length > 0 ? prepSteps(dish.prepSteps) : ''
        ]
    }
)