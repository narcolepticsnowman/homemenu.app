const db = require( '../../../../../fun/db/db.js' )
module.exports = {
    GET: async ({url:{pathParameters: {chefId}, query:{page, size, date}}}) => {
        if(date){
            if(!Array.isArray(date)) date = [date]
            return await db.getMenusByDate(chefId, date)
        } else{
            await db.getMenus(chefId, page, size)
        }
    }
}