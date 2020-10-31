import { div, style } from './lib/fnelements.js'
import MenuBoard from './view/MenuBoard.js'
import settings from './view/settings.js'
import { chefLoaded, isAuthenticated, loginForm } from './fun/auth.js'
import { loadData, menusLoaded } from './fun/datastore.js'

import loading from './view/loading.js'
import { centeredBlock } from './view/component/centeredBlock.js'

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

isAuthenticated.subscribe( () => isAuthenticated() && chefLoaded() && loadData() )

let loadingBlock = centeredBlock( loading( 125 ) )

let mainContent = function() {
    return div(
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
        menusLoaded.bindAs( () => menusLoaded() ? MenuBoard() : loadingBlock ),
        settings
    )
}

document.body.append(
    isAuthenticated.bindAs(
        () =>
            isAuthenticated()
            ? mainContent() : loginForm()
    )
)