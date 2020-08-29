import { fnstate } from '../lib/fntags.js'
import { datePlusDays, today } from './constants.js'
import { arrayParam } from './toParam.js'
import { chefPath, get, post } from './api.js'

export const menusLoaded = fnstate( false )
export const currentWeek = fnstate( [] )

const newMenu = (date) =>({
    date,
    recipeIds: []
})

const getMenusAround = async( date ) => {
    const startDate = new Date( date )
    startDate.setHours( 0, 0, 0, 0 )
    startDate.setDate( startDate.getDate() - 3 )

    let dates = [ ...new Array( 7 ).keys() ].map( i => datePlusDays( startDate, i ) )
    return (await get( chefPath( `/menu?${arrayParam('date', dates )}` ) )).map((menu, i)=>menu||newMenu(dates[i]))
}

export const loadData = async() => {
    if( !menusLoaded() ) {
        currentWeek( await getMenusAround( today() ) )
        menusLoaded( true )
    }
}

export const getRecipeById = async( recipeId ) => await get( chefPath( `/recipe/${recipeId}` ) )

export const getMenu = async( msDate ) => await (get( chefPath( `/menu/${msDate}` ) )) || newMenu(msDate)

export const saveRecipe = async( recipe ) => await post( chefPath( `/recipe` ), recipe )

export const saveMenu = async( menu ) => {
    let saved = await post( chefPath( '/menu' ), menu )
    currentWeek( currentWeek().map( p => p.date === saved.date ? saved : p ) )
    return saved
}

//TODO implement autocomplete
//https://redislabs.com/ebook/part-2-core-concepts/chapter-6-application-components-in-redis/6-1-autocomplete/6-1-2-address-book-autocomplete/
export const getRecipeNameIndex = async() => []