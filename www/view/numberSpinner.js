import { div } from '../lib/fnelements.js'
import { colors, fixRange } from '../fun/constants.js'
import { fnstate } from '../lib/fntags.js'

export default ( input ) => {
    const valueState = fnstate( input.value && parseInt( input.value ) || 0 )


    const ogOnchange = input.onchange
    input.onchange = ( e ) => {
        fixRange( e.target, input.getAttribute( 'min' ), input.getAttribute( 'max' ) )
        valueState(parseInt( e.target.value ))
        ogOnchange( e )
    }
    // input.style.setProperty()
    return div(
        {
            style: {
                color: colors.offWhite,
                display: 'inline-flex'
            }
        },
        valueState.bindAs( input, () => input.value = valueState() ),
        div( {
                 style: {
                     display: 'flex',
                     'flex-direction': 'column',
                     'justify-content': 'center'
                 }
             },
             div( {
                      onclick: () => valueState.patch({value: valueState().value++})
                  }, '\u25B2' ),
             div(
                 {
                     onclick: () => valueState.patch({value: valueState().value--})
                 },
                 '\u25BC' )
        )
    )
}