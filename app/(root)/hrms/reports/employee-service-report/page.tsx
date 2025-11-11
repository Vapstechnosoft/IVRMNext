'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table/data-table';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import { format } from 'date-fns';
import { Download, FileText, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { EmployeeServiceFilters, type ServiceReportFilters } from './_components/filters';
import { serviceReportColumns, type ServiceHistoryRecord } from './_components/columns';

// Data interfaces
interface GroupType extends BaseEntity {
    groupType: string;
    groupCode: string;
    order: number;
    isActive: boolean;
}

interface Department extends BaseEntity {
    departmentName: string;
    internalTrainingHours: string;
    order: number;
    isActive: boolean;
}

interface Designation extends BaseEntity {
    designationName: string;
    basicAmount: string;
    sanctionedSeats: string;
    displaySanctionedSeats: boolean;
    order: number;
    isActive: boolean;
}

interface Employee extends BaseEntity {
    employeeCode: string;
    employeeName: string;
    groupTypeId: number;
    departmentId: number;
    designationId: number;
    departmentName: string;
    designationName: string;
    dateOfJoining: string;
    dateOfLeaving?: string;
    currentSalary: number;
}

// Employee service report data structure
interface EmployeeServiceRecord extends BaseEntity {
    employeeId: number;
    employeeCode: string;
    employeeName: string;
    departmentName: string;
    designationName: string;
    dateOfJoining: string;
    dateOfLeaving?: string;
    serviceLength: string;
    currentStatus: 'Active' | 'Left';
    reportType: 'Experience Certificate' | 'Service Record';
    reportDate: string;
    totalExperience: string;
    currentSalary: number;
    achievements: string[];
    reportingManager: string;
}


export default function EmployeeServiceReportPage() {
    // Database instances
    const groupTypeDB = createLocalCrud<GroupType>('master:group-type');
    const departmentDB = createLocalCrud<Department>('master:department');
    const designationDB = createLocalCrud<Designation>('master:designation');
    const employeeDB = createLocalCrud<Employee>('employee:register');
    const serviceReportDB = createLocalCrud<EmployeeServiceRecord>('report:employee-service');

    // State
    const [groupTypes, setGroupTypes] = useState<GroupType[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [serviceRecords, setServiceRecords] = useState<EmployeeServiceRecord[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [_isLoading, setIsLoading] = useState(true);
    const [showReport, setShowReport] = useState(false);

    const [filters, setFilters] = useState<ServiceReportFilters>({
        type: '',
        department: '',
        designation: '',
        selectedEmployee: '',
        currentDate: new Date('2025-09-17'),
        reportType: 'Experience Certificate'
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

            // Load service records
            let recordList = serviceReportDB.list();
            if (recordList.length === 0) {
                const mockData = generateMockServiceRecords();
                mockData.forEach((record) => serviceReportDB.create(record));
                recordList = serviceReportDB.list(); // Reload data after creating mock records
            }
            setServiceRecords(recordList);
        } catch (_error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    // Generate mock data
    const generateMockGroupTypes = (): Omit<GroupType, 'id' | 'createdAt'>[] => {
        return [
            { groupType: 'Teaching', groupCode: 'T', order: 1, isActive: true },
            { groupType: 'Non Teaching', groupCode: 'NT', order: 2, isActive: true },
            {
                groupType: 'Administrative',
                groupCode: 'ADM',
                order: 3,
                isActive: true
            }
        ];
    };

    const generateMockDepartments = (): Omit<Department, 'id' | 'createdAt'>[] => {
        return [
            {
                departmentName: 'JUNIOR SCHOOL',
                internalTrainingHours: '35',
                order: 1,
                isActive: true
            },
            {
                departmentName: 'SENIOR SCHOOL',
                internalTrainingHours: '40',
                order: 2,
                isActive: true
            },
            {
                departmentName: 'OFFICE STAFF',
                internalTrainingHours: '40',
                order: 3,
                isActive: true
            },
            {
                departmentName: 'SERVICE STAFF',
                internalTrainingHours: '40',
                order: 4,
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
                designationName: 'Office Assistant',
                basicAmount: '20000',
                sanctionedSeats: '5',
                displaySanctionedSeats: true,
                order: 3,
                isActive: true
            },
            {
                designationName: 'System Manager',
                basicAmount: '40000',
                sanctionedSeats: '2',
                displaySanctionedSeats: true,
                order: 4,
                isActive: true
            }
        ];
    };

    const generateMockEmployees = (): Omit<Employee, 'id' | 'createdAt'>[] => {
        return [
            {
                employeeCode: 'EMP001',
                employeeName: 'MR SUDIPTA RANJAN BHADURI',
                groupTypeId: 1,
                departmentId: 1,
                designationId: 1,
                departmentName: 'JUNIOR SCHOOL',
                designationName: 'Assistant Teacher',
                dateOfJoining: '2020-01-15',
                currentSalary: 45000
            },
            {
                employeeCode: 'EMP002',
                employeeName: 'MS RUPLEKHA CHATTERJEE',
                groupTypeId: 3,
                departmentId: 3,
                designationId: 2,
                departmentName: 'OFFICE STAFF',
                designationName: 'Principal',
                dateOfJoining: '2018-06-10',
                currentSalary: 65000
            },
            {
                employeeCode: 'EMP003',
                employeeName: 'MR JOHN SHAH',
                groupTypeId: 1,
                departmentId: 2,
                designationId: 1,
                departmentName: 'SENIOR SCHOOL',
                designationName: 'Assistant Teacher',
                dateOfJoining: '2019-03-20',
                dateOfLeaving: '2024-08-15',
                currentSalary: 42000
            },
            {
                employeeCode: 'EMP004',
                employeeName: 'MRS BHASWATI DAS',
                groupTypeId: 2,
                departmentId: 4,
                designationId: 3,
                departmentName: 'SERVICE STAFF',
                designationName: 'Office Assistant',
                dateOfJoining: '2021-09-01',
                currentSalary: 28000
            },
            {
                employeeCode: 'EMP005',
                employeeName: 'MR SANTANU MUKHERJEE',
                groupTypeId: 2,
                departmentId: 3,
                designationId: 4,
                departmentName: 'OFFICE STAFF',
                designationName: 'System Manager',
                dateOfJoining: '2017-04-12',
                currentSalary: 55000
            }
        ];
    };

    const generateMockServiceRecords = (): Omit<EmployeeServiceRecord, 'id' | 'createdAt'>[] => {
        return employees.map((emp, index) => {
            const joiningDate = new Date(emp.dateOfJoining);
            const currentDate = new Date();
            const serviceYears = currentDate.getFullYear() - joiningDate.getFullYear();
            const serviceMonths = currentDate.getMonth() - joiningDate.getMonth();

            return {
                employeeId: index + 1,
                employeeCode: emp.employeeCode,
                employeeName: emp.employeeName,
                departmentName: emp.departmentName,
                designationName: emp.designationName,
                dateOfJoining: emp.dateOfJoining,
                dateOfLeaving: emp.dateOfLeaving,
                serviceLength: `${serviceYears} years ${serviceMonths > 0 ? serviceMonths : 0} months`,
                currentStatus: emp.dateOfLeaving ? 'Left' : 'Active',
                reportType: 'Experience Certificate',
                reportDate: '2025-09-17',
                totalExperience: `${serviceYears + 2} years`, // Including previous experience
                currentSalary: emp.currentSalary,
                achievements: ['Excellent Performance', 'Team Leadership', 'Project Management'],
                reportingManager: 'MR PRINCIPAL'
            };
        });
    };

    // Filter employees based on selected criteria
    useEffect(() => {
        let filtered = employees;

        if (filters.type) {
            const selectedGroupType = groupTypes.find((g) => g.groupType === filters.type);
            if (selectedGroupType) {
                filtered = filtered.filter((emp) => emp.groupTypeId === selectedGroupType.id);
            }
        }

        if (filters.department) {
            const selectedDepartment = departments.find((d) => d.departmentName === filters.department);
            if (selectedDepartment) {
                filtered = filtered.filter((emp) => emp.departmentId === selectedDepartment.id);
            }
        }

        if (filters.designation) {
            const selectedDesignation = designations.find((d) => d.designationName === filters.designation);
            if (selectedDesignation) {
                filtered = filtered.filter((emp) => emp.designationId === selectedDesignation.id);
            }
        }

        setFilteredEmployees(filtered);
    }, [filters.type, filters.department, filters.designation, employees, groupTypes, departments, designations]);

    const handleFilterChange = (key: keyof ServiceReportFilters, value: any) => {
        const newFilters = { ...filters, [key]: value };

        // Reset dependent filters when parent changes
        if (key === 'type') {
            newFilters.department = '';
            newFilters.designation = '';
            newFilters.selectedEmployee = '';
        } else if (key === 'department') {
            newFilters.designation = '';
            newFilters.selectedEmployee = '';
        } else if (key === 'designation') {
            newFilters.selectedEmployee = '';
        }

        setFilters(newFilters);
    };

    const handleSearch = () => {
        if (!filters.type || !filters.department || !filters.designation || !filters.selectedEmployee) {
            toast.error('Please fill all required fields');
            return;
        }
        setShowReport(true);
        toast.success('Employee service report generated');
    };

    const handleCancel = () => {
        setFilters({
            type: '',
            department: '',
            designation: '',
            selectedEmployee: '',
            currentDate: new Date('2025-09-17'),
            reportType: 'Experience Certificate'
        });
        setShowReport(false);
        toast.info('Filters cleared');
    };

    const handleExport = () => {
        toast.success('Employee service report exported');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    // Get selected employee details
    const selectedEmployeeDetails = useMemo(() => {
        if (!filters.selectedEmployee) return null;

        const employee = employees.find((emp) => emp.id.toString() === filters.selectedEmployee);
        if (!employee) return null;

        const serviceRecord = serviceRecords.find((record) => record.employeeId.toString() === filters.selectedEmployee);
        return { employee, serviceRecord };
    }, [filters.selectedEmployee, employees, serviceRecords]);


    // Mock service history data
    const serviceHistoryData: ServiceHistoryRecord[] = selectedEmployeeDetails
        ? [
              {
                  period: `${selectedEmployeeDetails.employee.dateOfJoining} - ${
                      selectedEmployeeDetails.employee.dateOfLeaving || 'Present'
                  }`,
                  designation: selectedEmployeeDetails.employee.designationName,
                  department: selectedEmployeeDetails.employee.departmentName,
                  salary: selectedEmployeeDetails.employee.currentSalary,
                  performance: 'Excellent'
              }
          ]
        : [];

    return (
        <div className='space-y-6'>
            {/* Report Configuration Section */}
            <EmployeeServiceFilters
                filters={filters}
                groupTypes={groupTypes}
                departments={departments}
                designations={designations}
                filteredEmployees={filteredEmployees}
                selectedEmployeeDetails={selectedEmployeeDetails}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onCancel={handleCancel}
            />

            {/* Report Results */}
            {showReport && selectedEmployeeDetails && (
                <div className='space-y-4'>
                    {/* Report Header */}
                    <div className='flex items-center justify-between rounded-lg border bg-card p-4'>
                        <div>
                            <h3 className='font-semibold text-foreground text-lg'>
                                {filters.reportType} - {selectedEmployeeDetails.employee.employeeName}
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                                Generated on: {format(filters.currentDate, 'dd-MM-yyyy')} | Employee Code:{' '}
                                {selectedEmployeeDetails.employee.employeeCode}
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

                    {/* Employee Summary */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Employee Code</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-foreground text-lg'>{selectedEmployeeDetails.employee.employeeCode}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Date of Joining</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-foreground text-lg'>
                                    {new Date(selectedEmployeeDetails.employee.dateOfJoining).toLocaleDateString()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Service Length</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-green-600 text-lg'>
                                    {selectedEmployeeDetails.serviceRecord?.serviceLength || 'N/A'}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-muted-foreground text-sm'>Current Salary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='font-semibold text-foreground text-lg'>
                                    ₹{selectedEmployeeDetails.employee.currentSalary.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Service History Table */}
                    <div className='rounded-lg border bg-card p-4'>
                        <div className='mb-4 flex items-center gap-2 font-semibold text-foreground text-lg'>
                            <FileText className='h-5 w-5' />
                            Service History
                        </div>

                        <DataTable
                            isLoading={false}
                            columns={serviceReportColumns}
                            data={serviceHistoryData}
                            totalItems={serviceHistoryData.length}
                            showViewOptions={false}
                        />
                    </div>

                    {/* Experience Certificate Preview */}
                    <div className='rounded-lg border bg-card p-6'>
                        <div className='space-y-4 text-center'>
                            <h2 className='font-bold text-foreground text-xl'>EXPERIENCE CERTIFICATE</h2>

                            <div className='mx-auto max-w-2xl space-y-3 text-left'>
                                <p className='text-sm'>
                                    This is to certify that <strong>{selectedEmployeeDetails.employee.employeeName}</strong>
                                    (Employee Code: <strong>{selectedEmployeeDetails.employee.employeeCode}</strong>) has been working with
                                    our organization from{' '}
                                    <strong>{new Date(selectedEmployeeDetails.employee.dateOfJoining).toLocaleDateString()}</strong>
                                    {selectedEmployeeDetails.employee.dateOfLeaving
                                        ? ` to ${new Date(selectedEmployeeDetails.employee.dateOfLeaving).toLocaleDateString()}`
                                        : ' till date'}
                                    .
                                </p>

                                <p className='text-sm'>
                                    During the tenure, the employee worked as{' '}
                                    <strong>{selectedEmployeeDetails.employee.designationName}</strong> in the{' '}
                                    <strong>{selectedEmployeeDetails.employee.departmentName}</strong> department.
                                </p>

                                <p className='text-sm'>
                                    The employee has shown excellent performance and dedication throughout the service period. We wish them
                                    all the best for their future endeavors.
                                </p>

                                <div className='pt-4'>
                                    <p className='text-sm'>
                                        Date: <strong>{format(filters.currentDate, 'dd-MM-yyyy')}</strong>
                                    </p>
                                </div>

                                <div className='pt-8 text-right'>
                                    <div className='text-sm'>
                                        <div>Authorized Signatory</div>
                                        <div className='font-semibold'>HR Department</div>
                                        <div>VAPS SCHOOL</div>
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
