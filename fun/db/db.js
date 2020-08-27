const redis = require( 'redish' )
const client = redis.createClient()
const redish = require( 'redish' )
const db = redish.createDb( client )

client.on( 'error', function( error ) {
    console.error( error )
} )

const ensureMenuValid = ( menu ) => {
    if( !menu ) throw 'Nothing to save', menu
    let parsed
    try {
        parsed = new Date( menu.date )
    } catch(e) {
        throw 'Failed to parse menu Date: ', menu.date, e
    }
    if( !parsed || parsed.getTime() !== menu.date ) throw 'Menu must have a valid date'
    return menu
}

const ensureRecipeValid = ( recipe ) => {
    return recipe
}

const menuId = ( chefId, msDate ) => chefId + '-menu-' + msDate
const menuKey = ( chefId ) => chefId + '-menu'
const recipeKey = ( recipe ) => recipe + '-recipe'


const getMenusByDate = async( chefId, dates ) => await Promise.all( dates.map( dt => getMenu( chefId, dt ) ) )
const getMenus = async( chefId, page, size ) => await db.findAll(menuKey(chefId), page, size)
const getMenu = async( chefId, date ) => await db.findOneById( menuId( chefId, date ) )
const saveMenu = async( chefId, menu ) => await db.save( ensureMenuValid( menu ), menuKey( chefId ), ( obj ) => menuId( chefId, obj.date ) )

const getRecipes = async( chefId, page, size ) => await db.findAll( recipeKey( chefId ), page, size )
const saveRecipe = async( chefId, recipe ) => await db.save( ensureRecipeValid( recipe ), recipeKey( chefId ) )
const getRecipe = async( recipeId ) => await db.findOneById( recipeId )
const getChef = async( chefId ) => await db.findOneById( chefId )

module.exports = {
    getMenu, getMenus, getMenusByDate, saveMenu, getRecipes, getRecipe, getChef, saveRecipe
}