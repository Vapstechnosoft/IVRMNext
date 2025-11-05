export const AUTH_ROUTES = {
    SIGN_IN: '/sign-in',
    FORGOT_PASSWORD: '/forgot-password',
    TERMS: '/terms'
};

export const ROUTES = {
    DASHBOARD: '/',
    ADMISSION: {
        ADMISSION: '/admission',
        ADMISSION_SUB_MENUS: {
            PREADMISSION: '/preadmission',
            PREADMISSION_SUB_MENUS: {
                CONFIGURATION: '/configuration',
                CONFIGURATION_SUB_MENUS: {
                    MASTER_ACADEMIC_YEAR: '/academic-year'
                },
                MASTERS: '/masters',
                MASTERS_SUB_MENUS: {
                    MASTERS_CLASS: '/class',
                    MASTERS_CATEGORY: '/category',
                    MASTERS_SECTION: '/section',
                    MASTERS_CLASS_CATEGORY: '/class-category',
                    MASTERS_RELIGION: '/religion',
                    MASTERS_CASTE_CATEGORY: '/caste-category',
                    MASTERS_CASTE: '/caste'
                },
                TRANSACTIONS: '/transactions',
                TRANSACTIONS_SUB_MENUS: {
                    APPLICATION_FORM: '/application-form'
                }
            }
        }
    }
};

export const PUBLIC_ROUTES = {
    PAYMENT_SUCCESS: '/admission/preadmission/transactions/application-form/payment/success',
    PAYMENT_FAILURE: '/admission/preadmission/transactions/application-form/payment/failure'
};
