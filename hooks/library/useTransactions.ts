'use client';
import { LIBRARY_QUERY_KEYS } from '@/constants/query-keys';
import { getConcessionAcademicDropdownData, getConcessionStudentConcessionGrid } from '@/server/library/transactions/FeeConcession';
import { getBookTransactionDetails } from '@/server/library/transactions/book-return';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useBookReturn = (searchParams: ApiSearchparams = {}) => {
    return useQuery({
        queryKey: ['book-return', searchParams],
        queryFn: async () => {
            try {
                // Convert searchParams to the format expected by getBookTransactionDetails
                const response = await getBookTransactionDetails({
                    booktype: 'issue',
                    issuertype: 'std',
                    bookcat_type: 'book'
                });
                return response;
            } catch (error) {
                console.error('Error fetching transactions:', error);
                throw error;
            }
        },
        enabled: true
    });
};

// export const useFeeConcessionStudentConcessionGrid = (searchParams: ApiSearchparams = {}) => {
//     return useQuery({
//         queryKey: ['book-return', searchParams],
//         queryFn: async () => {
//             try {
//                 // Convert searchParams to the format expected by getBookTransactionDetails
//                 const response = await getBookTransactionDetails({
//                     booktype: 'issue',
//                     issuertype: 'std',
//                     bookcat_type: 'book'
//                 });
//                 return response;
//             } catch (error) {
//                 console.error('Error fetching transactions:', error);
//                 throw error;
//             }
//         },
//         enabled: true
//     });
// };

export const useLostBookGrid = (mi_Id: number, asmaY_Id: number, asmcL_Id: number, searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [LIBRARY_QUERY_KEYS.LIBRARY_LOST_BOOK_GRID, mi_Id, asmaY_Id, asmcL_Id, searchParams ?? {}],
            queryFn: () => getConcessionStudentConcessionGrid(mi_Id, asmaY_Id, asmcL_Id, searchParams),
            staleTime: 0,
            enabled: !!mi_Id && !!asmaY_Id
        }),
        refetchAll: () => {
            queryClient.invalidateQueries({
                queryKey: [LIBRARY_QUERY_KEYS.LIBRARY_LOST_BOOK_GRID],
                exact: false
            });
        }
    };
};

export const useLibraryacademicyerdropdowndatafee = (mi_Id: number, searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [LIBRARY_QUERY_KEYS.LIBRARY_ACADEMIC_YEAR_DROPDOWN, searchParams ?? {}],
            queryFn: async () => getConcessionAcademicDropdownData(mi_Id),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [LIBRARY_QUERY_KEYS.LIBRARY_ACADEMIC_YEAR_DROPDOWN]
            });
        }
    };
};
