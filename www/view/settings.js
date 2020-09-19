import { button, div, img, style } from '../lib/fnelements.js'
import { fnstate } from '../lib/fntags.js'
import { colors } from '../fun/constants.js'
import { logout } from '../fun/auth.js'

const settingsOpen = fnstate( false )

document.body.append(
    style( `
    .settings-panel-closed {
        display: none;
    }
    .settings-page-closed { 
        bottom: 0;
    }
    .settings-page-open { 
        top: 0;
        height: 100%;
    }
    .settings-btn-img-open {
        transform: rotate(180deg);
    }
    ` )
)

const settingsToggleButton = () => {
    const btnImg = img( {
                            style: {
                                height: '8vh',
                                'margin': '10px 0'
                            },
                            src: '/images/settings_open_slider.svg',
                            class: 'settings-btn-closed'
                        }
    )
    const btn = div(
        {
            class: 'settings-btn-closed',
            style: {
                cursor: 'pointer',
                background: 'linear-gradient(0, black, #00000073)',
                'box-shadow': '-1px -1px 20px 1px ' + colors.almostBlack
            },
            onclick: () => {
                settingsOpen(!settingsOpen())
                btn.classList = settingsOpen() ? 'settings-btn-open' : 'settings-btn-closed'
                settingsPage.classList = settingsOpen() ? 'settings-page-open' : 'settings-page-closed'
                btnImg.classList = settingsOpen() ? 'settings-btn-img-open' : 'settings-btn-img-closed'
                settingsPanel.classList = settingsOpen() ? 'settings-panel-open' : 'settings-panel-closed'
            }
        },
        btnImg
    )
    return btn
}

let settingsPanel = div(
    {
        class: 'settings-panel-closed',
        style: {
            background: '#000000fe',
            height: '100%'
        }
    },
    'Shared Menus',
    'Recipees',
    button({onclick:logout}, 'Logout')
)
const settingsPage = div(
    {
        class: 'settings-page-closed',
        style: {
            left: 0,
            right: 0,
            position: 'fixed',
            margin: 'auto',
            color: 'white',
            width: '100vw'
        }
    },
    settingsToggleButton(),
    settingsPanel
)
export default settingsPage