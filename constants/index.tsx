export const ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    CHAIRMAN: 'CHAIRMAN',
    HR_ADMIN: 'HR_ADMIN',
    GENERAL_STAFF: 'GENERAL_STAFF'
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
