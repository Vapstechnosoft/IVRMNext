import { IFloorDisplay } from "@/server/hostel/hostel-management/masters/floor";

export interface IBed {
    hlmB_Id: number;
    hlmH_Id: number;
    hlmF_Id: number;
    hrmrM_Id: number;
    hlmB_BedName: string;
    hlmB_MattressFlg: boolean;
    hlmB_BedSheetFlg: boolean;
    hlmB_PillowFlg: boolean;
    hlmB_StudyTableFlg: boolean;
    hlmB_LampFlg: boolean;
    hlmB_ActiveFlag: boolean;
}

export interface IBedDisplay extends IBed {
    hlmH_Name: string;
    hrmF_FloorName: string;
    hrmrM_RoomNo: string;
}

export interface IHostel {
    hlmH_Id: number;
    hlmH_Name: string;
}

export interface IFloor {
    hlmF_Id: number;
    hrmF_FloorName: string;
    hlmH_Id: number;
}

export interface IRoom {
    hrmrM_Id: number;
    hrmrM_RoomNo: string;
    hlmF_Id: number;
}


export interface IFloor {
  hlmF_Id: number;
  hlmH_Id: number;
  hrmF_FloorName: string;
  hrmF_TotalRooms: number;
  hrmF_FloorDesc: string;
  hrmF_ActiveFlag: boolean;
  facilities: number[]; // Array of Facility IDs
}

export interface IHostel {
  hlmH_Id: number;
  hlmH_Name: string;
}

export interface IFacility {
  hlmftY_Id: number;
  hlmftY_FacilityName: string;
}

export interface IHostel {
    hlmH_Id: number;
    hlmH_Name: string;
    hlmH_ContactNo: string;
    hlmH_TotalCapacity: number;
    hlmH_BoysGirlsFlg: 'Boys' | 'Girls';
    hlmH_Address: string;
    ivrmmC_Id: number;
    ivrmmS_Id: number;
    hlmH_City: string;
    hlmH_Pincode: number;
    hlmH_TotalFloor: number;
    hlmH_TotalRoom: number;
    hlmH_Desc?: string;
    hlmhW_WardenType?: string;
    hlmH_ActiveFlag: boolean;
    // Mapped IDs
    facilities: number[];
    wardens: number[];
    messes: number[];
    // Documents
    documents: IHostelDocument[];
    
    // Display properties (optional)
    mappedFacilities?: IFacility[];
    mappedWardens?: IEmployee[];
}

export interface IHostelDocument {
    hlmhP_Id?: number;
    hlmhP_FileName: string;
    hlmhP_FilePath: string;
    filetype?: string;
}

export interface IFacility {
    hlmftY_Id: number;
    hlmftY_FacilityName: string;
}

export interface IMess {
    hlmM_Id: number;
    hlmM_Name: string;
}

export interface IEmployee {
    hrmE_Id: number;
    hrmE_EmployeeFirstName: string;
    hrmE_EmployeeCode: string;
}

export interface ICountry {
    ivrmmC_Id: number;
    ivrmmC_CountryName: string;
}

export interface IState {
    ivrmmS_Id: number;
    ivrmmS_Name: string;
    ivrmmC_Id: number; // Linked to Country
}

export interface IMess {
    hlmM_Id: number;
    hlmM_Name: string;
    hlmM_VegFlg: boolean;
    hlmM_NonVegFlg: boolean;
    hlmM_BFSStartTime: string | null;
    hlmM_BFSEndTime: string | null;
    hlmM_LNStartTime: string | null;
    hlmM_LNEndTime: string | null;
    hlmM_LNTSStartTime: string | null;
    hlmM_LNTSEndTime: string | null;
    hlmM_DNSStartTime: string | null;
    hlmM_DNSEndTime: string | null;
    hlmM_ActiveFlag: boolean;
}

export interface IMess {
    hlmM_Id: number;
    hlmM_Name: string;
    hlmM_ActiveFlag: boolean;
}

