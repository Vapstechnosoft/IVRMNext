/**
 * HRMS Master Module Validation Rules
 * Based on field length specifications from HRMSMaster - Field length document
 */

// Validation patterns
export const VALIDATION_PATTERNS = {
    // Alphabet only (letters only)
    ALPHABET_ONLY: /^[A-Za-z\s]+$/,

    // Alphanumeric (letters and numbers)
    ALPHANUMERIC: /^[A-Za-z0-9\s]+$/,

    // Numeric only
    NUMERIC_ONLY: /^[0-9]+$/,

    // Decimal numbers
    DECIMAL_NUMERIC: /^[0-9]+(\.[0-9]+)?$/,

    // IFSC Code pattern (4 letters + 7 alphanumeric)
    IFSC_CODE: /^[A-Z]{4}0[A-Z0-9]{6}$/,

    // Account number (numeric only)
    ACCOUNT_NUMBER: /^[0-9]+$/,

    // Leave year format (e.g., 2024-2025)
    LEAVE_YEAR: /^[0-9]{4}-[0-9]{4}$/
};

// Error messages
export const VALIDATION_MESSAGES = {
    REQUIRED: (field: string) => `${field} is required`,
    MAX_LENGTH: (field: string, max: number) => `${field} must not exceed ${max} characters`,
    MIN_LENGTH: (field: string, min: number) => `${field} must be at least ${min} characters`,
    ALPHABET_ONLY: (field: string) => `${field} must contain only letters and spaces`,
    ALPHANUMERIC: (field: string) => `${field} must contain only letters, numbers, and spaces`,
    NUMERIC_ONLY: (field: string) => `${field} must contain only numbers`,
    DECIMAL_NUMERIC: (field: string) => `${field} must be a valid number`,
    MIN_VALUE: (field: string, min: number) => `${field} must be at least ${min}`,
    MAX_VALUE: (field: string, max: number) => `${field} must not exceed ${max}`,
    INVALID_FORMAT: (field: string) => `${field} format is invalid`,
    POSITIVE_NUMBER: (field: string) => `${field} must be a positive number`
};

// Employee Category Master Validations
export const EMPLOYEE_TYPE_VALIDATION = {
    employeeType: {
        required: VALIDATION_MESSAGES.REQUIRED('Employee Type'),
        maxLength: {
            value: 50,
            message: VALIDATION_MESSAGES.MAX_LENGTH('Employee Type', 50)
        },
        pattern: {
            value: VALIDATION_PATTERNS.ALPHABET_ONLY,
            message: VALIDATION_MESSAGES.ALPHABET_ONLY('Employee Type')
        }
    }
};

export const GROUP_TYPE_VALIDATION = {
    groupType: {
        required: VALIDATION_MESSAGES.REQUIRED('Group Type'),
        maxLength: {
            value: 50,
            message: VALIDATION_MESSAGES.MAX_LENGTH('Group Type', 50)
        },
        pattern: {
            value: VALIDATION_PATTERNS.ALPHABET_ONLY,
            message: VALIDATION_MESSAGES.ALPHABET_ONLY('Group Type')
        }
    },
    groupCode: {
        required: VALIDATION_MESSAGES.REQUIRED('Group Code'),
        maxLength: {
            value: 20,
            message: VALIDATION_MESSAGES.MAX_LENGTH('Group Code', 20)
        },
        pattern: {
            value: VALIDATION_PATTERNS.ALPHANUMERIC,
            message: VALIDATION_MESSAGES.ALPHANUMERIC('Group Code')
        }
    },
    order: {
        required: VALIDATION_MESSAGES.REQUIRED('Order'),
        min: {
            value: 1,
            message: VALIDATION_MESSAGES.MIN_VALUE('Order', 1)
        },
        max: {
            value: 9999999999, // 10 digits max
            message: VALIDATION_MESSAGES.MAX_VALUE('Order', 9999999999)
        },
        pattern: {
            value: VALIDATION_PATTERNS.NUMERIC_ONLY,
            message: VALIDATION_MESSAGES.NUMERIC_ONLY('Order')
        }
    }
};

