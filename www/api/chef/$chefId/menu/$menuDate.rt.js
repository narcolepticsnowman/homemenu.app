const db = require( '../../../../../db/db.js' )
module.exports = {
    GET: async( { url: { pathParameters: { chefId, menuDate } } } ) =>
        await db.getMenu( chefId, menuDate )
    ,
    POST: async( { url: { pathParameters: { chefId, menuDate } }, body } ) =>
        await db.saveMenu( chefId, { ...body, date: menuDate } )

}