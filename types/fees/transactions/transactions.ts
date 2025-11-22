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
    mI_Id: number;
    asmaY_Id: number;
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

    // New field names from backend
    fmG_GroupName: string;
    fmH_FeeName: string;
    ftI_Name: string;

    currentYrCharges: number;
    totalCharges: number;
    concessionAmount: number;
    fineAmount: number;
    toBePaid: number;
    netAmount: number;

    fmH_Order?: number;

    // Optional for UI
    className?: string;
    academicYear?: string;
    bankName?: string;
    chequeNo?: string;
}

export interface IFeeTransactionApiResponse {
    success: boolean;
    message: string;
    total: number;
    data: {
        feeTransactions: IFeePreAdmissionTransactionDetails[];
    };
}

export interface Ifeetransaction {
    amsT_FirstName: string;
    amsT_MiddleName: string | null;
    amsT_LastName: string | null;

    classname: string;
    sectionname: string;
    amsT_AdmNo: string;

    fyP_Receipt_No: string;
    fyP_Date: string; // or Date
    fyP_Tot_Amount: number;
    fyP_Bank_Or_Cash: string; // example: 'C', 'O'
    fyP_Chq_Bounce: string | null; // 'CL', 'CB', null

    fyP_Id: number;
    amst_Id: number;
}

export interface IStudentDropdown {
    amst_Id: number;
    studentName: string;
    amsT_FirstName: string;
}

export interface IStudentInfo {
    studentName: string;
    admNo: string;
    className: string;
    section: string;
    mobile: string;
    photo?: string;
}

export interface IStudentTerm {
    fmT_Id: number;
    fmT_Name: string;
    fmG_GroupName: string;
}

export interface ITransactionRow {
    fmA_Id: number;
    fmH_Id: number;
    fmH_FeeName: string;
    ftI_Id: number;
    ftI_Name: string;
    fmG_Id: number;
    totalamount: number;
    fsS_TotalToBePaid: number;
    fsS_ConcessionAmount: number;
    fsS_FineAmount: number;
    fsS_OBArrearAmount: number;
    fsS_ToBePaid: number;
    fsS_TotalToBePaidaddfine: number;
    fsS_RebateAmount: number;
}

export interface IPaymentMode {
    ivrmmoD_Id: number;
    ivrmmoD_ModeOfPayment: string;
    ivrmmoD_Flag: 'B' | 'C';
    Bank_Date?: string;
    Bank_No?: string;
    Bank_Name?: string;
    Bank_Amount?: number;
}

export interface INarration {
    fmnaR_Id: number;
    fmnaR_Narration: string;
}

export interface IFeeThirdPartyTransactionStudentDetails {
    mI_Id: number;
    amsT_Id: number;
    asmaY_Id: number;
    amsT_FirstName: string;
    amsT_MiddleName: string;
    amsT_LastName: string;
    returnval: boolean;
    fmH_Id: number;
    fyptP_Towards: string;
    fmH_FeeName: string | null;
    fmG_Id: number;
    fmG_GroupName: string | null;
    fmH_Order: number;
    studntlist: any | null;
    fyP_Id: number;
    fyP_Receipt_No: string | null;
    fyptP_Id: number;
    fyP_Bank_Name: string | null;
    fyP_DD_Cheque_No: string | null;
    user_id: number;
    fyP_Bank_Or_Cash: string;
    fyP_DD_Cheque_Date: string; // API returns "0001-01-01T00:00:00"
    fyP_Date: string;
    fyP_Tot_Amount: number;
    fyP_Remarks: string;
    fyptP_Name: string | null;
    stdetails: any | null;
    alldata: any | null;
    ftP_TotalPaidAmount: number;
    dulicate: boolean;
    ftI_Id: number;
    ftI_Name: string | null;
    fmA_Id: number;
    fsS_ToBePaid: number;
}

export interface INumberGeneration {
    imN_Id: number;
    mI_Id: number;
    imN_AutoManualFlag: string;
    imN_DuplicatesFlag: string;
    imN_StartingNo: string;
    imN_WidthNumeric: string;
    imN_ZeroPrefixFlag: string;
    imN_PrefixAcadYearCode: boolean;
    imN_PrefixParticular: string;
    imN_SuffixAcadYearCode: boolean;
    imN_SuffixParticular: string;
    imN_RestartNumFlag: string;
    imN_Flag: string;
    imN_PrefixFinYearCode: boolean;
    imN_PrefixCalYearCode: boolean;
    imN_SuffixFinYearCode: boolean;
    imN_SuffixCalYearCode: boolean;
    createdDate: string;
    updatedDate: string;
}

export interface IThirdPartyTransactionEditdata {
    mI_Id: number;
    amsT_Id: number;
    asmaY_Id: number;
    amsT_FirstName: string | null;
    amsT_MiddleName: string | null;
    amsT_LastName: string | null;
    returnval: boolean;
    fmH_Id: number;
    fyptP_Towards: string;
    fmH_FeeName: string | null;
    fmG_Id: number;
    fmG_GroupName: string | null;
    fmH_Order: number;
    studntlist: any | null; // you can type it properly if you know the structure
    fyP_Id: number;
    fyP_Receipt_No: string;
    fyptP_Id: number;
    fyP_Bank_Name: string;
    fyP_DD_Cheque_No: string;
    user_id: number;
    fyP_Bank_Or_Cash: string;
    fyP_DD_Cheque_Date: string; // or Date
    fyP_Date: string; // or Date
    fyP_Tot_Amount: number;
    fyP_Remarks: string;
    fyptP_Name: string;
    stdetails: any | null;
    alldata: any | null;
    ftP_TotalPaidAmount: number;
    dulicate: boolean;
    ftI_Id: number;
    ftI_Name: string | null;
    fmA_Id: number;
    fsS_ToBePaid: number;
}

export interface IFeeSectionList {
    asmS_Id: number;
    mI_Id: number;
    asmC_SectionName: string;
    asmC_SectionCode: string;
    asmC_Order: number;
    asmC_ActiveFlag: number;
    asmC_MaxCapacity: number;
    createdDate: string;
    updatedDate: string;
}

export interface IFeeClassList {
    asmcL_Id: number;
    mI_Id: number;
    asmcL_ClassName: string;
    asmcL_MinAgeYear: number;
    asmcL_MinAgeMonth: number;
    asmcL_MinAgeDays: number;
    asmcL_MaxAgeYear: number;
    asmcL_MaxAgeMonth: number;
    asmcL_MaxAgeDays: number;
    asmcL_Order: number;
    asmcL_ClassCode: string;
    asmcL_ActiveFlag: boolean;
    asmcL_MaxCapacity: number;
    asmcL_PreadmFlag: number;
    asmcL_StreamFlg: string | null;
    asmcL_CreatedBy: string | null;
    asmcL_UpdatedBy: string | null;
    createdDate: string;
    updatedDate: string;
}
