import {button, div, header, section} from "./fnelements.js";
import {getAttrs} from "./fntags.js";

const modal = (...children) => {

    const attrs = getAttrs(children)

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
    const contentDiv = (children) => div(...(Array.isArray(children) ? children : [children]))

    let currentContent = contentDiv(children);
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
        open: () => {
            if (typeof attrs.content === 'function') {
                let content = attrs.content()
                currentContent.replaceWith(contentDiv(content))
            }
            document.body.append(m)
            if (attrs.onmounted && typeof attrs.onmounted === 'function') {
                setTimeout(attrs.onmounted, 1)
            }
        },
        close: () => m.remove()
    }
    close.onclick = () => res.close()
    return res
}

export default (...children) => modal(...children)