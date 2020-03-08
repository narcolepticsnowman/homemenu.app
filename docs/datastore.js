import drive from "./drive.js";
import {fnstate} from "./fntags.js";
import {datePlusDays, today} from "./constants.js";

export const datastoreState = fnstate({loaded: false})
const dishes = {}
const menuPlans = {}

let menuFolderId


export const loadData = async () => {

    if (!datastoreState.loaded) {
        //TODO handle shared folders
        menuFolderId = localStorage.getItem("menu-plan.web.app_menu-folder-id")
        if (!menuFolderId) {
            menuFolderId = (await drive.findFolders("menu-plan.web.app_menu-data"))[0].id
            localStorage.setItem("menu-plan.web.app_menu-folder-id", menuFolderId)
        }
        const tedayyyyy = today();
        const upcomingMenuPlans = await Promise.all([...Array.keys(new Array(5))]
            .map(i => datePlusDays(tedayyyyy, i))
            .map(dt => {
                let menuPlanJson = sessionStorage.getItem("menu-plan.web.app_menu-plan-" + dt)
                if (menuPlanJson) {
                    return Promise.resolve(JSON.parse(menuPlanJson))
                } else {
                    return drive.findFiles(dt, folderId).then(file => {
                        sessionStorage.setItem("menu-plan.web.app_menu-plan-" + dt, file || {})
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
    drive.save(menuPlan.date, menuPlan, )
}