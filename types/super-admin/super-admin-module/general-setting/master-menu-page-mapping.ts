
export interface IModuleDropdownItem {
    ivrmM_Id: number;
    ivrmM_ModuleName: string;
}

export interface IMainMenuDropdownItem {
    ivrmmM_Id: number;
    ivrmmM_MenuName: string;
}

export interface ISubMenuDropdownItem {
    ivrmmS_Id: number;
    ivrmmS_SubMenuName: string;
    ivrmmM_Id: number;
}

export interface IMasterPageItem {
    ivrmP_Id: number;
    pagename: string;
    checked?: boolean;
}

export interface IMasterMenuPageMappingDTO {
    ivrmmmpM_Id: number;
    ivrmM_Id: number;
    ivrmmM_Id: number;
    ivrmmS_Id: number;
    ivrmP_Id: number;
    modulename?: string;
    menuname?: string;
    submenuname?: string;
    pagename?: string;
}

// For saving, we likely send:
// IVRMM_Id, IVRMMM_Id, IVRMMM_Idsubmenu, and a list of pages.
// Or we save one by one? The HTML implies a "Save" button after selecting pages.
// "savedata(secondgrid)" suggests saving a list of selected pages.

export interface IMasterMenuPageMappingSaveDTO {
    ivrmM_Id: number;
    ivrmmM_Id: number;
    ivrmmS_Id: number;
    savetmpdata: IMasterPageItem[]; // or just IDs
}
