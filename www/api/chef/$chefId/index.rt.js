const db = require( '../../../../fun/db/db.js' )
module.exports = {
    GET: async ({url:{pathParameters: {chefId}}}) => await db.getChef(chefId)
}