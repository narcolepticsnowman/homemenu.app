import { a, div, hr, img, section, span } from '../lib/fnelements.js'
import RecipeView from './RecipeView.js'
import { colors, humanTime, today, toDayName } from '../fun/constants.js'
import { currentWeek, getRecipeById } from '../fun/datastore.js'

import EditMenu from './EditMenu.js'
import { fnbind, fnstate } from '../lib/fntags.js'

const recipeView = RecipeView
const editMenu = EditMenu
const recipeModalLink = ( recipe ) => {
    return a( {
                  onclick: ( e ) => {
                      e.preventDefault()
                      recipeView.open( recipe )
                  }
              },
              recipe.name
    )
}

const todayMenuItem = ( menu, recipees ) => {
    let cookTime = recipees.map( d => d.cookTime || 0 ).reduce( ( a, b ) => a + b, 0 )
    return div( { style: {} },
                img( { src: '/images/border.svg', style: { width: '65%', 'margin-top': '15px' } } ),
                div( {
                         onmouseover() {
                             this.style.color = colors.lightRed
                         },
                         onmouseout() {
                             this.style.color = colors.red
                         },
                         onclick: () => editMenu.open( menu.date ),
                         style: {
                             color: colors.red,
                             'text-align': 'center',
                             'font-size': '6vh',
                             cursor: 'pointer'
                         }
                     },
                     div(
                         {
                             style: {
                                 display: 'flex',
                                 margin: 'auto',
                                 'max-width': '315px',
                                 'justify-content': 'space-between'
                             }
                         },
                         div( toDayName( menu.date ) ),
                         div(
                             img( { src: '/images/chalk_icon.png', style: { width: '3vh', height: '3vh' } } )
                         )
                     )
                ),
                hr( { style: { 'max-width': '315px' } } ),
                ...( recipees.length > 0 ?
                     recipees.map( ( recipe, i ) =>
                                     div( {
                                              style: {
                                                  color: colors.orange,
                                                  cursor: 'pointer',
                                                  'font-size': '5.5vh',
                                                  'align-items': 'center',
                                                  'flex-direction': 'column',
                                                  'display': 'flex'
                                              }
                                          },
                                          recipeModalLink( recipe )
                                     )
                     )
                                       : [ div( {
                                                    style: {
                                                        color: colors.orange,
                                                        cursor: 'pointer',
                                                        'font-size': '5.5vh',
                                                        'align-items': 'center',
                                                        'flex-direction': 'column',
                                                        'display': 'flex'
                                                    }
                                                },
                                                '--'
                        ) ]
                ),
                cookTime > 0 ? div(
                    {
                        style: {
                            'text-align': 'center',
                            'font-size': '2.5vh'
                        }
                    },
                    span( {
                              style: {
                                  color: colors.blue
                              }
                          }, 'Cook Time: ' ), span( {
                                                        style: {
                                                            color: colors.green
                                                        }
                                                    }, humanTime( cookTime ) )
                ) : '',
                img( { src: '/images/border.svg', style: { width: '60%', transform: 'scaleY(-1)', 'margin-bottom': '15px' } } )
    )
}

//TODO make collapsible
const upcomingMenuItem = ( menu, recipees ) =>
    div(
        div( {
                 onclick: () => editMenu.open( menu.date ),
                 onmouseover() {
                     this.style.color = colors.offWhite
                 },
                 onmouseout() {
                     this.style.color = colors.lightGrey
                 },
                 style: {
                     color: colors.lightGrey,
                     'text-align': 'center',
                     'font-size': '3.5vh',
                     cursor: 'pointer'
                 }
             },
             div(
                 {
                     style: {
                         display: 'flex',
                         margin: 'auto',
                         'max-width': '300px',
                         'justify-content': 'space-between'
                     }
                 },
                 div( toDayName( menu.date ) ),
                 div(
                     img( { src: '/images/chalk_icon.png', style: { width: '2vh', height: '2vh' } } )
                 )
             )
        ),
        ...( recipees.length > 0 ?
             recipees.map( recipe =>
                             div( {
                                      style: {
                                          color: colors.darkGrey,
                                          cursor: 'pointer',
                                          'font-size': '3vh',
                                          'text-decoration': menu.date < today().getTime() ? 'line-through' : 'none'
                                      }
                                  },
                                  recipeModalLink( recipe )
                             )
             )
                               : [
                    div( {
                             style: {
                                 color: colors.darkGrey,
                                 cursor: 'pointer',
                                 'font-size': '3vh',
                                 'text-decoration': menu.date < today().getTime() ? 'line-through' : 'none'
                             }
                         },
                         '--' )
                ]
        )
    )


const menuItem = ( menu ) => {
    let menuDate = new Date( menu.date )
    const menuRecipees = fnstate( [] )
    Promise.all( menu.recipeIds.map( getRecipeById ) )
           .then( recipees => {
               menuRecipees(recipees)
           } )

    let isToday = menuDate.getTime() === today().getTime()
    return isToday ? fnbind( menuRecipees, () => todayMenuItem( menu, menuRecipees() ) ) : fnbind( menuRecipees, () => upcomingMenuItem( menu, menuRecipees() ) )
}

export default () => fnbind( currentWeek, () => section(
    currentWeek.list.map( menuItem )
) )