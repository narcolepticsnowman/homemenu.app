import drive from './drivedb.js'
import { fnstate } from '../lib/fntags.js'
import { datePlusDays, today } from './constants.js'

export const datastoreLoaded = fnstate( false )
export const currentWeek = fnstate( [] )

const appFolderName = 'menu-menu.web.app_menu-data'
const menuFolderName = 'menu-menu'
const recipeFolderName = 'recipe'
const menuKeyPrefix = 'menu-menu.web.app_menu-menu-'


const getCachedObject = async( { storage, key, loadValue, isValid } ) => {
    let cached = storage.getItem( key )
    let parsed = cached && JSON.parse( cached )
    if( typeof isValid === 'function' && cached ) {
        let valid = await isValid( parsed )
        if( !valid ) {
            cached = null
        }
    }
    if( cached ) {
        return parsed
    } else {
        let loaded = await loadValue()
        if( loaded )
            storage.setItem( key, JSON.stringify( loaded ) )
        return loaded
    }
}

const getMenusAround = async( date ) => {
    const startDate = new Date( date )
    startDate.setHours( 0, 0, 0, 0 )
    startDate.setDate( startDate.getDate() - 3 )
    return await Promise.all( [ ...new Array( 7 ).keys() ]
                                  .map( i => datePlusDays( startDate, i ) )
                                  .map( getMenuByDate )
    )
}

export const getRecipeFolderId = async() => await getFolderId( recipeFolderName, await getAppFolderId() )
export const getMenuFolderId = async() => await getFolderId( menuFolderName, await getAppFolderId() )

//TODO handle shared folders
export const getAppFolderId = async() => await getFolderId( appFolderName )

export const loadData = async() => {
    if( !datastoreLoaded() ) {
        currentWeek(await getMenusAround( today() ))
        datastoreLoaded(true)
    }
}

export const getRecipeById = async( id ) => await getCachedObject(
    {
        storage: sessionStorage,
        key: 'recipe_' + id,
        loadValue: async() => await drive.loadObject( id )
    }
)

export const getMenuByDate = async( msDate ) => await getCachedObject(
    {
        storage: sessionStorage,
        key: menuKeyPrefix + msDate,
        loadValue: async() => {
            let files = await drive.findFiles( { name: msDate, folderId: await getMenuFolderId() } )
            let menu
            if( files && files.length > 0 ) {
                menu = await drive.loadObject( files[ 0 ].id )
            } else {
                menu = { date: msDate, recipeIds: [] }
            }
            return menu
        }
    }
)

export const saveRecipe = async( recipe ) => {
    if( !recipe.driveMeta ) {
        recipe.driveMeta = {
            name: recipe.name,
            folderId: await getRecipeFolderId()
        }
    }
    let saved = await drive.save( recipe )
    await addRecipeNameToIndex( { id: saved.id, name: recipe.name } )
    sessionStorage.setItem( 'recipe_' + recipe.driveMeta.id, JSON.stringify( recipe ) )
    return recipe
}

export const saveMenu = async( menu ) => {
    currentWeek(currentWeek().map( p => p.date === menu.date ? menu : p ))

    try {
        //TODO use the logged in users id
        let saved = await fetch( '/api/chef/123/menu', {
            method: 'POST',
            body: JSON.stringify(menu)
        } )

        sessionStorage.setItem( menuKeyPrefix + saved.date, JSON.stringify( saved ) )
        return saved
    } catch(e) {
        alert( 'Failed to save menu menu changes' )
        currentWeek(currentWeek().map( p => p.date === menu.date ? menu : p ))
        throw e
    }
}

const addRecipeNameToIndex = async( { id, name } ) => {
    // let recipeNameIndex = await getRecipeNameIndex()
    // recipeNameIndex.index[ id ] = name
    // await drive.save( recipeNameIndex )
    // localStorage.setItem( 'recipe-name-index_' + await getRecipeFolderId(), JSON.stringify( recipeNameIndex ) )
}

let recipeNameLastUpdate = -1

//TODO implement autocomplete using rerecipe
//https://redislabs.com/ebook/part-2-core-concepts/chapter-6-application-components-in-redis/6-1-autocomplete/6-1-2-address-book-autocomplete/
export const getRecipeNameIndex = async() => []