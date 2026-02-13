'use server';

import { IVenueWiseReportData, IVenueWiseReportDropdowns, VenueWiseParticipationReportFormSchema } from "@/types/sports/reports/venue-wise-participation-report";

export async function getVenueWiseParticipationDropdowns(): Promise<IVenueWiseReportDropdowns> {
    // Mock data
    const academicYear = [
        { asmaY_Id: 1, asmaY_Year: '2023-2024' },
        { asmaY_Id: 2, asmaY_Year: '2024-2025' },
    ];

    const classList = [
        { asmcL_Id: 1, asmcL_ClassName: 'Class 1' },
        { asmcL_Id: 2, asmcL_ClassName: 'Class 2' },
        { asmcL_Id: 10, asmcL_ClassName: 'Class 10' },
    ];

    const sectionList = [
        { asmS_Id: 1, asmC_SectionName: 'A' },
        { asmS_Id: 2, asmC_SectionName: 'B' },
        { asmS_Id: 3, asmC_SectionName: 'C' },
    ];

    const houseList = [
        { spccmH_Id: 1, spccmH_HouseName: 'Red House' },
        { spccmH_Id: 2, spccmH_HouseName: 'Blue House' },
        { spccmH_Id: 3, spccmH_HouseName: 'Green House' },
        { spccmH_Id: 4, spccmH_HouseName: 'Yellow House' },
    ];

    const venueList = [
        { spccmeV_Id: 1, spccmeV_EventVenue: 'Main Stadium' },
        { spccmeV_Id: 2, spccmeV_EventVenue: 'Indoor Arena' },
        { spccmeV_Id: 3, spccmeV_EventVenue: 'School Ground' },
    ];

    return {
        academicYear,
        classList,
        sectionList,
        houseList,
        venueList,
    };
}

export async function getVenueWiseParticipationReport(data: VenueWiseParticipationReportFormSchema): Promise<IVenueWiseReportData[]> {
    console.log('Fetching Venue Wise Report with data:', data);

    // Mock data generation
    // In a real scenario, this would filter based on the input 'data'
    const reportData: IVenueWiseReportData[] = [];

    const students = [
        { name: 'John Doe', admNo: 'ADM001', class: 'Class 10', section: 'A', house: 'Red House' },
        { name: 'Jane Smith', admNo: 'ADM002', class: 'Class 10', section: 'B', house: 'Blue House' },
        { name: 'Alice Johnson', admNo: 'ADM003', class: 'Class 9', section: 'A', house: 'Green House' },
        { name: 'Bob Brown', admNo: 'ADM004', class: 'Class 9', section: 'B', house: 'Yellow House' },
    ];

    const venues = ['Main Stadium', 'Indoor Arena', 'School Ground'];
    const events = ['100m Sprint', 'Long Jump', 'Chess', 'Swimming'];

    // Generate some random records
    for (let i = 0; i < 20; i++) {
        const student = students[Math.floor(Math.random() * students.length)];
        const venue = venues[Math.floor(Math.random() * venues.length)];
        const event = events[Math.floor(Math.random() * events.length)];

        reportData.push({
            SPCCMH_HouseName: student.house,
            SPCCMEV_EventVenue: venue,
            AMST_Name: student.name,
            AMST_AdmNo: student.admNo,
            ASMCL_ClassName: student.class,
            ASMC_SectionName: student.section,
            SPCCME_EventName: event,
            SPCCMSCC_SportsCCName: event + ' Championship',
            SPCCE_StartDate: new Date().toISOString(),
        });
    }

    return reportData;
}