export const DEPARTMENT_VALIDATION = {
    departmentName: {
        required: VALIDATION_MESSAGES.REQUIRED('Department Name'),
        maxLength: {
            value: 50,
            message: VALIDATION_MESSAGES.MAX_LENGTH('Department Name', 50)
        },
        pattern: {
            value: VALIDATION_PATTERNS.ALPHABET_ONLY,
            message: VALIDATION_MESSAGES.ALPHABET_ONLY('Department Name')
        }
    },
    internalTrainingHours: {
        pattern: {
            value: VALIDATION_PATTERNS.DECIMAL_NUMERIC,
            message: VALIDATION_MESSAGES.DECIMAL_NUMERIC('Internal Training Hours')
        },
        min: {
            value: 0,
            message: VALIDATION_MESSAGES.MIN_VALUE('Internal Training Hours', 0)
        },
        max: {
            value: 99, // 2 digits max
            message: VALIDATION_MESSAGES.MAX_VALUE('Internal Training Hours', 99)
        }
    },
    order: {
        required: VALIDATION_MESSAGES.REQUIRED('Order'),
        min: {
            value: 1,
            message: VALIDATION_MESSAGES.MIN_VALUE('Order', 1)
        },
        max: {
            value: 9999, // 4 digits max
            message: VALIDATION_MESSAGES.MAX_VALUE('Order', 9999)
        },
        pattern: {
            value: VALIDATION_PATTERNS.NUMERIC_ONLY,
            message: VALIDATION_MESSAGES.NUMERIC_ONLY('Order')
        }
    }
};

export const DESIGNATION_VALIDATION = {
    designation: {
        required: VALIDATION_MESSAGES.REQUIRED('Designation'),
        maxLength: {
            value: 50,
            message: VALIDATION_MESSAGES.MAX_LENGTH('Designation', 50)
        },
        pattern: {
            value: VALIDATION_PATTERNS.ALPHABET_ONLY,
            message: VALIDATION_MESSAGES.ALPHABET_ONLY('Designation')
        }
    },
    basicAmount: {
        required: VALIDATION_MESSAGES.REQUIRED('Basic Amount'),
        pattern: {
            value: VALIDATION_PATTERNS.DECIMAL_NUMERIC,
            message: VALIDATION_MESSAGES.DECIMAL_NUMERIC('Basic Amount')
        },
        min: {
            value: 0,
            message: VALIDATION_MESSAGES.MIN_VALUE('Basic Amount', 0)
        },
        max: {
            value: 9999999999, // 10 digits including decimals
            message: VALIDATION_MESSAGES.MAX_VALUE('Basic Amount', 9999999999)
        }
    },
    sanctionedNumber: {
        required: VALIDATION_MESSAGES.REQUIRED('Sanctioned Number'),
        min: {
            value: 1,
            message: VALIDATION_MESSAGES.MIN_VALUE('Sanctioned Number', 1)
        },
        max: {
            value: 999, // 3 digits max
            message: VALIDATION_MESSAGES.MAX_VALUE('Sanctioned Number', 999)
        },
        pattern: {
            value: VALIDATION_PATTERNS.NUMERIC_ONLY,
            message: VALIDATION_MESSAGES.NUMERIC_ONLY('Sanctioned Number')
        }
    },
    order: {
        required: VALIDATION_MESSAGES.REQUIRED('Order'),
        min: {
            value: 1,
            message: VALIDATION_MESSAGES.MIN_VALUE('Order', 1)
        },
        max: {
            value: 9999, // 4 digits max
            message: VALIDATION_MESSAGES.MAX_VALUE('Order', 9999)
        },
        pattern: {
            value: VALIDATION_PATTERNS.NUMERIC_ONLY,
            message: VALIDATION_MESSAGES.NUMERIC_ONLY('Order')
        }
    }
};

