import drive from "./drive.js";
import {fnstate} from "./fntags.js";
import {datePlusDays, today} from "./constants.js";

export const datastoreState = fnstate({loaded: false})
const dishes = {}
const menuPlans = {}

let menuFolderId

const menuFolderName = "menu-plan.web.app_menu-data"
const menuFolderIdKey = "menu-plan.web.app_menu-folder-id"
const menuPlanKeyPrefix = "menu-plan.web.app_menu-plan-"

export const loadData = async () => {

    if (!datastoreState.loaded) {
        //TODO handle shared folders
        menuFolderId = localStorage.getItem(menuFolderIdKey)
        if (!menuFolderId) {
            let folders = await drive.findFolders(menuFolderName);
            if (folders && folders.length > 0) {
                menuFolderId = folders[0].id
                localStorage.setItem(menuFolderIdKey, menuFolderId)
            } else {
                await drive.createFolder(menuFolderName)
            }
        }
        const tedayyyyy = today();
        const upcomingMenuPlans = await Promise.all([...Array.keys(new Array(5))]
            .map(i => datePlusDays(tedayyyyy, i))
            .map(dt => {
                let menuPlanJson = sessionStorage.getItem(menuPlanKeyPrefix + dt)
                if (menuPlanJson) {
                    return Promise.resolve(JSON.parse(menuPlanJson))
                } else {
                    return drive.findFiles(dt, folderId).then(file => {
                        sessionStorage.setItem(menuPlanKeyPrefix + dt, file || {})
                        return file
                    })
                }
            })
        )
        Object.assign(menuPlans,
            upcomingMenuPlans.reduce(
                (plans, plan) => {
                    plans[plan.id] = plan
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


export const getMenuPlans = () => {
    return Array.from(Object.values(menuPlans))
}

export const saveDish = (dish) => drive.save(dish.id, dish, menuFolderId)

export const saveMenuPlan = (menuPlan) => {
    menuPlan[menuPlan.date] = menuPlan
    drive.save(menuPlan.date, menuPlan,)
}