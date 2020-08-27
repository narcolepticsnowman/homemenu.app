import Modal from './Modal.js'
import { div, form, hr, img, input, span } from '../lib/fnelements.js'
import { fnbind, fnstate } from '../lib/fntags.js'
import { colors, toDayName, toMonthDay } from '../fun/constants.js'
import { currentWeek, getDishById, getDishNameIndex, getMenuPlanByDate, saveDish, saveMenuPlan } from '../fun/datastore.js'
import autocomplete from '../fun/autocomplete.js'


const emptyPlan = () => ( {
    date: 0,
    dishIds: []
} )

let menuPlan = fnstate( emptyPlan() )

const menuDishes = fnstate( [] )

const driveId = ( o ) => o && o.driveMeta && o.driveMeta.id || null

const addDish = ( dish ) =>
    menuDishes(menuDishes().filter( d => driveId( d ) !== driveId( dish ) ).concat( dish ))


const removeDish = ( i ) =>
    menuDishes(menuDishes().filter( ( o, j ) => i !== j ))


const dishInput = ( placeholder, newDish, prop, type = 'text' ) =>
    div(
        input( {
                   style: {
                       height: '3vh',
                       'font-size': '2vh',
                       'border-radius': '3px',
                       width: '60%',
                       'margin-bottom': '15px'
                   },
                   value: newDish[ prop ] || '',
                   onchange: ( e ) => {
                       newDish[ prop ] = e.target.value
                   },
                   placeholder
               } )
    )

let dishSavePromises = []

const dishForm = ( dish, i ) =>
    form( {
              onsubmit: ( e ) => e.preventDefault()
          },
          dishInput( 'Name', dish, 'name' ),
          dishInput( 'Link', dish, 'recipeUrl' ),
          dishInput( 'Cook Time', dish, 'cookTime', 'number' ),
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
                      let dishSave = saveDish( dish )
                      dishSavePromises.push( dishSave )
                      dishSave.then( ( saved ) => {
                          removeDish( i )
                          addDish( saved )
                      } ).catch( ( e ) => {
                          console.error( e )
                          addDish( dish )
                      } )
                  }
                    }, 'Save' ),
              span( {
                        style: { cursor: 'pointer' }, onclick: () => {
                      removeDish( i )
                  }
                    }, 'Cancel' )
          ),
          hr()
    )

const existingDish = ( dish, i ) => div(
    span( { style: { color: colors.orange, 'font-size': '3vh' } }, dish.name ),
    span( {
              style: {
                  color: colors.offWhite,
                  cursor: 'pointer',
                  margin: '0 10px'
              },
              onclick: () => removeDish( i )
          }, 'X' )
)

let submitting = false

const save = async( close ) => {
    if( submitting ) return
    submitting = true
    try {
        //TODO show loading spinner
        Promise.all( dishSavePromises ).then( () => {
            menuPlan().dishIds = menuDishes().map( d => driveId( d ) )
            saveMenuPlan( menuPlan() ).then( saved => {
                menuDishes([])
                menuPlan(emptyPlan())
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
                            content: ( planDate, close ) => {
                                if( planDate ) getMenuPlanByDate( planDate ).then( plan => {
                                                                                menuPlan(plan)
                                                                                return Promise.all( plan.dishIds.map( id => getDishById( id ) ) )
                                                                            } )
                                                                            .then( dishes => {
                                                                                menuDishes(dishes)
                                                                            } )
                                return fnbind( menuPlan, () => div(
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
                                                 div( toDayName( menuPlan().date ) ),
                                                 div( toMonthDay( menuPlan().date ) )
                                             ),
                                             img( { src: '/images/border.svg', style: { width: '70%' } } )
                                        ),
                                        div(
                                            fnbind( menuDishes, () => div(
                                                menuDishes().map( ( dish, i ) =>
                                                                         driveId( dish )
                                                                         ? existingDish( dish, i )
                                                                         : dishForm( dish, i )
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
                                                                      let index = ( await getDishNameIndex() ).index
                                                                      return [ ...Object.keys( index ) ].map( id => ( { id, name: index[ id ] } ) )
                                                                  },
                                                                  displayProperty: 'name',
                                                                  stringMappers: [ ( dish ) => dish.name, ( dish ) => dish.recipeUrl ],
                                                                  placeholder: 'Find Dish',
                                                                  resultClickHandler: async( e, match ) => {
                                                                      let dish = await getDishById( match.id )
                                                                      menuDishes(menuDishes().concat( dish ))
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
                                                            menuDishes(menuDishes().concat( {} ))
                                                        }
                                                    },
                                                    'New Dish'
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