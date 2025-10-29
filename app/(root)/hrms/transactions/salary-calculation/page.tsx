'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useSalaryCalculationOnload } from '@/hooks/hrms/useSalaryCalculation';
import SearchForm from './_components/search-form';

export default function SalaryCalculationPage() {
    const { data: onloadData, isLoading } = useSalaryCalculationOnload({
        MI_Id: 30,
        LogInUserId: 5
    });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-6 p-1'>
                {/* Page Header */}
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='font-bold text-3xl tracking-tight'>Salary Calculation</h1>
                        <p className='text-muted-foreground'>Calculate monthly salaries for employees</p>
                    </div>
                </div>

                {/* Salary Calculation Form */}
                <CollapsibleSection
                    title='Salary Calculation'
                    description='Select year, month, and employees to calculate salaries'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <SearchForm onloadData={onloadData} isLoading={isLoading} />
                </CollapsibleSection>
            </div>
        </div>
    );
}
