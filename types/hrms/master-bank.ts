export interface MasterBankResponse {
    success: boolean;
    message: string;
    data: {
        bankdetailList: BankItem[];
    };
    retrunMsg?: string;
}

export interface BankItem {
    HRMBD_Id: number;
    MI_Id: number;
    HRMBD_BankName: string;
    HRMBD_BankAccountNo: string;
    HRMBD_BankAddress: string;
    HRMBD_BranchName: string;
    HRMBD_IFSCCode: string;
    HRMBD_ActiveFlag: boolean;
    CreatedDate: string;
    UpdatedDate: string;
}

export interface MasterBankInput {
    HRMBD_Id?: number;
    MI_Id: number;
    HRMBD_BankName: string;
    HRMBD_BankAccountNo: string;
    HRMBD_BankAddress: string;
    HRMBD_BranchName: string;
    HRMBD_IFSCCode: string;
    HRMBD_ActiveFlag: boolean;
}
