export default {
    1: {
        meta:{
            id: 1,
        },
        name: "Marinated Flank Steak",
        recipe: null,
        recipeUrl: "http://allrecipes.com",
        recipeImg: null,
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
    2: {
        id: 2,
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
    },
    3: {
        id: 3,
        name: "Eat Out",
        recipe: null,
        recipeUrl: null,
        imageUrl: null,
        cookTime: 0,
        prepSteps: []
    },
    4: {
        id: 4,
        name: "Spaghetti",
        recipe: null,
        recipeUrl: "http://allrecipes.com",
        imageUrl: null,
        cookTime: 15,
        prepSteps: []
    },
    5: {
        id: 5,
        name: "Bowl of Jellybeans",
        recipe: null,
        recipeUrl: "http://allrecipes.com",
        imageUrl: null,
        cookTime: 15,
        prepSteps: []
    }
}