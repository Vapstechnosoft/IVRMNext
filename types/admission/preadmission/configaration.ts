export interface IMasterAcademicYearMasterList {
    asmaY_Id: string;
    mI_Id: number;
    asmaY_Year: string;
    asmaY_From_Date: string;
    asmaY_To_Date: string;
    asmaY_PreAdm_F_Date: string;
    asmaY_PreAdm_T_Date: string;
    asmaY_Order: number;
    asmaY_ActiveFlag: number;
    asmaY_Cut_Of_Date: string;
    asmaY_Pre_ActiveFlag: number;
    is_Active: boolean;
    asmaY_ReggularFlg: boolean;
    asmaY_NewFlg: boolean;
    asmaY_NewAdmissionFlg: boolean;
    asmaY_CreatedBy: number;
    asmaY_UpdatedBy: number;
    asmaY_ReferenceDate: string;
    asmaY_ArrearFeeDate: string;
    asmaY_AdvanceFeeDate: string;
    asmaY_TransportEDate: string;
    asmaY_TransportSDate: string;
    asmaY_AcademicYearCode: string;
    asmaY_RegularFeeFDate: string;
    asmaY_RegularFeeTDate: string;
    createdDate: string;
    updatedDate: string;
}
export interface IMasterSetOrderList {
    asmaY_Year: string;
    asmaY_Order: number;
}
