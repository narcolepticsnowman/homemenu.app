const db = require( '../../../../db/db.js' )
module.exports = {
    GET: async ({url:{pathParameters: {chefId}}}) => await db.getChef(chefId)
}