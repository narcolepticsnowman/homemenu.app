import {today} from "./constants.js";
import {fnstate} from "./fntags.js";



const datePlusDays = (date, days) => {

    const d = new Date(today().getTime())
    d.setDate(d.getDate() + days)

    return d.toLocaleDateString('sv')
}
export const dinnerPlans = fnstate({list: [
    {
        date: datePlusDays(today(), 0),
        dishes: [
            {
                name: "Marinated Flank Steak",
                recipe: null,
                recipeUrl: "http://allrecipes.com",
                imageUrl: null,
                cookTime: 20,
                prepSteps: [
                    {
                        leadTime: (24 * 60) * 2,
                        duration: 5,
                        description: "Put steak in fridge to defrost"
                    },
                    {
                        leadTime: 240,  //in minutes
                        duration: 15,
                        description: "Marinate Steak"
                    }
                ]
            },
            {
                name: "Roasted Cauliflower",
                cookTime: 20,
                recipe: {
                    ingredients: [
                        {
                            amount: "1 whole",
                            name: "Cauliflower"
                        },
                        {
                            amount: "1 tsp",
                            name: "Salt"
                        },
                        {
                            amount: "1 tbsp",
                            name: "Garlic"
                        },
                        {
                            amount: "4 tbsp",
                            name: "olive oil"
                        }
                    ],
                    steps: [
                        "remove green bottom of cauliflower",
                        "place in pan",
                        "Top with olive oil, salt and garlic",
                        "bake for 1 hr"
                    ]
                },
                recipeUrl: null,
                imageUrl: null,
                prepSteps: []
            }
        ],
    },
    {
        date: datePlusDays(today(), 1),
        dishes: [
            {
                name: "Eat Out",
                recipe: null,
                recipeUrl: null,
                imageUrl: null,
                cookTime: 0,
                prepSteps: []
            }
        ],
    },
    {
        date: datePlusDays(today(), 2),
        dishes: [
            {
                name: "Spaghetti",
                recipe: null,
                recipeUrl: "http://allrecipes.com",
                imageUrl: null,
                cookTime: 15,
                prepSteps: []
            }
        ],
    },
    {
        date: datePlusDays(today(), 3),
        dishes: [
            {
                name: "Bowl of Jellybeans",
                recipe: null,
                recipeUrl: "http://allrecipes.com",
                imageUrl: null,
                cookTime: 15,
                prepSteps: []
            }
        ],
    }
]})