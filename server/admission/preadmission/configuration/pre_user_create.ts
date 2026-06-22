'use server';

import { api } from '@/lib/apiService';

export async function getPreUserInitialData(miId: number) {
    const url = '/RegistrationReport/Getdetailsforpre';
    return await api.post<any>('preadmission', url, { MI_Id: miId });
}

export async function createPreUser(formData: FormData) {
    const url = '/Login/Regis';
    // Using default as it might be a global login endpoint, but it could also be preadmission.
    // Try preadmission first, if it fails, the frontend should show the error.
    return await api.postMultipart<any>('default', url, formData);
}

export async function activateDeactivatePreUsers(users: any[], count: number) {
    const url = '/RegistrationReport/avtivedeactive';
    return await api.post<any>('preadmission', url, { data_array: users, count });
}

export async function sendSmsToPreUsers(users: any[]) {
    const url = '/RegistrationReport/smssend';
    return await api.post<any>('preadmission', url, { data_array: users });
}

export async function sendEmailToPreUsers(users: any[]) {
    const url = '/RegistrationReport/emailsend';
    return await api.post<any>('preadmission', url, { data_array: users });
}