export const GRADE_VALIDATION = {
    gradeName: {
        required: VALIDATION_MESSAGES.REQUIRED('Grade Name'),
        maxLength: {
            value: 50,
            message: VALIDATION_MESSAGES.MAX_LENGTH('Grade Name', 50)
        },
        pattern: {
            value: VALIDATION_PATTERNS.ALPHABET_ONLY,
            message: VALIDATION_MESSAGES.ALPHABET_ONLY('Grade Name')
        }
    },
    gradeDisplayName: {
        required: VALIDATION_MESSAGES.REQUIRED('Grade Display Name'),
        maxLength: {
            value: 50,
            message: VALIDATION_MESSAGES.MAX_LENGTH('Grade Display Name', 50)
        },
        pattern: {
            value: VALIDATION_PATTERNS.ALPHABET_ONLY,
            message: VALIDATION_MESSAGES.ALPHABET_ONLY('Grade Display Name')
        }
    },
    payScaleFrom: {
        required: VALIDATION_MESSAGES.REQUIRED('Pay Scale From'),
        pattern: {
            value: VALIDATION_PATTERNS.DECIMAL_NUMERIC,
            message: VALIDATION_MESSAGES.DECIMAL_NUMERIC('Pay Scale From')
        },
        min: {
            value: 0,
            message: VALIDATION_MESSAGES.MIN_VALUE('Pay Scale From', 0)
        },
        max: {
            value: 9999999999, // 10 digits including decimals
            message: VALIDATION_MESSAGES.MAX_VALUE('Pay Scale From', 9999999999)
        }
    },
    payScaleTo: {
        required: VALIDATION_MESSAGES.REQUIRED('Pay Scale To'),
        pattern: {
            value: VALIDATION_PATTERNS.DECIMAL_NUMERIC,
            message: VALIDATION_MESSAGES.DECIMAL_NUMERIC('Pay Scale To')
        },
        min: {
            value: 0,
            message: VALIDATION_MESSAGES.MIN_VALUE('Pay Scale To', 0)
        },
        max: {
            value: 9999999999, // 10 digits including decimals
            message: VALIDATION_MESSAGES.MAX_VALUE('Pay Scale To', 9999999999)
        }
    },
    increment: {
        required: VALIDATION_MESSAGES.REQUIRED('Increment'),
        min: {
            value: 0,
            message: VALIDATION_MESSAGES.MIN_VALUE('Increment', 0)
        },
        max: {
            value: 999, // 3 digits max
            message: VALIDATION_MESSAGES.MAX_VALUE('Increment', 999)
        },
        pattern: {
            value: VALIDATION_PATTERNS.DECIMAL_NUMERIC,
            message: VALIDATION_MESSAGES.DECIMAL_NUMERIC('Increment')
        }
    }
};

export const BANK_VALIDATION = {
    bankName: {
        required: VALIDATION_MESSAGES.REQUIRED('Bank Name'),
        maxLength: {
            value: 50,
            message: VALIDATION_MESSAGES.MAX_LENGTH('Bank Name', 50)
        },
        pattern: {
            value: VALIDATION_PATTERNS.ALPHABET_ONLY,
            message: VALIDATION_MESSAGES.ALPHABET_ONLY('Bank Name')
        }
    },
    accountNumber: {
        required: VALIDATION_MESSAGES.REQUIRED('Account Number'),
        maxLength: {
            value: 10,
            message: VALIDATION_MESSAGES.MAX_LENGTH('Account Number', 10)
        },
        pattern: {
            value: VALIDATION_PATTERNS.ACCOUNT_NUMBER,
            message: VALIDATION_MESSAGES.NUMERIC_ONLY('Account Number')
        }
    },
    bankAddress: {
        required: VALIDATION_MESSAGES.REQUIRED('Bank Address'),
        maxLength: {
            value: 50,
            message: VALIDATION_MESSAGES.MAX_LENGTH('Bank Address', 50)
        },
        pattern: {
            value: VALIDATION_PATTERNS.ALPHANUMERIC,
            message: VALIDATION_MESSAGES.ALPHANUMERIC('Bank Address')
        }
    },
    branchName: {
        required: VALIDATION_MESSAGES.REQUIRED('Branch Name'),
        maxLength: {
            value: 50,
            message: VALIDATION_MESSAGES.MAX_LENGTH('Branch Name', 50)
        },
        pattern: {
            value: VALIDATION_PATTERNS.ALPHANUMERIC,
            message: VALIDATION_MESSAGES.ALPHANUMERIC('Branch Name')
        }
    },
    ifscCode: {
        required: VALIDATION_MESSAGES.REQUIRED('IFSC Code'),
        maxLength: {
            value: 20,
            message: VALIDATION_MESSAGES.MAX_LENGTH('IFSC Code', 20)
        },
        pattern: {
            value: VALIDATION_PATTERNS.IFSC_CODE,
            message: 'IFSC Code must be in format: ABCD0123456'
        }
    }
};

