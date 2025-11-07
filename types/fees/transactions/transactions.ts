export interface IFeeAmountEntryList {
    fmA_Id: number;
    fmG_GroupName: string;
    asmaY_Year: string;
    fmcC_ClassCategoryName: string;
    fmH_FeeName: string;
    ftI_Name: string;
    fmA_Amount: number;
    fmA_CreatedDate: string;
    asmaY_Id: number;
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

export interface IFeeThirdPartyTransaction {
    fyptP_Id: number;
    fyptP_Name: string;
    fmH_FeeName: string;
    fmH_Id: number;
    fyP_Receipt_No: string;
    fyP_Bank_Name: string;
    fyP_Bank_Or_Cash: string;
    fyP_Tot_Amount: number;
    fyP_DD_Cheque_No: string;
    fyP_Id: number;
    fyP_Date: string;
    asmaY_Year: string;
    fyptP_Towards: string;
}

export interface IFeeThirdPartyTransactionGroupDropDown {
    fmG_Id: number;
    fmG_GroupName: string;
}

export interface IFeeThirdPartyTransactionHeadDropDown {
    fmH_Id: number;
    fmH_FeeName: string;
}

export interface IFeeBankDetails {
    fmbanK_Id: number;
    mI_Id: number;
    fmbanK_BankName: string;
    fmbanK_BankDescription: string;
    fmbanK_ActiveFlg: boolean;
    fmbanK_CreatedDate: string;
    fmbanK_UpdatedDate: string;
    fmbanK_CreatedBy: number;
    fmbanK_UpdatedBy: number;
}

export interface IFeePreAdmissionTransactionDetails {
    pasR_Id: number;
    slno: number;
    fyP_Id: number;
    studentName: string;
    studentRegNo: string;
    studentMobile: number;
    paidAmount: number;
    studentEmail: string;
    receiptNo: string;
    paidDate: string;
    modeOfPayment: string;
}

export interface IFeePreAdmissionStudentsDropDownList {
    amsT_Id: number;
    studentName: string;
}

export interface IFeePreAdmissionStudentInformation {
    studentId: number;
    studentName: string;
    regNo: string;
    className: string;
    mobileNo: string;
    emailId: string;
    fatherName: string;
    academicYear: string;
    filterType: string;
}

export interface IFeePreAdmissionStudentTermsDetails {
    fmT_Id: number;
    fmT_Name: string;
}

export interface IFeePreAdmissionTransactionDetails {
    mI_Id: number;
    asmaY_Id: number;
    amsT_Id: number;
    pasR_Id: number;
    fmG_Id: number;
    fmH_Id: number;
    ftI_Id: number;
    fmA_Id: number;
    fyP_Id: number;
    termId: number;
    installment: string;
    feeHead: string;
    feeGroup: string;
    feeType: string;
    currentCharges: number;
    totalCharges: number;
    concession: number;
    fine: number;
    payableAmount: number;
    netAmount: number;
}

export interface IFeeTransactionApiResponse {
    success: boolean;
    message: string;
    total: number;
    data: {
        feeTransactions: IFeePreAdmissionTransactionDetails[];
    };
}
