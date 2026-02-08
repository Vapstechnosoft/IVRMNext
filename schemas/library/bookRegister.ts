import { z } from 'zod';

export const bookRegisterSchema = {
    addOrUpdate: z.object({
        LMB_Id: z.number().optional(),
        mI_Id: z.number().optional(),

        // Tab 1: Book Details
        LMB_BookTitle: z.string().min(1, 'Book Title is required'),
        MB_Subtitle: z.string().optional(),
        LMC_Id: z.coerce.number().min(1, 'Category is required'),
        LMB_BookType: z.string().min(1, 'Book Type is required'),
        LMS_Id: z.coerce.number().min(1, 'Subject is required'),
        LMD_Id: z.coerce.number().min(1, 'Department is required'),
        Binding_Type: z.string().optional(),
        LMB_Edition: z.string().optional(),
        LMB_PublishedYear: z.string().min(1, 'Published Year is required'),
        LMB_EntryDate: z.coerce.date({ required_error: 'Entry Date is required' }),
        MB_Call_No: z.string().optional(),
        LMB_ISBNNo: z.string().min(1, 'ISBN is required'),
        LMB_ClassNo: z.string().optional(),
        LMB_VolNo: z.string().optional(),
        MB_Pages: z.coerce.number().optional(),
        Invoice_No: z.string().optional(),
        LMBKF_KeyFactor: z.string().optional(),
        LMBKF_PageNo: z.coerce.number().optional(),
        LMB_BookNo: z.string().optional(),
        LMAL_Id: z.coerce.number().min(1, 'Library Name is required'),

        // Tab 2: Purchase Details
        Purchase_Date: z.coerce.date({ required_error: 'Purchase Date is required' }),
        LML_Id: z.coerce.number().min(1, 'Language is required'),
        LMB_BillNo: z.string().optional(),
        Voucher_No: z.string().optional(),
        LMB_PurOrDonated: z.string().min(1, 'Purchased/Donated is required'),

        // if Donated
        Donor_Id: z.string().optional(),
        LMB_DonorAddress: z.string().optional(),

        CurrencyType: z.string().optional(),
        Source_Type: z.string().optional(),
        LMV_Id: z.coerce.number().optional(), // Vendor
        MB_Keywords: z.string().optional(),
        LMP_Id: z.coerce.number().optional(), // Publisher
        MB_Remarks: z.string().optional(),
        Bibliography_Page: z.string().optional(),
        Index_Page: z.string().optional(),

        // Tab 3: Author & Accessories
        // Author can be selected (Master) or entered manually?
        // Legacy: 'master_author' checkbox.
        // We will accept either an ID or string names.
        LMAU_Id: z.coerce.number().optional(), // Author ID
        LMB_AuthorFirstName: z.string().optional(),
        LMB_AuthorMiddleName: z.string().optional(),
        LMB_AuthorLastName: z.string().optional(),

        LMBANO_AvialableStatus: z.string().min(1, 'Status is required'),
        LRM_Id: z.coerce.number().min(1, 'Room No is required'),
        LSM_Id: z.coerce.number().min(1, 'Shelf No is required'),
        LRAM_Id: z.coerce.number().min(1, 'Rack No is required'),
        lmrA_Id: z.coerce.number().min(1, 'Rack Name is required'),

        LMB_Price: z.coerce.number().optional(),
        MB_Disc_Type: z.string().optional(),
        MB_Discountper: z.coerce.number().optional(),
        MB_Discount: z.coerce.number().optional(),
        LMB_NetPrice: z.coerce.number().optional(),

        With_Accessories: z.boolean().optional(),
        lmaC_Id: z.coerce.number().optional(), // Accessories ID

        // Accession Grid
        // lmbano_id is for update?
        accessionList: z
            .array(
                z.object({
                    LMBANO_Id: z.number().optional(),
                    LMBANO_No: z.string().min(1, 'Accession No is required'),
                    LMBANO_AvialableStatus: z.string().optional()
                })
            )
            .optional(),

        LMB_ActiveFlag: z.boolean().optional()
    }),
    delete: z.object({
        LMB_Id: z.number(),
        LMB_BookTitle: z.string().optional() // for logging/confirmation
    })
};
