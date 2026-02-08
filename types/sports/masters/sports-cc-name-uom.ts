import { z } from 'zod';

export const MasterSportsCCNameUOMSchema = z.object({
    SPCCMSCCUOM_Id: z.number().default(0),
    SPCCMSCC_Id: z.number({ required_error: "Select Sports Name" }).min(1, "Select Sports Name"),
    SPCCMUOM_Id: z.number({ required_error: "Select UOM" }).min(1, "Select UOM"),
    SPCCMSCCUOM_ActiveFlag: z.boolean().default(true).optional(),

    // Display fields for table
    sportsCCName: z.string().optional(),
    uomName: z.string().optional(),
});

export type IMasterSportsCCNameUOM = z.infer<typeof MasterSportsCCNameUOMSchema>;

export interface ISportsCCName {
    spccmscC_Id: number;
    spccmscC_SportsCCName: string;
}

export interface IUOM {
    spccmuoM_Id: number;
    spccmuoM_UOMName: string;
}

export interface IMasterSportsCCNameUOMResponse {
    sportsCCNameList: ISportsCCName[];
    uomList: IUOM[];
    sportsCCNameUOMList: IMasterSportsCCNameUOM[];
    count: number;
}
