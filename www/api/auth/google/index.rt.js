const { googleAuth } = require( '../../../../apiAuth.js' )

module.exports = {
    middleware: [googleAuth],
    GET: () => {}
}
