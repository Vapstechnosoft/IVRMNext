
export interface IInvRGRNLoadData {
    get_grn_item_supplier: IInvRGRNItemSupplier[];
    get_grnreport: IInvRGRNReportData[];
}

export interface IInvRGRNItemSupplier {
    invmgrN_Id?: number; // For GRN
    invmgrN_GRNNo?: string;
    invmI_Id?: number; // For Item
    invmI_ItemName?: string;
    invmS_Id?: number; // For Supplier
    invmS_SupplierName?: string;
    // Common selection flag
    checked?: boolean;
}

export interface IInvRGRNReportData {
    // Common
    rowNumber?: number;
    invmgrN_PurchaseDate?: string;

    // Detailed/All
    invmgrN_GRNNo?: string;
    invmS_SupplierName?: string;
    invmI_ItemName?: string;
    invmuoM_UOMName?: string;
    invtgrN_Qty?: number;
    invtgrN_PurchaseRate?: number;
    invtgrN_MRP?: number;
    invtgrN_SalesPrice?: number;
    invtgrN_DiscountAmt?: number;
    invtgrN_TaxAmt?: number;
    invtgrN_Amount?: number;
    invtgrN_BatchNo?: string;

    // Overall
    invmI_ItemCode?: string;
    grnQuantity?: number;
    grnRate?: number;
    grnMRP?: number;
    grnSalePrice?: number;
    grnDiscount?: number;
    grnTax?: number;
    grnAmount?: number;

    // Supplier Specific
    invmS_SupplierCode?: string;
    invmS_SupplierConatctNo?: string;
    invmS_EmailId?: string;
}

export interface IInvRGRNPayload {
    optionflag: string;
    typeflag: string;
    startdate?: string | Date; // Formatted date string
    enddate?: string | Date;
    bwdateflag: boolean;
    grnArray?: IInvRGRNItemSupplier[];
    itemArray?: IInvRGRNItemSupplier[];
    supplierArray?: IInvRGRNItemSupplier[];
}
