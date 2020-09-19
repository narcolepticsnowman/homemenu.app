const { requiresAuthentication } = require( '../../../apiAuth.js' )
module.exports = {
    middleware: [requiresAuthentication]
}