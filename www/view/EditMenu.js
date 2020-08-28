import Modal from './Modal.js'
import { div, form, hr, img, input, span } from '../lib/fnelements.js'
import { fnbind, fnstate } from '../lib/fntags.js'
import { colors, toDayName, toMonthDay } from '../fun/constants.js'
import { currentWeek, getRecipeById, getRecipeNameIndex, getMenuByDate, saveRecipe, saveMenu } from '../fun/datastore.js'
import autocomplete from '../fun/autocomplete.js'


const emptyMenu = () => ( {
    date: 0,
    recipeIds: []
} )

let menu = fnstate( emptyMenu() )

const menuRecipees = fnstate( [] )

const driveId = ( o ) => o && o.driveMeta && o.driveMeta.id || null

const addRecipe = ( recipe ) =>
    menuRecipees(menuRecipees().filter( d => driveId( d ) !== driveId( recipe ) ).concat( recipe ))


const removeRecipe = ( i ) =>
    menuRecipees(menuRecipees().filter( ( o, j ) => i !== j ))


const recipeInput = ( placeholder, newRecipe, prop, type = 'text' ) =>
    div(
        input( {
                   style: {
                       height: '3vh',
                       'font-size': '2vh',
                       'border-radius': '3px',
                       width: '60%',
                       'margin-bottom': '15px'
                   },
                   value: newRecipe[ prop ] || '',
                   onchange: ( e ) => {
                       newRecipe[ prop ] = e.target.value
                   },
                   placeholder
               } )
    )

let recipeSavePromises = []

const recipeForm = ( recipe, i ) =>
    form( {
              onsubmit: ( e ) => e.preventDefault()
          },
          recipeInput( 'Name', recipe, 'name' ),
          recipeInput( 'Link', recipe, 'recipeUrl' ),
          recipeInput( 'Cook Time', recipe, 'cookTime', 'number' ),
          div(
              {
                  style: {
                      color: colors.offWhite,
                      display: 'flex',
                      'justify-content': 'space-between',
                      'max-width': '200px',
                      'font-size': '3vh',
                      margin: 'auto'
                  }
              },
              span( {
                        style: { cursor: 'pointer' }, onclick: () => {
                      //TODO show loading spinner
                      let recipeSave = saveRecipe( recipe )
                      recipeSavePromises.push( recipeSave )
                      recipeSave.then( ( saved ) => {
                          removeRecipe( i )
                          addRecipe( saved )
                      } ).catch( ( e ) => {
                          console.error( e )
                          addRecipe( recipe )
                      } )
                  }
                    }, 'Save' ),
              span( {
                        style: { cursor: 'pointer' }, onclick: () => {
                      removeRecipe( i )
                  }
                    }, 'Cancel' )
          ),
          hr()
    )

const existingRecipe = ( recipe, i ) => div(
    span( { style: { color: colors.orange, 'font-size': '3vh' } }, recipe.name ),
    span( {
              style: {
                  color: colors.offWhite,
                  cursor: 'pointer',
                  margin: '0 10px'
              },
              onclick: () => removeRecipe( i )
          }, 'X' )
)

let submitting = false

const save = async( close ) => {
    if( submitting ) return
    submitting = true
    try {
        //TODO show loading spinner
        Promise.all( recipeSavePromises ).then( () => {
            menu().recipeIds = menuRecipees().map( d => driveId( d ) )
            saveMenu( menu() ).then( saved => {
                menuRecipees([])
                menu(emptyMenu())
                currentWeek.list = currentWeek.list.map( p => p.date === saved.date ? saved : p )
                submitting = false
                close()
            } ).catch( e => {
                submitting = false
                console.error( e )
                close()
            } )
        } )

    } catch(e) {
        submitting = false
        console.error( e )
        close()
    }
}

const EditMenu = Modal( {
                            content: ( menuDate, close ) => {
                                if( menuDate ) getMenuByDate( menuDate ).then( menu => {
                                                                                menu(menu)
                                                                                return Promise.all( menu.recipeIds.map( id => getRecipeById( id ) ) )
                                                                            } )
                                                                            .then( recipees => {
                                                                                menuRecipees(recipees)
                                                                            } )
                                return fnbind( menu, () => div(
                                    form(
                                        {
                                            onsubmit: ( e ) => e.preventDefault()
                                        },
                                        div( {
                                                 style: {
                                                     color: colors.red,
                                                     'text-align': 'center',
                                                     'font-size': '6vh',
                                                     'margin-bottom': '4vh'
                                                 }
                                             },
                                             div(
                                                 {
                                                     style: {
                                                         display: 'flex',
                                                         margin: 'auto',
                                                         'max-width': '420px',
                                                         'justify-content': 'space-between'
                                                     }
                                                 },
                                                 div( toDayName( menu().date ) ),
                                                 div( toMonthDay( menu().date ) )
                                             ),
                                             img( { src: '/images/border.svg', style: { width: '70%' } } )
                                        ),
                                        div(
                                            fnbind( menuRecipees, () => div(
                                                menuRecipees().map( ( recipe, i ) =>
                                                                         driveId( recipe )
                                                                         ? existingRecipe( recipe, i )
                                                                         : recipeForm( recipe, i )
                                                )
                                            ) ),
                                            img( { src: '/images/border.svg', style: { width: '60%', transform: 'scaleY(-1)' } } ),
                                            div(
                                                {
                                                    style: {
                                                        display: 'flex',
                                                        'justify-content': 'space-between',
                                                        'max-width': '420px',
                                                        margin: 'auto'
                                                    }
                                                },
                                                autocomplete( {
                                                                  style: {
                                                                      width: '200px'
                                                                  },
                                                                  inputStyle: {
                                                                      'text-align': 'center'
                                                                  },
                                                                  data: async() => {
                                                                      let index = ( await getRecipeNameIndex() ).index
                                                                      return [ ...Object.keys( index ) ].map( id => ( { id, name: index[ id ] } ) )
                                                                  },
                                                                  displayProperty: 'name',
                                                                  stringMappers: [ ( recipe ) => recipe.name, ( recipe ) => recipe.recipeUrl ],
                                                                  placeholder: 'Find Recipe',
                                                                  resultClickHandler: async( e, match ) => {
                                                                      let recipe = await getRecipeById( match.id )
                                                                      menuRecipees(menuRecipees().concat( recipe ))
                                                                  }
                                                              } ),
                                                span(
                                                    {
                                                        onmouseover() {
                                                            this.style.color = '#FFFFFF'
                                                        },
                                                        onmouseout() {
                                                            this.style.color = colors.offWhite
                                                        },
                                                        style: {
                                                            color: colors.offWhite,
                                                            'font-size': '4vh',
                                                            cursor: 'pointer'
                                                        },
                                                        onclick: () => {
                                                            menuRecipees(menuRecipees().concat( {} ))
                                                        }
                                                    },
                                                    'New Recipe'
                                                )
                                            )
                                        ),
                                        div( {
                                                 onmouseover() {
                                                     this.style.color = '#FFFFFF'
                                                 },
                                                 onmouseout() {
                                                     this.style.color = colors.offWhite
                                                 },
                                                 onclick: () => save( close ),
                                                 style: {
                                                     color: colors.offWhite,
                                                     'font-size': '4vh',
                                                     cursor: 'pointer'
                                                 }
                                             },
                                             'Save'
                                        )
                                    )
                                               )
                                )
                            }

                        }
)

export default EditMenu