import drive from "./drive.js";
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
                let folders = null
                try {
                    folders = await drive.findFolders(name, parent);
                } catch (e) {
                    if (!(e.result && e.result.error.code === 404)) {
                        throw e
                    }
                }

                if (folders && folders.length > 0) {
                    return folders[0].id
                } else {
                    let folder = await drive.createFolder(name, parent)
                    return folder.id
                }
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
    addDishNameToIndex({id: saved.id, name: dish.name})

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
    let dishNameIndex = getDishNameIndex()
    dishNameIndex[id] = name
    return await drive.save(dishNameIndex)
}

export const getDishNameIndex = async () => await getCachedObject(
    {
        storage: localStorage,
        key: "dish-name-index_" + dishFolderId,
        loadValue: async () => {
            let files = await drive.findFiles({name: 'dish-name-index', folderId: dishFolderId})
            if (files && files.length > 0) {
                dishNames = await drive.loadObject(files[0].id)
            } else {
                dishNames = {}
                await drive.save(dishNames)
            }
            return dishNames
        },
        isValid: async (stored) => {
            let fileInfo = await drive.getFileInfo(stored.driveMeta.id)
            return stored.driveMeta.lastUpdated < new Date(fileInfo.updateTime).getTime()
        }
    }
)