export const EARNING_DEDUCTION_VALIDATION = {
    name: {
        required: VALIDATION_MESSAGES.REQUIRED('Name'),
        maxLength: {
            value: 50,
            message: VALIDATION_MESSAGES.MAX_LENGTH('Name', 50)
        },
        pattern: {
            value: VALIDATION_PATTERNS.ALPHABET_ONLY,
            message: VALIDATION_MESSAGES.ALPHABET_ONLY('Name')
        }
    },
    type: {
        required: VALIDATION_MESSAGES.REQUIRED('Type'),
        maxLength: {
            value: 50,
            message: VALIDATION_MESSAGES.MAX_LENGTH('Type', 50)
        },
        pattern: {
            value: VALIDATION_PATTERNS.ALPHABET_ONLY,
            message: VALIDATION_MESSAGES.ALPHABET_ONLY('Type')
        }
    },
    value: {
        required: VALIDATION_MESSAGES.REQUIRED('Value'),
        pattern: {
            value: VALIDATION_PATTERNS.DECIMAL_NUMERIC,
            message: VALIDATION_MESSAGES.DECIMAL_NUMERIC('Value')
        },
        min: {
            value: 0,
            message: VALIDATION_MESSAGES.MIN_VALUE('Value', 0)
        },
        max: {
            value: 999999, // 6 digits including decimals
            message: VALIDATION_MESSAGES.MAX_VALUE('Value', 999999)
        }
    },
    order: {
        required: VALIDATION_MESSAGES.REQUIRED('Order'),
        min: {
            value: 1,
            message: VALIDATION_MESSAGES.MIN_VALUE('Order', 1)
        },
        max: {
            value: 9999, // 4 digits max
            message: VALIDATION_MESSAGES.MAX_VALUE('Order', 9999)
        },
        pattern: {
            value: VALIDATION_PATTERNS.NUMERIC_ONLY,
            message: VALIDATION_MESSAGES.NUMERIC_ONLY('Order')
        }
    }
};

export const GENDER_VALIDATION = {
    genderName: {
        required: VALIDATION_MESSAGES.REQUIRED('Gender Name'),
        maxLength: {
            value: 5,
            message: VALIDATION_MESSAGES.MAX_LENGTH('Gender Name', 5)
        },
        pattern: {
            value: VALIDATION_PATTERNS.ALPHABET_ONLY,
            message: VALIDATION_MESSAGES.ALPHABET_ONLY('Gender Name')
        }
    }
};

export const LEAVE_YEAR_VALIDATION = {
    leaveYear: {
        required: VALIDATION_MESSAGES.REQUIRED('Leave Year'),
        maxLength: {
            value: 10,
            message: VALIDATION_MESSAGES.MAX_LENGTH('Leave Year', 10)
        },
        pattern: {
            value: VALIDATION_PATTERNS.LEAVE_YEAR,
            message: 'Leave Year must be in format: YYYY-YYYY (e.g., 2024-2025)'
        }
    }
};

export const LOAN_TYPE_VALIDATION = {
    loanType: {
        required: VALIDATION_MESSAGES.REQUIRED('Loan Type'),
        maxLength: {
            value: 25,
            message: VALIDATION_MESSAGES.MAX_LENGTH('Loan Type', 25)
        },
        pattern: {
            value: VALIDATION_PATTERNS.ALPHABET_ONLY,
            message: VALIDATION_MESSAGES.ALPHABET_ONLY('Loan Type')
        }
    },
    maxLoanAmount: {
        required: VALIDATION_MESSAGES.REQUIRED('Max Loan Amount'),
        pattern: {
            value: VALIDATION_PATTERNS.DECIMAL_NUMERIC,
            message: VALIDATION_MESSAGES.DECIMAL_NUMERIC('Max Loan Amount')
        },
        min: {
            value: 0,
            message: VALIDATION_MESSAGES.MIN_VALUE('Max Loan Amount', 0)
        },
        max: {
            value: 999999.99, // 6 digits including decimals
            message: VALIDATION_MESSAGES.MAX_VALUE('Max Loan Amount', 999999.99)
        }
    }
};

