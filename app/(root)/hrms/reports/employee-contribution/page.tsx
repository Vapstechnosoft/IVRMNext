'use client';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/data-table';
import { createLocalCrud } from '@/lib/localdb';
import { Download, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
    type Department,
    type Designation,
    type EmployeeContribution,
    type GroupType,
    employeeContributionColumns
} from './_components/columns';
import { type ContributionReportFilters, EmployeeContributionFilters } from './_components/filters';

export default function EmployeeContributionReportPage() {
    // Database instances
    const groupTypeDB = createLocalCrud<GroupType>('master:group-type');
    const departmentDB = createLocalCrud<Department>('master:department');
    const designationDB = createLocalCrud<Designation>('master:designation');
    const contributionDB = createLocalCrud<EmployeeContribution>('report:employee-contribution');

    // State
    const [groupTypes, setGroupTypes] = useState<GroupType[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [contributions, setContributions] = useState<EmployeeContribution[]>([]);
    const [filteredContributions, setFilteredContributions] = useState<EmployeeContribution[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showReport, setShowReport] = useState(false);

    const [filters, setFilters] = useState<ContributionReportFilters>({
        groupType: 'All',
        department: 'All',
        designation: 'All',
        contributionType: 'Earning',
        dateType: 'Month',
        selectedMonth: '',
        selectedYear: '',
        fromDate: null,
        toDate: null,
        reportType: 'All'
    });

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        try {
            setGroupTypes(groupTypeDB.list().filter((g) => g.isActive));
            setDepartments(departmentDB.list().filter((d) => d.isActive));
            setDesignations(designationDB.list().filter((d) => d.isActive));

            // Load contribution data
            let contributionList = contributionDB.list();
            if (contributionList.length === 0) {
                const mockData = generateMockContributions();
                mockData.forEach((contribution) => contributionDB.create(contribution));
                contributionList = contributionDB.list(); // Reload data after creating mock records
            }
            setContributions(contributionList);
        } catch (_error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    // Generate mock contribution data
    const generateMockContributions = (): Omit<EmployeeContribution, 'id' | 'createdAt'>[] => {
        const employees = [
            {
                code: 'EMP001',
                name: 'MR SUDIPTA RANJAN BHADURI',
                groupTypeId: 1,
                departmentId: 1,
                designationId: 1,
                deptName: 'JUNIOR SCHOOL',
                desigName: 'Assistant Teacher'
            },
            {
                code: 'EMP002',
                name: 'MS RUPLEKHA CHATTERJEE',
                groupTypeId: 1,
                departmentId: 2,
                designationId: 2,
                deptName: 'OFFICE STAFF',
                desigName: 'Principal'
            },
            {
                code: 'EMP003',
                name: 'MR JOHN SHAH',
                groupTypeId: 2,
                departmentId: 1,
                designationId: 1,
                deptName: 'JUNIOR SCHOOL',
                desigName: 'Assistant Teacher'
            },
            {
                code: 'EMP004',
                name: 'MRS BHASWATI DAS',
                groupTypeId: 2,
                departmentId: 2,
                designationId: 2,
                deptName: 'SENIOR SCHOOL',
                desigName: 'Teacher Helper'
            },
            {
                code: 'EMP005',
                name: 'MR SANTANU MUKHERJEE',
                groupTypeId: 1,
                departmentId: 1,
                designationId: 2,
                deptName: 'SERVICE STAFF',
                desigName: 'System Manager'
            }
        ];

        const mockContributions: Omit<EmployeeContribution, 'id' | 'createdAt'>[] = [];
        const contributionTypes: ('Earning' | 'Deduction')[] = ['Earning', 'Deduction'];

        employees.forEach((emp, empIndex) => {
            contributionTypes.forEach((type) => {
                const monthlyAmount = 40000 + empIndex * 5000;
                const pfContribution = monthlyAmount * 0.12;
                const esiContribution = monthlyAmount * 0.0175;
                const professionalTax = 200;

                mockContributions.push({
                    employeeCode: emp.code,
                    employeeName: emp.name,
                    groupTypeId: emp.groupTypeId,
                    departmentId: emp.departmentId,
                    designationId: emp.designationId,
                    departmentName: emp.deptName,
                    designationName: emp.desigName,
                    contributionType: type,
                    contributionHead: type === 'Earning' ? 'Basic Pay' : 'PF Contribution',
                    monthlyAmount: Math.round(monthlyAmount),
                    contributionDate: '2025-09-17',
                    pfContribution: Math.round(pfContribution),
                    esiContribution: Math.round(esiContribution),
                    professionalTax: professionalTax,
                    totalContribution: Math.round(pfContribution + esiContribution + professionalTax),
                    cumulativeContribution: Math.round((pfContribution + esiContribution + professionalTax) * 6) // 6 months cumulative
                });
            });
        });

        return mockContributions;
    };

    // Cascading filter logic
    const availableDepartments = useMemo(() => {
        if (filters.groupType === 'All') return departments;
        // In a real app, departments would be filtered by groupType relationship
        return departments;
    }, [filters.groupType, departments]);

    const availableDesignations = useMemo(() => {
        if (filters.department === 'All') return designations;
        // In a real app, designations would be filtered by department relationship
        return designations;
    }, [filters.department, designations]);

    // Filter contributions based on selected criteria
    useEffect(() => {
        let filtered = contributions;

        if (filters.groupType !== 'All') {
            const selectedGroupType = groupTypes.find((g) => g.groupType === filters.groupType);
            if (selectedGroupType) {
                filtered = filtered.filter((contribution) => contribution.groupTypeId === selectedGroupType.id);
            }
        }

        if (filters.department !== 'All') {
            const selectedDepartment = departments.find((d) => d.departmentName === filters.department);
            if (selectedDepartment) {
                filtered = filtered.filter((contribution) => contribution.departmentId === selectedDepartment.id);
            }
        }

        if (filters.designation !== 'All') {
            const selectedDesignation = designations.find((d) => d.designationName === filters.designation);
            if (selectedDesignation) {
                filtered = filtered.filter((contribution) => contribution.designationId === selectedDesignation.id);
            }
        }

        // Filter by contribution type
        filtered = filtered.filter((contribution) => contribution.contributionType === filters.contributionType);

        setFilteredContributions(filtered);
    }, [filters, contributions, groupTypes, departments, designations]);

    const handleFilterChange = (key: keyof ContributionReportFilters, value: any) => {
        const newFilters = { ...filters, [key]: value };

        // Reset dependent filters when parent changes
        if (key === 'groupType') {
            newFilters.department = 'All';
            newFilters.designation = 'All';
        } else if (key === 'department') {
            newFilters.designation = 'All';
        }

        setFilters(newFilters);
    };

    const handleSearch = () => {
        if (filters.dateType === 'Month' && (!filters.selectedMonth || !filters.selectedYear)) {
            toast.error('Please select month and year');
            return;
        }

        if (filters.dateType === 'Between Dates' && (!filters.fromDate || !filters.toDate)) {
            toast.error('Please select from and to dates');
            return;
        }

        setShowReport(true);
        toast.success('Employee contribution report generated');
    };

    const handleCancel = () => {
        setFilters({
            groupType: 'All',
            department: 'All',
            designation: 'All',
            contributionType: 'Earning',
            dateType: 'Month',
            selectedMonth: '',
            selectedYear: '',
            fromDate: null,
            toDate: null,
            reportType: 'All'
        });
        setShowReport(false);
        toast.info('Filters cleared');
    };

    const handleExport = () => {
        toast.success('Employee contribution report exported');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    // Calculate totals
    const totals = useMemo(() => {
        return filteredContributions.reduce(
            (acc, contribution) => ({
                pfContribution: acc.pfContribution + contribution.pfContribution,
                esiContribution: acc.esiContribution + contribution.esiContribution,
                professionalTax: acc.professionalTax + contribution.professionalTax,
                totalContribution: acc.totalContribution + contribution.totalContribution,
                cumulativeContribution: acc.cumulativeContribution + contribution.cumulativeContribution
            }),
            {
                pfContribution: 0,
                esiContribution: 0,
                professionalTax: 0,
                totalContribution: 0,
                cumulativeContribution: 0
            }
        );
    }, [filteredContributions]);

    return (
        <div className='space-y-6'>
            {/* Report Configuration Section */}
            <EmployeeContributionFilters
                filters={filters}
                groupTypes={groupTypes}
                availableDepartments={availableDepartments}
                availableDesignations={availableDesignations}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onCancel={handleCancel}
            />

            {/* Report Results */}
            {showReport && (
                <div className='space-y-4'>
                    {/* Report Header */}
                    <div className='flex items-center justify-between rounded-lg border bg-card p-4'>
                        <div>
                            <h3 className='font-semibold text-foreground text-lg'>
                                Employee Contribution Report - {filters.contributionType}
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                                Total Records: {filteredContributions.length} contributions | Date Range:{' '}
                                {filters.dateType === 'Month' ? `${filters.selectedMonth} ${filters.selectedYear}` : 'Custom Range'}
                            </p>
                        </div>
                        <div className='flex gap-2'>
                            <Button variant='outline' onClick={handleExport} prefix={<Download className='size-4' />}>
                                Export
                            </Button>
                            <Button variant='outline' onClick={handlePrint} prefix={<Printer className='size-4' />}>
                                Print
                            </Button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
                        <div className='rounded-lg border bg-card p-4'>
                            <div className='text-muted-foreground text-sm'>Total PF</div>
                            <div className='font-semibold text-foreground text-lg'>₹{totals.pfContribution.toLocaleString()}</div>
                        </div>
                        <div className='rounded-lg border bg-card p-4'>
                            <div className='text-muted-foreground text-sm'>Total ESI</div>
                            <div className='font-semibold text-foreground text-lg'>₹{totals.esiContribution.toLocaleString()}</div>
                        </div>
                        <div className='rounded-lg border bg-card p-4'>
                            <div className='text-muted-foreground text-sm'>Professional Tax</div>
                            <div className='font-semibold text-foreground text-lg'>₹{totals.professionalTax.toLocaleString()}</div>
                        </div>
                        <div className='rounded-lg border bg-card p-4'>
                            <div className='text-muted-foreground text-sm'>Total Contribution</div>
                            <div className='font-semibold text-green-600 text-lg'>₹{totals.totalContribution.toLocaleString()}</div>
                        </div>
                        <div className='rounded-lg border bg-card p-4'>
                            <div className='text-muted-foreground text-sm'>Employees</div>
                            <div className='font-semibold text-foreground text-lg'>{filteredContributions.length}</div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <DataTable
                        isLoading={isLoading}
                        columns={employeeContributionColumns}
                        data={filteredContributions}
                        totalItems={filteredContributions.length}
                        showViewOptions={true}
                        columnPinning={{ left: ['id'] }}
                    />
                </div>
            )}
        </div>
    );
}
