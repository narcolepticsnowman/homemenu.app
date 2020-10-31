import { div } from '../../lib/fnelements.js'

export const centeredBlock = ( ...children ) => div(
    {
        style: {
            display: 'flex',
            'flex-direction': 'column',
            'align-items': 'center',
            height: '50vh',
            'justify-content': 'center'
        }
    },
    ...children
)