export const MARITAL_STATUS_VALIDATION = {
    maritalStatus: {
        required: VALIDATION_MESSAGES.REQUIRED('Marital Status'),
        maxLength: {
            value: 20,
            message: VALIDATION_MESSAGES.MAX_LENGTH('Marital Status', 20)
        },
        pattern: {
            value: VALIDATION_PATTERNS.ALPHABET_ONLY,
            message: VALIDATION_MESSAGES.ALPHABET_ONLY('Marital Status')
        }
    }
};

export const COURSE_VALIDATION = {
    courseName: {
        required: VALIDATION_MESSAGES.REQUIRED('Course Name'),
        maxLength: {
            value: 10,
            message: VALIDATION_MESSAGES.MAX_LENGTH('Course Name', 10)
        },
        pattern: {
            value: VALIDATION_PATTERNS.ALPHANUMERIC,
            message: VALIDATION_MESSAGES.ALPHANUMERIC('Course Name')
        }
    },
    courseDescription: {
        required: VALIDATION_MESSAGES.REQUIRED('Course Description'),
        maxLength: {
            value: 50,
            message: VALIDATION_MESSAGES.MAX_LENGTH('Course Description', 50)
        },
        pattern: {
            value: VALIDATION_PATTERNS.ALPHANUMERIC,
            message: VALIDATION_MESSAGES.ALPHANUMERIC('Course Description')
        }
    }
};

export const SPECIALIZATION_VALIDATION = {
    specializationName: {
        required: VALIDATION_MESSAGES.REQUIRED('Specialization Name'),
        maxLength: {
            value: 10,
            message: VALIDATION_MESSAGES.MAX_LENGTH('Specialization Name', 10)
        },
        pattern: {
            value: VALIDATION_PATTERNS.ALPHABET_ONLY,
            message: VALIDATION_MESSAGES.ALPHABET_ONLY('Specialization Name')
        }
    }
};

// Professional Tax Validation
export const PROFESSIONAL_TAX_VALIDATION = {
    salaryFrom: {
        required: VALIDATION_MESSAGES.REQUIRED('Salary From'),
        pattern: {
            value: VALIDATION_PATTERNS.DECIMAL_NUMERIC,
            message: VALIDATION_MESSAGES.DECIMAL_NUMERIC('Salary From')
        },
        min: {
            value: 0,
            message: VALIDATION_MESSAGES.MIN_VALUE('Salary From', 0)
        },
        max: {
            value: 999999.99, // 6 digits including decimals
            message: VALIDATION_MESSAGES.MAX_VALUE('Salary From', 999999.99)
        }
    },
    salaryTo: {
        required: VALIDATION_MESSAGES.REQUIRED('Salary To'),
        pattern: {
            value: VALIDATION_PATTERNS.DECIMAL_NUMERIC,
            message: VALIDATION_MESSAGES.DECIMAL_NUMERIC('Salary To')
        },
        min: {
            value: 0,
            message: VALIDATION_MESSAGES.MIN_VALUE('Salary To', 0)
        },
        max: {
            value: 999999.99, // 6 digits including decimals
            message: VALIDATION_MESSAGES.MAX_VALUE('Salary To', 999999.99)
        }
    },
    professionalTaxAmount: {
        required: VALIDATION_MESSAGES.REQUIRED('Professional Tax Amount'),
        pattern: {
            value: VALIDATION_PATTERNS.DECIMAL_NUMERIC,
            message: VALIDATION_MESSAGES.DECIMAL_NUMERIC('Professional Tax Amount')
        },
        min: {
            value: 0,
            message: VALIDATION_MESSAGES.MIN_VALUE('Professional Tax Amount', 0)
        },
        max: {
            value: 999999.99, // 6 digits including decimals
            message: VALIDATION_MESSAGES.MAX_VALUE('Professional Tax Amount', 999999.99)
        }
    }
};

