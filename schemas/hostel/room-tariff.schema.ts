import { z } from 'zod';

export const RoomTariffSchema = z.object({
  HLMRTF_Id: z.number().optional().default(0),
  ASMAY_Id: z.coerce.number().min(1, 'Academic Year is required'),
  HRMRM_Id: z.coerce.number().min(1, 'Room is required'),
  HLMRTF_SORate: z.coerce.number().min(1, 'Single Bed Rate is required'),
  HLMRTF_RoomRate: z.coerce.number().min(1, 'Entire Room Rate is required'),
  HLMRTF_ActiveFlag: z.boolean().optional().default(true),
});

export type RoomTariffSchemaType = z.infer<typeof RoomTariffSchema>;
