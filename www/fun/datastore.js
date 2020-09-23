import { fnstate } from '../lib/fntags.js'
import { datePlusDays, today } from './constants.js'
import { arrayParam } from './toParam.js'
import { chefPath, apiGet, apiPost } from './api.js'

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
    return (await apiGet( chefPath( `/menu?${arrayParam( 'date', dates )}` ) )).map( ( menu, i)=> menu || newMenu( dates[i]))
}

export const loadData = async() => {
    if( !menusLoaded() ) {
        currentWeek( await getMenusAround( today() ) )
        menusLoaded( true )
    }
}

export const getRecipeById = async( recipeId ) => await apiGet( chefPath( `/recipe/${recipeId}` ) )

export const getMenu = async( msDate ) => await (apiGet( chefPath( `/menu/${msDate}` ) )) || newMenu( msDate)

export const saveRecipe = async( recipe ) => await apiPost( chefPath( `/recipe` ), recipe )

export const saveMenu = async( menu ) => {
    let saved = await apiPost( chefPath( '/menu' ), menu )
    currentWeek( currentWeek().map( p => p.date === saved.date ? saved : p ) )
    return saved
}


export const getRecipeIndex = async() => {}