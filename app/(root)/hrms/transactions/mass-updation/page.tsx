'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useMassUpdationOnload } from '@/hooks/hrms/useMassUpdation';
import type { EmployeeDetail } from '@/types/hrms/mass-updation';
import { useState } from 'react';
import { EmployeeList } from './_components/employee-list';
import SearchForm from './_components/search-form';
import UpdateForm from './_components/update-form';

export default function MassUpdationPage() {
    const {
        data: onloadData,
        isLoading: isLoadingOnload,
        error: onloadError
    } = useMassUpdationOnload({
        MI_Id: 30,
        roleId: 2
    });
    const [employeesForUpdation, setEmployeesForUpdation] = useState<EmployeeDetail[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);

    const handleSearchResults = (data: EmployeeDetail[]) => {
        setEmployeesForUpdation(data);
        setSelectedEmployees([]);
    };

    const handleUpdationSuccess = () => {
        setEmployeesForUpdation([]);
        setSelectedEmployees([]);
    };

    if (onloadError) {
        return (
            <div className='flex h-full items-center justify-center'>
                <CollapsibleSection title='Error' description='Failed to load mass updation data.' variant='destructive' defaultOpen={true}>
                    <p className='text-destructive-foreground'>{onloadError.message}</p>
                </CollapsibleSection>
            </div>
        );
    }

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <SearchForm onloadData={onloadData} isLoadingOnload={isLoadingOnload} onSearch={handleSearchResults} />

                {employeesForUpdation.length > 0 && (
                    <>
                        <CollapsibleSection
                            title='Employees for Mass Updation'
                            description='Select employees to apply salary updates.'
                            defaultOpen={true}
                            className='shadow-lg'>
                            <EmployeeList
                                data={employeesForUpdation}
                                isLoading={false}
                                selectedEmployees={selectedEmployees}
                                onSelectionChange={setSelectedEmployees}
                            />
                        </CollapsibleSection>

                        <UpdateForm onloadData={onloadData} selectedEmployees={selectedEmployees} onSuccess={handleUpdationSuccess} />
                    </>
                )}
            </div>
        </div>
    );
}
