import { api } from "@/lib/apiService";

// Types for Master Earning and Deduction
export interface EarnDedType {
  HRMEDT_Id: number;
  HRMEDT_EarnDedType: string;
  HRMEDT_ActiveFlag: boolean;
  CreatedDate: string;
  UpdatedDate: string;
}

export interface OnloadGetEarningsDeductionsDetailsRequest {
  HRMED_Id: number;
  MI_Id: number;
  HRMED_Name: string;
  HRMED_EDTypeFlag: string;
  HRMED_EarnDedFlag: string;
  HRMED_AmountPercentFlag: string;
  HRMED_AmountPercent: string;
  HRMED_ActiveFlag: boolean;
  HRMED_RoundOffFlag: string;
  earningdetectionList: Array<{
    HRMED_Id: number;
    HRMED_Name: string;
    HRMED_EDTypeFlag: string;
    HRMED_EarnDedFlag: string;
    HRMED_AmountPercentFlag: string;
    HRMED_AmountPercent: string;
    HRMED_ActiveFlag: boolean;
    HRMED_RoundOffFlag: string;
    HRMED_Order: number;
  }>;
  retrunMsg: string;
  earningList: any[];
  detectionList: any[];
  eardettypelist: EarnDedType[];
  eardettypeDropdown: EarnDedType[];
  perc_OfDTO: any[];
  selectedearningdetectionList: any[];
  percentOff: string;
  HREED_Amount: number | null;
  arrearlist: any[];
  grosslist: any[];
  EarningsDeductionsDTO: any[];
  HRMED_Order: number | null;
}

export interface OnloadGetEarningsDeductionsDetailsResponse {
  HRMED_Id: number;
  MI_Id: number;
  HRMED_Name: string;
  HRMED_EDTypeFlag: string;
  HRMED_EarnDedFlag: string;
  HRMED_AmountPercentFlag: string;
  HRMED_AmountPercent: string;
  HRMED_ActiveFlag: boolean;
  HRMED_RoundOffFlag: string;
  earningdetectionList: EarningsDeductionDetail[];
  retrunMsg: string;
  roleId: number;
  HRMED_ReviseFlg: boolean;
  earningList: any[];
  detectionList: any[];
  eardettypelist: EarnDedType[];
  eardettypeDropdown: EarnDedType[];
  perc_OfDTO: any[];
  selectedearningdetectionList: any[];
  percentOff: string;
  HREED_Amount: number | null;
  arrearlist: any[];
  grosslist: any[];
  EarningsDeductionsDTO: any[];
  HRMED_Order: number | null;
}

export interface EarningsDeductionDetail {
  HRMED_Id: number;
  HRMED_Name: string;
  HRMED_EDTypeFlag: string;
  HRMED_EarnDedFlag: string;
  HRMED_AmountPercentFlag: string;
  HRMED_AmountPercent: string;
  HRMED_ActiveFlag: boolean;
  HRMED_RoundOffFlag: string;
  HRMED_Order: number;
}

export interface MasterEarningsDeductionInput {
  HRMED_Id: number;
  MI_Id: number;
  HRMED_Name: string;
  HRMED_EDTypeFlag: string;
  HRMED_EarnDedFlag: string;
  HRMED_AmountPercentFlag: string;
  HRMED_AmountPercent: string;
  HRMED_ActiveFlag: boolean;
  HRMED_RoundOffFlag: string;
  earningdetectionList: any[];
  retrunMsg: string;
  earningList: any[];
  detectionList: any[];
  eardettypelist: any[];
  eardettypeDropdown: any[];
  perc_OfDTO: any[];
  selectedearningdetectionList: any[];
  percentOff: string;
  HREED_Amount: number | null;
  arrearlist: any[];
  grosslist: any[];
  EarningsDeductionsDTO: any[];
  HRMED_Order: number | null;
}

export interface ActivateDeactivateEarningsDeductionRequest {
  HRMED_Id: number;
  HRMED_Name: string;
  HRMED_EDTypeFlag: string;
  HRMED_EarnDedFlag: string;
  HRMED_AmountPercentFlag: string;
  HRMED_AmountPercent: string;
  HRMED_ActiveFlag: boolean;
  HRMED_RoundOffFlag: string;
  earningdetectionList: any[];
  retrunMsg: string;
  earningList: any[];
  detectionList: any[];
  eardettypelist: any[];
  eardettypeDropdown: any[];
  perc_OfDTO: any[];
  selectedearningdetectionList: any[];
  percentOff: string;
  HREED_Amount: number | null;
  arrearlist: any[];
  grosslist: any[];
  EarningsDeductionsDTO: any[];
  HRMED_Order: number | null;
}