// Payroll Standard Validation
export const PAYROLL_STANDARD_VALIDATION = {
    // Provident Fund
    pfAccountPrefix: {
        maxLength: {
            value: 10,
            message: VALIDATION_MESSAGES.MAX_LENGTH('PF Account Prefix', 10)
        },
        pattern: {
            value: VALIDATION_PATTERNS.ALPHANUMERIC,
            message: VALIDATION_MESSAGES.ALPHANUMERIC('PF Account Prefix')
        }
    },
    pfMaxAmount: {
        required: VALIDATION_MESSAGES.REQUIRED('PF Max Amount'),
        pattern: {
            value: VALIDATION_PATTERNS.DECIMAL_NUMERIC,
            message: VALIDATION_MESSAGES.DECIMAL_NUMERIC('PF Max Amount')
        },
        min: {
            value: 0,
            message: VALIDATION_MESSAGES.MIN_VALUE('PF Max Amount', 0)
        },
        max: {
            value: 999999.99, // 6 digits including decimals
            message: VALIDATION_MESSAGES.MAX_VALUE('PF Max Amount', 999999.99)
        }
    },
    fpfPercent: {
        pattern: {
            value: VALIDATION_PATTERNS.DECIMAL_NUMERIC,
            message: VALIDATION_MESSAGES.DECIMAL_NUMERIC('FPF %')
        },
        min: {
            value: 0,
            message: VALIDATION_MESSAGES.MIN_VALUE('FPF %', 0)
        },
        max: {
            value: 100,
            message: VALIDATION_MESSAGES.MAX_VALUE('FPF %', 100)
        }
    },
    epfPercent: {
        required: VALIDATION_MESSAGES.REQUIRED('EPF %'),
        pattern: {
            value: VALIDATION_PATTERNS.DECIMAL_NUMERIC,
            message: VALIDATION_MESSAGES.DECIMAL_NUMERIC('EPF %')
        },
        min: {
            value: 0,
            message: VALIDATION_MESSAGES.MIN_VALUE('EPF %', 0)
        },
        max: {
            value: 100,
            message: VALIDATION_MESSAGES.MAX_VALUE('EPF %', 100)
        }
    },
    // ESI
    esiAccountPrefix: {
        maxLength: {
            value: 10,
            message: VALIDATION_MESSAGES.MAX_LENGTH('ESI Account Prefix', 10)
        },
        pattern: {
            value: VALIDATION_PATTERNS.ALPHANUMERIC,
            message: VALIDATION_MESSAGES.ALPHANUMERIC('ESI Account Prefix')
        }
    },
    esiMaxAmount: {
        required: VALIDATION_MESSAGES.REQUIRED('ESI Max Amount'),
        pattern: {
            value: VALIDATION_PATTERNS.DECIMAL_NUMERIC,
            message: VALIDATION_MESSAGES.DECIMAL_NUMERIC('ESI Max Amount')
        },
        min: {
            value: 0,
            message: VALIDATION_MESSAGES.MIN_VALUE('ESI Max Amount', 0)
        },
        max: {
            value: 999999.99, // 6 digits including decimals
            message: VALIDATION_MESSAGES.MAX_VALUE('ESI Max Amount', 999999.99)
        }
    },
    employerContributionPercent: {
        required: VALIDATION_MESSAGES.REQUIRED('Employer Contribution %'),
        pattern: {
            value: VALIDATION_PATTERNS.DECIMAL_NUMERIC,
            message: VALIDATION_MESSAGES.DECIMAL_NUMERIC('Employer Contribution %')
        },
        min: {
            value: 0,
            message: VALIDATION_MESSAGES.MIN_VALUE('Employer Contribution %', 0)
        },
        max: {
            value: 999999.99, // 6 digits including decimals
            message: VALIDATION_MESSAGES.MAX_VALUE('Employer Contribution %', 999999.99)
        }
    },
    // Salary Days
    fromDay: {
        required: VALIDATION_MESSAGES.REQUIRED('From Day'),
        min: {
            value: 1,
            message: VALIDATION_MESSAGES.MIN_VALUE('From Day', 1)
        },
        max: {
            value: 31,
            message: VALIDATION_MESSAGES.MAX_VALUE('From Day', 31)
        },
        pattern: {
            value: VALIDATION_PATTERNS.NUMERIC_ONLY,
            message: VALIDATION_MESSAGES.NUMERIC_ONLY('From Day')
        }
    },
    toDay: {
        required: VALIDATION_MESSAGES.REQUIRED('To Day'),
        min: {
            value: 1,
            message: VALIDATION_MESSAGES.MIN_VALUE('To Day', 1)
        },
        max: {
            value: 31,
            message: VALIDATION_MESSAGES.MAX_VALUE('To Day', 31)
        },
        pattern: {
            value: VALIDATION_PATTERNS.NUMERIC_ONLY,
            message: VALIDATION_MESSAGES.NUMERIC_ONLY('To Day')
        }
    },
    retirementYears: {
        required: VALIDATION_MESSAGES.REQUIRED('Retirement Years'),
        min: {
            value: 18,
            message: VALIDATION_MESSAGES.MIN_VALUE('Retirement Years', 18)
        },
        max: {
            value: 100,
            message: VALIDATION_MESSAGES.MAX_VALUE('Retirement Years', 100)
        },
        pattern: {
            value: VALIDATION_PATTERNS.NUMERIC_ONLY,
            message: VALIDATION_MESSAGES.NUMERIC_ONLY('Retirement Years')
        }
    }
};

