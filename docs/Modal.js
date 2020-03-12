import {button, div, header, section} from "./fnelements.js";

export default ({content, onmounted, onclosed}) => {


    let close = button({
            style: {
                'font-size': '32px',
                float: 'right',
                cursor: 'pointer',
                padding: '5px 15px'
            }
        }
        , "X"
    )
     function getContent(){
        let children = typeof content === 'function' ? content(...arguments) : content
        return div(...(Array.isArray(children) ? children : [children]))
    }

    let currentContent = typeof content === 'function' ? div() : getContent()
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
            header(close),
            currentContent
        )
    )
    const res = {
        open(){
            if (typeof content === 'function') {
                currentContent.replaceWith(getContent(...arguments))
            }
            document.body.append(m)
            if (onmounted && typeof onmounted === 'function') {
                onmounted()
            }
        },
        close: async () => {
            if (onclosed && typeof onclosed === 'function') {
                await onclosed()
            }
            m.remove()
        }
    }
    close.onclick = () => res.close()
    return res
}