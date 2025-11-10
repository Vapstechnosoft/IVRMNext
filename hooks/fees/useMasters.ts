import { ADMISSION_QUERY_KEYS, FEES_QUERY_KEYS } from '@/constants/query-keys';
import { getMasterClassCategory } from '@/server/fees/masters/class_category';

import { getClassCategory, getMasterClassYearlyCategory } from '@/server/fees/masters/class_yearly_category';

import { getAcademicYearDropdown } from '@/server/fees/masters/class_yearly_category';

import { getFeeTermHeadList, getheadsdropdown, getinstallmentsdropdown, gettermsdropdown } from '@/server/fees/masters/fee-term-heads';
import { getpaymentgateway_dropdown, getpaymentgatewaydetails } from '@/server/fees/masters/fee_payment_gateway_details';
import { getFeePrevilegeList, getGroupsDropdown, getRolesDropdown } from '@/server/fees/masters/fee_previlege';
import { getfeehead } from '@/server/fees/masters/feehead';
import { getfeeInstallment, getfeeInstallmentyId } from '@/server/fees/masters/feeinstallment';
import { getfeeInstallmentDueDate } from '@/server/fees/masters/feeinstallmentduedate';
import { getMasterConcession } from '@/server/fees/masters/feemasterconcession';
import { getFeeTermList } from '@/server/fees/masters/feemasterterms';
import { getMasterAllFeeHead, getMasterfeeInstallment, getMasterfeehead } from '@/server/fees/masters/yearly_group_mapping';

import { getGroupListCategory, getMasterYearlyCategory } from '@/server/fees/masters/fees_yearly_group';


import { getFeeTermHeadDueDateList } from '@/server/fees/masters/fee-term-head-duedate';

import {
    getFeeMasterGroupwiseAutoReceipt,
    getFeeMasterGroupwiseAutoReceiptGroupDropDown
} from '@/server/fees/masters/fee_master_groupwise_auto_receipt';

import { getFineSlab } from '@/server/fees/masters/fineSlab';
import { getFeeGroup, getFeeGroupGrouping } from '@/server/fees/masters/groupsgrouping';
import { getMasterGroup } from '@/server/fees/masters/master_group';
import { getMasterConcessionDetails } from '@/server/fees/masters/masterconcessiondetails';
import { getModeOfPayment } from '@/server/fees/masters/modeOfPayment';
import {
    getClassDropDownList,
    getFeeOnlinePaymentHeadGroupTable,
    getGroupNameDropDownList,
    getHeadNameDropDownList,
    getOnlinePaymentHeadGroupInstallment,
    getSubMerchantDropDownList
} from '@/server/fees/masters/online_payment_head_group';
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

export const useMasterGetYearlyCategory = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_YEARLY_CATEGORY, searchParams ?? {}],
            queryFn: async () => getMasterYearlyCategory(searchParams),
            staleTime: 0
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_YEARLY_CATEGORY]
            })
    };
};

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
            queryFn: async () => getfeeInstallment(30, searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_INSTALLMENT]
            });
        }
    };
};
export const useMasterFeeInstallmentyId = (fmi_id: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_INSTALLMENT, fmi_id],
            queryFn: async () => getfeeInstallmentyId(fmi_id),
            enabled: !!fmi_id,
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

export const useMasterFeeOnlinePaymentHeadGroupTable = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_ONLINE_PAYMENT_HEAD_TABLE, searchParams ?? {}],
            queryFn: async () => getFeeOnlinePaymentHeadGroupTable(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_ONLINE_PAYMENT_HEAD_TABLE]
            });
        }
    };
};

export const useMasterOnlinePaymentHeadGroup = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_ONLINE_PAYMENT_HEAD_GROUP],
            queryFn: async () => getAcademicYearDropdown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_ONLINE_PAYMENT_HEAD_GROUP]
            });
        }
    };
};

