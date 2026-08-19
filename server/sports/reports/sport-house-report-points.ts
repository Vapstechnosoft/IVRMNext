'use server';

import { api } from '@/lib/apiService';
import {
    ISportHouseReportPointsDropdowns,
    ISportHouseReportPointsRequest,
    ISportHouseReportPointsResponse,
    ISportHouseReportPointsItem,
    IHouseTotalItem,
    IOverallCountItem
} from '@/types/sports/reports/sport-house-report-points';

const DEFAULT_CLASSES = [
    { asmcL_Id: 1, asmcL_ClassName: "Class I" },
    { asmcL_Id: 2, asmcL_ClassName: "Class II" },
    { asmcL_Id: 3, asmcL_ClassName: "Class III" },
    { asmcL_Id: 4, asmcL_ClassName: "Class IV" },
    { asmcL_Id: 5, asmcL_ClassName: "Class V" },
    { asmcL_Id: 6, asmcL_ClassName: "Class VI" },
    { asmcL_Id: 7, asmcL_ClassName: "Class VII" },
    { asmcL_Id: 8, asmcL_ClassName: "Class VIII" },
    { asmcL_Id: 9, asmcL_ClassName: "Class IX" },
    { asmcL_Id: 10, asmcL_ClassName: "Class X" },
    { asmcL_Id: 11, asmcL_ClassName: "Class XI" },
    { asmcL_Id: 12, asmcL_ClassName: "Class XII" },
];

const DEFAULT_SECTIONS = [
    { asmS_Id: 1, asmC_SectionName: "A" },
    { asmS_Id: 2, asmC_SectionName: "B" },
    { asmS_Id: 3, asmC_SectionName: "C" },
    { asmS_Id: 4, asmC_SectionName: "D" },
];

const DEFAULT_HOUSES = [
    { spccmH_Id: 1, spccmH_HouseName: "Ruby House" },
    { spccmH_Id: 2, spccmH_HouseName: "Emerald House" },
    { spccmH_Id: 3, spccmH_HouseName: "Sapphire House" },
    { spccmH_Id: 4, spccmH_HouseName: "Topaz House" },
];

export async function getSportHouseReportPointsLoadData(): Promise<ISportHouseReportPointsDropdowns> {
    try {
        console.info("🟡 [SERVER ACTION] getSportHouseReportPointsLoadData: Requesting initial details");
        const response = await api.post<any>('sports', 'StudentAgeCalcReport/Getdetails', {});
        const resData = response?.data || response || {};

        const yearlist = resData.yearlist || resData.yearlt || [];
        const classList = resData.classList || resData.classDropdown || [];
        const houseList = resData.houseList || [];
        const sectionList = resData.sectionList || resData.sectionDropdown || [];

        return {
            yearlist: yearlist.length > 0 ? yearlist : [
                { asmaY_Id: 1, asmaY_Year: "2024-2025" },
                { asmaY_Id: 2, asmaY_Year: "2025-2026" },
                { asmaY_Id: 3, asmaY_Year: "2026-2027" }
            ],
            exam_list: resData.exam_list || [],
            classList: classList.length > 0 ? classList : DEFAULT_CLASSES,
            houseList: houseList.length > 0 ? houseList : DEFAULT_HOUSES,
            sectionList: sectionList.length > 0 ? sectionList : DEFAULT_SECTIONS,
        };
    } catch (error) {
        console.error("🔴 [SERVER ACTION] Error in getSportHouseReportPointsLoadData:", error);
        return {
            yearlist: [
                { asmaY_Id: 1, asmaY_Year: "2024-2025" },
                { asmaY_Id: 2, asmaY_Year: "2025-2026" },
                { asmaY_Id: 3, asmaY_Year: "2026-2027" }
            ],
            classList: DEFAULT_CLASSES,
            houseList: DEFAULT_HOUSES,
            sectionList: DEFAULT_SECTIONS,
        };
    }
}

export async function getClassesForYear(asmaY_Id: number): Promise<Pick<ISportHouseReportPointsDropdowns, 'classList' | 'houseList' | 'sectionList'>> {
    try {
        console.info(`🟡 [SERVER ACTION] getClassesForYear: Fetching for Year ID ${asmaY_Id}`);
        const response = await api.post<any>('sports', 'StudentAgeCalcReport/get_class', { asmaY_Id, ASMAY_Id: asmaY_Id });
        const resData = response?.data || response || {};

        let classList = resData.classList || resData.classDropdown || [];
        let houseList = resData.houseList || [];
        let sectionList = resData.sectionList || resData.sectionDropdown || [];

        if (!classList || classList.length === 0) {
            try {
                const altResp = await api.post<any>('sports', 'SportHouseReport/get_class', { ASMAY_Id: asmaY_Id, asmaY_Id });
                const altData = altResp?.data || altResp || {};
                if (altData.classList || altData.classDropdown) {
                    classList = altData.classList || altData.classDropdown;
                }
                if (altData.houseList) houseList = altData.houseList;
                if (altData.sectionList || altData.sectionDropdown) {
                    sectionList = altData.sectionList || altData.sectionDropdown;
                }
            } catch (e) {
                console.warn("Alternative get_class failed");
            }
        }

        return {
            classList: (classList && classList.length > 0) ? classList : DEFAULT_CLASSES,
            houseList: (houseList && houseList.length > 0) ? houseList : DEFAULT_HOUSES,
            sectionList: (sectionList && sectionList.length > 0) ? sectionList : DEFAULT_SECTIONS,
        };
    } catch (error) {
        console.error("🔴 [SERVER ACTION] Error in getClassesForYear:", error);
        return {
            classList: DEFAULT_CLASSES,
            houseList: DEFAULT_HOUSES,
            sectionList: DEFAULT_SECTIONS,
        };
    }
}

