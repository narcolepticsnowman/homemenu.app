const passport = require( 'passport' )
const db = require( './db/db.js' )
const JwtStrategy = require( 'passport-jwt' ).Strategy
const ExtractJwt = require( 'passport-jwt' ).ExtractJwt
const GoogleStrategy = require( 'passport-google-oauth20' ).Strategy
const jwt = require('jsonwebtoken')

const jwtSecret = process.env.JWT_SECRET || 'bogus_secret'
const jwtValidFor = process.env.JWT_VALID_FOR || '1h'

passport.use(
    new JwtStrategy(
        {
            secretOrKey: jwtSecret,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            issuer: process.env.APP_HOSTNAME,
            passReqToCallback: true,
            jsonWebTokenOptions: {
                maxAge: jwtValidFor
            }
        },
        ( req, jwtPayload, done ) => {
            if(req.spliffyUrl.pathParameters.chefId !== jwtPayload.sub){
                done('Incorrect UserId')
            } else {
                done(null, jwtPayload)
            }
        }
    ) )
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback'
        },
        ( accessToken, refreshToken, profile, cb ) => cb( null, profile )
    )
)


module.exports = {
    init() {
        return passport.initialize()
    },
    requiresAuthentication: passport.authenticate( 'jwt', { session: false, failureRedirect: '/' } ),
    googleAuth: passport.authenticate( 'google', { session: false, scope: [ 'profile' ], failureRedirect: '/'  } ),
    createToken(jwtInfo){
        return jwt.sign(Object.assign(jwtInfo, { iss: process.env.APP_HOSTNAME, id: jwtInfo.sub }), jwtSecret, { expiresIn: jwtValidFor });
    }
}