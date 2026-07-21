'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { useBookReturnInitialData } from '@/hooks/library/useBookReturn';
import type { IBookReturnList } from '@/types/library/transactions/book-return';
import { BookReturnColumns } from './_components/columns';
import { ReturnForm } from './_components/return-form';

export default function BookReturnTransactionPage() {
    // Initial load with defaults
    const { data, isLoading } = useBookReturnInitialData({
        booktype: 'issue',
        issuertype: 'std',
        bookcat_type: 'book'
    });

    return (
        <div className='mx-auto max-w-7xl space-y-6 py-6'>
            
            <div className='bg-white rounded-lg shadow-sm border border-t-4 border-t-orange-400 overflow-hidden'>
                <div className='bg-[#4251b1] text-white px-4 py-2 font-semibold text-sm'>
                    BOOK RETURN
                </div>
                <div className='p-6'>
                    <ReturnForm onSuccess={() => {
                        // List refreshes automatically via React Query
                    }} />
                </div>
            </div>

            <div className='bg-white rounded-lg shadow-sm border border-t-4 border-t-orange-400 overflow-hidden'>
                <div className='bg-[#4251b1] text-white px-4 py-2 font-semibold text-sm'>
                    TRANSACTION LIST
                </div>
                <div className='p-6'>
                    <GenericDataTable 
                        columns={BookReturnColumns} 
                        data={(data?.alldata || []) as IBookReturnList[]} 
                        isLoading={isLoading} 
                    />
                </div>
            </div>
        </div>
    );
}
