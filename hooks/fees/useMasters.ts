import { ADMISSION_QUERY_KEYS, FEES_QUERY_KEYS } from '@/constants/query-keys';
import { getMasterClassCategory } from '@/server/fees/masters/class_category';

import { getClassCategory } from '@/server/fees/masters/class_yearly_category';

import { getAcademicYearDropdown } from '@/server/fees/masters/class_yearly_category';

import { getFeeTermHeadList, getheadsdropdown, getinstallmentsdropdown, gettermsdropdown } from '@/server/fees/masters/fee-term-heads';
import { getpaymentgateway_dropdown, getpaymentgatewaydetails } from '@/server/fees/masters/fee_payment_gateway_details';
import { getFeePrevilegeList, getGroupsDropdown, getRolesDropdown } from '@/server/fees/masters/fee_previlege';
import { getfeehead } from '@/server/fees/masters/feehead';
import { getfeeInstallment } from '@/server/fees/masters/feeinstallment';
import { getfeeInstallmentDueDate } from '@/server/fees/masters/feeinstallmentduedate';
import { getMasterConcession } from '@/server/fees/masters/feemasterconcession';
import { getFeeTermList } from '@/server/fees/masters/feemasterterms';

import { getGroupListCategory, getMasterClassYearlyCategory } from '@/server/fees/masters/fees_yearly_group';

import { getFineSlab } from '@/server/fees/masters/fineSlab';
import { getFeeGroup, getFeeGroupGrouping } from '@/server/fees/masters/groupsgrouping';
import { getMasterGroup } from '@/server/fees/masters/master_group';
import { getMasterConcessionDetails } from '@/server/fees/masters/masterconcessiondetails';
import { getModeOfPayment } from '@/server/fees/masters/modeOfPayment';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useMasterFeehead = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_HEADS, searchParams ?? {}],
            queryFn: async () => getfeehead(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_HEADS]
            });
        }
    };
};

export const useMasterModeOfPayment = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_MODEOFPAYMENT, searchParams ?? {}],
            queryFn: async () => getModeOfPayment(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_MODEOFPAYMENT]
            });
        }
    };
};

export const useMasterPaymentgatewaydetails = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_PAYMENTGATEWAY_DETAILS, searchParams ?? {}],
            queryFn: async () => getpaymentgatewaydetails(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_PAYMENTGATEWAY_DETAILS]
            });
        }
    };
};

export const useMasterFineSlab = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_FINESLAB, searchParams ?? {}],
            queryFn: async () => getFineSlab(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_FINESLAB]
            });
        }
    };
};
//used

//dropdowns
export const useAcademicYearDropdown = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.ACADEMIC_DROPDOWN],
            queryFn: async () => getAcademicYearDropdown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.ACADEMIC_DROPDOWN]
            });
        }
    };
};

//used
export const useClassCategoryDropdown = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.MASTER_CATEGORY_DROPDOWN],
            queryFn: async () => getClassCategory(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.MASTER_CATEGORY_DROPDOWN]
            });
        }
    };
};

export const useGroupsDropdown = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.GROUPS_DROPDOWN],
            queryFn: async () => getGroupsDropdown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.GROUPS_DROPDOWN]
            });
        }
    };
};
export const useRolesDropdown = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.ROLES_DROPDOWN],
            queryFn: async () => getRolesDropdown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.ROLES_DROPDOWN]
            });
        }
    };
};

export const useMasterClassCategory = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.MASTER_CLASS_CATEGORY, searchParams ?? {}],
            queryFn: async () => getMasterClassCategory(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.MASTER_CLASS_CATEGORY]
            });
        }
    };
};

//yearly category
export const useMasterYearlyCategory = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_CLASS_YEARLY_CATEGORY, searchParams ?? {}],
            queryFn: async () => getMasterClassYearlyCategory(searchParams),
            staleTime: 0
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_CLASS_YEARLY_CATEGORY]
            })
    };
};

export const useMasterFeeGroup = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_GROUP, searchParams ?? {}],
            queryFn: async () => getFeeGroup(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_GROUP]
            });
        }
    };
};

//installment fees

