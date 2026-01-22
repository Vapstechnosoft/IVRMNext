export interface IAlumniDonationDetails {
    almsT_FirstName: string;
    almsT_LastName: string;
    almsT_RegistrationNo: string;
    almsT_AdmNo: string;
    almsT_MobileNo: string;
    almsT_emailId: string;
    almsT_StudentPhoto: string;
    almsT_Id: number;
    alsreG_Id: number;
    leftyear: string;
    classleft: string;
    almsT_ConStreet: string;
    almsT_ConArea: string;
    almsT_ConCity: string;
    almsT_District: string;
    ivrmmS_Name: string;
    ivrmmC_CountryName: string;
    almsT_ConPincode: string;
    almsT_StudentPANCard: string | null;
    almsT_FatherName: string;
}

export interface IDonationCategory {
    almdoN_Id: number;
    almdoN_DonationName: string;
    almdoN_Amount: number;
    almdoN_RegistrationFeeFlag: boolean;
}

export interface IPaymentGateway {
    fpgD_Id: number;
    fpgD_PGName: string;
    fpgD_Image: string;
}

export interface IAlumniDonationLoadResponse {
    almdetails: IAlumniDonationDetails[];
    fillalumnidonationdetails: IDonationCategory[];
    fillpaymentgateway: IPaymentGateway[];
    imagenew: string;
}

export interface IPaymentGatewayDetails {
    paymentgateway: {
        fpgD_SaltKey: string;
        fpgD_AuthorisationKey: string;
    }[];
    orderId: string;
    institution: {
        mI_Name: string;
        mI_PAN: string;
        mI_Logo: string;
    }[];
}
