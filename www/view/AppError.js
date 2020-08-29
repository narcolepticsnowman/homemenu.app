import { colors } from '../fun/constants.js'
import { div } from '../lib/fnelements.js'

/**
 * Show an application error on the page
 * @param errorTitle string or htlm element
 * @param errorBody string or htlm element
 */

export default function showError( errorTitle, errorBody ) {
    console.log( 'Showed error', errorTitle, errorBody )
    const el = div(
        {
            style: {
                position: 'absolute',
                display: 'flex',
                width: '80vw',
                height: '10vh',
                bottom: 0,
                margin: 'auto',
                background: colors.lightRed
            }
        },
        div( errorTitle ),
        div( errorBody ),
        div( { onclick: () => el.remove() }, 'X' )
    )

    document.body.append( el )
    setTimeout( () => el.remove(), 15000 )
}