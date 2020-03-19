import drive from "./drivedb.js";
import {fnstate} from "./fntags.js";
import {datePlusDays, today} from "./constants.js";

export const datastoreState = fnstate({loaded: false})
const dishes = {}
const menuPlans = {}
let dishNames = []
let appFolderId, menuPlanFolderId, dishFolderId
export const currentWeek = fnstate({list: []})

const appFolderName = "menu-plan.web.app_menu-data"
const menuPlanFolderName = "menu-plan"
const dishFolderName = "dish"
const menuPlanKeyPrefix = "menu-plan.web.app_menu-plan-"

const getFolderId = async (name, parent = null) =>
    getCachedObject(
        {
            storage: localStorage,
            key: name + "_folder-id",
            loadValue: async () => {
                let folder = await drive.getOrCreateFolder(name, parent)
                return folder.id
            }
        }
    )

const getCachedObject = async ({storage, key, loadValue, isValid}) => {
    let cached = storage.getItem(key)
    let parsed = cached && JSON.parse(cached)
    if (typeof isValid === 'function' && cached) {
        let valid = await isValid(parsed);
        if (!valid) {
            cached = null
        }
    }
    if (cached) {
        return parsed
    } else {
        let loaded = await loadValue()
        if (loaded)
            storage.setItem(key, JSON.stringify(loaded))
        return loaded
    }
}

const getMenuPlansAround = async (date) => {
    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)
    startDate.setDate(startDate.getDate() - 3)
    return await Promise.all([...new Array(7).keys()]
        .map(i => datePlusDays(startDate, i))
        .map(getMenuPlanByDate)
    )
}

export const loadData = async () => {

    if (!datastoreState.loaded) {
        //TODO handle shared folders
        appFolderId = await getFolderId(appFolderName)
        menuPlanFolderId = await getFolderId(menuPlanFolderName, appFolderId)
        dishFolderId = await getFolderId(dishFolderName, appFolderId)

        currentWeek.list = await getMenuPlansAround(today())

        datastoreState.loaded = true
    }
}

export const getDishById = async (id) => await getCachedObject(
    {
        storage: sessionStorage,
        key: "dish_" + id,
        loadValue: async () => await drive.loadObject(id)
    }
)

export const getMenuPlanByDate = async (msDate) => await getCachedObject(
    {
        storage: sessionStorage,
        key: menuPlanKeyPrefix + msDate,
        loadValue: async () => {
            let files = await drive.findFiles({name: msDate, folderId: menuPlanFolderId})
            let menuPlan
            if (files && files.length > 0) {
                menuPlan = await drive.loadObject(files[0].id)
            } else {
                menuPlan = {date: msDate, dishIds: []}
            }
            return menuPlan
        }
    }
)

export const saveDish = async (dish) => {
    if (!dish.driveMeta) {
        dish.driveMeta = {
            name: dish.name,
            folderId: dishFolderId
        }
    }
    let saved = await drive.save(dish)
    await addDishNameToIndex({id: saved.id, name: dish.name})

    dishes[saved.id] = dish
    sessionStorage.setItem("dish_" + dish.driveMeta.id, JSON.stringify(dish))
    return dish
}

export const saveMenuPlan = async (menuPlan) => {
    if (!menuPlan.driveMeta) {
        menuPlan.driveMeta = {
            name: menuPlan.date,
            folderId: menuPlanFolderId
        }
    }
    let currentIndex = currentWeek.list.findIndex(plan => plan.date === menuPlan.date)
    if (currentIndex > -1) {
        let oldPlan = currentWeek.list[currentIndex]
        currentWeek.list = currentWeek.list.map(p => p.date === menuPlan.date ? oldPlan : p)
    }
    try {
        await drive.save(menuPlan)

        sessionStorage.setItem(menuPlanKeyPrefix + menuPlan.date, JSON.stringify(menuPlan))
        return menuPlan
    } catch (e) {
        alert("Failed to save menu plan changes")
        currentWeek.list = currentWeek.list.map(p => p.date === menuPlan.date ? menuPlan : p)
        throw e
    }
}

const addDishNameToIndex = async ({id, name}) => {
    let dishNameIndex = await getDishNameIndex()
    dishNameIndex.index[id] = name
     await drive.save(dishNameIndex)
    localStorage.setItem("dish-name-index_"+ dishFolderId, JSON.stringify(dishNameIndex))
}

let dishNameLastUpdate = -1

export const getDishNameIndex = async () => await getCachedObject(
    {
        storage: localStorage,
        key: "dish-name-index_" + dishFolderId,
        loadValue: async () => {
            let fileName = 'dish-name-index';
            let files = await drive.findFiles({name: fileName, folderId: dishFolderId})
            if (files && files.length > 0) {
                dishNames = await drive.loadObject(files[0].id)
            } else {
                //TODO check for existing dishes and include them in the index
                //TODO provide way to search shared folders
                dishNames = {
                    driveMeta: {
                        name: fileName,
                        folderId: dishFolderId
                    },
                    index: {}
                }
                await drive.save(dishNames)
            }
            return dishNames
        },
        isValid: async (stored) => {
            if (dishNameLastUpdate === -1) {
                dishNameLastUpdate = -2
                let fileInfo = await drive.getFileMeta(stored.driveMeta.id)
                dishNameLastUpdate = Date.parse(fileInfo.modifiedTime)
            }
            return stored.driveMeta.appProperties.lastUpdated < dishNameLastUpdate
        }
    }
)