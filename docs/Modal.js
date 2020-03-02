import {button, div, header, section} from "./fnelements.js";

const modal = (...children) => {

    let close = button({
            style: {
                'font-size': '32px',
                float: 'right',
                padding: '5px 15px'
            }
        }
        , "X"
    )
    let m = div(
        {
            style: {
                width: '100%',
                height: '100%',
                position: 'fixed',
                top: 0,
                left: 0,
                'background-image': 'url(./chalkboardBackground.jpg)',
                'background-position': 'center',
                'background-repeat': 'no-repeat',
                'background-size': 'cover',
            }
        },
        section({
                style: {
                    width: '100%',
                    'max-width': '650px',
                    margin: 'auto',
                    'text-align': 'center',
                    'padding-top': '20px'
                }
            },
            header(close)
            ,
            ...children
        )
    )
    const res = {
        open: () => document.body.append(m),
        close: () => m.remove()
    }
    close.onclick = () => res.close()
    return res
}

export default (...children) => modal(...children)