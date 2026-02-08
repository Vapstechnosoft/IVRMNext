'use server';

import { type ApiResponse } from '@/lib/apiService';
import { IDropdown } from '@/types';
import { SportTopperListReportFormData, SportTopperListReportData } from '@/schemas/sports/reports/sport-topper-list-report';

export async function getInitialData(): Promise<ApiResponse<{ academicYears: IDropdown[], sports: IDropdown[] }>> {
    const academicYears: IDropdown[] = [
        { id: 1, label: '2023-2024', code: '2023-2024', name: '2023-2024' },
        { id: 2, label: '2024-2025', code: '2024-2025', name: '2024-2025' },
        { id: 3, label: '2025-2026', code: '2025-2026', name: '2025-2026' }
    ];

    const sports: IDropdown[] = [
        { id: 1, label: 'Cricket', code: 'CKT', name: 'Cricket' },
        { id: 2, label: 'Football', code: 'FBL', name: 'Football' },
        { id: 3, label: 'Basketball', code: 'BKB', name: 'Basketball' },
        { id: 4, label: 'Athletics', code: 'ATH', name: 'Athletics' }
    ];

    return {
        success: true,
        message: 'Initial data fetched successfully',
        data: { academicYears, sports }
    };
}

export async function getDetails(data: { ASMAY_Id: number }): Promise<ApiResponse<{ classes: IDropdown[], houses: IDropdown[], events: IDropdown[] }>> {
    const classes: IDropdown[] = [
        { id: 1, label: 'Class I', code: 'I', name: 'Class I' },
        { id: 2, label: 'Class II', code: 'II', name: 'Class II' },
        { id: 3, label: 'Class III', code: 'III', name: 'Class III' },
        { id: 4, label: 'Class IV', code: 'IV', name: 'Class IV' },
        { id: 5, label: 'Class V', code: 'V', name: 'Class V' }
    ];

    const houses: IDropdown[] = [
        { id: 1, label: 'Red House', code: 'RED', name: 'Red House' },
        { id: 2, label: 'Blue House', code: 'BLUE', name: 'Blue House' },
        { id: 3, label: 'Green House', code: 'GRN', name: 'Green House' },
        { id: 4, label: 'Yellow House', code: 'YEL', name: 'Yellow House' }
    ];

    const events: IDropdown[] = [
        { id: 1, label: '100m Race', code: '100M', name: '100m Race' },
        { id: 2, label: 'Relay Race', code: 'RELAY', name: 'Relay Race' },
        { id: 3, label: 'High Jump', code: 'HJ', name: 'High Jump' },
        { id: 4, label: 'Long Jump', code: 'LJ', name: 'Long Jump' }
    ];

    return {
        success: true,
        message: 'Details fetched successfully',
        data: { classes, houses, events }
    };
}

export async function getSections(data: { ASMAY_Id: number, asmcL_Id: number }): Promise<ApiResponse<IDropdown[]>> {
    const sections: IDropdown[] = [
        { id: 1, label: 'A', code: 'A', name: 'A' },
        { id: 2, label: 'B', code: 'B', name: 'B' },
        { id: 3, label: 'C', code: 'C', name: 'C' }
    ];

    return {
        success: true,
        message: 'Sections fetched successfully',
        data: sections
    };
}

