const db = require( '../../../../../db/db.js' )
module.exports = {
    GET: async( { url: { pathParameters: { chefId }, query: { page, size } } } ) => await db.getRecipes( chefId, page, size )
}