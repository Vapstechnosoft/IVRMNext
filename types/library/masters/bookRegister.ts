export interface BookRegister {
    LMB_Id: number;
    mI_Id: number;
    LMB_BookTitle: string;
    MB_Subtitle?: string;
    LMC_Id: number;
    LMB_BookType: string;
    LMS_Id: number;
    LMD_Id: number;
    Binding_Type?: string;
    LMB_Edition?: string;
    LMB_PublishedYear: string;
    LMB_EntryDate: Date;
    MB_Call_No?: string;
    LMB_ISBNNo: string;
    LMB_ClassNo?: string;
    LMB_VolNo?: string;
    MB_Pages?: number;
    Invoice_No?: string;
    LMBKF_KeyFactor?: string;
    LMBKF_PageNo?: number;
    LMB_BookNo?: string;
    LMAL_Id: number;

    Purchase_Date: Date;
    LML_Id: number;
    LMB_BillNo?: string;
    Voucher_No?: string;
    LMB_PurOrDonated: string;
    Donor_Id?: string;
    LMB_DonorAddress?: string;
    CurrencyType?: string;
    Source_Type?: string;
    LMV_Id?: number;
    MB_Keywords?: string;
    LMP_Id?: number;
    MB_Remarks?: string;
    Bibliography_Page?: string;
    Index_Page?: string;

    LMAU_Id?: number;
    LMB_AuthorFirstName?: string;
    LMB_AuthorMiddleName?: string;
    LMB_AuthorLastName?: string;

    LMBANO_AvialableStatus: string;
    LRM_Id: number;
    LSM_Id: number;
    LRAM_Id: number;
    lmrA_Id: number;

    LMB_Price?: number;
    MB_Disc_Type?: string;
    MB_Discountper?: number;
    MB_Discount?: number;
    LMB_NetPrice?: number;

    With_Accessories?: boolean;
    lmaC_Id?: number;

    LMB_ActiveFlag?: boolean;

    // For List Display join fields
    lmC_CategoryName?: string;
    lmS_SubjectName?: string;
    lmD_DepartmentName?: string;
    lmP_PublisherName?: string;
    lmL_LanguageName?: string;
    lmV_VendorName?: string;
    lmrA_RackName?: string;
    AUTHOR_FullName?: string;
    lmbanO_AccessionNo?: string; // Often we only show one or comma separated
}

export interface AccessionDTO {
    LMBANO_Id?: number;
    LMBANO_No: string;
    LMBANO_AvialableStatus?: string;
}

export interface BookRegisterPayload {
    LMB_Id?: number;
    mI_Id?: number;
    LMB_BookTitle: string;
    MB_Subtitle?: string;
    LMC_Id: number;
    LMB_BookType: string;
    LMS_Id: number;
    LMD_Id: number;
    Binding_Type?: string;
    LMB_Edition?: string;
    LMB_PublishedYear: string;
    LMB_EntryDate: Date | string;
    MB_Call_No?: string;
    LMB_ISBNNo: string;
    LMB_ClassNo?: string;
    LMB_VolNo?: string;
    MB_Pages?: number;
    Invoice_No?: string;
    LMBKF_KeyFactor?: string;
    LMBKF_PageNo?: number;
    LMB_BookNo?: string;
    LMAL_Id: number;

    Purchase_Date: Date | string;
    LML_Id: number;
    LMB_BillNo?: string;
    Voucher_No?: string;
    LMB_PurOrDonated: string;
    Donor_Id?: string;
    LMB_DonorAddress?: string;
    CurrencyType?: string;
    Source_Type?: string;
    LMV_Id?: number;
    MB_Keywords?: string;
    LMP_Id?: number;
    MB_Remarks?: string;
    Bibliography_Page?: string;
    Index_Page?: string;

    LMAU_Id?: number;
    LMB_AuthorFirstName?: string;
    LMB_AuthorMiddleName?: string;
    LMB_AuthorLastName?: string;

    LMBANO_AvialableStatus: string;
    LRM_Id: number;
    LSM_Id: number;
    LRAM_Id: number;
    lmrA_Id: number;

    LMB_Price?: number;
    MB_Disc_Type?: string;
    MB_Discountper?: number;
    MB_Discount?: number;
    LMB_NetPrice?: number;

    With_Accessories?: boolean;
    lmaC_Id?: number;

    accessionList?: AccessionDTO[];
    LMB_ActiveFlag?: boolean;
}