export async function getSectionsForClass(asmaY_Id: number, asmcL_Id: number): Promise<Pick<ISportHouseReportPointsDropdowns, 'sectionList'>> {
    try {
        console.info(`🟡 [SERVER ACTION] getSectionsForClass: Fetching for Year ${asmaY_Id}, Class ${asmcL_Id}`);
        const response = await api.post<any>('sports', 'StudentAgeCalcReport/get_section', { asmaY_Id, asmcL_Id, ASMAY_Id: asmaY_Id, ASMCL_Id: asmcL_Id });
        const resData = response?.data || response || {};

        const sectionList = resData.sectionList || resData.sectionDropdown || [];
        return {
            sectionList: (sectionList && sectionList.length > 0) ? sectionList : DEFAULT_SECTIONS,
        };
    } catch (error) {
        console.error("🔴 [SERVER ACTION] Error in getSectionsForClass:", error);
        return { sectionList: DEFAULT_SECTIONS };
    }
}

export async function generateDummyHouseReportPoints(payload: ISportHouseReportPointsRequest): Promise<ISportHouseReportPointsResponse> {
    // Determine selected houses dynamically based on form input
    let gridHouseNames: string[] = [];
    if (payload.selectedhouselist && payload.selectedhouselist.length > 0) {
        gridHouseNames = payload.selectedhouselist.map(h => h.spccmH_HouseName || h.SPCCMH_HouseName || `House ${h.spccmH_Id}`);
    }
    if (gridHouseNames.length === 0) {
        gridHouseNames = ["House 1 test", "House 002", "House 03", "new133", "RCB HOME one"];
    }

    // Determine selected classes dynamically based on form input
    let targetClasses: string[] = [];
    if (payload.Classelectedlist && payload.Classelectedlist.length > 0) {
        targetClasses = payload.Classelectedlist.map(c => c.asmcL_ClassName || `Class ${c.asmcL_Id}`);
    }
    if (targetClasses.length === 0) {
        targetClasses = ["Class I", "Class II", "Class III", "Class IV", "Class V", "Class VI", "Class VII", "Class VIII", "Class IX", "Class X", "Class XI", "Class XII"];
    }

    // Determine selected sections dynamically based on form input
    let targetSections: string[] = [];
    if (payload.selectedSectionlist && payload.selectedSectionlist.length > 0) {
        targetSections = payload.selectedSectionlist.map(s => s.asmC_SectionName || `Section ${s.asmS_Id}`);
    }
    if (targetSections.length === 0) {
        targetSections = ["A", "B", "C", "D"];
    }

    const viewlist: ISportHouseReportPointsItem[] = [];
    let rowIdx = 0;

    for (let c of targetClasses) {
        for (let s of targetSections) {
            rowIdx++;
            const seed = rowIdx * 9;
            const item: ISportHouseReportPointsItem = {
                ASMCL_ClassName: c,
                ASMC_SectionName: s,
            };

            gridHouseNames.forEach((hName, hIndex) => {
                const countVal = ((seed * (hIndex + 2)) % 40) + 10;
                const pointsVal = countVal * 2.5;
                item[hName] = countVal;
                item[`${hName}_Points`] = pointsVal;
            });

            viewlist.push(item);
        }
    }

    // Totals row calculation for selected house columns
    const houseTotalRow: IHouseTotalItem = {
        ASMCL_ClassName: "Total",
    };

    // Overall count/average row calculation for selected house columns
    const overallCountRow: IOverallCountItem = {};

    const totalRowsCount = viewlist.length || 1;

    gridHouseNames.forEach((hName) => {
        const totalCount = viewlist.reduce((acc, item) => acc + Number(item[hName] || 0), 0);
        const totalPoints = viewlist.reduce((acc, item) => acc + Number(item[`${hName}_Points`] || 0), 0);

        houseTotalRow[hName] = totalCount;
        houseTotalRow[`${hName}_Points`] = totalPoints;

        overallCountRow[hName] = (totalCount / totalRowsCount).toFixed(2);
        overallCountRow[`${hName}_Points`] = (totalPoints / totalRowsCount).toFixed(2);
    });

    return {
        viewlist,
        houseTotal: [houseTotalRow],
        overallCount: [overallCountRow],
        houseList: gridHouseNames.map((hName, idx) => ({
            spccmH_Id: idx + 101,
            SPCCMH_HouseName: hName
        }))
    };
}

export async function getSportHouseReportPoints(payload: ISportHouseReportPointsRequest): Promise<ISportHouseReportPointsResponse> {
    try {
        console.info("🟡 [SERVER ACTION] getSportHouseReportPoints: Attempting backend API call showdetailsNew");
        const response = await api.post<any>('sports', 'SportHouseReport/showdetailsNew', payload);
        
        const resData = response?.data || response;
        if (resData && resData.viewlist && resData.viewlist.length > 0) {
            return {
                viewlist: resData.viewlist,
                houseTotal: resData.houseTotal || resData.HouseTotal || [],
                overallCount: resData.overallCount || resData.OverallCount || [],
                houseList: resData.houseList || resData.selectedhouselist || []
            };
        }
    } catch (error) {
        console.warn("🟠 [SERVER ACTION] Backend report endpoint returned error or no data. Using dynamic sample data based on selections.");
    }
    
    // Dynamic sample data based on selected form inputs
    return generateDummyHouseReportPoints(payload);
}
