export const ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    CHAIRMAN: 'CHAIRMAN',
    HR_ADMIN: 'HR_ADMIN',
    GENERAL_STAFF: 'GENERAL_STAFF',
    STAFF: 'Staff',
    ADMIN: 'ADMIN',
    ONLINE_PREADMISSION_USER: 'ONLINEPREADMISSIONUSER'
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
