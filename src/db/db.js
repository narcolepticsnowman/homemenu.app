const redis = require( 'redis' )
const client = redis.createClient()

client.on( 'error', function( error ) {
    console.error( error )
} )

client.set( 'key', 'value', redis.print )
client.get( 'key', redis.print )
client.send_command( '' )

const getMenus = ( chefId, dates ) => {}
const saveMenu = ( menu ) => {}

const getRecipes = ( chefId, page ) => {}
const saveRecipe = ( recipe ) => {}