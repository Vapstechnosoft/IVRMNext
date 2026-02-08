import { z } from 'zod';

// Schema for the form
export const VenueWiseParticipationReportSchema = z.object({
    Type: z.enum(['House', 'CS'], { required_error: 'Type is required' }),
    ASMAY_Id: z.number().min(1, { message: 'Academic Year is required' }),

    // Conditional fields based on Type
    ASMCL_Id: z.number().optional(),
    ASMS_Id: z.number().optional(),

    // Legacy: House and Venue seem to be dependent/available in legacy but validation messages suggest required
    // Based on user request "By House" or "By Class/Section", we will enforce House selection in both or based on legacy logic
    // Legacy HTML: House required if Type=='House'. Class/Sec required if Type=='CS'.
    // Venue seems always optional or required based on 'required' attr in HTML select? HTML says required.

    // Multi-select lists (legacy uses checkboxes for Section, House, Venue)
    selectedSections: z.array(z.object({ asmS_Id: z.number() })).optional(),
    selectedHouses: z.array(z.object({ spccmH_Id: z.number() })).optional(),
    selectedVenues: z.array(z.object({ spccmeV_Id: z.number() })).optional(),

}).refine((data) => {
    if (data.Type === 'CS') {
        return !!data.ASMCL_Id;
    }
    return true;
}, {
    message: 'Class is required',
    path: ['ASMCL_Id'],
}).refine((data) => {
    // If Type is CS, Section is required (legacy used checkboxes)
    if (data.Type === 'CS') {
        return data.selectedSections && data.selectedSections.length > 0;
    }
    return true;
}, {
    message: 'Section is required',
    path: ['selectedSections'],
}).refine((data) => {
    // House is required if Type is House (based on legacy ng-required="Type=='House'")
    // But legacy also shows House dropdown/multi for CS type? 
    // Legacy HTML: ng-required="Type=='House'" for House.
    if (data.Type === 'House') {
        return data.selectedHouses && data.selectedHouses.length > 0;
    }
    return true;
}, {
    message: 'House is required',
    path: ['selectedHouses'],
}).refine((data) => {
    // Venue required always? HTML says required on select/checkbox
    return data.selectedVenues && data.selectedVenues.length > 0;
}, {
    message: 'Venue is required',
    path: ['selectedVenues'],
});

export type VenueWiseParticipationReportFormSchema = z.infer<typeof VenueWiseParticipationReportSchema>;

export interface IVenueWiseReportDropdowns {
    academicYear: { asmaY_Id: number; asmaY_Year: string }[];
    classList: { asmcL_Id: number; asmcL_ClassName: string }[];
    sectionList: { asmS_Id: number; asmC_SectionName: string }[];
    houseList: { spccmH_Id: number; spccmH_HouseName: string }[];
    venueList: { spccmeV_Id: number; spccmeV_EventVenue: string }[];
}

export interface IVenueWiseReportData {
    SPCCMH_HouseName: string;
    SPCCMEV_EventVenue: string;
    AMST_Name: string;
    AMST_AdmNo: string;
    ASMCL_ClassName: string;
    ASMC_SectionName: string;
    SPCCME_EventName: string;
    SPCCMSCC_SportsCCName: string;
    SPCCE_StartDate: string;
}