export const useMasterFeeInstallment = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_INSTALLMENT, searchParams ?? {}],
            queryFn: async () => getfeeInstallment(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_INSTALLMENT]
            });
        }
    };
};
//group

export const useMasterGroup = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.MASTER_GROUP, searchParams ?? {}],
            queryFn: async () => getMasterGroup(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.MASTER_GROUP]
            });
        }
    };
};

//due date

export const useMasterFeeInstallmentDueDate = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_INSTALLMENT_DUE_DATE, searchParams ?? {}],
            queryFn: async () => getfeeInstallmentDueDate(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_INSTALLMENT_DUE_DATE]
            });
        }
    };
};

export const useMasterFeeYearlyGroup = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_YEARLY_GROUPS, searchParams ?? {}],
            queryFn: async () => getMasterClassYearlyCategory(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_YEARLY_GROUPS]
            });
        }
    };
};

// export const useFeeGroupDropdown = (searchParams?: ApiSearchparams) => {
//     const queryClient = useQueryClient();
//     return {
//         ...useQuery({
//             queryKey: [FEES_QUERY_KEYS.FEE_YEARLY_GROUPS, searchParams ?? {}],
//             queryFn: async () => getMasterClassYearlyCategory(searchParams),
//             staleTime: 0
//         }),
//         refetchAll: () => {
//             return queryClient.invalidateQueries({
//                 queryKey: [FEES_QUERY_KEYS.FEE_YEARLY_GROUPS]
//             });
//         }
//     };
// };

//term

export const useMasterConcession = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_MASTER_CONCESSION, searchParams ?? {}],
            queryFn: async () => getMasterConcession(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_MASTER_CONCESSION]
            });
        }
    };
};

export const useMasterTerms = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_MASTER_TERMS, searchParams ?? {}],
            queryFn: async () => getFeeTermList(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_MASTER_TERMS]
            });
        }
    };
};

export const useMasterTermsHead = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_MASTER_TERMS_HEAD, searchParams ?? {}],
            queryFn: async () => getFeeTermHeadList(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_MASTER_TERMS_HEAD]
            });
        }
    };
};

export const MASTER_HEADS_DROPDOWN = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.MASTER_HEADS_DROP_DOWN],
            queryFn: async () => getheadsdropdown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.MASTER_HEADS_DROP_DOWN]
            });
        }
    };
};

export const TERM_DROPDOWN_DATA = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.TERM_DROP_DOWN_DATA],
            queryFn: async () => gettermsdropdown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.TERM_DROP_DOWN_DATA]
            });
        }
    };
};

export const MASTER_INSTALLMENT_DROPDOWN = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.MASTER_INSTALLMENT_DROPDOWN],
            queryFn: async () => getinstallmentsdropdown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.MASTER_INSTALLMENT_DROPDOWN]
            });
        }
    };
};

export const useMasterConcessionDetails = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_MASTER_CONCESSION_DETAILS],
            queryFn: async () => getMasterConcessionDetails(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_MASTER_CONCESSION_DETAILS]
            });
        }
    };
};

export const useMasterPaymentgateway_dropdown = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_PAYMENTGATEWAY_DROPDOWN, searchParams ?? {}],
            queryFn: async () => getpaymentgateway_dropdown(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_PAYMENTGATEWAY_DROPDOWN]
            });
        }
    };
};

export const useMasterGroupListDropDown = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_GROUP_LIST_DROPDOWN, searchParams ?? {}],
            queryFn: async () => getGroupListCategory(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_GROUP_LIST_DROPDOWN]
            });
        }
    };
};

//Group Grouping
export const useMasterFeeGroupDropdown = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_GROUP_LIST_DROPDOWN, searchParams ?? {}],
            queryFn: async () => getFeeGroup(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_GROUP_LIST_DROPDOWN]
            });
        }
    };
};

export const useMasterFeeGroupGrouping = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_GROUP_GROUPING, searchParams ?? {}],
            queryFn: async () => getFeeGroupGrouping(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_GROUP_GROUPING]
            });
        }
    };
};

export const useFeePrevilegeList = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEES_PRIVILEGE_LIST],
            queryFn: async () => getFeePrevilegeList(),

            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEES_PRIVILEGE_LIST]
            });
        }
    };
};
