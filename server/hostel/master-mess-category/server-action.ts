'use server';

import { revalidatePath } from 'next/cache';

// Types
export interface IMess {
    hlmM_Id: number;
    hlmM_Name: string;
    hlmM_ActiveFlag: boolean;
}

export interface IMessCategory {
    hlmmC_Id: number;
    hlmmC_Name: string;
    hlmmC_ActiveFlag: boolean;
}

export interface IMessCategoryMapping {
    hlmmmC_Id: number;
    hlmM_Id: number;
    hlmmC_Id: number;
    hlmmmC_ActiveFlag: boolean;
}

// Mock Data Stores
const MOCK_MESSES: IMess[] = [
    { hlmM_Id: 1, hlmM_Name: 'Boys Mess A', hlmM_ActiveFlag: true },
    { hlmM_Id: 2, hlmM_Name: 'Girls Mess B', hlmM_ActiveFlag: true },
    { hlmM_Id: 3, hlmM_Name: 'Staff Mess', hlmM_ActiveFlag: true }
];

const MOCK_CATEGORIES: IMessCategory[] = [
    { hlmmC_Id: 1, hlmmC_Name: 'Breakfast', hlmmC_ActiveFlag: true },
    { hlmmC_Id: 2, hlmmC_Name: 'Lunch', hlmmC_ActiveFlag: true },
    { hlmmC_Id: 3, hlmmC_Name: 'Dinner', hlmmC_ActiveFlag: true },
    { hlmmC_Id: 4, hlmmC_Name: 'Snacks', hlmmC_ActiveFlag: true }
];

let MOCK_MAPPINGS: IMessCategoryMapping[] = [
    { hlmmmC_Id: 1, hlmM_Id: 1, hlmmC_Id: 1, hlmmmC_ActiveFlag: true },
    { hlmmmC_Id: 2, hlmM_Id: 1, hlmmC_Id: 2, hlmmmC_ActiveFlag: true },
    { hlmmmC_Id: 3, hlmM_Id: 2, hlmmC_Id: 1, hlmmmC_ActiveFlag: true }
];

export async function fetchMessCategoryMappingData(searchParams: { [key: string]: string | string[] | undefined }) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Join data for display
    const data = MOCK_MAPPINGS.map(mapping => {
        const mess = MOCK_MESSES.find(m => m.hlmM_Id === mapping.hlmM_Id);
        const category = MOCK_CATEGORIES.find(c => c.hlmmC_Id === mapping.hlmmC_Id);
        return {
            ...mapping,
            hlmM_Name: mess?.hlmM_Name || 'Unknown Mess',
            hlmmC_Name: category?.hlmmC_Name || 'Unknown Category'
        };
    });

    return {
        success: true,
        message: 'Data fetched successfully',
        data: {
            master_mess: MOCK_MESSES,
            mess_category: MOCK_CATEGORIES,
            get_messlistmapping: data
        }
    };
}

export async function saveMessCategoryMapping(data: { hlmM_Id: string; messCategories: number[] }) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
        const messId = Number(data.hlmM_Id);
        let savedCount = 0;
        let duplicateCount = 0;

        for (const catId of data.messCategories) {
            // Check for duplicate
            const exists = MOCK_MAPPINGS.find(m => m.hlmM_Id === messId && m.hlmmC_Id === catId);
            if (exists) {
                duplicateCount++;
                continue;
            }

            const newId = (MOCK_MAPPINGS.length > 0 ? Math.max(...MOCK_MAPPINGS.map(m => m.hlmmmC_Id)) : 0) + 1;
            MOCK_MAPPINGS.push({
                hlmmmC_Id: newId,
                hlmM_Id: messId,
                hlmmC_Id: catId,
                hlmmmC_ActiveFlag: true
            });
            savedCount++;
        }

        revalidatePath('/hostel/master-mess-category');
        return {
            success: true,
            message: `Saved ${savedCount} records. ${duplicateCount} duplicates found.`
        };

    } catch (error) {
        return { success: false, message: 'Failed to save mapping' };
    }
}

export async function deleteMessCategoryMapping(id: number) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = MOCK_MAPPINGS.findIndex((m) => m.hlmmmC_Id === id);
    if (index !== -1) {
        MOCK_MAPPINGS[index].hlmmmC_ActiveFlag = !MOCK_MAPPINGS[index].hlmmmC_ActiveFlag;
        revalidatePath('/hostel/master-mess-category');
        const status = MOCK_MAPPINGS[index].hlmmmC_ActiveFlag ? 'activated' : 'deactivated';
        return { success: true, message: `Mapping ${status} successfully` };
    }
    return { success: false, message: 'Mapping not found' };
}
