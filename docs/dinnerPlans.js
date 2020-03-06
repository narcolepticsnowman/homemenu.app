import {datePlusDays, today} from "./constants.js";
import {fnstate} from "./fntags.js";


export const dinnerPlans = fnstate({
    list: [
        {
            date: datePlusDays(today(), 0),
            dishIds: [1, 2],
        },
        {
            date: datePlusDays(today(), 1),
            dishIds: [3],
        },
        {
            date: datePlusDays(today(), 2),
            dishIds: [4],
        },
        {
            date: datePlusDays(today(), 3),
            dishIds: [5],
        }
    ]
})