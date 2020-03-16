import {button, div, header, section} from "./fnelements.js";
import {colors} from "./constants.js";

export default ({content, onmounted, onclosed}) => {

    let closebtn = div({
            onmouseover() {
                this.style.color = '#FFFFFF'
            },
            onmouseout() {
                this.style.color = colors.offWhite
            },
            style: {
                'font-size': '32px',
                float: 'right',
                cursor: 'pointer',
                padding: '5px 15px',
                color: colors.offWhite
            }
        }
        , "X"
    )

    let currentContent = typeof content === 'function' ? div() : content
    let m = div(
        {
            style: {
                width: '100%',
                height: '100%',
                position: 'fixed',
                top: 0,
                left: 0,
                'background-color': '#151515eb',
                'background-position': 'center',
                'background-size': 'cover',
            }
        },
        section({
                style: {
                    width: '92%',
                    'max-width': '650px',
                    margin: 'auto',
                    'text-align': 'center',
                    'padding-top': '20px'
                }
            },
            header(closebtn),
            currentContent
        )
    )

    const close = async () => {
        if (onclosed && typeof onclosed === 'function') {
            await onclosed()
        }
        m.remove()
    }

    function getContent() {
        let children = typeof content === 'function' ? content(...arguments, close) : content
        return div(...(Array.isArray(children) ? children : [children]))
    }

    const res = {
        open() {
            if (typeof content === 'function') {
                currentContent.replaceWith(getContent(...arguments, close))
            }
            document.body.append(m)
            if (onmounted && typeof onmounted === 'function') {
                onmounted()
            }
        },
        close
    }
    closebtn.onclick = () => res.close()
    return res
}