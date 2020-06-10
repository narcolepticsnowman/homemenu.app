import {fnapp, fnbind, observeState} from 'fntags'
import {div, img, style} from 'fnelements'
import MenuBoard from "./MenuBoard.js";
import {colors} from "./api/constants.js";
import settings from "./settings.js";
import {authState, init, login} from "./api/gooooogle_sign-in.js";
import {loadData, datastoreState} from "./api/datastore.js";
import drive from "./api/drivedb.js";
import loading from "./loading.js";


const centeredBlock = (...children) => div(
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
    style(`
            body {
                background-image: url(./chalkboardBackground.jpg);
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
        `)
)

observeState(authState, () => {
    if (authState.isAuthenticated) loadData()
})
drive.init('601450421542-3fmfpref2qphpet3jq4qj3a5gge28bm0.apps.googleusercontent.com', "AIzaSyDJFL-DprA2DFg_GEzGPrMLuFLTJl0p8mY")
     .then(init)
let loadingBlock = centeredBlock(loading(125));
fnapp(document.body,
      fnbind(authState, () =>
          authState.isLoaded ?
          authState.isAuthenticated ?
          div(
              {
                  style: {
                      margin: 'auto',
                      display: 'flex',
                      'flex-direction': 'column',
                      'max-width': '650px',
                      'text-align': 'center',
                      'justify-content': 'center',
                      'min-height': '80vh',
                  }
              },
              fnbind(datastoreState, () => {
                  return datastoreState.loaded ? MenuBoard() : loadingBlock
              }),
              settings
          )
                                    :
          centeredBlock(
              div({style: {'font-size': '4vh', color: colors.orange}}, "Menu Board"),
              img({src: "./google_sign_in_btn.png", style: {cursor: 'pointer'}, onclick: () => login()})
          )
                             :

          loadingBlock
      )
)