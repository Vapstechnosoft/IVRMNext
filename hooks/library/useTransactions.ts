'use client';
import { LIBRARY_QUERY_KEYS } from '@/constants/query-keys';
import { getConcessionAcademicDropdownData } from '@/server/library/transactions/FeeConcession';
import { getBookTransactionDetails } from '@/server/library/transactions/book-return';
import { getLostBookList } from '@/server/library/transactions/lost-book';
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

export const useLostBookList = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [LIBRARY_QUERY_KEYS.LIBRARY_LOST_BOOK_GRID, searchParams ?? {}],
            queryFn: () => getLostBookList(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
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
