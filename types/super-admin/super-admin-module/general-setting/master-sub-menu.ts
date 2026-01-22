
export interface IMasterSubMenu {
    ivrmmS_Id: number;
    ivrmM_Id: number;
    ivrmmM_Id: number;
    ivrmmS_SubMenuName: string;
    ivrmmS_Order: number;
    modulename?: string; // For grid display
    mainMenuName?: string; // For grid display
}

export interface IModuleDropdownItem {
    ivrmM_Id: number;
    ivrmM_ModuleName: string;
}

export interface IMainMenuDropdownItem {
    ivrmmM_Id: number;
    ivrmmM_MenuName: string;
}
