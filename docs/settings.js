import {div, img, style} from "./fnelements.js";
import {fnstate} from "./fntags.js";
import {colors} from "./constants.js";

const settingsState = fnstate({isOpen: false})

document.body.append(
    style(`
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
    `)
)

const settingsToggleButton = () => {
    const btnImg = img({
            style: {
                height: '8vh',
                'margin': '10px 0',
            },
            src: "./settings_open_slider.svg",
            class: "settings-btn-closed"
        }
    )
    const btn = div(
        {
            class: 'settings-btn-closed',
            style: {
                cursor: 'pointer',
                background: 'linear-gradient(0, black, #00000073)',
                'box-shadow': '-1px -1px 20px 1px '+colors.almostBlack
            },
            onclick: () => {
                settingsState.isOpen = !settingsState.isOpen
                btn.classList = settingsState.isOpen ? "settings-btn-open" : "settings-btn-closed"
                settingsPage.classList = settingsState.isOpen ? "settings-page-open" : "settings-page-closed"
                btnImg.classList = settingsState.isOpen ? "settings-btn-img-open" : "settings-btn-img-closed"
                settingsPanel.classList = settingsState.isOpen ? "settings-panel-open" : "settings-panel-closed"
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
    "Shared Menus",
    "Dishes"
);
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