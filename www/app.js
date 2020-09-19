import { fnapp, fnbind } from './lib/fntags.js'
import { div, img, style } from './lib/fnelements.js'
import MenuBoard from './view/MenuBoard.js'
import { colors } from './fun/constants.js'
import settings from './view/settings.js'
import { chefLoaded, isAuthenticated, login } from './fun/auth.js'
import { menusLoaded, loadData } from './fun/datastore.js'

import loading from './view/loading.js'

const centeredBlock = ( ...children ) => div(
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

document.head.append(
    style( `
            body {
                background-image: url(/images/chalkboardBackground.jpg);
                background-position: center;
                background-size: cover;
                min-height: 100vh;
                font-family: radium;
                margin: 0;
            }
            input {
                font-family: radium;
            }
            @font-face {
                font-family: 'radium';
                src: url('radium.woff') format('woff');
            }
            button {
                background-color: grey;
                border-color: black;
                border-radius: 4px;
                padding: 10px;
                font-family: radium;
            }
        ` )
)

isAuthenticated.subscribe( () => {
    if( isAuthenticated() && chefLoaded() ) loadData()
} )

let loadingBlock = centeredBlock( loading( 125 ) )
fnapp( document.body,
       fnbind( [ isAuthenticated, chefLoaded ], () =>
           chefLoaded() ?
           isAuthenticated() ?
           div(
               {
                   style: {
                       margin: 'auto',
                       display: 'flex',
                       'flex-direction': 'column',
                       'max-width': '650px',
                       'text-align': 'center',
                       'justify-content': 'center',
                       'min-height': '80vh'
                   }
               },
               fnbind( menusLoaded, () => {
                   return menusLoaded() ? MenuBoard() : loadingBlock
               } ),
               settings
           )
                             :
           centeredBlock(
               div( { style: { 'font-size': '4vh', color: colors.orange } }, 'Menu Board' ),
               img( { src: '/images/google_sign_in_btn.png', style: { cursor: 'pointer' }, onclick: () => login() } )
           )
                        :

           loadingBlock
       )
)