// Utility function to validate pay scale range
export const validatePayScaleRange = (from: number, to: number): string | null => {
    if (from >= to) {
        return 'Pay Scale From must be less than Pay Scale To';
    }
    return null;
};

// Utility function to validate salary range
export const validateSalaryRange = (from: number, to: number): string | null => {
    if (from >= to) {
        return 'Salary From must be less than Salary To';
    }
    return null;
};

// Utility function to validate date range
export const validateDateRange = (fromDate: string, toDate: string): string | null => {
    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (from >= to) {
        return 'From Date must be before To Date';
    }
    return null;
};

// Group Department Designation Mapping Validation
export const GROUP_DEPT_DESIGNATION_MAPPING_VALIDATION = {
    groupType: {
        required: VALIDATION_MESSAGES.REQUIRED('Group Type')
    },
    department: {
        required: VALIDATION_MESSAGES.REQUIRED('Department')
    },
    designation: {
        required: VALIDATION_MESSAGES.REQUIRED('Designation')
    }
};

// Religion Category Mapping Validation
export const RELIGION_CATEGORY_MAPPING_VALIDATION = {
    religion: {
        required: VALIDATION_MESSAGES.REQUIRED('Religion')
    },
    casteCategory: {
        required: VALIDATION_MESSAGES.REQUIRED('Caste Category')
    }
};

// Export all validation rules as a single object for easy access
export const HRMS_MASTER_VALIDATION = {
    EMPLOYEE_TYPE: EMPLOYEE_TYPE_VALIDATION,
    GROUP_TYPE: GROUP_TYPE_VALIDATION,
    DEPARTMENT: DEPARTMENT_VALIDATION,
    DESIGNATION: DESIGNATION_VALIDATION,
    GRADE: GRADE_VALIDATION,
    BANK: BANK_VALIDATION,
    EARNING_DEDUCTION: EARNING_DEDUCTION_VALIDATION,
    GENDER: GENDER_VALIDATION,
    LEAVE_YEAR: LEAVE_YEAR_VALIDATION,
    LOAN_TYPE: LOAN_TYPE_VALIDATION,
    MARITAL_STATUS: MARITAL_STATUS_VALIDATION,
    COURSE: COURSE_VALIDATION,
    SPECIALIZATION: SPECIALIZATION_VALIDATION,
    PROFESSIONAL_TAX: PROFESSIONAL_TAX_VALIDATION,
    PAYROLL_STANDARD: PAYROLL_STANDARD_VALIDATION,
    GROUP_DEPT_DESIGNATION_MAPPING: GROUP_DEPT_DESIGNATION_MAPPING_VALIDATION,
    RELIGION_CATEGORY_MAPPING: RELIGION_CATEGORY_MAPPING_VALIDATION
};