export const useMasterOnlinePaymentHeadGroupClass = (academicYears?: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_ONLINE_PAYMENT_HEAD_GROUP_INSTALLMENT_CLASS, academicYears ?? {}],
            queryFn: async () => getClassDropDownList(academicYears),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_ONLINE_PAYMENT_HEAD_GROUP_INSTALLMENT_CLASS]
            });
        }
    };
};

export const useMasterOnlinePaymentHeadGroupSubMerchant = (academicYears?: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_ONLINE_PAYMENT_HEAD_GROUP_INSTALLMENT_SUB_MERCHANT, academicYears ?? {}],
            queryFn: async () => getSubMerchantDropDownList(academicYears),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_ONLINE_PAYMENT_HEAD_GROUP_INSTALLMENT_SUB_MERCHANT]
            });
        }
    };
};

export const useMasterOnlinePaymentHeadGroupGroupName = (academicYears?: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_ONLINE_PAYMENT_HEAD_GROUP_INSTALLMENT_GROUPNAME, academicYears ?? {}],
            queryFn: async () => getGroupNameDropDownList(academicYears),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_ONLINE_PAYMENT_HEAD_GROUP_INSTALLMENT_GROUPNAME]
            });
        }
    };
};

export const useMasterOnlinePaymentHeadGroupHeadName = (academicYears?: number, groupName?: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_ONLINE_PAYMENT_HEAD_GROUP_INSTALLMENT_HEADNAME, academicYears ?? {}],
            queryFn: async () => getHeadNameDropDownList(academicYears, groupName),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_ONLINE_PAYMENT_HEAD_GROUP_INSTALLMENT_HEADNAME]
            });
        }
    };
};

export const useMasterOnlinePaymentHeadGroupInstallment = (academicYears?: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_ONLINE_PAYMENT_HEAD_GROUP_INSTALLMENT_YEAR],
            queryFn: async () => getOnlinePaymentHeadGroupInstallment(academicYears),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_ONLINE_PAYMENT_HEAD_GROUP_INSTALLMENT_YEAR]
            });
        }
    };
};

export const useFeeMasterHead = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_MASTER_HEADS_DROPDOWN],
            queryFn: async () => getMasterfeehead(),
            staleTime: 0,
            retry: 1
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_MASTER_HEADS_DROPDOWN]
            });
        }
    };
};

export const useFeeMasterInstallment = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_MASTER_INSTALLMENT_DROPDOWN],
            queryFn: async () => getMasterfeeInstallment(),
            staleTime: 0,
            retry: 1
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_MASTER_INSTALLMENT_DROPDOWN]
            });
        }
    };
};

export const useMasterAllFeeHead = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_ALL_HEAD, searchParams ?? {}],
            queryFn: async () => getMasterAllFeeHead(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_ALL_HEAD]
            });
        }
    };
};




export const useFeeMasterGroupwiseAutoReceipt = (searchParams?: ApiSearchparams) => {

    const queryClient = useQueryClient();

    return {
        ...useQuery({



            queryKey: [FEES_QUERY_KEYS.FEE_MASTER_GROUPWISE_AUTO_RECEIPT, searchParams ?? {}],
            queryFn: async () => getFeeMasterGroupwiseAutoReceipt(searchParams),
            staleTime: 0
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_MASTER_GROUPWISE_AUTO_RECEIPT]
            })
    };
};

export const useFeeMasterGroupwiseAutoReceiptDropDown = (academicYear: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_MASTER_GROUPWISE_AUTO_RECEIPT_GROUP_DROPDOWN],
            queryFn: async () => getFeeMasterGroupwiseAutoReceiptGroupDropDown(academicYear),
            enabled: !!academicYear,

            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({

            });
        }
    };
};



export const useMasterTermsHeadDueDate = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_TERM_HEAD_DUEDATE, searchParams ?? {}],
            queryFn: async () => getFeeTermHeadDueDateList(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_TERM_HEAD_DUEDATE]
            });
        }
    };
};

