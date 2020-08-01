import {div} from "fnelements";
import {colors, fixRange} from "./api/constants.js";
import {fnbind, fnstate} from "fntags";

export default (input) => {
    const valueState = fnstate({value: input.value && parseInt(input.value) || 0})


    const ogOnchange = input.onchange
    input.onchange = (e) => {
        fixRange(e.target, input.getAttribute("min"), input.getAttribute("max"))
        valueState.value = parseInt(e.target.value)
        ogOnchange(e)
    }
    // input.style.setProperty()
    return div(
        {
            style: {
                color: colors.offWhite,
                display: 'inline-flex'
            }
        },
        fnbind(valueState, input, () => input.value = valueState.value),
        div({
                style: {
                    display: "flex",
                    'flex-direction': 'column',
                    'justify-content': 'center'
                }
            },
            div({
                onclick: () => valueState.value++
            }, '\u25B2'),
            div(
                {
                    onclick: () => valueState.value--
                },
                '\u25BC')
        )
    )
}