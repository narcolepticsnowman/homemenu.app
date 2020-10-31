const db = require( '../../../../../db/db.js' )
module.exports = {
    GET: async( { url: { pathParameters: { chefId }, query: { page, size, q } } } ) =>
        q ?
            await db.findRecipes(chefId, q, page, size)
          : await db.getRecipes( chefId, page, size )
    ,
    POST: async( { url: { pathParameters: { chefId } }, body } ) =>
        await db.saveRecipe( chefId, { ...body } )
}