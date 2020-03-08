import {div, input} from "./fnelements.js";
import {fnbind, fnstate} from "./fntags.js";
import {colors} from "./constants.js";

/**
 * Create an input that pops up a list of items that match the input text
 * @param data The data to search
 * @param displayProperty The object property to search, not needed for primitive values
 * @param stringMappers An array of functions that will map an object in the array to a string
 * @param style An object to override styles of the containing div
 * @returns {HTMLDivElement}
 */
export default ({data, displayProperty, stringMappers, style, resultClickHandler}) => {
    const search = fnstate({current: ""})
    const updateSearch = (e) => search.current = e.target.value.toLowerCase()

    const d = Array.isArray(data) ? data : Object.values(data)

    const dataElements = d.filter(v => v).map(
        val => {
            if (typeof val === 'object') {
                if (!displayProperty) {
                    console.trace("No displayProperty provided to autocomplete, but matched an object. Returning nothing.")
                    return {record: val, str: ""}
                } else {
                    return {record: val, str: (val[displayProperty] || "").toString()}
                }
            } else {
                return {record: val, str: val.toString}
            }
        })
        .map(recordWithStringRepr => {
                const record = recordWithStringRepr.record
                if (typeof record === "object" && (stringMappers == null || !Array.isArray(stringMappers) || stringMappers.length < 1)) {
                    console.trace("stringMappers must be an array of at least one function that returns a string given a record")
                }
                const searchStrings =
                    typeof record === 'object'
                        ? stringMappers.map(mapper => (mapper(record) || '').toLowerCase())
                        : [record.toString().toLowerCase()]
                return {
                    record,
                    element: div(
                        {
                            style: {
                                'font-size': '2.5vh', color: 'black'
                            }
                        },
                        recordWithStringRepr.str
                    ),
                    searchStrings
                }
            }
        )

    return div(
        {
            style: {
                position: 'relative',
                'display': 'flex',
                'flex-direction': 'column',
                'align-items': 'center',
                ...style
            }
        },
        input({
            type: 'text', style: {
                height: '4vh',
                'font-size': '3vh',
                width: '32vw',
                'border-radius': '3px'
            }, value: search.current, onkeyup: updateSearch, onchange: updateSearch
        }),
        fnbind(search,
            () => div(
                {
                    style: {
                        position: 'absolute',
                        top: '4.7vh',
                        'background-color': colors.offWhite,
                        padding: '10px',
                        display: search.current ? "block" : "none",
                        'box-shadow': '-1px -1px 20px 1px #'+colors.offWhite,
                        width: '34vw',
                        'border-radius':'6px'
                    }
                },
                dataElements
                    .filter(d => {
                        if (search.current.length >= 1) {
                            return d.searchStrings.filter(str => str.match(search.current)).length > 0
                        }
                        return false
                    })
                    .map(d => d.element)
            )
        )
    )
}