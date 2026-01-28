import { z } from 'zod';

export const invMasterTaxSchema = z.object({
    invmT_Id: z.number().optional(),
    invmT_TaxName: z.string().min(1, { message: 'Tax Name is required' }),
    invmT_TaxAliasName: z.string().optional(),
    invmT_ActiveFlg: z.boolean().optional()
});

export const invMasterTaxLedgerSchema = z.object({
    invmtleD_Id: z.number().optional(),
    invmT_Id: z.number().optional(),
    invmtleD_TaxName: z.string().min(1, { message: 'Ledger Tax Name is required' }),
    famcomP_Id: z.coerce.number().min(1, { message: 'Company Name is required' }),
    famleD_Id: z.coerce.number().min(1, { message: 'Ledger Name is required' }),
    ledgerunderids: z.array(z.number()).min(1, { message: 'Select at least one Ledger Under Name' })
});

export type InvMasterTaxSchema = z.infer<typeof invMasterTaxSchema>;
export type InvMasterTaxLedgerSchema = z.infer<typeof invMasterTaxLedgerSchema>;
