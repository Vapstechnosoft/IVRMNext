'use server';

import { api_new } from '@/lib/apiService_new';

/**
 * Digital Signage Backend Services
 */

// ----------------------------------------------------------------------------
// 1. UPLOAD & SCHEDULE
// ----------------------------------------------------------------------------
export async function uploadAndSchedule(formData: FormData) {
    try {
        // The Flask API expects 'file', 'start_date', 'end_date', 'display_id'
        // based on the user's specification. However, internal CMS often uses 'files[]'.
        // We'll stick to the user's provided spec for the /upload-schedule endpoint.
        
        const response = await api_new.post('signage', '/upload-schedule', formData, {
            headers: {
                'X-Signage-Client-ID': process.env.SIGNAGE_CLIENT_ID || '',
                'X-API-Key': process.env.SIGNAGE_SECRET_KEY || ''
            }
        });
        return response;
    } catch (error: any) {
        console.error('Error in uploadAndSchedule:', error);
        return { success: false, message: error?.message || 'Failed to upload and schedule' };
    }
}

// ----------------------------------------------------------------------------
// 2. LIBRARY (MEDIA)
// ----------------------------------------------------------------------------
export async function getLibrary(page: number = 1) {
    try {
        const response = await api_new.request('signage', 'GET', `/library?page=${page}`, {
            headers: {
                'X-Signage-Client-ID': process.env.SIGNAGE_CLIENT_ID || '',
                'X-API-Key': process.env.SIGNAGE_SECRET_KEY || ''
            }
        });
        return response;
    } catch (error: any) {
        console.error('Error in getLibrary:', error);
        return { success: false, message: error?.message || 'Failed to fetch library' };
    }
}

export async function deleteMedia(mediaId: number, forceDelete: boolean = false) {
    try {
        const response = await api_new.request('signage', 'DELETE', `/library/${mediaId}?forceDelete=${forceDelete ? 1 : 0}`, {
            headers: {
                'X-Signage-Client-ID': process.env.SIGNAGE_CLIENT_ID || '',
                'X-API-Key': process.env.SIGNAGE_SECRET_KEY || ''
            }
        });
        return response;
    } catch (error: any) {
        console.error('Error in deleteMedia:', error);
        return { success: false, message: error?.message || 'Failed to delete media' };
    }
}

// ----------------------------------------------------------------------------
// 3. SCHEDULE
// ----------------------------------------------------------------------------
export async function getSchedule(page: number = 1) {
    try {
        const response = await api_new.request('signage', 'GET', `/schedule?page=${page}`, {
            headers: {
                'X-Signage-Client-ID': process.env.SIGNAGE_CLIENT_ID || '',
                'X-API-Key': process.env.SIGNAGE_SECRET_KEY || ''
            }
        });
        return response;
    } catch (error: any) {
        console.error('Error in getSchedule:', error);
        return { success: false, message: error?.message || 'Failed to fetch schedule' };
    }
}

export async function deleteSchedule(eventId: number) {
    try {
        const response = await api_new.request('signage', 'DELETE', `/schedule/${eventId}`, {
            headers: {
                'X-Signage-Client-ID': process.env.SIGNAGE_CLIENT_ID || '',
                'X-API-Key': process.env.SIGNAGE_SECRET_KEY || ''
            }
        });
        return response;
    } catch (error: any) {
        console.error('Error in deleteSchedule:', error);
        return { success: false, message: error?.message || 'Failed to delete schedule' };
    }
}

// ----------------------------------------------------------------------------
// 4. DISPLAYS
// ----------------------------------------------------------------------------
export async function getDisplays(page: number = 1) {
    try {
        const response = await api_new.request('signage', 'GET', `/display?page=${page}`, {
            headers: {
                'X-Signage-Client-ID': process.env.SIGNAGE_CLIENT_ID || '',
                'X-API-Key': process.env.SIGNAGE_SECRET_KEY || ''
            }
        });
        return response;
    } catch (error: any) {
        console.error('Error in getDisplays:', error);
        return { success: false, message: error?.message || 'Failed to fetch displays' };
    }
}

export async function requestScreenshot(displayId: number) {
    try {
        const response = await api_new.request('signage', 'PUT', `/display/requestscreenshot/${displayId}`, {}, {
            headers: {
                'X-Signage-Client-ID': process.env.SIGNAGE_CLIENT_ID || '',
                'X-API-Key': process.env.SIGNAGE_SECRET_KEY || ''
            }
        });
        return response;
    } catch (error: any) {
        console.error('Error in requestScreenshot:', error);
        return { success: false, message: error?.message || 'Failed to request screenshot' };
    }
}
