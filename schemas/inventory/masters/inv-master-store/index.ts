import { z } from 'zod';

export const invMasterStoreSchema = z.object({
    invmsT_Id: z.number().default(0),
    invmS_StoreName: z.string().min(1, 'Store Name is required'),
    invmS_StoreLocation: z.string().min(1, 'Store Location is required'),
    invmS_ContactPerson: z.string().optional(),
    invmS_ContactNo: z.string().min(10, 'Contact Number must be 10 digits').max(10, 'Contact Number must be 10 digits').regex(/^[6-9][0-9]{9}$/, 'Enter valid Contact NO'),
    hrmE_Id: z.coerce.number().min(1, 'Store Incharge is required'),
});

export type TInvMasterStore = z.infer<typeof invMasterStoreSchema>;
