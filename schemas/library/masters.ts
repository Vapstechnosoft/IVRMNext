import { z } from 'zod';
import { createStringSchema, deleteIdSchema } from '../validationSchemas';

export const loginSchema = z.object({
    email: z.string({ message: 'Email is required' }),
    password: createStringSchema('Password', 6, 50)
});

export const masterLibrarySchema = {
    addOrUpdate: z.object({
        lmaL_Id: z.number().nonnegative().optional(), // optional when creating new record
        lmaL_LibraryName: z.string({ message: 'Library Name is required' }).min(2).max(100)
    }),
    delete: z.object({
        lmaL_Id: deleteIdSchema('lmaL_Id')
    })
};

export const masterVendorSchema = {
    addOrUpdate: z.object({
        lmV_Id: z.number().nonnegative().optional(), // optional when creating new record
        lmV_VendorName: z.string({ message: 'Vendor Name is required' }).min(2).max(100),
        lmV_MobileNo: z.string({ message: 'Mobile No is required' }).min(10).max(15),
        lmV_Address: z.string({ message: 'Address is required' }).min(2).max(200),
        lmV_EMailId: z.string({ message: 'Email is required' }).email(),
        lmV_PhoneNo: z.string({ message: 'Phone No is required' }).min(10).max(15)
    }),
    delete: z.object({
        lmaL_Id: deleteIdSchema('lmV_Id')
    })
};

export const masterCategorySchema = {
    addOrUpdate: z.object({
        lmC_Id: z.number().nonnegative().optional(), // optional when creating new record
        lmC_CategoryName: z.string({ message: 'Category Name is required' }).min(2).max(100),
        lmC_CategoryCode: z.string({ message: 'Category Code is required' }).min(2).max(100),
        lmC_BNBFlg: z.string({ message: 'Category Type is required' }).min(2).max(100)
    }),
    delete: z.object({
        lmC_Id: deleteIdSchema('lmC_Id')
    })
};

export const masterPublisherSchema = {
    addOrUpdate: z.object({
        lmP_Id: z.number().nonnegative().optional(), // optional when creating new record
        lmP_PublisherName: z.string({ message: 'Publisher Name is required' }).min(2).max(100),
        lmP_MobileNo: z.string({ message: 'Mobile No is required' }).min(10).max(15),
        lmP_Address: z.string({ message: 'Address is required' }).min(2).max(200),
        lmP_EMailId: z.string({ message: 'Email is required' }).email(),
        lmP_PhoneNo: z.string({ message: 'Phone No is required' }).min(10).max(15)
    }),
    delete: z.object({
        lmP_Id: deleteIdSchema('lmP_Id')
    })
};

export const masterAuthorSchema = {
    addOrUpdate: z.object({
        lmA_Id: z.number().nonnegative().optional(), // optional when creating new record
        lmA_AuthorName: z.string({ message: 'Author Name is required' }).min(2).max(100),
        lmA_MobileNo: z.string({ message: 'Mobile No is required' }).min(10).max(15),
        lmA_Address: z.string({ message: 'Address is required' }).min(2).max(200),
        lmA_EMailId: z.string({ message: 'Email is required' }).email(),
        lmA_PhoneNo: z.string({ message: 'Phone No is required' }).min(10).max(15)
    }),
    delete: z.object({
        lmA_Id: deleteIdSchema('lmA_Id')
    })
};

export const masterLanguageSchema = {
    addOrUpdate: z.object({
        lmL_Id: z.number().nonnegative().optional(), // optional when creating new record
        lmL_LanguageName: z.string({ message: 'Language Name is required' }).min(2).max(100),
        lmL_LanguageCode: z.string({ message: 'Language Code is required' }).min(2).max(100)
    }),
    delete: z.object({
        lmL_Id: deleteIdSchema('lmL_Id')
    })
};
