import { z } from 'zod';

export const masterRoomSchema = z.object({
    hrmrM_Id: z.any().optional(),
    hlmH_Id: z.string().min(1, 'Select Hostel'),
    hlmF_Id: z.string().min(1, 'Select Floor'),
    hlmrcA_Id: z.string().min(1, 'Select Room Category'),
    hrmrM_RoomNo: z.string().min(1, 'Enter Room No').max(50),
    hrmrM_BedCapacity: z.string().min(1, 'Enter Bed Capacity').refine((val) => !Number.isNaN(Number(val)), 'Must be a number'),
    hrmrM_RoomDesc: z.string().optional(),
    hrmrM_ACFlg: z.boolean().default(false),
    hrmrM_SharingFlg: z.boolean().default(false),
    hrmrM_RoomForStudentFlg: z.boolean().default(false),
    hrmrM_RoomForStaffFlg: z.boolean().default(false),
    hrmrM_RoomForGuestFlg: z.boolean().default(false),
    facilities: z.array(z.number()).min(1, 'Select at least one facility'),
});

export type IMasterRoomForm = z.infer<typeof masterRoomSchema>;
