const db = require( '../../../../../db/db.js' )
module.exports = {
    GET: async( {
                    url: {
                        pathParameters: { chefId },
                        query: { page, size, date }
                    }
                } ) => date ?
                       await db.getMenusByDate( chefId, date )
                            : await db.getMenus( chefId, page, size ),

    POST: async( {
                     url: { pathParameters: { chefId } },
                     body: menu
                 } ) => await db.saveMenu( chefId, menu )
}