export async function getReportData(data: SportTopperListReportFormData): Promise<ApiResponse<SportTopperListReportData[]>> {
    const dummyData: SportTopperListReportData[] = [
        { id: 1, spccmH_HouseName: 'Red House', spccestR_Points: 10, spccestR_Rank: '1st', amsT_Name: 'John Doe', amsT_AdmNo: 'ADM001', asmcL_ClassName: 'Class V', asmC_SectionName: 'A', spccmE_EventName: '100m Race', spccmeV_EventVenue: 'Main Ground', spccmscc_SportsCCName: 'Athletics', spccE_StartDate: '2025-01-15' },
        { id: 2, spccmH_HouseName: 'Blue House', spccestR_Points: 8, spccestR_Rank: '2nd', amsT_Name: 'Jane Smith', amsT_AdmNo: 'ADM002', asmcL_ClassName: 'Class V', asmC_SectionName: 'B', spccmE_EventName: '100m Race', spccmeV_EventVenue: 'Main Ground', spccmscc_SportsCCName: 'Athletics', spccE_StartDate: '2025-01-15' },
        { id: 3, spccmH_HouseName: 'Green House', spccestR_Points: 6, spccestR_Rank: '3rd', amsT_Name: 'Michael Johnson', amsT_AdmNo: 'ADM003', asmcL_ClassName: 'Class IV', asmC_SectionName: 'A', spccmE_EventName: 'High Jump', spccmeV_EventVenue: 'Indoor Stadium', spccmscc_SportsCCName: 'Athletics', spccE_StartDate: '2025-01-16' },
        { id: 4, spccmH_HouseName: 'Yellow House', spccestR_Points: 10, spccestR_Rank: '1st', amsT_Name: 'Emily Davis', amsT_AdmNo: 'ADM004', asmcL_ClassName: 'Class IV', asmC_SectionName: 'B', spccmE_EventName: 'Long Jump', spccmeV_EventVenue: 'Main Ground', spccmscc_SportsCCName: 'Athletics', spccE_StartDate: '2025-01-17' },
        { id: 5, spccmH_HouseName: 'Red House', spccestR_Points: 8, spccestR_Rank: '2nd', amsT_Name: 'David Wilson', amsT_AdmNo: 'ADM005', asmcL_ClassName: 'Class III', asmC_SectionName: 'A', spccmE_EventName: 'Relay Race', spccmeV_EventVenue: 'Main Ground', spccmscc_SportsCCName: 'Athletics', spccE_StartDate: '2025-01-18' },
        { id: 6, spccmH_HouseName: 'Blue House', spccestR_Points: 6, spccestR_Rank: '3rd', amsT_Name: 'Sarah Brown', amsT_AdmNo: 'ADM006', asmcL_ClassName: 'Class III', asmC_SectionName: 'B', spccmE_EventName: 'Relay Race', spccmeV_EventVenue: 'Main Ground', spccmscc_SportsCCName: 'Athletics', spccE_StartDate: '2025-01-18' },
        { id: 7, spccmH_HouseName: 'Green House', spccestR_Points: 10, spccestR_Rank: '1st', amsT_Name: 'James Taylor', amsT_AdmNo: 'ADM007', asmcL_ClassName: 'Class II', asmC_SectionName: 'A', spccmE_EventName: 'cricket Match', spccmeV_EventVenue: 'Main Ground', spccmscc_SportsCCName: 'Cricket', spccE_StartDate: '2025-01-19' },
        { id: 8, spccmH_HouseName: 'Yellow House', spccestR_Points: 8, spccestR_Rank: '2nd', amsT_Name: 'Olivia Moore', amsT_AdmNo: 'ADM008', asmcL_ClassName: 'Class II', asmC_SectionName: 'B', spccmE_EventName: 'cricket Match', spccmeV_EventVenue: 'Main Ground', spccmscc_SportsCCName: 'Cricket', spccE_StartDate: '2025-01-19' },
        { id: 9, spccmH_HouseName: 'Red House', spccestR_Points: 6, spccestR_Rank: '3rd', amsT_Name: 'William Jackson', amsT_AdmNo: 'ADM009', asmcL_ClassName: 'Class I', asmC_SectionName: 'A', spccmE_EventName: 'Football Match', spccmeV_EventVenue: 'Football Ground', spccmscc_SportsCCName: 'Football', spccE_StartDate: '2025-01-20' },
        { id: 10, spccmH_HouseName: 'Blue House', spccestR_Points: 10, spccestR_Rank: '1st', amsT_Name: 'Sophia Martin', amsT_AdmNo: 'ADM010', asmcL_ClassName: 'Class I', asmC_SectionName: 'B', spccmE_EventName: 'Football Match', spccmeV_EventVenue: 'Football Ground', spccmscc_SportsCCName: 'Football', spccE_StartDate: '2025-01-20' },
        { id: 11, spccmH_HouseName: 'Green House', spccestR_Points: 8, spccestR_Rank: '2nd', amsT_Name: 'Robert Anderson', amsT_AdmNo: 'ADM011', asmcL_ClassName: 'Class V', asmC_SectionName: 'A', spccmE_EventName: 'Basketball Match', spccmeV_EventVenue: 'Basketball Court', spccmscc_SportsCCName: 'Basketball', spccE_StartDate: '2025-01-21' },
        { id: 12, spccmH_HouseName: 'Yellow House', spccestR_Points: 6, spccestR_Rank: '3rd', amsT_Name: 'Isabella White', amsT_AdmNo: 'ADM012', asmcL_ClassName: 'Class V', asmC_SectionName: 'B', spccmE_EventName: 'Basketball Match', spccmeV_EventVenue: 'Basketball Court', spccmscc_SportsCCName: 'Basketball', spccE_StartDate: '2025-01-21' },
        { id: 13, spccmH_HouseName: 'Red House', spccestR_Points: 10, spccestR_Rank: '1st', amsT_Name: 'Charles Harris', amsT_AdmNo: 'ADM013', asmcL_ClassName: 'Class IV', asmC_SectionName: 'A', spccmE_EventName: 'Shot Put', spccmeV_EventVenue: 'Main Ground', spccmscc_SportsCCName: 'Athletics', spccE_StartDate: '2025-01-22' },
        { id: 14, spccmH_HouseName: 'Blue House', spccestR_Points: 8, spccestR_Rank: '2nd', amsT_Name: 'Amelia Clark', amsT_AdmNo: 'ADM014', asmcL_ClassName: 'Class IV', asmC_SectionName: 'B', spccmE_EventName: 'Shot Put', spccmeV_EventVenue: 'Main Ground', spccmscc_SportsCCName: 'Athletics', spccE_StartDate: '2025-01-22' }
    ];

    return {
        success: true,
        message: 'Report data fetched successfully',
        data: dummyData
    };
}
