import drive from "./drive.js";
import {fnstate} from "./fntags.js";
import {datePlusDays, today} from "./constants.js";

export const datastoreState = fnstate({loaded: false})
const dishes = {}
const menuPlans = {}
let dishNames=[]
let appFolderId, menuPlanFolderId, dishFolderId
export const currentWeek = fnstate({list: []})

const appFolderName = "menu-plan.web.app_menu-data"
const menuPlanFolderName = "menu-plan"
const dishFolderName = "dish"
const menuPlanKeyPrefix = "menu-plan.web.app_menu-plan-"

const getFolderId = async (name, parent = null) =>
    getCachedObject(localStorage, name + "_folder-id", async () => {
        let folders = null
        try {
            folders = await drive.findFolders(name, parent);
        } catch (e) {
            if (!(e.result && e.result.error.code === 404)) {
                throw e
            }
        }

        if (folders && folders.length >0) {
            return folders[0].id
        } else {
            let folder = await drive.createFolder(name, parent)
            return folder.id
        }
    })

const getDishNames = async ()=>
    getCachedObject(localStorage, appFolderId+"_dish-names", async()=>{
        let existing = null
        try {
            let files = await drive.findFiles({name: "dish-names", folderId: dishFolderId})
            if(files && files.length>0)
                existing = await drive.getFileContent(files[0].id)
        } catch (e) {
            if (!(e.result && e.result.error.code === 404)) {
                throw e
            }
        }
        if(existing){
            return existing[0]
        } else {
            let newFile = await drive.save({lastUpdate: new Date().getTime(), })
        }
    })

const getCachedObject = async (storage, key, loadValue) => {
    let cached = storage.getItem(key)
    if (cached) {
        return JSON.parse(cached)
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

        let thisWeeksMenu = await getMenuPlansAround(today())
        currentWeek.list = thisWeeksMenu

        Object.assign(menuPlans,
            thisWeeksMenu.reduce(
                (plans, plan) => {
                    plans[plan.date] = plan
                    return plans
                }, {}
            )
        )
        datastoreState.loaded = true
    }
}

export const findDishes = async (search) => {
    let res = await drive.findFiles({fullText: search, folderId: dishFolderId})
    return res.result.files
}

export const getDishById = async (id) => {
    if (!dishes[id]) {
        return await getCachedObject(sessionStorage, "dish_" + id, () => {
            let dish = drive.loadObject(id)
            dishes[id] = dish
            return dish
        })
    }
}

export const getMenuPlanByDate = async (msDate) => await getCachedObject(sessionStorage, menuPlanKeyPrefix + msDate, async () => {
    let files = await drive.findFiles({name: msDate, folderId: menuPlanFolderId})
    let menuPlan
    if (files && files.length > 0) {
        menuPlan = await drive.loadObject(files[0].id)
    } else {
        menuPlan = {date: msDate, dishIds: []}
    }
    menuPlans[msDate] = menuPlan
    return menuPlans[msDate]
})

export const saveDish = async (dish) => {
    if (!dish.driveMeta) {
        dish.driveMeta = {
            name: dish.name,
            folderId: dishFolderId
        }
    }
    let saved = await drive.save(dish)

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
        menuPlans[menuPlan.date] = menuPlan

        sessionStorage.setItem(menuPlanKeyPrefix + menuPlan.date, JSON.stringify(menuPlan))
        return menuPlan
    } catch (e) {
        alert("Failed to save menu plan changes")
        currentWeek.list = currentWeek.list.map(p => p.date === menuPlan.date ? menuPlan : p)
        throw e
    }
}