const db = require( '../../../../../db/db.js' )
module.exports = {
    GET: async( { url: { pathParameters: { recipeId } } } ) =>
        await db.getRecipe( recipeId )
    ,
    POST: async( { url: { pathParameters: { chefId, recipeId } }, body } ) =>
        await db.saveRecipe( chefId, { ...body, id: recipeId } )

}