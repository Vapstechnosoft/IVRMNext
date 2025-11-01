'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useSalaryApprovalOnload, useSearchSalaryApproval } from '@/hooks/hrms/useTransactions';
import type { EmployeeDetail } from '@/types/hrms/salary-approval';
import { useState } from 'react';
import ApprovalTable from './_components/approval-table';
import SearchForm from './_components/search-form';

export default function SalaryApprovalPage() {
    const { data: onloadData, isLoading } = useSalaryApprovalOnload({
        MI_Id: 30
    });
    const { mutate: searchEmployees, isPending } = useSearchSalaryApproval();
    const [employees, setEmployees] = useState<EmployeeDetail[]>([]);
    const [searchCriteria, setSearchCriteria] = useState<any>(null);

    const handleSearch = (values: any) => {
        const payload = {
            MI_Id: 30,
            HRES_Year: values.HRES_Year,
            HRES_Month: values.HRES_Month,
            hrmdeS_IdList: values.hrmdeS_IdList || [],
            hrmD_IdList: values.hrmD_IdList || [],
            groupTypeIdList: values.groupTypeIdList || [],
            LogInUserId: 5
        };

        searchEmployees(payload, {
            onSuccess: (data) => {
                setEmployees(data.ReportData || []);
                setSearchCriteria(payload);
            }
        });
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-6 p-1'>
                {/* Page Header */}
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='font-bold text-3xl tracking-tight'>Salary Approval</h1>
                        <p className='text-muted-foreground'>Review and approve employee salaries</p>
                    </div>
                </div>

                {/* Search Form */}
                <CollapsibleSection
                    title='Search Criteria'
                    description='Select year and month to find employees for salary approval'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <SearchForm onloadData={onloadData} isLoading={isLoading} onSearch={handleSearch} isPending={isPending} />
                </CollapsibleSection>

                {/* Approval Table */}
                {employees.length > 0 && (
                    <CollapsibleSection
                        title='Employees for Approval'
                        description='Select employees and approve or reject their salaries'
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <ApprovalTable employees={employees} searchCriteria={searchCriteria} />
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
