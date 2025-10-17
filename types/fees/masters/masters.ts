export interface IMasterPaymentGatewayList {
    fpgD_Id: number;
    fpgD_AuthorisationKey: string;
    fpgD_Image: string;
    fpgD_MerchantId: string;
    fpgD_MobileActiveFlag: boolean;
    fpgD_PGName: string;
    fpgD_SaltKey: string;
    fpgD_SubMerchantId: string;
    fpgD_URL: string;
    gatewayName: string;
    fpgD_AccNo: string;
    fpgD_PGActiveFlag: string;
}

export interface IFineSlabList {
    fmfS_Id: number;
    fmfS_ToDay: number;
    fmfS_FromDay: number;
    fmfS_FineType: string;
    fmfS_ECSFlag: string;
    fmfS_ActiveFlag: boolean;
}

export interface IMasterConcession {
    fmfS_Id: number;
    fmfS_ToDay: number;
    fmfS_FromDay: number;
    fmfS_FineType: string;
    fmfS_ECSFlag: string;
    fmfS_ActiveFlag: boolean;
}

//Groups Grouping
export interface IMasterGroupsGrouping {
    imgg_Id: number;
    imgg_GroupingName: string;
    imgg_Group_Code: string;
    imgg_feeGroupIds?: string | undefined;
    immgg_feeGroupNames: string;
    imgg_ActiveFlag: boolean;
}

//fees masters
export interface IMasterClassList {
    asmcL_Id: number;
    asmcL_ClassCategoryCode: string;
    asmcL_ClassCategoryName: string;
    asmcL_ActiveFlag: boolean;
    asmcL_ClassName: string;
}

export interface IMasterClassYearlyCategoryList {
    asmcC_Id: number;
    asmaY_Year: string;
    amC_Name: string;
    asmcL_ClassName: string;
    is_Active: boolean;
    mi_id: number;
}

//installment fees

export interface IMasterFeesInstallmentList {
    fmI_Id: number;
    mI_ID: number;
    fmI_Name: string;
    fmI_No_Of_Installments: number;
    fmI_Installment_Type: string;
    ftI_Name?: string;
    fmI_ActiveFlag: boolean | number;
    installments?: Array<{
        sno?: number;
        ftI_Id?: number;
        ftI_Name?: string;
        fdate?: string;
        tdate?: string;
        aplc?: string;
        ddate?: string;
    }>;
}
//groups
export interface IMasterGroupList {
    fmG_Id: number;
    mI_Id: number;
    fmG_GroupName: string;
    fmG_Remarks: string;
    fmG_CompulsoryFlag: string;
    fmG_ActiceFlag: boolean;
    user_id: number;
    fmG_PRE_FLAG: string;
    fmG_TransportFlg: boolean;
    fmG_HostelFlg: boolean;
    fmG_BatchwiseFeeApplFlg: boolean;
    fmG_RegNewFlg: string;
    createdDate: string;
    updatedDate: string;
}

export interface IFeeHeadsList {
    fmH_Id: number;
    mI_Id: number;
    fmH_FeeName: string;
    fmH_Flag: string;
    fmH_ActiveFlag: boolean;
    fmH_Order: number;
    fmH_SpecialFeeFlag: boolean;
    fmH_PDAFlag: boolean;
    fmH_RefundFlag: boolean;
}

export interface IModeOfPaymentList {
    ivrmmoD_Id: number;
    mI_Id: number;
    ivrmmoD_ModeOfPayment: string;
    ivrmmoD_ModeOfPayment_Code: string;
    ivrmmoD_ActiveFlag: boolean;
}

//used category
export interface IMasterClassYearlyList {
    asmcl_ActiveFlag: boolean;
    asmcL_Id: number;
    asmaY_Id: number;
    asmaY_Year: string;
    fmcC_Id: string;
    fmcC_ClassCategoryName: string;
    fycC_ActiveFlag: boolean;
    asmcL_ClassName: string;
    fyccC_Id: number;
    fycC_Id: number;
}

export interface IMasterCasteCategoryList {
    fmcC_Id: number;
    mI_Id: number;
    fmcC_ClassCategoryName: string;
    imcC_CategoryDesc: string;
    fmcC_ClassCategoryCode: string;
    fmcC_ActiveFlag: boolean;
}

export interface IMaasterFeesYearlyGrouping {
    fmI_ActiveFlag: number;
    mI_Id: number;
    asmaY_Id: number;
    asmaY_Year: number;
    fmG_GroupName: string;
    fmG_Id: string;
    fyG_RebateTypeFlg?: boolean;
    fyG_RebateType?: 'Percentage' | 'Amount';
    fyG_RebateValue?: string | number;
}

export interface IMasterConcessionDetails {
    fmfS_Id: number;
    fmfS_ToDay: number;
    fmfS_FromDay: number;
    fmfS_FineType: string;
    fmfS_ECSFlag: string;
    fmfS_ActiveFlag: boolean;
}

export interface IMasterInstallmentsDropdownList {
    ftI_ID: number;
    ftI_NAME: string;
}

export interface IMasterTermDropdownList {
    fmT_Id: number;
    fmT_Name: string;
}

export interface IMasterHeadDropdownList {
    fmH_Id: number;
    fmH_Flag: string;
    fmH_FeeName: string;
}
export interface IMasterTermFeeHeadList {
    fmT_Id: number;
    fmT_Name: string;
    fmT_IncludeArrearFeeFlg: boolean;
    fmT_ActiveFlag: boolean;
    termname: string;
    headname: string;
    installmentname: string;
    idforedt: number;
}

export interface IMasterTermsList {
    fmT_Id: number;
    fmT_Name: string;
    fmT_IncludeArrearFeeFlg: boolean;
    fmT_ActiveFlag: boolean;
}

export interface IMasterGroupWiseAutoReciptList {
    asmaY_Id: any;
    asmcL_Id: number;
    fmcC_Id(fmcC_Id: any): number;
    fyccC_Id: number;
    asmaY_Year: string;
    fmcC_ClassCategoryName: string;
    asmcL_ClassName: string;
    prefix: string;
    suffix: string;
    startingNumber: string;
    groups: string;
    autoGroupName: string;
    address: string;
    receiptTemplateFormat: string;
    fycC_ActiveFlag: boolean;
}
