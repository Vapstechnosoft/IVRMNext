'use server';

import { api } from "@/lib/apiService";
import { AppointmentApprovalLoadData, SaveAppointmentApprovalResponse } from "@/types/visitors-management/appointment-approval-types";
import { AppointmentApprovalSchema, FeedbackSchema } from "@/schemas/visitors-management/appointment-approval-schema";

const API_URL = "V_AppointmentApprovalStatus";

export async function getAppointmentApprovalData(id = 1) {
  try {
    const res = await api.get<AppointmentApprovalLoadData>("default", `/${API_URL}/getDetails/${id}`);
    if (!res.success) {
      throw new Error(res.message || "Failed to fetch appointment approval data");
    }
    return res;
  } catch (error) {
    console.error("Error fetching appointment approval data:", error);
    return { success: false, message: "Failed to fetch data", visitorlist: [], griddata: [], emplist: [] };
  }
}

export async function saveAppointmentApproval(data: AppointmentApprovalSchema) {
  try {
    const payload = {
      ...data,
      VMAP_MeetingTiming: data.VMAP_MeetingTiming, // Ensure format matches backend expectation?
      VMAP_MeetingToTime: data.VMAP_MeetingToTime,
    };
    const res = await api.post<SaveAppointmentApprovalResponse>("default", `/${API_URL}/saveData`, payload);
    return res;
  } catch (error) {
    console.error("Error saving appointment approval:", error);
    return { success: false, message: "Failed to save data", returnVal: "error" };
  }
}


export async function saveFeedback(data: FeedbackSchema) {
  try {
    const res = await api.post<any>("default", `/${API_URL}/savefeedback/`, data);
    return res;
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false, message: "Failed to save feedback" };
  }
}

export async function getFeedback(data: { VMAP_Id: number }) {
  try {
    const res = await api.post<any>("default", `/${API_URL}/getfeedback/`, data);
    return res;
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return { success: false, message: "Failed to fetch feedback" };
  }
}

export async function sendMOM(data: any) {
  try {
    const res = await api.post<any>("default", `/${API_URL}/sendMOM`, data);
    return res;
  } catch (error) {
    console.error("Error sending MOM:", error);
    return { success: false, message: "Failed to send MOM" };
  }
}