export interface IMessCategory {
    hlmmC_Id: number;
    hlmmC_Name: string;
    hlmmC_ActiveFlag: boolean;
}

export interface IMessCategoryMapping {
    hlmmmC_Id: number;
    hlmM_Id: number;
    hlmmC_Id: number;
    hlmmmC_ActiveFlag: boolean;
}

export interface IRoom {
    hrmrM_Id: number;
    hlmH_Id: number;
    hlmF_Id: number;
    hlmrcA_Id: number;
    hrmrM_RoomNo: string;
    hrmrM_BedCapacity: number;
    hrmrM_RoomDesc?: string;
    hrmrM_ACFlg: boolean;
    hrmrM_SharingFlg: boolean;
    hrmrM_RoomForStudentFlg: boolean;
    hrmrM_RoomForStaffFlg: boolean;
    hrmrM_RoomForGuestFlg: boolean;
    hrmrM_ActiveFlag: boolean;
    facilities: number[];
}

export interface IRoomDisplay extends IRoom {
    hlmH_Name: string;
    hrmF_FloorName: string;
    hlmrcA_RoomCategory: string;
    mappedFacilities?: IFacility[];
}

export interface IHostel {
    hlmH_Id: number;
    hlmH_Name: string;
}

export interface IFloor {
    hlmF_Id: number;
    hrmF_FloorName: string;
    hlmH_Id: number;
}

export interface IRoomCategory {
    hlmrcA_Id: number;
    hlmrcA_RoomCategory: string;
    hlmF_Id: number; // Assuming linked to floor or hostel, but usually independent? User req says dependent on floor? 
    // Wait, the user code has `categorydetails` which suggests it might just be a list, but the user plan said dependent.
    // Looking at the AngularJS code: `Floor()` loads `room_catlist`. So Category is likely fetched based on Hostel/Floor.
    // Actually in `HS_Master/floor` it returns `room_catlist`.
}

export interface IMessMenu {
    hlmmN_Id: number;
    hlmmN_MenuName: string;
    hlmmN_MenuDesc: string;
    hlmM_Name: string;
    hlmmC_Name: string;
    hlmmN_ActiveFlag: boolean;
    hlmM_Id: number;
    hlmmC_Id: number;
}

interface MessMenuDataResponse {
    get_messlist: { hlmM_Id: number; hlmM_Name: string }[];
    get_messCategorylist: { hlmmC_Id: number; hlmmC_Name: string }[];
    griddata: IMessMenu[];
}

export interface IRoomCategory {
  hlmrcA_Id: number;
  hlmH_Id: number;
  fmG_Id: number;
  hlmrcA_RoomCategory: string;
  hlmrcA_SORate: number;
  hlmrcA_RoomRate: number;
  hlmrcA_MaxCapacity: number;
  hlmrcA_Description: string;
  hlmrcA_ACFlg: boolean;
  hlmrcA_SharingFlg: boolean;
  hlmrcA_ActiveFlag: boolean;
  hlmH_Name?: string; // from join likely
  fmG_GroupName?: string; // from join likely
}

export interface IHostel {
  hlmH_Id: number;
  hlmH_Name: string;
}

export interface IFeeGroup {
  fmG_Id: number;
  fmG_GroupName: string;
}

export interface RoomTariffDataResponse {
    gridlistdata: IRoomTariff[];
    yeralist: IAcademicYear[];
    room_list: IRoom[];
}

export interface IRoomTariff {
    hlmrtF_Id: number;
    asmaY_Id: number;
    hrmrM_Id: number;
    hlmrtF_SORate: number;
    hlmrtF_RoomRate: number;
    hlmrtF_ActiveFlag: boolean;
    asmaY_Year?: string;
    hrmrM_RoomNo?: string;
}

export interface IAcademicYear {
    asmaY_Id: number;
    asmaY_Year: string;
}

export interface IRoom {
    hrmrM_Id: number;
    hrmrM_RoomNo: string;
}

export interface IMasterFloorData {
  floorList: IFloorDisplay[];
  hostelList: IHostel[];
  facilityList: IFacility[];
}
