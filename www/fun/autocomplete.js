import { div, input, object } from '../lib/fnelements.js'
import { fnbind, fnstate } from '../lib/fntags.js'
import { colors } from './constants.js'


/**
 * Create an input that pops up a list of items that match the input text
 * @param data The data to search
 * @param displayProperty The object property to search, not needed for primitive values
 * @param stringMappers An array of functions that will map an object in the array to a string
 * @param style An object to override styles of the containing div
 * @param inputStyle An object to override styles of the input element
 * @param resultClickHandler A click handler that will be attached to each result element. The handler receives the
 *          click event as the first argument and the record that matched as the second
 * @param placeholder The placeholder text for the input
 * @param onchange A change handler for the search input
 * @param debounce The minimum time in ms to wait between calling the data function
 * @returns {HTMLDivElement}
 */
export default ( {
                     data,
                     displayProperty = '',
                     stringMappers = [],
                     style = {},
                     inputStyle = {},
                     resultClickHandler = () => {
                     },
                     placeholder = '',
                     onchange = () => {
                     },
                     debounce = 600
                 } ) => {
    let search = fnstate( { text: '' } )
    const dataElements = fnstate( { current: [] } )
    let lastTriggered = 0
    let triggered = false
    let queued = false
    let lastData = typeof data === 'function' ? [] : data
    const toDataArray = async( data, search, useCached ) => {
        let values
        if( typeof data === 'function' ) {
            values = useCached ? lastData
                               : await data( search )
        }

        if( Array.isArray( values ) ) {
            return values
        } else if( typeof values === 'object' ) {
            return Array.from( Object.values( values ) )
        } else {
            return [ values ]
        }
    }
    const updateSearch = ( e ) => {
        onchange( e )
        search.text = e.target.value.toLowerCase()
        if( typeof data === 'function'
            && !triggered
            && new Date().getTime() - lastTriggered > debounce
        ) {
            triggered = true
            lastTriggered = new Date().getTime()
            buildElements( search.text )
            setTimeout( () => triggered = false, debounce )
        } else if( triggered && !queued ) {
            buildElements( search.text, true )
            queued = true
            //this ensures changes made during the debounce period are accounted for
            setTimeout( () => {
                updateSearch( e )
                queued = false
            }, debounce )
        }
    }

    const buildElements = ( searchText, useCached = false ) => toDataArray( data, searchText, useCached ).then( d => {
                                                                                                                    dataElements.current = d.filter( v => v ).map(
                                                                                                                        val => {
                                                                                                                            if( typeof val === 'object' ) {
                                                                                                                                if( !displayProperty ) {
                                                                                                                                    console.trace( 'No displayProperty provided to autocomplete, but matched an object. Returning nothing.' )
                                                                                                                                    return { record: val, str: '' }
                                                                                                                                } else {
                                                                                                                                    return { record: val, str: ( val[ displayProperty ] || '' ).toString() }
                                                                                                                                }
                                                                                                                            } else {
                                                                                                                                return { record: val, str: val.toString() }
                                                                                                                            }
                                                                                                                        } )
                                                                                                                                            .map( recordWithStringRepr => {
                                                                                                                                                      const record = recordWithStringRepr.record
                                                                                                                                                      if( typeof record === 'object' && ( stringMappers == null || !Array.isArray( stringMappers ) || stringMappers.length < 1 ) ) {
                                                                                                                                                          console.trace( 'stringMappers must be an array of at least one function that returns a string given a record' )
                                                                                                                                                      }
                                                                                                                                                      const searchStrings =
                                                                                                                                                          typeof record === 'object'
                                                                                                                                                          ? stringMappers.map( mapper => ( mapper( record ) || '' ).toLowerCase() )
                                                                                                                                                          : [ record.toString().toLowerCase() ]
                                                                                                                                                      return {
                                                                                                                                                          record,
                                                                                                                                                          element: div(
                                                                                                                                                              {
                                                                                                                                                                  onclick: ( e ) => {
                                                                                                                                                                      search.text = ''
                                                                                                                                                                      dataElements.current = []
                                                                                                                                                                      resultClickHandler( e, record )
                                                                                                                                                                  },
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
                                                                                                                }
    )


    return div(
        {
            style: Object.assign( {
                                      position: 'relative',
                                      'display': 'inline-flex',
                                      'flex-direction': 'column',
                                      'align-items': 'center'
                                  },
                                  style
            )
        },
        fnbind( search, input( {
                                   type: 'text', placeholder,
                                   style: Object.assign( {
                                                             height: '4vh',
                                                             'font-size': '3vh',
                                                             'font-family': 'radium',
                                                             width: '100%',
                                                             'border-radius': '3px'
                                                         }, inputStyle
                                   ),
                                   value: search.text, onkeyup: updateSearch, onchange: updateSearch
                               } ), ( el ) => el.value = search.text ),
        fnbind( dataElements,
                () => dataElements.current.length > 0 && search.text.length >= 2 ? div(
                    {
                        style: {
                            position: 'absolute',
                            top: '4.7vh',
                            'background-color': colors.offWhite,
                            padding: '10px',
                            display: search.text ? 'block' : 'none',
                            'box-shadow': '-1px -1px 20px 1px #' + colors.offWhite,
                            width: '34vw',
                            'border-radius': '6px'
                        }
                    },
                    dataElements
                        .current
                        .filter( d =>
                                     d.searchStrings.filter( str => str.match( search.text ) ).length > 0
                        )
                        .map( d => d.element )
                                                                                 )
                                                                                 : ''
        )
    )
}