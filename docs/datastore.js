import drive from "./drive.js";
import {fnstate} from "./fntags.js";
import {datePlusDays, today} from "./constants.js";
import {menu} from "./fnelements.js";

export const datastoreState = fnstate({loaded: false})
const dishes = {}
const menuPlans = {}

let appFolderId, menuPlanFolderId, dishFolderId

const appFolderName = "menu-plan.web.app_menu-data"
const menuPlanFolderName = "menu-plan"
const dishFolderName = "dish"
const menuPlanKeyPrefix = "menu-plan.web.app_menu-plan-"

const getFolderId = async (name, parent = null) =>
    getCachedObject(localStorage, name + "_folder-id", async () => {
        let folders = null
        try {
            folders =  await drive.findFolders(name, parent);
        } catch (e) {
            if(!(e.result && e.result.error.code === 404)){
                throw e
            }
        }

        if(!folders || folders.length < 1) {
            let folder = await drive.createFolder(name, parent)
            return folder.id
        } else {
            return folders[0].id
        }
    })


const getCachedObject = async (storage, key, loadValue) => {
    let cached = storage.getItem(key)
    if (cached) {
        return JSON.parse(cached)
    } else {
        let loaded = await loadValue()
        if(loaded)
            storage.setItem(key, JSON.stringify(loaded))
        return loaded
    }
}

export const loadData = async () => {

    if (!datastoreState.loaded) {
        //TODO handle shared folders
        appFolderId = await getFolderId(appFolderName)
        menuPlanFolderId = await getFolderId(menuPlanFolderName, appFolderId)
        dishFolderId = await getFolderId(dishFolderName, appFolderId)

        const tedayyyyy = today();
        const upcomingMenuPlans = await Promise.all([...new Array(5).keys()]
            .map(i => datePlusDays(tedayyyyy, i))
            .map(getMenuPlanByDate)
        )
        Object.assign(menuPlans,
            upcomingMenuPlans.reduce(
                (plans, plan) => {
                    plans[plan.date] = plan
                    return plans
                }, {}
            )
        )
        datastoreState.loaded = true
    }
}

export const getDishes = () => {
    return dishes
}

export const getDishById = async (id) => {
    if (!dishes[id]) {
        await getCachedObject(sessionStorage, "dish_" + id, () => {
            let dish = drive.loadObject(id)
            dishes[id] = dish
            return dish
        })
    }
}

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36)

export const getMenuPlans = () =>
    Array.from(Object.values(menuPlans)).sort((a, b) => a.date > b.date ? 1 : -1)

export const getMenuPlanByDate = async (msDate)=> await getCachedObject(sessionStorage, menuPlanKeyPrefix + msDate, async ()=>{
    let files = await drive.findFiles(msDate, menuPlanFolderId)
    let menuPlan
    if(files && files.length > 0) {
        menuPlan = await drive.loadObject(files[0].id)
    } else {
        menuPlan = {date: msDate, dishIds: []}
    }
    menuPlans[msDate] = menuPlan
    return menuPlans[msDate]
})

export const saveDish = async (dish) => {
    // if (!dish.id) dish.id = generateId()
    let savedFile = await drive.save(dish.id, dish, dishFolderId)
    dish.id = savedFile.id
    dishes[savedFile.id] = dish
    sessionStorage.setItem("dish_"+dish.id, JSON.stringify(dish))
    return dish
}

export const saveMenuPlan = async (menuPlan) => {
    if(!menuPlan.driveMeta) {
        menuPlan.driveMeta = {
            name: menuPlan.date,
            folderId: menuPlanFolderId
        }
    }
    let savedFile = await drive.save(menuPlan)
    menuPlan.id = savedFile.id
    menuPlans[menuPlan.date] = menuPlan
    sessionStorage.setItem(menuPlanKeyPrefix + menuPlan.date, JSON.stringify(menuPlan))
    return menuPlan
}