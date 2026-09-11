'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { useBookDetailsOnLoad } from '@/hooks/library/useBookIssue';
import { BookIssueColumns } from './_components/columns';
import { IssueForm } from './_components/issue-form';

export default function LibBookTransactionPage() {
    const { data: responseWrapper, isLoading } = useBookDetailsOnLoad();

    const response = (responseWrapper as any)?.data || responseWrapper;

    const gridData = response?.students || response?.masterData?.students || response?.books || [];

    return (
        <div className='mx-auto max-w-7xl space-y-6 py-6'>
<<<<<<< HEAD
            <div className='bg-white rounded-lg shadow-sm border border-t-4 border-t-orange-400 overflow-hidden'>
                <div className='bg-[#4251b1] text-white px-4 py-2 font-semibold text-sm'>
                    BOOK TRANSACTION
                </div>
                <IssueForm initialData={response} isDataLoading={isLoading} onSuccess={() => {}} />
=======
            <div className='overflow-hidden rounded-lg border border-t-4 border-t-orange-400 bg-white shadow-sm'>
                <div className='bg-[#4251b1] px-4 py-2 font-semibold text-sm text-white'>BOOK TRANSACTION</div>
                <IssueForm onSuccess={() => {}} />
>>>>>>> 2570db6124a1ee543d4a09e7366d6029e96d5244
            </div>

            <div className='overflow-hidden rounded-lg border border-t-4 border-t-orange-400 bg-white shadow-sm'>
                <div className='bg-[#4251b1] px-4 py-2 font-semibold text-sm text-white'>TRANSACTION LIST</div>
                <div className='p-6'>
                    <GenericDataTable
                        columns={BookIssueColumns}
                        data={gridData}
                        isLoading={isLoading}
                        defaultVisibility={{
                            slNo: true,
                            memberName: true,
                            amsT_AdmNo: true,
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