export interface ActivateDeactivateEarningsDeductionResponse {
  HRMED_Id: number;
  MI_Id: number;
  HRMED_Name: string;
  HRMED_EDTypeFlag: string;
  HRMED_EarnDedFlag: string;
  HRMED_AmountPercentFlag: string;
  HRMED_AmountPercent: string;
  HRMED_ActiveFlag: boolean;
  HRMED_RoundOffFlag: string;
  earningdetectionList: any[];
  retrunMsg: string;
  roleId: number;
  HRMED_ReviseFlg: boolean;
  earningList: any[];
  detectionList: any[];
  eardettypelist: any[];
  eardettypeDropdown: any[];
  perc_OfDTO: any[];
  selectedearningdetectionList: any[];
  percentOff: string;
  HREED_Amount: number | null;
  arrearlist: any[];
  grosslist: any[];
  EarningsDeductionsDTO: any[];
  HRMED_Order: number | null;
}

// API Functions
export const getOnloadEarningsDeductionsDetails = async (roleId: number) => {
  try {
    const requestData: OnloadGetEarningsDeductionsDetailsRequest = {
      HRMED_Id: 0,
      MI_Id: 30, // Default MI_Id
      HRMED_Name: "",
      HRMED_EDTypeFlag: "",
      HRMED_EarnDedFlag: "",
      HRMED_AmountPercentFlag: "",
      HRMED_AmountPercent: "",
      HRMED_ActiveFlag: true,
      HRMED_RoundOffFlag: "",
      earningdetectionList: [],
      retrunMsg: "",
      earningList: [],
      detectionList: [],
      eardettypelist: [],
      eardettypeDropdown: [],
      perc_OfDTO: [],
      selectedearningdetectionList: [],
      percentOff: "",
      HREED_Amount: null,
      arrearlist: [],
      grosslist: [],
      EarningsDeductionsDTO: [],
      HRMED_Order: null,
    };

    const response = await api.post<OnloadGetEarningsDeductionsDetailsResponse>(
      "/api/MasterEarningsDeductionsFacade/onloadgetdetails",
      requestData
    );

    return {
      success: true,
      data: response,
      message: "Earnings and deductions details loaded successfully",
    };
  } catch (error: any) {
    console.error("Error loading earnings and deductions details:", error);
    return {
      success: false,
      data: null,
      message: error.message || "Failed to load earnings and deductions details",
    };
  }
};

export const saveMasterEarningsDeduction = async (data: MasterEarningsDeductionInput) => {
  try {
    const response = await api.post(
      "/api/MasterEarningsDeductionsFacade",
      data
    );

    return {
      success: true,
      data: response,
      message: "Earnings and deduction saved successfully",
    };
  } catch (error: any) {
    console.error("Error saving earnings and deduction:", error);
    return {
      success: false,
      data: null,
      message: error.message || "Failed to save earnings and deduction",
    };
  }
};

export const getEarningsDeductionById = async (id: number) => {
  try {
    const response = await api.get(
      `/api/MasterEarningsDeductionsFacade/getRecordById/${id}`
    );

    return {
      success: true,
      data: response,
      message: "Earnings and deduction retrieved successfully",
    };
  } catch (error: any) {
    console.error("Error retrieving earnings and deduction:", error);
    return {
      success: false,
      data: null,
      message: error.message || "Failed to retrieve earnings and deduction",
    };
  }
};

export const activateDeactivateEarningsDeduction = async (data: ActivateDeactivateEarningsDeductionRequest) => {
  try {
    const response = await api.post<ActivateDeactivateEarningsDeductionResponse>(
      "/api/MasterEarningsDeductionsFacade/deactivateRecordById",
      data
    );

    return {
      success: true,
      data: response,
      message: "Earnings and deduction status updated successfully",
    };
  } catch (error: any) {
    console.error("Error updating earnings and deduction status:", error);
    return {
      success: false,
      data: null,
      message: error.message || "Failed to update earnings and deduction status",
    };
  }
};