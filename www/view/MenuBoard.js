import { a, div, hr, img, section, span } from '../lib/fnelements.js'
import DishView from './DishView.js'
import { colors, humanTime, today, toDayName } from '../fun/constants.js'
import { currentWeek, getDishById } from '../fun/datastore.js'

import EditMenu from './EditMenu.js'
import { fnbind, fnstate } from '../lib/fntags.js'

const dishView = DishView
const editMenu = EditMenu
const dishModalLink = ( dish ) => {
    return a( {
                  onclick: ( e ) => {
                      e.preventDefault()
                      dishView.open( dish )
                  }
              },
              dish.name
    )
}

const todayMenuItem = ( plan, dishes ) => {
    let cookTime = dishes.map( d => d.cookTime || 0 ).reduce( ( a, b ) => a + b, 0 )
    return div( { style: {} },
                img( { src: '/images/border.svg', style: { width: '65%', 'margin-top': '15px' } } ),
                div( {
                         onmouseover() {
                             this.style.color = colors.lightRed
                         },
                         onmouseout() {
                             this.style.color = colors.red
                         },
                         onclick: () => editMenu.open( plan.date ),
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
                         div( toDayName( plan.date ) ),
                         div(
                             img( { src: '/images/chalk_icon.png', style: { width: '3vh', height: '3vh' } } )
                         )
                     )
                ),
                hr( { style: { 'max-width': '315px' } } ),
                ...( dishes.length > 0 ?
                     dishes.map( ( dish, i ) =>
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
                                          dishModalLink( dish )
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
const upcomingMenuItem = ( plan, dishes ) =>
    div(
        div( {
                 onclick: () => editMenu.open( plan.date ),
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
                 div( toDayName( plan.date ) ),
                 div(
                     img( { src: '/images/chalk_icon.png', style: { width: '2vh', height: '2vh' } } )
                 )
             )
        ),
        ...( dishes.length > 0 ?
             dishes.map( dish =>
                             div( {
                                      style: {
                                          color: colors.darkGrey,
                                          cursor: 'pointer',
                                          'font-size': '3vh',
                                          'text-decoration': plan.date < today().getTime() ? 'line-through' : 'none'
                                      }
                                  },
                                  dishModalLink( dish )
                             )
             )
                               : [
                    div( {
                             style: {
                                 color: colors.darkGrey,
                                 cursor: 'pointer',
                                 'font-size': '3vh',
                                 'text-decoration': plan.date < today().getTime() ? 'line-through' : 'none'
                             }
                         },
                         '--' )
                ]
        )
    )


const menuItem = ( plan ) => {
    let planDate = new Date( plan.date )
    const planDishes = fnstate( [] )
    Promise.all( plan.dishIds.map( getDishById ) )
           .then( dishes => {
               planDishes(dishes)
           } )

    let isToday = planDate.getTime() === today().getTime()
    return isToday ? fnbind( planDishes, () => todayMenuItem( plan, planDishes() ) ) : fnbind( planDishes, () => upcomingMenuItem( plan, planDishes() ) )
}

export default () => fnbind( currentWeek, () => section(
    currentWeek.list.map( menuItem )
) )