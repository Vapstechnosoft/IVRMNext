export interface IFeeAmountEntryList {
    fmA_Id: number;
    fmG_GroupName: string;
    asmaY_Year: string;
    fmcC_ClassCategoryName: string;
    fmH_FeeName: string;
    ftI_Name: string;
    fmA_Amount: number;
    fmA_CreatedDate: string;
}

export interface IFeeGroupDropDownList {
    fmG_Id: number;
    fmG_GroupName: string;
}

export interface IFeeClassCategoryDropDownList {
    fmcC_Id: number;
    fmcC_ClassCategoryName: string;
}

export interface IFeeAcademicyearDropDownList {
    asmaY_Id: number;
    asmaY_Year: string;
    asmaY_Order: number;
}

export interface IMasterAmountEntryDetails {
    fmA_Id: number;
    fmH_Id: number;
    ftI_Id: number;
    fmG_GroupName: string;
    fmH_FeeName: string;
    fmI_Name: string;
    fmA_Amount: number;
    ftddE_Day: string;
    ftddE_Month: string;
    ftdD_Day: string;
    ftdD_Month: string;
    fmA_DueDate: string;
    viewFine: boolean;
    addFine: boolean;
    fmA_PartialRebateApplicableDate: string;
    fyghM_FineApplicableFlag?: string;
}

export interface IFeeTransactionWaivedOffList {
    mi_id: number;
    academicYear: string;
    class?: string | null;
    section?: string | null;
    student?: string | null;
    date?: string;
    refundableType: 'Refundable' | 'NonRefundable';
    activeType: 'FineWaiveOff' | 'CompleteFineWaiveOff';
    remarks: string;
    nameFormat: 'NameReg.No' | 'Reg.NoName';
    groupList: string[];
}

export interface IFeeOpeningBalanceList {
    mi_id: number;
    selectionType: 'T' | 'G' | 'C';
    academicYear: string;
    category?: string | null;
    class?: string | null;
    section?: string | null;
    student?: string | null;
    feeHead?: string | null;
    feeGroup?: string | null;
    feeInstallments?: string[];
    date?: string;
    refundableType: 'Refundable' | 'NonRefundable';
    activeType: 'Active' | 'Left';
    pdaorfeeType: 'Fees';
    nameFormat: 'NameReg.No' | 'Reg.NoName';
}
