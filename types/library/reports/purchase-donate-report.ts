export interface IPurchaseDonateReportInitialData {
    LBCPA_Flg: string;
}

export interface IPurchaseDonateReportRequest {
    LBCPA_Flg: string; // Book Category: Book, Non-Book
    Circ_Flag: string; // Purchased, Donated
}

export interface IPurchaseDonateReportGridData {
    lmb_BookType: string;
    lmbano_AccessionNo: string;
    lmb_BookTitle: string;
    name: string; // Author Name
    lmv_VendorName: string;
    lmb_BillNo: string;
    lmb_VoucherNo: string;
    lmb_PurchaseDate: string;
    lmb_NoOfCopies: number;
    lmb_Price: number;
    lmb_Discount: number;
    lmb_NetPrice: number;
}

export interface IPurchaseDonateReportResponse {
    alldata: IPurchaseDonateReportGridData[];
}
