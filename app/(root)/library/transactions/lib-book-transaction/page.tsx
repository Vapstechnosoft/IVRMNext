'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { useBookIssueInitialData } from '@/hooks/library/useBookIssue';
import type { IBookReturnList } from '@/types/library/transactions/book-return';
import { BookIssueColumns } from './_components/columns';
import { IssueForm } from './_components/issue-form';

export default function LibBookTransactionPage() {
    // Initial load with default params
    const { data, isLoading } = useBookIssueInitialData({
        booktype: 'issue',
        issuertype: 'std',
        bookcat_type: 'book'
    });

    return (
        <div className='mx-auto max-w-7xl space-y-6 py-6'>
            
            <div className='bg-white rounded-lg shadow-sm border border-t-4 border-t-orange-400 overflow-hidden'>
                <div className='bg-[#4251b1] text-white px-4 py-2 font-semibold text-sm'>
                    BOOK TRANSACTION
                </div>
                <IssueForm onSuccess={() => {}} />
            </div>

            <div className='bg-white rounded-lg shadow-sm border border-t-4 border-t-orange-400 overflow-hidden'>
                <div className='bg-[#4251b1] text-white px-4 py-2 font-semibold text-sm'>
                    TRANSACTION LIST
                </div>
                <div className='p-6'>
                    <GenericDataTable
                        columns={BookIssueColumns}
                        data={(data?.alldata as IBookReturnList[]) || []}
                        isLoading={isLoading}
                        defaultVisibility={{
                            slNo: true,
                            memberName: true,
                            lmbanO_AccessionNo: true,
                            lmB_BookTitle: true,
                            issue_Date: true,
                            due_Date: true,
                            book_Trans_Status: true,
                            actions: true
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
