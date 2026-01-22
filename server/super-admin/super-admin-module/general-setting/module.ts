'use server';

import { type ApiResponse, api } from '@/lib/apiService';
import { masterModuleSchema } from '@/schemas/super-admin/super-admin-module/general-setting/module';
import type { IMasterModule } from '@/types/super-admin/super-admin-module/general-setting/module';
import { revalidatePath } from 'next/cache';

const API_URL = '/v1/general-setting/master-module'; // Stub URL

export async function saveMasterModule(data: any) {
    const validation = masterModuleSchema.safeParse(data);

    if (!validation.success) {
        return {
            success: false,
            message: 'Validation failed',
            errors: validation.error.flatten().fieldErrors,
        };
    }

    // Stubbing the API call
    console.log('Saving Master Module:', data);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate success
    revalidatePath('/SuperAdmin/super-admin-module/general-setting/module');
    return {
        success: true,
        message: 'Master Module saved successfully!',
        data: { ...data, ivrmM_Id: Math.floor(Math.random() * 1000) },
    };
}

export async function getMasterModules() {
    // Stub data based on the user's snippet structure
    const stubData: IMasterModule[] = [
        {
            ivrmM_Id: 1,
            ivrmM_ModuleName: 'Admission',
            ivrmM_ModuleDesc: 'Admission Module for student enrollment',
            module_ActiveFlag: 1,
            id: 1
        },
        {
            ivrmM_Id: 2,
            ivrmM_ModuleName: 'Fees',
            ivrmM_ModuleDesc: 'Fee Management Module',
            module_ActiveFlag: 1,
            id: 2
        },
        {
            ivrmM_Id: 3,
            ivrmM_ModuleName: 'Exam',
            ivrmM_ModuleDesc: 'Examination Module',
            module_ActiveFlag: 0,
            id: 3
        }
    ];

    return {
        success: true,
        data: stubData,
        message: 'Data fetched successfully'
    };
}

export async function deleteMasterModule(id: number) {
    console.log('Deleting/Deactivating Master Module:', id);
    revalidatePath('/SuperAdmin/super-admin-module/general-setting/module');
    return {
        success: true,
        message: 'Record status updated successfully'
    };
}
