'use client';
import { getBookTransactionDetails } from '@/server/library/transactions/book-return';
import type { ApiSearchparams } from '@/types';
import { useQuery } from '@tanstack/react-query';

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
