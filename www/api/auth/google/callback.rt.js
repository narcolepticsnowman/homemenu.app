const { createToken } = require( '../../../../apiAuth.js' )
const { googleAuth } = require( '../../../../apiAuth.js' )
module.exports = {
    middleware: [googleAuth],
    GET: ({req,res})=>res.redirect('/?authToken='+createToken(req.user._json))
}