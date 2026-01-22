
export interface IInvRSalesLoadData {
    // Initial load usually just gets sales numbers or similar if needed, 
    // but in Angular loaddata() fetches get_salesno, but mainrdochange also fetches things.
    // We'll define types primarily.
    salesList?: IInvRSalesEntity[];
}

export interface IInvRSalesEntity {
    // Common fields for various dropdowns/lists
    id: number;
    name: string;

    // Specific fields from Angular
    invmsL_SalesNo?: string;
    invmsL_Id?: number;

    invmI_Id?: number;
    invmI_ItemName?: string;

    amsT_Id?: number;
    studentname?: string;
    amsT_AdmNo?: string;

    hrmE_Id?: number;
    employeename?: string;

    invmC_Id?: number;
    invmC_CustomerName?: string;

    asmcL_Id?: number;
    asmcL_ClassName?: string;

    asmS_Id?: number;
    asmC_SectionName?: string;

    // Checkbox state
    checked?: boolean;
}

export interface IInvRSalesReportData {
    rowNumber?: number;
    invmsL_SalesNo?: string;
    invmsL_SalesDate?: string;
    invmI_ItemName?: string;
    invtsL_SalesQty?: number;
    invtsL_SalesPrice?: number;
    invtsL_DiscountAmt?: number;
    invtsL_TaxAmt?: number;
    invtsL_Amount?: number;

    membername?: string; // Student or Staff Name
    amsT_AdmNo?: string;

    // Overall/Specific fields
    saleQty?: number;
    salePrice?: number;
    saleDiscount?: number;
    saleTax?: number;
    saleAmount?: number;
}

export interface IInvRSalesPayload {
    typeflag: string; // All, Overall, Detailed
    optionflag?: string; // Item, Student, Staff, Customer, Saleno
    individualflag?: string; // C, CS (for student) or boolean/string in angular
    startdate?: string;
    enddate?: string;
    bw_dates: boolean;

    // Arrays for multi-selects
    salenoarray?: IInvRSalesEntity[];
    itemarray?: IInvRSalesEntity[];
    clsarray?: IInvRSalesEntity[];
    secarray?: IInvRSalesEntity[];

    // ID for single selects
    studentid?: number;
    hrme_id?: number;
    invmc_id?: number;

    // Flags for Tax/Discount columns (handled in frontend mostly for display, but payload might need them if server filters)
    // Angular sends " HRM_id: 0" etc.
}
