'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import { Download, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
    type Department,
    type Designation,
    type Employee,
    type GroupType,
    SalaryCertificateFilters,
    type SalaryCertificateFilters as SalaryCertificateFiltersType
} from './_components/filters';

// Salary certificate data structure
interface SalaryCertificate extends BaseEntity {
    employeeId: number;
    employeeCode: string;
    employeeName: string;
    departmentName: string;
    designationName: string;
    month: string;
    year: string;
    basicSalary: number;
    allowances: number;
    grossSalary: number;
    deductions: number;
    netSalary: number;
    certificateDate: string;
    certificateNumber: string;
}

export default function SalaryCertificatePage() {
    // Database instances
    const groupTypeDB = createLocalCrud<GroupType>('master:group-type');
    const departmentDB = createLocalCrud<Department>('master:department');
    const designationDB = createLocalCrud<Designation>('master:designation');
    const employeeDB = createLocalCrud<Employee>('employee:register');
    const _certificateDB = createLocalCrud<SalaryCertificate>('report:salary-certificate');

    // State
    const [groupTypes, setGroupTypes] = useState<GroupType[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [_isLoading, setIsLoading] = useState(true);
    const [showCertificate, setShowCertificate] = useState(false);

    const [filters, setFilters] = useState<SalaryCertificateFiltersType>({
        groupType: 'All',
        department: 'All',
        designation: 'All',
        month: '',
        year: '',
        selectedEmployee: ''
    });

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        try {
            // Load master data
            let groupList = groupTypeDB.list();
            if (groupList.length === 0) {
                const mockData = generateMockGroupTypes();
                mockData.forEach((group) => groupTypeDB.create(group));
                groupList = groupTypeDB.list(); // Reload data after creating mock records
            }
            setGroupTypes(groupList.filter((g) => g.isActive));

            let deptList = departmentDB.list();
            if (deptList.length === 0) {
                const mockData = generateMockDepartments();
                mockData.forEach((dept) => departmentDB.create(dept));
                deptList = departmentDB.list(); // Reload data after creating mock records
            }
            setDepartments(deptList.filter((d) => d.isActive));

            let desigList = designationDB.list();
            if (desigList.length === 0) {
                const mockData = generateMockDesignations();
                mockData.forEach((desig) => designationDB.create(desig));
                desigList = designationDB.list(); // Reload data after creating mock records
            }
            setDesignations(desigList.filter((d) => d.isActive));

            // Load employees
            let empList = employeeDB.list();
            if (empList.length === 0) {
                const mockData = generateMockEmployees();
                mockData.forEach((emp) => employeeDB.create(emp));
                empList = employeeDB.list(); // Reload data after creating mock records
            }
            setEmployees(empList);
            setFilteredEmployees(empList);
        } catch (_error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    // Generate mock data
    const generateMockGroupTypes = (): Omit<GroupType, 'id' | 'createdAt'>[] => {
        return [
            {
                groupType: 'Test NON Teaching',
                groupCode: 'TNT',
                order: 1,
                isActive: true
            },
            {
                groupType: 'Test Insurance',
                groupCode: 'TI',
                order: 2,
                isActive: true
            },
            { groupType: 'Teaching', groupCode: 'T', order: 3, isActive: true },
            {
                groupType: 'Owner of the company',
                groupCode: 'OC',
                order: 4,
                isActive: true
            },
            { groupType: 'Non Teaching', groupCode: 'NT', order: 5, isActive: true },
            {
                groupType: 'Administrative',
                groupCode: 'ADM',
                order: 6,
                isActive: true
            },
            { groupType: 'test', groupCode: 'TST', order: 7, isActive: true }
        ];
    };

    const generateMockDepartments = (): Omit<Department, 'id' | 'createdAt'>[] => {
        return [
            {
                departmentName: 'Teaching',
                internalTrainingHours: '40',
                order: 1,
                isActive: true
            },
            {
                departmentName: 'JUNIOR SCHOOL',
                internalTrainingHours: '35',
                order: 2,
                isActive: true
            },
            {
                departmentName: 'SENIOR SCHOOL',
                internalTrainingHours: '40',
                order: 3,
                isActive: true
            },
            {
                departmentName: 'OFFICE STAFF',
                internalTrainingHours: '40',
                order: 4,
                isActive: true
            },
            {
                departmentName: 'Service Staff',
                internalTrainingHours: '40',
                order: 5,
                isActive: true
            },
            {
                departmentName: 'Administrative',
                internalTrainingHours: '40',
                order: 6,
                isActive: true
            },
            {
                departmentName: 'Chief executive officer',
                internalTrainingHours: '40',
                order: 7,
                isActive: true
            },
            {
                departmentName: 'Principal',
                internalTrainingHours: '40',
                order: 8,
                isActive: true
            }
        ];
    };

    const generateMockDesignations = (): Omit<Designation, 'id' | 'createdAt'>[] => {
        return [
            {
                designationName: 'Assistant Teacher',
                basicAmount: '25000',
                sanctionedSeats: '10',
                displaySanctionedSeats: true,
                order: 1,
                isActive: true
            },
            {
                designationName: 'Principal',
                basicAmount: '60000',
                sanctionedSeats: '1',
                displaySanctionedSeats: true,
                order: 2,
                isActive: true
            },
            {
                designationName: 'Vice Principal',
                basicAmount: '50000',
                sanctionedSeats: '2',
                displaySanctionedSeats: true,
                order: 3,
                isActive: true
            },
            {
                designationName: 'Office Assistant',
                basicAmount: '20000',
                sanctionedSeats: '5',
                displaySanctionedSeats: true,
                order: 4,
                isActive: true
            },
            {
                designationName: 'System Manager',
                basicAmount: '40000',
                sanctionedSeats: '2',
                displaySanctionedSeats: true,
                order: 5,
                isActive: true
            },
            {
                designationName: 'Teacher Helper',
                basicAmount: '15000',
                sanctionedSeats: '8',
                displaySanctionedSeats: true,
                order: 6,
                isActive: true
            },
            {
                designationName: 'Electrician',
                basicAmount: '18000',
                sanctionedSeats: '3',
                displaySanctionedSeats: true,
                order: 7,
                isActive: true
            },
            {
                designationName: 'Ayah',
                basicAmount: '12000',
                sanctionedSeats: '5',
                displaySanctionedSeats: true,
                order: 8,
                isActive: true
            }
        ];
    };

    const generateMockEmployees = (): Omit<Employee, 'id' | 'createdAt'>[] => {
        return [
            {
                employeeCode: 'EMP001',
                employeeName: 'MR SUDIPTA RANJAN BHADURI',
                groupTypeId: 3,
                departmentId: 2,
                designationId: 1,
                departmentName: 'JUNIOR SCHOOL',
                designationName: 'Assistant Teacher',
                dateOfJoining: '2020-01-15',
                basicSalary: 25000,
                allowances: 7500,
                deductions: 3250,
                grossSalary: 32500,
                netSalary: 29250
            },
            {
                employeeCode: 'EMP002',
                employeeName: 'MS RUPLEKHA CHATTERJEE',
                groupTypeId: 6,
                departmentId: 4,
                designationId: 2,
                departmentName: 'OFFICE STAFF',
                designationName: 'Principal',
                dateOfJoining: '2018-06-10',
                basicSalary: 60000,
                allowances: 18000,
                deductions: 7800,
                grossSalary: 78000,
                netSalary: 70200
            },
            {
                employeeCode: 'EMP003',
                employeeName: 'MR JOHN SHAH',
                groupTypeId: 3,
                departmentId: 3,
                designationId: 1,
                departmentName: 'SENIOR SCHOOL',
                designationName: 'Assistant Teacher',
                dateOfJoining: '2019-03-20',
                basicSalary: 25000,
                allowances: 7500,
                deductions: 3250,
                grossSalary: 32500,
                netSalary: 29250
            },
            {
                employeeCode: 'EMP004',
                employeeName: 'MRS BHASWATI DAS',
                groupTypeId: 5,
                departmentId: 5,
                designationId: 6,
                departmentName: 'Service Staff',
                designationName: 'Teacher Helper',
                dateOfJoining: '2021-09-01',
                basicSalary: 15000,
                allowances: 4500,
                deductions: 1950,
                grossSalary: 19500,
                netSalary: 17550
            },
            {
                employeeCode: 'EMP005',
                employeeName: 'MR SANTANU MUKHERJEE',
                groupTypeId: 5,
                departmentId: 4,
                designationId: 5,
                departmentName: 'OFFICE STAFF',
                designationName: 'System Manager',
                dateOfJoining: '2017-04-12',
                basicSalary: 40000,
                allowances: 12000,
                deductions: 5200,
                grossSalary: 52000,
                netSalary: 46800
            }
        ];
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

    // Filter employees based on selected criteria
    useEffect(() => {
        let filtered = employees;

        if (filters.groupType !== 'All') {
            const selectedGroupType = groupTypes.find((g) => g.groupType === filters.groupType);
            if (selectedGroupType) {
                filtered = filtered.filter((emp) => emp.groupTypeId === selectedGroupType.id);
            }
        }

        if (filters.department !== 'All') {
            const selectedDepartment = departments.find((d) => d.departmentName === filters.department);
            if (selectedDepartment) {
                filtered = filtered.filter((emp) => emp.departmentId === selectedDepartment.id);
            }
        }

        if (filters.designation !== 'All') {
            const selectedDesignation = designations.find((d) => d.designationName === filters.designation);
            if (selectedDesignation) {
                filtered = filtered.filter((emp) => emp.designationId === selectedDesignation.id);
            }
        }

        setFilteredEmployees(filtered);
    }, [filters.groupType, filters.department, filters.designation, employees, groupTypes, departments, designations]);

    const handleFilterChange = (key: keyof SalaryCertificateFilters, value: string) => {
        const newFilters = { ...filters, [key]: value };

        // Reset dependent filters when parent changes
        if (key === 'groupType') {
            newFilters.department = 'All';
            newFilters.designation = 'All';
            newFilters.selectedEmployee = '';
        } else if (key === 'department') {
            newFilters.designation = 'All';
            newFilters.selectedEmployee = '';
        } else if (key === 'designation') {
            newFilters.selectedEmployee = '';
        }

        setFilters(newFilters);
    };

    const handleGenerateSlip = () => {
        if (!filters.month || !filters.year || !filters.selectedEmployee) {
            toast.error('Please select month, year, and employee');
            return;
        }
        setShowCertificate(true);
        toast.success('Salary certificate generated');
    };

    const handleCancel = () => {
        setFilters({
            groupType: 'All',
            department: 'All',
            designation: 'All',
            month: '',
            year: '',
            selectedEmployee: ''
        });
        setShowCertificate(false);
        toast.info('Filters cleared');
    };

    const handleExport = () => {
        toast.success('Salary certificate exported');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    // Get selected employee details
    const selectedEmployeeDetails = useMemo(() => {
        if (!filters.selectedEmployee) return null;
        return employees.find((emp) => emp.id.toString() === filters.selectedEmployee);
    }, [filters.selectedEmployee, employees]);

    return (
        <div className='space-y-6'>
            {/* Report Configuration Section */}
            <SalaryCertificateFilters
                filters={filters}
                groupTypes={groupTypes}
                availableDepartments={availableDepartments}
                availableDesignations={availableDesignations}
                filteredEmployees={filteredEmployees}
                onFilterChange={handleFilterChange}
                onGenerate={handleGenerateSlip}
                onCancel={handleCancel}
            />

            {/* Certificate Results */}
            {showCertificate && selectedEmployeeDetails && (
                <div className='space-y-4'>
                    {/* Certificate Header */}
                    <div className='flex items-center justify-between rounded-lg border bg-card p-4'>
                        <div>
                            <h3 className='font-semibold text-foreground text-lg'>
                                Salary Certificate - {selectedEmployeeDetails.employeeName}
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                                Period: {filters.month} {filters.year} | Employee Code: {selectedEmployeeDetails.employeeCode}
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

                    {/* Salary Summary Cards */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Basic Salary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-foreground text-lg'>
                                    ₹{selectedEmployeeDetails.basicSalary.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Allowances</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-foreground text-lg'>
                                    ₹{selectedEmployeeDetails.allowances.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Deductions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-lg text-red-600'>
                                    ₹{selectedEmployeeDetails.deductions.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Net Salary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-green-600 text-lg'>
                                    ₹{selectedEmployeeDetails.netSalary.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Salary Certificate */}
                    <div className='rounded-lg border bg-card p-8'>
                        <div className='space-y-6 text-center'>
                            <div className='space-y-2'>
                                <h1 className='font-bold text-2xl text-foreground'>VAPS SCHOOL</h1>
                                <h2 className='font-semibold text-foreground text-xl'>SALARY CERTIFICATE</h2>
                            </div>

                            <div className='mx-auto max-w-2xl space-y-4 text-left'>
                                <p className='text-sm'>
                                    <strong>Certificate No:</strong> SC/{filters.year}/{String(selectedEmployeeDetails.id).padStart(4, '0')}
                                </p>

                                <p className='text-sm'>
                                    This is to certify that <strong>{selectedEmployeeDetails.employeeName}</strong>
                                    (Employee Code: <strong>{selectedEmployeeDetails.employeeCode}</strong>) is employed with our
                                    organization as <strong>{selectedEmployeeDetails.designationName}</strong>
                                    in the <strong>{selectedEmployeeDetails.departmentName}</strong> department.
                                </p>

                                <div className='space-y-2 border-t border-b py-4'>
                                    <h3 className='font-semibold text-sm'>
                                        Salary Details for {filters.month} {filters.year}:
                                    </h3>
                                    <div className='grid grid-cols-2 gap-4 text-sm'>
                                        <div className='space-y-1'>
                                            <div className='flex justify-between'>
                                                <span>Basic Salary:</span>
                                                <span>₹{selectedEmployeeDetails.basicSalary.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>Allowances:</span>
                                                <span>₹{selectedEmployeeDetails.allowances.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between font-semibold'>
                                                <span>Gross Salary:</span>
                                                <span>₹{selectedEmployeeDetails.grossSalary.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className='space-y-1'>
                                            <div className='flex justify-between'>
                                                <span>Deductions:</span>
                                                <span>₹{selectedEmployeeDetails.deductions.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between font-semibold text-green-600'>
                                                <span>Net Salary:</span>
                                                <span>₹{selectedEmployeeDetails.netSalary.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <p className='text-sm'>This certificate is issued for official purposes as requested by the employee.</p>

                                <div className='pt-6'>
                                    <p className='text-sm'>
                                        Date: <strong>{new Date().toLocaleDateString()}</strong>
                                    </p>
                                </div>

                                <div className='flex justify-between pt-8'>
                                    <div className='text-sm'>
                                        <div className='font-semibold'>Employee Signature</div>
                                        <div className='mt-8 w-32 border-gray-300 border-t' />
                                    </div>
                                    <div className='text-right text-sm'>
                                        <div className='font-semibold'>Authorized Signatory</div>
                                        <div className='mt-2'>HR Department</div>
                                        <div>VAPS SCHOOL</div>
                                        <div className='mt-6 ml-auto w-32 border-gray-300 border-t' />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
