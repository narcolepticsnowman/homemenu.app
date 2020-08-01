import {div, span} from "fnelements";
import {colors} from "./api/constants.js";


const makeDots = (i)=> span(
    {
        style: {

        }
    },
    [...new Array(5).keys()].map(j => j === i ? '.' : "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0").join('')
)

const nextDots = (lasti, dots, speed) => ()=>{
    let nexti = lasti+1
    if(nexti >= 5) {
        nexti = 0
    }
    let next = makeDots(nexti);
    dots.replaceWith(next)
    setTimeout(nextDots(nexti, next, speed), speed)
}

export default (speed)=> {
    const dots = makeDots(0)
    setTimeout(nextDots(0, dots, speed), speed)
    return div(
        {style:{'font-size': '4vh', color: colors.blue}},
        "Loading",dots
    )
}