const redish = require( 'redish' )
const redis = require( 'redis' )

const client = redis.createClient( { host: process.env.ARDB_SERVICE_HOST || 'localhost', port: 16379 } )
// client.auth("90d959b7-03b1-43f7-8f55-8ea716a29b2f", console.log)
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

const checkTruthy = ( error ) => ( value ) => {
    if( !value ) throw new Error( error )
    else return value
}
const checkChefId = checkTruthy( 'ChefId must be Truthy' )
const checkRecipeId = checkTruthy( 'recipeId must be Truthy' )
const checkMsDate = ( date ) => {
    if( new Date( parseInt( date ) ).getTime() != date ) throw new Error( 'Invalid date: ' + date )
    else return date
}
const menuId = ( chefId, msDate ) => 'chef-' + checkChefId( chefId ) + '-menu-' + checkMsDate( msDate )
const menuKey = ( chefId ) => 'menu-' + checkChefId( chefId )
const recipeKey = ( chefId ) => 'recipe-' + checkChefId( chefId )
const recipeKeywordsKey = ( chefId ) => 'recipeKeywords-' + checkChefId( chefId )

const handleNotFound = (obj)=>{
    if(!obj) throw {statusCode: 404, statusMessage: 'Not Found'}
    else return obj
}

//TODO add schema validation with js-schema on the frontend and backend

module.exports = {
    getMenu: async( chefId, date ) => handleNotFound(await db.findOneById( menuId( chefId, date ) )),
    getMenus:
        async( chefId, page, size ) =>
            await db.findAll( menuKey( chefId ), page, size ) ,
    getMenusByDate:
        async( chefId, dates ) =>
            await Promise.all(
                ( Array.isArray( dates ) ? dates : [ dates ] )
                    .map( dt => db.findOneById( menuId( chefId, dt ) ) )
            ),
    saveMenu:
        async( chefId, menu ) =>
            await db.save(
                ensureMenuValid( menu ),
                {
                    collectionKey: menuKey( chefId ),
                    idGenerator: ( obj ) => menuId( chefId, obj.date )
                }
            ),
    getRecipes:
        async( chefId, page, size ) =>
            await db.findAll( recipeKey( chefId ), page, size ),
    getRecipe:
        async( recipeId ) =>
            handleNotFound(await db.findOneById( checkRecipeId( recipeId ) )),
    getChef:
        async( chefId ) =>
            handleNotFound(await db.findOneById( checkChefId( chefId ) )),
    saveRecipe:
        async( chefId, recipe ) => {
            //TODO implement saving keywords to a set to enable search and autocomplete
            //await db.save( extractKeywords( recipe ), recipeKeywordsKey( chefId ) )
            return await db.save( ensureRecipeValid( recipe ), recipeKey( chefId ) )
        }
}
